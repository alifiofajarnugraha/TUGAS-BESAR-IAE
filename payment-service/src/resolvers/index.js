const Payment = require("../models/Payment");
const axios = require("axios");

// Simple helper function
const callTravelScheduleService = async (endpoint, data = {}) => {
  try {
    const response = await axios.post(
      `${process.env.TRAVEL_SCHEDULE_SERVICE_URL}${endpoint}`,
      data,
      {
        timeout: 5000,
      }
    );
    return response.data;
  } catch (error) {
    console.warn("TravelSchedule service unavailable:", error.message);
    return null;
  }
};

module.exports = {
  Query: {
    getPaymentStatus: async (_, { paymentId }) => {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      return {
        id: payment._id,
        method: payment.paymentMethod,
        amount: payment.amount,
        status: payment.status,
        invoiceNumber: payment.invoiceDetails.invoiceNumber,
        createdAt: payment.invoiceDetails.dateIssued.toISOString(),
        updatedAt: payment.invoiceDetails.dateIssued.toISOString(),
        travelScheduleId: payment.travelScheduleId,
        bookingId: payment.bookingId,
        userId: payment.userId,
      };
    },

    listPayments: async () => {
      try {
        const payments = await Payment.find();
        console.log("Raw payments from DB:", payments);

        const transformedPayments = payments.map((payment) => {
          console.log("Transforming payment:", payment._id);
          return {
            id: payment._id,
            method: payment.paymentMethod,
            amount: payment.amount,
            status: payment.status,
            invoiceNumber: payment.invoiceDetails.invoiceNumber,
            createdAt: payment.invoiceDetails.dateIssued.toISOString(),
            updatedAt: payment.invoiceDetails.dateIssued.toISOString(),
            travelScheduleId: payment.travelScheduleId,
            bookingId: payment.bookingId,
            userId: payment.userId,
          };
        });

        console.log("Transformed payments:", transformedPayments);
        return transformedPayments;
      } catch (error) {
        console.error("Error in listPayments:", error);
        throw error;
      }
    },

    // Endpoint utama untuk travelschedule service
    getTravelSchedulePaymentStatus: async (_, { travelScheduleId }) => {
      const payment = await Payment.findOne({
        travelScheduleId,
        status: { $in: ["completed", "pending", "failed"] },
      }).sort({ createdAt: -1 }); // Ambil payment terbaru

      if (!payment) {
        return {
          travelScheduleId,
          isPaid: false,
          paymentStatus: "not_found",
          paymentId: null,
          amount: null,
          paidAt: null,
        };
      }

      return {
        travelScheduleId,
        isPaid: payment.status === "completed",
        paymentStatus: payment.status,
        paymentId: payment._id,
        amount: payment.amount,
        paidAt:
          payment.status === "completed"
            ? payment.invoiceDetails.dateIssued.toISOString()
            : null,
      };
    },

    // Semua pembayaran untuk travel schedule tertentu
    getPaymentsByTravelSchedule: async (_, { travelScheduleId }) => {
      const payments = await Payment.find({ travelScheduleId });

      return payments.map((payment) => ({
        id: payment._id,
        method: payment.paymentMethod,
        amount: payment.amount,
        status: payment.status,
        invoiceNumber: payment.invoiceDetails.invoiceNumber,
        createdAt: payment.invoiceDetails.dateIssued.toISOString(),
        updatedAt: payment.invoiceDetails.dateIssued.toISOString(),
        travelScheduleId: payment.travelScheduleId,
        bookingId: payment.bookingId,
        userId: payment.userId,
      }));
    },

    // Untuk booking service
    getPaymentsByBooking: async (_, { bookingId }) => {
      const payments = await Payment.find({ bookingId });

      return payments.map((payment) => ({
        id: payment._id,
        method: payment.paymentMethod,
        amount: payment.amount,
        status: payment.status,
        invoiceNumber: payment.invoiceDetails.invoiceNumber,
        createdAt: payment.invoiceDetails.dateIssued.toISOString(),
        updatedAt: payment.invoiceDetails.dateIssued.toISOString(),
        travelScheduleId: payment.travelScheduleId,
        bookingId: payment.bookingId,
        userId: payment.userId,
      }));
    },
  },

  Mutation: {
    processPayment: async (_, { input }) => {
      const { method, amount, travelScheduleId, bookingId, userId } = input;

      const invoiceNumber = `INV-${Date.now()}`;

      const payment = new Payment({
        paymentMethod: method,
        amount,
        status: "pending",
        travelScheduleId,
        bookingId,
        userId,
        invoiceDetails: {
          invoiceNumber,
          dateIssued: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await payment.save();

      return {
        id: payment._id,
        method: payment.paymentMethod,
        amount: payment.amount,
        status: payment.status,
        invoiceNumber: payment.invoiceDetails.invoiceNumber,
        createdAt: payment.invoiceDetails.dateIssued.toISOString(),
        updatedAt: payment.invoiceDetails.dateIssued.toISOString(),
        travelScheduleId: payment.travelScheduleId,
        bookingId: payment.bookingId,
        userId: payment.userId,
      };
    },

    updatePaymentStatus: async (_, { paymentId, status }) => {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      const validStatuses = ["pending", "completed", "failed"];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      payment.status = status;
      const updatedPayment = await payment.save();

      const response = {
        id: updatedPayment._id,
        paymentId: updatedPayment._id,
        status: updatedPayment.status,
        message: `Payment status successfully updated to ${status}`,
        payment: {
          id: updatedPayment._id,
          amount: updatedPayment.amount,
          method: updatedPayment.paymentMethod,
          status: updatedPayment.status,
          invoiceNumber: updatedPayment.invoiceDetails.invoiceNumber,
          createdAt: updatedPayment.invoiceDetails.dateIssued.toISOString(),
          updatedAt: new Date().toISOString(),
          travelScheduleId: updatedPayment.travelScheduleId,
          bookingId: updatedPayment.bookingId,
          userId: updatedPayment.userId,
        },
      };

      return response;
    },

    generateInvoice: async (_, { paymentId }) => {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      const invoice = `
        Invoice Number: ${payment.invoiceDetails.invoiceNumber}
        Date: ${payment.invoiceDetails.dateIssued}
        Due Date: ${payment.invoiceDetails.dueDate}
        Amount: $${payment.amount}
        Method: ${payment.paymentMethod}
        Status: ${payment.status}
        Travel Schedule ID: ${payment.travelScheduleId || "N/A"}
        Booking ID: ${payment.bookingId || "N/A"}
      `;

      return invoice;
    },
  },
};
