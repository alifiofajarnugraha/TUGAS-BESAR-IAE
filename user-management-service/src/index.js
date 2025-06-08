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
  // This is important - CORS and JSON body parsing must be set up first
  app.use(express.json());
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
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
    await sequelize.sync();
    console.log("Database connected successfully");

    const port = process.env.PORT || 3001;
    httpServer.listen(port, () => {
      console.log(`User Service ready at http://localhost:${port}/graphql`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

start().catch(console.error);
