import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('🐘 [Database] Conectado ao PostgreSQL.');
});

pool.on('error', (err) => {
  console.error('❌ [Database] Erro inesperado no cliente Postgres:', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);

export default pool;
