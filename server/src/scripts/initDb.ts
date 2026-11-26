import fs from 'fs';
import path from 'path';
import { pool } from '../db';

async function initDb(): Promise<void> {
  const sqlPath = path.resolve(__dirname, '../../../db/init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  try {
    await pool.query(sql);
    console.log('Database schema initialized successfully.');
  } finally {
    await pool.end();
  }
}

initDb().catch((err: unknown) => {
  console.error('Failed to initialize database schema:', err);
  process.exit(1);
});
