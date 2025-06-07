# Payment Service

This project is a payment service built using Docker, GraphQL, and MongoDB. It supports multiple payment methods including transfer, e-wallet, and credit card. The service also includes payment status tracking and invoice generation.

## Project Structure

```
payment-service
├── .env                  # Environment variables for configuration
├── docker-compose.yml    # Docker Compose configuration for services
├── Dockerfile            # Dockerfile for building the payment service image
├── package.json          # Project dependencies and scripts
├── src                   # Source code for the payment service
│   ├── db.js            # Database connection and initial data seeding
│   ├── index.js         # Entry point for the application
│   ├── server.js        # Apollo Server setup and middleware
│   ├── models           # Mongoose models
│   │   └── Payment.js   # Payment model schema
│   ├── resolvers        # GraphQL resolvers
│   │   └── index.js     # Resolvers for queries and mutations
│   └── typeDefs        # GraphQL type definitions
│       └── index.js     # Schema definitions for GraphQL
└── README.md            # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd payment-service
   ```

2. **Create a `.env` file**:
   Copy the `.env.example` to `.env` and update the MongoDB URI and any other necessary environment variables.

3. **Build and run the services**:
   ```
   docker-compose up --build
   ```

4. **Access the GraphQL API**:
   The API will be available at `http://localhost:3005/graphql`.

## Usage

- **Payment Processing**: Use the `processPayment` mutation to initiate a payment.
- **Payment Status Tracking**: Use the `getPaymentStatus` query to check the status of a payment.
- **Invoice Generation**: Use the `generateInvoice` mutation to create an invoice for a completed payment.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.