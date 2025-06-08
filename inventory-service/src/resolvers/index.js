const Inventory = require("../models/Inventory");

module.exports = {
  Query: {
    // Cek ketersediaan slot, hotel, transport untuk 1 tour pada 1 tanggal
    checkAvailability: async (_, { tourId, date, participants }) => {
      const inv = await Inventory.findOne({ tourId, date });
      if (!inv) {
        return { available: false, message: "No inventory for this date" };
      }
      if (inv.slots < participants) {
        return {
          available: false,
          message: `Only ${inv.slots} slots left`,
        };
      }
      return { available: true, message: "Available" };
    },

    // List status inventory untuk 1 tour (semua tanggal)
    getInventoryStatus: async (_, { tourId }) => {
      const invs = await Inventory.find({ tourId });
      return invs.map((inv) => ({
        tourId: inv.tourId,
        date: inv.date,
        slotsLeft: inv.slots,
        hotelAvailable: inv.hotelAvailable,
        transportAvailable: inv.transportAvailable,
      }));
    },

    // List semua inventory (untuk admin)
    getAllInventory: async () => {
      return await Inventory.find({});
    },
  },

  Mutation: {
    // Update/Set inventory (slot, hotel, transport) untuk 1 tour pada 1 tanggal
    updateInventory: async (_, { input }) => {
      const { tourId, date, slots, hotelAvailable, transportAvailable } = input;
      const inv = await Inventory.findOneAndUpdate(
        { tourId, date },
        {
          $set: {
            slots,
            hotelAvailable,
            transportAvailable,
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            createdAt: new Date().toISOString(),
          },
        },
        { new: true, upsert: true }
      );
      return inv;
    },

    // Real-time: Reserve slot (kurangi slot saat booking)
    reserveSlots: async (_, { input }) => {
      const { tourId, date, participants } = input;
      const inv = await Inventory.findOne({ tourId, date });
      if (!inv) {
        return { success: false, message: "No inventory for this date" };
      }
      if (inv.slots < participants) {
        return { success: false, message: "Not enough slots" };
      }
      inv.slots -= participants;
      inv.updatedAt = new Date().toISOString();
      await inv.save();
      return {
        success: true,
        message: "Reservation successful",
        reservationId: `${tourId}-${date}-${Date.now()}`,
      };
    },

    // Hapus semua inventory untuk 1 tour
    deleteTour: async (_, { tourId }) => {
      const res = await Inventory.deleteMany({ tourId });
      return {
        success: res.deletedCount > 0,
        message: res.deletedCount > 0 ? "Deleted" : "Not found",
      };
    },
  },
};
