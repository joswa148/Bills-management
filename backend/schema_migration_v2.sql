-- ============================================================
-- Migration V2 — Duplicate Detection & Confidence Scoring
-- Run this ONCE against your bills_management database
-- Compatible with MySQL 5.7+ and MariaDB 10.3+
-- ============================================================

-- Add file_hash for SHA-256 duplicate detection
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS file_hash VARCHAR(64) NULL AFTER notes,
  ADD COLUMN IF NOT EXISTS scan_confidence DECIMAL(3,2) NULL AFTER file_hash;

-- Index for fast hash lookups
CREATE INDEX IF NOT EXISTS idx_invoices_file_hash
  ON invoices(user_id, file_hash);

-- Index for fast invoice_id_number duplicate checks
CREATE INDEX IF NOT EXISTS idx_invoices_inv_num_user
  ON invoices(user_id, invoice_id_number);

-- ============================================================
-- Verify: should show file_hash and scan_confidence columns
-- ============================================================
-- DESCRIBE invoices;
