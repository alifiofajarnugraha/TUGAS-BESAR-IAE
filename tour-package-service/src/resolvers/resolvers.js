// src/resolvers/resolvers.js
// Resolvers dasar untuk Tour Package Service

const TourPackage = require("../models/TourPackage");
const mongoose = require("mongoose");

const resolvers = {
  Query: {
    getTourPackages: async () => {
      try {
        return await TourPackage.find({}).sort({ createdAt: -1 });
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

        return tourPackage;
      } catch (error) {
        throw new Error(`Error fetching tour package: ${error}`);
      }
    },

    getTourPackagesByCategory: async (_, { category }) => {
      try {
        return await TourPackage.find({ category });
      } catch (error) {
        throw new Error(`Error fetching tour packages by category: ${error}`);
      }
    },

    searchTourPackages: async (_, { keyword }) => {
      try {
        const regex = new RegExp(keyword, "i");
        return await TourPackage.find({
          $or: [
            { name: { $regex: regex } },
            { shortDescription: { $regex: regex } },
            { "location.city": { $regex: regex } },
            { "location.country": { $regex: regex } },
            { category: { $regex: regex } },
          ],
        });
      } catch (error) {
        throw new Error(`Error searching tour packages: ${error}`);
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

        return await newTourPackage.save();
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

        return updatedTourPackage;
      } catch (error) {
        throw new Error(`Error updating tour package: ${error}`);
      }
    },

    deleteTourPackage: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid tour package ID");
        }

        const deletedTourPackage = await TourPackage.findByIdAndDelete(id);
        if (!deletedTourPackage) {
          throw new Error(`Tour package with ID ${id} not found`);
        }

        return deletedTourPackage;
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

        return updatedTourPackage;
      } catch (error) {
        throw new Error(`Error updating tour status: ${error}`);
      }
    },
  },
};

module.exports = resolvers;
