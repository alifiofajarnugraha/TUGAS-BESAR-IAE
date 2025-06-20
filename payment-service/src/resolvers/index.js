const Payment = require("../models/Payment");
const axios = require("axios");

// Service URLs dengan fallback
const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL ||
  (process.env.NODE_ENV === "production"
    ? "http://booking-service:3003/graphql"
    : "http://localhost:3003/graphql");

const TRAVEL_SCHEDULE_SERVICE_URL =
  process.env.TRAVEL_SCHEDULE_SERVICE_URL ||
  (process.env.NODE_ENV === "production"
    ? "http://travel-schedule-service:3006/graphql"
    : "http://localhost:3006/graphql");

// Helper functions
const callBookingService = async (query, variables = {}) => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`Calling booking service: ${BOOKING_SERVICE_URL}`);

      const response = await axios.post(
        BOOKING_SERVICE_URL,
        { query, variables },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        }
      );

      if (response.data.errors) {
        console.error("Booking service errors:", response.data.errors);
        return null;
      }

      return response.data.data;
    } catch (error) {
      retries++;
      console.warn(
        `Booking service unavailable (attempt ${retries}/${maxRetries}):`,
        error.message
      );

      if (retries === maxRetries) {
        return null;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
    }
  }
};

const updateBookingPaymentStatus = async (bookingId, paymentStatus) => {
  if (!bookingId) {
    console.warn("No booking ID provided for payment status update");
    return null;
  }

  const query = `
    mutation UpdateBooking($id: ID!, $input: BookingUpdateInput!) {
      updateBooking(id: $id, input: $input) {
        id
        paymentStatus
      }
    }
  `;

  const result = await callBookingService(query, {
    id: bookingId,
    input: { paymentStatus },
  });

  if (result) {
    console.log(
      `Successfully updated booking ${bookingId} payment status to ${paymentStatus}`
    );
  } else {
    console.warn(`Failed to update booking ${bookingId} payment status`);
  }

  return result;
};

// Transform payment helper
const transformPayment = (payment) => ({
  id: payment._id,
  method: payment.paymentMethod,
  amount: payment.amount,
  status: payment.status,
  invoiceNumber: payment.invoiceDetails.invoiceNumber,
  createdAt: payment.invoiceDetails.dateIssued.toISOString(),
  updatedAt:
    payment.updatedAt?.toISOString() ||
    payment.invoiceDetails.dateIssued.toISOString(),
  travelScheduleId: payment.travelScheduleId,
  bookingId: payment.bookingId,
  userId: payment.userId,
});

const resolvers = {
  Query: {
    // ✅ Add missing getPayment resolver
    getPayment: async (_, { id }) => {
      try {
        const payment = await Payment.findById(id);
        if (!payment) {
          throw new Error("Payment not found");
        }
        return transformPayment(payment);
      } catch (error) {
        console.error("Error fetching payment:", error);
        throw new Error("Failed to fetch payment: " + error.message);
      }
    },

    getPaymentStatus: async (_, { paymentId }) => {
      try {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error("Payment not found");
        }
        return transformPayment(payment);
      } catch (error) {
        console.error("Error fetching payment status:", error);
        throw new Error("Failed to fetch payment status: " + error.message);
      }
    },

    listPayments: async () => {
      try {
        const payments = await Payment.find().sort({
          "invoiceDetails.dateIssued": -1,
        });
        console.log(`Found ${payments.length} payments`);

        return payments.map(transformPayment);
      } catch (error) {
        console.error("Error in listPayments:", error);
        throw new Error("Failed to list payments: " + error.message);
      }
    },

    getTravelSchedulePaymentStatus: async (_, { travelScheduleId }) => {
      try {
        const payment = await Payment.findOne({
          travelScheduleId,
          status: { $in: ["completed", "pending", "failed"] },
        }).sort({ "invoiceDetails.dateIssued": -1 });

        if (!payment) {
          return {
            travelScheduleId,
            isPaid: false,
            paymentStatus: "NOT_FOUND",
            paymentId: null,
            amount: null,
            paidAt: null,
          };
        }

        return {
          travelScheduleId,
          isPaid: payment.status === "completed",
          paymentStatus: payment.status.toUpperCase(),
          paymentId: payment._id,
          amount: payment.amount,
          paidAt:
            payment.status === "completed"
              ? payment.updatedAt?.toISOString() ||
                payment.invoiceDetails.dateIssued.toISOString()
              : null,
        };
      } catch (error) {
        console.error("Error fetching travel schedule payment status:", error);
        return {
          travelScheduleId,
          isPaid: false,
          paymentStatus: "ERROR",
          paymentId: null,
          amount: null,
          paidAt: null,
        };
      }
    },

    getPaymentsByTravelSchedule: async (_, { travelScheduleId }) => {
      try {
        const payments = await Payment.find({ travelScheduleId }).sort({
          "invoiceDetails.dateIssued": -1,
        });
        return payments.map(transformPayment);
      } catch (error) {
        console.error("Error fetching payments by travel schedule:", error);
        return [];
      }
    },

    getPaymentsByBooking: async (_, { bookingId }) => {
      try {
        const payments = await Payment.find({ bookingId }).sort({
          "invoiceDetails.dateIssued": -1,
        });
        return payments.map(transformPayment);
      } catch (error) {
        console.error("Error fetching payments by booking:", error);
        return [];
      }
    },

    // ✅ Add missing getInvoice resolver
    getInvoice: async (_, { invoiceNumber }) => {
      try {
        const payment = await Payment.findOne({
          "invoiceDetails.invoiceNumber": invoiceNumber,
        });

        if (!payment) {
          throw new Error("Invoice not found");
        }

        return {
          invoiceNumber: payment.invoiceDetails.invoiceNumber,
          dateIssued: payment.invoiceDetails.dateIssued.toISOString(),
          dueDate: payment.invoiceDetails.dueDate.toISOString(),
          amount: payment.amount,
          status: payment.status,
          paymentId: payment._id,
          customerInfo: {
            userId: payment.userId,
            bookingId: payment.bookingId,
            travelScheduleId: payment.travelScheduleId,
          },
        };
      } catch (error) {
        console.error("Error fetching invoice:", error);
        throw new Error("Failed to fetch invoice: " + error.message);
      }
    },

    // ✅ Add missing getInvoiceByPayment resolver
    getInvoiceByPayment: async (_, { paymentId }) => {
      try {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error("Payment not found");
        }

        return {
          invoiceNumber: payment.invoiceDetails.invoiceNumber,
          dateIssued: payment.invoiceDetails.dateIssued.toISOString(),
          dueDate: payment.invoiceDetails.dueDate.toISOString(),
          amount: payment.amount,
          status: payment.status,
          paymentId: payment._id,
          customerInfo: {
            userId: payment.userId,
            bookingId: payment.bookingId,
            travelScheduleId: payment.travelScheduleId,
          },
        };
      } catch (error) {
        console.error("Error fetching invoice by payment:", error);
        throw new Error("Failed to fetch invoice: " + error.message);
      }
    },
  },

  Mutation: {
    processPayment: async (_, { input }) => {
      try {
        const { method, amount, travelScheduleId, bookingId, userId } = input;

        console.log("Processing payment with input:", input);

        // Validate input
        if (!method || !amount || amount <= 0) {
          throw new Error("Invalid payment method or amount");
        }

        if (!userId) {
          throw new Error("User ID is required");
        }

        const invoiceNumber = `INV-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 6)
          .toUpperCase()}`;

        const payment = new Payment({
          paymentMethod: method,
          amount: parseFloat(amount),
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
        console.log("Payment saved to database:", payment._id);

        return transformPayment(payment);
      } catch (error) {
        console.error("Error processing payment:", error);
        throw new Error("Failed to process payment: " + error.message);
      }
    },

    updatePaymentStatus: async (_, { paymentId, status }) => {
      try {
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

        const oldStatus = payment.status;
        payment.status = status;
        payment.updatedAt = new Date();

        const updatedPayment = await payment.save();
        console.log(
          `Payment ${paymentId} status updated from ${oldStatus} to ${status}`
        );

        // Update booking payment status if completed
        if (status === "completed" && payment.bookingId) {
          console.log(
            `Attempting to update booking ${payment.bookingId} payment status`
          );
          await updateBookingPaymentStatus(payment.bookingId, "PAID");
        }

        return {
          id: updatedPayment._id,
          paymentId: updatedPayment._id,
          status: updatedPayment.status,
          message: `Payment status successfully updated from ${oldStatus} to ${status}`,
          payment: transformPayment(updatedPayment),
        };
      } catch (error) {
        console.error("Error updating payment status:", error);
        throw new Error("Failed to update payment status: " + error.message);
      }
    },

    // ✅ Fix generateInvoice to return Invoice object instead of string
    generateInvoice: async (_, { paymentId }) => {
      try {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error("Payment not found");
        }

        // Return Invoice object as per schema
        return {
          invoiceNumber: payment.invoiceDetails.invoiceNumber,
          dateIssued: payment.invoiceDetails.dateIssued.toISOString(),
          dueDate: payment.invoiceDetails.dueDate.toISOString(),
          amount: payment.amount,
          status: payment.status,
          paymentId: payment._id,
          customerInfo: {
            userId: payment.userId,
            bookingId: payment.bookingId,
            travelScheduleId: payment.travelScheduleId,
          },
        };
      } catch (error) {
        console.error("Error generating invoice:", error);
        throw new Error("Failed to generate invoice: " + error.message);
      }
    },

    // ✅ Add missing processRefund resolver
    processRefund: async (_, { paymentId, amount }) => {
      try {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error("Payment not found");
        }

        if (payment.status !== "completed") {
          throw new Error("Can only refund completed payments");
        }

        const refundAmount = amount || payment.amount;
        if (refundAmount > payment.amount) {
          throw new Error(
            "Refund amount cannot exceed original payment amount"
          );
        }

        // Create refund record (simplified - in real system, you'd create separate refund records)
        payment.status = "refunded";
        payment.updatedAt = new Date();

        const refundedPayment = await payment.save();
        console.log(
          `Payment ${paymentId} refunded with amount ${refundAmount}`
        );

        // Update booking if applicable
        if (payment.bookingId) {
          await updateBookingPaymentStatus(payment.bookingId, "REFUNDED");
        }

        return transformPayment(refundedPayment);
      } catch (error) {
        console.error("Error processing refund:", error);
        throw new Error("Failed to process refund: " + error.message);
      }
    },
  },
};

module.exports = resolvers;
