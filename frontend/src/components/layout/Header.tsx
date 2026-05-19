'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, History, Bookmark, Moon, Sun, LogIn, LogOut, ArrowUpCircle, Settings } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useSession, signOut } from '@/lib/auth-client';
import api from '@/lib/axios';

export function Header() {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (session) {
      api.get('/api/admin/config')
        .then(res => setIsAdmin(!!res.data.isAdmin))
        .catch(console.error);
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut({ query: { redirectTo: '/login' } });
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xl transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-primary p-2 rounded-xl group-hover:scale-105 transition-all shadow-sm">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-foreground transition-all">
            vagas.<span className="text-primary font-black">rankia</span><span className="text-muted-foreground font-semibold text-xs ml-0.5">.cloud</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 text-foreground/80 hover:text-foreground transition-all text-sm font-semibold"
          >
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="hidden md:inline">Busca</span>
          </Link>
          
          {session && (
            <>
              <Link 
                href="/history" 
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 text-foreground/80 hover:text-foreground transition-all text-sm font-semibold"
              >
                <History className="w-4 h-4 text-accent" />
                <span className="hidden md:inline">Histórico</span>
              </Link>
              <Link 
                href="/presets" 
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 text-foreground/80 hover:text-foreground transition-all text-sm font-semibold"
              >
                <Bookmark className="w-4 h-4 text-green-500" />
                <span className="hidden md:inline">Presets</span>
              </Link>
              
              <Link 
                href="/upgrade" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:brightness-110 transition-all text-sm font-extrabold shadow-md shadow-primary/25"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Pro</span>
              </Link>
            </>
          )}

          <div className="w-px h-6 bg-border/80 mx-1 hidden sm:block" />
          
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-secondary/80 transition-all text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>

          {session ? (
            <div className="flex items-center gap-3 ml-2 pl-2 border-l border-border/80">
              {isAdmin && (
                <Link href="/central-master" className="p-2 hover:bg-secondary/80 rounded-xl text-muted-foreground hover:text-foreground transition-all" title="Central Master">
                  <Settings className="w-5 h-5" />
                </Link>
              )}
              <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-sm font-extrabold leading-none">{session.user.name}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{session.user.email}</span>
              </div>
              <img 
                src={session.user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.name}`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-xl border border-border bg-secondary shadow-inner" 
              />
              <button 
                onClick={handleLogout} 
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-semibold shadow-md shadow-primary/10">
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
