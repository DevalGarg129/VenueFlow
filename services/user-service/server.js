const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || process.env.USER_SERVICE_PORT || 4001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[User Service] listening on port ${PORT}`);
  });
});
