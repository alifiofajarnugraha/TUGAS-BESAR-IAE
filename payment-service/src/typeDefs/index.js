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
  }

  type PaymentStatus {
    id: ID!
    paymentId: ID!
    status: String!
    message: String!
    payment: Payment!
  }

  input PaymentInput {
    method: String!
    amount: Float!
  }

  type Query {
    getPaymentStatus(paymentId: ID!): Payment
    listPayments: [Payment]
  }

  type Mutation {
    processPayment(input: PaymentInput!): Payment
    updatePaymentStatus(paymentId: ID!, status: String!): PaymentStatus
    generateInvoice(paymentId: ID!): String
  }
`;

module.exports = typeDefs;
