import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { createAdminGame, updateAdminGame, fetchAdminCategories } from '../../lib/adminApi';

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'Multi-platform'];

export default function GameForm({ game, onClose, onSaved }) {
  const [categories, setCategories] = useState([]);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({
    title:            game?.title            ?? '',
    slug:             game?.slug             ?? '',
    description:      game?.description      ?? '',
    shortDescription: game?.short_description ?? '',
    price:            game?.price            ?? '',
    discountPrice:    game?.discount_price   ?? '',
    stock:            game?.stock            ?? 0,
    categoryId:       game?.category_id      ?? '',
    publisher:        game?.publisher        ?? '',
    developer:        game?.developer        ?? '',
    releaseDate:      game?.release_date     ? game.release_date.slice(0, 10) : '',
    platform:         game?.platform         ?? 'PC',
    coverImage:       game?.cover_image      ?? '',
    bannerImage:      game?.banner_image     ?? '',
    status:           game?.status           ?? 'active',
  });

  useEffect(() => {
    fetchAdminCategories().then((r) => setCategories(r.data.data ?? [])).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:         parseFloat(form.price)         || 0,
        discountPrice: parseFloat(form.discountPrice) || null,
        stock:         parseInt(form.stock)           || 0,
        categoryId:    form.categoryId                || null,
        releaseDate:   form.releaseDate               || null,
      };
      if (game) {
        await updateAdminGame(game.id, payload);
        toast.success('Game updated');
      } else {
        await createAdminGame(payload);
        toast.success('Game created');
      }
      onSaved?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs text-subtle mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-bg border border-white/8 rounded-lg text-sm text-foreground placeholder-subtle focus:outline-none focus:border-primary/50"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-surface border border-white/8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 sticky top-0 bg-surface z-10">
          <h2 className="text-foreground font-semibold">{game ? 'Edit Game' : 'Add Game'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Title *', 'title', 'text', 'Game title')}
            {field('Slug', 'slug', 'text', 'auto-generated if blank')}
            {field('Price (Rs) *', 'price', 'number', '0.00')}
            {field('Discount Price (Rs)', 'discountPrice', 'number', 'optional')}
            {field('Stock', 'stock', 'number', '0')}
            <div>
              <label className="block text-xs text-subtle mb-1">Category</label>
              <select
                value={form.categoryId}
                onChange={set('categoryId')}
                className="w-full px-3 py-2 bg-bg border border-white/8 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {field('Publisher', 'publisher')}
            {field('Developer', 'developer')}
            {field('Release Date', 'releaseDate', 'date')}
            <div>
              <label className="block text-xs text-subtle mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={set('platform')}
                className="w-full px-3 py-2 bg-bg border border-white/8 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-subtle mb-1">Status</label>
              <select
                value={form.status}
                onChange={set('status')}
                className="w-full px-3 py-2 bg-bg border border-white/8 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {field('Cover Image URL', 'coverImage', 'url', 'https://')}
          {field('Banner Image URL', 'bannerImage', 'url', 'https://')}

          <div>
            <label className="block text-xs text-subtle mb-1">Short Description</label>
            <input
              value={form.shortDescription}
              onChange={set('shortDescription')}
              placeholder="Brief summary..."
              className="w-full px-3 py-2 bg-bg border border-white/8 rounded-lg text-sm text-foreground placeholder-subtle focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs text-subtle mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={4}
              placeholder="Full description..."
              className="w-full px-3 py-2 bg-bg border border-white/8 rounded-lg text-sm text-foreground placeholder-subtle focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-subtle hover:text-foreground hover:bg-white/8 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : game ? 'Update Game' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
