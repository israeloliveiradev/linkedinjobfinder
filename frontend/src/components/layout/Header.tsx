'use client';

import Link from 'next/link';
import { Briefcase, History, Bookmark, Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function Header() {
  const { isDarkMode, toggleDarkMode } = useUIStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-md">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
            LinkedIn Job Finder <span className="text-primary">v4</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium"
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Busca</span>
          </Link>
          <Link 
            href="/history" 
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Histórico</span>
          </Link>
          <Link 
            href="/presets" 
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium"
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Presets</span>
          </Link>
          
          <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
          
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
