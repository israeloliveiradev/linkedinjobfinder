import 'dotenv/config';
import supabase from '../src/config/database.js';

async function main() {
  console.log('🔌 Conectando para inspecionar a tabela admin_config...');
  const { data, error } = await supabase.from('admin_config').select('*').single();
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  console.log('📋 Estrutura da linha de admin_config:');
  console.log(data);
}

main();
