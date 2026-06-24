import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./GameDetails.css";
import redDeadImg from "../assets/RedDead.png";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";

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

const reviewSeedByTitle = {
  "Elden Ring": [
    {
      id: 1,
      name: "Aarav",
      rating: 5,
      comment:
        "Massive world, excellent boss design, and a great sense of discovery.",
    },
    {
      id: 2,
      name: "Mina",
      rating: 4,
      comment: "Very rewarding once you learn the pace. Strong atmosphere.",
    },
    {
      id: 3,
      name: "Rohan",
      rating: 5,
      comment: "One of the best action RPGs on the platform.",
    },
  ],
};

const getDefaultReviews = (title) =>
  reviewSeedByTitle[title] || [
    {
      id: 1,
      name: "Player One",
      rating: 5,
      comment: "A solid game with room for backend-linked reviews later.",
    },
    {
      id: 2,
      name: "Game Hunter",
      rating: 4,
      comment: "The details page is ready for live community feedback.",
    },
  ];

const StarRating = ({
  value = 0,
  onChange,
  interactive = false,
  label = "Rating",
}) => {
  const stars = [1, 2, 3, 4, 5];
  const [hoverValue, setHoverValue] = useState(null);
  const [focusValue, setFocusValue] = useState(null);
  const wrapperRef = React.useRef(null);

  const displayed = hoverValue ?? focusValue ?? value ?? 0;

  const handleKeyDown = (e) => {
    if (!interactive) return;

    const key = e.key;
    const base = focusValue ?? value ?? 0;

    if (key === "ArrowRight" || key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(5, base + 1);
      setFocusValue(next);
    } else if (key === "ArrowLeft" || key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(0, base - 1);
      setFocusValue(next);
    } else if (key === "Home") {
      e.preventDefault();
      setFocusValue(1);
    } else if (key === "End") {
      e.preventDefault();
      setFocusValue(5);
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      if (typeof onChange === "function") onChange(focusValue ?? value ?? 0);
    } else if (key === "Escape") {
      setFocusValue(null);
    }
  };

  return (
    <div
      className={`details-stars ${interactive ? "interactive" : ""}`}
      aria-label={label}
      role={interactive ? "radiogroup" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onFocus={() => interactive && setFocusValue(value ?? 0)}
      onBlur={() => setFocusValue(null)}
      ref={wrapperRef}
    >
      {stars.map((star) => {
        const active = star <= displayed;

        const onClick = () => {
          if (!interactive || typeof onChange !== "function") return;
          // single click sets rating
          onChange(star);
        };

        const onDoubleClick = () => {
          if (!interactive || typeof onChange !== "function") return;
          // double-click the current selected star clears the rating
          if ((value ?? 0) === star) onChange(0);
          else onChange(star);
        };

        return (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            role={interactive ? "radio" : undefined}
            aria-checked={
              interactive ? Boolean((value ?? 0) >= star) : undefined
            }
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className={`details-star ${active ? "active" : ""}`}
            onMouseEnter={() => interactive && setHoverValue(star)}
            onMouseLeave={() => interactive && setHoverValue(null)}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onFocus={() => interactive && setFocusValue(star)}
            onBlur={() => interactive && setFocusValue(null)}
          >
            <i
              className={active ? "bx bxs-star" : "bx bx-star"}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
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
    wishlistItems,
    cartItems,
  } = useGameLibrary();

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

  const price = Number(selectedGame.price || 0).toLocaleString();
  const detailsGame = {
    id: selectedGame.id,
    title: selectedGame.title,
    game_type: selectedGame.game_type || "Base Game",
    price: selectedGame.price || 0,
    image_url: selectedGame.image_url,
    description: selectedGame.description,
    genres: selectedGame.genres,
  };

  const savedInCart = isInCart(detailsGame);
  const savedInWishlist = isInWishlist(detailsGame);
  const canPurchase = Boolean(detailsGame.id);

  const [reviews, setReviews] = useState(() => getDefaultReviews(routeTitle));
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  useEffect(() => {
    setReviews(getDefaultReviews(routeTitle));
    setNewReviewName("");
    setNewReviewText("");
    setNewReviewRating(5);
  }, [routeTitle]);

  const ratingSummary = useMemo(() => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = reviews.length ? total / reviews.length : 0;
    return {
      average: average.toFixed(1),
      count: reviews.length,
    };
  }, [reviews]);

  const handleReviewSubmit = (event) => {
    event.preventDefault();

    if (!newReviewName.trim() || !newReviewText.trim()) return;

    setReviews((current) => [
      {
        id: Date.now(),
        name: newReviewName.trim(),
        rating: newReviewRating,
        comment: newReviewText.trim(),
      },
      ...current,
    ]);
    setNewReviewName("");
    setNewReviewText("");
    setNewReviewRating(5);
  };

  return (
    <div className="details-page">
      <Navbar />

      <div className="details-banner">
        <img
          src={selectedGame.image_url}
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

          <div className="details-media">
            <img
              src={selectedGame.image_url}
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

          <section className="details-reviews-section">
            <div className="details-reviews-header">
              <div>
                <p className="details-section-label">Ratings & Reviews</p>
                <h2 className="details-reviews-title">Player feedback</h2>
              </div>

              <div className="details-rating-summary">
                <span className="details-rating-value">
                  {ratingSummary.average}
                </span>
                <StarRating
                  value={Math.round(Number(ratingSummary.average))}
                  label="Average rating"
                />
                <span className="details-rating-count">
                  {ratingSummary.count} reviews
                </span>
              </div>
            </div>

            <form className="details-review-form" onSubmit={handleReviewSubmit}>
              <div className="details-review-grid">
                <label className="details-review-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={newReviewName}
                    onChange={(event) => setNewReviewName(event.target.value)}
                    placeholder="Your name"
                  />
                </label>

                <div className="details-review-field">
                  <span>Rating</span>
                  <StarRating
                    value={newReviewRating}
                    onChange={setNewReviewRating}
                    interactive
                    label="Select rating"
                  />
                </div>
              </div>

              <label className="details-review-field">
                <span>Review</span>
                <textarea
                  value={newReviewText}
                  onChange={(event) => setNewReviewText(event.target.value)}
                  placeholder="Share what you liked or disliked about the game"
                  rows={4}
                />
              </label>

              <button type="submit" className="details-review-submit">
                Post review
              </button>
            </form>

            <div className="details-review-list">
              {reviews.map((review) => (
                <article key={review.id} className="details-review-item">
                  <div className="details-review-top">
                    <div>
                      <h3>{review.name}</h3>
                      <StarRating
                        value={review.rating}
                        label={`${review.rating} star rating`}
                      />
                    </div>
                    <span className="details-review-badge">
                      Verified player
                    </span>
                  </div>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="details-panel">
          <div className="details-panel-thumb">
            <img src={selectedGame.image_url} alt={selectedGame.title} />
          </div>

          <h2 className="details-panel-title">{selectedGame.title}</h2>

          <div className="details-panel-price-row">
            <span className="details-panel-price-label">Base Game</span>
            <span className="details-panel-price">{price} NPR</span>
          </div>

          <button
            type="button"
            className="details-btn-buy-now"
            onClick={() =>
              navigate("/checkout", { state: { selectedGame: detailsGame } })
            }
            disabled={!canPurchase}
          >
            Buy Now
          </button>

          <button
            type="button"
            className={`details-btn-cart ${savedInCart ? "is-added" : ""}`}
            onClick={() => addToCart(detailsGame)}
            disabled={savedInCart || !canPurchase}
          >
            {savedInCart ? (
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

          <button
            type="button"
            className={`details-btn-wishlist ${savedInWishlist ? "is-saved" : ""}`}
            onClick={() => toggleWishlist(detailsGame)}
            aria-pressed={savedInWishlist}
            disabled={!canPurchase}
          >
            <i className={`bx ${savedInWishlist ? "bxs-heart" : "bx-heart"}`} />
            {savedInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>

          <div className="details-rating-card">
            <p className="details-rating-card-label">Community score</p>
            <div className="details-rating-card-value-row">
              <strong>{ratingSummary.average}</strong>
              <span>/ 5</span>
            </div>
            <StarRating
              value={Math.round(Number(ratingSummary.average))}
              label="Community score"
            />
            <p className="details-rating-card-count">
              Based on {ratingSummary.count} reviews
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default GameDetails;
