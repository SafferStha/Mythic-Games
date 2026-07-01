import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LibraryCard from "../components/LibraryCard";
import { getStoredUser } from "../utils/auth";
import { API_BASE_URL, resolveAssetUrl } from "../utils/api";
import "./Library.css";

const filters = ["All", "Installed", "Ready to install"];

const normalizeLibraryItem = (item) => ({
  id: item.game_id,
  libraryId: item.id,
  title: item.title,
  genre:
    Array.isArray(item.genres) && item.genres.length > 0
      ? item.genres.join(", ")
      : item.game_type || "Game",
  installed: String(item.install_status).toUpperCase() === "INSTALLED",
  image: resolveAssetUrl(item.image_url),
});

const Library = () => {
  const currentUser = getStoredUser();
  const userId = currentUser?.uid ?? currentUser?.user_id;

  const [games, setGames] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLibrary = async () => {
      if (!userId) {
        setGames([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `${API_BASE_URL}/api/users/${userId}/library`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load library.");
        }

        setGames((payload.data || []).map(normalizeLibraryItem));
      } catch (loadError) {
        setError(loadError.message || "Failed to load library.");
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, [userId]);

  const filteredGames = useMemo(() => {
    if (activeFilter === "All") return games;
    if (activeFilter === "Installed")
      return games.filter((item) => item.installed);
    return games.filter((item) => !item.installed);
  }, [activeFilter, games]);

  const toggleInstall = async (game) => {
    if (!userId) return;

    const nextInstalled = !game.installed;
    const nextStatus = nextInstalled ? "INSTALLED" : "NOT_INSTALLED";

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/library/${game.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ installStatus: nextStatus }),
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update install status.");
      }

      setGames((previous) =>
        previous.map((entry) =>
          entry.id === game.id ? { ...entry, installed: nextInstalled } : entry,
        ),
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update install status.");
    }
  };

  return (
    <div className="library-page">
      <Navbar />
      <main className="library-shell">
        <aside className="library-sidebar">
          <Link to="/store" className="library-sidebar-link">
            Store
          </Link>
          <span className="library-sidebar-link active">Library</span>
        </aside>

        <section className="library-panel">
          <div className="library-topbar">
            <div className="library-context">
              <h1>Library</h1>
            </div>

            <div className="library-view-actions">
              <button
                type="button"
                className={`library-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <i className="bx bx-grid-alt"></i>
              </button>
              <button
                type="button"
                className={`library-view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
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
                className={`filter-pill ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="library-empty">Loading your library...</p>
          ) : error ? (
            <p className="library-empty">{error}</p>
          ) : filteredGames.length ? (
            <div
              className={`library-grid ${viewMode === "list" ? "list-view" : ""}`}
            >
              {filteredGames.map((game) => (
                <LibraryCard
                  key={game.libraryId || game.id}
                  title={game.title}
                  subTitle={game.genre}
                  image={game.image}
                  installed={game.installed}
                  statusLabel={
                    game.installed ? "Installed" : "Ready to install"
                  }
                  actionLabel={game.installed ? "Uninstall" : "Install"}
                  onAction={() => toggleInstall(game)}
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
