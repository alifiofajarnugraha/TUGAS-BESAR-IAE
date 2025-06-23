// src/typeDefs/index.js
// Definisi schema GraphQL dasar untuk Tour Package Service

const { gql } = require("graphql-tag");

const typeDefs = gql`
  scalar Date

  enum TourStatus {
    active
    inactive
    draft
  }

  type Location {
    city: String!
    province: String!
    country: String!
    meetingPoint: String
  }

  type Duration {
    days: Int!
    nights: Int!
  }

  type Price {
    amount: Float!
    currency: String!
  }

  # ✅ Inventory types from inventory-service
  type InventoryStatus {
    tourId: String!
    date: String!
    slotsAvailable: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
  }

  type AvailabilityCheck {
    available: Boolean!
    message: String!
    slotsLeft: Int
    hotelAvailable: Boolean
    transportAvailable: Boolean
  }

  type TravelSchedule {
    id: ID!
    origin: String!
    destination: String!
    departureTime: String!
    arrivalTime: String!
    price: Float!
    seatsAvailable: Int!
    vehicleType: String!
  }

  type TourPackage {
    id: ID!
    name: String!
    category: String!
    shortDescription: String!
    longDescription: String
    location: Location!
    duration: Duration!
    price: Price!
    # ❌ REMOVED: maxParticipants, defaultSlots, hotelRequired, transportRequired
    inclusions: [String]
    exclusions: [String]
    itinerary: [ItineraryDay]
    images: [String]
    status: String!
    createdAt: String
    updatedAt: String
    # ✅ Inventory integration fields
    inventoryStatus: [InventoryStatus]
    isAvailable: Boolean
    availableDates: [String]
    # ✅ Travel integration fields
    travelOptions: [TravelSchedule]
  }

  type ItineraryDay {
    day: Int!
    title: String!
    description: String!
    activities: [String!]!
  }

  input LocationInput {
    city: String!
    province: String!
    country: String!
    meetingPoint: String
  }

  input DurationInput {
    days: Int!
    nights: Int!
  }

  input PriceInput {
    amount: Float!
    currency: String!
  }

  input ItineraryDayInput {
    day: Int!
    title: String!
    description: String!
    activities: [String!]!
  }

  input TourPackageInput {
    name: String!
    category: String!
    shortDescription: String!
    longDescription: String
    location: LocationInput!
    duration: DurationInput!
    price: PriceInput!
    # ❌ REMOVED: maxParticipants, defaultSlots, hotelRequired, transportRequired
    inclusions: [String]
    exclusions: [String]
    itinerary: [ItineraryDayInput]
    images: [String]
    status: String
  }

  # ✅ Inventory management inputs
  input InventoryInput {
    tourId: ID!
    date: String!
    slots: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
  }

  type InventoryResult {
    success: Boolean!
    message: String!
  }

  # ✅ NEW: Range-based inventory management (proxy to inventory-service)
  input InventoryRangeInput {
    tourId: ID!
    startDate: String!
    endDate: String!
    slots: Int!
    hotelAvailable: Boolean!
    transportAvailable: Boolean!
    skipDays: [Int!]
    skipDates: [String!]
  }

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
    # ✅ Basic tour queries
    getTourPackages: [TourPackage!]!
    getTourPackage(id: ID!): TourPackage
    getTourPackagesByCategory(category: String!): [TourPackage!]!
    searchTourPackages(keyword: String!): [TourPackage!]!

    # ✅ Inventory-integrated queries
    getTourWithInventory(id: ID!): TourPackage
    getAvailableTours(date: String!, participants: Int!): [TourPackage!]!
    checkTourAvailability(
      tourId: ID!
      date: String!
      participants: Int!
    ): AvailabilityCheck!
    getTourInventoryStatus(tourId: ID!): [InventoryStatus!]!

    # ✅ FIXED: Travel integration queries
    getTourWithTravel(id: ID!, origin: String): TourPackage
    getAvailableTravelOptions(
      origin: String!
      destination: String!
    ): [TravelSchedule!]!
    getAllTravelSchedules: [TravelSchedule!]! # ✅ ADD
  }

  type Mutation {
    # ✅ Basic tour mutations
    createTourPackage(input: TourPackageInput!): TourPackage!
    updateTourPackage(id: ID!, input: TourPackageInput!): TourPackage!
    deleteTourPackage(id: ID!): TourPackage
    updateTourStatus(id: ID!, status: String!): TourPackage!

    # ✅ Inventory management mutations (proxy to inventory-service)
    createTourInventory(input: InventoryInput!): InventoryResult!
    updateTourInventory(input: InventoryInput!): InventoryResult!
    deleteTourInventory(tourId: ID!, date: String): InventoryResult!
    initializeTourInventory(
      tourId: ID!
      dates: [String!]!
      defaultSlots: Int!
    ): InventoryResult!

    # ✅ NEW: Range-based inventory management (proxy to inventory-service)
    initializeTourInventoryRange(
      input: InventoryRangeInput!
    ): RangeInitializationResult!

    updateTourInventoryRange(
      input: InventoryRangeInput!
    ): RangeInitializationResult!
  }
`;

module.exports = typeDefs;
