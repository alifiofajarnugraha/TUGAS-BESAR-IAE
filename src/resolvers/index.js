const Inventory = require('../models/Inventory');
const axios = require('axios');

module.exports = {
  Query: {
    checkAvailability: async (_, { tourId, date, participants }) => {
      const inventory = await Inventory.findOne({ tourId, date });
      if (!inventory) {
        return {
          available: false,
          message: 'Tour not found for the specified date'
        };
      }
      return {
        available: inventory.slots >= participants,
        message: inventory.slots >= participants 
          ? 'Slots available' 
          : 'Not enough slots available'
      };
    },

    getInventoryStatus: async (_, { tourId }) => {
      const inventories = await Inventory.find({ tourId });
      return inventories.map(inv => ({
        tourId: inv.tourId,
        date: inv.date,
        slotsLeft: inv.slots,
        hotelAvailable: inv.hotelAvailable,
        transportAvailable: inv.transportAvailable
      }));
    }
  },

  Mutation: {
    reserveSlots: async (_, { input }) => {
      const { tourId, date, participants } = input;
      const inventory = await Inventory.findOne({ tourId, date });
      
      if (!inventory) {
        return {
          success: false,
          message: 'Tour not found for the specified date'
        };
      }

      if (inventory.slots < participants) {
        return {
          success: false,
          message: 'Not enough slots available'
        };
      }

      inventory.slots -= participants;
      await inventory.save();

      return {
        success: true,
        message: 'Reservation successful',
        reservationId: `${tourId}-${date}-${Date.now()}`
      };
    },

    updateInventory: async (_, { input }) => {
      const { tourId, date, slots, hotelAvailable, transportAvailable } = input;
      const updateData = {};
      
      if (slots !== undefined) updateData.slots = slots;
      if (hotelAvailable !== undefined) updateData.hotelAvailable = hotelAvailable;
      if (transportAvailable !== undefined) updateData.transportAvailable = transportAvailable;

      const inventory = await Inventory.findOneAndUpdate(
        { tourId, date },
        { $set: updateData },
        { new: true, upsert: true }
      );

      return inventory;
    },

    deleteTour: async (_, { tourId }) => {
      try {
        const result = await Inventory.deleteMany({ tourId });
        if (result.deletedCount > 0) {
          return {
            success: true,
            message: `Successfully deleted tour ${tourId}`
          };
        }
        return {
          success: false,
          message: `Tour ${tourId} not found`
        };
      } catch (error) {
        return {
          success: false,
          message: `Error deleting tour: ${error.message}`
        };
      }
    }
  }
};
