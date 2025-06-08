import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error"; // Tambahkan import ini

// Service URLs
const SERVICES = {
  USER: "http://localhost:3001/graphql",
  TOUR: "http://localhost:3002/graphql",
  BOOKING: "http://localhost:3003/graphql",
  PAYMENT: "http://localhost:3004/graphql",
  INVENTORY: "http://localhost:3005/graphql",
};

// Create Apollo clients for each service
const createClient = (uri) => {
  const httpLink = createHttpLink({
    uri,
    credentials: "include",
    // Tambahkan fetch options untuk debugging
    fetchOptions: {
      timeout: 15000, // 15 second timeout
    },
  });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
  });

  // Tambahkan error handling yang lebih baik
  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
        });
      }

      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
        console.log(`Operation: ${operation.operationName}`);
        console.log(`URI: ${uri}`);

        // Retry untuk network errors
        if (
          networkError.statusCode === 0 ||
          networkError.code === "NETWORK_ERROR"
        ) {
          console.log("Retrying request...");
          return forward(operation);
        }
      }
    }
  );

  return new ApolloClient({
    link: errorLink.concat(authLink.concat(httpLink)),
    cache: new InMemoryCache({
      // Tambahkan type policies untuk better caching
      typePolicies: {
        TourPackage: {
          fields: {
            id: {
              merge: false,
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network", // Ubah dari network-only
        errorPolicy: "all",
        notifyOnNetworkStatusChange: true,
      },
      query: {
        fetchPolicy: "cache-first", // Ubah dari network-only
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
        fetchPolicy: "no-cache", // Tambahkan ini untuk mutations
      },
    },
    // Tambahkan connection params untuk debugging
    connectToDevTools: process.env.NODE_ENV === "development",
  });
};

// Export service clients
export const userService = createClient(SERVICES.USER);
export const tourService = createClient(SERVICES.TOUR);
export const bookingService = createClient(SERVICES.BOOKING);
export const paymentService = createClient(SERVICES.PAYMENT);
export const inventoryService = createClient(SERVICES.INVENTORY);

// Test connection function - tambahkan ini untuk debugging
export const testTourServiceConnection = async () => {
  try {
    const result = await tourService.query({
      query: gql`
        query TestConnection {
          getTourPackages {
            id
            name
          }
        }
      `,
      fetchPolicy: "no-cache",
    });
    console.log("Tour service connection test:", result);
    return result;
  } catch (error) {
    console.error("Tour service connection failed:", error);
    throw error;
  }
};

// GraphQL Queries - sisanya tetap sama seperti sebelumnya
export const QUERIES = {
  GET_CURRENT_USER: gql`
    query GetCurrentUser {
      getCurrentUser {
        id
        name
        email
        role
      }
    }
  `,

  GET_TOUR_PACKAGES: gql`
    query GetTourPackages {
      getTourPackages {
        id
        name
        category
        shortDescription
        location {
          city
          province
          country
        }
        duration {
          days
          nights
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
        maxParticipants
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
      }
    }
  `,

  GET_TOUR_PACKAGES_BY_CATEGORY: gql`
    query GetTourPackagesByCategory($category: String!) {
      getTourPackagesByCategory(category: $category) {
        id
        name
        shortDescription
        location {
          city
          country
        }
        price {
          amount
          currency
        }
      }
    }
  `,

  SEARCH_TOUR_PACKAGES: gql`
    query SearchTourPackages($keyword: String!) {
      searchTourPackages(keyword: $keyword) {
        id
        name
        category
        shortDescription
        location {
          city
          country
        }
        price {
          amount
          currency
        }
      }
    }
  `,
};

// GraphQL Mutations - sisanya tetap sama seperti sebelumnya
export const MUTATIONS = {
  CREATE_BOOKING: gql`
    mutation CreateBooking($input: BookingInput!) {
      createBooking(input: $input) {
        id
        status
      }
    }
  `,

  PROCESS_PAYMENT: gql`
    mutation ProcessPayment($input: PaymentInput!) {
      processPayment(input: $input) {
        id
        status
      }
    }
  `,

  RESERVE_INVENTORY: gql`
    mutation ReserveSlots($input: ReservationInput!) {
      reserveSlots(input: $input) {
        success
        message
      }
    }
  `,

  LOGIN: gql`
    mutation Login($email: String!, $password: String!) {
      authenticateUser(email: $email, password: $password) {
        token
        user {
          id
          name
          email
          role
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
      }
    }
  `,

  UPDATE_PROFILE: gql`
    mutation UpdateUserProfile($id: ID!, $input: UserUpdateInput!) {
      updateUserProfile(id: $id, input: $input) {
        id
        name
        email
        role
      }
    }
  `,

  CREATE_TOUR_PACKAGE: gql`
    mutation CreateTourPackage($input: TourPackageInput!) {
      createTourPackage(input: $input) {
        id
        name
        category
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
      }
    }
  `,

  UPDATE_TOUR_PACKAGE: gql`
    mutation UpdateTourPackage($id: ID!, $input: TourPackageInput!) {
      updateTourPackage(id: $id, input: $input) {
        id
        name
        category
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
      }
    }
  `,

  DELETE_TOUR_PACKAGE: gql`
    mutation DeleteTourPackage($id: ID!) {
      deleteTourPackage(id: $id) {
        id
      }
    }
  `,

  UPDATE_TOUR_STATUS: gql`
    mutation UpdateTourStatus($id: ID!, $status: String!) {
      updateTourStatus(id: $id, status: $status) {
        id
        status
      }
    }
  `,
};
