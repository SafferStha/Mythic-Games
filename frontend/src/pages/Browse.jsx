import React from 'react';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';

const Browse = () => {
  const games = [
    {
      id: '1',
      title: 'Crimson Skies: Legacy',
      price: 3499,
      originalPrice: 3499,
      image: new URL('../assets/RedDead.png', import.meta.url).toString(),
      type: 'Action-Adventure'
    },
    {
      id: '2',
      title: 'Twilight Chronicles',
      price: 2799,
      originalPrice: 2799,
      image: new URL('../assets/react.svg', import.meta.url).toString(),
      type: 'RPG'
    },
    {
      id: '3',
      title: 'Neon Pulse Racing',
      price: 1899,
      originalPrice: 1899,
      image: new URL('../assets/vite.svg', import.meta.url).toString(),
      type: 'Racing'
    }
  ];

  return (
    <div className="browse-page">
      <Navbar />
      <div style={{ paddingLeft: '84px', paddingRight: '40px', paddingTop: '40px', paddingBottom: '40px', color: 'var(--text-primary)' }}>
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
            <div key={game.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <GameCard
                id={game.id}
                title={game.title}
                price={game.price}
                originalPrice={game.originalPrice}
                image={game.image}
                type={game.type}
                detailState={game}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Browse;

