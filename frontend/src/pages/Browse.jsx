import React from 'react';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';

const Browse = () => {
  const games = [
    {
      id: '1',
      title: 'Red Dead Redemption 2',
      price: 3499,
      originalPrice: 3499,
      image: new URL('../assets/RedDead.png', import.meta.url).toString(),
      type: 'Action-Adventure'
    },
    {
      id: '2',
      title: 'Mystic Quest',
      price: 2999,
      originalPrice: 2999,
      image: new URL('../assets/react.svg', import.meta.url).toString(),
      type: 'RPG'
    },
    {
      id: '3',
      title: 'Indie Horizons',
      price: 1599,
      originalPrice: 1599,
      image: new URL('../assets/vite.svg', import.meta.url).toString(),
      type: 'Simulation'
    }
  ];

  return (
    <div className="browse-page">
      <Navbar />
      <div style={{ padding: '40px', color: 'var(--text-primary)' }}>
        <h1>Browse Games</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 18,
            marginTop: 18
          }}
        >
          {games.map((game) => (
            <a
              key={game.id}
              href={`/game/${encodeURIComponent(String(game.id))}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <GameCard
                title={game.title}
                price={game.price}
                originalPrice={game.originalPrice}
                image={game.image}
                type={game.type}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Browse;

