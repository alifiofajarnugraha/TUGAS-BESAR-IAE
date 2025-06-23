import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// ✅ Service URLs - Updated untuk production dan development
const SERVICES = {
  USER:
    process.env.NODE_ENV === "production"
      ? "http://user-service:3001/graphql"
      : "http://localhost:3001/graphql",
  TOUR:
    process.env.NODE_ENV === "production"
      ? "http://tour-service:3002/graphql"
      : "http://localhost:3002/graphql",
  BOOKING:
    process.env.NODE_ENV === "production"
      ? "http://booking-service:3003/graphql"
      : "http://localhost:3003/graphql",
  PAYMENT:
    process.env.NODE_ENV === "production"
      ? "http://payment-service:3004/graphql"
      : "http://localhost:3004/graphql",
  INVENTORY:
    process.env.NODE_ENV === "production"
      ? "http://inventory-service:3005/graphql"
      : "http://localhost:3005/graphql",
};

// ✅ Enhanced Apollo Client creator
const createClient = (uri, serviceName) => {
  const httpLink = createHttpLink({
    uri,
    credentials: "same-origin",
    fetchOptions: {
      timeout: 30000, // Increased timeout for range operations
    },
  });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        token: token || "", // Some services expect 'token' header
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Travel-Agent-Frontend/1.0",
      },
    };
  });

  // Enhanced error handling
  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
          console.error(`[GraphQL error - ${serviceName}]:`, {
            message,
            locations,
            path,
            code: extensions?.code,
          });

          // Handle specific error codes
          if (extensions?.code === "UNAUTHENTICATED") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        });
      }

      if (networkError) {
        console.error(`[Network error - ${serviceName}]:`, {
          message: networkError.message,
          statusCode: networkError.statusCode,
          operation: operation.operationName,
          uri,
        });

        // Retry logic for network errors
        if (
          networkError.statusCode === 0 ||
          networkError.code === "NETWORK_ERROR" ||
          networkError.name === "ServerError"
        ) {
          console.log(`Retrying ${serviceName} request...`);
          return forward(operation);
        }
      }
    }
  );

  return new ApolloClient({
    link: errorLink.concat(authLink.concat(httpLink)),
    cache: new InMemoryCache({
      typePolicies: {
        TourPackage: {
          keyFields: ["id"],
          fields: {
            inventoryStatus: {
              merge: false,
            },
          },
        },
        Booking: {
          keyFields: ["id"],
        },
        Payment: {
          keyFields: ["id"],
        },
        Inventory: {
          keyFields: ["tourId", "date"],
        },
        User: {
          keyFields: ["id"],
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        errorPolicy: "all",
        notifyOnNetworkStatusChange: true,
      },
      query: {
        fetchPolicy: "cache-first",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
        fetchPolicy: "no-cache",
      },
    },
    connectToDevTools: process.env.NODE_ENV === "development",
  });
};

// ✅ Service client creation (NON-EXPORTED)
const userService = createClient(SERVICES.USER, "UserService");
const tourService = createClient(SERVICES.TOUR, "TourService");
const bookingService = createClient(SERVICES.BOOKING, "BookingService");
const paymentService = createClient(SERVICES.PAYMENT, "PaymentService");
const inventoryService = createClient(SERVICES.INVENTORY, "InventoryService");

// ✅ Connection test functions
export const testServiceConnections = async () => {
  const results = {};

  try {
    // Test User Service
    const userResult = await userService.query({
      query: gql`
        query TestUserService {
          __typename
        }
      `,
      fetchPolicy: "no-cache",
    });
    results.userService = { status: "✅ Connected", data: userResult };
  } catch (error) {
    results.userService = { status: "❌ Failed", error: error.message };
  }

  try {
    // Test Tour Service
    const tourResult = await tourService.query({
      query: gql`
        query TestTourService {
          getTourPackages {
            id
            name
          }
        }
      `,
      fetchPolicy: "no-cache",
    });
    results.tourService = { status: "✅ Connected", data: tourResult.data };
  } catch (error) {
    results.tourService = { status: "❌ Failed", error: error.message };
  }

  try {
    // Test Inventory Service
    const inventoryResult = await inventoryService.query({
      query: gql`
        query TestInventoryService {
          __typename
        }
      `,
      fetchPolicy: "no-cache",
    });
    results.inventoryService = {
      status: "✅ Connected",
      data: inventoryResult,
    };
  } catch (error) {
    results.inventoryService = { status: "❌ Failed", error: error.message };
  }

  console.log("Service Connection Test Results:", results);
  return results;
};

// ✅ FIXED: Updated GraphQL Queries tanpa removed fields
export const QUERIES = {
  // User Management Queries
  GET_CURRENT_USER: gql`
    query GetCurrentUser {
      getCurrentUser {
        id
        name
        email
        role
        createdAt
        updatedAt
      }
    }
  `,

  GET_ALL_USERS: gql`
    query GetAllUsers {
      getAllUsers {
        id
        name
        email
        role
        createdAt
        updatedAt
      }
    }
  `,

  // ✅ FIXED: Tour Package Queries - Removed maxParticipants, defaultSlots, hotelRequired, transportRequired
  GET_TOUR_PACKAGES: gql`
    query GetTourPackages {
      getTourPackages {
        id
        name
        category
        shortDescription
        longDescription
        location {
          city
          province
          country
          meetingPoint
        }
        duration {
          days
          nights
        }
        price {
          amount
          currency
        }
        inclusions
        exclusions
        itinerary {
          day
          title
          description
          activities
        }
        images
        status
        createdAt
        updatedAt
      }
    }
  `,

  GET_TOUR_PACKAGE: gql`
    query GetTourPackage($id: ID!) {
      getTourPackage(id: $id) {
        id
        name
        category
        shortDescription
        longDescription
        location {
          city
          province
          country
          meetingPoint
        }
        duration {
          days
          nights
        }
        price {
          amount
          currency
        }
        inclusions
        exclusions
        itinerary {
          day
          title
          description
          activities
        }
        images
        status
        createdAt
        updatedAt
      }
    }
  `,

  // ✅ NEW: Get tour with inventory data - Updated schema
  GET_TOUR_WITH_INVENTORY: gql`
    query GetTourWithInventory($id: ID!) {
      getTourWithInventory(id: $id) {
        id
        name
        category
        shortDescription
        longDescription
        location {
          city
          province
          country
          meetingPoint
        }
        duration {
          days
          nights
        }
        price {
          amount
          currency
        }
        inclusions
        exclusions
        itinerary {
          day
          title
          description
          activities
        }
        images
        status
        isAvailable
        availableDates
        inventoryStatus {
          tourId
          date
          slotsAvailable
          hotelAvailable
          transportAvailable
        }
      }
    }
  `,

  SEARCH_TOUR_PACKAGES: gql`
    query SearchTourPackages($searchTerm: String!) {
      searchTourPackages(searchTerm: $searchTerm) {
        id
        name
        category
        shortDescription
        location {
          city
          province
          country
        }
        price {
          amount
          currency
        }
        images
        status
      }
    }
  `,

  GET_TOURS_BY_CATEGORY: gql`
    query GetToursByCategory($category: String!) {
      getToursByCategory(category: $category) {
        id
        name
        shortDescription
        location {
          city
          province
          country
        }
        price {
          amount
          currency
        }
        images
        status
      }
    }
  `,

  // Inventory Queries - Updated sesuai dengan inventory service
  CHECK_AVAILABILITY: gql`
    query CheckAvailability($tourId: ID!, $date: String!, $participants: Int!) {
      checkAvailability(
        tourId: $tourId
        date: $date
        participants: $participants
      ) {
        available
        message
        slotsLeft
        hotelAvailable
        transportAvailable
      }
    }
  `,

  GET_INVENTORY_STATUS: gql`
    query GetInventoryStatus($tourId: ID!) {
      getInventoryStatus(tourId: $tourId) {
        tourId
        date
        slotsLeft
        hotelAvailable
        transportAvailable
      }
    }
  `,

  GET_ALL_INVENTORY: gql`
    query GetAllInventory($filter: InventoryFilterInput) {
      getAllInventory(filter: $filter) {
        id
        tourId
        date
        slots
        hotelAvailable
        transportAvailable
        createdAt
        updatedAt
      }
    }
  `,

  GET_AVAILABLE_TOURS_ON_DATE: gql`
    query GetAvailableToursOnDate($date: String!, $minSlots: Int) {
      getAvailableToursOnDate(date: $date, minSlots: $minSlots) {
        tourId
        date
        slotsLeft
        hotelAvailable
        transportAvailable
      }
    }
  `,

  GET_TOUR_AVAILABILITY_RANGE: gql`
    query GetTourAvailabilityRange(
      $tourId: ID!
      $startDate: String!
      $endDate: String!
    ) {
      getTourAvailabilityRange(
        tourId: $tourId
        startDate: $startDate
        endDate: $endDate
      ) {
        tourId
        date
        slotsLeft
        hotelAvailable
        transportAvailable
      }
    }
  `,

  // ✅ FIX: PREVIEW_INVENTORY_RANGE should be a Query, not Mutation
  PREVIEW_INVENTORY_RANGE: gql`
    query PreviewInventoryRange(
      $startDate: String!
      $endDate: String!
      $skipDays: [Int!]
      $skipDates: [String!]
    ) {
      previewInventoryRange(
        startDate: $startDate
        endDate: $endDate
        skipDays: $skipDays
        skipDates: $skipDates
      )
    }
  `,

  // Booking Queries - Updated sesuai dengan booking service
  GET_USER_BOOKINGS: gql`
    query GetUserBookings($userId: ID!) {
      getUserBookings(userId: $userId) {
        id
        userId
        tourId
        status
        departureDate
        participants
        totalCost
        bookingDate
        notes
        paymentStatus
        createdAt
        updatedAt
      }
    }
  `,

  GET_BOOKING: gql`
    query GetBooking($id: ID!) {
      getBooking(id: $id) {
        id
        userId
        tourId
        status
        departureDate
        participants
        totalCost
        bookingDate
        notes
        paymentStatus
        createdAt
        updatedAt
      }
    }
  `,

  GET_ALL_BOOKINGS: gql`
    query GetAllBookings {
      getAllBookings {
        id
        userId
        tourId
        status
        departureDate
        participants
        totalCost
        bookingDate
        paymentStatus
        createdAt
        updatedAt
      }
    }
  `,

  // ✅ FIXED: Calculate booking cost query yang match dengan resolver
  CALCULATE_BOOKING_COST: gql`
    query CalculateBookingCost(
      $tourId: ID!
      $participants: Int!
      $departureDate: String!
    ) {
      calculateBookingCost(
        tourId: $tourId
        participants: $participants
        departureDate: $departureDate
      ) {
        basePrice
        participants
        subtotal
        tax
        discount
        totalCost
        breakdown {
          item
          amount
          quantity
        }
      }
    }
  `,

  // Payment Queries - Updated sesuai dengan payment service
  GET_PAYMENT: gql`
    query GetPayment($id: ID!) {
      getPayment(id: $id) {
        id
        method # ✅ FIXED: method instead of paymentMethod
        amount
        status
        invoiceNumber # ✅ FIXED: invoiceNumber instead of nested invoiceDetails
        bookingId
        userId
        createdAt
        updatedAt
      }
    }
  `,

  GET_PAYMENTS_BY_BOOKING: gql`
    query GetPaymentsByBooking($bookingId: String!) {
      getPaymentsByBooking(bookingId: $bookingId) {
        id
        method # ✅ FIXED
        amount
        status
        invoiceNumber # ✅ FIXED
        bookingId
        userId
        createdAt
        updatedAt
      }
    }
  `,

  LIST_PAYMENTS: gql`
    query ListPayments {
      listPayments {
        id
        method # ✅ FIXED
        amount
        status
        invoiceNumber # ✅ FIXED
        bookingId
        userId
        travelScheduleId
        createdAt
        updatedAt
      }
    }
  `,

  // ... other queries remain same
};

// ✅ Updated GraphQL Mutations
export const MUTATIONS = {
  // User Management Mutations
  LOGIN: gql`
    mutation Login($email: String!, $password: String!) {
      authenticateUser(email: $email, password: $password) {
        token
        user {
          id
          name
          email
          role
          createdAt
        }
      }
    }
  `,

  REGISTER: gql`
    mutation Register($input: UserInput!) {
      createUser(input: $input) {
        id
        name
        email
        role
        createdAt
      }
    }
  `,

  UPDATE_USER_PROFILE: gql`
    mutation UpdateUserProfile($id: ID!, $input: UserUpdateInput!) {
      updateUserProfile(id: $id, input: $input) {
        id
        name
        email
        role
        updatedAt
      }
    }
  `,

  CHANGE_PASSWORD: gql`
    mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
      changePassword(
        currentPassword: $currentPassword
        newPassword: $newPassword
      ) {
        success
        message
      }
    }
  `,

  DELETE_USER: gql`
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id) {
        success
        message
      }
    }
  `,

  // Tour Package Mutations
  CREATE_TOUR_PACKAGE: gql`
    mutation CreateTourPackage($input: TourPackageInput!) {
      createTourPackage(input: $input) {
        id
        name
        category
        shortDescription
        location {
          city
          province
          country
        }
        price {
          amount
          currency
        }
        status
        createdAt
      }
    }
  `,

  UPDATE_TOUR_PACKAGE: gql`
    mutation UpdateTourPackage($id: ID!, $input: TourPackageInput!) {
      updateTourPackage(id: $id, input: $input) {
        id
        name
        category
        shortDescription
        location {
          city
          province
          country
        }
        price {
          amount
          currency
        }
        status
        updatedAt
      }
    }
  `,

  DELETE_TOUR_PACKAGE: gql`
    mutation DeleteTourPackage($id: ID!) {
      deleteTourPackage(id: $id) {
        id
        name
      }
    }
  `,

  // Inventory Mutations - Updated dengan range operations
  UPDATE_INVENTORY: gql`
    mutation UpdateInventory($input: InventoryUpdateInput!) {
      updateInventory(input: $input) {
        id
        tourId
        date
        slots
        hotelAvailable
        transportAvailable
        updatedAt
      }
    }
  `,

  DELETE_INVENTORY: gql`
    mutation DeleteInventory($tourId: ID!, $date: String!) {
      deleteInventory(tourId: $tourId, date: $date) {
        success
        message
        deletedCount
      }
    }
  `,

  CREATE_BULK_INVENTORY: gql`
    mutation CreateBulkInventory($input: BulkInventoryInput!) {
      createBulkInventory(input: $input) {
        success
        message
        deletedCount
      }
    }
  `,

  UPDATE_BULK_INVENTORY: gql`
    mutation UpdateBulkInventory(
      $tourId: ID!
      $updates: [InventoryUpdateInput!]!
    ) {
      updateBulkInventory(tourId: $tourId, updates: $updates) {
        success
        message
        deletedCount
      }
    }
  `,

  // ✅ NEW: Range-based inventory operations
  INITIALIZE_TOUR_INVENTORY_RANGE: gql`
    mutation InitializeTourInventoryRange($input: InventoryRangeInput!) {
      initializeTourInventoryRange(input: $input) {
        success
        message
        totalDays
        createdRecords
        skippedRecords
        errorRecords
        dateRange
        details
      }
    }
  `,

  RESERVE_SLOTS: gql`
    mutation ReserveSlots($input: ReservationInput!) {
      reserveSlots(input: $input) {
        success
        message
        reservationId
        slotsRemaining
      }
    }
  `,

  RELEASE_SLOTS: gql`
    mutation ReleaseSlots($input: ReservationInput!) {
      releaseSlots(input: $input) {
        success
        message
        slotsRemaining
      }
    }
  `,

  DELETE_TOUR_INVENTORY: gql`
    mutation DeleteTourInventory($tourId: ID!) {
      deleteTourInventory(tourId: $tourId) {
        success
        message
        deletedCount
      }
    }
  `,

  INITIALIZE_TOUR_INVENTORY: gql`
    mutation InitializeTourInventory(
      $tourId: ID!
      $dates: [String!]!
      $defaultSlots: Int!
    ) {
      initializeTourInventory(
        tourId: $tourId
        dates: $dates
        defaultSlots: $defaultSlots
      ) {
        success
        message
        deletedCount
      }
    }
  `,

  // Booking Mutations
  CREATE_BOOKING: gql`
    mutation CreateBooking($input: BookingInput!) {
      createBooking(input: $input) {
        id
        userId
        tourId
        status
        departureDate
        participants
        totalCost
        bookingDate
        notes
        paymentStatus
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_BOOKING: gql`
    mutation UpdateBooking($id: ID!, $input: BookingUpdateInput!) {
      updateBooking(id: $id, input: $input) {
        id
        status
        notes
        paymentStatus
        updatedAt
      }
    }
  `,

  CANCEL_BOOKING: gql`
    mutation CancelBooking($id: ID!, $reason: String) {
      cancelBooking(id: $id, reason: $reason) {
        id
        status
        notes
        updatedAt
      }
    }
  `,

  CONFIRM_BOOKING: gql`
    mutation ConfirmBooking($id: ID!) {
      confirmBooking(id: $id) {
        id
        status
        updatedAt
      }
    }
  `,

  // Payment Mutations
  PROCESS_PAYMENT: gql`
    mutation ProcessPayment($input: PaymentInput!) {
      processPayment(input: $input) {
        id
        method
        amount
        status
        invoiceNumber
        bookingId
        userId
        travelScheduleId
        createdAt
        updatedAt
      }
    }
  `,

  // ✅ ADD: Complete payment mutation
  COMPLETE_PAYMENT: gql`
    mutation CompletePayment($paymentId: ID!) {
      completePayment(paymentId: $paymentId) {
        id
        method
        amount
        status
        invoiceNumber
        bookingId
        userId
        travelScheduleId
        createdAt
        updatedAt
      }
    }
  `,
};

// ✅ ADD: apiHelpers implementation
export const apiHelpers = {
  // Mock user management - replace with real authentication later
  getCurrentUser: () => {
    // For now, return mock user
    // TODO: Replace with real authentication system
    return {
      id: "user123",
      email: "demo@example.com",
      name: "Demo User",
      role: "customer",
    };
  },

  // Consistent error handling across the app
  handleMutationError: (error) => {
    console.error("GraphQL Error Details:", error);

    // Network errors
    if (error.networkError) {
      console.error("Network Error:", error.networkError);

      if (error.networkError.statusCode === 400) {
        return "Bad request - please check your input data";
      } else if (error.networkError.statusCode === 401) {
        return "Authentication required - please log in";
      } else if (error.networkError.statusCode === 403) {
        return "Access forbidden - insufficient permissions";
      } else if (error.networkError.statusCode === 404) {
        return "Service not found - please try again later";
      } else if (error.networkError.statusCode >= 500) {
        return "Server error - please try again later";
      }

      return `Network error: ${
        error.networkError.message || "Connection failed"
      }`;
    }

    // GraphQL errors
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      console.error("GraphQL Error:", graphQLError);

      return graphQLError.message || "Server error occurred";
    }

    // Generic error
    if (error.message) {
      return error.message;
    }

    return "An unexpected error occurred";
  },

  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  },

  // Format date
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // Validate form data
  validateBookingData: (data) => {
    const errors = [];

    if (!data.date) {
      errors.push("Departure date is required");
    }

    if (!data.participants || data.participants < 1) {
      errors.push("At least 1 participant is required");
    }

    if (data.participants > 20) {
      errors.push("Maximum 20 participants allowed");
    }

    if (!data.paymentMethod) {
      errors.push("Payment method is required");
    }

    return errors;
  },
};

// ✅ SINGLE EXPORT STATEMENT - Remove any other export statements above
export {
  userService,
  tourService,
  bookingService,
  inventoryService,
  paymentService,
};
