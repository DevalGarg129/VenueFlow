const express = require('express');
require('dotenv').config({ path: '../../.env' });
const http = require('http');
const { Server } = require('socket.io');
const { initializeSockets } = require('./sockets/notification.socket');
const { startConsumer } = require('./consumers/notification.consumer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for demo purposes
    methods: ['GET', 'POST']
  }
});

// Initialize Handlers
initializeSockets(io);
startConsumer();

const PORT = process.env.WS_PORT || process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Notification Service] WebSocket running on port ${PORT}`);
});
