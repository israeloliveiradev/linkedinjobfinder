'use client';

import { useSearchStore } from '@/stores/searchStore';
import { 
  PERIOD_OPTIONS, 
  WORK_MODE_OPTIONS, 
  EXPERIENCE_OPTIONS, 
  JOB_TYPE_OPTIONS, 
  LOCATION_OPTIONS 
} from '@/constants/filters';
import { cn } from '@/lib/utils';
import { Clock, MapPin, Briefcase, GraduationCap, Laptop, SlidersHorizontal } from 'lucide-react';

export function AdvancedFilters() {
  const { manualFilters, setManualFilter } = useSearchStore();

  const toggleList = (key: 'workModes' | 'experienceLevels' | 'jobTypes', value: string) => {
    const current = manualFilters[key];
    if (current.includes(value)) {
      setManualFilter(key, current.filter(v => v !== value));
    } else {
      setManualFilter(key, [...current, value]);
    }
  };

  return (
    <div className="w-full space-y-6 py-2">
      <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 mb-2">
        <SlidersHorizontal className="w-4 h-4" />
        <p className="text-[11px] font-medium leading-tight">
          <strong>Modo Híbrido Ativo:</strong> Seus ajustes abaixo são prioritários. 
          A IA cuidará apenas das keywords e filtros não selecionados.
        </p>
      </div>

      {/* Localização e Período */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Localização
          </label>
          <select 
            value={manualFilters.location}
            onChange={(e) => setManualFilter('location', e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          >
            {LOCATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Período Postado
          </label>
          <select 
            value={manualFilters.period}
            onChange={(e) => setManualFilter('period', e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          >
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modalidade (Chips) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
          <Laptop className="w-3 h-3" /> Modalidade de Trabalho
        </label>
        <div className="flex flex-wrap gap-2">
          {WORK_MODE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleList('workModes', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                manualFilters.workModes.includes(opt.value)
                  ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                  : "bg-secondary/50 border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experiência (Chips) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
          <GraduationCap className="w-3 h-3" /> Nível de Experiência
        </label>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleList('experienceLevels', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                manualFilters.experienceLevels.includes(opt.value)
                  ? "bg-accent border-accent text-white shadow-md shadow-accent/20"
                  : "bg-secondary/50 border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo de Vaga (Chips) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
          <Briefcase className="w-3 h-3" /> Tipo de Contrato
        </label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleList('jobTypes', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                manualFilters.jobTypes.includes(opt.value)
                  ? "bg-foreground text-background border-foreground font-bold"
                  : "bg-secondary/50 border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
