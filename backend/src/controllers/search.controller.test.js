import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchController } from './search.controller.js';

// Mocks para os Serviços
const mockLlmService = {
  chat: vi.fn(),
};

const mockUrlBuilderService = {
  build: vi.fn(),
};

const mockKeywordService = {
  expand: vi.fn(),
};

const mockHistoryService = {
  addEntry: vi.fn(),
};

const mockSubscriptionService = {
  checkAndIncrementUsage: vi.fn(),
};

// Mock do Supabase Client
vi.mock('../config/database.js', () => {
  const selectMock = vi.fn();
  const updateMock = vi.fn();
  const eqMock = vi.fn();
  const singleMock = vi.fn();

  const fromMock = vi.fn(() => ({
    select: selectMock,
    update: updateMock,
    eq: eqMock,
    single: singleMock,
  }));

  fromMock.select = selectMock;
  fromMock.update = updateMock;
  fromMock.eq = eqMock;
  fromMock.single = singleMock;

  selectMock.mockReturnValue({
    eq: eqMock,
  });

  updateMock.mockReturnValue({
    eq: eqMock,
  });

  eqMock.mockReturnValue({
    single: singleMock,
  });

  singleMock.mockResolvedValue({
    data: {
      status: 'free',
      indeed_count: 0,
      gupy_count: 0,
      glassdoor_count: 0,
      extra_indeed_credits: 0,
      extra_gupy_credits: 0,
      extra_glassdoor_credits: 0,
    },
    error: null,
  });

  return {
    default: {
      from: fromMock,
    },
  };
});

import supabase from '../config/database.js';

describe('SearchController', () => {
  let controller;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new SearchController(
      mockLlmService,
      mockUrlBuilderService,
      mockKeywordService,
      mockHistoryService,
      mockSubscriptionService
    );
  });

  describe('search', () => {
    it('deve retornar todas as URLs para usuários PRO', async () => {
      const mockUser = { id: 'user-pro' };
      const req = {
        body: { query: 'React Developer' },
        user: mockUser,
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      // Mock da Resposta do Banco (Usuário PRO)
      supabase.from().select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              status: 'pro',
              expires_at: new Date(Date.now() + 1000000000).toISOString(),
            },
            error: null,
          }),
        }),
      });

      // Mock do LLM
      mockLlmService.chat.mockResolvedValue(
        JSON.stringify({
          keywords: 'React',
          location: 'brasil',
          recruiterAdvice: 'Ótima dica PRO!',
        })
      );

      // Mock do URL Builder
      mockUrlBuilderService.build.mockReturnValue({
        main: 'linkedin-main-url',
        indeed: 'indeed-url',
        gupy: 'gupy-url',
        glassdoor: 'glassdoor-url',
      });

      // Mock do History
      mockHistoryService.addEntry.mockResolvedValue({ id: 'history-123' });

      await controller.search(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      const lastSavedEntry = mockHistoryService.addEntry.mock.calls[0][0];
      expect(lastSavedEntry.urls.indeed).toBe('indeed-url');
      expect(lastSavedEntry.urls.gupy).toBe('gupy-url');
      expect(lastSavedEntry.urls.glassdoor).toBe('glassdoor-url');
    });

    it('deve restringir URLs individuais para usuários Free que estouraram limites individuais', async () => {
      const mockUser = { id: 'user-free' };
      const req = {
        body: { query: 'Node.js Developer' },
        user: mockUser,
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      // Mock da Resposta do Banco (Usuário Free, estourou Indeed [2/2] mas tem Glassdoor livre [0/2])
      supabase.from().select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              status: 'free',
              indeed_count: 2,
              gupy_count: 1,
              glassdoor_count: 0,
              extra_indeed_credits: 0,
              extra_gupy_credits: 0,
              extra_glassdoor_credits: 0,
            },
            error: null,
          }),
        }),
      });

      // Mock do LLM (Sem recruiterAdvice para Free)
      mockLlmService.chat.mockResolvedValue(
        JSON.stringify({
          keywords: 'Node',
          location: 'brasil',
        })
      );

      // Mock do URL Builder
      mockUrlBuilderService.build.mockReturnValue({
        main: 'linkedin-main-url',
        indeed: 'indeed-url',
        gupy: 'gupy-url',
        glassdoor: 'glassdoor-url',
      });

      await controller.search(req, res, next);

      const lastSavedEntry = mockHistoryService.addEntry.mock.calls[0][0];
      // Indeed deve estar nulo (limite estourado)
      expect(lastSavedEntry.urls.indeed).toBeNull();
      // Gupy e Glassdoor devem ser mantidos (limite ainda livre)
      expect(lastSavedEntry.urls.gupy).toBe('gupy-url');
      expect(lastSavedEntry.urls.glassdoor).toBe('glassdoor-url');
    });
  });

  describe('useFeature', () => {
    it('deve rejeitar requisição sem usuário autenticado', async () => {
      const req = { body: { feature: 'indeed' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await controller.useFeature(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Não autorizado' });
    });

    it('deve rejeitar recurso inválido', async () => {
      const req = {
        user: { id: 'user-123' },
        body: { feature: 'recurso_inexistente' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await controller.useFeature(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Recurso inválido' });
    });

    it('deve incrementar glassdoor_count ao usar o Glassdoor', async () => {
      const req = {
        user: { id: 'user-123' },
        body: { feature: 'glassdoor' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      // Mock select do Supabase
      supabase.from().select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { glassdoor_count: 1 },
            error: null,
          }),
        }),
      });

      // Mock update do Supabase
      const eqMock = vi.fn().mockResolvedValue({ error: null });
      supabase.from().update.mockReturnValue({
        eq: eqMock,
      });

      await controller.useFeature(req, res, next);

      expect(supabase.from).toHaveBeenCalledWith('subscriptions');
      expect(supabase.from().update).toHaveBeenCalledWith({ glassdoor_count: 2 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Recurso glassdoor marcado como usado.',
      });
    });
  });
});
