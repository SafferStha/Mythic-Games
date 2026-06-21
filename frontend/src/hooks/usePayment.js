import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useInitiatePayment = () =>
  useMutation({
    mutationFn: (orderId) =>
      api.post(`/payment/esewa/initiate`, { order_id: orderId }).then((r) => r.data),
  });

export const useInvoice = (orderId) =>
  useQuery({
    queryKey: ['invoice', orderId],
    queryFn:  () => api.get(`/invoice/${orderId}`).then((r) => r.data),
    enabled:  Boolean(orderId),
  });

export const useReceipt = (paymentId) =>
  useQuery({
    queryKey: ['receipt', paymentId],
    queryFn:  () => api.get(`/receipt/${paymentId}`).then((r) => r.data),
    enabled:  Boolean(paymentId),
  });

export const useDownloadInvoice = () =>
  useMutation({
    mutationFn: (orderId) =>
      api.get(`/invoice/${orderId}/download`, { responseType: 'blob' }).then((r) => r.data),
  });

export const useDownloadReceipt = () =>
  useMutation({
    mutationFn: (paymentId) =>
      api.get(`/receipt/${paymentId}/download`, { responseType: 'blob' }).then((r) => r.data),
  });
