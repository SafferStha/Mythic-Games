import React, { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import './Browse.css';

const Browse = () => {
  const games = [
    {
      id: '1',
      title: 'Crimson Skies: Legacy',
      price: 3499,
      originalPrice: 3499,
      image: new URL('../assets/RedDead.png', import.meta.url).toString(),
      type: 'Action-Adventure',
      events: ['Offers', 'Sales'],
      genres: ['Action Games', 'Action-Adventure Games']
    },
    {
      id: '2',
      title: 'Twilight Chronicles',
      price: 2799,
      originalPrice: 3499,
      image: new URL('../assets/react.svg', import.meta.url).toString(),
      type: 'RPG',
      events: ['Discounts'],
      genres: ['Adventure Games']
    },
    {
      id: '3',
      title: 'Neon Pulse Racing',
      price: 1899,
      originalPrice: 2499,
      image: new URL('../assets/vite.svg', import.meta.url).toString(),
      type: 'Racing',
      events: ['Sales'],
      genres: ['Casual Games']
    },
    {
      id: '4',
      title: 'Shadow Circuit',
      price: 0,
      originalPrice: 0,
      image: new URL('../assets/RedDead.png', import.meta.url).toString(),
      type: 'Action',
      events: ['Offers'],
      genres: ['Action Games']
    },
    {
      id: '5',
      title: 'Aurora Drift',
      price: 4299,
      originalPrice: 5299,
      image: new URL('../assets/react.svg', import.meta.url).toString(),
      type: 'Adventure',
      events: ['Discounts'],
      genres: ['Adventure Games']
    },
    {
      id: '6',
      title: 'Pixel Harbor',
      price: 1599,
      originalPrice: 2199,
      image: new URL('../assets/vite.svg', import.meta.url).toString(),
      type: 'Casual',
      events: ['Sales', 'Discounts'],
      genres: ['Casual Games']
    }
  ];

  const eventFilters = ['Offers', 'Sales', 'Discounts'];
  const genreFilters = ['Action Games', 'Action-Adventure Games', 'Adventure Games', 'Casual Games'];
  const priceFilters = ['All Prices', 'Free', 'Under 2000 NPR', '2000 - 3999 NPR', '4000+ NPR'];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [openSections, setOpenSections] = useState({ events: true, genre: true, price: true });

  const filteredGames = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return games.filter((game) => {
      const matchesSearch =
        !normalizedSearch ||
        [game.title, game.type, ...(game.events || []), ...(game.genres || [])]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesEvents =
        selectedEvents.length === 0 || selectedEvents.some((event) => game.events?.includes(event));

      const matchesGenres =
        selectedGenres.length === 0 || selectedGenres.some((genre) => game.genres?.includes(genre));

      const price = Number(game.price);
      const matchesPrice =
        selectedPrice === 'All Prices' ||
        (selectedPrice === 'Free' && price === 0) ||
        (selectedPrice === 'Under 2000 NPR' && price > 0 && price < 2000) ||
        (selectedPrice === '2000 - 3999 NPR' && price >= 2000 && price <= 3999) ||
        (selectedPrice === '4000+ NPR' && price >= 4000);

      return matchesSearch && matchesEvents && matchesGenres && matchesPrice;
    });
  }, [games, searchTerm, selectedEvents, selectedGenres, selectedPrice]);

  const toggleFilter = (value, setter) => {
    setter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEvents([]);
    setSelectedGenres([]);
    setSelectedPrice('All Prices');
  };

  return (
    <div className="browse-page">
      <Navbar />
      <main className="browse-shell">
        <section className="browse-results">
          <div className="browse-results-header">
            <div>
              <p className="browse-kicker">Browse Games</p>
              <h1>Find your next game</h1>
            </div>
            <p className="browse-count">{filteredGames.length} results</p>
          </div>

          <div className="browse-grid">
            {filteredGames.map((game) => (
              <div key={game.id} className="browse-card-wrap">
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

          {!filteredGames.length && <p className="browse-empty">No games match the selected filters.</p>}
        </section>

        <aside className="browse-filters-card" aria-label="Browse filters">
          <div className="browse-filters-header">
            <h2>Filters</h2>
            <button type="button" className="browse-clear-btn" onClick={clearFilters}>
              Clear all
            </button>
          </div>

          <label className="browse-search">
            <i className="bx bx-search" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Keywords"
              aria-label="Search games"
            />
          </label>

          <div className="browse-filter-group">
            <button
              type="button"
              className="browse-filter-toggle"
              onClick={() => setOpenSections((current) => ({ ...current, events: !current.events }))}
            >
              <span>Events</span>
              <i className={`bx bx-chevron-${openSections.events ? 'down' : 'right'}`} aria-hidden="true" />
            </button>
            {openSections.events && (
              <div className="browse-filter-options">
                {eventFilters.map((filter) => (
                  <label key={filter} className="browse-check-option">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(filter)}
                      onChange={() => toggleFilter(filter, setSelectedEvents)}
                    />
                    <span>{filter}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="browse-filter-group">
            <button
              type="button"
              className="browse-filter-toggle"
              onClick={() => setOpenSections((current) => ({ ...current, genre: !current.genre }))}
            >
              <span>Genre</span>
              <i className={`bx bx-chevron-${openSections.genre ? 'down' : 'right'}`} aria-hidden="true" />
            </button>
            {openSections.genre && (
              <div className="browse-filter-options">
                {genreFilters.map((filter) => (
                  <label key={filter} className="browse-check-option">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(filter)}
                      onChange={() => toggleFilter(filter, setSelectedGenres)}
                    />
                    <span>{filter}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="browse-filter-group">
            <button
              type="button"
              className="browse-filter-toggle"
              onClick={() => setOpenSections((current) => ({ ...current, price: !current.price }))}
            >
              <span>Price</span>
              <i className={`bx bx-chevron-${openSections.price ? 'down' : 'right'}`} aria-hidden="true" />
            </button>
            {openSections.price && (
              <div className="browse-filter-options">
                {priceFilters.map((filter) => (
                  <label key={filter} className="browse-radio-option">
                    <input
                      type="radio"
                      name="price-filter"
                      checked={selectedPrice === filter}
                      onChange={() => setSelectedPrice(filter)}
                    />
                    <span>{filter}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Browse;

