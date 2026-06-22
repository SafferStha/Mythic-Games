import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../components/admin/DataTable';
import { fetchAdminInvoices, regenerateInvoice } from '../../lib/adminApi';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminInvoices({ page, limit: 20 });
      setInvoices(res.data.data.invoices ?? []);
      setTotal(res.data.data.total       ?? 0);
    } catch { toast.error('Failed to load invoices'); }
    finally  { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleRegenerate = async (orderId) => {
    try {
      await regenerateInvoice(orderId);
      toast.success('Invoice regenerated');
      load();
    } catch { toast.error('Regeneration failed'); }
  };

  const columns = [
    { key: 'invoice_number', label: 'Invoice #', render: (v) => <span className="font-mono text-xs text-primary-light">{v}</span> },
    { key: 'order_number',   label: 'Order #',   render: (v) => <span className="font-mono text-xs">{v ?? '—'}</span> },
    { key: 'customer_name',  label: 'Customer' },
    { key: 'invoice_path',   label: 'File',      render: (v) => (
      <span className={`text-xs ${v ? 'text-success' : 'text-danger'}`}>{v ? '✓ Generated' : '✗ Missing'}</span>
    )},
    { key: 'generated_at',   label: 'Generated', render: (v) => new Date(v).toLocaleDateString() },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <button
          onClick={() => handleRegenerate(row.order_id)}
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
          <h1 className="text-foreground text-xl font-bold">Invoices</h1>
          <p className="text-subtle text-sm mt-0.5">{total} total invoices</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors"><RefreshCw size={16} /></button>
      </div>

      <DataTable columns={columns} data={invoices} loading={loading} page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );
}
