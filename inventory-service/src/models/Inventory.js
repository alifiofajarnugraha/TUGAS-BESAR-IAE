const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  tourId: { type: String, required: true },
  date: { type: String, required: true },
  slots: { type: Number, required: true },
  hotelAvailable: { type: Boolean, default: true },
  transportAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Inventory', inventorySchema);
