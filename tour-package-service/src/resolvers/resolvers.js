const TourPackage = require("../models/TourPackage");
const mongoose = require("mongoose");
const axios = require("axios");
const { GraphQLScalarType, Kind } = require("graphql");

// ✅ Service URLs
const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || "http://inventory-service:3005/graphql";
const TRAVEL_SCHEDULE_SERVICE_URL =
  process.env.TRAVEL_SCHEDULE_SERVICE_URL || "http://localhost:4000/graphql";

// ✅ Enhanced inventory service helper
const callInventoryService = async (query, variables = {}) => {
  try {
    console.log(`📞 Calling inventory service: ${INVENTORY_SERVICE_URL}`);
    const response = await axios.post(
      INVENTORY_SERVICE_URL,
      { query, variables },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      }
    );

    if (response.data.errors) {
      console.error("❌ Inventory service errors:", response.data.errors);
      return null;
    }

    console.log("✅ Inventory service response received");
    return response.data.data;
  } catch (error) {
    console.warn("⚠️ Inventory service unavailable:", error.message);
    return null;
  }
};

// ✅ Travel service helper
const callTravelScheduleService = async (query, variables = {}) => {
  try {
    console.log(`📞 Calling travel service: ${TRAVEL_SCHEDULE_SERVICE_URL}`);
    const response = await axios.post(
      TRAVEL_SCHEDULE_SERVICE_URL,
      { query, variables },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      }
    );

    if (response.data.errors) {
      console.error("❌ Travel service errors:", response.data.errors);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.warn("⚠️ Travel service unavailable:", error.message);
    return null;
  }
};

const resolvers = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      if (value instanceof Date) {
        return value.toISOString().split("T")[0];
      }
      return new Date(value).toISOString().split("T")[0];
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    },
  }),

  Query: {
    // ✅ Basic tour queries
    getTourPackages: async () => {
      console.log("📦 Getting all tour packages");
      try {
        const tours = await TourPackage.find({ status: { $ne: "draft" } }).sort(
          { createdAt: -1 }
        );
        console.log(`📦 Found ${tours.length} tours`);

        return tours.map((tour) => ({
          id: tour._id.toString(),
          ...tour.toObject(),
        }));
      } catch (error) {
        console.error("❌ Error in getTourPackages:", error);
        throw new Error(`Error fetching tour packages: ${error.message}`);
      }
    },

    getTourPackage: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }

        const tourPackage = await TourPackage.findById(id);
        if (!tourPackage) {
          throw new Error(`Tour package with ID ${id} not found`);
        }

        return {
          id: tourPackage._id.toString(),
          ...tourPackage.toObject(),
        };
      } catch (error) {
        throw new Error(`Error fetching tour package: ${error.message}`);
      }
    },

    // ✅ NEW: Get tour with inventory data
    getTourWithInventory: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }

        const tourPackage = await TourPackage.findById(id);
        if (!tourPackage) {
          throw new Error(`Tour package with ID ${id} not found`);
        }

        // Get inventory status from inventory service
        const inventoryData = await callInventoryService(
          `
          query GetInventoryStatus($tourId: ID!) {
            getInventoryStatus(tourId: $tourId) {
              tourId
              date
              slotsLeft
              hotelAvailable
              transportAvailable
            }
          }
        `,
          { tourId: id }
        );

        const inventoryStatus = inventoryData?.getInventoryStatus || [];
        const availableDates = inventoryStatus
          .filter((inv) => inv.slotsLeft > 0)
          .map((inv) => inv.date);

        return {
          id: tourPackage._id.toString(),
          ...tourPackage.toObject(),
          inventoryStatus: inventoryStatus.map((inv) => ({
            tourId: inv.tourId,
            date: inv.date,
            slotsAvailable: inv.slotsLeft,
            hotelAvailable: inv.hotelAvailable,
            transportAvailable: inv.transportAvailable,
          })),
          isAvailable: availableDates.length > 0,
          availableDates,
        };
      } catch (error) {
        throw new Error(`Error fetching tour with inventory: ${error.message}`);
      }
    },

    // ✅ Get tours with availability filter
    getAvailableTours: async (_, { date, participants }) => {
      try {
        console.log(
          `🔍 Finding available tours for ${date} with ${participants} participants`
        );

        const allTours = await TourPackage.find({ status: "active" });
        const availableTours = [];

        for (const tour of allTours) {
          const availabilityData = await callInventoryService(
            `
            query CheckAvailability($tourId: ID!, $date: String!, $participants: Int!) {
              checkAvailability(tourId: $tourId, date: $date, participants: $participants) {
                available
              }
            }
          `,
            { tourId: tour._id.toString(), date, participants }
          );

          if (availabilityData?.checkAvailability?.available) {
            // Get inventory details for this tour
            const inventoryData = await callInventoryService(
              `
              query GetInventoryStatus($tourId: ID!) {
                getInventoryStatus(tourId: $tourId) {
                  tourId
                  date
                  slotsLeft
                  hotelAvailable
                  transportAvailable
                }
              }
            `,
              { tourId: tour._id.toString() }
            );

            const inventoryStatus = inventoryData?.getInventoryStatus || [];

            availableTours.push({
              id: tour._id.toString(),
              ...tour.toObject(),
              inventoryStatus: inventoryStatus.map((inv) => ({
                tourId: inv.tourId,
                date: inv.date,
                slotsAvailable: inv.slotsLeft,
                hotelAvailable: inv.hotelAvailable,
                transportAvailable: inv.transportAvailable,
              })),
              isAvailable: true,
            });
          }
        }

        console.log(`✅ Found ${availableTours.length} available tours`);
        return availableTours;
      } catch (error) {
        throw new Error(`Error getting available tours: ${error.message}`);
      }
    },

    // ✅ Proxy to inventory service
    checkTourAvailability: async (_, { tourId, date, participants }) => {
      try {
        const inventoryData = await callInventoryService(
          `
          query CheckAvailability($tourId: ID!, $date: String!, $participants: Int!) {
            checkAvailability(tourId: $tourId, date: $date, participants: $participants) {
              available
              message
            }
          }
        `,
          { tourId, date, participants }
        );

        if (!inventoryData) {
          return {
            available: false,
            message:
              "Unable to check availability - inventory service unavailable",
          };
        }

        return inventoryData.checkAvailability;
      } catch (error) {
        return {
          available: false,
          message: `Error checking availability: ${error.message}`,
        };
      }
    },

    // ✅ Proxy to inventory service
    getTourInventoryStatus: async (_, { tourId }) => {
      try {
        const inventoryData = await callInventoryService(
          `
          query GetInventoryStatus($tourId: ID!) {
            getInventoryStatus(tourId: $tourId) {
              tourId
              date
              slotsLeft
              hotelAvailable
              transportAvailable
            }
          }
        `,
          { tourId }
        );

        const inventoryStatus = inventoryData?.getInventoryStatus || [];
        return inventoryStatus.map((inv) => ({
          tourId: inv.tourId,
          date: inv.date,
          slotsAvailable: inv.slotsLeft,
          hotelAvailable: inv.hotelAvailable,
          transportAvailable: inv.transportAvailable,
        }));
      } catch (error) {
        console.error("Error getting inventory status:", error);
        return [];
      }
    },

    // ✅ Search and filter
    getTourPackagesByCategory: async (_, { category }) => {
      try {
        const tours = await TourPackage.find({
          category,
          status: { $ne: "draft" },
        });
        return tours.map((tour) => ({
          id: tour._id.toString(),
          ...tour.toObject(),
        }));
      } catch (error) {
        throw new Error(
          `Error fetching tour packages by category: ${error.message}`
        );
      }
    },

    searchTourPackages: async (_, { keyword }) => {
      try {
        const regex = new RegExp(keyword, "i");
        const tours = await TourPackage.find({
          status: { $ne: "draft" },
          $or: [
            { name: { $regex: regex } },
            { shortDescription: { $regex: regex } },
            { "location.city": { $regex: regex } },
            { "location.country": { $regex: regex } },
            { category: { $regex: regex } },
          ],
        });
        return tours.map((tour) => ({
          id: tour._id.toString(),
          ...tour.toObject(),
        }));
      } catch (error) {
        throw new Error(`Error searching tour packages: ${error.message}`);
      }
    },

    // ✅ Travel integration
    getTourWithTravel: async (_, { id, origin }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }

        const tourPackage = await TourPackage.findById(id);
        if (!tourPackage) {
          throw new Error(`Tour package with ID ${id} not found`);
        }

        // ✅ FIXED: Use getAllSchedules instead of getTravelSchedulesByRoute
        let travelOptions = [];
        if (origin) {
          const travelData = await callTravelScheduleService(`
            query GetAllSchedules {
              getAllSchedules {
                id
                origin
                destination
                departureTime
                arrivalTime
                price
                seatsAvailable
                vehicleType
              }
            }
          `);

          if (travelData?.getAllSchedules) {
            // Filter on frontend since travel-service doesn't have route-specific query
            travelOptions = travelData.getAllSchedules.filter((schedule) =>
              schedule.origin.toLowerCase().includes(origin.toLowerCase()) &&
              schedule.destination
                .toLowerCase()
                .includes(tourPackage.location.city.toLowerCase())
            );
          }
        }

        return {
          id: tourPackage._id.toString(),
          ...tourPackage.toObject(),
          travelOptions,
        };
      } catch (error) {
        throw new Error(`Error fetching tour with travel: ${error.message}`);
      }
    },

    // ✅ FIXED: Update getAvailableTravelOptions
    getAvailableTravelOptions: async (_, { origin, destination }) => {
      try {
        const travelData = await callTravelScheduleService(`
          query GetAllSchedules {
            getAllSchedules {
              id
              origin
              destination
              departureTime
              arrivalTime
              price
              seatsAvailable
              vehicleType
            }
          }
        `);

        if (!travelData?.getAllSchedules) {
          return [];
        }

        // Filter by route on frontend
        const filteredSchedules = travelData.getAllSchedules.filter((schedule) =>
          schedule.origin.toLowerCase().includes(origin.toLowerCase()) &&
          schedule.destination.toLowerCase().includes(destination.toLowerCase())
        );

        return filteredSchedules;
      } catch (error) {
        console.error("Error getting travel options:", error);
        return [];
      }
    },

    // ✅ NEW: Add getAllTravelSchedules query
    getAllTravelSchedules: async () => {
      try {
        console.log("🚌 Fetching all travel schedules from travel service");

        const travelData = await callTravelScheduleService(`
          query GetAllSchedules {
            getAllSchedules {
              id
              origin
              destination
              departureTime
              arrivalTime
              price
              seatsAvailable
              vehicleType
            }
          }
        `);

        if (!travelData?.getAllSchedules) {
          console.warn("No travel schedules found");
          return [];
        }

        return travelData.getAllSchedules;
      } catch (error) {
        console.error("Error fetching travel schedules:", error);
        return [];
      }
    },
  },

  Mutation: {
    // ✅ Basic tour mutations
    createTourPackage: async (_, { input }) => {
      try {
        const newTourPackage = new TourPackage({
          ...input,
          status: input.status || "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        const savedTour = await newTourPackage.save();
        console.log(`✅ Tour package created: ${savedTour.name}`);

        return {
          id: savedTour._id.toString(),
          ...savedTour.toObject(),
        };
      } catch (error) {
        throw new Error(`Error creating tour package: ${error.message}`);
      }
    },

    updateTourPackage: async (_, { id, input }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }

        const updatedTourPackage = await TourPackage.findByIdAndUpdate(
          id,
          { ...input, updatedAt: new Date().toISOString() },
          { new: true, runValidators: true }
        );

        if (!updatedTourPackage) {
          throw new Error(`Tour package with ID ${id} not found`);
        }

        return {
          id: updatedTourPackage._id.toString(),
          ...updatedTourPackage.toObject(),
        };
      } catch (error) {
        throw new Error(`Error updating tour package: ${error.message}`);
      }
    },

    deleteTourPackage: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }

        // Delete associated inventory first
        await callInventoryService(
          `
          mutation DeleteTour($tourId: ID!) {
            deleteTour(tourId: $tourId) {
              success
              message
            }
          }
        `,
          { tourId: id }
        );

        const deletedTourPackage = await TourPackage.findByIdAndDelete(id);
        if (!deletedTourPackage) {
          throw new Error(`Tour package with ID ${id} not found`);
        }

        console.log(`✅ Tour package deleted: ${deletedTourPackage.name}`);

        return {
          id: deletedTourPackage._id.toString(),
          ...deletedTourPackage.toObject(),
        };
      } catch (error) {
        throw new Error(`Error deleting tour package: ${error.message}`);
      }
    },

    updateTourStatus: async (_, { id, status }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }

        const validStatuses = ["active", "inactive", "draft"];
        if (!validStatuses.includes(status)) {
          throw new Error(
            `Invalid status. Must be one of: ${validStatuses.join(", ")}`
          );
        }

        const updatedTourPackage = await TourPackage.findByIdAndUpdate(
          id,
          { status, updatedAt: new Date().toISOString() },
          { new: true }
        );

        if (!updatedTourPackage) {
          throw new Error(`Tour package with ID ${id} not found`);
        }

        return {
          id: updatedTourPackage._id.toString(),
          ...updatedTourPackage.toObject(),
        };
      } catch (error) {
        throw new Error(`Error updating tour status: ${error.message}`);
      }
    },

    // ✅ Inventory management mutations (proxy to inventory service)
    createTourInventory: async (_, { input }) => {
      try {
        const result = await callInventoryService(
          `
          mutation UpdateInventory($input: InventoryUpdateInput!) {
            updateInventory(input: $input) {
              id
              tourId
              date
              slots
            }
          }
        `,
          { input }
        );

        return {
          success: !!result?.updateInventory,
          message: result?.updateInventory
            ? `Inventory created for tour ${input.tourId} on ${input.date}`
            : "Failed to create inventory",
        };
      } catch (error) {
        return {
          success: false,
          message: `Error creating inventory: ${error.message}`,
        };
      }
    },

    updateTourInventory: async (_, { input }) => {
      try {
        const result = await callInventoryService(
          `
          mutation UpdateInventory($input: InventoryUpdateInput!) {
            updateInventory(input: $input) {
              id
              tourId
              date
              slots
            }
          }
        `,
          { input }
        );

        return {
          success: !!result?.updateInventory,
          message: result?.updateInventory
            ? `Inventory updated for tour ${input.tourId} on ${input.date}`
            : "Failed to update inventory",
        };
      } catch (error) {
        return {
          success: false,
          message: `Error updating inventory: ${error.message}`,
        };
      }
    },

    deleteTourInventory: async (_, { tourId, date }) => {
      try {
        const result = await callInventoryService(
          date
            ? `
          mutation DeleteSpecificInventory($tourId: ID!, $date: String!) {
            deleteInventoryByDate(tourId: $tourId, date: $date) {
              success
              message
            }
          }
        `
            : `
          mutation DeleteTour($tourId: ID!) {
            deleteTour(tourId: $tourId) {
              success
              message
            }
          }
        `,
          date ? { tourId, date } : { tourId }
        );

        const deleteResult = date
          ? result?.deleteInventoryByDate
          : result?.deleteTour;

        return {
          success: deleteResult?.success || false,
          message: deleteResult?.message || "Failed to delete inventory",
        };
      } catch (error) {
        return {
          success: false,
          message: `Error deleting inventory: ${error.message}`,
        };
      }
    },

    initializeTourInventory: async (_, { tourId, dates, defaultSlots }) => {
      try {
        let successCount = 0;
        const results = [];

        for (const date of dates) {
          const result = await callInventoryService(
            `
            mutation UpdateInventory($input: InventoryUpdateInput!) {
              updateInventory(input: $input) {
                id
                tourId
                date
              }
            }
          `,
            {
              input: {
                tourId,
                date,
                slots: defaultSlots,
                hotelAvailable: true,
                transportAvailable: true,
              },
            }
          );

          if (result?.updateInventory) {
            successCount++;
            results.push(`${date}: ${defaultSlots} slots`);
          }
        }

        return {
          success: successCount > 0,
          message:
            successCount > 0
              ? `Initialized inventory for ${successCount}/${
                  dates.length
                } dates: ${results.join(", ")}`
              : "Failed to initialize any inventory",
        };
      } catch (error) {
        return {
          success: false,
          message: `Error initializing inventory: ${error.message}`,
        };
      }
    },
  },
};

module.exports = resolvers;
