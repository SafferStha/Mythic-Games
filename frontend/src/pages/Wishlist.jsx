import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import './Wishlist.css';
import { useGameLibrary } from '../contexts/GameLibraryContext.jsx';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, addToCart, isInCart } = useGameLibrary();

  const removeItem = (itemKey) => {
    removeFromWishlist(itemKey);
  };

  const handleAddToCart = (game) => {
    addToCart(game);
  };

  const items = wishlistItems;

  return (
    <div className="wishlist-page">
      <Navbar />

      <main className="wishlist-container">
        <div>
          <h1>Wishlist</h1>
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
                  style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block', width: '100%' }}
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

                <div className="wishlist-card-actions">
                  <button 
                    className={`wishlist-add-cart-btn ${isInCart(game) ? 'added' : ''}`}
                    onClick={() => handleAddToCart(game)}
                    type="button"
                    disabled={isInCart(game)}
                  >
                    {isInCart(game) ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;

