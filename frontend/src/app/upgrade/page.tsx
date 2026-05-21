'use client';

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { 
  Check, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Copy, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Clock, 
  Award, 
  ChevronDown, 
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import api from '@/lib/axios';

export default function UpgradePage() {
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'mensal' | 'trimestral'>('mensal');
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    api.get('/api/admin/config')
      .then(res => {
        setConfig(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleCopyPix = () => {
    if (config.pix_key) {
      navigator.clipboard.writeText(config.pix_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const userEmail = session?.user?.email || '';
  const planName = billingPeriod === 'mensal' ? 'PRO 1 Mês' : 'PRO 3 Meses';
  const message = encodeURIComponent(`Olá! Acabei de realizar o pagamento do plano ${planName} no vagas.rankia.cloud. Aqui está meu comprovante e meu e-mail de cadastro: ${userEmail}. Poderia liberar meu acesso?`);
  const whatsappUrl = config.whatsapp_number 
    ? `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${message}` 
    : null;

  const faqItems = [
    {
      question: "Como é liberado o meu acesso PRO?",
      answer: "A liberação é super rápida e humanizada. Após realizar o pagamento via PIX, basta clicar no botão 'Confirmar & Enviar Comprovante' para nos enviar o comprovante no WhatsApp. Nossa equipe valida e ativa o seu acesso de forma imediata (geralmente em menos de 5 minutos)."
    },
    {
      question: "O Copiloto de Inteligência Artificial é realmente ilimitado?",
      answer: "Sim! No plano PRO, você pode usar o Copiloto de IA para analisar quantas vagas quiser, gerando relatórios de compatibilidade e match scores personalizados para cada uma delas, sem nenhuma cota ou limite diário."
    },
    {
      question: "O que é a 'Busca Express' inclusa no plano?",
      answer: "A Busca Express ativa instantaneamente o filtro 'Candidatura Simplificada' (Easy Apply) do LinkedIn diretamente na sua pesquisa. Isso significa que você poderá se candidatar com apenas 1 clique em segundos, pulando formulários longos em plataformas externas (como Gupy ou Greenhouse)."
    },
    {
      question: "As varreduras de vagas ocultas realmente funcionam?",
      answer: "Funcionam perfeitamente! Grande parte das contratações rápidas no LinkedIn acontecem porque recrutadores postam vagas diretamente nos seus feeds pessoais para economizar custos. O Vagas Rankia faz um mapeamento semântico avançado dessas publicações informais, permitindo que você encontre oportunidades exclusivas e mande mensagem direta para quem está contratando."
    },
    {
      question: "A assinatura é renovada automaticamente?",
      answer: "Não! Nosso sistema é baseado em créditos de tempo pré-pagos (30 ou 90 dias). Você paga uma única vez via PIX e o acesso expira ao final do período. Não fazemos cobranças automáticas no seu cartão, deixando você no controle total de quando quer renovar."
    }
  ];

  const testimonials = config.testimonials && config.testimonials.length > 0
    ? config.testimonials
    : [
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

  return (
    <PageWrapper className="py-12 pt-28 space-y-16">
      
      {/* SECTION Header / Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-black text-primary tracking-widest uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Aceleração de Carreira de Elite
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight animate-in fade-in slide-in-from-top-4 duration-500">
          Multiplique suas Entrevistas com o <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Acesso PRO</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-top-6 duration-600">
          Varra o LinkedIn sem limites de cotas, garimpe vagas ocultas nos feeds dos recrutadores e conte com o Copiloto de I.A. para otimizar seu currículo para os filtros do ATS.
        </p>
      </div>

      {/* SECTION Pricing & Payment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        
        {/* Card: Plano Free */}
        <div className="flex flex-col glass p-8 rounded-3xl border border-border/60 shadow-lg justify-between gap-6 transition-all hover:border-border">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full border border-border/40">Plano Padrão</span>
              <h2 className="text-2xl font-black text-foreground mt-3">Candidato Essencial</h2>
              <p className="text-xs text-muted-foreground mt-1">Para quem quer conhecer o poder básico do scanner de vagas</p>
            </div>
            
            <div className="border-y border-border/50 py-4 my-2 flex items-baseline gap-1">
              <span className="text-4xl font-black text-foreground">Grátis</span>
              <span className="text-xs text-muted-foreground font-semibold">/ para testar</span>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-foreground/80 font-semibold leading-relaxed">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span><strong>5 Buscas Completas</strong> no LinkedIn (com todos os filtros avançados de localização, regime e período)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80 font-semibold leading-relaxed">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span><strong>1 Busca Express</strong> (Candidatura Direta / Easy Apply)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80 font-semibold leading-relaxed">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span><strong>1 busca de posts oculta</strong> de cada categoria (&ldquo;Vaga&rdquo;, &ldquo;Contratando&rdquo;, &ldquo;Currículo&rdquo;)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80 font-semibold leading-relaxed">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span><strong>2 Testes do Copiloto IA</strong> (para analisar compatibilidade ATS e otimizar currículo)</span>
              </li>
            </ul>
          </div>
          
          <div className="pt-6 border-t border-border/40 text-center text-xs font-bold text-muted-foreground leading-relaxed">
            Plano ativo por padrão para novos usuários.
          </div>
        </div>

        {/* Card: Plano Pro */}
        <div className="flex flex-col glass p-8 rounded-3xl border-2 border-primary shadow-2xl relative overflow-hidden justify-between gap-6 transition-all hover:scale-[1.01] shadow-primary/10">
          <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1.5 rounded-bl-2xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Zap className="w-3 h-3 fill-white text-white" />
            Recomendado
          </div>
          
          <div className="space-y-6">
            
            {/* Period Selection Slider/Tab Button */}
            <div className="flex bg-secondary/60 p-1.5 rounded-2xl border border-border/60 w-full mb-2">
              <button 
                onClick={() => setBillingPeriod('mensal')}
                className={`flex-1 py-2 text-[10px] sm:text-[11px] uppercase tracking-wider font-black rounded-xl transition-all cursor-pointer ${
                  billingPeriod === 'mensal' 
                    ? 'bg-primary text-white shadow-md shadow-primary/15' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                1 Mês
              </button>
              <button 
                onClick={() => setBillingPeriod('trimestral')}
                className={`flex-1 py-2 text-[10px] sm:text-[11px] uppercase tracking-wider font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  billingPeriod === 'trimestral' 
                    ? 'bg-primary text-white shadow-md shadow-primary/15' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                3 Meses
                <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">
                  Salvar 16%
                </span>
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Plano Elite</span>
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-foreground mt-3">
                {billingPeriod === 'mensal' ? 'Acesso PRO Mensal' : 'Acesso PRO Trimestral'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {billingPeriod === 'mensal' 
                  ? 'Acesso total e instantâneo por 1 mês (30 dias) para acelerar suas buscas.' 
                  : 'Acesso total e instantâneo por 3 meses (90 dias) com excelente custo-benefício.'}
              </p>
            </div>

            {/* Price Visualization with dynamic discount display */}
            <div className="border-y border-border/50 py-5 my-2 flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-foreground tracking-tight">
                R$ {
                  isLoading ? (
                    <span className="inline-block w-24 h-9 bg-muted/65 animate-pulse rounded-xl align-middle" />
                  ) : (
                    billingPeriod === 'mensal' 
                      ? (config.pro_price_mensal || '19,90') 
                      : (config.pro_price_trimestral || '49,90')
                  )
                }
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {billingPeriod === 'mensal' ? ' / pagamento único' : ' / 3 meses (R$ 16,63/mês)'}
              </span>
            </div>

            {/* Feature Checkmarks List */}
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3 text-sm text-foreground/90 font-semibold leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Varreduras de vagas ilimitadas</strong> (sem bloqueio de limites diários ou mensais)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/90 font-semibold leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Copiloto IA 100% Ilimitado</strong>: analise currículos, valide palavras-chave ATS e compare vagas de forma ilimitada</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/90 font-semibold leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Busca Express Ativada</strong>: filtre candidatura simplificada com 1 clique do LinkedIn</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/90 font-semibold leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Acesso a Vagas Ocultas</strong>: encontre postagens diretas de quem está contratando nos feeds</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/90 font-semibold leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Histórico vitalício & Presets de filtros ilimitados para agilizar buscas</span>
              </li>
            </ul>

            {/* Pix interactive Payment Box */}
            <div className="mt-6 p-5 bg-secondary/40 rounded-3xl space-y-4 border border-border/60 shadow-inner">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-foreground">
                <QrCode className="w-4 h-4 text-primary" />
                1. Escaneie para pagar via PIX
              </div>
              
              {isLoading ? (
                <div className="w-44 h-44 mx-auto bg-card/65 flex items-center justify-center rounded-2xl border border-dashed border-border/80 animate-pulse">
                  <QrCode className="w-10 h-10 text-muted-foreground/30" />
                </div>
              ) : config.qr_code_url ? (
                <img src={config.qr_code_url} alt="QR Code Pix" className="w-44 h-44 mx-auto rounded-2xl object-contain border border-border bg-white p-2 shadow-sm" />
              ) : (
                <div className="w-44 h-44 mx-auto bg-card flex items-center justify-center rounded-2xl border border-dashed border-border/80">
                  <QrCode className="w-10 h-10 text-muted-foreground/60" />
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider text-foreground mt-2">
                  <span>2. Ou Copie a Chave PIX abaixo:</span>
                </div>
                
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full flex items-center justify-between gap-3 text-xs bg-card/70 hover:bg-card px-4 py-3 rounded-xl border border-border/60 hover:border-border text-muted-foreground transition-all duration-200 cursor-pointer min-h-12 text-left"
                >
                  <span className="truncate font-semibold max-w-[200px] sm:max-w-[240px]">
                    {isLoading ? 'Carregando chave...' : (config.pix_key || 'Chave Pix não configurada')}
                  </span>
                  <div className="flex items-center gap-1.5 text-primary shrink-0 font-bold uppercase text-[9px] tracking-wider border border-primary/20 px-2 py-1 rounded bg-primary/5">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-500">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* CTA & WhatsApp Receipt Confirmation */}
          <div className="mt-4 pt-6 border-t border-border/80 space-y-4">
            <div className="text-[10px] text-muted-foreground text-center font-semibold">
              *Após o pagamento, envie o comprovante no WhatsApp para ativação imediata.
            </div>
            {whatsappUrl ? (
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:brightness-110 active:scale-95 text-white text-sm font-black transition-all shadow-md shadow-primary/25 cursor-pointer text-center"
              >
                <span>Confirmar & Enviar Comprovante no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <button 
                disabled
                className="w-full h-12 inline-flex items-center justify-center rounded-xl bg-secondary/80 text-muted-foreground text-sm font-bold transition-all cursor-not-allowed"
              >
                Confirmar Pagamento (WhatsApp Indisponível)
              </button>
            )}
            
            {/* Trust and Safety Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-secondary/35 border border-border/40">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[9px] font-black text-foreground/80 uppercase">Compra Segura</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-secondary/35 border border-border/40">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-[9px] font-black text-foreground/80 uppercase">Acesso Rápido</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-secondary/35 border border-border/40">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-[9px] font-black text-foreground/80 uppercase">Satisfação 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION Testimonials / Social Proof */}
      <div className="space-y-8 max-w-4xl mx-auto border-t border-border/50 pt-16">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Quem usa, recomenda! 🚀
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Descubra como outros profissionais de tecnologia hackearam o processo de candidatura no LinkedIn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t: any, idx: number) => (
            <div key={idx} className="flex flex-col justify-between p-6 bg-card/45 border border-border/50 rounded-3xl hover:border-border transition-all hover:bg-card/70 gap-4">
              <div className="space-y-3.5">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_: any, i: number) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-[12px] sm:text-xs text-foreground/80 leading-relaxed italic">
                  &ldquo;{t.feedback}&rdquo;
                </p>
              </div>
              
              <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-border" />
                <div>
                  <h4 className="text-xs font-black text-foreground">{t.name}</h4>
                  <p className="text-[9px] text-muted-foreground">{t.role}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-[8px] font-bold uppercase tracking-wider">
                    🎉 {t.achievement}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION Accordion FAQ */}
      <div className="space-y-8 max-w-3xl mx-auto border-t border-border/50 pt-16">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/50 border border-border/80 rounded-full text-[10px] font-black text-muted-foreground tracking-widest uppercase">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            Dúvidas Frequentes
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Perguntas Respondidas
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tudo o que você precisa saber antes de fazer o upgrade para o plano PRO.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqItems.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className={`border border-border/60 hover:border-border/90 rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'bg-secondary/40' : 'bg-transparent'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left font-black text-xs sm:text-sm text-foreground/90 transition-all cursor-pointer"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-primary shrink-0 rotate-180 transition-all duration-300" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-all duration-300" />
                  )}
                </button>

                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-40 border-t border-border/40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-6 py-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </PageWrapper>
  );
}
