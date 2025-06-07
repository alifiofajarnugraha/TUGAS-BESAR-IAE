const Payment = require("../models/Payment");

module.exports = {
  Query: {
    getPaymentStatus: async (_, { paymentId }) => {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }
      return payment;
    },
    listPayments: async () => {
      return await Payment.find();
    },
  },

  Mutation: {
    processPayment: async (_, { input }) => {
      const { method, amount } = input;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      const payment = new Payment({
        paymentMethod: method, // Changed from method to paymentMethod
        amount,
        status: "pending", // Changed from 'Pending' to 'pending'
        invoiceDetails: {
          invoiceNumber,
          dateIssued: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due date 7 days from now
        },
      });

      await payment.save();

      // Transform response to match GraphQL schema
      return {
        id: payment._id,
        method: payment.paymentMethod,
        amount: payment.amount,
        status: payment.status,
        invoiceNumber: payment.invoiceDetails.invoiceNumber,
        createdAt: payment.invoiceDetails.dateIssued.toISOString(),
        updatedAt: payment.invoiceDetails.dateIssued.toISOString(),
      };
    },

    updatePaymentStatus: async (_, { paymentId, status }) => {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      // Validate status
      const validStatuses = ["pending", "completed", "failed"];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      // Update payment status
      payment.status = status;
      const updatedPayment = await payment.save();

      // Create proper response matching schema
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
        },
      };

      // Log response for debugging
      console.log("Response:", JSON.stringify(response, null, 2));

      return response;
    },

    generateInvoice: async (_, { paymentId }) => {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      // Basic invoice format
      const invoice = `
        Invoice Number: ${payment.invoiceDetails.invoiceNumber}
        Date: ${payment.invoiceDetails.dateIssued}
        Due Date: ${payment.invoiceDetails.dueDate}
        Amount: $${payment.amount}
        Method: ${payment.paymentMethod}
        Status: ${payment.status}
      `;

      return invoice;
    },
  },
};
