import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './GameDetails.css';
import { getWishlist, isInWishlist, addToWishlist, removeFromWishlist } from './wishlistStorage';

// Minimal demo catalog (no backend). Extend as needed.
const DEMO_GAMES = {
  '1': {
    id: '1',
    title: 'Red Dead Redemption 2',
    type: 'Action-Adventure',
    price: 3499,
    image: new URL('../assets/RedDead.png', import.meta.url).toString(),
    description:
      'A high-stakes journey through the American frontier—crafted for unforgettable moments.'
  },
  '2': {
    id: '2',
    title: 'Mystic Quest',
    type: 'RPG',
    price: 2999,
    image: new URL('../assets/react.svg', import.meta.url).toString(),
    description:
      'Forge your legend, explore strange lands, and uncover ancient powers.'
  },
  '3': {
    id: '3',
    title: 'Indie Horizons',
    type: 'Simulation',
    price: 1599,
    image: new URL('../assets/vite.svg', import.meta.url).toString(),
    description:
      'Build, manage, and thrive—one delightful decision at a time.'
  }
};

const formatNpr = (n) => `${Number(n)} NPR`;

const GameDetails = () => {
  const { id } = useParams();

  const game = DEMO_GAMES[id] ?? {
    id,
    title: 'Unknown Game',
    type: '—',
    price: 0,
    image: new URL('../assets/hero.png', import.meta.url).toString(),
    description: 'No details available for this game.'
  };

  const wishlisted = useMemo(() => isInWishlist(game.id), [game.id]);

  const toggleWishlist = () => {
    const current = getWishlist();
    const exists = current.some((g) => String(g.id) === String(game.id));

    if (exists) removeFromWishlist(game.id);
    else addToWishlist(game);

    // Force re-render for button label
    // eslint-disable-next-line no-alert
    window.location.reload();
  };

  return (
    <div className="game-details-container">
      <Navbar />

      <div style={{ marginTop: 18 }}>
        <Link to="/browse" style={{ color: 'var(--text-muted)', fontWeight: 800 }}>
          ← Back to Browse
        </Link>
      </div>

      <div className="game-details-layout" style={{ marginTop: 16 }}>
        <div className="game-hero">
          <img src={game.image} alt={game.title} />
          <div className="game-info">
            <h1>{game.title}</h1>
            <div className="game-badges">
              <span className="badge">{game.type}</span>
              <span className="badge">Mythic Store</span>
            </div>
            <p className="muted" style={{ marginTop: 12 }}>
              {game.description}
            </p>
          </div>
        </div>

        <aside className="side-panel">
          <div className="muted">Price</div>
          <div className="price">{formatNpr(game.price)}</div>

          <div className="details-buttons">
            <button type="button" className="primary-btn" onClick={toggleWishlist}>
              {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>

            <Link to="/wishlist" className="secondary-btn" style={{ textAlign: 'center', textDecoration: 'none' }}>
              View Wishlist
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GameDetails;

