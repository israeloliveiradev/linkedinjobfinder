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
import { Clock, MapPin, Briefcase, GraduationCap, Laptop, SlidersHorizontal, Star } from 'lucide-react';

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
      <div className="flex items-center gap-3.5 p-4.5 bg-primary/10 border border-primary/20 rounded-2xl text-foreground mb-4 animate-in fade-in duration-300">
        <div className="p-2.5 bg-primary/20 rounded-xl text-primary shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <span className="font-extrabold text-xs uppercase text-primary tracking-wider block">🛡️ Filtros Blindados Ativos</span>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Suas escolhas manuais são lei e estão 100% protegidas. A IA respeita suas decisões e complementa os demais critérios com inteligência de mercado.
          </p>
        </div>
      </div>

      {/* Localização, Período e Avaliação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex flex-wrap items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Localização
              <span className="text-[8px] font-bold text-muted-foreground/35 tracking-wider uppercase ml-1">
                (LinkedIn, Gupy & Indeed)
              </span>
            </label>
          </div>
          <select 
            value={manualFilters.location}
            onChange={(e) => setManualFilter('location', e.target.value)}
            className="w-full bg-secondary/45 border border-border/80 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground cursor-pointer"
          >
            {LOCATION_OPTIONS.map((opt, i) => (
              <option 
                key={`${opt.value}-${i}`} 
                value={opt.value} 
                disabled={(opt as any).disabled}
                className="bg-card text-foreground"
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex flex-wrap items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" /> Período Postado
              <span className="text-[8px] font-bold text-muted-foreground/35 tracking-wider uppercase ml-1">
                (LinkedIn, Gupy & Indeed)
              </span>
            </label>
          </div>
          <select 
            value={manualFilters.period}
            onChange={(e) => setManualFilter('period', e.target.value)}
            className="w-full bg-secondary/45 border border-border/80 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground cursor-pointer"
          >
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-card text-foreground">{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex flex-wrap items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-emerald-500" /> Nota da Empresa
              <span className="text-[8px] font-bold text-muted-foreground/35 tracking-wider uppercase ml-1">
                (Apenas Glassdoor)
              </span>
            </label>
          </div>
          <select 
            value={manualFilters.minRating || '4.0'}
            onChange={(e) => setManualFilter('minRating', e.target.value)}
            className="w-full bg-secondary/45 border border-border/80 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground cursor-pointer"
          >
            <option value="4.0" className="bg-card text-foreground">⭐ 4.0+ (Elite)</option>
            <option value="3.5" className="bg-card text-foreground">⭐ 3.5+ (Excelente)</option>
            <option value="3.0" className="bg-card text-foreground">⭐ 3.0+ (Boa)</option>
            <option value="" className="bg-card text-foreground">Sem Limite</option>
          </select>
        </div>
      </div>

      {/* Modalidade (Chips) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex flex-wrap items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-primary" /> Modalidade de Trabalho
            <span className="text-[8px] font-bold text-muted-foreground/35 tracking-wider uppercase ml-1">
              (LinkedIn, Gupy & Indeed)
            </span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {WORK_MODE_OPTIONS.map(opt => {
            const isActive = manualFilters.workModes.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleList('workModes', opt.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none active:scale-95",
                  isActive
                    ? "bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5"
                    : "bg-secondary/20 border-white/5 text-muted-foreground hover:border-white/10 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experiência (Chips) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex flex-wrap items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-accent" /> Nível de Experiência
            <span className="text-[8px] font-bold text-muted-foreground/35 tracking-wider uppercase ml-1">
              (LinkedIn & Indeed)
            </span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map(opt => {
            const isActive = manualFilters.experienceLevels.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleList('experienceLevels', opt.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none active:scale-95",
                  isActive
                    ? "bg-accent/10 border-accent text-accent shadow-sm shadow-accent/5"
                    : "bg-secondary/20 border-white/5 text-muted-foreground hover:border-white/10 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tipo de Vaga (Chips) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex flex-wrap items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-emerald-500" /> Tipo de Contrato
            <span className="text-[8px] font-bold text-muted-foreground/35 tracking-wider uppercase ml-1">
              (LinkedIn & Indeed)
            </span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPE_OPTIONS.map(opt => {
            const isActive = manualFilters.jobTypes.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleList('jobTypes', opt.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none active:scale-95",
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm"
                    : "bg-secondary/20 border-white/5 text-muted-foreground hover:border-white/10 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full border-t border-border/80 pt-5 mt-5 space-y-5">
        {/* Anti-Spam de Consultorias */}
        <div className="flex flex-col gap-4 bg-card/45 p-4 rounded-2xl border border-border/80 shadow-sm transition-all hover:border-red-500/20">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-foreground flex flex-wrap items-center gap-1.5">
              🛡️ Bloqueio de Spam (Consultorias & RH)
              <span className="text-[8px] font-bold text-muted-foreground/35 tracking-wider uppercase ml-1">
                (Apenas LinkedIn)
              </span>
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-[11px] text-muted-foreground block leading-relaxed max-w-xl">
              Expurgue automaticamente da busca agências de recrutamento massivo e consultorias terceirizadas (BairesDev, Turing, GeekHunter). Veja apenas contratações diretas.
            </span>
            <div className="pt-0.5">
              <button
                onClick={() => setManualFilter('antiSpam', !manualFilters.antiSpam)}
                className={cn(
                  "relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors cursor-pointer",
                  manualFilters.antiSpam ? "bg-red-500 shadow-md shadow-red-500/25" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                    manualFilters.antiSpam ? "translate-x-5.5" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Excluir Palavras-Chave */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex flex-wrap items-center gap-1.5">
              ❌ Excluir Palavras-Chave (Filtro Negativo)
              <span className="text-[8px] font-bold text-muted-foreground/35 tracking-wider uppercase ml-1">
                (LinkedIn & Indeed)
              </span>
            </label>
          </div>
          <input
            type="text"
            value={manualFilters.negativeKeywords}
            onChange={(e) => setManualFilter('negativeKeywords', e.target.value)}
            placeholder="ex: Angular, PHP, WordPress, Java (separe por vírgula)"
            className="w-full bg-secondary/45 border border-border/80 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="pt-2.5 flex items-center gap-2 justify-center text-[10px] text-muted-foreground/60 border-t border-border/40 mt-4 select-none">
        <span>💡 Nota: O LinkedIn suporta 100% dos parâmetros. Indeed e Gupy adaptam a busca com base nos filtros suportados.</span>
      </div>
    </div>
  );
}
