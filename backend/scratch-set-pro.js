import 'dotenv/config';
import supabase from './src/config/database.js';

async function main() {
  console.log('⚡ Atualizando ambos os perfis para plano PRO no Supabase...');
  
  const { data: update1, error: err1 } = await supabase
    .from('subscriptions')
    .update({ status: 'pro', expires_at: null })
    .eq('user_id', 'UT03dHmNCbuCQA6mkUrLW3IziNIzhDAo');
    
  if (err1) {
    console.error('❌ Erro ao atualizar gestorisraeloliveira@gmail.com:', err1.message);
  } else {
    console.log('✅ gestorisraeloliveira@gmail.com atualizado para PRO com sucesso!');
  }

  const { data: update2, error: err2 } = await supabase
    .from('subscriptions')
    .update({ status: 'pro', expires_at: null })
    .eq('user_id', 'zULLS9ikBsF7NyVaLPmh6fjIEruqcXHu');
    
  if (err2) {
    console.error('❌ Erro ao atualizar israeloliveiracontact@gmail.com:', err2.message);
  } else {
    console.log('✅ israeloliveiracontact@gmail.com atualizado para PRO com sucesso!');
  }
}

main();
