import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LibraryCard from '../components/LibraryCard';
import coverImage from '../assets/RedDead.png';
import './Library.css';

const initialLibrary = [
  {
    id: 1,
    title: 'Mythic Assault',
    genre: 'Action Adventure',
    installed: false,
    image: coverImage,
  },
  {
    id: 2,
    title: 'Nebula Drift',
    genre: 'Sci-Fi RPG',
    installed: true,
    image: coverImage,
  },
  {
    id: 3,
    title: 'Lunar Outcast',
    genre: 'Strategy',
    installed: false,
    image: coverImage,
  },
  {
    id: 4,
    title: 'Victory Run',
    genre: 'Racing',
    installed: true,
    image: coverImage,
  },
  {
    id: 5,
    title: 'Nightfall Arena',
    genre: 'Shooter',
    installed: false,
    image: coverImage,
  },
  {
    id: 6,
    title: 'Arcane Harvest',
    genre: 'Simulation',
    installed: true,
    image: coverImage,
  },
  {
    id: 7,
    title: 'Skyforge',
    genre: 'MMO',
    installed: false,
    image: coverImage,
  },
  {
    id: 8,
    title: 'Pulse Echo',
    genre: 'Rhythm',
    installed: false,
    image: coverImage,
  },
];

const filters = ['All', 'Installed', 'Ready to install'];

const Library = () => {
  const [games, setGames] = useState(initialLibrary);
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const filteredGames = useMemo(() => {
    if (activeFilter === 'All') return games;
    if (activeFilter === 'Installed') return games.filter((item) => item.installed);
    return games.filter((item) => !item.installed);
  }, [activeFilter, games]);

  const toggleInstall = (id) => {
    setGames((previous) =>
      previous.map((game) =>
        game.id === id ? { ...game, installed: !game.installed } : game
      )
    );
  };

  return (
    <div className="library-page">
      <Navbar />
      <main className="library-shell">
        <aside className="library-sidebar">
          <Link to="/store" className="library-sidebar-link">
            Store
          </Link>
          <span className="library-sidebar-link active">
            Library
          </span>
        </aside>

        <section className="library-panel">
          <div className="library-topbar">
            <div className="library-context">
              <h1>Library</h1>
            </div>

            <div className="library-view-actions">
              <button
                type="button"
                className={`library-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <i className="bx bx-grid-alt"></i>
              </button>
              <button
                type="button"
                className={`library-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <i className="bx bx-list-ul"></i>
              </button>
            </div>
          </div>

        <div className="library-filter-bar">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {filteredGames.length ? (
          <div className={`library-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredGames.map((game) => (
              <LibraryCard
                key={game.id}
                title={game.title}
                subTitle={game.genre}
                image={game.image}
                installed={game.installed}
                statusLabel={game.installed ? 'Installed' : 'Install'}
                actionLabel={game.installed ? 'Uninstall' : 'Install'}
                onAction={() => toggleInstall(game.id)}
              />
            ))}
          </div>
        ) : (
          <p className="library-empty">No games match this filter.</p>
        )}
        </section>
      </main>
    </div>
  );
};

export default Library;
