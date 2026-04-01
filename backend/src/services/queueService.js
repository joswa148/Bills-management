import { pool } from '../config/database.js';
import fs from 'fs/promises';
import crypto from 'crypto';
import { extractSubscriptionData } from './ocrService.js';
import { getCanonicalVendorName } from './subscriptionService.js';

let isWorkerRunning = false;

// We process one job at a time in this simple worker
const processNextJob = async () => {
  try {
    // 1. Fetch next pending job atomically-ish by updating it first
    // In a multi-node setup, use FOR UPDATE or a separate queue engine. Here, single node is fine.
    const [rows] = await pool.execute(
      `SELECT id, file_path, file_hash FROM scan_jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`
    );

    if (rows.length === 0) {
      return; // No jobs
    }

    const job = rows[0];

    await pool.execute(`UPDATE scan_jobs SET status = 'processing' WHERE id = ? AND status = 'pending'`, [job.id]);

    try {
      // 2. Run OCR Extraction (this can take 2-10 seconds)
      const extractedData = await extractSubscriptionData(job.file_path);

      // 3. Clean/Normalize Vendor Name
      if (extractedData.serviceName) {
        const canonical = await getCanonicalVendorName(extractedData.serviceName);
        extractedData.rawServiceName = extractedData.serviceName;
        extractedData.serviceName = canonical;
      }

      // Attach the file hash so the frontend/API knows it later
      extractedData._fileHash = job.file_hash;

      // 4. Update job to completed
      await pool.execute(
        `UPDATE scan_jobs SET status = 'completed', result_data = ? WHERE id = ?`,
        [JSON.stringify(extractedData), job.id]
      );

    } catch (error) {
      console.error(`[Queue Worker] Job ${job.id} failed:`, error);
      await pool.execute(
        `UPDATE scan_jobs SET status = 'failed', error_message = ? WHERE id = ?`,
        [error.message || 'Unknown error during extraction', job.id]
      );
    } finally {
      // 5. Always clean up the temp file from disk!
      await fs.unlink(job.file_path).catch(() => {});
    }
  } catch (error) {
    console.error('[Queue Worker] Error fetching job:', error);
  }
};

const workerLoop = async () => {
  if (!isWorkerRunning) return;
  await processNextJob();
  // Poll every 2 seconds for new jobs
  setTimeout(workerLoop, 2000);
};

export const startWorker = () => {
  if (isWorkerRunning) return;
  isWorkerRunning = true;
  console.log('👷 [Queue Worker] Background invoice scanner starting...');
  workerLoop();
};

export const stopWorker = () => {
  isWorkerRunning = false;
};

export const enqueueJob = async (userId, filePath, fileHash) => {
  const jobId = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO scan_jobs (id, user_id, status, file_path, file_hash) VALUES (?, ?, 'pending', ?, ?)`,
    [jobId, userId, filePath, fileHash]
  );
  return jobId;
};

export const getJobStatus = async (jobId, userId) => {
  const [rows] = await pool.execute(
    `SELECT status, result_data, error_message FROM scan_jobs WHERE id = ? AND user_id = ?`,
    [jobId, userId]
  );
  return rows.length > 0 ? rows[0] : null;
};
