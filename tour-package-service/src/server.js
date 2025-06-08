const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');
const { gql } = require('apollo-server-express');
const path = require('path');

const typeDefs = require('./typeDefs/typeDefs.js');
const resolvers = require('./resolvers/resolvers.js');

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use('/graphql', express.json(), expressMiddleware(server));

  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      httpServer.listen(3002, () => {
        console.log('Tour Package Service is running on port 3002');
      });
    })
    .catch(err => console.error(err));
}

startServer();
