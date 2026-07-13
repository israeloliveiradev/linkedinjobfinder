/**
 * setup-db.js
 * Executa o schema SQL no banco de dados configurado no .env.
 * Uso: node scripts/setup-db.js
 */
import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const useSsl = (process.env.DATABASE_URL || '').includes('supabase.co') || 
               (process.env.DATABASE_URL || '').includes('render.com') || 
               (process.env.DATABASE_URL || '').includes('neon.tech') || 
               process.env.DB_SSL === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});


const schemaPath = path.join(__dirname, '../database/schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

try {
  console.log('🔌 Conectando ao banco de dados...');
  await pool.query(schema);
  console.log('✅ Schema executado com sucesso! Tabelas criadas/verificadas.');

  // Verifica tabelas
  const { rows } = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('search_history', 'search_presets')
  `);
  console.log('📋 Tabelas encontradas:', rows.map(r => r.table_name).join(', '));
} catch (err) {
  console.error('❌ Erro ao executar schema:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
