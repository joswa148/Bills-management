import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { checkDuplicateFileHash } from '../services/subscriptionService.js';
import { enqueueJob, getJobStatus } from '../services/queueService.js';

// ─── Multer config with 10MB file size limit ─────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only JPEG, PNG images and PDF files are allowed'));
  },
}).single('bill');

export const scanBill = (req, res, next) => {
  upload(req, res, async (err) => {
    // Multer errors (wrong file type, size exceeded)
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Please upload a file' });
    }

    const filePath = req.file.path;

    try {
      // ── Step 1: Compute SHA-256 hash for duplicate detection ────────────────
      const fileBuffer = await fs.readFile(filePath);
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // ── Step 2: Check if this exact file was scanned before ────────────────
      const existingInvoice = await checkDuplicateFileHash(req.user.id, fileHash);
      if (existingInvoice) {
        await fs.unlink(filePath).catch(() => {}); // clean up
        return res.status(200).json({
          status: 'success',
          data: {
            isDuplicate: true,
            duplicateInfo: {
              invoiceDbId:    existingInvoice.id,
              invoiceIdNumber: existingInvoice.invoice_id_number,
              serviceName:    existingInvoice.service_name,
              amountDue:      existingInvoice.amount_due,
              scannedAt:      existingInvoice.created_at,
            },
            extractedData: null, // front end should prompt user
            message: 'This file has already been scanned. Duplicate detected.',
          },
        });
      }

      // ── Step 3: Enqueue OCR extraction ───────────────────────────────────
      // We pass the filePath to the worker, so we do NOT delete the file here.
      const jobId = await enqueueJob(req.user.id, filePath, fileHash);

      return res.status(202).json({
        status: 'success',
        message: 'Scan job accepted and queued for processing',
        data: { jobId, isDuplicate: false, status: 'pending' },
      });

    } catch (error) {
      await fs.unlink(filePath).catch(() => {}); // always clean up
      next(error);
    }
  });
};

export const checkScanStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await getJobStatus(jobId, req.user.id);
    
    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        status: job.status,
        extractedData: job.result_data || null,
        error: job.error_message || null
      }
    });
  } catch (error) {
    next(error);
  }
};
