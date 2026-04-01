-- ============================================================
-- Migration V4 — Asynchronous Queue Support
-- Run this ONCE against your bills_management database
-- ============================================================

CREATE TABLE IF NOT EXISTS scan_jobs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NULL,
    result_data JSON NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index for querying jobs by user
    INDEX idx_scan_jobs_user (user_id),
    -- Index for the background worker to find pending jobs quickly
    INDEX idx_scan_jobs_status (status)
);
