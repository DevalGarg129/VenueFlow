const app = require('./app');
require('dotenv').config({ path: '../../.env' });
const connectDB = require('./config/db');

const { disconnectAll } = require('../../shared/utils/kafka.util');

const PORT = process.env.USER_SERVICE_PORT || process.env.PORT || 4001;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`[User Service] listening on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[User Service] SIGTERM received. Shutting down...');
    await disconnectAll();
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    console.log('[User Service] SIGINT received. Shutting down...');
    await disconnectAll();
    server.close(() => {
      process.exit(0);
    });
  });
});
