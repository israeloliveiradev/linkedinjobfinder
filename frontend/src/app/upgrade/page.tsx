'use client';

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Check, QrCode, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import api from '@/lib/axios';

export default function UpgradePage() {
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'mensal' | 'trimestral'>('mensal');
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

  const userEmail = session?.user?.email || '';
  const planName = 
    billingPeriod === 'mensal' ? 'PRO 1 Mês' : 'PRO 3 Meses';
  const message = encodeURIComponent(`Olá! Acabei de realizar o pagamento do plano ${planName} no vagas.rankia.cloud. Aqui está meu comprovante e meu e-mail de cadastro: ${userEmail}. Poderia liberar meu acesso?`);
  const whatsappUrl = config.whatsapp_number 
    ? `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${message}` 
    : null;

  return (
    <PageWrapper className="py-12 pt-28 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-black text-primary tracking-widest uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Aceleração de Carreira de Elite
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          Multiplique suas Entrevistas com <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Buscas PRO</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Não perca tempo preenchendo formulários infinitos. Filtre vagas de candidatura simplificada, varra o LinkedIn em segundos e aplique antes de 95% dos concorrentes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Plano Free */}
        <div className="flex flex-col glass p-8 rounded-3xl border border-border/60 shadow-lg justify-between gap-6 transition-all hover:border-border">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-foreground">Candidato Essencial</h2>
              <p className="text-xs text-muted-foreground mt-1">Para quem quer conhecer o poder básico do scanner de vagas</p>
            </div>
            <div className="border-y border-border/50 py-4 my-2">
              <span className="text-4xl font-black text-foreground">Grátis</span>
            </div>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-sm text-foreground/80 font-semibold">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span><strong>5 Buscas Completas</strong> no LinkedIn (com todos os filtros liberados)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/80 font-semibold">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span><strong>1 Busca Express</strong> (Candidatura Direta / Easy Apply)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/80 font-semibold">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span><strong>1 de cada uma</strong> das outras 3 buscas de posts ("Vaga", "Contratando", "Currículo")</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Plano Pro */}
        <div className="flex flex-col glass p-8 rounded-3xl border-2 border-primary shadow-2xl relative overflow-hidden justify-between gap-6 transition-all hover:scale-[1.01] shadow-primary/10">
          <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1.5 rounded-bl-2xl text-xs font-black uppercase tracking-wider">
            Recomendado
          </div>
          
          <div className="space-y-4">
            {/* Plan Period Toggle Segmented Control */}
            <div className="flex bg-secondary/60 p-1 rounded-2xl border border-border/60 w-full mb-2">
              <button 
                onClick={() => setBillingPeriod('mensal')}
                className={`flex-1 py-2 text-[11px] uppercase tracking-wider font-black rounded-xl transition-all cursor-pointer ${
                  billingPeriod === 'mensal' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                1 Mês
              </button>
              <button 
                onClick={() => setBillingPeriod('trimestral')}
                className={`flex-1 py-2 text-[11px] uppercase tracking-wider font-black rounded-xl transition-all cursor-pointer ${
                  billingPeriod === 'trimestral' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                3 Meses
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-foreground">
                  {billingPeriod === 'mensal' ? 'Acesso PRO Mensal' : 'Acesso PRO Trimestral'}
                </h2>
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {billingPeriod === 'mensal' 
                  ? 'Acesso ilimitado e imediato a todos os recursos por 1 mês (30 dias)' 
                  : 'Acesso ilimitado e imediato a todos os recursos por 3 meses (90 dias)'}
              </p>
            </div>
            <div className="border-y border-border/50 py-4 my-2">
              <span className="text-4xl font-black text-foreground">
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
                {billingPeriod === 'mensal' ? ' / por 30 dias de acesso' : ' / por 90 dias de acesso'}
              </span>
            </div>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-sm text-foreground/80 font-semibold">
                <Check className="w-5 h-5 text-primary shrink-0" />
                <span><strong>Varreduras ilimitadas</strong> sem bloqueio de cota</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/80 font-semibold">
                <Check className="w-5 h-5 text-primary shrink-0" />
                <span><strong>Copiloto IA de Currículo</strong>: Match Score e Otimizador ATS em tempo real</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/80 font-semibold">
                <Check className="w-5 h-5 text-primary shrink-0" />
                <span><strong>Busca Express Ativa</strong>: Filtre candidatura simplificada (2 cliques)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/80 font-semibold">
                <Check className="w-5 h-5 text-primary shrink-0" />
                <span><strong>Garimpo de Vagas Ocultas</strong> no feed pessoal de contratantes</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/80 font-semibold">
                <Check className="w-5 h-5 text-primary shrink-0" />
                <span>Histórico vitalício & Presets de filtros ilimitados</span>
              </li>
            </ul>
            
            <div className="mt-6 p-5 bg-secondary/40 rounded-2xl space-y-4 text-center border border-border/60">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-foreground">
                <QrCode className="w-4 h-4 text-primary" />
                Escaneie para pagar via PIX
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
              <div className="text-xs break-all bg-card/60 p-3 rounded-xl border border-border/60 text-muted-foreground leading-relaxed min-h-11 flex items-center justify-center">
                {isLoading ? (
                  <span className="inline-block w-48 h-4 bg-muted/65 animate-pulse rounded" />
                ) : (
                  <>
                    <strong className="text-foreground mr-1">Chave PIX:</strong> {config.pix_key || 'Configuração Pendente'}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-6 border-t border-border/80 space-y-3">
            <div className="text-[10px] text-muted-foreground text-center font-semibold">
              *Após o pagamento, envie o comprovante clicando no botão abaixo para liberação imediata.
            </div>
            {whatsappUrl ? (
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent hover:brightness-110 active:scale-95 text-white text-sm font-black transition-all shadow-md shadow-primary/25 cursor-pointer text-center"
              >
                Confirmar & Enviar Comprovante no WhatsApp
              </a>
            ) : (
              <button 
                disabled
                className="w-full h-12 inline-flex items-center justify-center rounded-xl bg-secondary/80 text-muted-foreground text-sm font-bold transition-all cursor-not-allowed"
              >
                Confirmar Pagamento (WhatsApp Indisponível)
              </button>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
