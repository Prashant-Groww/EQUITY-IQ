const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Not authorized to access this route: No token provided');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      return next(error);
    }

    const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      const error = new Error('The user belonging to this token no longer exists');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    const error = new Error('Not authorized to access this route: Invalid token');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    return next(error);
  }
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch {
    // Ignore invalid tokens in optional mode, fall back to guest session
  }
  next();
};

module.exports = authenticate;
module.exports.optionalAuthenticate = optionalAuthenticate;
