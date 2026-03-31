import mysql from 'mysql2/promise';
import 'dotenv/config';

// Create pool and export it directly for use in other files
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export { pool };
