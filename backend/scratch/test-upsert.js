import 'dotenv/config';
import supabase from '../src/config/database.js';

async function test() {
  console.log('⚡ Testando upsert de plano...');
  const userId = 'zULLS9ikBsF7NyVaLPmh6fjIEruqcXHu';
  const status = 'pro';
  
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({ user_id: userId, status })
    .select();
    
  if (error) {
    console.error('❌ Erro:', error.message);
  } else {
    console.log('✅ Sucesso:', data);
  }
}

test();
