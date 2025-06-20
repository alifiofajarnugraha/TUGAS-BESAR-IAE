const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const { readFileSync } = require("fs");
const { join } = require("path");
const resolvers = require("./resolvers");
const db = require("./db");

// Load GraphQL schema
const typeDefs = readFileSync(join(__dirname, "schema.graphql"), "utf-8");

async function startServer() {
  try {
    console.log("🚀 Starting Booking Service...");

    const app = express();
    const httpServer = http.createServer(app);

    // ✅ Enhanced CORS configuration for Apollo Server v4
    const corsOptions = {
      origin: [
        "http://localhost:3000", // Frontend
        "http://localhost:3001", // User service
        "http://localhost:3002", // Tour service
        "http://localhost:3004", // Payment service
        "http://localhost:3005", // Inventory service
        "http://user-service:3001", // Docker user service
        "http://tour-service:3002", // Docker tour service
        "http://payment-service:3004", // Docker payment service
        "http://inventory-service:3005", // Docker inventory service
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "token", // ✅ CRITICAL for frontend
        "Accept",
        "User-Agent",
      ],
    };

    app.use(cors(corsOptions));

    // ✅ Apollo Server v4 setup
    console.log("🔧 Initializing Apollo Server v4...");
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      csrfPrevention: false,
      cache: "bounded",
      introspection: process.env.NODE_ENV !== "production",
      formatError: (error) => {
        console.error("❌ GraphQL Error:", {
          message: error.message,
          path: error.path,
          locations: error.locations,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
        return {
          message: error.message,
          path: error.path,
          extensions: {
            code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
            timestamp: new Date().toISOString(),
          },
        };
      },
    });

    await server.start();
    console.log("✅ Apollo Server v4 started successfully");

    // ✅ GraphQL endpoint with Apollo Server v4
    app.use(
      "/graphql",
      express.json({ limit: "50mb" }),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          headers: req.headers,
          token:
            req.headers.token ||
            req.headers.authorization?.replace("Bearer ", ""),
          userAgent: req.headers["user-agent"],
          ip: req.ip || req.connection.remoteAddress,
        }),
      })
    );

    // ✅ Enhanced health check endpoint
    app.get("/health", async (req, res) => {
      try {
        // Test database connection
        const dbResult = await db.query(
          "SELECT NOW() as current_time, version() as pg_version"
        );
        const dbInfo = dbResult.rows[0];

        // Test some basic queries
        const bookingCount = await db.query(
          "SELECT COUNT(*) as count FROM bookings"
        );

        res.json({
          status: "ok",
          service: "booking-service",
          timestamp: new Date().toISOString(),
          port: process.env.PORT || 3003,
          environment: process.env.NODE_ENV || "development",
          database: {
            postgresql: {
              status: "connected",
              currentTime: dbInfo.current_time,
              version: dbInfo.pg_version,
              url: process.env.DATABASE_URL ? "configured" : "default",
            },
          },
          data: {
            totalBookings: parseInt(bookingCount.rows[0].count),
          },
          uptime: Math.floor(process.uptime()),
          memory: process.memoryUsage(),
          nodejs: process.version,
          apollo: "v4", // ✅ Updated version indicator
        });
      } catch (error) {
        console.error("❌ Health check failed:", error);
        res.status(503).json({
          status: "error",
          service: "booking-service",
          timestamp: new Date().toISOString(),
          error: error.message,
          database: {
            postgresql: {
              status: "disconnected",
              error: error.message,
            },
          },
        });
      }
    });

    // Ping endpoint
    app.get("/ping", (req, res) => {
      res.json({
        message: "pong",
        timestamp: new Date().toISOString(),
        service: "booking-service",
        apollo: "v4",
      });
    });

    // Root endpoint with service info
    app.get("/", (req, res) => {
      res.json({
        service: "Booking Service",
        status: "running",
        version: "1.0.0",
        apollo: "v4",
        endpoints: {
          graphql: "/graphql",
          health: "/health",
          ping: "/ping",
        },
        documentation: {
          graphql: "Visit /graphql for GraphQL Playground",
          health: "Visit /health for service health status",
        },
      });
    });

    // ✅ Start server
    const PORT = process.env.PORT || 3003;
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log("=".repeat(60));
      console.log("📋 Booking Service is running!");
      console.log("=".repeat(60));
      console.log(`📍 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🏓 Ping endpoint: http://localhost:${PORT}/ping`);
      console.log(
        `🗄️ Database: ${
          process.env.DATABASE_URL || "postgresql://localhost:5432/bookings"
        }`
      );
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🚀 Apollo Server: v4`);
      console.log(`📦 Node.js: ${process.version}`);
      console.log("=".repeat(60));
    });
  } catch (error) {
    console.error("❌ Failed to start Booking Service:", error);
    process.exit(1);
  }
}

// ✅ Enhanced error handling
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception in Booking Service:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("💥 Unhandled Rejection in Booking Service:", error);
  process.exit(1);
});

// ✅ Graceful shutdown
process.on("SIGTERM", () => {
  console.log(
    "🛑 SIGTERM received, shutting down Booking Service gracefully..."
  );
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log(
    "🛑 SIGINT received, shutting down Booking Service gracefully..."
  );
  process.exit(0);
});

startServer();
