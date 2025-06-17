const Payment = require("../models/Payment");

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
      };
    },

    listPayments: async () => {
      try {
        const payments = await Payment.find();
        console.log("Raw payments from DB:", payments); // Debug log

        const transformedPayments = payments.map((payment) => {
          console.log("Transforming payment:", payment._id); // Debug log
          return {
            id: payment._id,
            method: payment.paymentMethod,
            amount: payment.amount,
            status: payment.status,
            invoiceNumber: payment.invoiceDetails.invoiceNumber,
            createdAt: payment.invoiceDetails.dateIssued.toISOString(),
            updatedAt: payment.invoiceDetails.dateIssued.toISOString(),
          };
        });

        console.log("Transformed payments:", transformedPayments); // Debug log
        return transformedPayments;
      } catch (error) {
        console.error("Error in listPayments:", error);
        throw error;
      }
    },
  },

  Mutation: {
    processPayment: async (_, { input }) => {
      const { method, amount } = input;

      const invoiceNumber = `INV-${Date.now()}`;

      const payment = new Payment({
        paymentMethod: method,
        amount,
        status: "pending",
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
      `;

      return invoice;
    },
  },
};
