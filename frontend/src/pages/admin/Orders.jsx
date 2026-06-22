import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import DataTable   from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { fetchAdminOrders, updateOrderStatus } from '../../lib/adminApi';

const ORDER_STATUSES   = ['processing', 'completed', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

function StatusDropdown({ row, onUpdate }) {
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);

  const update = async (orderStatus) => {
    setOpen(false);
    setBusy(true);
    try {
      await updateOrderStatus(row.id, { orderStatus });
      toast.success('Status updated');
      onUpdate?.();
    } catch { toast.error('Update failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={busy}
        className="flex items-center gap-1 text-xs text-subtle hover:text-foreground transition-colors"
      >
        <StatusBadge status={row.order_status} />
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-white/8 rounded-lg shadow-lg py-1 min-w-32">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => update(s)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-white/5 transition-colors"
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');
  const [orderStatus,   setOrderStatus]   = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders({
        page, limit: 20,
        search:        search        || undefined,
        orderStatus:   orderStatus   || undefined,
        paymentStatus: paymentStatus || undefined,
      });
      setOrders(res.data.data.orders ?? []);
      setTotal(res.data.data.total   ?? 0);
    } catch { toast.error('Failed to load orders'); }
    finally  { setLoading(false); }
  }, [page, search, orderStatus, paymentStatus]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'order_number',  label: 'Order #', render: (v) => <span className="font-mono text-xs text-primary-light">{v}</span> },
    { key: 'customer_name', label: 'Customer' },
    { key: 'grand_total',   label: 'Total',   render: (v) => `Rs ${Number(v).toFixed(2)}` },
    { key: 'payment_status', label: 'Payment', render: (v) => <StatusBadge status={v} /> },
    { key: 'order_status',   label: 'Order',   render: (_, row) => <StatusDropdown row={row} onUpdate={load} /> },
    { key: 'created_at',    label: 'Date',    render: (v) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-foreground text-xl font-bold">Orders</h1>
        <p className="text-subtle text-sm mt-0.5">{total} total orders</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order number..."
            className="w-full pl-8 pr-3 py-2 bg-surface border border-white/8 rounded-lg text-sm text-foreground placeholder-subtle focus:outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={orderStatus}
          onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface border border-white/8 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
        >
          <option value="">All order statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface border border-white/8 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
        >
          <option value="">All payment statuses</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} className="p-2 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );
}
