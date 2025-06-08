import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const createServiceClient = (uri) => {
  const httpLink = createHttpLink({ uri });

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
  });
};

export const userService = createServiceClient("http://localhost:3001/graphql");
export const inventoryService = createServiceClient(
  "http://localhost:3005/graphql"
);
export const bookingService = createServiceClient(
  "http://localhost:3003/graphql"
);
export const paymentService = createServiceClient(
  "http://localhost:3004/graphql"
);

// Query fragments that can be reused across components
export const USER_FRAGMENT = `
  fragment UserFields on User {
    id
    name
    email
    role
  }
`;

export const BOOKING_FRAGMENT = `
  fragment BookingFields on Booking {
    id
    userId
    tourId
    status
    departureDate
    totalCost
  }
`;

export const INVENTORY_FRAGMENT = `
  fragment InventoryFields on Inventory {
    tourId
    date
    slots
    hotelAvailable
    transportAvailable
  }
`;

export const PAYMENT_FRAGMENT = `
  fragment PaymentFields on Payment {
    id
    amount
    method
    status
    invoiceNumber
    createdAt
  }
`;
