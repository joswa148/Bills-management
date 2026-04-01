-- ============================================================
-- Migration V5 — Audit Trails & AI Integrity
-- Run this ONCE against your bills_management database
-- ============================================================

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS scan_job_id VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS raw_scan_result JSON NULL;

-- Create an index to quickly find invoices by a specific scan job
CREATE INDEX idx_invoices_scan_job ON invoices (scan_job_id);

-- Optional: Link it formally to our scan_jobs table if needed
-- ALTER TABLE invoices ADD CONSTRAINT fk_invoices_scan_jobs FOREIGN KEY (scan_job_id) REFERENCES scan_jobs(id);
