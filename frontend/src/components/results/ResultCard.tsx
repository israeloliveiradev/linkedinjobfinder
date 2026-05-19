'use client';

import { ExternalLink, Copy, Check, Info, Bookmark, Zap, Activity, Terminal, MessageSquare, Globe, Lock, Sparkles, FileText, AlertCircle, RefreshCw, Trash2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResult } from '@/types/search.types';
import { presetService } from '@/services/preset.service';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

interface ResultCardProps {
  result: SearchResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const router = useRouter();
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetSaved, setPresetSaved] = useState(false);
  const [showCargoInfo, setShowCargoInfo] = useState(false);

  // AI Copilot State Hooks
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState('');
  const [copilotResult, setCopilotResult] = useState<any>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Nuvem PRO Resumes Library State Hooks
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isSavingResumeCloud, setIsSavingResumeCloud] = useState<boolean>(false);
  const [clickedFeatures, setClickedFeatures] = useState<string[]>([]);

  const handleFeatureClick = async (featureName: string) => {
    try {
      setClickedFeatures(prev => [...prev, featureName]);
      await api.post('/api/search/use-feature', { feature: featureName });
    } catch (err) {
      console.error('[Feature Tracker Error]', err);
    }
  };

  const isPro = !!result.parsedParams.recruiterAdvice;

  // Hydration-safe localStorage reading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setResumeText(localStorage.getItem('em_resume_text') || '');
    }
  }, []);

  const loadResumes = async () => {
    try {
      const res = await api.get('/api/resumes');
      if (res.data?.success) {
        setSavedResumes(res.data.data || []);
      }
    } catch (err) {
      console.error('[Resumes Load]', err);
    }
  };

  useEffect(() => {
    if (isPro) {
      loadResumes();
    }
  }, [isPro]);

  const handleSelectResume = (id: string) => {
    setSelectedResumeId(id);
    if (id === '') return;
    const selected = savedResumes.find(r => r.id === id);
    if (selected) {
      handleSaveResumeLocal(selected.content);
    }
  };

  const handleSaveToCloud = async () => {
    if (!resumeText.trim()) return;
    const title = prompt('Dê um título para salvar este currículo na sua biblioteca PRO:', `Currículo ${new Date().toLocaleDateString()}`);
    if (!title) return;
    
    setIsSavingResumeCloud(true);
    try {
      const res = await api.post('/api/resumes', {
        title,
        content: resumeText
      });
      if (res.data?.success) {
        alert('Currículo salvo na sua biblioteca PRO com sucesso!');
        await loadResumes();
        setSelectedResumeId(res.data.data.id);
      }
    } catch (err) {
      alert('Erro ao salvar currículo na nuvem.');
    } finally {
      setIsSavingResumeCloud(false);
    }
  };

  const handleDeleteFromCloud = async () => {
    if (!selectedResumeId) return;
    if (!confirm('Deseja excluir este currículo da sua biblioteca PRO?')) return;
    try {
      await api.delete(`/api/resumes/${selectedResumeId}`);
      setSelectedResumeId('');
      await loadResumes();
    } catch (err) {
      alert('Erro ao excluir currículo.');
    }
  };

  const handleSaveResumeLocal = (val: string) => {
    setResumeText(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('em_resume_text', val);
    }
  };

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

  const handleRunCopilot = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setCopilotError('Insira seu currículo e a descrição da vaga para analisar.');
      return;
    }
    setCopilotLoading(true);
    setCopilotError('');
    try {
      const res = await api.post('/api/search/copilot', {
        resumeText,
        jobDescription,
        keywords: result.parsedParams.keywords
      });
      setCopilotResult(res.data);
    } catch (err: any) {
      console.error(err);
      setCopilotError(err.response?.data?.error || 'Não foi possível conectar com o Copiloto.');
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleCopyText = (text: string, type: 'pitch' | 'letter') => {
    navigator.clipboard.writeText(text);
    if (type === 'pitch') {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } else {
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="glass rounded-3xl overflow-hidden shadow-2xl border border-border/60">
        <div className="p-6 sm:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                🟢 Processamento Concluído
              </div>
              <h2 className="text-2xl font-black text-foreground">Resultado do Scanner</h2>
              <p className="text-muted-foreground text-xs mt-1">Gerada em {new Date(result.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSavePreset}
                disabled={isSavingPreset}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                  presetSaved 
                    ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-md shadow-green-500/10" 
                    : "bg-secondary/40 hover:bg-secondary/80 text-foreground border-border/80"
                )}
              >
                {presetSaved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {presetSaved ? 'Preset Salvo!' : isSavingPreset ? 'Salvando...' : 'Salvar Preset'}
              </button>
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-extrabold uppercase tracking-wider">
                {result.filtersApplied} filtros ativos
              </div>
            </div>
          </div>

          {/* AI Recruiter Advisor box */}
          {result.parsedParams.recruiterAdvice ? (
            <div className="flex gap-4 p-5 bg-secondary/20 border border-border/80 rounded-2xl text-foreground text-sm animate-in fade-in duration-300">
              <div className="bg-primary/10 p-2.5 rounded-xl h-fit border border-primary/20 text-primary">
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-xs uppercase text-primary tracking-wider block">Análise de Mercado & Recomendação</span>
                <p className="text-muted-foreground leading-relaxed text-[13px]">{result.parsedParams.recruiterAdvice}</p>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => router.push('/upgrade')}
              className="flex gap-4 p-5 bg-secondary/10 border border-dashed border-border/80 hover:border-primary/50 transition-all rounded-2xl text-foreground text-sm cursor-pointer group animate-in fade-in duration-300"
            >
              <div className="bg-secondary/40 p-2.5 rounded-xl h-fit border border-border text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <span className="font-black text-xs uppercase text-muted-foreground group-hover:text-primary tracking-wider block transition-colors">
                  🔒 Dica do Recrutador IA (Apenas Plano PRO)
                </span>
                <p className="text-muted-foreground leading-relaxed text-[12px]">
                  Assinantes PRO recebem análises de mercado detalhadas e recomendações estratégicas exclusivas e automatizadas geradas pela IA para se destacar nos processos seletivos desta busca. <span className="text-primary font-bold hover:underline">Clique para fazer o upgrade.</span>
                </p>
              </div>
            </div>
          )}

          {/* AI Job Matcher & Pitch Copilot Container */}
          <div className="glass p-6 rounded-3xl border border-border/60 shadow-lg space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary animate-pulse">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    🤖 Copiloto IA de Candidatura & Currículo
                    <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                      Top Feature
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Calcule o Match Score do currículo e crie pitches de abordagem para recrutadores</p>
                </div>
              </div>
            </div>

            {/* If user is FREE, render lock overlay */}
            {!isPro ? (
              <div className="relative p-6 bg-card/10 border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center mb-3 animate-bounce">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-foreground">Copiloto IA Bloqueado (Recurso de Elite)</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">
                    Copie a descrição de uma vaga do LinkedIn, cole seu currículo e obtenha a compatibilidade (Match Score), checklist de habilidades em falta e pitches de apresentação personalizados!
                  </p>
                  <button 
                    onClick={() => router.push('/upgrade')}
                    className="h-10 px-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer"
                  >
                    Fazer Upgrade para Plano PRO
                  </button>
                </div>
                {/* Mock view to look like a premium locked dashboard */}
                <div className="w-full opacity-20 pointer-events-none select-none space-y-4 text-left">
                  <div className="h-20 bg-secondary rounded-xl" />
                  <div className="h-32 bg-secondary rounded-xl" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resume Paste (with cloud-persistence library) */}
                  <div className="space-y-2">
                    <div className="h-7 flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        Cole seu Currículo / Experiências
                      </label>
                      {isPro && savedResumes.length > 0 && (
                        <div className="flex items-center gap-1">
                          <select
                            value={selectedResumeId}
                            onChange={(e) => handleSelectResume(e.target.value)}
                            className="bg-secondary/60 border border-border rounded-lg pl-2.5 pr-7 py-0.5 text-[9px] font-extrabold text-foreground outline-none cursor-pointer max-w-[180px] transition-all hover:bg-secondary/80 focus:ring-1 focus:ring-primary"
                          >
                            <option value="">📂 Selecionar Salvo...</option>
                            {savedResumes.map((r: any) => (
                              <option key={r.id} value={r.id}>
                                📄 {r.title}
                              </option>
                            ))}
                          </select>
                          {selectedResumeId && (
                            <button
                              type="button"
                              onClick={handleDeleteFromCloud}
                              className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-all cursor-pointer"
                              title="Excluir currículo salvo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <textarea
                      rows={5}
                      className="w-full rounded-2xl border border-border bg-card/40 px-3.5 py-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 resize-none font-sans leading-relaxed"
                      placeholder="Cole aqui o texto do seu Currículo, LinkedIn ou lista de tecnologias..."
                      value={resumeText}
                      onChange={e => handleSaveResumeLocal(e.target.value)}
                    />
                    
                    {isPro && resumeText.trim() && (
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-[9px] text-muted-foreground/50">
                          {resumeText.length} caracteres digitados
                        </span>
                        <button
                          type="button"
                          onClick={handleSaveToCloud}
                          disabled={isSavingResumeCloud}
                          className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-primary hover:text-white transition-all cursor-pointer bg-primary/10 hover:bg-primary border border-primary/20 hover:border-primary px-2.5 py-1 rounded-lg"
                        >
                          <Save className="w-3 h-3" />
                          {isSavingResumeCloud ? 'Salvando...' : 'Salvar na Biblioteca Cloud'}
                        </button>
                      </div>
                    )}
                  </div>
 
                  {/* Job Description paste */}
                  <div className="space-y-2">
                    <div className="h-7 flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-accent" />
                        Cole a Descrição da Vaga que Encontrou
                      </label>
                    </div>
                    <textarea
                      rows={5}
                      className="w-full rounded-2xl border border-border bg-card/40 px-3.5 py-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 resize-none font-sans"
                      placeholder="Abra a vaga no LinkedIn, copie as atribuições/requisitos e cole aqui..."
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                    />
                  </div>
                </div>

                {copilotError && (
                  <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-shake">
                    <AlertCircle className="w-4 h-4" />
                    <span>{copilotError}</span>
                  </div>
                )}

                <button
                  onClick={handleRunCopilot}
                  disabled={copilotLoading}
                  className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent hover:brightness-110 disabled:pointer-events-none disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer gap-2"
                >
                  {copilotLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analisando Requisitos & Gerando Pitches Inteligentes...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analisar Vaga & Gerar Abordagem Personalizada com I.A.</span>
                    </>
                  )}
                </button>

                {/* Copilot Result Dashboard */}
                {copilotResult && (
                  <div className="pt-6 border-t border-border/50 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
                    {/* Left: Circle Score */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center bg-[#0a0a0c]/60 border border-border/60 p-6 rounded-2xl text-center space-y-3 relative overflow-hidden shadow-inner">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Match Score de I.A.</span>
                      <div className="relative inline-flex items-center justify-center">
                        <div className="w-28 h-28 rounded-full border-4 border-border flex items-center justify-center shadow-md">
                          <span className={cn(
                            "text-3xl font-black font-mono tracking-tight",
                            copilotResult.matchScore >= 80 ? "text-green-500" :
                            copilotResult.matchScore >= 50 ? "text-amber-500" : "text-destructive"
                          )}>
                            {copilotResult.matchScore}%
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                        copilotResult.matchScore >= 80 ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                        copilotResult.matchScore >= 50 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        "bg-destructive/10 text-destructive border border-destructive/20"
                      )}>
                        {copilotResult.matchScore >= 80 ? "Altamente Compatível" :
                         copilotResult.matchScore >= 50 ? "Compatibilidade Média" : "Baixa Compatibilidade"}
                      </div>
                    </div>

                    {/* Right: Analysis & Missing Keywords */}
                    <div className="lg:col-span-8 space-y-4">
                      {/* Analysis Block */}
                      <div className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-primary" />
                          Análise de Requisitos
                        </h4>
                        <p className="text-[13px] text-foreground leading-relaxed">
                          {copilotResult.matchAnalysis}
                        </p>
                      </div>

                      {/* Missing Keywords Block */}
                      <div className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          Palavras-chave & Competências em Falta (ATS)
                        </h4>
                        {copilotResult.missingKeywords && copilotResult.missingKeywords.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {copilotResult.missingKeywords.map((kw: string) => (
                              <span 
                                key={kw} 
                                className="px-2.5 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                              >
                                ✖ {kw}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-xs font-bold">
                            ✓ Excelente! Seu currículo cobre 100% dos requisitos principais da vaga analisada.
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 leading-normal pt-1">
                          Recomendação: Insira estes termos em sua descrição de experiências para passar nos crivos iniciais de RH e sistemas ATS.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Console de Varredura & Shield de Segurança */}
          <div className="w-full bg-[#0a0a0c]/80 border border-white/5 rounded-2xl p-4.5 font-mono text-[11px] text-muted-foreground space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                vagas.rankia.cloud — SCANNER_ACTIVE
              </span>
              <span className="text-white/30 text-[10px]">v4.0.0</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="space-y-1">
                <span className="text-white/40 block">SHIELD STATUS:</span>
                <span className="text-emerald-400 font-bold">🛡️ BLINDADO</span>
              </div>
              <div className="space-y-1">
                <span className="text-white/40 block">ANTI-SPAM CONTROLS:</span>
                <span className="text-white/90 font-bold">🔒 ATIVO</span>
              </div>
              <div className="space-y-1">
                <span className="text-white/40 block">KEYWORDS EXPANSION:</span>
                <span className="text-white/90 font-bold">🔎 {result.expandedKeywords.length + 1} HITS</span>
              </div>
              <div className="space-y-1">
                <span className="text-white/40 block">LOCATION GEOID:</span>
                <span className="text-white/90 font-bold">📍 RESOLVED</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Cargos alternativos da IA */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                    🔎 Mapeamento Semântico de Cargos
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setShowCargoInfo(!showCargoInfo)}
                    className="p-1 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    title="O que é isso?"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showCargoInfo && (
                  <div className="p-4 bg-secondary/60 border border-border/80 rounded-2xl text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    📌 <strong>Por que tantas variações?</strong> O motor de vagas.rankia.cloud analisa o cargo digitado e expande automaticamente a pesquisa com sinônimos e equivalentes de mercado (inclusive em inglês). 
                    <br />
                    <span className="text-foreground font-semibold">Todas elas são usadas simultaneamente</span> na mesma consulta para mapear 100% das vagas disponíveis, garantindo que você não perca nenhuma oportunidade só porque o recrutador cadastrou a vaga sob um nome alternativo.
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <span className="px-3.5 py-1.5 bg-secondary/80 rounded-xl text-xs font-extrabold border border-border/80 text-foreground">
                    {result.parsedParams.keywords}
                  </span>
                  {result.expandedKeywords && result.expandedKeywords.length > 0 ? (
                    result.expandedKeywords.map((kw, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-secondary/20 text-foreground/80 rounded-xl text-xs border border-white/5 font-extrabold">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <button 
                      onClick={() => router.push('/upgrade')}
                      className="px-3.5 py-1.5 bg-secondary/10 hover:bg-primary/5 hover:border-primary/30 text-muted-foreground/60 hover:text-primary rounded-xl text-xs border border-dashed border-border/80 font-bold transition-all cursor-pointer"
                    >
                      🔒 Desbloquear 10 sinônimos de cargos (PRO)
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2.5">Filtros de Localização</h3>
                <div className="flex items-center gap-2 text-foreground font-extrabold text-sm bg-secondary/40 border border-border/60 px-4 py-2.5 rounded-xl w-fit">
                  <span className="capitalize">📍 {result.parsedParams.location}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Filtros de Refinamento</h3>
                <div className="flex flex-wrap gap-2">
                  {result.parsedParams.workMode.map(m => (
                    <span key={m} className="px-2.5 py-1.5 bg-green-500/10 text-green-500 text-[10px] rounded-lg border border-green-500/20 uppercase font-black tracking-wider">
                      {m}
                    </span>
                  ))}
                  {result.parsedParams.jobType.map(t => (
                    <span key={t} className="px-2.5 py-1.5 bg-blue-500/10 text-blue-500 text-[10px] rounded-lg border border-blue-500/20 uppercase font-black tracking-wider">
                      {t}
                    </span>
                  ))}
                  {result.parsedParams.experienceLevel.map(l => (
                    <span key={l} className="px-2.5 py-1.5 bg-orange-500/10 text-orange-500 text-[10px] rounded-lg border border-orange-500/20 uppercase font-black tracking-wider">
                      {l}
                    </span>
                  ))}
                  <span className="px-2.5 py-1.5 bg-purple-500/10 text-purple-500 text-[10px] rounded-lg border border-purple-500/20 uppercase font-black tracking-wider">
                    {result.parsedParams.period}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-6 border-t border-border/80">
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={result.urls.main}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-13 bg-primary hover:brightness-110 active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20 group cursor-pointer"
              >
                <ExternalLink className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Abrir Busca no LinkedIn</span>
              </a>
              {result.urls.express && !clickedFeatures.includes('express') ? (
                <a
                  href={result.urls.express}
                  onClick={() => handleFeatureClick('express')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-13 glass hover:bg-secondary active:scale-98 text-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all group cursor-pointer border border-border/80"
                >
                  <Zap className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span>Busca Express (Candidatura Direta)</span>
                </a>
              ) : (
                <button
                  onClick={() => router.push('/upgrade')}
                  className="flex-1 h-13 glass text-muted-foreground/60 border border-dashed border-border/80 hover:border-primary/50 hover:text-primary rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all group cursor-pointer"
                >
                  <Lock className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  <span>Ativar Busca Express (PRO)</span>
                </button>
              )}
            </div>
 
            {/* Explanation box for Busca Express with (i) */}
            <div className="p-4.5 bg-primary/5 border border-primary/15 rounded-2xl flex gap-3.5 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-300">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground uppercase tracking-wide text-[10px] block mb-1">O que é a Busca Express?</strong>
                <p className="text-[12px]">
                  A Busca Express ativa instantaneamente o filtro de <strong>Candidatura Simplificada (Easy Apply)</strong> no LinkedIn. 
                  Isso permite que você envie sua candidatura com apenas <strong>1 clique</strong> em segundos usando seu currículo anexado. 
                  Você pula totalmente os formulários externos cansativos (como Gupy, Greenhouse ou Lever) que demoram até 30 minutos por vaga!
                </p>
              </div>
            </div>
          </div>
 
          {/* Feed Posts (Vagas Ocultas) */}
          <div className="w-full border-t border-border/80 pt-6 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                📬 Vagas Ocultas no Feed (Filtros Fallback)
              </span>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Muitos gestores de startups e empresas de tecnologia postam vagas diretamente em suas redes pessoais para economizar nos custos formais do LinkedIn Recruiter. Use os botões abaixo para garimpar essas postagens valiosas e falar direto com quem contrata!
              </p>
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.urls.postsVaga && !clickedFeatures.includes('postsVaga') ? (
                <a
                  href={result.urls.postsVaga}
                  onClick={() => handleFeatureClick('postsVaga')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/25 hover:border-emerald-600/40 text-emerald-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs active:scale-95 shadow-sm shadow-emerald-600/5 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Buscar por "Vaga"</span>
                </a>
              ) : (
                <button
                  onClick={() => router.push('/upgrade')}
                  className="h-11 bg-secondary/10 hover:bg-primary/5 border border-dashed border-border/80 hover:border-primary/30 text-muted-foreground/60 hover:text-primary rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
                >
                  <Lock className="h-4 w-4 text-muted-foreground/45" />
                  <span>Buscar por "Vaga" (PRO)</span>
                </button>
              )}
 
              {result.urls.postsHiring && !clickedFeatures.includes('postsHiring') ? (
                <a
                  href={result.urls.postsHiring}
                  onClick={() => handleFeatureClick('postsHiring')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 bg-sky-600/10 hover:bg-sky-600/20 border border-sky-600/25 hover:border-sky-600/40 text-sky-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs active:scale-95 shadow-sm shadow-sky-600/5 cursor-pointer"
                >
                  <Globe className="h-4 w-4" />
                  <span>Buscar "Contratando"</span>
                </a>
              ) : (
                <button
                  onClick={() => router.push('/upgrade')}
                  className="h-11 bg-secondary/10 hover:bg-primary/5 border border-dashed border-border/80 hover:border-primary/30 text-muted-foreground/60 hover:text-primary rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
                >
                  <Lock className="h-4 w-4 text-muted-foreground/45" />
                  <span>Buscar "Contratando" (PRO)</span>
                </button>
              )}
 
              {result.urls.postsCurriculo && !clickedFeatures.includes('postsCurriculo') ? (
                <a
                  href={result.urls.postsCurriculo}
                  onClick={() => handleFeatureClick('postsCurriculo')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-600/25 hover:border-amber-600/40 text-amber-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs active:scale-95 shadow-sm shadow-amber-600/5 cursor-pointer"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Buscar "Currículo"</span>
                </a>
              ) : (
                <button
                  onClick={() => router.push('/upgrade')}
                  className="h-11 bg-secondary/10 hover:bg-primary/5 border border-dashed border-border/80 hover:border-primary/30 text-muted-foreground/60 hover:text-primary rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
                >
                  <Lock className="h-4 w-4 text-muted-foreground/45" />
                  <span>Buscar "Currículo" (PRO)</span>
                </button>
              )}
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
