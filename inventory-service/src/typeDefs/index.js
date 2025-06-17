const { gql } = require("graphql-tag");

const typeDefs = gql`
  type AvailabilityCheck {
    available: Boolean!
    message: String!
  }

  type InventoryStatus {
    tourId: ID!
    date: String!
    slotsLeft: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
  }

  type ReservationResult {
    success: Boolean!
    message: String!
    reservationId: String
  }

  type DeleteResult {
    success: Boolean!
    message: String!
  }

  type Inventory {
    id: ID!
    tourId: ID!
    date: String!
    slots: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
    createdAt: String
    updatedAt: String
  }

  input ReservationInput {
    tourId: ID!
    date: String!
    participants: Int!
  }

  input InventoryInput {
    tourId: ID!
    date: String!
    slots: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
  }

  type Query {
    checkAvailability(
      tourId: ID!
      date: String!
      participants: Int!
    ): AvailabilityCheck!

    getInventoryStatus(tourId: ID!): [InventoryStatus!]!
    getAllInventory: [Inventory!]!
  }

  type Mutation {
    reserveSlots(input: ReservationInput!): ReservationResult!
    updateInventory(input: InventoryInput!): Inventory!
    deleteTour(tourId: ID!): DeleteResult!
  }
`;

module.exports = typeDefs;
