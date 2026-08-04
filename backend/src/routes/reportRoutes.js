const express = require('express');
const multer = require('multer');
const reportController = require('../controllers/reportController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/reports/upload (Handles optional multipart 'file' or JSON body)
router.post('/upload', upload.single('file'), reportController.uploadAndAnalyzeReport);

// GET /api/reports/:symbol
router.get('/:symbol', reportController.getReportsBySymbol);

module.exports = router;
