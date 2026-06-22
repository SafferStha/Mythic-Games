import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Loader2, Info, ShoppingBag, Tag, RefreshCw, Megaphone } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '../../hooks/useNotifications';

const TYPE_ICONS = {
  payment_success:   ShoppingBag,
  order_completed:   ShoppingBag,
  order_failed:      ShoppingBag,
  refund_approved:   RefreshCw,
  refund_rejected:   RefreshCw,
  refund_processed:  RefreshCw,
  coupon_alert:      Tag,
  discount:          Tag,
  admin_announcement: Megaphone,
  general:           Info,
};

const TypeIcon = ({ type, size = 14 }) => {
  const Icon = TYPE_ICONS[type] ?? Info;
  return <Icon size={size} />;
};

const NotificationItem = ({ notification, onRead }) => {
  const isUnread = !notification.is_read;

  return (
    <button
      type="button"
      onClick={() => isUnread && onRead(notification.id)}
      className={`w-full text-left flex gap-3 px-4 py-3 transition-colors hover:bg-white/5 ${
        isUnread ? 'bg-primary/5' : ''
      }`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        isUnread ? 'bg-primary/20 text-primary-light' : 'bg-surface-hover text-subtle'
      }`}>
        <TypeIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold leading-snug ${isUnread ? 'text-foreground' : 'text-muted'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-subtle mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-subtle/60 mt-1">
          {new Date(notification.created_at).toLocaleDateString()}
        </p>
      </div>
      {isUnread && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </button>
  );
};

const NotificationBell = () => {
  const [open, setOpen]     = useState(false);
  const panelRef            = useRef(null);

  const { data, isLoading }                              = useNotifications({ limit: 15 });
  const { mutate: markRead, isPending: marking }         = useMarkNotificationRead();
  const { mutate: markAll,  isPending: markingAll }      = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount   = data?.unread_count   ?? 0;

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
          open
            ? 'bg-primary/15 text-white border border-primary/30'
            : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
        }`}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <div>
                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-subtle">{unreadCount} unread</p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAll()}
                  disabled={markingAll}
                  className="flex items-center gap-1.5 text-xs text-primary-light hover:text-white transition-colors disabled:opacity-50"
                >
                  {markingAll ? <Loader2 size={11} className="animate-spin" /> : <CheckCheck size={11} />}
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-subtle">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={24} className="text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-subtle">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={(id) => markRead(id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
