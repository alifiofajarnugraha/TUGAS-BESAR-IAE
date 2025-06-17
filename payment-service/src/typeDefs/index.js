const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Payment {
    id: ID!
    amount: Float!
    method: String!
    status: String!
    invoiceNumber: String!
    createdAt: String!
    updatedAt: String!
    travelScheduleId: String
    bookingId: String
    userId: String
  }

  type PaymentStatus {
    id: ID!
    paymentId: ID!
    status: String!
    message: String!
    payment: Payment!
  }

  # Response untuk service external
  type TravelSchedulePaymentStatus {
    travelScheduleId: String!
    isPaid: Boolean!
    paymentStatus: String!
    paymentId: String
    amount: Float
    paidAt: String
  }

  input PaymentInput {
    method: String!
    amount: Float!
    travelScheduleId: String
    bookingId: String
    userId: String
  }

  type Query {
    getPaymentStatus(paymentId: ID!): Payment
    listPayments: [Payment]
    # Endpoint untuk service external
    getTravelSchedulePaymentStatus(
      travelScheduleId: String!
    ): TravelSchedulePaymentStatus
    getPaymentsByTravelSchedule(travelScheduleId: String!): [Payment]
    # Endpoint untuk booking service
    getPaymentsByBooking(bookingId: String!): [Payment]
  }

  type Mutation {
    processPayment(input: PaymentInput!): Payment
    updatePaymentStatus(paymentId: ID!, status: String!): PaymentStatus
    generateInvoice(paymentId: ID!): String
  }
`;

module.exports = typeDefs;
