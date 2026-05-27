'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { SearchForm } from '@/components/search/SearchForm';
import { ResultCard } from '@/components/results/ResultCard';
import { Skeleton } from '@/components/common/Skeleton';
import { useSearchStore } from '@/stores/searchStore';
import { AlertCircle, Activity, Search, ShieldCheck, Compass, Loader2 } from 'lucide-react';

export default function Home() {
  const { currentResult, error, isLoading } = useSearchStore();

  return (
    <PageWrapper className="flex flex-col items-center gap-14 pt-28">
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary tracking-widest uppercase shadow-sm">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span>vagas.rankia.cloud Engine v4</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none text-foreground">
          Localizador de Vagas <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-black">Profissional</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Mapeie o feed e os bancos de dados do LinkedIn, Gupy, Indeed e Glassdoor de forma cirúrgica. Filtre consultorias de massa, expurgue spam de recrutamento e encontre as melhores vagas de forma instantânea.
        </p>
      </div>

      <div className="w-full max-w-3xl glass p-1.5 rounded-3xl shadow-2xl border border-border/60">
        <SearchForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="glass glass-hover p-6 space-y-3 rounded-3xl border border-border/40 text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base">Varredura Semântica</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Mapeamento semântico completo que resolve sinônimos e termos equivalentes de mercado.</p>
        </div>
        <div className="glass glass-hover p-6 space-y-3 rounded-3xl border border-border/40 text-center">
          <div className="w-12 h-12 bg-accent/10 text-accent border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base">Expurgo de Spam</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Remoção cirúrgica de agências e terceirizadas massivas para priorizar contratação direta.</p>
        </div>
        <div className="glass glass-hover p-6 space-y-3 rounded-3xl border border-border/40 text-center">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base">Mapeamento de GeoIDs</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Segmentação por regiões exatas baseada nos identificadores geográficos oficiais.</p>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-3xl p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in fade-in zoom-in-95">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="w-full max-w-4xl space-y-6 animate-in fade-in duration-500 text-center py-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl text-xs sm:text-sm font-bold text-primary animate-pulse shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>Escaneando e blindando seus links no LinkedIn, Gupy, Indeed & Glassdoor agora...</span>
          </div>
          <div className="glass p-8 rounded-3xl space-y-6 text-left">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-border">
              <Skeleton className="h-20 w-full rounded-xl" />
              <div className="flex gap-4">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 flex-1 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentResult && !isLoading && (
        <ResultCard result={currentResult} />
      )}
    </PageWrapper>
  );
}
