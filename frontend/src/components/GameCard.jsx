import React from "react";
import { Link } from "react-router-dom";
import { useGameLibrary } from "../contexts/GameLibraryContext";
import "./GameCard.css";

const GameCard = ({
  id,
  title,
  price,
  image,
  type = "",
  isUpcoming = false,
  releaseLabel = "Coming Soon",
  originalPrice,
  detailPath,
  detailState,
}) => {
  const { toggleWishlist, isInWishlist } = useGameLibrary();

  const gameData = detailState
    ? {
        ...detailState,
        id: detailState.id ?? id,
        title: detailState.title ?? title,
        price: detailState.price ?? price,
        image: detailState.image ?? image,
        type: detailState.type ?? type,
      }
    : {
        id,
        title,
        price,
        image,
        type,
        originalPrice,
      };

  // Get current wishlist state from context (not local state)
  const isWishlisted = isInWishlist(gameData);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(gameData);
  };

  const numericPrice = Number(price);
  const numericOriginalPrice = Number(originalPrice);
  const hasSalePrice =
    Number.isFinite(numericPrice) &&
    Number.isFinite(numericOriginalPrice) &&
    numericOriginalPrice > numericPrice;

  const autoDiscountPercent = hasSalePrice
    ? Math.round(
        ((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100,
      )
    : 0;

  const overlayLabel = isUpcoming
    ? releaseLabel
    : hasSalePrice
      ? `${price} NPR`
      : `${price} NPR`;

  return (
    <div className="game-card">
      {/* ── Image + hover overlay ── */}
      <Link
        to={detailPath || `/game/${encodeURIComponent(title)}`}
        state={detailState || gameData}
        className="game-image-wrapper"
        aria-label={`Open ${title}`}
      >
        <img src={image} alt={title} className="game-image" />
        <div className="game-hover-overlay">
          <p className="game-hover-price">{overlayLabel}</p>
        </div>
        <button
          type="button"
          className={`game-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <i className={`bx ${isWishlisted ? 'bxs-heart' : 'bx-heart'}`} />
        </button>
      </Link>

      {/* ── Info below image ── */}
      <div className="game-info">
        {type && <p className="game-type">{type}</p>}

        <Link
          to={detailPath || `/game/${encodeURIComponent(title)}`}
          state={detailState || gameData}
          className="game-title-link"
          aria-label={`Open ${title}`}
        >
          <h3 className="game-title">{title}</h3>
        </Link>

        {isUpcoming ? (
          <button type="button" className="release-btn">
            {releaseLabel}
          </button>
        ) : hasSalePrice ? (
          <div className="sale-price-wrap">
            <span className="sale-badge">-{autoDiscountPercent}%</span>
            <p className="game-price sale-price">{price} NPR</p>
            <p className="game-original-price">{originalPrice} NPR</p>
          </div>
        ) : (
          <p className="game-price">{price} NPR</p>
        )}
      </div>
    </div>
  );
};

export default GameCard;
