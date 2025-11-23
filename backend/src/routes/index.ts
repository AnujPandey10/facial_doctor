import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { analyzeImage, getAnalysisHistory, getAnalysisById } from '../controllers/analysisController';
import { trackAffiliateClick, getAffiliateStats } from '../controllers/affiliateController';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listEvidence,
  getEvidence,
  createEvidence,
  updateEvidence,
  deleteEvidence,
  linkProductEvidence,
  unlinkProductEvidence
} from '../controllers/adminController';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'selfie-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Analysis endpoints
router.post('/analyze', upload.single('image'), analyzeImage);
router.get('/analysis/history', getAnalysisHistory);
router.get('/analysis/:analysisId', getAnalysisById);

// Affiliate tracking
router.get('/affiliate/:productId', trackAffiliateClick);
router.get('/affiliate/stats', getAffiliateStats);

// Admin endpoints - Product management
router.get('/admin/products', listProducts);
router.get('/admin/products/:productId', getProduct);
router.post('/admin/products', createProduct);
router.put('/admin/products/:productId', updateProduct);
router.delete('/admin/products/:productId', deleteProduct);

// Admin endpoints - Evidence management
router.get('/admin/evidence', listEvidence);
router.get('/admin/evidence/:evidenceId', getEvidence);
router.post('/admin/evidence', createEvidence);
router.put('/admin/evidence/:evidenceId', updateEvidence);
router.delete('/admin/evidence/:evidenceId', deleteEvidence);

// Admin endpoints - Product-Evidence linking
router.post('/admin/link-product-evidence', linkProductEvidence);
router.delete('/admin/unlink-product-evidence', unlinkProductEvidence);

export default router;

