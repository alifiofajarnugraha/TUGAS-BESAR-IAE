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

  # Removed AvailableDate type - handled by inventory-service

  type InventoryStatus {
    tourId: String!
    date: String!
    slotsLeft: Int!
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
    maxParticipants: Int!
    inclusions: [String]
    exclusions: [String]
    itinerary: [ItineraryDay]
    images: [String]
    status: String!
    defaultSlots: Int
    hotelRequired: Boolean
    transportRequired: Boolean
    # Removed availableDates - handled by inventory-service
    createdAt: String
    updatedAt: String
    # Fields untuk inventory integration
    inventoryStatus: [InventoryStatus]
    isAvailable: Boolean
    # Field untuk travel integration
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

  # Removed AvailableDateInput - handled by inventory-service

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
    maxParticipants: Int!
    inclusions: [String]
    exclusions: [String]
    itinerary: [ItineraryDayInput]
    images: [String]
    status: String
    defaultSlots: Int
    hotelRequired: Boolean
    transportRequired: Boolean
    # Removed availableDates - handled by inventory-service
  }

  type Query {
    getTourPackages: [TourPackage!]!
    getTourPackage(id: ID!): TourPackage
    getTourPackagesByCategory(category: String!): [TourPackage!]!
    searchTourPackages(keyword: String!): [TourPackage!]!
    # Inventory-related queries
    checkTourAvailability(
      tourId: ID!
      date: Date!
      participants: Int!
    ): AvailabilityCheck!
    getTourInventoryStatus(tourId: ID!): [InventoryStatus!]!
    getAvailableTours(date: String!, participants: Int!): [TourPackage!]!
    # Travel-related queries
    getTravelSchedulesForTour(tourId: ID!): [TravelSchedule!]!
    getAvailableTravelOptions(
      origin: String!
      destination: String!
    ): [TravelSchedule!]!
    getTourPackageWithTravel(id: ID!, origin: String): TourPackage
  }

  type Mutation {
    createTourPackage(input: TourPackageInput!): TourPackage!
    updateTourPackage(id: ID!, input: TourPackageInput!): TourPackage!
    deleteTourPackage(id: ID!): TourPackage
    updateTourStatus(id: ID!, status: String!): TourPackage!
    # Inventory-related mutations - these will call inventory-service
    initializeTourInventory(
      tourId: ID!
      dates: [String!]!
      defaultSlots: Int!
    ): Boolean!
    updateTourInventory(
      tourId: ID!
      date: Date!
      slots: Int!
      hotelAvailable: Boolean
      transportAvailable: Boolean
    ): Boolean!
  }
`;

module.exports = typeDefs;
