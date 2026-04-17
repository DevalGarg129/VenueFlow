const app = require('./app');
require('dotenv').config({ path: '../../.env' });
const connectDB = require('./config/db');

const PORT = process.env.USER_SERVICE_PORT || process.env.PORT || 4001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[User Service] listening on port ${PORT}`);
  });
});
