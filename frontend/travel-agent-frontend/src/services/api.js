import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

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
  });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
      },
      query: {
        fetchPolicy: "network-only",
      },
    },
  });
};

// Export service clients
export const userService = createClient(SERVICES.USER);
export const tourService = createClient(SERVICES.TOUR);
export const bookingService = createClient(SERVICES.BOOKING);
export const paymentService = createClient(SERVICES.PAYMENT);
export const inventoryService = createClient(SERVICES.INVENTORY);

// GraphQL Queries
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
  // ...other queries
};

// GraphQL Mutations
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
};
