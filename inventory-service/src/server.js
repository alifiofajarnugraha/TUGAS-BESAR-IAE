const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const initializeDB = require("./db");

const typeDefs = require("./typeDefs/index.js");
const resolvers = require("./resolvers");

async function startServer() {
  try {
    console.log("🚀 Starting Inventory Service initialization...");

    // Initialize database with retry logic
    console.log("📊 Connecting to MongoDB...");
    let retries = 5;
    while (retries > 0) {
      try {
        await initializeDB();
        console.log("✅ MongoDB connected successfully");
        break;
      } catch (error) {
        retries--;
        console.log(`❌ MongoDB connection failed. Retries left: ${retries}`);
        if (retries === 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    const app = express();
    const httpServer = http.createServer(app);

    // Enhanced CORS configuration
    app.use(
      cors({
        origin: [
          "http://localhost:3000",
          "http://localhost:3001", // User service
          "http://localhost:3002", // Tour service
          "http://localhost:3003", // Booking service
          "http://localhost:3004", // Payment service
          "http://localhost:3005", // Inventory service
          // ✅ ADD DOCKER ORIGINS:
          "http://user-service:3001",
          "http://tour-service:3002",
          "http://booking-service:3003",
          "http://payment-service:3004",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "token",
          "Accept", // ✅ ADD THIS
          "User-Agent", // ✅ ADD THIS
        ],
      })
    );

    console.log("🔧 Initializing Apollo Server...");
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      csrfPrevention: false,
      cache: "bounded",
      formatError: (error) => {
        console.error("❌ GraphQL Error:", {
          message: error.message,
          path: error.path,
          locations: error.locations,
        });
        return {
          message: error.message,
          path: error.path,
          extensions: {
            code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          },
        };
      },
    });

    await server.start();
    console.log("✅ Apollo Server started successfully");

    // GraphQL endpoint
    app.use(
      "/graphql",
      express.json({ limit: "50mb" }),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          token: req.headers.token || req.headers.authorization,
          userAgent: req.headers["user-agent"],
        }),
      })
    );

    // Enhanced health check endpoint
    app.get("/health", async (req, res) => {
      try {
        // Check MongoDB connection
        const mongoose = require("mongoose");
        const dbStatus =
          mongoose.connection.readyState === 1 ? "connected" : "disconnected";

        // Check inventory collection
        const Inventory = require("./models/Inventory");
        const inventoryCount = await Inventory.countDocuments();

        res.json({
          status: "ok",
          timestamp: new Date().toISOString(),
          uptime: Math.floor(process.uptime()),
          services: {
            mongodb: dbStatus,
            apollo: "running",
          },
          data: {
            inventoryRecords: inventoryCount,
          },
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          timestamp: new Date().toISOString(),
          error: error.message,
        });
      }
    });

    // Root endpoint
    app.get("/", (req, res) => {
      res.json({
        service: "Inventory Service",
        status: "running",
        endpoints: {
          graphql: "/graphql",
          health: "/health",
        },
        version: "1.0.0",
      });
    });

    const PORT = process.env.PORT || 3005;
    httpServer.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log("🎯 Inventory Service is running!");
      console.log("=".repeat(50));
      console.log(`📍 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("💥 Failed to start server:", error);
    process.exit(1);
  }
}

// Enhanced error handling
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("💥 Unhandled Rejection:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  process.exit(0);
});

startServer();
