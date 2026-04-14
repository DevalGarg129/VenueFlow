const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretvenueflowkey2024', {
    expiresIn: '30d',
  });
};

exports.registerUser = async (userData) => {
  const { name, email, password, role, ticketInfo } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, role, ticketInfo });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ticketInfo: user.ticketInfo,
    token: generateToken(user._id, user.role),
  };
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ticketInfo: user.ticketInfo,
      token: generateToken(user._id, user.role),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
