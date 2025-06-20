const { gql } = require("graphql-tag");

const typeDefs = gql`
  # ✅ Enhanced types for better integration
  type AvailabilityCheck {
    available: Boolean!
    message: String!
    slotsLeft: Int
    hotelAvailable: Boolean
    transportAvailable: Boolean
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
    slotsRemaining: Int
  }

  type DeleteResult {
    success: Boolean!
    message: String!
    deletedCount: Int
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

  # ✅ Enhanced input types
  input ReservationInput {
    tourId: ID!
    date: String!
    participants: Int!
  }

  input InventoryUpdateInput {
    tourId: ID!
    date: String!
    slots: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
  }

  input InventoryFilterInput {
    tourId: ID
    date: String
    minSlots: Int
    hotelAvailable: Boolean
    transportAvailable: Boolean
  }

  # ✅ Bulk operations input
  input BulkInventoryInput {
    tourId: ID!
    dates: [String!]!
    slots: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
  }

  # ✅ NEW: Range-based inventory input
  input InventoryRangeInput {
    tourId: ID!
    startDate: String!
    endDate: String!
    slots: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
    # ✅ Optional: Skip specific days (0=Sunday, 1=Monday, etc.)
    skipDays: [Int!]
    # ✅ Optional: Skip specific dates
    skipDates: [String!]
  }

  # ✅ Range initialization result
  type RangeInitializationResult {
    success: Boolean!
    message: String!
    totalDays: Int!
    createdRecords: Int!
    skippedRecords: Int!
    errorRecords: Int!
    dateRange: String!
    details: [String!]!
  }

  type Query {
    # ✅ Basic availability checks
    checkAvailability(
      tourId: ID!
      date: String!
      participants: Int!
    ): AvailabilityCheck!

    # ✅ Inventory status queries
    getInventoryStatus(tourId: ID!): [InventoryStatus!]!
    getAllInventory(filter: InventoryFilterInput): [Inventory!]!
    getInventoryByDate(date: String!): [Inventory!]!
    getInventoryByTour(tourId: ID!): [Inventory!]!

    # ✅ Analytics queries
    getAvailableToursOnDate(date: String!, minSlots: Int): [InventoryStatus!]!
    getTourAvailabilityRange(
      tourId: ID!
      startDate: String!
      endDate: String!
    ): [InventoryStatus!]!

    # ✅ NEW: Range preview
    previewInventoryRange(
      startDate: String!
      endDate: String!
      skipDays: [Int!]
      skipDates: [String!]
    ): [String!]!
  }

  type Mutation {
    # ✅ Single inventory operations
    updateInventory(input: InventoryUpdateInput!): Inventory!
    deleteInventory(tourId: ID!, date: String!): DeleteResult!

    # ✅ Bulk operations
    createBulkInventory(input: BulkInventoryInput!): DeleteResult!
    updateBulkInventory(
      tourId: ID!
      updates: [InventoryUpdateInput!]!
    ): DeleteResult!

    # ✅ Reservation operations
    reserveSlots(input: ReservationInput!): ReservationResult!
    releaseSlots(input: ReservationInput!): ReservationResult!

    # ✅ Tour operations
    deleteTour(tourId: ID!): DeleteResult!
    initializeTourInventory(
      tourId: ID!
      dates: [String!]!
      defaultSlots: Int!
    ): DeleteResult!

    # ✅ NEW: Range-based inventory initialization
    initializeTourInventoryRange(
      input: InventoryRangeInput!
    ): RangeInitializationResult!

    # ✅ NEW: Update inventory in range
    updateInventoryRange(
      input: InventoryRangeInput!
    ): RangeInitializationResult!
  }
`;

module.exports = typeDefs;
