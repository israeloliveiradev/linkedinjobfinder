import 'dotenv/config';
import pg from 'pg';

const useSsl = (process.env.DATABASE_URL || '').includes('supabase.co') || 
               (process.env.DATABASE_URL || '').includes('render.com') || 
               (process.env.DATABASE_URL || '').includes('neon.tech') || 
               process.env.DB_SSL === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
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
