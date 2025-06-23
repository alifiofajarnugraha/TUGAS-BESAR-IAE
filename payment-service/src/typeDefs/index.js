const typeDefs = `
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

  type PaymentUpdateResponse {
    id: ID!
    paymentId: ID!
    status: String!
    message: String!
    payment: Payment!
  }

  type Invoice {
    invoiceNumber: String!
    dateIssued: String!
    dueDate: String!
    amount: Float!
    status: String!
    paymentId: String!
    customerInfo: CustomerInfo
  }

  type CustomerInfo {
    userId: String!
    bookingId: String
    travelScheduleId: String
  }

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
    getPayment(id: ID!): Payment
    getPaymentStatus(paymentId: ID!): Payment
    listPayments: [Payment!]!
    getTravelSchedulePaymentStatus(travelScheduleId: String!): TravelSchedulePaymentStatus
    getPaymentsByTravelSchedule(travelScheduleId: String!): [Payment!]!
    getPaymentsByBooking(bookingId: String!): [Payment!]!
    getInvoice(invoiceNumber: String!): Invoice
    getInvoiceByPayment(paymentId: ID!): Invoice
  }

  type Mutation {
    processPayment(input: PaymentInput!): Payment!
    completePayment(paymentId: ID!): Payment!
    updatePaymentStatus(paymentId: ID!, status: String!): PaymentUpdateResponse!
    generateInvoice(paymentId: ID!): Invoice!
    processRefund(paymentId: ID!, amount: Float): Payment!
  }
`;

module.exports = typeDefs;
