const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const typeDefs = require("./typeDefs/typeDefs");
const resolvers = require("./resolvers/resolvers");
const { connectDB } = require("./db");

async function startServer() {
  try {
    console.log("🚀 Starting Tour Package Service...");

    // Initialize database with retry logic
    console.log("📊 Connecting to MongoDB...");
    let retries = 5;
    while (retries > 0) {
      try {
        await connectDB();
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

    // Enhanced CORS configuration for Docker environment
    app.use(
      cors({
        origin: [
          "http://localhost:3000", // Frontend
          "http://localhost:3001", // User service
          "http://localhost:3003", // Booking service
          "http://localhost:3004", // Payment service
          "http://localhost:3005", // Inventory service
          "http://user-service:3001", // Docker user service
          "http://booking-service:3003", // Docker booking service
          "http://payment-service:3004", // Docker payment service
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

    // ✅ Enhanced health check endpoint
    app.get("/health", async (req, res) => {
      try {
        // Check MongoDB connection
        const dbStatus =
          mongoose.connection.readyState === 1 ? "connected" : "disconnected";

        // Check tour count
        const TourPackage = require("./models/TourPackage");
        const tourCount = await TourPackage.countDocuments();

        res.json({
          status: "ok",
          service: "tour-package-service",
          timestamp: new Date().toISOString(),
          port: 3002,
          environment: process.env.NODE_ENV || "development",
          database: {
            mongodb: {
              status: dbStatus,
              url: process.env.MONGO_URI ? "configured" : "default",
            },
          },
          data: {
            tourCount,
          },
          uptime: Math.floor(process.uptime()),
          memory: process.memoryUsage(),
          version: process.version,
        });
      } catch (error) {
        res.status(503).json({
          status: "error",
          service: "tour-package-service",
          timestamp: new Date().toISOString(),
          error: error.message,
        });
      }
    });

    // Root endpoint
    app.get("/", (req, res) => {
      res.json({
        service: "Tour Package Service",
        status: "running",
        endpoints: {
          graphql: "/graphql",
          health: "/health",
        },
        version: "1.0.0",
      });
    });

    const PORT = process.env.PORT || 3002;
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log("=".repeat(50));
      console.log("🏝️ Tour Package Service is running!");
      console.log("=".repeat(50));
      console.log(`📍 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(
        `🗄️ Database: ${
          process.env.MONGO_URI || "mongodb://localhost:27017/tourdb"
        }`
      );
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start Tour Package Service:", error);
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
