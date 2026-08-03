const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '24h',
  });
};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation Failed');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = errors.array();
      return next(error);
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      error.code = 'DUPLICATE_EMAIL';
      return next(error);
    }

    const user = new User({
      name,
      email,
      passwordHash: password,
      role: role && ['user', 'admin'].includes(role) ? role : 'user',
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation Failed');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = errors.array();
      return next(error);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      return next(error);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      return next(error);
    }

    const token = generateToken(user._id);

    res.status(200).json({
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    user: req.user.toJSON(),
  });
};

module.exports = {
  register,
  login,
  getMe,
};
