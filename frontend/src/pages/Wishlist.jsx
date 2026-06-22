import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Loader2, ArrowRight, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { useWishlist, useRemoveFromWishlist, useMoveToCart } from '../hooks/useWishlist';
import { getStoredUser } from '../utils/auth';

const WishlistCard = ({ item, onRemove, onMoveToCart, isRemoving, isMoving }) => {
  const price    = parseFloat(item.discount_price ?? item.price ?? 0);
  const original = parseFloat(item.price ?? 0);
  const hasDiscount = item.discount_price && parseFloat(item.discount_price) < original;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass rounded-2xl overflow-hidden border border-white/8 flex flex-col group"
    >
      {/* Cover */}
      <Link to={`/game/${encodeURIComponent(item.title)}`} className="block relative overflow-hidden aspect-video bg-surface-hover shrink-0">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2 size={32} className="text-subtle" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 right-2 bg-success text-white text-xs font-bold px-2 py-0.5 rounded-md">
            -{Math.round((1 - price / original) * 100)}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <Link
            to={`/game/${encodeURIComponent(item.title)}`}
            className="font-semibold text-foreground hover:text-primary-light transition-colors line-clamp-2 text-sm leading-snug"
          >
            {item.title}
          </Link>
          {item.developer && (
            <p className="text-xs text-subtle mt-0.5">{item.developer}</p>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-primary-light font-bold">₹{price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-subtle text-xs line-through">₹{original.toLocaleString()}</span>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onMoveToCart(item.game_id)}
            disabled={isMoving}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary/15 text-primary-light text-xs font-semibold border border-primary/30 hover:bg-primary/25 transition-all duration-200 disabled:opacity-50"
          >
            {isMoving ? <Loader2 size={13} className="animate-spin" /> : <ShoppingCart size={13} />}
            Move to Cart
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.game_id)}
            disabled={isRemoving}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all duration-200 shrink-0 disabled:opacity-50"
            aria-label="Remove from wishlist"
          >
            {isRemoving ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Wishlist = () => {
  const user                 = getStoredUser();
  const { data, isLoading }  = useWishlist();
  const { mutate: remove, isPending: isRemoving, variables: removingId } = useRemoveFromWishlist();
  const { mutate: moveToCart, isPending: isMoving, variables: movingId } = useMoveToCart();

  const items = data?.items ?? [];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-350 mx-auto w-full px-4 md:px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-primary-light uppercase tracking-widest font-semibold mb-1">
            <Heart size={13} />
            Your Wishlist
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">
            {isLoading ? 'Loading…' : `${items.length} game${items.length !== 1 ? 's' : ''} saved`}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-subtle">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-16 text-center border border-white/8"
          >
            <Heart size={48} className="text-white/10 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-subtle text-sm mb-8">Discover games and save the ones you love.</p>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
            >
              Browse Games <ArrowRight size={15} />
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => (
                <WishlistCard
                  key={item.game_id}
                  item={item}
                  onRemove={(id)    => remove(id)}
                  onMoveToCart={(id) => moveToCart(id)}
                  isRemoving={isRemoving && removingId === item.game_id}
                  isMoving={isMoving  && movingId  === item.game_id}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
