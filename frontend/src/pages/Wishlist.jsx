<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import './Wishlist.css';
import { useGameLibrary } from '../contexts/GameLibraryContext.jsx';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useGameLibrary();

  const removeItem = (itemKey) => {
    removeFromWishlist(itemKey);
  };

  const items = wishlistItems;
=======
import Navbar from "../components/Navbar";
import CartItemCard from "../components/cart/CartItemCard";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";
import "./Wishlist.css";

const Wishlist = () => {
  const { wishlistItems, moveWishlistItemToCart, removeFromWishlist } =
    useGameLibrary();
>>>>>>> parent of 886da3a (Revert "Add GameLibrary, cart UI, and navbar overhaul")

  return (
    <div className="wishlist-page">
      <Navbar />

<<<<<<< HEAD
      <main className="wishlist-container">
        <div style={{ padding: '0 0 0 0' }}>
          <h1 style={{ color: 'var(--text-primary)' }}>Wishlist</h1>
          <div className="muted" style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            {items.length > 0
              ? `${items.length} game${items.length === 1 ? '' : 's'} saved`
              : 'Save games to see them here.'}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="wishlist-empty">
            <strong style={{ color: 'var(--text-primary)' }}>No items in wishlist</strong>
            <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: 14 }}>
              Browse and add your favorite games.
            </div>

            <div className="wishlist-actions" style={{ marginTop: 14 }}>
              <Link to="/browse" className="small-btn" style={{ display: 'inline-block' }}>
                Go to Browse
              </Link>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((game) => (
              <div className="wishlist-card-wrap" key={String(game.id)}>
                <Link
                  to={`/game/${encodeURIComponent(String(game.title))}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}
                  aria-label={`View ${game.title}`}
                >
                  <GameCard
                    title={game.title}
                    price={game.price}
                    originalPrice={game.originalPrice ?? game.price}
                    image={game.image}
                    type={game.type}
                  />
                </Link>

                <button
                  type="button"
                  className="wishlist-remove"
                  onClick={() => removeItem(game.key)}
                >
                  Remove
                </button>
              </div>
            ))}
=======
      <main className="wishlist-main">
        <div className="wishlist-header">
          <h1>Wishlist</h1>
          <span>
            {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="wishlist-list">
            {wishlistItems.map((item) => (
              <CartItemCard
                key={item.key}
                title={item.title}
                price={item.price}
                quantity={item.quantity}
                image={item.image}
                platform={item.platform}
                onRemove={() => removeFromWishlist(item.key)}
                onMoveToWishlist={() => moveWishlistItemToCart(item.key)}
                removeLabel="Remove"
                primaryActionLabel="Move to cart"
              />
            ))}
          </div>
        ) : (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon" aria-hidden="true">
              ♡
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Open a game page and save it here to come back to it later.</p>
>>>>>>> parent of 886da3a (Revert "Add GameLibrary, cart UI, and navbar overhaul")
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;

