import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Wrapper ───────────────────────────────────────────────────────────────────

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries:  { retry: false },
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

import {
  useInitiatePayment,
  useInvoice,
  useReceipt,
} from '../../hooks/usePayment';

const esewaPayload = {
  esewa_payload: { amount: '135.58', transaction_uuid: 'uuid-001' },
  payment_url:   'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
};

const testInvoice = {
  invoice:      { id: 1, invoice_number: 'INV-001', invoice_path: '/invoices/inv.pdf' },
  download_url: '/api/invoice/download/1',
  has_file:     true,
};

const testReceipt = {
  receipt:      { id: 1, receipt_number: 'REC-001', receipt_path: '/receipts/rec.pdf' },
  download_url: '/api/receipt/download/1',
  has_file:     true,
};

describe('useInitiatePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts to /payment/esewa/initiate with orderId', async () => {
    api.post.mockResolvedValueOnce({ data: { data: esewaPayload } });

    const { result } = renderHook(() => useInitiatePayment(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith(
      '/payment/esewa/initiate',
      { order_id: 1 },
      expect.anything()
    );
  });

  it('exposes error on mutation failure', async () => {
    api.post.mockRejectedValueOnce(new Error('Payment gateway error'));

    const { result } = renderHook(() => useInitiatePayment(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error.message).toBe('Payment gateway error');
  });
});

describe('useInvoice', () => {
  it('fetches invoice for a given orderId', async () => {
    api.get.mockResolvedValueOnce({ data: { data: testInvoice } });

    const { result } = renderHook(() => useInvoice(1), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/invoice/1', expect.anything());
  });

  it('is disabled when orderId is falsy', () => {
    const { result } = renderHook(() => useInvoice(null), { wrapper: makeWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(api.get).not.toHaveBeenCalled();
  });
});

describe('useReceipt', () => {
  it('fetches receipt for a given paymentId', async () => {
    api.get.mockResolvedValueOnce({ data: { data: testReceipt } });

    const { result } = renderHook(() => useReceipt(1), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/receipt/1', expect.anything());
  });

  it('is disabled when paymentId is falsy', () => {
    const { result } = renderHook(() => useReceipt(undefined), { wrapper: makeWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
