const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("./typeDefs/index.js");
const resolvers = require("./resolvers");

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      console.error(error);
      return error;
    },
  });

  await server.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      httpServer.listen(3004, () => {
        console.log("Payment Service running on port 3004");
      });
    })
    .catch((err) => console.error(err));
}

startServer();
