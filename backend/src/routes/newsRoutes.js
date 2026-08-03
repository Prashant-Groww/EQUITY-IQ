const express = require('express');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.get('/:symbol', newsController.getNews);
router.post('/:symbol/ingest', newsController.ingestNews);

module.exports = router;
