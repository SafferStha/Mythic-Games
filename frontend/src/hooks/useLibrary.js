import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { getStoredUser } from '../utils/auth';

const KEY = ['library'];

export const useLibrary = () => {
  const user = getStoredUser();
  return useQuery({
    queryKey: KEY,
    queryFn:  () => api.get('/library').then((r) => r.data?.data ?? r.data),
    enabled:  Boolean(user),
    staleTime: 120_000,
  });
};

export const useOwnsGame = (gameId) => {
  const user = getStoredUser();
  return useQuery({
    queryKey: [...KEY, 'owns', gameId],
    queryFn:  () => api.get(`/library/owns/${gameId}`).then((r) => r.data?.data?.owned ?? false),
    enabled:  Boolean(user) && Boolean(gameId),
    staleTime: 300_000,
  });
};
