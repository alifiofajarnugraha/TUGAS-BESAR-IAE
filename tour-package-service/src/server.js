const express = require("express");
const cors = require("cors");
const http = require("http");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { connectDB } = require("./db");
const typeDefs = require("./typeDefs/typeDefs");
const resolvers = require("./resolvers/resolvers");
require("dotenv").config();

async function startServer() {
  await connectDB();

  const app = express();
  const httpServer = http.createServer(app);

  // CORS configuration yang lebih komprehensif
  const corsOptions = {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001", // Untuk testing antar service
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Apollo-Require-Preflight",
    ],
    exposedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200, // Untuk IE11
  };

  // Apply CORS globally
  app.use(cors(corsOptions));

  // Handle preflight requests
  app.options("*", cors(corsOptions));

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (err) => {
      console.error("GraphQL Error:", err);
      return err;
    },
  });

  await server.start();

  // Apply Apollo middleware with explicit CORS
  app.use(
    "/graphql",
    cors(corsOptions), // Apply CORS again specifically for GraphQL endpoint
    express.json({ limit: "50mb" }),
    express.urlencoded({ extended: true }),
    expressMiddleware(server, {
      context: async ({ req }) => {
        console.log("Request received:", req.method, req.headers.origin);
        const token = req.headers.authorization || "";
        return { token };
      },
    })
  );

  const PORT = process.env.PORT || 3002;
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log(
    `🚀 Tour Package Service ready at http://localhost:${PORT}/graphql`
  );
  console.log(
    `📊 GraphQL Playground available at http://localhost:${PORT}/graphql`
  );
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
