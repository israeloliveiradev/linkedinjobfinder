import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('🔌 Conectando via Pool PG para adicionar colunas de rastreamento de recursos...');
  
  try {
    await pool.query(`
      ALTER TABLE subscriptions 
      ADD COLUMN IF NOT EXISTS used_express BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS used_posts_vaga BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS used_posts_hiring BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS used_posts_curriculo BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('✅ Colunas de rastreamento (used_express, used_posts_vaga, used_posts_hiring, used_posts_curriculo) adicionadas com sucesso no Supabase!');
  } catch (err) {
    console.error('❌ Erro ao rodar migração PG:', err.message);
  } finally {
    await pool.end();
  }
}

main();
