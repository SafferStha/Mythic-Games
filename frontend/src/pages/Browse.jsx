import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import GameForm from '../components/GameForm';
import { getStoredUser } from '../utils/auth';
import { apiFetch } from '../utils/api';
import './Browse.css';
const API_URL = 'http://localhost:5000/api/games';

const Browse = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [editingGame, setEditingGame] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const eventFilters = ['Offers', 'Sales', 'Discounts'];
  const genreFilters = ['Action Games', 'Action-Adventure Games', 'Adventure Games', 'Casual Games'];
  const priceFilters = ['All Prices', 'Free', 'Under 2000 NPR', '2000 - 3999 NPR', '4000+ NPR'];

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [openSections, setOpenSections] = useState({ events: true, genre: true, price: true });
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const syncAuth = () => setCurrentUser(getStoredUser());
    window.addEventListener('auth-changed', syncAuth);
    return () => window.removeEventListener('auth-changed', syncAuth);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const filteredGames = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return games.filter((game) => {
      const matchesSearch =
        !normalizedSearch ||
        [game.title, game.game_type, ...(game.events || []), ...(game.genres || [])]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      const normalizedEvents = (game.events || []).map((event) => String(event).toLowerCase());
      const normalizedGenres = (game.genres || []).map((genre) => String(genre).toLowerCase());

      const matchesEvents =
        selectedEvents.length === 0 ||
        selectedEvents.some((event) => normalizedEvents.includes(String(event).toLowerCase()));

      const matchesGenres =
        selectedGenres.length === 0 ||
        selectedGenres.some((genre) => normalizedGenres.includes(String(genre).toLowerCase()));

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
    setSearchParams({});
    setSelectedEvents([]);
    setSelectedGenres([]);
    setSelectedPrice('All Prices');
  };

  const updateSearchTerm = (value) => {
    setSearchTerm(value);

    const nextParams = new URLSearchParams(searchParams);
    const normalizedValue = value.trim();

    if (normalizedValue) {
      nextParams.set('search', normalizedValue);
    } else {
      nextParams.delete('search');
    }

    setSearchParams(nextParams, { replace: true });
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setShowEditor(true);
  };

  const handleDelete = async (game) => {
    if (!window.confirm(`Delete ${game.title}?`)) {
      return;
    }

    try {
      await apiFetch(`${API_URL}/${game.id}`, { method: 'DELETE' });
      setGames((current) => current.filter((item) => item.id !== game.id));
    } catch (err) {
      alert('Failed to delete game from server');
    }
  };

  const handleSave = async (data) => {
    if (!editingGame) return;

    try {
      const response = await apiFetch(`${API_URL}/${editingGame.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const updated = await response.json();
      setGames((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setEditingGame(null);
      setShowEditor(false);
    } catch (err) {
      alert('Failed to save changes to server');
    }
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

          {loading ? (
            <div className="browse-loading">Loading games...</div>
          ) : (
            <div className="browse-grid">
            {filteredGames.map((game) => (
              <div key={game.id} className="browse-card-wrap">
                <GameCard
                  id={game.id}
                  title={game.title}
                  price={game.price}
                  originalPrice={game.original_price}
                  image={game.image_url}
                  type={game.game_type}
                  detailState={game}
                  showAdminActions={isAdmin}
                  onEdit={isAdmin ? handleEdit : undefined}
                  onDelete={isAdmin ? handleDelete : undefined}
                />
              </div>
            ))}
          </div>
          )}

          {!loading && !filteredGames.length && <p className="browse-empty">No games match the selected filters.</p>}
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
              onChange={(event) => updateSearchTerm(event.target.value)}
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

      {showEditor && editingGame && (
        <div className="browse-game-modal" role="dialog" aria-modal="true" aria-labelledby="browse-game-modal-title">
          <div className="browse-game-modal-overlay" onClick={() => { setShowEditor(false); setEditingGame(null); }} />
          <div className="browse-game-modal-panel">
            <div className="browse-game-modal-header">
              <h2 id="browse-game-modal-title">Edit Game</h2>
              <button
                type="button"
                className="browse-game-modal-close"
                onClick={() => { setShowEditor(false); setEditingGame(null); }}
                aria-label="Close editor"
              >
                ×
              </button>
            </div>
            <GameForm
              initialData={editingGame}
              onCancel={() => { setShowEditor(false); setEditingGame(null); }}
              onSubmit={handleSave}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Browse;
