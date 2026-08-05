const express = require('express');
const { optionalAuthenticate } = require('../middleware/authenticate');
const alertController = require('../controllers/alertController');

const router = express.Router();

// GET /api/alerts - Fetch user/guest active alerts & rule triggers
router.get('/', optionalAuthenticate, alertController.getAlerts);

// POST /api/alerts - Create custom price or volatility alert
router.post('/', optionalAuthenticate, alertController.createAlert);

// DELETE /api/alerts/:id - Delete an alert rule
router.delete('/:id', optionalAuthenticate, alertController.deleteAlert);

module.exports = router;
