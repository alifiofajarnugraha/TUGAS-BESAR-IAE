// src/typeDefs/index.js
// Definisi schema GraphQL dasar untuk Tour Package Service

const { gql } = require("graphql-tag");

const typeDefs = gql`
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
    createdAt: String
    updatedAt: String
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
    maxParticipants: Int!
    inclusions: [String]
    exclusions: [String]
    itinerary: [ItineraryDayInput]
    images: [String]
    status: String
  }

  type Query {
    getTourPackages: [TourPackage!]!
    getTourPackage(id: ID!): TourPackage
    getTourPackagesByCategory(category: String!): [TourPackage!]!
    searchTourPackages(keyword: String!): [TourPackage!]!
  }

  type Mutation {
    createTourPackage(input: TourPackageInput!): TourPackage!
    updateTourPackage(id: ID!, input: TourPackageInput!): TourPackage!
    deleteTourPackage(id: ID!): TourPackage
    updateTourStatus(id: ID!, status: String!): TourPackage!
  }
`;

module.exports = typeDefs;
