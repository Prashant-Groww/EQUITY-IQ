const express = require('express');
const { optionalAuthenticate } = require('../middleware/authenticate');
const exportController = require('../controllers/exportController');

const router = express.Router();

// GET /api/export/brief/:symbol - Generate and fetch full structured research brief
router.get('/brief/:symbol', optionalAuthenticate, exportController.exportResearchBrief);

module.exports = router;
