const express = require('express');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// GET /api/users/profile - Example protected route
router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    user: req.user.toJSON(),
    message: 'Successfully retrieved protected user profile',
  });
});

module.exports = router;
