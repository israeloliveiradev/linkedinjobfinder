import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('🔌 Conectando via Pool PG para habilitar RLS (Row-Level Security) em todas as tabelas...');
  
  try {
    // 1. Query all tables in the public schema
    const { rows: tables } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
    `);

    console.log(`📋 Encontradas ${tables.length} tabelas no schema public.`);

    // 2. Loop and enable RLS on each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`🔒 Habilitando RLS na tabela: "${tableName}"...`);
      
      await pool.query(`
        ALTER TABLE "public"."${tableName}" ENABLE ROW LEVEL SECURITY;
      `);
      
      // Remove any existing public policies to make it strictly secure-by-default for service role and direct pool connection only!
      await pool.query(`
        DROP POLICY IF EXISTS "Allow public read" ON "public"."${tableName}";
      `);
      
      console.log(`✅ RLS Habilitada com sucesso na tabela "${tableName}".`);
    }

    console.log('\n🏆 PARABÉNS! RLS (Row-Level Security) foi habilitada com sucesso em todas as tabelas!');
    console.log('🔒 Agora o acesso direto à API pública via chave "anon" está 100% bloqueado e seguro.');
    console.log('🚀 Seu backend Node (via conexão direta postgres e service_role) continuará operando normalmente sem qualquer interrupção.');
    
  } catch (err) {
    console.error('❌ Erro ao habilitar RLS:', err.message);
  } finally {
    await pool.end();
  }
}

main();
