const mongoose = require("mongoose");

const tourPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Adventure",
      "Cultural",
      "Beach",
      "Mountain",
      "City Tour",
      "Nature",
      "Historical",
    ],
    trim: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  longDescription: {
    type: String,
  },
  location: {
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    meetingPoint: {
      type: String,
    },
  },
  duration: {
    days: {
      type: Number,
      required: true,
      min: 1,
    },
    nights: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["IDR", "USD", "EUR"],
    },
  },
  inclusions: [String],
  exclusions: [String],
  itinerary: [
    {
      day: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      activities: {
        type: [String],
        required: true,
      },
    },
  ],
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function (images) {
        return images.every(
          (url) => typeof url === "string" && url.trim().length > 0
        );
      },
      message: "All images must be valid URL strings",
    },
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "inactive", "draft"],
    default: "active",
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

// ✅ Add index for better performance
tourPackageSchema.index({ status: 1, category: 1 });
tourPackageSchema.index({ "location.city": 1 });

const TourPackage = mongoose.model("TourPackage", tourPackageSchema);

module.exports = TourPackage;
