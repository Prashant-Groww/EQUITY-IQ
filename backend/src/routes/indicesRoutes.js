const express = require('express');
const router = express.Router();
const indicesController = require('../controllers/indicesController');

router.get('/', indicesController.getIndices);

module.exports = router;
