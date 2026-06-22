import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { toast } from 'sonner';
import { getStoredUser } from '../utils/auth';

const KEY = ['notifications'];

export const useNotifications = ({ page = 1, limit = 20, unreadOnly = false } = {}) => {
  const user = getStoredUser();
  return useQuery({
    queryKey: [...KEY, page, unreadOnly],
    queryFn:  () =>
      api.get('/notifications', { params: { page, limit, unread: unreadOnly } })
         .then((r) => r.data?.data ?? r.data),
    enabled:   Boolean(user),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};

export const useUnreadCount = () => {
  const user    = getStoredUser();
  const { data } = useNotifications();
  return data?.unread_count ?? 0;
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all').then((r) => r.data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('All notifications marked as read');
    },
  });
};
