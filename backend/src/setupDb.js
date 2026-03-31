import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not defined in .env');
    return;
  }

  // Parse the connection URL to get base connection (without DB name)
  const urlParts = url.match(/mysql:\/\/([^:]+)(?::([^@]+))?@([^:/]+)(?::(\d+))?\/(.+)/);
  if (!urlParts) {
    console.error('Invalid DATABASE_URL format');
    return;
  }

  const [, user, password, host, port, dbName] = urlParts;

  const connection = await mysql.createConnection({
    host,
    user,
    password: password || '',
    port: parseInt(port || '3306'),
    multipleStatements: true
  });

  try {
    console.log(`Connecting to database at ${host}...`);
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database \`${dbName}\` ensured.`);
    
    await connection.query(`USE \`${dbName}\``);

    // Read schema.sql
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');

    console.log('Dropping existing tables for a clean reset...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['audit_logs', 'notifications', 'invoice_items', 'invoices', 'subscriptions', 'users'];
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Applying schema from schema.sql...');
    await connection.query(schemaSql);
    console.log('Schema applied successfully.');

  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
