import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, requireAdmin } from './auth.middleware.js';

// Mock do módulo de autenticação better-auth
vi.mock('../config/auth.js', () => {
  const getSessionMock = vi.fn();
  return {
    auth: {
      api: {
        getSession: getSessionMock,
      },
    },
  };
});

import { auth } from '../config/auth.js';

// Mock do Supabase Client
vi.mock('../config/database.js', () => {
  const selectMock = vi.fn();
  const eqMock = vi.fn();
  const singleMock = vi.fn();

  const fromMock = vi.fn(() => ({
    select: selectMock,
    eq: eqMock,
    single: singleMock,
  }));

  fromMock.select = selectMock;
  fromMock.eq = eqMock;
  fromMock.single = singleMock;

  selectMock.mockReturnValue({
    eq: eqMock,
  });

  eqMock.mockReturnValue({
    single: singleMock,
  });

  singleMock.mockResolvedValue({
    data: { role: 'user' },
    error: null,
  });

  return {
    default: {
      from: fromMock,
    },
  };
});

import supabase from '../config/database.js';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe('requireAuth', () => {
    it('deve retornar 401 se nenhuma sessão for encontrada', async () => {
      auth.api.getSession.mockResolvedValue(null);

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Não autorizado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve preencher req.user e chamar next() se a sessão for válida', async () => {
      const mockSession = { user: { id: 'user-123', email: 'user@test.com' } };
      auth.api.getSession.mockResolvedValue(mockSession);

      await requireAuth(req, res, next);

      expect(req.user).toBe(mockSession.user);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('deve retornar 401 se nenhuma sessão for encontrada', async () => {
      auth.api.getSession.mockResolvedValue(null);

      await requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 403 se o usuário não for admin', async () => {
      const mockSession = { user: { id: 'user-123' } };
      auth.api.getSession.mockResolvedValue(mockSession);

      // Mock DB: role = 'user'
      supabase.from().select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'user' },
            error: null,
          }),
        }),
      });

      await requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve prosseguir e chamar next() se o usuário for admin no banco de dados', async () => {
      const mockSession = { user: { id: 'admin-123' } };
      auth.api.getSession.mockResolvedValue(mockSession);

      // Mock DB: role = 'admin'
      supabase.from().select.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      });

      await requireAdmin(req, res, next);

      expect(req.user).toBe(mockSession.user);
      expect(next).toHaveBeenCalled();
    });
  });
});
