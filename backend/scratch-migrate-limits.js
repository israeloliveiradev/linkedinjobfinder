import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('🔌 Conectando via Pool PG para adicionar colunas de limites de buscas...');
  
  try {
    await pool.query(`
      ALTER TABLE subscriptions 
      ADD COLUMN IF NOT EXISTS gupy_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS indeed_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS extra_gupy_credits INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS extra_indeed_credits INTEGER NOT NULL DEFAULT 0;
    `);
    console.log('✅ Colunas de limites (gupy_count, indeed_count, extra_gupy_credits, extra_indeed_credits) adicionadas com sucesso no Supabase!');
  } catch (err) {
    console.error('❌ Erro ao rodar migração PG:', err.message);
  } finally {
    await pool.end();
  }
}

main();
