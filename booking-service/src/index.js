const { ApolloServer } = require('apollo-server');
const { readFileSync } = require('fs');
const { join } = require('path');
const resolvers = require('./resolvers');

const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

// Membuat instance Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Menjalankan server
server.listen({ port: 3003 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});