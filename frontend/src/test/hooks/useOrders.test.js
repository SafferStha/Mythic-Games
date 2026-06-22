import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Wrapper ───────────────────────────────────────────────────────────────────

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

import api from '../../lib/axios';

// ── Tests ─────────────────────────────────────────────────────────────────────

import { useOrders, useOrder, useCreateOrder } from '../../hooks/useOrders';

const testOrders = [
  {
    id:             1,
    order_number:   'MG-001',
    grand_total:    '135.58',
    payment_status: 'paid',
    order_status:   'completed',
  },
];

const testOrderDetail = {
  order: testOrders[0],
  items: [{ id: 1, game_title: 'Test Game', quantity: 1, price: '135.58' }],
};

describe('useOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns order list', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { orders: testOrders } } });

    const { result } = renderHook(() => useOrders(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/orders', expect.anything());
  });

  it('is in loading state initially', () => {
    api.get.mockResolvedValueOnce({ data: { data: { orders: [] } } });

    const { result } = renderHook(() => useOrders(), { wrapper: makeWrapper() });

    expect(result.current.isPending).toBe(true);
  });

  it('surfaces errors correctly', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useOrders(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error.message).toBe('Network error');
  });
});

describe('useOrder', () => {
  it('fetches a single order by id', async () => {
    api.get.mockResolvedValueOnce({ data: { data: testOrderDetail } });

    const { result } = renderHook(() => useOrder(1), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/orders/1', expect.anything());
  });

  it('is disabled when orderId is falsy', () => {
    const { result } = renderHook(() => useOrder(null), { wrapper: makeWrapper() });

    // Query is disabled — fetchStatus should be 'idle', not 'fetching'
    expect(result.current.fetchStatus).toBe('idle');
    expect(api.get).not.toHaveBeenCalled();
  });
});

describe('useCreateOrder', () => {
  it('posts to /checkout and invalidates orders', async () => {
    api.post.mockResolvedValueOnce({ data: { data: { order: testOrders[0] } } });

    const { result } = renderHook(() => useCreateOrder(), { wrapper: makeWrapper() });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith('/checkout', expect.anything());
  });
});
