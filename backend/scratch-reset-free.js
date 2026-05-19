import 'dotenv/config';
import supabase from './src/config/database.js';

async function main() {
  console.log('⚡ Resetando completamente o contador e todos os recursos de mcc2israel@gmail.com...');
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ 
      search_count: 0,
      used_express: false,
      used_posts_vaga: false,
      used_posts_hiring: false,
      used_posts_curriculo: false
    })
    .eq('user_id', '832ulmQpKLa69jYmI3qx3eNELomOdyYx');
    
  if (error) {
    console.error('❌ Erro ao resetar dados:', error.message);
  } else {
    console.log('✅ Status de mcc2israel@gmail.com totalmente resetado! Todos os recursos estão limpos e prontos para teste.');
  }
}

main();
