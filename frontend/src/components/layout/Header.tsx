'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, History, Bookmark, Moon, Sun, LogIn, LogOut, ArrowUpCircle, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { useSession, signOut } from '@/lib/auth-client';
import api from '@/lib/axios';

export function Header() {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (session) {
      api.get('/api/admin/config')
        .then(res => setIsAdmin(!!res.data.isAdmin))
        .catch(console.error);
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut({ query: { redirectTo: '/login' } });
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xl transition-all duration-300 overflow-hidden">
      {/* Top Bar */}
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-primary p-2 rounded-xl group-hover:scale-105 transition-all shadow-sm">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-foreground transition-all">
            vagas.<span className="text-primary font-black">rankia</span><span className="text-muted-foreground font-semibold text-xs ml-0.5">.cloud</span>
          </span>
        </Link>

        {/* Navigation Elements */}
        <nav className="flex items-center">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 sm:gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 text-foreground/80 hover:text-foreground transition-all text-sm font-semibold"
            >
              <Briefcase className="w-4 h-4 text-primary" />
              <span>Busca</span>
            </Link>
            
            {session && (
              <>
                <Link 
                  href="/history" 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 text-foreground/80 hover:text-foreground transition-all text-sm font-semibold"
                >
                  <History className="w-4 h-4 text-accent" />
                  <span>Histórico</span>
                </Link>
                <Link 
                  href="/presets" 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/80 text-foreground/80 hover:text-foreground transition-all text-sm font-semibold"
                >
                  <Bookmark className="w-4 h-4 text-green-500" />
                  <span>Presets</span>
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

            <div className="w-px h-6 bg-border/80 mx-1" />
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-secondary/80 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
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
                <div className="flex flex-col items-end mr-1">
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
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all cursor-pointer"
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
          </div>

          {/* Mobile Navigation Toggles */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-secondary/80 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer (Expandable Menu) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-border/60 bg-card/45 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/80 text-foreground/80 hover:text-foreground transition-all text-sm font-semibold"
                >
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span>Busca</span>
                </Link>

                {session && (
                  <>
                    <Link
                      href="/history"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/80 text-foreground/80 hover:text-foreground transition-all text-sm font-semibold"
                    >
                      <History className="w-5 h-5 text-accent" />
                      <span>Histórico</span>
                    </Link>
                    <Link
                      href="/presets"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/80 text-foreground/80 hover:text-foreground transition-all text-sm font-semibold"
                    >
                      <Bookmark className="w-5 h-5 text-green-500" />
                      <span>Presets</span>
                    </Link>
                    <Link
                      href="/upgrade"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:brightness-110 transition-all text-sm font-extrabold shadow-md shadow-primary/25"
                    >
                      <ArrowUpCircle className="w-5 h-5" />
                      <span>Pro</span>
                    </Link>
                  </>
                )}
              </div>

              {session ? (
                <div className="border-t border-border/50 pt-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-2">
                    <img
                      src={session.user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.name}`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-xl border border-border bg-secondary shadow-inner"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold leading-none">{session.user.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">{session.user.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {isAdmin && (
                      <Link
                        href="/central-master"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-secondary/60 hover:bg-secondary/80 rounded-xl text-muted-foreground hover:text-foreground transition-all text-xs font-bold border border-border/60"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Central</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-all text-xs font-bold border border-destructive/10 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border/50 pt-4">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-semibold shadow-md"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Entrar</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
