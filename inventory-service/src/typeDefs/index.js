const { gql } = require('apollo-server-express');

const typeDefs = gql`
type Availability {
  available: Boolean!
  message: String!
}

input ReservationInput {
  tourId: ID! 
  date: String!
  participants: Int!
}

type Reservation {
  success: Boolean!
  message: String!
}

type InventoryStatus {
  tourId: ID!
  date: String!
  slotsLeft: Int!
  hotelAvailable: Boolean!
  transportAvailable: Boolean!
}

input InventoryUpdateInput {
  tourId: ID!
  date: String!
  slots: Int
  hotelAvailable: Boolean
  transportAvailable: Boolean
}

type Inventory {
  tourId: ID!
  date: String!
  slots: Int!
  hotelAvailable: Boolean!
  transportAvailable: Boolean!
}

type DeleteResponse {
  success: Boolean!
  message: String!
}

type Query {
  checkAvailability(tourId: ID!, date: String!, participants: Int!): Availability
  getInventoryStatus(tourId: ID!): [InventoryStatus]
}

type Mutation {
  reserveSlots(input: ReservationInput!): Reservation
  updateInventory(input: InventoryUpdateInput!): Inventory
  deleteTour(tourId: ID!): DeleteResponse
}
`;

module.exports = typeDefs;
