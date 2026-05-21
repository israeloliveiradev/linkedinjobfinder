import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function main() {
  console.log('🔌 Conectando ao banco de dados via DATABASE_URL...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');

    // 1. Add testimonials column if not exists
    console.log('🛠️ Adicionando a coluna testimonials na tabela admin_config...');
    await client.query(`
      ALTER TABLE admin_config 
      ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('✅ Coluna testimonials garantida!');

    // 2. Pre-populate with our default testimonials if they are empty
    console.log('🚀 Inicializando depoimentos padrões...');
    const defaultTestimonials = [
      {
        name: "Rodrigo Mendonça",
        role: "Desenvolvedor Backend Júnior",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120",
        feedback: "Estava há 3 meses mandando currículo na Gupy sem nenhuma resposta. Em 4 dias usando a Busca Express e o Copiloto de IA para otimizar meu currículo para a descrição da vaga, consegui agendar 2 entrevistas! O investimento se pagou na primeira semana.",
        rating: 5,
        achievement: "Contratado em 12 dias"
      },
      {
        name: "Gabriela Faria",
        role: "Desenvolvedora Frontend",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120",
        feedback: "A busca por posts de vagas ocultas é um divisor de águas. Achei uma postagem de um tech lead contratando React, mandei mensagem direta usando o roteiro e insights gerados pelo Copiloto de IA do app, e fui selecionada. Recomendo de olhos fechados!",
        rating: 5,
        achievement: "Acesso a vaga oculta"
      },
      {
        name: "Marcos Vinícius",
        role: "Engenheiro de Software Fullstack",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120",
        feedback: "Excelente plataforma. A expansão semântica de termos me poupa horas de pesquisa manual no LinkedIn. O plano PRO de 3 meses tem um custo-benefício incrível. A liberação via WhatsApp demorou menos de 2 minutos.",
        rating: 5,
        achievement: "3 entrevistas na semana"
      }
    ];

    // Check if testimonials is currently empty/null or has default value
    const checkResult = await client.query('SELECT testimonials FROM admin_config WHERE id = 1');
    const currentTestimonials = checkResult.rows[0]?.testimonials;

    if (!currentTestimonials || currentTestimonials.length === 0) {
      await client.query(
        'UPDATE admin_config SET testimonials = $1 WHERE id = 1',
        [JSON.stringify(defaultTestimonials)]
      );
      console.log('✅ Depoimentos padrões inicializados com sucesso!');
    } else {
      console.log('ℹ️ A coluna testimonials já possui dados. Nenhuma sobreposição foi feita.');
    }

  } catch (err) {
    console.error('❌ Erro na migração:', err.message);
  } finally {
    await client.end();
    console.log('🔌 Conexão encerrada.');
  }
}

main();
