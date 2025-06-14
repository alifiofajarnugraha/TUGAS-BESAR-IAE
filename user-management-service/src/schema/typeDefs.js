const { gql } = require("graphql-tag"); // Gunakan graphql-tag sebagai gantinya

module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    role: String!
  }

  input UserUpdateInput {
    name: String
    email: String
    role: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    getUser(id: ID!): User
    users: [User!]!
    getCurrentUser: User
  }

  type Mutation {
    createUser(input: UserInput!): User
    updateUserProfile(id: ID!, input: UserUpdateInput!): User
    authenticateUser(email: String!, password: String!): AuthPayload
  }
`;
