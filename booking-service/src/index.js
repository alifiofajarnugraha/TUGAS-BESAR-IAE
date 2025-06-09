const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const cors = require("cors");
const { readFileSync } = require("fs");
const { join } = require("path");
const resolvers = require("./resolvers");

const typeDefs = readFileSync(join(__dirname, "schema.graphql"), "utf-8");

async function startServer() {
  const app = express();

  // Configure CORS untuk mengatasi masalah credentials
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001"], // Frontend origins
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    })
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return {
        headers: req.headers,
      };
    },
    cors: false, // Disable Apollo's CORS karena kita sudah handle di express
    introspection: true,
    playground: true,
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: "/graphql",
    cors: false, // Important: disable Apollo CORS
  });

  const PORT = process.env.PORT || 3003;

  app.listen(PORT, () => {
    console.log(
      `🚀 Booking service ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
