import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const GAMES_KEY = ['games'];

export const useGames = (params = {}) =>
  useQuery({
    queryKey: [...GAMES_KEY, params],
    queryFn:  () => api.get('/games', { params }).then((r) => r.data),
  });

export const useGame = (gameId) =>
  useQuery({
    queryKey: [...GAMES_KEY, gameId],
    queryFn:  () => api.get(`/games/${gameId}`).then((r) => r.data),
    enabled:  Boolean(gameId),
  });

export const useFeaturedGames = () =>
  useQuery({
    queryKey: [...GAMES_KEY, 'featured'],
    queryFn:  () => api.get('/games', { params: { featured: true, limit: 8 } }).then((r) => r.data),
  });

export const useTrendingGames = () =>
  useQuery({
    queryKey: [...GAMES_KEY, 'trending'],
    queryFn:  () => api.get('/games', { params: { sort: 'popular', limit: 6 } }).then((r) => r.data),
  });
