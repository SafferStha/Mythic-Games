import React from 'react';
import "./GameCard.css";

const GameCard = ({
  title,
  price,
  image,
  type = "",
  isUpcoming = false,
  releaseLabel = "Coming Soon",
  originalPrice,
}) => {
  const numericPrice = Number(price);
  const numericOriginalPrice = Number(originalPrice);
  const hasSalePrice =
    Number.isFinite(numericPrice) &&
    Number.isFinite(numericOriginalPrice) &&
    numericOriginalPrice > numericPrice;

  const autoDiscountPercent = hasSalePrice
    ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
    : 0;

  return (
    <div className="game-card">
      
      <div className="game-image-wrapper">
        <img src={image} alt={title} className="game-image" />
      </div>

      <div className="game-info">
        <p className="game-type">{type}</p>
        <h3 className="game-title">{title}</h3>
        {isUpcoming ? (
          <button type="button" className="release-btn">{releaseLabel}</button>
        ) : hasSalePrice ? (
          <div className="sale-price-wrap">
            <span className="sale-badge">{autoDiscountPercent}% OFF</span>
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
export default GameCard
