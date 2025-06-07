const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const { gql } = require('apollo-server-express');
const path = require('path');
const initializeDB = require('./db');

const typeDefs = require('./typeDefs/index.js');
const resolvers = require('./resolvers');

async function startServer() {
  try {
    console.log('Starting server initialization...');
    
    // Initialize database
    console.log('Connecting to MongoDB...');
    await initializeDB();
    console.log('MongoDB connected successfully');

    const app = express();
    const httpServer = http.createServer(app);

    // Enable CORS
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3005'],
      credentials: true
    }));

    console.log('Initializing Apollo Server...');
    const server = new ApolloServer({ 
      typeDefs, 
      resolvers,
      csrfPrevention: false,
      cache: 'bounded',
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          path: error.path,
          extensions: error.extensions
        };
      }
    });
    
    await server.start();
    console.log('Apollo Server started successfully');

    app.use('/graphql', 
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
      })
    );

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          mongodb: 'connected',
          apollo: 'running'
        }
      });
    });

    httpServer.listen(3005, () => {
      console.log('=================================');
      console.log('Inventory Service is running!');
      console.log('=================================');
      console.log('GraphQL endpoint: http://localhost:3005/graphql');
      console.log('Health check: http://localhost:3005/health');
      console.log('=================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer();
