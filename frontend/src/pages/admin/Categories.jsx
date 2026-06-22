import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../components/admin/DataTable';
import {
  fetchAdminCategories, createAdminCategory,
  updateAdminCategory, deleteAdminCategory,
} from '../../lib/adminApi';

function CategoryForm({ category, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    name:        category?.name        ?? '',
    slug:        category?.slug        ?? '',
    icon:        category?.icon        ?? '',
    description: category?.description ?? '',
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (category) {
        await updateAdminCategory(category.id, form);
        toast.success('Category updated');
      } else {
        await createAdminCategory(form);
        toast.success('Category created');
      }
      onSaved?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-surface border border-white/8 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-foreground font-semibold">{category ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[['Name *', 'name'], ['Slug', 'slug'], ['Icon (emoji/url)', 'icon']].map(([label, key]) => (
            <div key={key}>
              <label className="block text-xs text-subtle mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={set(key)}
                className="w-full px-3 py-2 bg-bg border border-white/8 rounded-lg text-sm text-foreground placeholder-subtle focus:outline-none focus:border-primary/50"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-subtle mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              className="w-full px-3 py-2 bg-bg border border-white/8 rounded-lg text-sm text-foreground placeholder-subtle focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-subtle hover:text-foreground hover:bg-white/8 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [formOpen,   setFormOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminCategories();
      setCategories(res.data.data ?? []);
    } catch { toast.error('Failed to load categories'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await deleteAdminCategory(cat.id);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Delete failed');
    }
  };

  const columns = [
    { key: 'icon', label: 'Icon', render: (v) => <span className="text-lg">{v ?? '—'}</span> },
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug', render: (v) => <span className="text-subtle font-mono text-xs">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => (
      <span className="text-subtle text-xs truncate max-w-48 block">{v ?? '—'}</span>
    )},
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditTarget(row); setFormOpen(true); }} className="p-1.5 rounded-lg text-subtle hover:text-primary-light hover:bg-primary/10 transition-colors"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(row)} className="p-1.5 rounded-lg text-subtle hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-bold">Categories</h1>
          <p className="text-subtle text-sm mt-0.5">{categories.length} total categories</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <DataTable columns={columns} data={categories} loading={loading} total={categories.length} limit={categories.length || 1} />

      {formOpen && (
        <CategoryForm
          category={editTarget}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
          onSaved={() => { load(); setFormOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
