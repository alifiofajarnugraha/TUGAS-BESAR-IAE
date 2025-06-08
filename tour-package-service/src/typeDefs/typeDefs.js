// src/typeDefs/index.js
// Definisi schema GraphQL dasar untuk Tour Package Service

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  input TourFilterInput {
    status: String
    city: String
    minPrice: Int
    maxPrice: Int
  }

  input TourPackageInput {
    name: String!
    slug: String!
    short_description: String!
    long_description: String!
    status: String!
    category: String
    location: LocationInput!
    duration: DurationInput!
    price: PriceInput!
    inclusions: [String!]!
    exclusions: [String!]!
    itinerary: [ItineraryInput!]!
    average_rating: Float
    review_count: Int
    availability: [AvailabilityInput!]
    tour_operator_id: String!
  }

  input TourPackageUpdateInput {
    name: String
    slug: String
    short_description: String
    long_description: String
    status: String
    category: String
    location: LocationInput
    duration: DurationInput
    price: PriceInput
    inclusions: [String!]
    exclusions: [String!]
    itinerary: [ItineraryInput!]
    average_rating: Float
    review_count: Int
    availability: [AvailabilityInput!]
    tour_operator_id: String
  }

  input LocationInput {
    city: String!
    province: String!
    country: String!
    meeting_point: String!
  }

  input DurationInput {
    days: Int!
    nights: Int!
  }

  input PriceInput {
    amount: Int!
    currency: String!
    per_pax: Boolean!
  }

  input ItineraryInput {
    day: Int!
    title: String!
    description: String!
    activities: [String!]!
  }

  input AvailabilityInput {
    start_date: String!
    end_date: String!
    slots_available: Int!
  }

  type TourPackage {
    id: ID!
    name: String!
    slug: String!
    short_description: String!
    long_description: String!
    status: String!
    category: String
    location: Location!
    duration: Duration!
    price: Price!
    inclusions: [String!]!
    exclusions: [String!]!
    itinerary: [Itinerary!]!
    average_rating: Float
    review_count: Int
    availability: [Availability!]
    tour_operator_id: String!
  }

  type Location {
    city: String!
    province: String!
    country: String!
    meeting_point: String!
  }

  type Duration {
    days: Int!
    nights: Int!
  }

  type Price {
    amount: Int!
    currency: String!
    per_pax: Boolean!
  }

  type Itinerary {
    day: Int!
    title: String!
    description: String!
    activities: [String!]!
  }

  type Availability {
    start_date: String!
    end_date: String!
    slots_available: Int!
  }

  type Query {
    getTourPackages(filter: TourFilterInput): [TourPackage]
    getTourPackage(id: ID!): TourPackage
  }

  type Mutation {
    createTourPackage(input: TourPackageInput!): TourPackage
    updateTourPackage(id: ID!, input: TourPackageUpdateInput!): TourPackage
  }
`;

module.exports = typeDefs;
