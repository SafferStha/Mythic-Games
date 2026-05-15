import React, { useState, useEffect } from 'react';
import GameCard from './GameCard';
import GameForm from './GameForm';
import './AdminGameList.css';

const sampleGames = [
  {
    id: 1,
    title: 'Legend of the Forge',
    price: '499',
    originalPrice: '599',
    type: 'RPG',
    image: '/assets/placeholder-game.png',
    isUpcoming: false,
  },
  {
    id: 2,
    title: 'Skyward Battles',
    price: '299',
    originalPrice: '0',
    type: 'Strategy',
    image: '/assets/placeholder-game.png',
    isUpcoming: true,
  },
];

const AdminGameList = () => {
  const [games, setGames] = useState(() => {
    try {
      const raw = localStorage.getItem('admin_games');
      return raw ? JSON.parse(raw) : sampleGames;
    } catch (e) {
      return sampleGames;
    }
  });

  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('admin_games', JSON.stringify(games));
  }, [games]);

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (game) => {
    setEditing(game);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this game?')) return;
    setGames((g) => g.filter((x) => x.id !== id));
  };

  const saveGame = (data) => {
    if (editing) {
      setGames((g) => g.map((item) => (item.id === editing.id ? { ...item, ...data } : item)));
    } else {
      const next = Math.max(0, ...games.map((g) => g.id)) + 1;
      setGames((g) => [{ id: next, ...data }, ...g]);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="admin-games">
      <div className="admin-header">
        <h2>Manage Games</h2>
        <div>
          <button className="btn btn-primary" onClick={handleAdd}>Add Game</button>
        </div>
      </div>

      {showForm && (
        <>
          <div className="form-overlay" onClick={() => { setShowForm(false); setEditing(null); }} />
          <div className="form-panel">
            <div className="form-panel-header">
              <h3>{editing ? 'Edit Game' : 'Add Game'}</h3>
              <button className="close-tab" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close">×</button>
            </div>
            <GameForm initialData={editing} onCancel={() => { setShowForm(false); setEditing(null); }} onSubmit={saveGame} />
          </div>
        </>
      )}

      <div className="games-grid">
        {games.map((g) => (
          <div className="admin-game-item" key={g.id}>
            <GameCard {...g} id={g.id} />
            <div className="admin-actions">
              <button className="btn btn-edit" onClick={() => handleEdit(g)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(g.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGameList;
