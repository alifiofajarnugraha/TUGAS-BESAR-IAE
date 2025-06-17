const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors"); // Tambahkan import cors
require("dotenv").config();

const typeDefs = require("./typeDefs/index.js");
const resolvers = require("./resolvers");

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      console.error(error);
      return error;
    },
  });

  await server.start();

  // Enable CORS - tambahkan ini sebelum middleware GraphQL
  app.use(
    cors({
      origin: [
        "http://localhost:3000", // Frontend
        "http://localhost:3001", // User service
        "http://localhost:3002", // Tour service
        "http://localhost:3003", // Booking service
        "http://localhost:3005", // Inventory service
        "http://localhost:3010", // Travel schedule service
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      httpServer.listen(3004, () => {
        console.log("Payment Service running on port 3004");
        console.log("GraphQL endpoint: http://localhost:3004/graphql");
      });
    })
    .catch((err) => console.error(err));
}

startServer();
