const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
const sequelize = require("./db");
require("dotenv").config();

async function start() {
  const app = express();

  // Enable CORS with specific options
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      return { token };
    },
    formatError: (err) => {
      console.error("GraphQL Error:", err);
      return err;
    },
  });

  await server.start();

  server.applyMiddleware({
    app,
    path: "/graphql",
    cors: false, // We're using the express cors middleware instead
  });

  try {
    await sequelize.sync();
    console.log("Database connected successfully");

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(
        `User Service ready at http://localhost:${port}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

start().catch(console.error);
