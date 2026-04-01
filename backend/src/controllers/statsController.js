import pool from '../config/db.js';

/**
 * Scanner Analytics Controller
 * Provides metrics on AI extraction performance
 */
export const getScannerStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get average confidence and counts from invoices
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_scans,
        AVG(scan_confidence) as avg_confidence,
        SUM(CASE WHEN scan_confidence >= 0.9 THEN 1 ELSE 0 END) as high_conf_count,
        SUM(CASE WHEN scan_confidence >= 0.7 AND scan_confidence < 0.9 THEN 1 ELSE 0 END) as med_conf_count,
        SUM(CASE WHEN scan_confidence < 0.7 THEN 1 ELSE 0 END) as low_conf_count
      FROM invoices 
      WHERE user_id = ? AND scan_job_id IS NOT NULL`,
      [userId]
    );

    // 2. Get vendor normalization success rate (how many aliases we've learned)
    const [mappingStats] = await pool.execute(
      `SELECT COUNT(*) as learned_vendors FROM vendor_mappings`
    );

    res.status(200).json({
      status: 'success',
      data: {
        performance: stats[0],
        knowledge: {
          learnedVendors: mappingStats[0].learned_vendors
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
