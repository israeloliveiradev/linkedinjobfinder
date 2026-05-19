'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Sparkles, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { searchService } from '@/services/search.service';
import { useSearchStore } from '@/stores/searchStore';
import { useSession } from '@/lib/auth-client';
import { AdvancedFilters } from './AdvancedFilters';
import { cn } from '@/lib/utils';

export function SearchForm() {
  const [query, setQuery] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [expandKeywords, setExpandKeywords] = useState(true);
  
  const { isLoading, setLoading, setResult, setError, manualFilters } = useSearchStore();
  const { data: session } = useSession();
  const router = useRouter(); // need to import this

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!session) {
      setError('Você precisa estar logado para realizar buscas.');
      return;
    }

    if (query.trim().length < 3) {
      setError('Por favor, digite um cargo ou palavra-chave com pelo menos 3 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await searchService.performSearch(query, expandKeywords, manualFilters);
      if (response.success) {
        setResult(response.data);
      } else {
        if (response.error?.message?.includes('LIMITE_ATINGIDO')) {
          setError('Limite de buscas atingido. Faça o Upgrade para o plano Pro!');
        } else {
          setError(response.error?.message || 'Erro ao processar busca');
        }
      }
    } catch (err: any) {
      const errorObj = err.response?.data?.error;
      let msg = errorObj?.message || err.message;
      
      // If backend validation has detailed fields, show them in a friendly format
      if (errorObj?.details && Array.isArray(errorObj.details) && errorObj.details.length > 0) {
        const firstDetail = errorObj.details[0];
        if (firstDetail.field === 'query') {
          msg = 'A palavra-chave de busca precisa ter pelo menos 3 caracteres.';
        } else if (firstDetail.message) {
          msg = firstDetail.message.replace(/"/g, ''); // Clean quotes for dry Joi texts
        }
      }

      if (msg?.includes('LIMITE_ATINGIDO')) {
        setError('Limite de buscas atingido. Faça o Upgrade para o plano Pro!');
      } else if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError(msg || 'Falha na comunicação com a API');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex flex-col sm:relative group gap-3 sm:gap-0">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cargo, tecnologia ou palavra-chave (ex: React)"
              className="block w-full pl-12 pr-4 sm:pr-[180px] py-4 sm:py-4.5 bg-card/45 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-lg text-base sm:text-lg text-foreground placeholder:text-muted-foreground/60"
              disabled={isLoading}
            />
          </div>
          <div className="w-full sm:w-auto sm:absolute sm:inset-y-2 sm:right-2 flex items-center">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-full sm:w-auto h-12 sm:h-11 px-6 bg-gradient-to-r from-primary to-accent hover:brightness-110 active:scale-98 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/25 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 text-white/95" />
                  <span>Escanear Vagas</span>
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
            "flex items-center gap-2 text-xs transition-colors py-2 px-5 rounded-full border cursor-pointer font-extrabold uppercase tracking-wider",
            isAdvancedOpen 
              ? "bg-primary/10 border-primary text-primary shadow-inner" 
              : "text-muted-foreground border-border/80 bg-card/40 hover:bg-secondary/60 hover:text-foreground"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span>Personalizar Parâmetros</span>
          {isAdvancedOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {isAdvancedOpen && (
          <div className="w-full mt-4 p-6 glass rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl border border-border/60">
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-6">
              <div className="space-y-0.5 text-left">
                <h3 className="font-extrabold text-base text-foreground">⚙️ Ajustes Finos de Pesquisa</h3>
                <p className="text-xs text-muted-foreground">Customize seus parâmetros para sobrepor as decisões da IA.</p>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 p-2 px-3 rounded-xl border border-border/60">
                <span className="text-xs font-bold text-foreground/80">Varredura Semântica</span>
                <button
                  onClick={() => setExpandKeywords(!expandKeywords)}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer",
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
