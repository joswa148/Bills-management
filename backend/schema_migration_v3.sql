-- ============================================================
-- Migration V3 — Vendor Normalization
-- Run this ONCE against your bills_management database
-- ============================================================

CREATE TABLE IF NOT EXISTS vendor_mappings (
    id VARCHAR(36) PRIMARY KEY,
    raw_name VARCHAR(255) NOT NULL,
    canonical_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_raw_name (raw_name)
);

-- Seed some common aliases based on the mock data
INSERT IGNORE INTO vendor_mappings (id, raw_name, canonical_name) VALUES
    (UUID(), 'NETFLIX INC.', 'Netflix'),
    (UUID(), 'NETFLIX SUBSCRIPTION', 'Netflix'),
    (UUID(), 'AWS Cloud Services', 'AWS'),
    (UUID(), 'Amazon Web Services, Inc.', 'AWS'),
    (UUID(), 'Google Workspace', 'Google Workspace'),
    (UUID(), 'Google LLC', 'Google Workspace'),
    (UUID(), 'Spotify AB', 'Spotify Premium'),
    (UUID(), 'Harvest Inc.', 'Harvest Services');

-- Index for fast lookups during OCR post-processing
CREATE INDEX IF NOT EXISTS idx_vendor_raw ON vendor_mappings(raw_name);
