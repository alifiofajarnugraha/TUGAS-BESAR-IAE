const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentMethod: {
    type: String,
    required: true,
    enum: ["transfer", "e-wallet", "credit card"],
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed"],
  },

  //field opsional
  travelScheduleId: { type: String, required: false }, // ID dari travelschedule service
  bookingId: { type: String, required: false }, // ID dari booking service
  userId: { type: String, required: false }, // ID user yang melakukan pembayaran

  invoiceDetails: {
    invoiceNumber: { type: String, required: true },
    dateIssued: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
