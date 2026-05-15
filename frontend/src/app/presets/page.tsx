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
    <PageWrapper className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Meus Presets</h1>
        <p className="text-muted-foreground">Suas configurações de busca favoritas para acesso rápido.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Bookmark className="w-8 h-8 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando presets...</p>
        </div>
      ) : presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 glass rounded-3xl gap-4 border-dashed border-2">
          <div className="p-4 bg-secondary rounded-full">
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold">Nenhum preset salvo</h3>
            <p className="text-muted-foreground">Salve uma busca como preset para vê-la aqui.</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-2 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Começar uma busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map((preset) => (
            <div key={preset.id} className="glass p-6 rounded-3xl flex flex-col justify-between gap-6 hover:border-primary/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bookmark className="w-12 h-12 text-primary" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground line-clamp-1">{preset.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Criado em {new Date(preset.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2 py-2">
                  <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="line-clamp-1">{preset.params.keywords}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="capitalize">{preset.params.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-secondary text-[10px] rounded font-bold uppercase">{preset.params.period}</span>
                  {preset.params.workMode.slice(0, 1).map(m => (
                    <span key={m} className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] rounded font-bold uppercase border border-green-500/20">{m}</span>
                  ))}
                  {preset.params.jobType.slice(0, 1).map(t => (
                    <span key={t} className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] rounded font-bold uppercase border border-blue-500/20">{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border mt-auto">
                <button
                  onClick={() => handleUse(preset)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Usar Preset
                </button>
                <button
                  onClick={() => handleDelete(preset.name)}
                  className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
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
