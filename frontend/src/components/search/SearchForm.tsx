'use client';

import { useState } from 'react';
import { Search, Loader2, Sparkles, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { searchService } from '@/services/search.service';
import { useSearchStore } from '@/stores/searchStore';
import { AdvancedFilters } from './AdvancedFilters';
import { cn } from '@/lib/utils';

export function SearchForm() {
  const [query, setQuery] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [expandKeywords, setExpandKeywords] = useState(true);
  
  const { isLoading, setLoading, setResult, setError, manualFilters } = useSearchStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await searchService.performSearch(query, expandKeywords, manualFilters);
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error?.message || 'Erro ao processar busca');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Falha na comunicação com a API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Descreva a vaga que você procura... (ex: Dev React Júnior remoto)"
            className="block w-full pl-11 pr-32 py-4 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-lg text-lg"
            disabled={isLoading}
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="h-full px-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-col items-center">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors py-2 px-4 rounded-full border",
            isAdvancedOpen 
              ? "bg-primary/10 border-primary text-primary" 
              : "text-muted-foreground border-transparent hover:border-border"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filtros Avançados</span>
          {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isAdvancedOpen && (
          <div className="w-full mt-4 p-6 glass rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div className="space-y-0.5">
                <h3 className="font-bold">Personalização</h3>
                <p className="text-xs text-muted-foreground">Estes filtros sobrepõem as decisões da IA.</p>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 p-2 rounded-xl">
                <span className="text-xs font-medium">Expansão de Keywords</span>
                <button
                  onClick={() => setExpandKeywords(!expandKeywords)}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                    expandKeywords ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                      expandKeywords ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
            
            <AdvancedFilters />
          </div>
        )}
      </div>
    </div>
  );
}
