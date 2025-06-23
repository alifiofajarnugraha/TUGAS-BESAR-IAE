const Payment = require("../models/Payment");
const axios = require("axios");

// ✅ FIXED: Service URLs dengan proper fallback
const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL ||
  (process.env.NODE_ENV === "production"
    ? "http://booking-service:3003/graphql"
    : "http://localhost:3003/graphql");

console.log("🔧 Payment Service Configuration:");
console.log(`   Booking Service URL: ${BOOKING_SERVICE_URL}`);
console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);

// ✅ Enhanced service call dengan better error handling
const callBookingService = async (query, variables = {}) => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`📞 Calling booking service: ${BOOKING_SERVICE_URL}`);
      console.log(`📝 Query variables:`, variables);

      const response = await axios.post(
        BOOKING_SERVICE_URL,
        { query, variables },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "payment-service/1.0.0",
          },
          timeout: 10000, // Increased timeout
        }
      );

      if (response.data.errors) {
        console.error(
          "❌ Booking service GraphQL errors:",
          response.data.errors
        );
        throw new Error(
          `Booking service error: ${response.data.errors[0].message}`
        );
      }

      if (!response.data.data) {
        console.error("❌ Booking service returned no data");
        throw new Error("Booking service returned no data");
      }

      console.log("✅ Booking service response received");
      return response.data.data;
    } catch (error) {
      retries++;
      console.warn(
        `⚠️ Booking service call failed (attempt ${retries}/${maxRetries}):`,
        error.message
      );

      if (error.code === "ECONNREFUSED") {
        console.error(
          "💡 Booking service connection refused - check if service is running"
        );
      }

      if (retries === maxRetries) {
        console.error("❌ All booking service retry attempts failed");
        return null;
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
    }
  }
};

// ✅ FIXED: Enhanced booking status update dengan proper error handling
const updateBookingPaymentStatus = async (bookingId, paymentStatus) => {
  if (!bookingId) {
    console.warn("⚠️ No booking ID provided for payment status update");
    return null;
  }

  try {
    console.log(
      `🔄 Updating booking ${bookingId} payment status to ${paymentStatus}`
    );

    const query = `
      mutation UpdateBooking($id: ID!, $input: BookingUpdateInput!) {
        updateBooking(id: $id, input: $input) {
          id
          paymentStatus
          status
          updatedAt
        }
      }
    `;

    const result = await callBookingService(query, {
      id: bookingId,
      input: { paymentStatus },
    });

    if (result?.updateBooking) {
      console.log(
        `✅ Successfully updated booking ${bookingId} payment status to ${paymentStatus}`
      );
      return result.updateBooking;
    } else {
      console.warn(
        `⚠️ Failed to update booking ${bookingId} payment status - no response data`
      );
      return null;
    }
  } catch (error) {
    console.error(
      `❌ Error updating booking ${bookingId} payment status:`,
      error.message
    );
    return null;
  }
};

// ✅ FIXED: Enhanced transform function dengan proper error handling
const transformPayment = (payment) => {
  if (!payment) {
    console.error("❌ Cannot transform null payment");
    return null;
  }

  try {
    // ✅ Safe access dengan fallbacks
    const invoiceDetails = payment.invoiceDetails || {};
    const invoiceNumber = invoiceDetails.invoiceNumber || `INV-${payment._id}`;
    const dateIssued =
      invoiceDetails.dateIssued || payment.createdAt || new Date();
    const updatedAt = payment.updatedAt || dateIssued;

    return {
      id: payment._id?.toString() || payment.id,
      method: payment.paymentMethod || payment.method || "unknown", // ✅ Handle both field names
      amount: parseFloat(payment.amount) || 0,
      status: payment.status || "pending",
      invoiceNumber,
      createdAt:
        dateIssued instanceof Date ? dateIssued.toISOString() : dateIssued,
      updatedAt:
        updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,
      travelScheduleId: payment.travelScheduleId || null,
      bookingId: payment.bookingId || null,
      userId: payment.userId || null,
    };
  } catch (error) {
    console.error("❌ Error transforming payment:", error);
    console.error("Payment data:", payment);
    return null;
  }
};

const resolvers = {
  Query: {
    getPayment: async (_, { id }) => {
      try {
        console.log(`🔍 Fetching payment: ${id}`);

        const payment = await Payment.findById(id);
        if (!payment) {
          throw new Error(`Payment with id ${id} not found`);
        }

        const transformed = transformPayment(payment);
        if (!transformed) {
          throw new Error("Failed to transform payment data");
        }

        return transformed;
      } catch (error) {
        console.error("❌ Error fetching payment:", error);
        throw new Error(`Failed to fetch payment: ${error.message}`);
      }
    },

    getPaymentStatus: async (_, { paymentId }) => {
      try {
        console.log(`🔍 Fetching payment status: ${paymentId}`);

        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error(`Payment with id ${paymentId} not found`);
        }

        const transformed = transformPayment(payment);
        if (!transformed) {
          throw new Error("Failed to transform payment data");
        }

        return transformed;
      } catch (error) {
        console.error("❌ Error fetching payment status:", error);
        throw new Error(`Failed to fetch payment status: ${error.message}`);
      }
    },

    listPayments: async () => {
      try {
        console.log("📋 Listing all payments");

        const payments = await Payment.find().sort({ createdAt: -1 });
        console.log(`📊 Found ${payments.length} payments`);

        const transformed = payments
          .map(transformPayment)
          .filter((payment) => payment !== null); // ✅ Filter out failed transformations

        return transformed;
      } catch (error) {
        console.error("❌ Error listing payments:", error);
        throw new Error(`Failed to list payments: ${error.message}`);
      }
    },

    getPaymentsByBooking: async (_, { bookingId }) => {
      try {
        console.log(`🔍 Fetching payments for booking: ${bookingId}`);

        const payments = await Payment.find({ bookingId }).sort({
          createdAt: -1,
        });
        console.log(
          `📊 Found ${payments.length} payments for booking ${bookingId}`
        );

        const transformed = payments
          .map(transformPayment)
          .filter((payment) => payment !== null);

        return transformed;
      } catch (error) {
        console.error("❌ Error fetching payments by booking:", error);
        return []; // ✅ Return empty array instead of throwing
      }
    },

    getPaymentsByTravelSchedule: async (_, { travelScheduleId }) => {
      try {
        console.log(
          `🔍 Fetching payments for travel schedule: ${travelScheduleId}`
        );

        const payments = await Payment.find({ travelScheduleId }).sort({
          createdAt: -1,
        });
        console.log(
          `📊 Found ${payments.length} payments for travel schedule ${travelScheduleId}`
        );

        const transformed = payments
          .map(transformPayment)
          .filter((payment) => payment !== null);

        return transformed;
      } catch (error) {
        console.error("❌ Error fetching payments by travel schedule:", error);
        return [];
      }
    },

    getTravelSchedulePaymentStatus: async (_, { travelScheduleId }) => {
      try {
        console.log(
          `🔍 Checking payment status for travel schedule: ${travelScheduleId}`
        );

        const payment = await Payment.findOne({
          travelScheduleId,
          status: { $in: ["completed", "pending", "failed"] },
        }).sort({ createdAt: -1 });

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
          paymentId: payment._id.toString(),
          amount: payment.amount,
          paidAt:
            payment.status === "completed"
              ? (payment.updatedAt || payment.createdAt).toISOString()
              : null,
        };
      } catch (error) {
        console.error(
          "❌ Error checking travel schedule payment status:",
          error
        );
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

    getInvoice: async (_, { invoiceNumber }) => {
      try {
        console.log(`🧾 Fetching invoice: ${invoiceNumber}`);

        const payment = await Payment.findOne({
          "invoiceDetails.invoiceNumber": invoiceNumber,
        });

        if (!payment) {
          throw new Error(`Invoice ${invoiceNumber} not found`);
        }

        return {
          invoiceNumber: payment.invoiceDetails.invoiceNumber,
          dateIssued: payment.invoiceDetails.dateIssued.toISOString(),
          dueDate: payment.invoiceDetails.dueDate.toISOString(),
          amount: payment.amount,
          status: payment.status,
          paymentId: payment._id.toString(),
          customerInfo: {
            userId: payment.userId,
            bookingId: payment.bookingId,
            travelScheduleId: payment.travelScheduleId,
          },
        };
      } catch (error) {
        console.error("❌ Error fetching invoice:", error);
        throw new Error(`Failed to fetch invoice: ${error.message}`);
      }
    },

    getInvoiceByPayment: async (_, { paymentId }) => {
      try {
        console.log(`🧾 Fetching invoice for payment: ${paymentId}`);

        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error(`Payment ${paymentId} not found`);
        }

        return {
          invoiceNumber: payment.invoiceDetails.invoiceNumber,
          dateIssued: payment.invoiceDetails.dateIssued.toISOString(),
          dueDate: payment.invoiceDetails.dueDate.toISOString(),
          amount: payment.amount,
          status: payment.status,
          paymentId: payment._id.toString(),
          customerInfo: {
            userId: payment.userId,
            bookingId: payment.bookingId,
            travelScheduleId: payment.travelScheduleId,
          },
        };
      } catch (error) {
        console.error("❌ Error fetching invoice by payment:", error);
        throw new Error(`Failed to fetch invoice: ${error.message}`);
      }
    },
  },

  Mutation: {
    processPayment: async (_, { input }) => {
      try {
        const { method, amount, travelScheduleId, bookingId, userId } = input;

        console.log("💳 Processing payment with input:", input);

        // ✅ Enhanced validation
        if (!method || typeof method !== "string") {
          throw new Error("Payment method is required and must be a string");
        }

        if (!amount || amount <= 0 || isNaN(amount)) {
          throw new Error("Amount must be a positive number");
        }

        if (!userId || typeof userId !== "string") {
          throw new Error("User ID is required and must be a string");
        }

        if (!bookingId && !travelScheduleId) {
          throw new Error(
            "Either booking ID or travel schedule ID is required"
          );
        }

        // ✅ Generate secure invoice number
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 6).toUpperCase();
        const invoiceNumber = `INV-${timestamp}-${randomId}`;

        console.log(`📄 Generated invoice number: ${invoiceNumber}`);

        // ✅ Create payment with enhanced data structure
        const payment = new Payment({
          paymentMethod: method,
          amount: parseFloat(amount),
          status: "pending",
          travelScheduleId: travelScheduleId || null,
          bookingId: bookingId || null,
          userId,
          invoiceDetails: {
            invoiceNumber,
            dateIssued: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await payment.save();
        console.log(`✅ Payment saved successfully: ${payment._id}`);

        // ✅ Transform and validate result
        const transformed = transformPayment(payment);
        if (!transformed) {
          throw new Error("Failed to transform payment data after saving");
        }

        return transformed;
      } catch (error) {
        console.error("❌ Error processing payment:", error);
        throw new Error(`Failed to process payment: ${error.message}`);
      }
    },

    updatePaymentStatus: async (_, { paymentId, status }) => {
      try {
        console.log(`🔄 Updating payment ${paymentId} status to ${status}`);

        // ✅ Enhanced validation
        const validStatuses = [
          "pending",
          "processing",
          "completed",
          "failed",
          "refunded",
        ];
        if (!validStatuses.includes(status)) {
          throw new Error(
            `Invalid status '${status}'. Must be one of: ${validStatuses.join(
              ", "
            )}`
          );
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error(`Payment with id ${paymentId} not found`);
        }

        const oldStatus = payment.status;

        // ✅ Status transition validation
        if (oldStatus === status) {
          console.log(`⚠️ Payment ${paymentId} already has status ${status}`);
          return {
            id: payment._id.toString(),
            paymentId: payment._id.toString(),
            status: payment.status,
            message: `Payment status is already ${status}`,
            payment: transformPayment(payment),
          };
        }

        // ✅ Update payment
        payment.status = status;
        payment.updatedAt = new Date();

        if (status === "completed") {
          payment.paidAt = new Date();
        }

        const updatedPayment = await payment.save();
        console.log(
          `✅ Payment ${paymentId} status updated from ${oldStatus} to ${status}`
        );

        // ✅ Update booking status dengan proper error handling
        if (status === "completed" && payment.bookingId) {
          console.log(
            `🔄 Updating booking ${payment.bookingId} payment status`
          );

          const bookingUpdateResult = await updateBookingPaymentStatus(
            payment.bookingId,
            "PAID"
          );

          if (bookingUpdateResult) {
            console.log("✅ Booking payment status updated successfully");
          } else {
            console.warn(
              "⚠️ Failed to update booking payment status, but payment update succeeded"
            );
          }
        }

        // ✅ Transform and return result
        const transformed = transformPayment(updatedPayment);
        if (!transformed) {
          throw new Error("Failed to transform updated payment data");
        }

        return {
          id: updatedPayment._id.toString(),
          paymentId: updatedPayment._id.toString(),
          status: updatedPayment.status,
          message: `Payment status successfully updated from ${oldStatus} to ${status}`,
          payment: transformed,
        };
      } catch (error) {
        console.error("❌ Error updating payment status:", error);
        throw new Error(`Failed to update payment status: ${error.message}`);
      }
    },

    generateInvoice: async (_, { paymentId }) => {
      try {
        console.log(`🧾 Generating invoice for payment: ${paymentId}`);

        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error(`Payment with id ${paymentId} not found`);
        }

        if (!payment.invoiceDetails || !payment.invoiceDetails.invoiceNumber) {
          throw new Error("Payment does not have valid invoice details");
        }

        return {
          invoiceNumber: payment.invoiceDetails.invoiceNumber,
          dateIssued: payment.invoiceDetails.dateIssued.toISOString(),
          dueDate: payment.invoiceDetails.dueDate.toISOString(),
          amount: payment.amount,
          status: payment.status,
          paymentId: payment._id.toString(),
          customerInfo: {
            userId: payment.userId,
            bookingId: payment.bookingId,
            travelScheduleId: payment.travelScheduleId,
          },
        };
      } catch (error) {
        console.error("❌ Error generating invoice:", error);
        throw new Error(`Failed to generate invoice: ${error.message}`);
      }
    },

    processRefund: async (_, { paymentId, amount }) => {
      try {
        console.log(`💰 Processing refund for payment: ${paymentId}`);

        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error(`Payment with id ${paymentId} not found`);
        }

        if (payment.status !== "completed") {
          throw new Error(
            `Cannot refund payment with status '${payment.status}'. Only completed payments can be refunded.`
          );
        }

        const refundAmount = amount || payment.amount;

        if (refundAmount <= 0 || refundAmount > payment.amount) {
          throw new Error(
            `Invalid refund amount. Must be between 0 and ${payment.amount}`
          );
        }

        // ✅ Update payment for refund
        payment.status = "refunded";
        payment.refundAmount = refundAmount;
        payment.refundedAt = new Date();
        payment.updatedAt = new Date();

        const refundedPayment = await payment.save();
        console.log(
          `✅ Payment ${paymentId} refunded with amount ${refundAmount}`
        );

        // ✅ Update booking status if applicable
        if (payment.bookingId) {
          console.log(
            `🔄 Updating booking ${payment.bookingId} status for refund`
          );
          await updateBookingPaymentStatus(payment.bookingId, "REFUNDED");
        }

        const transformed = transformPayment(refundedPayment);
        if (!transformed) {
          throw new Error("Failed to transform refunded payment data");
        }

        return transformed;
      } catch (error) {
        console.error("❌ Error processing refund:", error);
        throw new Error(`Failed to process refund: ${error.message}`);
      }
    },

    // ✅ ADD: Complete payment mutation to payment service resolvers
    completePayment: async (_, { paymentId }) => {
      try {
        console.log(`🔄 Manually completing payment: ${paymentId}`);

        const payment = await Payment.findById(paymentId);
        if (!payment) {
          throw new Error(`Payment with id ${paymentId} not found`);
        }

        if (payment.status === "completed") {
          console.log(`⚠️ Payment ${paymentId} is already completed`);
          return transformPayment(payment);
        }

        if (payment.status !== "pending") {
          throw new Error(
            `Cannot complete payment with status '${payment.status}'. Only pending payments can be completed.`
          );
        }

        // ✅ Update payment to completed
        payment.status = "completed";
        payment.updatedAt = new Date();
        payment.paidAt = new Date();

        const updatedPayment = await payment.save();
        console.log(`✅ Payment ${paymentId} completed successfully`);

        // ✅ Update booking status
        if (payment.bookingId) {
          console.log(`🔄 Updating booking ${payment.bookingId} payment status`);

          const bookingUpdateResult = await updateBookingPaymentStatus(
            payment.bookingId,
            "PAID"
          );

          if (bookingUpdateResult) {
            console.log("✅ Booking payment status updated to PAID");
          } else {
            console.warn(
              "⚠️ Failed to update booking status, but payment completed"
            );
          }
        }

        // ✅ Transform and return result
        const transformed = transformPayment(updatedPayment);
        if (!transformed) {
          throw new Error("Failed to transform completed payment data");
        }

        return transformed;
      } catch (error) {
        console.error("❌ Error completing payment:", error);
        throw new Error(`Failed to complete payment: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;
