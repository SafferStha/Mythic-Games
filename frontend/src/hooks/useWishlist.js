import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { toast } from 'sonner';

const KEY = ['wishlist'];

export const useWishlist = () =>
  useQuery({
    queryKey: KEY,
    queryFn:  () => api.get('/wishlist').then((r) => r.data?.data ?? r.data),
    staleTime: 60_000,
  });

export const useAddToWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gameId) => api.post('/wishlist/add', { game_id: gameId }).then((r) => r.data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Added to wishlist');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'Failed to add to wishlist';
      toast.error(msg);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gameId) => api.delete(`/wishlist/remove/${gameId}`).then((r) => r.data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Removed from wishlist');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'Failed to remove from wishlist';
      toast.error(msg);
    },
  });
};

export const useMoveToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gameId) => api.post(`/wishlist/move-to-cart/${gameId}`).then((r) => r.data),
    onSuccess:  (data) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['cart'] });
      toast.success(data?.message ?? 'Moved to cart');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'Failed to move to cart';
      toast.error(msg);
    },
  });
};
