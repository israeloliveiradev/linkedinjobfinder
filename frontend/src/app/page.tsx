'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { SearchForm } from '@/components/search/SearchForm';
import { ResultCard } from '@/components/results/ResultCard';
import { Skeleton } from '@/components/common/Skeleton';
import { useSearchStore } from '@/stores/searchStore';
import { AlertCircle, Sparkles, SlidersHorizontal, Briefcase } from 'lucide-react';

export default function Home() {
  const { currentResult, error, isLoading } = useSearchStore();

  return (
    <PageWrapper className="flex flex-col items-center gap-12">
      <div className="text-center space-y-4 pt-12">
        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient">
          Busca <span className="italic">Impossível</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          O primeiro buscador de empregos que entende **contexto**. 
          Use linguagem natural ou trave seus filtros favoritos para uma precisão de 99%.
        </p>
      </div>

      <div className="w-full max-w-3xl glass p-1 rounded-3xl shadow-2xl border-white/5">
        <SearchForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-center">
        <div className="p-4 space-y-2">
          <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold">IA Semântica</h3>
          <p className="text-xs text-muted-foreground">Extraímos intenção de frases complexas.</p>
        </div>
        <div className="p-4 space-y-2">
          <div className="w-10 h-10 bg-accent/20 text-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="font-bold">Filtros Blindados</h3>
          <p className="text-xs text-muted-foreground">O que você seleciona manualmente é lei.</p>
        </div>
        <div className="p-4 space-y-2">
          <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="font-bold">GeoIDs Reais</h3>
          <p className="text-xs text-muted-foreground">Localização exata via banco de dados global.</p>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-3xl p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in fade-in zoom-in-95">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="w-full max-w-4xl space-y-6 animate-in fade-in duration-500">
          <div className="glass p-8 rounded-3xl space-y-6">
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
