'use client';

import { signIn } from '@/lib/auth-client';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
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
