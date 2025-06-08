const { gql } = require("graphql-tag");

const typeDefs = gql`
  type AvailabilityCheck {
    available: Boolean!
    message: String!
  }

  type InventoryStatus {
    tourId: String!
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
    tourId: String!
    date: String!
    slots: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
    createdAt: String
    updatedAt: String
  }

  input ReservationInput {
    tourId: String!
    date: String!
    participants: Int!
  }

  input InventoryInput {
    tourId: String!
    date: String!
    slots: Int
    hotelAvailable: Boolean
    transportAvailable: Boolean
  }

  type Query {
    checkAvailability(
      tourId: String!
      date: String!
      participants: Int!
    ): AvailabilityCheck!
    getInventoryStatus(tourId: String!): [InventoryStatus!]!
    getAllInventory: [Inventory!]!
  }

  type Mutation {
    reserveSlots(input: ReservationInput!): ReservationResult!
    updateInventory(input: InventoryInput!): Inventory!
    deleteTour(tourId: String!): DeleteResult!
  }
`;

module.exports = typeDefs;
