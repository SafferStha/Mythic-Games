import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import DataTable   from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import GameForm     from './GameForm';
import { fetchAdminGames, deleteAdminGame } from '../../lib/adminApi';

const fmt = (v) => v != null ? `Rs ${Number(v).toFixed(2)}` : '—';

export default function Games() {
  const [games,   setGames]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [formOpen,   setFormOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminGames({ page, limit: 20, search: search || undefined, status: status || undefined });
      setGames(res.data.data.games ?? []);
      setTotal(res.data.data.total ?? 0);
    } catch {
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (game) => {
    if (!confirm(`Soft-delete "${game.title}"?`)) return;
    try {
      await deleteAdminGame(game.id);
      toast.success('Game deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    {
      key: 'cover_image', label: 'Cover',
      render: (v, row) => v
        ? <img src={v} alt={row.title} className="w-9 h-9 rounded object-cover" />
        : <div className="w-9 h-9 rounded bg-surface-hover" />,
    },
    { key: 'title', label: 'Title' },
    { key: 'price', label: 'Price', render: (v) => fmt(v) },
    { key: 'stock', label: 'Stock', render: (v) => (
      <span className={v === 0 ? 'text-danger font-medium' : v <= 10 ? 'text-warning' : 'text-foreground'}>{v}</span>
    )},
    { key: 'category_name', label: 'Category' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditTarget(row); setFormOpen(true); }}
            className="p-1.5 rounded-lg text-subtle hover:text-primary-light hover:bg-primary/10 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-foreground text-xl font-bold">Games</h1>
          <p className="text-subtle text-sm mt-0.5">{total} total games</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Game
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search games..."
            className="w-full pl-8 pr-3 py-2 bg-surface border border-white/8 rounded-lg text-sm text-foreground placeholder-subtle focus:outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface border border-white/8 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deleted">Deleted</option>
        </select>
        <button onClick={load} className="p-2 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      <DataTable
        columns={columns}
        data={games}
        loading={loading}
        page={page}
        total={total}
        limit={20}
        onPage={setPage}
      />

      {formOpen && (
        <GameForm
          game={editTarget}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
          onSaved={() => { load(); setFormOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
