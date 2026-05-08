import React from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./GameDetails.css";
import redDeadImg from "../assets/RedDead.png";
import { useGameLibrary } from "../contexts/GameLibraryContext.jsx";

const fallbackGames = {
  "Elden Ring": {
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
    description:
      "Explore a vast open world, uncover legendary bosses, and shape your own path through a dark fantasy realm crafted by Hidetaka Miyazaki and George R.R. Martin. Face countless dangers as you traverse the Lands Between, grow stronger, and become the Elden Lord.",
    genres: ["Action RPG", "Adventure", "Open World"],
  },
};

const GameDetails = () => {
  const { gameTitle } = useParams();
  const location = useLocation();
  const { addToCart, addToWishlist } = useGameLibrary();

  const routeTitle = decodeURIComponent(gameTitle || "Game Name");
  const selectedGame = location.state ||
    fallbackGames[routeTitle] || {
      title: routeTitle,
      type: "Base Game",
      price: 0,
      image: redDeadImg,
      description:
        "Game details are being prepared. This page is ready to receive title, artwork, and purchase information from the list view.",
      genres: ["Action", "Adventure"],
    };

  const price = Number(selectedGame.price || 0).toLocaleString();

  return (
    <div className="details-page">
      <Navbar />

      <div className="details-banner">
        <img
          src={selectedGame.image}
          alt={selectedGame.title}
          className="details-banner-img"
        />
        <div className="details-banner-overlay" />
      </div>

      <main className="details-main">
        <div className="details-content">
          <p className="details-kicker">{selectedGame.type || "Base Game"}</p>
          <h1 className="details-title">{selectedGame.title}</h1>

          <div className="details-media">
            <img
              src={selectedGame.image}
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
            <img src={selectedGame.image} alt={selectedGame.title} />
          </div>

          <h2 className="details-panel-title">{selectedGame.title}</h2>

          <div className="details-panel-price-row">
            <span className="details-panel-price-label">Base Game</span>
            <span className="details-panel-price">{price} NPR</span>
          </div>

          <button
            type="button"
            className="details-btn-cart"
            onClick={() => addToCart(selectedGame)}
          >
            Add to Cart
          </button>

          <button
            type="button"
            className="details-btn-wishlist"
            onClick={() => addToWishlist(selectedGame)}
          >
            <i className="bx bx-heart" />
            Add to Wishlist
          </button>
        </aside>
      </main>
    </div>
  );
};

export default GameDetails;
