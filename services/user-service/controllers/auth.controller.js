const authService = require('../services/auth.service');
const Joi = require('joi');
const { getProducer, ensureTopics } = require('../../../shared/utils/kafka.util');

// Ensure user events topic exists
ensureTopics(['user_events']);

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('fan', 'staff', 'admin'),
  ticketInfo: Joi.object({
    stand: Joi.string(),
    gate: Joi.string(),
    seat: Joi.string()
  })
});

exports.registerUser = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const userResponse = await authService.registerUser(req.body);
    
    // Emit Kafka event
    try {
      const producer = await getProducer();
      await producer.send({
        topic: 'user_events',
        messages: [{
          value: JSON.stringify({
            userId: userResponse.user.id,
            action: 'USER_REGISTERED',
            email: userResponse.user.email,
            timestamp: new Date().toISOString()
          })
        }]
      });
    } catch (kafkaErr) {
      console.error('[User Service] Failed to emit registration event:', kafkaErr.message);
    }

    res.status(201).json(userResponse);
  } catch (err) {
    if (err.message === 'User already exists') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userResponse = await authService.loginUser(email, password);

    // Emit Kafka event
    try {
      const producer = await getProducer();
      await producer.send({
        topic: 'user_events',
        messages: [{
          value: JSON.stringify({
            userId: userResponse.user.id,
            action: 'USER_LOGGED_IN',
            timestamp: new Date().toISOString()
          })
        }]
      });
    } catch (kafkaErr) {
      console.error('[User Service] Failed to emit login event:', kafkaErr.message);
    }

    res.json(userResponse);
  } catch (err) {
    if (err.message === 'Invalid email or password') {
      return res.status(401).json({ message: err.message });
    }
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json(user);
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: err.message });
    }
    next(err);
  }
};
