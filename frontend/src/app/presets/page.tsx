'use client';

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { presetService } from '@/services/preset.service';
import { Preset } from '@/types/search.types';
import { useSearchStore } from '@/stores/searchStore';
import { useRouter } from 'next/navigation';
import { Bookmark, Play, Trash2, Calendar, Search, MapPin, Briefcase } from 'lucide-react';

export default function PresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setResult } = useSearchStore();
  const router = useRouter();

  const loadPresets = async () => {
    setIsLoading(true);
    try {
      const response = await presetService.getPresets();
      if (response.success) {
        setPresets(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  const handleDelete = async (name: string) => {
    if (!confirm(`Deseja remover o preset "${name}"?`)) return;
    try {
      await presetService.deletePreset(name);
      setPresets(prev => prev.filter(p => p.name !== name));
    } catch (err) {
      alert('Erro ao excluir preset');
    }
  };

  const handleUse = (preset: Preset) => {
    // Para usar um preset, o backend já processou, mas aqui no v4 
    // presets salvam os PARAMS. Precisamos disparar uma busca real ou apenas mostrar os links?
    // Vamos redirecionar para a home com o termo de busca do preset.
    router.push(`/?query=${encodeURIComponent(preset.params.keywords)}`);
  };

  return (
    <PageWrapper className="space-y-8 pt-28">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text">Meus Presets</h1>
        <p className="text-muted-foreground text-sm mt-1">Suas configurações de busca favoritas para acesso rápido.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Bookmark className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse text-sm font-semibold">Carregando presets...</p>
        </div>
      ) : presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl gap-6 border-dashed border border-border/80 max-w-xl mx-auto text-center p-8">
          <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center border border-border/60 shadow-inner">
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-foreground">Nenhum preset salvo</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Salve uma busca como preset no card de resultados para vê-la aqui.</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:brightness-110 active:scale-95 text-white rounded-xl font-bold transition-all text-xs cursor-pointer shadow-md shadow-primary/25"
          >
            Começar uma busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map((preset) => (
            <div key={preset.id} className="glass glass-hover p-6 rounded-3xl flex flex-col justify-between gap-6 hover:border-primary/50 transition-all group relative overflow-hidden shadow-md border border-border/60">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bookmark className="w-12 h-12 text-primary" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-foreground line-clamp-1">{preset.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    Criado em {new Date(preset.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2.5 py-2.5 border-y border-border/50">
                  <div className="flex items-center gap-2 text-sm text-foreground font-extrabold">
                    <Briefcase className="w-4 h-4 text-primary shrink-0" />
                    <span className="line-clamp-1">{preset.params.keywords}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                    <MapPin className="w-4 h-4 text-accent shrink-0" />
                    <span className="capitalize">{preset.params.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-secondary/50 text-[9px] rounded-lg font-black uppercase tracking-wider border border-border/60 text-muted-foreground">{preset.params.period}</span>
                  {preset.params.workMode.slice(0, 1).map(m => (
                    <span key={m} className="px-2.5 py-1 bg-green-500/10 text-green-500 text-[9px] rounded-lg font-black uppercase tracking-wider border border-green-500/20">{m}</span>
                  ))}
                  {preset.params.jobType.slice(0, 1).map(t => (
                    <span key={t} className="px-2.5 py-1 bg-blue-500/10 text-blue-500 text-[9px] rounded-lg font-black uppercase tracking-wider border border-blue-500/20">{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border/80 mt-auto">
                <button
                  onClick={() => handleUse(preset)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent hover:brightness-110 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Usar Preset
                </button>
                <button
                  onClick={() => handleDelete(preset.name)}
                  className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/10 rounded-xl transition-all cursor-pointer"
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
