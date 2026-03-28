import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { extractSubscriptionData } from '../services/ocrService.js';

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG/PNG) and PDFs are allowed'));
    }
  }
}).single('bill');

export const scanBill = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Please upload a file' });
    }

    try {
      const filePath = req.file.path;
      
      // Call OCR Service
      const extractedData = await extractSubscriptionData(filePath);

      // Clean up: Delete file after processing
      await fs.unlink(filePath);

      res.status(200).json({
        status: 'success',
        data: {
          extractedData
        }
      });
    } catch (error) {
      // Ensure file is deleted even if OCR fails
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      next(error);
    }
  });
};
