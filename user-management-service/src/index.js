const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const sequelize = require('./db');
require('dotenv').config();

async function start() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  await sequelize.sync();
  app.listen(process.env.PORT, () => {
    console.log(` User Service ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
  });
}
start();
