import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import './Wishlist.css';
import { addToWishlist, getWishlist, removeFromWishlist } from './wishlistStorage';

const Wishlist = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getWishlist());
  }, []);

  const removeItem = (id) => {
    removeFromWishlist(id);
    setItems(getWishlist());
  };

  // Demo fallback: if wishlist is empty, show a helpful empty state.
  return (
    <div className="wishlist-container">
      <Navbar />

      <div className="wishlist-container" style={{ paddingTop: 18 }}>
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
              <a
                href="/browse"
                className="small-btn"
                style={{ display: 'inline-block', textDecoration: 'none' }}
              >
                Go to Browse
              </a>

              <button
                type="button"
                className="small-btn secondary"
                onClick={() => {
                  // add a single demo item for immediate visibility
                  addToWishlist({
                    id: '1',
                    title: 'Red Dead Redemption 2',
                    type: 'Action-Adventure',
                    price: 3499,
                    image: ''
                  });
                  setItems(getWishlist());
                }}
              >
                Add demo item
              </button>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((game) => (
              <div className="wishlist-card-wrap" key={String(game.id)}>
                <a
                  href={`/game/${encodeURIComponent(String(game.id))}`}
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
                </a>

                <button
                  type="button"
                  className="wishlist-remove"
                  onClick={() => removeItem(game.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

