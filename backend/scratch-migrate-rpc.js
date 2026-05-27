import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('🔌 Conectando via Pool PG para criar função RPC de incremento atômico...');
  
  try {
    await pool.query(`
      CREATE OR REPLACE FUNCTION increment_subscription_feature(user_id_arg TEXT, feature_column TEXT)
      RETURNS VOID AS $$
      BEGIN
        IF feature_column = 'indeed_count' OR feature_column = 'gupy_count' OR feature_column = 'glassdoor_count' THEN
          EXECUTE format('UPDATE subscriptions SET %I = %I + 1 WHERE user_id = $1', feature_column, feature_column)
          USING user_id_arg;
        ELSE
          RAISE EXCEPTION 'Coluna de recurso inválida para incremento atômico.';
        END IF;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('✅ Função RPC de incremento atômico (increment_subscription_feature) criada com sucesso no Supabase!');
  } catch (err) {
    console.error('❌ Erro ao criar função RPC:', err.message);
  } finally {
    await pool.end();
  }
}

main();
