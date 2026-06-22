import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import DataTable   from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { fetchAdminPayments, verifyPayment } from '../../lib/adminApi';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [status,   setStatus]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminPayments({ page, limit: 20, status: status || undefined });
      setPayments(res.data.data.payments ?? []);
      setTotal(res.data.data.total       ?? 0);
    } catch { toast.error('Failed to load payments'); }
    finally  { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (id) => {
    if (!confirm('Manually verify this payment?')) return;
    try {
      await verifyPayment(id);
      toast.success('Payment verified');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Verify failed');
    }
  };

  const columns = [
    { key: 'transaction_uuid', label: 'Transaction UUID', render: (v) => <span className="font-mono text-xs text-primary-light">{v}</span> },
    { key: 'order_number',    label: 'Order #',   render: (v) => <span className="font-mono text-xs">{v ?? '—'}</span> },
    { key: 'customer_name',   label: 'Customer' },
    { key: 'amount',          label: 'Amount',   render: (v) => `Rs ${Number(v).toFixed(2)}` },
    { key: 'payment_status',  label: 'Status',   render: (v) => <StatusBadge status={v} /> },
    { key: 'provider',        label: 'Provider', render: (v) => <span className="text-xs text-subtle capitalize">{v}</span> },
    { key: 'created_at',      label: 'Date',     render: (v) => new Date(v).toLocaleDateString() },
    {
      key: 'actions', label: '',
      render: (_, row) => row.payment_status !== 'verified' ? (
        <button
          onClick={() => handleVerify(row.id)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-success hover:bg-success/10 border border-success/25 transition-colors"
        >
          <ShieldCheck size={13} /> Verify
        </button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-foreground text-xl font-bold">Payments</h1>
        <p className="text-subtle text-sm mt-0.5">{total} total payments</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface border border-white/8 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
        >
          <option value="">All statuses</option>
          <option value="initiated">Initiated</option>
          <option value="verified">Verified</option>
          <option value="failed">Failed</option>
        </select>
        <button onClick={load} className="p-2 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      <DataTable columns={columns} data={payments} loading={loading} page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );
}
