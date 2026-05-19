import 'dotenv/config';
import supabase from '../src/config/database.js';

async function check() {
  console.log('🔍 Buscando usuários no banco de dados...');
  const { data: users, error } = await supabase
    .from('user')
    .select('id, name, email, role');
    
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log('📋 Lista de usuários:');
  users.forEach(u => {
    console.log(`- ID: ${u.id} | Nome: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
  });
}

check();
