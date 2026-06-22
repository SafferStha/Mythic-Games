import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { toast } from 'sonner';
import { getStoredUser } from '../utils/auth';

const reviewsKey = (gameId) => ['reviews', gameId];

export const useGameReviews = (gameId, { page = 1, limit = 20 } = {}) =>
  useQuery({
    queryKey: [...reviewsKey(gameId), page],
    queryFn:  () =>
      api.get(`/games/${gameId}/reviews`, { params: { page, limit } }).then((r) => r.data?.data ?? r.data),
    enabled: Boolean(gameId),
    staleTime: 60_000,
  });

export const useMyReview = (gameId) => {
  const user = getStoredUser();
  return useQuery({
    queryKey: [...reviewsKey(gameId), 'mine'],
    queryFn:  () =>
      api.get(`/games/${gameId}/my-review`).then((r) => r.data?.data?.review ?? null),
    enabled: Boolean(gameId) && Boolean(user),
    staleTime: 60_000,
  });
};

export const useSubmitReview = (gameId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, review_text }) =>
      api.post(`/games/${gameId}/reviews`, { rating, review_text }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewsKey(gameId) });
      toast.success('Review submitted!');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'Failed to submit review';
      toast.error(msg);
    },
  });
};

export const useUpdateReview = (gameId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, rating, review_text }) =>
      api.patch(`/reviews/${reviewId}`, { rating, review_text }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewsKey(gameId) });
      toast.success('Review updated');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'Failed to update review';
      toast.error(msg);
    },
  });
};

export const useDeleteReview = (gameId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId) => api.delete(`/reviews/${reviewId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewsKey(gameId) });
      toast.success('Review deleted');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'Failed to delete review';
      toast.error(msg);
    },
  });
};
