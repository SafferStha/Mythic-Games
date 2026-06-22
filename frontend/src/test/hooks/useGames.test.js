import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Wrapper ───────────────────────────────────────────────────────────────────

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

import api from '../../lib/axios';

// ── Tests ─────────────────────────────────────────────────────────────────────

import { useGames, useGame, useFeaturedGames, useTrendingGames } from '../../hooks/useGames';

const testGames = [
  { id: 1, title: 'Elden Ring', slug: 'elden-ring', price: '59.99', status: 'active' },
  { id: 2, title: 'God of War', slug: 'god-of-war', price: '39.99', status: 'active' },
];

describe('useGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches games with no params', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { rows: testGames } } });

    const { result } = renderHook(() => useGames(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/games', expect.objectContaining({ params: {} }));
  });

  it('forwards query params to the API', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { rows: testGames } } });

    const { result } = renderHook(
      () => useGames({ category: 'action', limit: 10 }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith(
      '/games',
      expect.objectContaining({ params: { category: 'action', limit: 10 } })
    );
  });

  it('surfaces fetch errors', async () => {
    api.get.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useGames(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useGame', () => {
  it('fetches a single game by id', async () => {
    api.get.mockResolvedValueOnce({ data: { data: testGames[0] } });

    const { result } = renderHook(() => useGame(1), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/games/1', expect.anything());
  });

  it('is disabled when gameId is falsy', () => {
    const { result } = renderHook(() => useGame(null), { wrapper: makeWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(api.get).not.toHaveBeenCalled();
  });
});

describe('useFeaturedGames', () => {
  it('fetches games with featured=true and limit=8', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { rows: testGames } } });

    const { result } = renderHook(() => useFeaturedGames(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith(
      '/games',
      expect.objectContaining({ params: { featured: true, limit: 8 } })
    );
  });
});

describe('useTrendingGames', () => {
  it('fetches games sorted by popular with limit=6', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { rows: testGames } } });

    const { result } = renderHook(() => useTrendingGames(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith(
      '/games',
      expect.objectContaining({ params: { sort: 'popular', limit: 6 } })
    );
  });
});
