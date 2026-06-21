import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Trash2, Heart, ArrowRight, ShoppingBag,
  Gamepad2, Tag, Shield, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { PrimaryButton, SecondaryButton, DangerButton, IconButton } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { ConfirmModal } from '../components/ui/Modal';
import { useGameLibrary } from '../contexts/GameLibraryContext.jsx';

/* ── Cart item row ────────────────────────────────────────── */
const CartItem = ({ item, onRemove, onMoveToWishlist, isInWishlist }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await new Promise((r) => setTimeout(r, 180));
    onRemove();
    toast.success(`"${item.title}" removed from cart`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-white/6 hover:border-white/10 transition-colors group"
    >
      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-hover">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2 size={22} className="text-subtle" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate mb-0.5">
          <Link to={`/game/${encodeURIComponent(item.title)}`} className="hover:text-primary-light transition-colors">
            {item.title}
          </Link>
        </h3>
        <p className="text-xs text-subtle">{item.platform ?? 'PC / Standard Edition'}</p>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <p className="text-lg font-bold text-primary-light">
          ₹{(item.price * (item.quantity || 1)).toLocaleString()}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs text-subtle">₹{item.price.toLocaleString()} each</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <IconButton
          size="icon-sm"
          variant="ghost"
          onClick={() => {
            onMoveToWishlist();
            toast.success(isInWishlist ? 'Already in wishlist' : 'Moved to wishlist');
          }}
          aria-label="Move to wishlist"
          className={isInWishlist ? 'text-danger' : ''}
        >
          <Heart size={15} className={isInWishlist ? 'fill-danger text-danger' : ''} />
        </IconButton>
        <IconButton
          size="icon-sm"
          variant="ghost"
          onClick={handleRemove}
          aria-label="Remove from cart"
          className="hover:text-danger hover:bg-danger/10"
        >
          <Trash2 size={15} />
        </IconButton>
      </div>
    </motion.div>
  );
};

/* ── Order summary card ───────────────────────────────────── */
const OrderSummary = ({ subtotal, onCheckout, itemCount }) => {
  const tax = 0;
  const total = subtotal + tax;

  return (
    <div className="sticky top-24 glass rounded-3xl p-6 border border-white/10">
      <h2 className="text-lg font-bold text-foreground mb-5">Order Summary</h2>

      <div className="flex flex-col gap-3 mb-5">
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-muted">
          <span>Tax</span>
          <span className="text-success">Free</span>
        </div>
        <div className="h-px bg-white/8" />
        <div className="flex justify-between font-bold text-foreground">
          <span>Total</span>
          <span className="text-xl text-primary-light">₹{total.toLocaleString()}</span>
        </div>
      </div>

      <PrimaryButton
        className="w-full"
        size="lg"
        onClick={onCheckout}
        disabled={itemCount === 0}
        rightIcon={<ArrowRight size={17} />}
      >
        Proceed to Checkout
      </PrimaryButton>

      {/* Trust signals */}
      <div className="flex flex-col gap-2 mt-5 pt-5 border-t border-white/8">
        {[
          { icon: Shield, text: 'Secure SSL payment' },
          { icon: Tag, text: 'Best price guarantee' },
          { icon: Gamepad2, text: 'Instant digital delivery' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs text-subtle">
            <Icon size={13} className="text-primary-light shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Cart page ────────────────────────────────────────────── */
const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, moveCartItemToWishlist, isInWishlist, wishlistItems } =
    useGameLibrary();

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-350 mx-auto w-full px-4 md:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary-light uppercase tracking-widest font-semibold mb-1">
              <ShoppingCart size={14} />
              Shopping Cart
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Your Cart
              {cartItems.length > 0 && (
                <span className="ml-3 text-xl text-subtle font-normal">
                  ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
                </span>
              )}
            </h1>
          </div>

          {cartItems.length > 0 && (
            <SecondaryButton
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => setClearConfirmOpen(true)}
              className="text-danger hover:bg-danger/10 hover:border-danger/30"
            >
              Clear cart
            </SecondaryButton>
          )}
        </div>

        {cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Find your next favourite game and add it to your cart."
            action={
              <PrimaryButton rightIcon={<ChevronRight size={16} />} onClick={() => navigate('/discover')}>
                Browse Games
              </PrimaryButton>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <div key={item.key} className="mb-3">
                    <CartItem
                      item={item}
                      onRemove={() => removeFromCart(item.key)}
                      onMoveToWishlist={() => moveCartItemToWishlist(item.key)}
                      isInWishlist={isInWishlist(item)}
                    />
                  </div>
                ))}
              </AnimatePresence>

              {/* Continue shopping */}
              <Link
                to="/discover"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-subtle hover:text-foreground transition-colors"
              >
                <ChevronRight size={14} className="rotate-180" />
                Continue shopping
              </Link>
            </div>

            {/* Summary */}
            <div>
              <OrderSummary
                subtotal={subtotal}
                itemCount={cartItems.length}
                onCheckout={() => navigate('/checkout')}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Clear cart confirm */}
      <ConfirmModal
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={() => {
          cartItems.forEach((item) => removeFromCart(item.key));
          setClearConfirmOpen(false);
          toast.success('Cart cleared');
        }}
        title="Clear your cart?"
        message="All items will be removed from your cart. This cannot be undone."
        confirmLabel="Clear Cart"
      />
    </div>
  );
};

export default Cart;
