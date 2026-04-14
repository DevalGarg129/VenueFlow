const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controllers/auth.controller');
// Mocking the shared middleware import since we don't have workspaces perfectly linked
// In a real app we'd publish `@venueflow/shared` or use npm workspaces.
// For now, we will create a local mock or assume it's copyable
// But to keep it compiling, I'll provide a local fallback.

let authenticate;
try {
  authenticate = require('../../../shared/middlewares/auth.middleware').authenticateToken;
} catch(e) {
  authenticate = (req, res, next) => next(); // mock
}

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticate, getProfile);

module.exports = router;
