import { describe, it, expect } from 'vitest';
import { globalLimiter, copilotLimiter } from './rateLimit.js';

describe('Rate Limit Config', () => {
  it('deve exportar globalLimiter e copilotLimiter corretamente', () => {
    expect(globalLimiter).toBeDefined();
    expect(copilotLimiter).toBeDefined();
    expect(typeof globalLimiter).toBe('function');
    expect(typeof copilotLimiter).toBe('function');
  });
});
