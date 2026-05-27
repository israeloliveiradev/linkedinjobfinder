import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultCard } from './ResultCard';

// Mock do Axios
vi.mock('@/lib/axios', () => {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: { isPro: false, remaining: 2 } }),
      post: vi.fn().mockResolvedValue({ data: { success: true } }),
    },
  };
});

import api from '@/lib/axios';

// Mock do Next.js Router
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: pushMock,
      replace: () => null,
    };
  },
  usePathname() {
    return '';
  },
}));

describe('ResultCard Component', () => {
  const mockProResult = {
    id: 'res-1',
    createdAt: new Date().toISOString(),
    originalQuery: 'Developer',
    filtersApplied: 2,
    parsedParams: {
      keywords: 'Developer',
      location: 'brasil',
      recruiterAdvice: 'Excellent advice for PRO!',
      workMode: ['remoto'],
      jobType: ['clt'],
      experienceLevel: ['junior'],
      period: '24h',
    },
    expandedKeywords: [],
    booleanQuery: 'Developer',
    urls: {
      main: 'https://linkedin.com/main',
      indeed: 'https://indeed.com/search',
      gupy: 'https://gupy.io/search',
      glassdoor: 'https://glassdoor.com/search',
      postsVaga: 'https://linkedin.com/postsVaga',
    },
  };

  const mockFreeResult = {
    id: 'res-2',
    createdAt: new Date().toISOString(),
    originalQuery: 'Developer',
    filtersApplied: 1,
    parsedParams: {
      keywords: 'Developer',
      location: 'brasil',
      recruiterAdvice: null, // indica usuário FREE
      workMode: ['remoto'],
      jobType: ['clt'],
      experienceLevel: ['junior'],
      period: '24h',
    },
    expandedKeywords: [],
    booleanQuery: 'Developer',
    urls: {
      main: 'https://linkedin.com/main',
      indeed: 'https://indeed.com/search',
      gupy: 'https://gupy.io/search',
      glassdoor: 'https://glassdoor.com/search',
      postsVaga: 'https://linkedin.com/postsVaga',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar botões ativos para todos os motores do Multi-Scanner quando o usuário for PRO', () => {
    render(<ResultCard result={mockProResult as any} />);

    // Deve mostrar "Abrir Busca no Indeed"
    expect(screen.getByText('Abrir Busca no Indeed')).toBeInTheDocument();
    // Deve mostrar "Abrir Busca na Gupy"
    expect(screen.getByText('Abrir Busca na Gupy')).toBeInTheDocument();
    // Deve mostrar "Abrir no Glassdoor"
    expect(screen.getByText('Abrir no Glassdoor')).toBeInTheDocument();

    // Os links devem apontar para as URLs corretas
    expect(screen.getByText('Abrir Busca no Indeed').closest('a')).toHaveAttribute('href', 'https://indeed.com/search');
    expect(screen.getByText('Abrir Busca na Gupy').closest('a')).toHaveAttribute('href', 'https://gupy.io/search');
    expect(screen.getByText('Abrir no Glassdoor').closest('a')).toHaveAttribute('href', 'https://glassdoor.com/search');
  });

  it('deve exibir botões normais para usuário Free inicialmente e bloquear após clique', async () => {
    render(<ResultCard result={mockFreeResult as any} />);

    // De início os botões estão normais
    const glassdoorButton = screen.getByText('Abrir no Glassdoor');
    expect(glassdoorButton).toBeInTheDocument();

    // Clica no botão do Glassdoor
    fireEvent.click(glassdoorButton);

    // Deve registrar o clique na API
    expect(api.post).toHaveBeenCalledWith('/api/search/use-feature', { feature: 'glassdoor' });

    // Após o clique, o estado local atualiza e exibe a versão bloqueada "(PRO)" com cadeado
    await waitFor(() => {
      expect(screen.getByText('Abrir no Glassdoor (PRO)')).toBeInTheDocument();
    });

    // Clicar no botão bloqueado deve redirecionar para a página de upgrade
    const lockedButton = screen.getByText('Abrir no Glassdoor (PRO)');
    fireEvent.click(lockedButton);
    expect(pushMock).toHaveBeenCalledWith('/upgrade');
  });
});
