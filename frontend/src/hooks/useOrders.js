import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

const ORDERS_KEY = ['orders'];

export const useOrders = () =>
  useQuery({
    queryKey: ORDERS_KEY,
    queryFn:  () => api.get('/orders').then((r) => r.data),
  });

export const useOrder = (orderId) =>
  useQuery({
    queryKey: [...ORDERS_KEY, orderId],
    queryFn:  () => api.get(`/orders/${orderId}`).then((r) => r.data),
    enabled:  Boolean(orderId),
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post('/checkout', payload).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
};
