import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./GameDetails.css";
import redDeadImg from "../assets/RedDead.png";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";
import { resolveAssetUrl } from "../utils/api";

const fallbackGames = {
  "Elden Ring": {
    title: "Elden Ring",
    game_type: "Base Game",
    price: 4999,
    image_url: redDeadImg,
    description:
      "Explore a vast open world, uncover legendary bosses, and shape your own path through a dark fantasy realm crafted by Hidetaka Miyazaki and George R.R. Martin. Face countless dangers as you traverse the Lands Between, grow stronger, and become the Elden Lord.",
    genres: ["Action RPG", "Adventure", "Open World"],
  },
};

const GameDetails = () => {
  const { gameTitle } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    isInCart,
    isOwned,
    wishlistItems,
    cartItems,
  } = useGameLibrary();

  const [showUpcomingModal, setShowUpcomingModal] = useState(false);

  const routeTitle = decodeURIComponent(gameTitle || "Game Name");
  const libraryMatch = [...wishlistItems, ...cartItems].find(
    (entry) => String(entry.title).toLowerCase() === routeTitle.toLowerCase(),
  );

  const selectedGame = location.state ||
    libraryMatch ||
    fallbackGames[routeTitle] || {
      title: routeTitle,
      game_type: "Base Game",
      price: 0,
      image_url: redDeadImg,
      description:
        "Game details are being prepared. This page is ready to receive title, artwork, and purchase information from the list view.",
      genres: ["Action", "Adventure"],
    };
  const selectedImageUrl = resolveAssetUrl(
    selectedGame.image_url || selectedGame.image,
  );

  const isUpcoming = Boolean(selectedGame.is_upcoming || selectedGame.isUpcoming);
  const price = Number(selectedGame.price || 0).toLocaleString();
  const detailsGame = {
    id: selectedGame.id,
    title: selectedGame.title,
    game_type: selectedGame.game_type || "Base Game",
    price: selectedGame.price || 0,
    image_url: selectedImageUrl || redDeadImg,
    description: selectedGame.description,
    genres: selectedGame.genres,
    is_upcoming: isUpcoming,
  };

  const savedInCart = isInCart(detailsGame);
  const savedInWishlist = isInWishlist(detailsGame);
  const owned = isOwned(detailsGame);
  const canPurchase = Boolean(detailsGame.id) && !owned && !isUpcoming;

  const handleUpcomingClick = () => {
    setShowUpcomingModal(true);
  };

  return (
    <div className="details-page">
      <Navbar />

      {/* ── Coming Soon popup modal ── */}
      {showUpcomingModal && (
        <div
          className="upcoming-modal-backdrop"
          onClick={() => setShowUpcomingModal(false)}
        >
          <div
            className="upcoming-modal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="upcoming-modal-title"
          >
            <div className="upcoming-modal-icon">
              <i className="bx bx-time-five" />
            </div>
            <h2 id="upcoming-modal-title">Game Not Yet Released</h2>
            <p>
              <strong>{selectedGame.title}</strong> hasn&apos;t been released
              yet. You can&apos;t buy it right now — check back when it
              launches!
            </p>
            <button
              type="button"
              className="upcoming-modal-btn"
              onClick={() => setShowUpcomingModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="details-banner">
        <img
          src={detailsGame.image_url}
          alt={selectedGame.title}
          className="details-banner-img"
        />
        <div className="details-banner-overlay" />
      </div>

      <main className="details-main">
        <div className="details-content">
          <p className="details-kicker">
            {selectedGame.game_type || "Base Game"}
          </p>
          <h1 className="details-title">{selectedGame.title}</h1>

          {isUpcoming && (
            <span className="details-upcoming-badge">
              <i className="bx bx-time-five" /> Coming Soon
            </span>
          )}

          <div className="details-media">
            <img
              src={detailsGame.image_url}
              alt={selectedGame.title}
              className="details-media-img"
            />
          </div>

          <section className="details-about">
            <h2 className="details-section-label">About this game</h2>
            <p className="details-description">{selectedGame.description}</p>
          </section>

          <div className="details-genres">
            {(selectedGame.genres || []).map((genre) => (
              <span key={genre} className="details-genre-tag">
                {genre}
              </span>
            ))}
          </div>
        </div>

        <aside className="details-panel">
          <div className="details-panel-thumb">
            <img src={detailsGame.image_url} alt={selectedGame.title} />
          </div>

          <h2 className="details-panel-title">{selectedGame.title}</h2>

          <div className="details-panel-price-row">
            <span
              className={`details-panel-price-label ${owned ? "owned" : ""}`}
            >
              {owned ? "Status" : "Base Game"}
            </span>
            <span className={`details-panel-price ${owned ? "owned" : ""} ${isUpcoming ? "upcoming" : ""}`}>
              {owned ? "Owned" : isUpcoming ? "Coming Soon" : `${price} NPR`}
            </span>
          </div>

          {isUpcoming ? (
            <>
              <button
                type="button"
                className="details-btn-buy-now details-btn-upcoming"
                onClick={handleUpcomingClick}
              >
                <i className="bx bx-time-five" style={{ marginRight: "6px" }} />
                Not Yet Released
              </button>
              <button
                type="button"
                className="details-btn-cart details-btn-upcoming"
                onClick={handleUpcomingClick}
              >
                <i className="bx bx-time-five" style={{ marginRight: "6px" }} />
                Coming Soon
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`details-btn-buy-now ${owned ? "is-owned" : ""}`}
                onClick={() =>
                  navigate("/checkout", { state: { selectedGame: detailsGame } })
                }
                disabled={!canPurchase}
              >
                {owned ? "Owned" : "Buy Now"}
              </button>

              <button
                type="button"
                className={`details-btn-cart ${savedInCart ? "is-added" : ""} ${owned ? "is-owned" : ""}`}
                onClick={() => addToCart(detailsGame)}
                disabled={savedInCart || !canPurchase}
              >
                {owned ? (
                  <>
                    <i
                      className="bx bxs-check-circle"
                      style={{ marginRight: "6px" }}
                    />
                    Owned
                  </>
                ) : savedInCart ? (
                  <>
                    <i
                      className="bx bxs-check-circle"
                      style={{ marginRight: "6px" }}
                    />
                    Added to Cart
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>
            </>
          )}

          <button
            type="button"
            className={`details-btn-wishlist ${savedInWishlist ? "is-saved" : ""} ${owned ? "is-owned" : ""}`}
            onClick={() => toggleWishlist(detailsGame)}
            aria-pressed={savedInWishlist}
            disabled={!detailsGame.id || owned || isUpcoming}
          >
            <i
              className={`bx ${owned ? "bxs-check-circle" : savedInWishlist ? "bxs-heart" : "bx-heart"}`}
            />
            {owned
              ? "Owned"
              : isUpcoming
                ? "Not Available Yet"
                : savedInWishlist
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
          </button>
        </aside>
      </main>
    </div>
  );
};

export default GameDetails;
