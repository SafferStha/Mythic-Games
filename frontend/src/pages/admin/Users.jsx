import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import DataTable   from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { fetchAdminUsers, updateUserStatus, updateUserRole } from '../../lib/adminApi';
import { getStoredUser } from '../../utils/auth';

function ActionDropdown({ row, type, options, onAction }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handle = async (val) => {
    setOpen(false);
    setBusy(true);
    try {
      await onAction(row.id, val);
      toast.success(`${type === 'status' ? 'Status' : 'Role'} updated`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Update failed');
    } finally { setBusy(false); }
  };

  const current = type === 'status' ? row.status : row.role;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={busy}
        className="flex items-center gap-1 text-xs text-subtle hover:text-foreground transition-colors"
      >
        <StatusBadge status={current} />
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-white/8 rounded-lg shadow-lg py-1 min-w-32">
          {options.map((o) => (
            <button key={o} onClick={() => handle(o)} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/5 transition-colors">
              <StatusBadge status={o} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [role,    setRole]    = useState('');

  const me = getStoredUser();
  const isSuperAdmin = me?.role === 'super_admin';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers({ page, limit: 20, search: search || undefined, status: status || undefined, role: role || undefined });
      setUsers(res.data.data.users ?? []);
      setTotal(res.data.data.total ?? 0);
    } catch { toast.error('Failed to load users'); }
    finally  { setLoading(false); }
  }, [page, search, status, role]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'uid',       label: 'ID',       render: (v) => <span className="font-mono text-xs text-subtle">{v}</span> },
    { key: 'username',  label: 'Username' },
    { key: 'email',     label: 'Email',    render: (v) => <span className="text-subtle text-xs">{v}</span> },
    {
      key: 'role', label: 'Role',
      render: (_, row) => isSuperAdmin
        ? <ActionDropdown row={row} type="role" options={['user', 'admin', 'super_admin']} onAction={(id, r) => updateUserRole(id, r).then(load)} />
        : <StatusBadge status={row.role} />,
    },
    {
      key: 'status', label: 'Status',
      render: (_, row) => (
        <ActionDropdown row={row} type="status" options={['active', 'banned', 'inactive']} onAction={(id, s) => updateUserStatus(id, s).then(load)} />
      ),
    },
    { key: 'created_at', label: 'Joined', render: (v) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-foreground text-xl font-bold">Users</h1>
        <p className="text-subtle text-sm mt-0.5">{total} total users</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search username or email..."
            className="w-full pl-8 pr-3 py-2 bg-surface border border-white/8 rounded-lg text-sm text-foreground placeholder-subtle focus:outline-none focus:border-primary/50"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 bg-surface border border-white/8 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="px-3 py-2 bg-surface border border-white/8 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50">
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <button onClick={load} className="p-2 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors"><RefreshCw size={16} /></button>
      </div>

      <DataTable columns={columns} data={users} loading={loading} page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );
}
