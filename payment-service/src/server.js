const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const typeDefs = require("./typeDefs/index.js");
const resolvers = require("./resolvers");

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // ✅ Apollo Server v4 setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // Enable GraphQL Playground in production
    formatError: (error) => {
      console.error("GraphQL Error:", error);
      return error;
    },
  });

  await server.start();

  // Enhanced Health check endpoint
  app.get("/health", (req, res) => {
    const healthStatus = {
      status: "ok",
      service: "payment-service",
      timestamp: new Date().toISOString(),
      port: 3004,
      environment: process.env.NODE_ENV || "development",
      database: {
        mongodb: {
          status:
            mongoose.connection.readyState === 1 ? "connected" : "disconnected",
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host || "unknown",
        },
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      apollo: "v4", // ✅ Indicate Apollo Server version
    };

    const httpStatus = mongoose.connection.readyState === 1 ? 200 : 503;
    res.status(httpStatus).json(healthStatus);
  });

  // Simple ping endpoint
  app.get("/ping", (req, res) => {
    res.json({
      message: "pong",
      timestamp: new Date().toISOString(),
      apollo: "v4",
    });
  });

  // ✅ CORS configuration for Apollo Server v4
  const corsOptions = {
    origin: [
      "http://localhost:3000", // Frontend
      "http://localhost:3001", // Local user service
      "http://localhost:3002", // Local tour service
      "http://localhost:3003", // Local booking service
      "http://localhost:3005", // Local inventory service
      "http://booking-service:3003", // Docker booking service
      "http://user-service:3001", // Docker user service
      "http://tour-service:3002", // Docker tour service
      "http://inventory-service:3005", // Docker inventory service
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "token", // ✅ ADD THIS
      "Accept", // ✅ ADD THIS
      "User-Agent", // ✅ ADD THIS
    ],
  };

  app.use("/graphql", cors(corsOptions), express.json());

  // ✅ Apply Apollo Server middleware
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  // MongoDB connection dengan proper Docker URI
  const mongoUri =
    process.env.MONGO_URI ||
    (process.env.NODE_ENV === "production"
      ? "mongodb://mongo-payment:27017/paymentdb"
      : "mongodb://localhost:27017/paymentdb");

  mongoose
    .connect(mongoUri)
    .then(() => {
      httpServer.listen(3004, "0.0.0.0", () => {
        console.log("🚀 Payment Service running on port 3004");
        console.log("📊 GraphQL endpoint: http://localhost:3004/graphql");
        console.log("💓 Health endpoint: http://localhost:3004/health");
        console.log("🏓 Ping endpoint: http://localhost:3004/ping");
        console.log("🗄️  Connected to MongoDB:", mongoUri);
        console.log("🌍 Environment:", process.env.NODE_ENV || "development");
        console.log("🎯 Apollo Server: v4 with Express middleware");
      });
    })
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
