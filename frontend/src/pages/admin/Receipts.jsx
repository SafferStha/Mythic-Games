import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import DataTable   from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { fetchAdminReceipts, regenerateReceipt } from '../../lib/adminApi';

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminReceipts({ page, limit: 20 });
      setReceipts(res.data.data.receipts ?? []);
      setTotal(res.data.data.total       ?? 0);
    } catch { toast.error('Failed to load receipts'); }
    finally  { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleRegenerate = async (paymentId) => {
    try {
      await regenerateReceipt(paymentId);
      toast.success('Receipt regenerated');
      load();
    } catch { toast.error('Regeneration failed'); }
  };

  const columns = [
    { key: 'receipt_number',   label: 'Receipt #', render: (v) => <span className="font-mono text-xs text-primary-light">{v}</span> },
    { key: 'transaction_uuid', label: 'Transaction', render: (v) => <span className="font-mono text-xs text-subtle truncate max-w-32 block">{v ?? '—'}</span> },
    { key: 'order_number',     label: 'Order #',   render: (v) => <span className="font-mono text-xs">{v ?? '—'}</span> },
    { key: 'customer_name',    label: 'Customer' },
    { key: 'amount',           label: 'Amount',   render: (v) => v ? `Rs ${Number(v).toFixed(2)}` : '—' },
    { key: 'payment_status',   label: 'Payment',  render: (v) => v ? <StatusBadge status={v} /> : null },
    { key: 'receipt_path',     label: 'File',     render: (v) => (
      <span className={`text-xs ${v ? 'text-success' : 'text-danger'}`}>{v ? '✓ Generated' : '✗ Missing'}</span>
    )},
    { key: 'generated_at',     label: 'Generated', render: (v) => new Date(v).toLocaleDateString() },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <button
          onClick={() => handleRegenerate(row.payment_id)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-accent hover:bg-accent/10 border border-accent/25 transition-colors"
        >
          <RotateCcw size={12} /> Regenerate
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-bold">Receipts</h1>
          <p className="text-subtle text-sm mt-0.5">{total} total receipts</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors"><RefreshCw size={16} /></button>
      </div>

      <DataTable columns={columns} data={receipts} loading={loading} page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );
}
