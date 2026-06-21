import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ChevronDown, Download, RefreshCw,
  Gamepad2, Calendar, Hash, FileText, Receipt,
} from 'lucide-react';
import { toast } from 'sonner';

import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { SecondaryButton, PrimaryButton, IconButton } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { PageLoader, EmptyState, ErrorState } from '../components/ui/Feedback';
import { useOrders } from '../hooks/useOrders';
import api from '../lib/axios';

/* ── Download helper ─────────────────────────────────────── */
const downloadBlob = (data, filename) => {
  const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* ── Order item row (inside expanded order) ──────────────── */
const OrderItemRow = ({ item }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
    <div className="w-10 h-8 rounded-lg overflow-hidden shrink-0 bg-surface-hover flex items-center justify-center">
      <Gamepad2 size={14} className="text-subtle" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{item.game_title ?? item.title ?? 'Unknown Game'}</p>
      <p className="text-xs text-subtle">Qty: {item.quantity ?? 1}</p>
    </div>
    <span className="text-sm font-semibold text-primary-light shrink-0">
      ₹{Number(item.total_price ?? item.unit_price ?? 0).toLocaleString()}
    </span>
  </div>
);

/* ── Single order card ───────────────────────────────────── */
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState('');

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      const endpoint = type === 'invoice'
        ? `/invoice/${order.id}/download`
        : `/receipt/order/${order.id}/download`;

      const res = await api.get(endpoint, { responseType: 'blob' });
      downloadBlob(res.data, `${type}-${order.order_number ?? order.id}.pdf`);
      toast.success(`${type === 'invoice' ? 'Invoice' : 'Receipt'} downloaded`);
    } catch {
      toast.error(`Could not download ${type}. Please try again.`);
    } finally {
      setDownloading('');
    }
  };

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—';

  return (
    <motion.div
      layout
      className="glass rounded-2xl border border-white/8 overflow-hidden"
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors"
      >
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Package size={20} className="text-primary-light" />
        </div>

        {/* Order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">
              #{order.order_number ?? order.id}
            </span>
            <StatusBadge status={order.payment_status ?? order.order_status ?? 'pending'} />
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1 text-xs text-subtle">
              <Calendar size={11} />
              {orderDate}
            </span>
            <span className="flex items-center gap-1 text-xs text-subtle">
              <Hash size={11} />
              {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="text-right shrink-0 mr-2">
          <div className="text-lg font-extrabold text-primary-light">
            ₹{Number(order.grand_total ?? 0).toLocaleString()}
          </div>
        </div>

        {/* Expand */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-subtle shrink-0"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/8 pt-4">
              {/* Items */}
              {order.items?.length > 0 ? (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">
                    Items Ordered
                  </p>
                  {order.items.map((item, i) => (
                    <OrderItemRow key={i} item={item} />
                  ))}
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <SecondaryButton
                  size="sm"
                  leftIcon={downloading === 'invoice' ? <RefreshCw size={13} className="animate-spin" /> : <FileText size={13} />}
                  onClick={() => handleDownload('invoice')}
                  disabled={!!downloading || order.payment_status !== 'paid'}
                >
                  Invoice PDF
                </SecondaryButton>
                <SecondaryButton
                  size="sm"
                  leftIcon={downloading === 'receipt' ? <RefreshCw size={13} className="animate-spin" /> : <Receipt size={13} />}
                  onClick={() => handleDownload('receipt')}
                  disabled={!!downloading || order.payment_status !== 'paid'}
                >
                  Receipt PDF
                </SecondaryButton>

                {(order.payment_status === 'pending' || order.payment_status === 'failed') && (
                  <PrimaryButton
                    size="sm"
                    onClick={() => window.location.assign(`/checkout?retry=${order.id}`)}
                  >
                    Retry Payment
                  </PrimaryButton>
                )}
              </div>

              {order.payment_status !== 'paid' && (
                <p className="text-xs text-subtle mt-3 flex items-center gap-1.5">
                  <Download size={11} />
                  Invoice &amp; receipt available after payment is confirmed.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Orders page ─────────────────────────────────────────── */
const Orders = () => {
  const { data, isLoading, isError, refetch } = useOrders();

  const orders = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-350 mx-auto w-full px-4 md:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary-light uppercase tracking-widest font-semibold mb-1">
              <Package size={13} />
              Purchase History
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">My Orders</h1>
          </div>
          <IconButton
            variant="secondary"
            size="icon"
            onClick={() => refetch()}
            aria-label="Refresh orders"
          >
            <RefreshCw size={16} />
          </IconButton>
        </div>

        {isLoading && <PageLoader text="Loading your orders…" />}

        {isError && (
          <ErrorState
            message="We couldn't load your orders. Please try again."
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Once you complete a purchase, your orders will appear here."
            action={
              <PrimaryButton onClick={() => window.location.assign('/discover')}>
                Browse Games
              </PrimaryButton>
            }
          />
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
