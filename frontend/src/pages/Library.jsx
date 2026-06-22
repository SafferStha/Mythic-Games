import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Library as LibraryIcon, Gamepad2, Loader2, Search, Grid3X3, List, ArrowRight } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { useLibrary } from '../hooks/useLibrary';

const FILTERS = ['All', 'Recent'];

const LibraryGameCard = ({ item, viewMode }) => {
  const isListView = viewMode === 'list';
  const coverImage = item.cover_image;

  if (isListView) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass rounded-2xl flex items-center gap-4 p-4 border border-white/8 hover:border-primary/20 transition-all duration-200 group"
      >
        <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-hover">
          {coverImage ? (
            <img src={coverImage} alt={item.game_title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gamepad2 size={20} className="text-subtle" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/game/${encodeURIComponent(item.game_title)}`}
            className="font-semibold text-foreground group-hover:text-primary-light transition-colors truncate block"
          >
            {item.game_title}
          </Link>
          {item.category_name && (
            <p className="text-xs text-subtle mt-0.5">{item.category_name}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-success font-semibold bg-success/10 border border-success/20 px-2 py-0.5 rounded-md">
            Owned
          </span>
          <p className="text-xs text-subtle mt-1">
            {new Date(item.purchase_date).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden border border-white/8 hover:border-primary/20 transition-all duration-200 group flex flex-col"
    >
      <Link to={`/game/${encodeURIComponent(item.game_title)}`} className="block relative aspect-video overflow-hidden bg-surface-hover shrink-0">
        {coverImage ? (
          <img
            src={coverImage}
            alt={item.game_title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2 size={32} className="text-subtle" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-success/80 px-1.5 py-0.5 rounded">
          OWNED
        </span>
      </Link>

      <div className="p-3 flex-1">
        <Link
          to={`/game/${encodeURIComponent(item.game_title)}`}
          className="font-semibold text-sm text-foreground group-hover:text-primary-light transition-colors line-clamp-2 leading-snug block"
        >
          {item.game_title}
        </Link>
        {item.category_name && (
          <p className="text-xs text-subtle mt-1">{item.category_name}</p>
        )}
        <p className="text-xs text-subtle/60 mt-1.5">
          Purchased {new Date(item.purchase_date).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
};

const Library = () => {
  const { data, isLoading } = useLibrary();
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode]         = useState('grid');
  const [search, setSearch]             = useState('');

  const items = data?.items ?? [];

  const filtered = useMemo(() => {
    let list = items;
    if (activeFilter === 'Recent') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      list = list.filter((i) => new Date(i.purchase_date) >= cutoff);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.game_title.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeFilter, search]);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-350 mx-auto w-full px-4 md:px-6 pt-28 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary-light uppercase tracking-widest font-semibold mb-1">
              <LibraryIcon size={13} />
              My Library
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              {isLoading ? 'Loading…' : `${items.length} game${items.length !== 1 ? 's' : ''} owned`}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                type="search"
                placeholder="Search library…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-surface border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder-subtle focus:outline-none focus:border-primary/40 w-48"
              />
            </div>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary/15 text-primary-light border border-primary/30' : 'text-subtle hover:text-foreground hover:bg-surface'}`}
              aria-label="Grid view"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary/15 text-primary-light border border-primary/30' : 'text-subtle hover:text-foreground hover:bg-surface'}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface text-subtle hover:text-foreground border border-white/8'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-subtle">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center border border-white/8">
            <LibraryIcon size={48} className="text-white/10 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Your library is empty</h2>
            <p className="text-subtle text-sm mb-8">
              Purchase games to see them here permanently.
            </p>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
            >
              Browse Games <ArrowRight size={15} />
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-subtle py-16">No games match your search.</p>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'flex flex-col gap-3'
          }>
            {filtered.map((item) => (
              <LibraryGameCard key={item.id} item={item} viewMode={viewMode} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Library;
