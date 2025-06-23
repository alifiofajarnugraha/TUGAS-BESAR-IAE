import { ApolloServer } from "@apollo/server";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import http from "http";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import db from "./db.js";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typeDefs = readFileSync(join(__dirname, "./schema.graphql"), "utf8");
import resolvers from "./resolvers.js";

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});

await server.start();

app.use(
  cors({
    origin: [
      "http://localhost:3000", // Frontend
      "http://localhost:3001", // User Service
      "http://localhost:3002", // Tour Service
      "http://localhost:3003", // Booking Service
      "http://localhost:3004", // Payment Service
      "http://localhost:3005", // Inventory Service
      "https://studio.apollographql.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "token", // ✅ FIXED: Add 'token' header
      "Apollo-Require-Preflight",
      "x-apollo-operation-name",
      "apollo-require-preflight",
      "x-requested-with",
      "accept",
      "origin",
      "access-control-request-method",
      "access-control-request-headers",
    ],
    exposedHeaders: [
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
    ],
  })
);

// ✅ ENHANCED: Handle preflight requests explicitly
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,token,Apollo-Require-Preflight,x-apollo-operation-name,apollo-require-preflight,x-requested-with,accept,origin,access-control-request-method,access-control-request-headers"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

app.use(
  "/graphql",
  express.json({ limit: "50mb" }),
  expressMiddleware(server, {
    context: async ({ req }) => ({
      token: req.headers.token,
      authorization: req.headers.authorization,
    }),
  })
);

// ✅ ADD: Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "travel-service",
    timestamp: new Date().toISOString(),
    endpoints: {
      graphql: "/graphql",
      health: "/health",
    },
  });
});

// ✅ ADD: Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Travel Service API",
    graphql: "/graphql",
    health: "/health",
  });
});

const PORT = process.env.PORT || 4000;
const serverUrl = `http://localhost:${PORT}`;

httpServer.listen(PORT, () => {
  console.log(`🚀 Travel Service ready at ${serverUrl}`);
  console.log(`🚀 GraphQL endpoint: ${serverUrl}/graphql`);
  console.log(`🚀 Health check endpoint: ${serverUrl}/health`);
  console.log(`🌐 CORS enabled for frontend: http://localhost:3000`);
});
