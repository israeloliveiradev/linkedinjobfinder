import { describe, it, expect, beforeEach } from 'vitest';
import { useSearchStore } from './searchStore';

describe('Search Zustand Store', () => {
  beforeEach(() => {
    // Reseta o estado do Zustand antes de cada teste
    useSearchStore.getState().resetFilters();
    useSearchStore.getState().setResult(null);
    useSearchStore.getState().setError(null);
    useSearchStore.getState().setLoading(false);
  });

  it('deve ter o estado inicial correto', () => {
    const state = useSearchStore.getState();

    expect(state.currentResult).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();

    // Filtros padrão
    expect(state.manualFilters.period).toBe('24h');
    expect(state.manualFilters.location).toBe('brasil');
    expect(state.manualFilters.minRating).toBe('4.0');
    expect(state.manualFilters.antiSpam).toBe(true);
    expect(state.manualFilters.workModes).toEqual([]);
    expect(state.manualFilters.experienceLevels).toEqual([]);
    expect(state.manualFilters.jobTypes).toEqual([]);
  });

  it('deve atualizar o estado de loading e erro', () => {
    const store = useSearchStore.getState();

    store.setLoading(true);
    expect(useSearchStore.getState().isLoading).toBe(true);

    store.setError('Erro ao buscar');
    expect(useSearchStore.getState().error).toBe('Erro ao buscar');
  });

  it('deve atualizar filtros individuais por setManualFilter', () => {
    const store = useSearchStore.getState();

    store.setManualFilter('location', 'são paulo');
    expect(useSearchStore.getState().manualFilters.location).toBe('são paulo');

    store.setManualFilter('minRating', '4.5');
    expect(useSearchStore.getState().manualFilters.minRating).toBe('4.5');

    store.setManualFilter('workModes', ['remoto']);
    expect(useSearchStore.getState().manualFilters.workModes).toEqual(['remoto']);
  });

  it('deve redefinir os filtros para as condições iniciais', () => {
    const store = useSearchStore.getState();

    store.setManualFilter('location', 'curitiba');
    store.setManualFilter('minRating', '3.5');
    store.setManualFilter('antiSpam', false);

    store.resetFilters();

    const resetState = useSearchStore.getState();
    expect(resetState.manualFilters.location).toBe('brasil');
    expect(resetState.manualFilters.minRating).toBe('4.0');
    expect(resetState.manualFilters.antiSpam).toBe(true);
  });
});
