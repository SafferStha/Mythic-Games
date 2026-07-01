import React, { useEffect, useState } from "react";
import GameCard from "./GameCard";
import GameForm from "./GameForm";
import { API_BASE_URL, resolveAssetUrl, apiFetch } from "../utils/api";
import "./AdminGameList.css";

const API_URL = `${API_BASE_URL}/api/games`;
const PLACEHOLDER_IMAGE = "/assets/placeholder-game.png";

function toFormGame(game) {
  return {
    id: game.id,
    title: game.title || "",
    price: game.price || "",
    originalPrice: game.original_price || "",
    type: game.game_type || "",
    image: resolveAssetUrl(game.image_url),
    description: game.description || "",
    isUpcoming: Boolean(game.is_upcoming),
  };
}

function toCardGame(game) {
  return {
    id: game.id,
    title: game.title,
    price: game.price,
    originalPrice: game.original_price,
    type: game.game_type,
    image: resolveAssetUrl(game.image_url) || PLACEHOLDER_IMAGE,
    isUpcoming: Boolean(game.is_upcoming),
    detailState: {
      ...game,
      image_url: resolveAssetUrl(game.image_url),
    },
  };
}

function buildGameFormData(data, isNewGame = false) {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("game_type", data.type || "Base Game");
  formData.append("price", data.price || 0);
  formData.append("original_price", data.originalPrice || 0);
  formData.append("description", data.description || "");
  formData.append("is_upcoming", data.isUpcoming ? "true" : "false");

  if (isNewGame) {
    formData.append("is_new_release", "true");
  }

  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }

  return formData;
}

const AdminGameList = () => {
  const [games, setGames] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadGames = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load games.");
      }

      const data = await response.json();
      setGames(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load games.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (game) => {
    setEditing(game);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this game?")) return;

    try {
      setError("");
      const response = await apiFetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete game.");
      }

      setGames((current) => current.filter((game) => game.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete game.");
    }
  };

  const saveGame = async (data) => {
    try {
      setSaving(true);
      setError("");

      const response = await apiFetch(
        editing ? `${API_URL}/${editing.id}` : API_URL,
        {
          method: editing ? "PUT" : "POST",
          body: buildGameFormData(data, !editing),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to save game.");
      }

      const savedGame = await response.json();

      setGames((current) =>
        editing
          ? current.map((game) => (game.id === savedGame.id ? savedGame : game))
          : [savedGame, ...current],
      );
      closeForm();
    } catch (err) {
      setError(err.message || "Failed to save game.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-games">
      <div className="admin-header">
        <h2>Manage Games</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Game
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {loading && <p className="admin-status">Loading games...</p>}

      {showForm && (
        <>
          <div className="form-overlay" onClick={closeForm} />
          <div className="form-panel">
            <div className="form-panel-header">
              <h3>{editing ? "Edit Game" : "Add Game"}</h3>
              <button
                className="close-tab"
                onClick={closeForm}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <GameForm
              initialData={editing ? toFormGame(editing) : null}
              onCancel={closeForm}
              onSubmit={saveGame}
            />
            {saving && <p className="admin-status form-status">Saving...</p>}
          </div>
        </>
      )}

      <div className="games-grid">
        {games.map((game) => {
          const cardGame = toCardGame(game);

          return (
            <div className="admin-game-item" key={game.id}>
              <GameCard {...cardGame} />
              <div className="admin-actions">
                <button className="btn btn-edit" onClick={() => handleEdit(game)}>
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(game.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminGameList;
