const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: '../.env' }); // Load from root during dev

const app = express();
app.use(cors());
app.use(morgan('dev')); // Logging

// Custom rate limit middleware could be attached here if included via shared module
// Since proxying passes headers, microservices and API gateway can share rate limit logic.

// Proxy definitions
const proxies = {
  '/api/users': process.env.USER_SERVICE_URL || 'http://user-service:4001',
  '/api/crowd': process.env.CROWD_SERVICE_URL || 'http://crowd-service:4002',
  '/api/queue': process.env.QUEUE_SERVICE_URL || 'http://queue-service:4003',
  '/api/match': process.env.MATCH_SERVICE_URL || 'http://match-service:4004',
};

// Apply proxies
Object.keys(proxies).forEach(route => {
  app.use(route, createProxyMiddleware({
    target: proxies[route],
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: '', // remove base path when forwarding to target service
    },
    onError: (err, req, res) => {
      res.status(500).json({ message: 'Proxy Error', detail: err.message });
    }
  }));
});

const { healthCheck } = require('../shared/utils/kafka.util');

app.get('/health', async (req, res) => {
  const kafkaStatus = await healthCheck();
  res.status(200).json({ 
    status: 'Gateway is healthy',
    kafka: kafkaStatus
  });
});

const PORT = process.env.GATEWAY_PORT || process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`[Gateway] running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Gateway] SIGTERM received. Shutting down...');
  await disconnectAll();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('[Gateway] SIGINT received. Shutting down...');
  await disconnectAll();
  server.close(() => {
    process.exit(0);
  });
});
