import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const { rows } = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  console.log('📋 Tables in public schema:', rows.map(r => r.table_name));
} catch (err) {
  console.error('❌ Error checking tables:', err);
} finally {
  await pool.end();
}
