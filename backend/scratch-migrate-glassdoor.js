import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('🔌 Conectando via Pool PG para adicionar colunas de rastreamento do Glassdoor...');
  
  try {
    await pool.query(`
      ALTER TABLE subscriptions 
      ADD COLUMN IF NOT EXISTS glassdoor_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS extra_glassdoor_credits INTEGER NOT NULL DEFAULT 0;
    `);
    console.log('✅ Colunas de rastreamento do Glassdoor (glassdoor_count, extra_glassdoor_credits) adicionadas com sucesso no Supabase!');
  } catch (err) {
    console.error('❌ Erro ao rodar migração PG:', err.message);
  } finally {
    await pool.end();
  }
}

main();
