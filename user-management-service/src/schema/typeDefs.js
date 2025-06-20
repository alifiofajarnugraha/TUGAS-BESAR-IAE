const { gql } = require("graphql-tag");

module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    phone: String # ✅ Add phone field
    address: String # ✅ Add address field
    createdAt: String # ✅ Add timestamps
    updatedAt: String
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    role: String # ✅ Make role optional (defaults to "customer")
    phone: String # ✅ Add phone input
    address: String # ✅ Add address input
  }

  input UserUpdateInput {
    name: String
    email: String
    password: String # ✅ Add password update (will be hashed)
    role: String # ✅ Only admin can update this
    phone: String # ✅ Add phone update
    address: String # ✅ Add address update
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ✅ Add response type for change password
  type ChangePasswordResponse {
    success: Boolean!
    message: String!
  }

  # ✅ Add response type for generic operations
  type OperationResponse {
    success: Boolean!
    message: String!
  }

  # ✅ Add user statistics type for admin dashboard
  type UserStats {
    totalUsers: Int!
    totalCustomers: Int!
    totalAgents: Int!
    totalAdmins: Int!
    recentRegistrations: Int!
  }

  type Query {
    getUser(id: ID!): User
    users: [User!]!
    getCurrentUser: User

    # ✅ Add admin-only queries
    getUserStats: UserStats
    getUsersByRole(role: String!): [User!]!
    searchUsers(query: String!): [User!]!
  }

  type Mutation {
    createUser(input: UserInput!): User
    updateUserProfile(id: ID!, input: UserUpdateInput!): User
    authenticateUser(email: String!, password: String!): AuthPayload

    # ✅ Add change password mutation
    changePassword(
      currentPassword: String!
      newPassword: String!
    ): ChangePasswordResponse

    # ✅ Add admin-only mutations
    deleteUser(id: ID!): OperationResponse
    resetUserPassword(id: ID!, newPassword: String!): OperationResponse
    toggleUserStatus(id: ID!): User
  }
`;
