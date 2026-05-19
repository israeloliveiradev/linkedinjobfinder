import 'dotenv/config';
import supabase from './src/config/database.js';

async function main() {
  console.log('🔌 Conectando ao Supabase para verificar assinaturas...');
  
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('*');
    
  if (error) {
    console.error('❌ Erro ao buscar assinaturas:', error.message);
    return;
  }
  
  console.log('📋 Lista de Assinaturas Encontradas:');
  console.log(subs);
  
  const { data: users, error: userError } = await supabase
    .from('user')
    .select('id, name, email, role');
    
  if (userError) {
    console.error('❌ Erro ao buscar usuários:', userError.message);
    return;
  }
  
  console.log('\n👤 Lista de Usuários Encontrados:');
  console.log(users);
}

main();
