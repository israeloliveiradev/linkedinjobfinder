'use client';

import { ExternalLink, Copy, Check, Info, Bookmark, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { SearchResult } from '@/types/search.types';
import { presetService } from '@/services/preset.service';
import { cn } from '@/lib/utils';

interface ResultCardProps {
  result: SearchResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedExpress, setCopiedExpress] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetSaved, setPresetSaved] = useState(false);

  const handleSavePreset = async () => {
    const name = prompt('Dê um nome para este preset:');
    if (!name) return;

    setIsSavingPreset(true);
    try {
      await presetService.savePreset(name, result.parsedParams);
      setPresetSaved(true);
      setTimeout(() => setPresetSaved(false), 3000);
    } catch (err) {
      alert('Erro ao salvar preset');
    } finally {
      setIsSavingPreset(false);
    }
  };

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="glass rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Busca Processada</h2>
              <p className="text-muted-foreground text-sm">Gerada em {new Date(result.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSavePreset}
                disabled={isSavingPreset}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  presetSaved 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : "bg-secondary hover:bg-secondary/80 text-foreground border-border"
                )}
              >
                {presetSaved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {presetSaved ? 'Preset Salvo!' : isSavingPreset ? 'Salvando...' : 'Salvar Preset'}
              </button>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
                {result.filtersApplied} filtros ativos
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Keywords Extraídas</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-secondary rounded-lg text-sm font-medium border border-border">
                    {result.parsedParams.keywords}
                  </span>
                  {result.expandedKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm border border-accent/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Filtros de Localização</h3>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <span className="capitalize">{result.parsedParams.location}</span>
                  <span className="text-muted-foreground text-xs font-normal">(GeoId: {result.parsedParams.geoId})</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Resumo de Filtros</h3>
                <div className="flex flex-wrap gap-2">
                  {result.parsedParams.workMode.map(m => (
                    <span key={m} className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-md border border-green-500/20 uppercase font-bold">
                      {m}
                    </span>
                  ))}
                  {result.parsedParams.jobType.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded-md border border-blue-500/20 uppercase font-bold">
                      {t}
                    </span>
                  ))}
                  {result.parsedParams.experienceLevel.map(l => (
                    <span key={l} className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs rounded-md border border-orange-500/20 uppercase font-bold">
                      {l}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-xs rounded-md border border-purple-500/20 uppercase font-bold">
                    {result.parsedParams.period}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">URL Principal do LinkedIn</label>
                <button 
                  onClick={() => copyToClipboard(result.urls.main, setCopiedMain)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {copiedMain ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedMain ? 'Copiado' : 'Copiar URL'}
                </button>
              </div>
              <div className="p-3 bg-black/20 rounded-xl border border-border font-mono text-xs break-all text-muted-foreground line-clamp-2">
                {result.urls.main}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={result.urls.main}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 group"
              >
                <ExternalLink className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Abrir no LinkedIn</span>
              </a>
              <a
                href={result.urls.express}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 glass hover:bg-secondary text-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all group"
              >
                <Sparkles className="h-5 w-5 text-accent group-hover:animate-pulse" />
                <span>Busca Express (Filtros IA)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2 justify-center text-muted-foreground text-sm">
        <Info className="h-4 w-4" />
        <p>Esta busca foi salva automaticamente no seu histórico.</p>
      </div>
    </div>
  );
}
