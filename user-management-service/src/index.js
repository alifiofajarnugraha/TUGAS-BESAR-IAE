const express = require("express");
const http = require("http");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
const sequelize = require("./db");
const { verifyToken } = require("./auth");
require("dotenv").config();

async function start() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // ✅ Add health check endpoint BEFORE Apollo setup
  app.get("/health", async (req, res) => {
    try {
      // Test database connection
      await sequelize.authenticate();

      const healthStatus = {
        status: "ok",
        service: "user-service",
        timestamp: new Date().toISOString(),
        port: 3001,
        environment: process.env.NODE_ENV || "development",
        database: {
          postgresql: {
            status: "connected",
            url: process.env.DATABASE_URL
              ? "configured"
              : "individual_env_vars",
          },
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      console.error("Health check failed:", error);

      const healthStatus = {
        status: "error",
        service: "user-service",
        timestamp: new Date().toISOString(),
        error: error.message,
        database: {
          postgresql: {
            status: "disconnected",
            error: error.message,
          },
        },
      };

      res.status(503).json(healthStatus);
    }
  });

  // ✅ Add ping endpoint
  app.get("/ping", (req, res) => {
    res.json({
      message: "pong",
      timestamp: new Date().toISOString(),
      service: "user-service",
    });
  });

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

  // Start the Apollo Server
  await server.start();

  // Configure middleware BEFORE applying Apollo middleware
  app.use(express.json());
  app.use(
    cors({
      origin: [
        "http://localhost:3000", // Frontend
        "http://localhost:3002", // Tour service
        "http://localhost:3003", // Booking service
        "http://localhost:3004", // Payment service
        "http://localhost:3005", // Inventory service
        "http://tour-service:3002", // Docker tour service
        "http://booking-service:3003", // Docker booking service
        "http://payment-service:3004", // Docker payment service
        "http://inventory-service:3005", // Docker inventory service
      ],
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "token", // ✅ ADD THIS
        "Accept", // ✅ ADD THIS
        "User-Agent", // ✅ ADD THIS
      ],
    })
  );

  // Apply Apollo middleware
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || "";
        let user = null;

        try {
          if (token) {
            const decoded = verifyToken(token.replace("Bearer ", ""));
            user = decoded;
          }
        } catch (error) {
          console.error("Token verification error:", error);
        }

        return { token, user };
      },
    })
  );

  try {
    // ✅ Enhanced database connection with detailed logging
    console.log("🔌 Connecting to database...");
    console.log("Database config:", {
      url: process.env.DATABASE_URL
        ? "using DATABASE_URL"
        : "using individual env vars",
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    });

    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // ✅ DON'T sync in production to preserve init.sql data
    if (process.env.NODE_ENV === "production") {
      console.log(
        "✅ Production mode: Skipping sync to preserve init.sql data"
      );

      // Check if sample data exists
      const User = require("./models/User");
      const userCount = await User.count();
      console.log(`📊 Found ${userCount} users in database`);

      if (userCount === 0) {
        console.log(
          "⚠️ No users found - sample data may not have loaded from init.sql"
        );
      }
    } else {
      // Development mode: use alter to preserve existing data
      await sequelize.sync({ alter: true });
      console.log("✅ Database synchronized (development mode with alter)");
    }

    const port = process.env.PORT || 3001;
    httpServer.listen(port, "0.0.0.0", () => {
      console.log("🚀 User Service running on port", port);
      console.log("📊 GraphQL endpoint: http://localhost:3001/graphql");
      console.log("💓 Health endpoint: http://localhost:3001/health");
      console.log("🏓 Ping endpoint: http://localhost:3001/ping");
      console.log("🌍 Environment:", process.env.NODE_ENV || "development");
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    console.error("Database connection details:", {
      DATABASE_URL: process.env.DATABASE_URL,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
    });
    process.exit(1);
  }
}

start().catch(console.error);
