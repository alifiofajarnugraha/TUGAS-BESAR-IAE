const TourPackage = require("../models/TourPackage");
const mongoose = require("mongoose");
const axios = require("axios");

// Service URLs
const INVENTORY_SERVICE_URL = "http://localhost:3005/graphql";
const TRAVEL_SCHEDULE_SERVICE_URL = "http://localhost:3006/graphql";

// Helper function to call inventory service dengan better error handling
const callInventoryService = async (query, variables = {}) => {
  try {
    const response = await axios.post(
      INVENTORY_SERVICE_URL,
      {
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000, // 5 second timeout
      }
    );

    if (response.data.errors) {
      console.error("Inventory service errors:", response.data.errors);
      return null; // Return null instead of throwing
    }

    return response.data.data;
  } catch (error) {
    console.warn("Inventory service unavailable:", error.message);
    // Return null instead of throwing - allow graceful fallback
    return null;
  }
};

// INTEGRASI DENGAN KELOMPOK LAIN ( TRAVEL SCHEDULE) //
// Helper function to call travel schedule service
const callTravelScheduleService = async (query, variables = {}) => {
  try {
    const response = await axios.post(
      TRAVEL_SCHEDULE_SERVICE_URL,
      {
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    if (response.data.errors) {
      console.error("Travel schedule service errors:", response.data.errors);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.warn("Travel schedule service unavailable:", error.message);
    return null;
  }
};

const resolvers = {
  Query: {
    getTourPackages: async () => {
      try {
        const tours = await TourPackage.find({}).sort({ createdAt: -1 });
        tours.forEach((t) => {
          if (!t._id) console.warn("Tour tanpa _id:", t);
        });
        return tours.map((tour) => ({
          id: tour._id ? tour._id.toString() : null,
          ...tour.toObject(),
        }));
      } catch (error) {
        throw new Error(`Error fetching tour packages: ${error}`);
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

        // Get inventory status
        const inventoryData = await callInventoryService(
          `
          query GetInventoryStatus($tourId: String!) {
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

        return {
          id: tourPackage._id.toString(),
          ...tourPackage.toObject(),
          inventoryStatus: inventoryData?.getInventoryStatus || [],
          isAvailable:
            inventoryData?.getInventoryStatus?.some(
              (inv) => inv.slotsLeft > 0
            ) || false,
        };
      } catch (error) {
        throw new Error(`Error fetching tour package: ${error}`);
      }
    },

    getTourPackagesByCategory: async (_, { category }) => {
      try {
        const tours = await TourPackage.find({ category });
        return tours.map((tour) => ({
          id: tour._id.toString(),
          ...tour.toObject(),
        }));
      } catch (error) {
        throw new Error(`Error fetching tour packages by category: ${error}`);
      }
    },

    searchTourPackages: async (_, { keyword }) => {
      try {
        const regex = new RegExp(keyword, "i");
        const tours = await TourPackage.find({
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
        throw new Error(`Error searching tour packages: ${error}`);
      }
    },

    // New inventory-related queries
    checkTourAvailability: async (_, { tourId, date, participants }) => {
      try {
        const inventoryData = await callInventoryService(
          `
          query CheckAvailability($tourId: String!, $date: String!, $participants: Int!) {
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

        // Get additional inventory details
        const statusData = await callInventoryService(
          `
          query GetInventoryStatus($tourId: String!) {
            getInventoryStatus(tourId: $tourId) {
              date
              slotsLeft
              hotelAvailable
              transportAvailable
            }
          }
        `,
          { tourId }
        );

        const dateInventory = statusData?.getInventoryStatus?.find(
          (inv) => inv.date === date
        );

        return {
          ...inventoryData.checkAvailability,
          slotsLeft: dateInventory?.slotsLeft || 0,
          hotelAvailable: dateInventory?.hotelAvailable || false,
          transportAvailable: dateInventory?.transportAvailable || false,
        };
      } catch (error) {
        return {
          available: false,
          message: `Error checking availability: ${error.message}`,
        };
      }
    },

    getTourInventoryStatus: async (_, { tourId }) => {
      try {
        const inventoryData = await callInventoryService(
          `
          query GetInventoryStatus($tourId: String!) {
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

        return inventoryData?.getInventoryStatus || [];
      } catch (error) {
        console.error("Error getting inventory status:", error);
        return [];
      }
    },

    getAvailableTours: async (_, { date, participants }) => {
      try {
        const allTours = await TourPackage.find({ status: "active" });
        const availableTours = [];

        for (const tour of allTours) {
          const availabilityData = await callInventoryService(
            `
            query CheckAvailability($tourId: String!, $date: String!, $participants: Int!) {
              checkAvailability(tourId: $tourId, date: $date, participants: $participants) {
                available
              }
            }
          `,
            { tourId: tour._id.toString(), date, participants }
          );

          if (availabilityData?.checkAvailability?.available) {
            availableTours.push({
              id: tour._id.toString(),
              ...tour.toObject(),
            });
          }
        }

        return availableTours;
      } catch (error) {
        throw new Error(`Error getting available tours: ${error}`);
      }
    },

    // INTEGRASI DENGAN KELOMPOK LAIN ( TRAVEL SCHEDULE) //
    // New travel schedule integration queries
    getTravelSchedulesForTour: async (_, { tourId }) => {
      try {
        const tour = await TourPackage.findById(tourId);
        if (!tour) {
          throw new Error(`Tour package with ID ${tourId} not found`);
        }

        const travelData = await callTravelScheduleService(
          `
          query GetTravelSchedulesByRoute($origin: String!, $destination: String!) {
            getTravelSchedulesByRoute(origin: $origin, destination: $destination) {
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
        `,
          {
            origin: "Jakarta", // You can make this dynamic based on tour pickup location
            destination: tour.location.city,
          }
        );

        return travelData?.getTravelSchedulesByRoute || [];
      } catch (error) {
        console.error("Error getting travel schedules for tour:", error);
        return [];
      }
    },

    getAvailableTravelOptions: async (_, { origin, destination }) => {
      try {
        const travelData = await callTravelScheduleService(
          `
          query GetTravelSchedulesByRoute($origin: String!, $destination: String!) {
            getTravelSchedulesByRoute(origin: $origin, destination: $destination) {
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
        `,
          { origin, destination }
        );

        return travelData?.getTravelSchedulesByRoute || [];
      } catch (error) {
        console.error("Error getting available travel options:", error);
        return [];
      }
    },

    // Enhanced tour package query with travel options
    getTourPackageWithTravel: async (_, { id, origin }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }

        const tourPackage = await TourPackage.findById(id);
        if (!tourPackage) {
          throw new Error(`Tour package with ID ${id} not found`);
        }

        // Get inventory status
        const inventoryData = await callInventoryService(
          `
          query GetInventoryStatus($tourId: String!) {
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

        // Get travel options if origin is provided
        let travelOptions = [];
        if (origin) {
          const travelData = await callTravelScheduleService(
            `
            query GetTravelSchedulesByRoute($origin: String!, $destination: String!) {
              getTravelSchedulesByRoute(origin: $origin, destination: $destination) {
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
          `,
            { origin, destination: tourPackage.location.city }
          );
          travelOptions = travelData?.getTravelSchedulesByRoute || [];
        }

        return {
          id: tourPackage._id.toString(),
          ...tourPackage.toObject(),
          inventoryStatus: inventoryData?.getInventoryStatus || [],
          isAvailable:
            inventoryData?.getInventoryStatus?.some(
              (inv) => inv.slotsLeft > 0
            ) || false,
          travelOptions,
        };
      } catch (error) {
        throw new Error(`Error fetching tour package with travel: ${error}`);
      }
    },
  },

  Mutation: {
    createTourPackage: async (_, { input }) => {
      try {
        const newTourPackage = new TourPackage({
          ...input,
          status: input.status || "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        const savedTour = await newTourPackage.save();

        // (Opsional) Inisialisasi inventory jika ada availableDates
        // Jika inventory service gagal, jangan throw error, cukup log
        if (input.availableDates && input.availableDates.length > 0) {
          try {
            await callInventoryService(
              `
              mutation UpdateInventory($input: InventoryInput!) {
                updateInventory(input: $input) {
                  tourId
                  date
                  slots
                }
              }
            `,
              {
                input: {
                  tourId: savedTour._id.toString(),
                  date: input.availableDates[0].date,
                  slots: input.availableDates[0].slots,
                  hotelAvailable: input.hotelRequired !== false,
                  transportAvailable: input.transportRequired !== false,
                },
              }
            );
          } catch (err) {
            console.error("Inventory service error (ignored):", err.message);
          }
        }

        // Penting: return objek dengan id (string)
        return {
          id: savedTour._id.toString(),
          ...savedTour.toObject(),
        };
      } catch (error) {
        throw new Error(`Error creating tour package: ${error}`);
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
        throw new Error(`Error updating tour package: ${error}`);
      }
    },

    deleteTourPackage: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }
        await callInventoryService(
          `mutation DeleteTour($tourId: String!) {
            deleteTour(tourId: $tourId) { success message }
          }`,
          { tourId: id }
        );
        const deletedTourPackage = await TourPackage.findByIdAndDelete(id);
        if (!deletedTourPackage) {
          throw new Error(`Tour package with ID ${id} not found`);
        }
        return {
          id: deletedTourPackage._id.toString(),
          ...deletedTourPackage.toObject(),
        };
      } catch (error) {
        throw new Error(`Error deleting tour package: ${error}`);
      }
    },

    updateTourStatus: async (_, { id, status }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }
        const validStatuses = ["active", "inactive", "soldout"];
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
        throw new Error(`Error updating tour status: ${error}`);
      }
    },

    // New inventory-related mutations
    initializeTourInventory: async (_, { tourId, dates }) => {
      try {
        for (const dateInfo of dates) {
          await callInventoryService(
            `
            mutation UpdateInventory($input: InventoryInput!) {
              updateInventory(input: $input) {
                tourId
              }
            }
          `,
            {
              input: {
                tourId,
                date: dateInfo.date,
                slots: dateInfo.slots,
                hotelAvailable: true,
                transportAvailable: true,
              },
            }
          );
        }
        return true;
      } catch (error) {
        console.error("Error initializing inventory:", error);
        return false;
      }
    },

    updateTourInventory: async (
      _,
      { tourId, date, slots, hotelAvailable, transportAvailable }
    ) => {
      try {
        const result = await callInventoryService(
          `
          mutation UpdateInventory($input: InventoryInput!) {
            updateInventory(input: $input) {
              tourId
              date
              slots
            }
          }
        `,
          {
            input: {
              tourId,
              date,
              slots,
              hotelAvailable:
                hotelAvailable !== undefined ? hotelAvailable : true,
              transportAvailable:
                transportAvailable !== undefined ? transportAvailable : true,
            },
          }
        );

        return !!result?.updateInventory;
      } catch (error) {
        console.error("Error updating inventory:", error);
        return false;
      }
    },
  },
};

module.exports = resolvers;
