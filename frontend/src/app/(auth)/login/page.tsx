'use client';

import { useState, useEffect } from 'react';
import { signIn } from '@/lib/auth-client';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LogIn, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const [isWebView, setIsWebView] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent || '';
      // Detecta triggers comuns de WebView / In-App browser
      const isUAWebView = /wv|WebView|FBAV|FB_IAB|Instagram|LinkedInApp|WhatsApp/i.test(ua) || 
                          (ua.includes('iPhone') && !ua.includes('Safari') && !ua.includes('CriOS'));
      setIsWebView(isUAWebView);
    }
  }, []);

  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/`
    });
  };

  return (
    <PageWrapper className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-card text-card-foreground shadow-2xl rounded-2xl border border-white/5 text-center">
        <h1 className="text-3xl font-black mb-2 text-foreground">
          vagas.<span className="text-primary font-black">rankia</span><span className="text-muted-foreground font-semibold text-sm">.cloud</span>
        </h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Entre de forma segura com sua conta Google para continuar sua busca inteligente de vagas.
        </p>

        {isWebView && (
          <div className="mb-6 p-4.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex gap-3 text-left animate-in fade-in duration-300">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-amber-500 font-extrabold text-xs uppercase tracking-wider block">⚠️ Navegador Limitado Detectado</strong>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você abriu este link de dentro de outro aplicativo. O Google impede o login de forma segura nesses ambientes.
              </p>
              <p className="text-[11px] text-foreground font-bold pt-1.5 leading-relaxed">
                Para resolver: clique nos três pontinhos (<span className="text-amber-500 font-black">...</span>) ou no botão de compartilhar e escolha <span className="underline text-amber-500">"Abrir no Safari"</span> ou <span className="underline text-amber-500">"Abrir no navegador"</span>.
              </p>
            </div>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:brightness-110 active:scale-98 text-white text-lg font-bold transition-all shadow-md shadow-primary/20 cursor-pointer border-none"
        >
          <LogIn className="w-5 h-5" />
          Continuar com Google
        </button>
      </div>
    </PageWrapper>
  );
}

