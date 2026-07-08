import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import GameSlider from "../components/GameSlider";
import GameForm from "../components/GameForm";
import { getStoredUser } from "../utils/auth";
import { apiFetch } from "../utils/api";
import "./Discover.css";
const API_URL = "http://localhost:5000/api/games";

const Discover = () => {
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [editingGame, setEditingGame] = useState(null);

  useEffect(() => {
    const syncAuth = () => setCurrentUser(getStoredUser());
    window.addEventListener("auth-changed", syncAuth);
    return () => window.removeEventListener("auth-changed", syncAuth);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setAllGames(data);
      } catch (error) {
        console.error("Failed to fetch discover games:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const isAdmin = currentUser?.role === "admin";

  // Derived sections based on database flags
  const sections = {
    upcoming: allGames.filter((g) => g.is_upcoming),
    topNewRelease: allGames.filter((g) => g.is_new_release),
    trending: allGames.filter((g) => g.is_trending),
    freeGames: allGames.filter((g) => g.is_free || g.price === 0),
    salesSpotlight: allGames.filter((g) => g.discount_percent > 0),
  };

  const closeEditor = () => setEditingGame(null);

  const handleDelete = async (game) => {
    if (!window.confirm(`Delete ${game.title}?`)) return;
    try {
      await apiFetch(`${API_URL}/${game.id}`, { method: "DELETE" });
      setAllGames((prev) => prev.filter((g) => g.id !== game.id));
    } catch (err) {
      alert("Delete failed");
      console.error("Delete failed:", err);
    }
  };

  const handleSave = async (data) => {
    try {
      const response = await apiFetch(`${API_URL}/${editingGame.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await response.json();
      setAllGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      closeEditor();
    } catch (err) {
      alert("Save failed");
      console.error("Save failed:", err);
    }
  };

  return (
    <div className="discover-page">
      <Navbar />
      {loading ? (
        <div className="browse-loading" style={{ marginTop: "100px" }}>
          Loading discovery...
        </div>
      ) : (
        <main className="discover-main">
          <GameSlider
            title="Upcoming Games"
            games={sections.upcoming.map((g) => ({
              ...g,
              image: g.image_url,
              type: g.game_type,
            }))}
            sliderId="Upcoming"
            showAdminActions={isAdmin}
            onEdit={setEditingGame}
            onDelete={handleDelete}
          />
          <GameSlider
            title="Top New Release"
            games={sections.topNewRelease.map((g) => ({
              ...g,
              image: g.image_url,
              type: g.game_type,
            }))}
            sliderId="TopNewRelease"
            showAdminActions={isAdmin}
            onEdit={setEditingGame}
            onDelete={handleDelete}
          />
          <GameSlider
            title="Trending Games"
            games={sections.trending.map((g) => ({
              ...g,
              image: g.image_url,
              type: g.game_type,
            }))}
            sliderId="Trending"
            showAdminActions={isAdmin}
            onEdit={setEditingGame}
            onDelete={handleDelete}
          />
          <GameSlider
            title="Free Games"
            games={sections.freeGames.map((g) => ({
              ...g,
              image: g.image_url,
              type: g.game_type,
            }))}
            sliderId="FreeGames"
            showAdminActions={isAdmin}
            onEdit={setEditingGame}
            onDelete={handleDelete}
          />
          <GameSlider
            title="Sales Spotlight"
            games={sections.salesSpotlight.map((g) => ({
              ...g,
              image: g.image_url,
              type: g.game_type,
            }))}
            sliderId="SalesSpotlight"
            showAdminActions={isAdmin}
            onEdit={setEditingGame}
            onDelete={handleDelete}
          />
        </main>
      )}

      {isAdmin && editingGame && (
        <div className="discover-game-modal" role="dialog" aria-modal="true" aria-labelledby="discover-game-modal-title">
          <div className="discover-game-modal-overlay" onClick={closeEditor} />
          <div className="discover-game-modal-panel">
            <div className="discover-game-modal-header">
              <h2 id="discover-game-modal-title">Edit Game</h2>
              <button type="button" className="discover-game-modal-close" onClick={closeEditor} aria-label="Close editor">
                ×
              </button>
            </div>
            <GameForm initialData={editingGame} onCancel={closeEditor} onSubmit={handleSave} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;
