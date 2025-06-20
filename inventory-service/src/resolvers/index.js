const Inventory = require("../models/Inventory");
const axios = require("axios");

// ✅ Use environment variable for tour service URL
const TOUR_SERVICE_URL =
  process.env.TOUR_SERVICE_URL || "http://tour-service:3002/graphql";

// Helper untuk cek tourId dengan better error handling
async function validateTourId(tourId) {
  try {
    const query = `
      query($id: ID!) {
        getTourPackage(id: $id) {
          id
          name
        }
      }
    `;

    console.log(`Validating tourId ${tourId} with tour service...`);
    const response = await axios.post(
      TOUR_SERVICE_URL,
      { query, variables: { id: tourId } },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      }
    );

    const tour = response.data.data?.getTourPackage;
    if (tour) {
      console.log(`✅ Tour validated: ${tour.name}`);
      return true;
    }

    console.warn(`⚠️ Tour not found: ${tourId}`);
    return false;
  } catch (error) {
    console.warn("Could not validate tourId:", error.message);
    return true; // ✅ Allow if tour service unavailable (graceful degradation)
  }
}

// ✅ NEW: Helper function to generate date range
function generateDateRange(startDate, endDate, skipDays = [], skipDates = []) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format. Use YYYY-MM-DD");
  }

  if (start > end) {
    throw new Error("Start date must be before or equal to end date");
  }

  // Generate all dates in range
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Skip if day of week is in skipDays or specific date is in skipDates
    if (!skipDays.includes(dayOfWeek) && !skipDates.includes(dateStr)) {
      dates.push(dateStr);
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// ✅ ONLY EXPORT RESOLVERS - NO TYPEDEFS HERE
const resolvers = {
  Query: {
    // Cek ketersediaan slot, hotel, transport untuk 1 tour pada 1 tanggal
    checkAvailability: async (_, { tourId, date, participants }) => {
      try {
        console.log(
          `Checking availability for tour ${tourId} on ${date} for ${participants} participants`
        );

        const inv = await Inventory.findOne({ tourId, date });
        if (!inv) {
          return {
            available: false,
            message: `No inventory available for tour ${tourId} on ${date}`,
            slotsLeft: null,
            hotelAvailable: null,
            transportAvailable: null,
          };
        }

        if (inv.slots < participants) {
          return {
            available: false,
            message: `Only ${inv.slots} slots available, requested ${participants}`,
            slotsLeft: inv.slots,
            hotelAvailable: inv.hotelAvailable,
            transportAvailable: inv.transportAvailable,
          };
        }

        if (!inv.hotelAvailable || !inv.transportAvailable) {
          const unavailable = [];
          if (!inv.hotelAvailable) unavailable.push("hotel");
          if (!inv.transportAvailable) unavailable.push("transport");

          return {
            available: false,
            message: `${unavailable.join(" and ")} not available`,
            slotsLeft: inv.slots,
            hotelAvailable: inv.hotelAvailable,
            transportAvailable: inv.transportAvailable,
          };
        }

        return {
          available: true,
          message: `${inv.slots} slots available with hotel and transport`,
          slotsLeft: inv.slots,
          hotelAvailable: inv.hotelAvailable,
          transportAvailable: inv.transportAvailable,
        };
      } catch (error) {
        console.error("Error checking availability:", error);
        throw new Error("Failed to check availability");
      }
    },

    // List status inventory untuk 1 tour (semua tanggal)
    getInventoryStatus: async (_, { tourId }) => {
      try {
        console.log(`Getting inventory status for tour ${tourId}`);
        const invs = await Inventory.find({ tourId }).sort({ date: 1 });

        return invs.map((inv) => ({
          tourId: inv.tourId,
          date: inv.date,
          slotsLeft: inv.slots,
          hotelAvailable: inv.hotelAvailable,
          transportAvailable: inv.transportAvailable,
        }));
      } catch (error) {
        console.error("Error getting inventory status:", error);
        throw new Error("Failed to get inventory status");
      }
    },

    // List semua inventory (untuk admin)
    getAllInventory: async (_, { filter }) => {
      try {
        console.log("Getting all inventory records");
        let query = {};

        if (filter) {
          if (filter.tourId) query.tourId = filter.tourId;
          if (filter.date) query.date = filter.date;
          if (filter.minSlots) query.slots = { $gte: filter.minSlots };
          if (filter.hotelAvailable !== undefined)
            query.hotelAvailable = filter.hotelAvailable;
          if (filter.transportAvailable !== undefined)
            query.transportAvailable = filter.transportAvailable;
        }

        return await Inventory.find(query).sort({ tourId: 1, date: 1 });
      } catch (error) {
        console.error("Error getting all inventory:", error);
        throw new Error("Failed to get inventory data");
      }
    },

    // Get inventory by date
    getInventoryByDate: async (_, { date }) => {
      try {
        console.log(`Getting inventory for date: ${date}`);
        return await Inventory.find({ date }).sort({ tourId: 1 });
      } catch (error) {
        console.error("Error getting inventory by date:", error);
        throw new Error("Failed to get inventory by date");
      }
    },

    // Get inventory by tour
    getInventoryByTour: async (_, { tourId }) => {
      try {
        console.log(`Getting inventory for tour: ${tourId}`);
        return await Inventory.find({ tourId }).sort({ date: 1 });
      } catch (error) {
        console.error("Error getting inventory by tour:", error);
        throw new Error("Failed to get inventory by tour");
      }
    },

    // Get available tours on specific date
    getAvailableToursOnDate: async (_, { date, minSlots }) => {
      try {
        console.log(
          `Getting available tours on ${date} with min ${minSlots || 1} slots`
        );
        const query = {
          date,
          slots: { $gte: minSlots || 1 },
          hotelAvailable: true,
          transportAvailable: true,
        };

        const inventories = await Inventory.find(query);
        return inventories.map((inv) => ({
          tourId: inv.tourId,
          date: inv.date,
          slotsLeft: inv.slots,
          hotelAvailable: inv.hotelAvailable,
          transportAvailable: inv.transportAvailable,
        }));
      } catch (error) {
        console.error("Error getting available tours on date:", error);
        throw new Error("Failed to get available tours");
      }
    },

    // Get tour availability range
    getTourAvailabilityRange: async (_, { tourId, startDate, endDate }) => {
      try {
        console.log(
          `Getting availability range for tour ${tourId} from ${startDate} to ${endDate}`
        );
        const inventories = await Inventory.find({
          tourId,
          date: { $gte: startDate, $lte: endDate },
        }).sort({ date: 1 });

        return inventories.map((inv) => ({
          tourId: inv.tourId,
          date: inv.date,
          slotsLeft: inv.slots,
          hotelAvailable: inv.hotelAvailable,
          transportAvailable: inv.transportAvailable,
        }));
      } catch (error) {
        console.error("Error getting tour availability range:", error);
        throw new Error("Failed to get availability range");
      }
    },

    // ✅ NEW: Preview inventory range before creating
    previewInventoryRange: async (
      _,
      { startDate, endDate, skipDays = [], skipDates = [] }
    ) => {
      try {
        console.log(
          `Previewing inventory range from ${startDate} to ${endDate}`
        );
        const dates = generateDateRange(
          startDate,
          endDate,
          skipDays,
          skipDates
        );

        console.log(`✅ Preview generated ${dates.length} dates`);
        return dates;
      } catch (error) {
        console.error("Error previewing inventory range:", error);
        throw new Error(`Failed to preview range: ${error.message}`);
      }
    },
  },

  Mutation: {
    updateInventory: async (_, { input }) => {
      const { tourId, date, slots, hotelAvailable, transportAvailable } = input;

      try {
        console.log(`Updating inventory for tour ${tourId} on ${date}`);

        // ✅ Validate tourId (optional but recommended)
        const isValid = await validateTourId(tourId);
        if (!isValid) {
          console.warn(
            `Tour ${tourId} not found in tour service, but proceeding anyway`
          );
        }

        const updatedAt = new Date().toISOString();
        const inv = await Inventory.findOneAndUpdate(
          { tourId, date },
          {
            $set: {
              slots,
              hotelAvailable,
              transportAvailable,
              updatedAt,
            },
            $setOnInsert: {
              createdAt: updatedAt,
            },
          },
          { new: true, upsert: true }
        );

        console.log(`✅ Inventory updated successfully:`, {
          tourId: inv.tourId,
          date: inv.date,
          slots: inv.slots,
        });

        return {
          id: inv._id,
          tourId: inv.tourId,
          date: inv.date,
          slots: inv.slots,
          hotelAvailable: inv.hotelAvailable,
          transportAvailable: inv.transportAvailable,
          createdAt: inv.createdAt || updatedAt,
          updatedAt: inv.updatedAt || updatedAt,
        };
      } catch (error) {
        console.error("Update inventory error:", error);
        throw new Error(`Failed to update inventory: ${error.message}`);
      }
    },

    // Delete specific inventory record
    deleteInventory: async (_, { tourId, date }) => {
      try {
        console.log(`Deleting inventory for tour ${tourId} on ${date}`);
        const result = await Inventory.deleteOne({ tourId, date });

        return {
          success: result.deletedCount > 0,
          message:
            result.deletedCount > 0
              ? `Deleted inventory for tour ${tourId} on ${date}`
              : `No inventory found for tour ${tourId} on ${date}`,
          deletedCount: result.deletedCount,
        };
      } catch (error) {
        console.error("Delete inventory error:", error);
        throw new Error(`Failed to delete inventory: ${error.message}`);
      }
    },

    // Create bulk inventory
    createBulkInventory: async (_, { input }) => {
      const { tourId, dates, slots, hotelAvailable, transportAvailable } =
        input;

      try {
        console.log(`Creating bulk inventory for tour ${tourId}`);

        const inventoryDocs = dates.map((date) => ({
          tourId,
          date,
          slots,
          hotelAvailable,
          transportAvailable,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const result = await Inventory.insertMany(inventoryDocs, {
          ordered: false,
        });

        return {
          success: result.length > 0,
          message: `Created ${result.length}/${dates.length} inventory records`,
          deletedCount: result.length,
        };
      } catch (error) {
        console.error("Create bulk inventory error:", error);
        throw new Error(`Failed to create bulk inventory: ${error.message}`);
      }
    },

    // Update bulk inventory
    updateBulkInventory: async (_, { tourId, updates }) => {
      try {
        console.log(`Updating bulk inventory for tour ${tourId}`);

        let successCount = 0;
        const results = [];

        for (const update of updates) {
          try {
            const result = await Inventory.updateOne(
              { tourId: update.tourId, date: update.date },
              {
                $set: {
                  slots: update.slots,
                  hotelAvailable: update.hotelAvailable,
                  transportAvailable: update.transportAvailable,
                  updatedAt: new Date().toISOString(),
                },
              }
            );

            if (result.modifiedCount > 0) {
              successCount++;
              results.push(`${update.date}: updated`);
            }
          } catch (updateError) {
            console.error(`Failed to update ${update.date}:`, updateError);
            results.push(`${update.date}: failed`);
          }
        }

        return {
          success: successCount > 0,
          message: `Updated ${successCount}/${
            updates.length
          } records: ${results.join(", ")}`,
          deletedCount: successCount,
        };
      } catch (error) {
        console.error("Update bulk inventory error:", error);
        throw new Error(`Failed to update bulk inventory: ${error.message}`);
      }
    },

    // Real-time: Reserve slot (kurangi slot saat booking)
    reserveSlots: async (_, { input }) => {
      const { tourId, date, participants } = input;

      try {
        console.log(
          `Reserving ${participants} slots for tour ${tourId} on ${date}`
        );

        const inv = await Inventory.findOne({ tourId, date });
        if (!inv) {
          return {
            success: false,
            message: `No inventory available for tour ${tourId} on ${date}`,
          };
        }

        if (inv.slots < participants) {
          return {
            success: false,
            message: `Not enough slots available. Requested: ${participants}, Available: ${inv.slots}`,
          };
        }

        // ✅ Atomic update to prevent race conditions
        const updatedInv = await Inventory.findOneAndUpdate(
          {
            tourId,
            date,
            slots: { $gte: participants }, // ✅ Ensure slots still available
          },
          {
            $inc: { slots: -participants },
            $set: { updatedAt: new Date().toISOString() },
          },
          { new: true }
        );

        if (!updatedInv) {
          return {
            success: false,
            message: "Slots were taken by another booking. Please try again.",
          };
        }

        const reservationId = `INV-${tourId}-${date}-${Date.now()}`;
        console.log(`✅ Reservation successful: ${reservationId}`);

        return {
          success: true,
          message: `Successfully reserved ${participants} slots. ${updatedInv.slots} slots remaining.`,
          reservationId,
          slotsRemaining: updatedInv.slots,
        };
      } catch (error) {
        console.error("Reserve slots error:", error);
        throw new Error(`Failed to reserve slots: ${error.message}`);
      }
    },

    // Release slots (jika booking dibatalkan)
    releaseSlots: async (_, { input }) => {
      const { tourId, date, participants } = input;

      try {
        console.log(
          `Releasing ${participants} slots for tour ${tourId} on ${date}`
        );

        const updatedInv = await Inventory.findOneAndUpdate(
          { tourId, date },
          {
            $inc: { slots: participants },
            $set: { updatedAt: new Date().toISOString() },
          },
          { new: true, upsert: true }
        );

        return {
          success: true,
          message: `Successfully released ${participants} slots. ${updatedInv.slots} slots now available.`,
          slotsRemaining: updatedInv.slots,
        };
      } catch (error) {
        console.error("Release slots error:", error);
        throw new Error(`Failed to release slots: ${error.message}`);
      }
    },

    // Hapus semua inventory untuk 1 tour
    deleteTour: async (_, { tourId }) => {
      try {
        console.log(`Deleting all inventory for tour ${tourId}`);
        const res = await Inventory.deleteMany({ tourId });

        return {
          success: res.deletedCount > 0,
          message:
            res.deletedCount > 0
              ? `Deleted ${res.deletedCount} inventory records`
              : `No inventory found for tour ${tourId}`,
          deletedCount: res.deletedCount,
        };
      } catch (error) {
        console.error("Delete tour error:", error);
        throw new Error(`Failed to delete tour inventory: ${error.message}`);
      }
    },

    // Initialize tour inventory with multiple dates
    initializeTourInventory: async (_, { tourId, dates, defaultSlots }) => {
      try {
        console.log(
          `Initializing inventory for tour ${tourId} with ${defaultSlots} slots per date`
        );

        // Validate tour exists
        const isValid = await validateTourId(tourId);
        if (!isValid) {
          console.warn(`Tour ${tourId} not found, but proceeding anyway`);
        }

        const inventoryDocs = dates.map((date) => ({
          tourId,
          date,
          slots: defaultSlots,
          hotelAvailable: true,
          transportAvailable: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        // Use insertMany with ordered: false to continue on duplicates
        let insertedCount = 0;
        const results = [];

        for (const doc of inventoryDocs) {
          try {
            await Inventory.create(doc);
            insertedCount++;
            results.push(`${doc.date}: ${defaultSlots} slots`);
          } catch (error) {
            if (error.code === 11000) {
              // Duplicate key error
              console.log(
                `Inventory for ${tourId} on ${doc.date} already exists`
              );
              results.push(`${doc.date}: already exists`);
            } else {
              console.error(
                `Failed to create inventory for ${doc.date}:`,
                error
              );
              results.push(`${doc.date}: failed`);
            }
          }
        }

        return {
          success: insertedCount > 0 || results.length > 0,
          message: `Processed ${results.length}/${
            dates.length
          } dates: ${results.join(", ")}`,
          deletedCount: insertedCount,
        };
      } catch (error) {
        console.error("Initialize tour inventory error:", error);
        throw new Error(
          `Failed to initialize tour inventory: ${error.message}`
        );
      }
    },

    // ✅ NEW: Range-based inventory initialization
    initializeTourInventoryRange: async (_, { input }) => {
      const {
        tourId,
        startDate,
        endDate,
        slots,
        hotelAvailable,
        transportAvailable,
        skipDays = [],
        skipDates = [],
      } = input;

      try {
        console.log(`🔄 Initializing inventory range for tour ${tourId}`);
        console.log(`📅 Date range: ${startDate} to ${endDate}`);
        console.log(`🎫 Slots per day: ${slots}`);
        console.log(`🏨 Hotel available: ${hotelAvailable}`);
        console.log(`🚌 Transport available: ${transportAvailable}`);

        if (skipDays.length > 0) {
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          console.log(
            `⏭️ Skip days: ${skipDays.map((d) => dayNames[d]).join(", ")}`
          );
        }

        if (skipDates.length > 0) {
          console.log(`⏭️ Skip dates: ${skipDates.join(", ")}`);
        }

        // Validate tour exists
        const isValid = await validateTourId(tourId);
        if (!isValid) {
          console.warn(`Tour ${tourId} not found, but proceeding anyway`);
        }

        // Generate date range
        const dates = generateDateRange(
          startDate,
          endDate,
          skipDays,
          skipDates
        );
        console.log(`📊 Generated ${dates.length} dates to process`);

        if (dates.length === 0) {
          return {
            success: false,
            message: "No dates to process after applying filters",
            totalDays: 0,
            createdRecords: 0,
            skippedRecords: 0,
            errorRecords: 0,
            dateRange: `${startDate} to ${endDate}`,
            details: ["No valid dates found"],
          };
        }

        // Process inventory creation
        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const details = [];
        const batchSize = 100; // Process in batches for better performance

        for (let i = 0; i < dates.length; i += batchSize) {
          const batch = dates.slice(i, i + batchSize);
          console.log(
            `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
              dates.length / batchSize
            )}: ${batch.length} dates`
          );

          for (const date of batch) {
            try {
              const inventoryDoc = {
                tourId,
                date,
                slots,
                hotelAvailable,
                transportAvailable,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              await Inventory.create(inventoryDoc);
              createdCount++;

              if (createdCount <= 10) {
                // Show first 10 details
                details.push(`${date}: ${slots} slots created`);
              }
            } catch (error) {
              if (error.code === 11000) {
                // Duplicate key error - inventory already exists
                skippedCount++;
                if (details.length < 20) {
                  details.push(`${date}: already exists (skipped)`);
                }
              } else {
                errorCount++;
                console.error(`Failed to create inventory for ${date}:`, error);
                if (details.length < 20) {
                  details.push(`${date}: error - ${error.message}`);
                }
              }
            }
          }
        }

        // Add summary to details
        if (createdCount > 10) {
          details.push(`... and ${createdCount - 10} more records created`);
        }
        if (skippedCount > 0) {
          details.push(`${skippedCount} dates already had inventory`);
        }
        if (errorCount > 0) {
          details.push(`${errorCount} dates failed to create`);
        }

        const success = createdCount > 0;
        const message = success
          ? `Successfully initialized ${createdCount} inventory records from ${startDate} to ${endDate}`
          : `No new inventory records created. ${skippedCount} already existed, ${errorCount} failed`;

        console.log(`✅ Range initialization completed:`);
        console.log(`   📊 Total days processed: ${dates.length}`);
        console.log(`   ✅ Created: ${createdCount}`);
        console.log(`   ⏭️ Skipped: ${skippedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);

        return {
          success,
          message,
          totalDays: dates.length,
          createdRecords: createdCount,
          skippedRecords: skippedCount,
          errorRecords: errorCount,
          dateRange: `${startDate} to ${endDate}`,
          details,
        };
      } catch (error) {
        console.error("Initialize tour inventory range error:", error);
        throw new Error(
          `Failed to initialize inventory range: ${error.message}`
        );
      }
    },

    // ✅ NEW: Update inventory in range
    updateInventoryRange: async (_, { input }) => {
      const {
        tourId,
        startDate,
        endDate,
        slots,
        hotelAvailable,
        transportAvailable,
        skipDays = [],
        skipDates = [],
      } = input;

      try {
        console.log(`🔄 Updating inventory range for tour ${tourId}`);
        console.log(`📅 Date range: ${startDate} to ${endDate}`);

        // Generate date range
        const dates = generateDateRange(
          startDate,
          endDate,
          skipDays,
          skipDates
        );
        console.log(`📊 Generated ${dates.length} dates to update`);

        if (dates.length === 0) {
          return {
            success: false,
            message: "No dates to process after applying filters",
            totalDays: 0,
            createdRecords: 0,
            skippedRecords: 0,
            errorRecords: 0,
            dateRange: `${startDate} to ${endDate}`,
            details: ["No valid dates found"],
          };
        }

        // Process inventory updates
        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const details = [];

        for (const date of dates) {
          try {
            const result = await Inventory.updateOne(
              { tourId, date },
              {
                $set: {
                  slots,
                  hotelAvailable,
                  transportAvailable,
                  updatedAt: new Date().toISOString(),
                },
              }
            );

            if (result.modifiedCount > 0) {
              updatedCount++;
              if (details.length < 10) {
                details.push(`${date}: updated to ${slots} slots`);
              }
            } else if (result.matchedCount > 0) {
              skippedCount++;
              if (details.length < 15) {
                details.push(`${date}: no changes needed`);
              }
            } else {
              skippedCount++;
              if (details.length < 15) {
                details.push(`${date}: inventory not found (skipped)`);
              }
            }
          } catch (error) {
            errorCount++;
            console.error(`Failed to update inventory for ${date}:`, error);
            if (details.length < 20) {
              details.push(`${date}: error - ${error.message}`);
            }
          }
        }

        // Add summary to details
        if (updatedCount > 10) {
          details.push(`... and ${updatedCount - 10} more records updated`);
        }

        const success = updatedCount > 0;
        const message = success
          ? `Successfully updated ${updatedCount} inventory records from ${startDate} to ${endDate}`
          : `No inventory records updated. ${skippedCount} skipped, ${errorCount} failed`;

        console.log(`✅ Range update completed:`);
        console.log(`   📊 Total days processed: ${dates.length}`);
        console.log(`   ✅ Updated: ${updatedCount}`);
        console.log(`   ⏭️ Skipped: ${skippedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);

        return {
          success,
          message,
          totalDays: dates.length,
          createdRecords: updatedCount,
          skippedRecords: skippedCount,
          errorRecords: errorCount,
          dateRange: `${startDate} to ${endDate}`,
          details,
        };
      } catch (error) {
        console.error("Update inventory range error:", error);
        throw new Error(`Failed to update inventory range: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;
