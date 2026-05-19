'use client';

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { historyService } from '@/services/history.service';
import { SearchResult } from '@/types/search.types';
import { useSearchStore } from '@/stores/searchStore';
import { useRouter } from 'next/navigation';
import { Trash2, RotateCcw, ExternalLink, Calendar, Search } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setResult } = useSearchStore();
  const router = useRouter();

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await historyService.getHistory();
      if (response.success) {
        setHistory(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover esta busca do histórico?')) return;
    try {
      await historyService.deleteEntry(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Erro ao excluir item');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Deseja limpar TODO o histórico? Esta ação não pode ser desfeita.')) return;
    try {
      await historyService.clearHistory();
      setHistory([]);
    } catch (err) {
      alert('Erro ao limpar histórico');
    }
  };

  const handleReuse = (item: SearchResult) => {
    setResult(item);
    router.push('/');
  };

  return (
    <PageWrapper className="space-y-8 pt-28">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text">Histórico de Buscas</h1>
          <p className="text-muted-foreground text-sm mt-1">Revisite suas buscas anteriores e seus filtros gerados pela IA.</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2.5 text-destructive bg-destructive/5 hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all text-xs font-bold cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Limpar tudo
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <RotateCcw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse text-sm font-semibold">Carregando histórico...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl gap-6 border-dashed border border-border/80 max-w-xl mx-auto text-center p-8">
          <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center border border-border/60 shadow-inner">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-foreground">Nenhuma busca encontrada</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Suas buscas aparecerão aqui automaticamente após usar o scanner do vagas.rankia.cloud.</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:brightness-110 active:scale-95 text-white rounded-xl font-bold transition-all text-xs cursor-pointer shadow-md shadow-primary/25"
          >
            Fazer minha primeira busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <div key={item.id} className="glass glass-hover p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group border border-border/60 shadow-md">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-extrabold text-lg text-foreground line-clamp-1">{item.originalQuery}</h3>
                  <div className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                    {item.filtersApplied} filtros
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-semibold bg-secondary/50 px-2 py-1 rounded-lg border border-border/60">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="bg-secondary/50 px-2 py-1 rounded-lg border border-border/60 font-semibold capitalize">📍 {item.parsedParams.location}</span>
                  <span className="text-accent font-extrabold italic bg-accent/5 px-2 py-1 rounded-lg border border-accent/15">"{item.parsedParams.keywords}"</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-border/80">
                <button
                  onClick={() => handleReuse(item)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary/40 hover:bg-secondary/80 text-foreground border border-border/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-primary" />
                  Reusar
                </button>
                <a
                  href={item.urls.main}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 border border-blue-500/10 rounded-xl transition-all cursor-pointer"
                  title="Abrir no LinkedIn"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/10 rounded-xl transition-all cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
