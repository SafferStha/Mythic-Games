import React from "react";
import "./GameCard.css";


const GameCard = ({ title, price, image, type = "Base Game" }) => {
  return (
    <div className="game-card">
      
      <div className="game-image-wrapper">
        <img src={image} alt={title} className="game-image" />
      </div>

      <div className="game-info">
        <p className="game-type">{type}</p>
        <h3 className="game-title">{title}</h3>
        <p className="game-price">{price} NPR</p>
      </div>

    </div>
  );
};

export default GameCard;
