'use client';

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useSession } from '@/lib/auth-client';
import { Shield, Settings, Users, Phone, DollarSign, Key, QrCode, Sliders, ShieldCheck, Lock, UserCheck, ShieldAlert, Search, Activity, Sparkles, TrendingUp, Coins } from 'lucide-react';
import api from '@/lib/axios';

export default function CentralMasterPage() {
  const { data: session, isPending } = useSession();
  const [config, setConfig] = useState<any>({ pix_key: '', qr_code_url: '', pro_price: 49.90, pro_price_mensal: 10.90, pro_price_trimestral: 25.90, pro_price_semestral: 29.90, free_limit: 5, free_copilot_limit: 2, whatsapp_number: '', isAdmin: false });
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [llmInfo, setLlmInfo] = useState<any>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Fetch configs and verify admin status
  useEffect(() => {
    api.get('/api/admin/config')
      .then(res => {
        const data = res.data;
        setConfig(data);
        if (data.llmInfo) {
          setLlmInfo(data.llmInfo);
        }
        setLoadingConfig(false);
        if (data.isAdmin) {
          fetchUsers();
          fetchHistory();
        }
      })
      .catch(err => {
        console.error(err);
        setLoadingConfig(false);
      });
  }, [session]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/api/admin/history');
      setHistory(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await api.put('/api/admin/config', config);
      alert('Configurações salvas com absoluto sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro de conexão ao salvar');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleUserPlan = async (userId: string, currentPlan: string) => {
    setUpdatingUser(userId);
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
    let duration = 'lifetime';

    if (newPlan === 'pro') {
      const choice = prompt('Digite "M" para plano PRO Mensal (1 mês), "T" para plano PRO Trimestral (3 meses) ou "V" para PRO Vitalício:', 'V');
      if (!choice) {
        setUpdatingUser(null);
        return;
      }
      const upperChoice = choice.trim().toUpperCase();
      if (upperChoice === 'M') {
        duration = 'mensal';
      } else if (upperChoice === 'T') {
        duration = 'trimestral';
      } else if (upperChoice === 'V') {
        duration = 'lifetime';
      } else {
        alert('Opção inválida! Operação cancelada.');
        setUpdatingUser(null);
        return;
      }
    }

    try {
      const res = await api.put(`/api/admin/users/${userId}/plan`, { status: newPlan, expires_at: duration });
      const updatedSub = res.data;
      setUsers(users.map(u => u.id === userId ? { ...u, planStatus: newPlan, expiresAt: updatedSub.expires_at } : u));
    } catch (e) {
      console.error(e);
      alert('Erro de conexão ao alterar plano');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleUnlockFeature = async (userId: string, feature: 'copilot' | 'express' | 'feed') => {
    try {
      const res = await api.post(`/api/admin/users/${userId}/unlock`, { feature });
      alert(res.data.message || 'Permissão liberada com absoluto sucesso!');
      fetchUsers();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || 'Erro de conexão ao liberar recurso');
    }
  };

  if (isPending || loadingConfig) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-semibold">Autenticando painel seguro...</p>
        </div>
      </PageWrapper>
    );
  }

  // Secure gate: if user is not logged in or is not marked as admin by the server config
  if (!session || !config.isAdmin) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[80vh] pt-28">
        <div className="max-w-md w-full glass p-8 rounded-3xl border border-destructive/20 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">Acesso Restrito</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Esta rota é estritamente confidencial. Apenas o administrador oficial da plataforma pode acessar a Central Master.
            </p>
          </div>
          <div className="bg-destructive/5 text-destructive border border-destructive/10 p-3.5 rounded-xl text-xs font-semibold">
            Seu e-mail ({session?.user?.email || 'Nenhum e-mail conectado'}) não possui credenciais administrativas.
          </div>
          <a 
            href="/" 
            className="inline-flex w-full h-11 items-center justify-center rounded-xl bg-secondary text-foreground hover:bg-secondary/80 text-sm font-bold transition-all"
          >
            Voltar para a Página Inicial
          </a>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-12 pt-28 space-y-10 max-w-7xl mx-auto px-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-black text-primary tracking-widest uppercase shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Central de Controle Master
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">Gerenciador de Elite</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Configure parâmetros da plataforma, edite PIX e libere assinaturas de candidatos PRO manualmente.
          </p>
        </div>
        <div className="bg-green-500/10 text-green-600 border border-green-500/20 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 max-w-fit">
          <UserCheck className="w-4 h-4 text-green-500" />
          Administrador Autenticado: {session.user.name}
        </div>
      </div>

      {/* KPI Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass p-5 rounded-3xl border border-border/50 shadow-sm hover:border-border transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
          <div className="bg-primary/10 p-3.5 rounded-2xl text-primary shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block truncate">Total Usuários</span>
            <h3 className="text-2xl font-black text-foreground truncate">{users.length}</h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass p-5 rounded-3xl border border-border/50 shadow-sm hover:border-border transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
          <div className="bg-amber-500/10 p-3.5 rounded-2xl text-amber-500 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block truncate">Assinantes PRO</span>
            <h3 className="text-2xl font-black text-foreground truncate">
              {users.filter(u => u.planStatus === 'pro').length}
            </h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass p-5 rounded-3xl border border-border/50 shadow-sm hover:border-border transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="bg-emerald-500/10 p-3.5 rounded-2xl text-emerald-500 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block truncate">Conversão PRO</span>
            <h3 className="text-2xl font-black text-foreground truncate">
              {users.length > 0 ? ((users.filter(u => u.planStatus === 'pro').length / users.length) * 100).toFixed(1) + '%' : '0%'}
            </h3>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass p-5 rounded-3xl border border-border/50 shadow-sm hover:border-border transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/10 transition-all" />
          <div className="bg-accent/10 p-3.5 rounded-2xl text-accent shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block truncate">Buscas Monitoradas</span>
            <h3 className="text-2xl font-black text-foreground truncate">{history.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: System Configuration & LLM Info (col-span-4) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Card 1: Configuration Form */}
          <div className="glass p-6 rounded-3xl border border-border/60 shadow-lg space-y-6">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground">Configurações</h2>
                <p className="text-xs text-muted-foreground">Preços, PIX e redes comerciais</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-primary" />
                  Chave PIX Comercial
                </label>
                <input 
                  className="flex h-11 w-full rounded-xl border border-border bg-card/50 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
                  value={config.pix_key || ''} 
                  onChange={e => setConfig({...config, pix_key: e.target.value})} 
                  placeholder="Seu e-mail ou CNPJ do PIX"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-accent" />
                  URL da Imagem do QR Code
                </label>
                <input 
                  className="flex h-11 w-full rounded-xl border border-border bg-card/50 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
                  value={config.qr_code_url || ''} 
                  onChange={e => setConfig({...config, qr_code_url: e.target.value})} 
                  placeholder="https://imgur.com/seu-qr-code.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Coins className="w-3 h-3 text-green-500" />
                    PRO Mensal
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="flex h-10 w-full rounded-xl border border-border bg-card/50 px-2.5 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
                    value={config.pro_price_mensal || 0} 
                    onChange={e => setConfig({...config, pro_price_mensal: parseFloat(e.target.value)})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Coins className="w-3 h-3 text-emerald-500" />
                    PRO Trimestral
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="flex h-10 w-full rounded-xl border border-border bg-card/50 px-2.5 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
                    value={config.pro_price_trimestral || 0} 
                    onChange={e => setConfig({...config, pro_price_trimestral: parseFloat(e.target.value)})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Coins className="w-3 h-3 text-cyan-500" />
                    PRO Semestral
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="flex h-10 w-full rounded-xl border border-border bg-card/50 px-2.5 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
                    value={config.pro_price_semestral || 0} 
                    onChange={e => setConfig({...config, pro_price_semestral: parseFloat(e.target.value)})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Coins className="w-3 h-3 text-blue-500" />
                    PRO Vitalício
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="flex h-10 w-full rounded-xl border border-border bg-card/50 px-2.5 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
                    value={config.pro_price || 0} 
                    onChange={e => setConfig({...config, pro_price: parseFloat(e.target.value)})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-amber-500" />
                    Free Tier (Limite de Buscas)
                  </label>
                  <input 
                    type="number"
                    className="flex h-10 w-full rounded-xl border border-border bg-card/50 px-2.5 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
                    value={config.free_limit || 0} 
                    onChange={e => setConfig({...config, free_limit: parseInt(e.target.value)})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    Limite Copiloto Grátis
                  </label>
                  <input 
                    type="number"
                    className="flex h-10 w-full rounded-xl border border-border bg-card/50 px-2.5 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
                    value={config.free_copilot_limit !== undefined ? config.free_copilot_limit : 2} 
                    onChange={e => setConfig({...config, free_copilot_limit: parseInt(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-green-500" />
                  WhatsApp para Comprovantes
                </label>
                <input 
                  className="flex h-11 w-full rounded-xl border border-border bg-card/50 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
                  value={config.whatsapp_number || ''} 
                  onChange={e => setConfig({...config, whatsapp_number: e.target.value})} 
                  placeholder="Ex: 5511999999999 (com DDI e DDD)"
                />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Ao preencher, o sistema irá redirecionar o botão de faturamento do plano PRO para abrir o WhatsApp deste número enviando o comprovante automaticamente.
                </p>
              </div>

              <button 
                onClick={handleSaveConfig} 
                disabled={savingConfig} 
                className="w-full mt-6 h-12 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent hover:brightness-110 disabled:pointer-events-none disabled:opacity-50 text-white text-sm font-bold transition-all shadow-md shadow-primary/25 cursor-pointer"
              >
                {savingConfig ? 'Processando...' : 'Salvar Alterações Globais'}
              </button>
            </div>
          </div>

          {/* Card 2: LLM & API Intelligence Dashboard */}
          {llmInfo && (
            <div className="glass p-6 rounded-3xl border border-border/60 shadow-lg space-y-6 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
              
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary animate-pulse">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground">Status de I.A. & APIs</h2>
                    <p className="text-xs text-muted-foreground">Tokens, LLMs e credenciais do motor</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                  Online
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Groq Credentials */}
                <div className="p-3.5 bg-card/30 border border-border/60 hover:border-border/80 rounded-2xl transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground text-xs flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-orange-500" />
                      Groq API (Primária)
                    </span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase ${
                      llmInfo.groqActive 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/10' 
                        : 'bg-destructive/10 text-destructive border border-destructive/10'
                    }`}>
                      {llmInfo.groqActive ? 'Ativa' : 'Ausente'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 leading-normal">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Token / Chave:</span>
                      <code className="text-foreground font-mono bg-card px-1.5 py-0.5 rounded border border-border/40 text-[9px] select-all">
                        {llmInfo.groqKeyMasked}
                      </code>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Modelo:</span>
                      <span className="font-bold text-foreground text-[10px] truncate max-w-[150px]">
                        {llmInfo.groqModel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gemini Fallback Credentials */}
                <div className="p-3.5 bg-card/30 border border-border/60 hover:border-border/80 rounded-2xl transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Gemini API (Redundante)
                    </span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase ${
                      llmInfo.geminiActive 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/10' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                    }`}>
                      {llmInfo.geminiActive ? 'Fallback OK' : 'Sem Fallback'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 leading-normal">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Token / Chave:</span>
                      <code className="text-foreground font-mono bg-card px-1.5 py-0.5 rounded border border-border/40 text-[9px] select-all">
                        {llmInfo.geminiKeyMasked}
                      </code>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Modelo:</span>
                      <span className="font-bold text-foreground text-[10px] truncate max-w-[150px]">
                        {llmInfo.geminiModel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Engine Resiliency & System settings */}
                <div className="p-3.5 bg-card/30 border border-border/60 hover:border-border/80 rounded-2xl transition-all space-y-2">
                  <div className="font-extrabold text-foreground text-xs flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    Parâmetros de Resiliência I.A.
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px] text-muted-foreground pt-1">
                    <div className="space-y-0.5 bg-card/50 p-2 rounded-xl border border-border/40">
                      <span className="block text-[8px] uppercase tracking-wider font-black text-muted-foreground/80">Retentativas</span>
                      <span className="font-black text-foreground text-xs">{llmInfo.maxRetries}x</span>
                    </div>
                    <div className="space-y-0.5 bg-card/50 p-2 rounded-xl border border-border/40">
                      <span className="block text-[8px] uppercase tracking-wider font-black text-muted-foreground/80">Atraso Base</span>
                      <span className="font-black text-foreground text-xs">{llmInfo.retryDelayMs}ms</span>
                    </div>
                    <div className="space-y-0.5 bg-card/50 p-2 rounded-xl border border-border/40 col-span-2">
                      <span className="block text-[8px] uppercase tracking-wider font-black text-muted-foreground/80">DB Supabase Host</span>
                      <span className="font-black text-foreground text-[9px] truncate block">{llmInfo.supabaseUrl}</span>
                    </div>
                    <div className="space-y-0.5 bg-card/50 p-2 rounded-xl border border-border/40">
                      <span className="block text-[8px] uppercase tracking-wider font-black text-muted-foreground/80">Ambiente Node</span>
                      <span className="font-black text-foreground text-xs uppercase">{llmInfo.nodeEnv}</span>
                    </div>
                    <div className="space-y-0.5 bg-card/50 p-2 rounded-xl border border-border/40">
                      <span className="block text-[8px] uppercase tracking-wider font-black text-muted-foreground/80">Porta da API</span>
                      <span className="font-black text-foreground text-xs">{llmInfo.port}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle: User List & Plan Management */}
        <div className="lg:col-span-4 glass p-6 rounded-3xl border border-border/60 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-accent/10 p-2 rounded-xl text-accent">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground">Gerenciador de Acessos</h2>
                <p className="text-xs text-muted-foreground">Monitore e libere assinaturas PRO</p>
              </div>
            </div>
            <button 
              onClick={fetchUsers}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
              disabled={loadingUsers}
            >
              Recarregar
            </button>
          </div>

          {/* Interactive Live Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              className="flex h-10 w-full rounded-xl border border-border bg-card/40 pl-10 pr-4 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none transition-all"
              placeholder="Buscar por nome ou e-mail..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {loadingUsers ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">Buscando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhum usuário registrado encontrado.
            </div>
          ) : (
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {users
                .filter(u => 
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(u => (
                  <div 
                    key={u.id} 
                    className="flex flex-col p-4 bg-card/40 border border-border/60 hover:border-border rounded-2xl transition-all gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-foreground truncate max-w-[150px]">{u.name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          u.planStatus === 'pro' 
                            ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          {u.planStatus === 'pro' ? '★ PRO' : 'FREE'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      
                      {u.planStatus === 'pro' && (
                        <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 px-2 py-1 rounded-lg inline-block">
                          {u.expiresAt 
                            ? `Expira em: ${new Date(u.expiresAt).toLocaleDateString('pt-BR')}` 
                            : 'Acesso Vitalício'}
                        </div>
                      )}
                      
                      <p className="text-[9px] text-muted-foreground/60">
                        Cadastro: {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                      </p>

                      {/* Quota Telemetry Details */}
                      <div className="bg-secondary/20 p-2.5 rounded-xl border border-border/40 text-[10px] space-y-1 my-1">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Buscas Feitas:</span>
                          <span className="font-bold text-foreground">{u.searchCount || 0} / {config.free_limit}</span>
                        </div>
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Copiloto IA:</span>
                          <span className="font-bold text-foreground">
                            {u.copilotCount || 0} / {(config.free_copilot_limit || 2) + (u.extraCopilotCredits || 0)}
                            {u.extraCopilotCredits > 0 && <span className="text-primary font-black ml-1">({u.extraCopilotCredits} extra)</span>}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Express Utilizado?</span>
                          <span className={`font-bold ${u.usedExpress ? 'text-amber-500' : 'text-green-500'}`}>
                            {u.usedExpress ? 'Sim (Bloqueado)' : 'Não (Livre)'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Vagas Ocultas Feed?</span>
                          <span className={`font-bold ${u.usedPostsVaga || u.usedPostsHiring || u.usedPostsCurriculo ? 'text-amber-500' : 'text-green-500'}`}>
                            {u.usedPostsVaga || u.usedPostsHiring || u.usedPostsCurriculo ? 'Sim (Bloqueado)' : 'Não (Livre)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleToggleUserPlan(u.id, u.planStatus)}
                        disabled={updatingUser === u.id}
                        className={`h-9 w-full inline-flex items-center justify-center rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          u.planStatus === 'pro'
                            ? 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white'
                            : 'bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500 hover:text-white'
                        } disabled:opacity-50`}
                      >
                        {updatingUser === u.id 
                          ? 'Processando...' 
                          : u.planStatus === 'pro' 
                            ? 'Rebaixar para Free' 
                            : 'Conceder Acesso PRO'
                        }
                      </button>

                      {/* Custom Permission Unlock Buttons */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => handleUnlockFeature(u.id, 'copilot')}
                          className="h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[9px] border border-primary/20 transition-all cursor-pointer flex items-center justify-center gap-1"
                          title="Liberar +1 uso do Copiloto de IA"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          +1 Copiloto
                        </button>
                        <button
                          onClick={() => handleUnlockFeature(u.id, 'express')}
                          className="h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-bold text-[9px] border border-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1"
                          title="Resetar bloqueio e liberar mais 1 clique no Express"
                        >
                          <Sliders className="w-2.5 h-2.5" />
                          Lib Express
                        </button>
                        <button
                          onClick={() => handleUnlockFeature(u.id, 'feed')}
                          className="h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 font-bold text-[9px] border border-green-500/20 transition-all cursor-pointer flex items-center justify-center gap-1"
                          title="Resetar bloqueios e liberar acessos ao Feed de Vagas Ocultas"
                        >
                          <Activity className="w-2.5 h-2.5" />
                          Lib Feed
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Right Side: Real-Time Search Feed Monitor */}
        <div className="lg:col-span-4 glass p-6 rounded-3xl border border-border/60 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary animate-pulse">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground">Monitor em Tempo Real</h2>
                <p className="text-xs text-muted-foreground">Varreduras recentes dos candidatos</p>
              </div>
            </div>
            <button 
              onClick={fetchHistory}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
              disabled={loadingHistory}
            >
              Atualizar
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground font-semibold">Carregando histórico...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm leading-relaxed">
              Nenhuma varredura efetuada por candidatos no momento.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
              {history.map(h => (
                <div 
                  key={h.id} 
                  className="p-3.5 bg-card/20 border border-border/50 hover:border-border rounded-2xl transition-all space-y-2 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-[10px] gap-2 min-w-0">
                    <span className="font-extrabold text-foreground truncate max-w-[120px]">{h.userName}</span>
                    <span className="text-muted-foreground/60 text-[9px] shrink-0 font-semibold">
                      {new Date(h.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-3 py-2 rounded-xl break-words leading-normal select-all">
                    {h.original_query}
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground/80 font-medium">
                    <span className="truncate max-w-[150px]">{h.userEmail}</span>
                    <span className="text-[8px] bg-secondary px-1.5 py-0.5 rounded uppercase tracking-wider font-black text-muted-foreground/75">
                      Varredura ok
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
