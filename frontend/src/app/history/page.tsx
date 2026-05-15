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
    <PageWrapper className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Buscas</h1>
          <p className="text-muted-foreground">Revisite suas buscas anteriores e seus filtros gerados pela IA.</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Limpar tudo
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <RotateCcw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Carregando histórico...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 glass rounded-3xl gap-4 border-dashed border-2">
          <div className="p-4 bg-secondary rounded-full">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold">Nenhuma busca encontrada</h3>
            <p className="text-muted-foreground">Suas buscas aparecerão aqui automaticamente.</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-2 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Fazer minha primeira busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <div key={item.id} className="glass p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary/50 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg line-clamp-1">{item.originalQuery}</h3>
                  <div className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                    {item.filtersApplied} filtros
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="capitalize">📍 {item.parsedParams.location}</span>
                  <span className="text-accent font-medium italic">"{item.parsedParams.keywords}"</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleReuse(item)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reusar
                </button>
                <a
                  href={item.urls.main}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 rounded-xl transition-colors"
                  title="Abrir no LinkedIn"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
