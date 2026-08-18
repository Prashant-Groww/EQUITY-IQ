const express = require('express');
const multer = require('multer');
const path = require('path');
const reportController = require('../controllers/reportController');

const router = express.Router();

// Configure Multer memoryStorage with fileFilter restricting to .pdf and .csv ONLY
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    const isPdf = ext === '.pdf' || mime === 'application/pdf';
    const isCsv = ext === '.csv' || mime === 'text/csv' || mime === 'application/vnd.ms-excel';

    if (isPdf || isCsv) {
      cb(null, true);
    } else {
      const error = new Error('Only PDF (.pdf) and CSV (.csv) files are supported for RAG stock analysis.');
      error.statusCode = 400;
      error.code = 'INVALID_FILE_TYPE';
      cb(error);
    }
  },
});

// POST /api/reports/upload (Handles multipart 'file' with PDF or CSV)
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds maximum allowed limit (15MB)' } });
      }
      return next(err);
    }
    reportController.uploadAndAnalyzeReport(req, res, next);
  });
});

// GET /api/reports/:symbol
router.get('/:symbol', reportController.getReportsBySymbol);

// DELETE /api/reports/:id
router.delete('/:id', reportController.deleteReport);

module.exports = router;
