const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    tourId: {
      type: String,
      required: true,
      index: true, // ✅ Add index for better performance
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v); // YYYY-MM-DD format
        },
        message: "Date must be in YYYY-MM-DD format",
      },
    },
    slots: {
      type: Number,
      required: true,
      min: [0, "Slots cannot be negative"],
    },
    hotelAvailable: {
      type: Boolean,
      default: true,
    },
    transportAvailable: {
      type: Boolean,
      default: true,
    },
    // ✅ Add audit fields
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    // ✅ Add compound index for unique tour-date combination
    indexes: [{ tourId: 1, date: 1, unique: true }],
  }
);

// ✅ Add pre-save middleware to update timestamp
inventorySchema.pre("save", function (next) {
  this.updatedAt = new Date().toISOString();
  if (this.isNew) {
    this.createdAt = new Date().toISOString();
  }
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
