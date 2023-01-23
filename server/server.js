const express = require('express');
const path = require('path');
const db = require('./config/connection');

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { typeDefs, resolvers } from './schema/index';

const app = express();
const PORT = process.env.PORT || 3001;

const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const startApolloServer = async () => {
await server.start();
app.use(
  '/',
  cors(),
  json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
};

startApolloServer();
