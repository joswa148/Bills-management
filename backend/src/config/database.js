import mysql from 'mysql2/promise';
import 'dotenv/config';

// Create pool using the connection string directly
const pool = mysql.createPool(process.env.DATABASE_URL);

export { pool };
