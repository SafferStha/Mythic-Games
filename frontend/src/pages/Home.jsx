import React from "react";
import Navbar from "../components/Navbar";
import "./Home.css";
import GameSlider from "../components/GameSlider";
import heroImg from "../assets/hero.png";
import redDeadImg from "../assets/RedDead.png";

/* ── Dummy data ─────────────────────────────────────────── */

const topPicks = [
  {
    id: 1,
    title: "Red Dead Redemption 2",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 2,
    title: "Cyberpunk 2077",
    type: "Base Game",
    price: 3499,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Hades II",
    type: "Early Access",
    price: 2199,
    image:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "FIFA 25",
    type: "Sports",
    price: 2999,
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Assassin's Creed",
    type: "Base Game",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "God of War",
    type: "Base Game",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    title: "Far Cry Primal",
    type: "Base Game",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1551649001-7a2493a40c64?auto=format&fit=crop&w=800&q=80",
  },
];

const newReleases = [
  {
    id: 1,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Night Falls",
    type: "Base Game",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Watch Dogs",
    type: "Base Game",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "GTA V",
    type: "Base Game",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Indie Spotlight",
    type: "DLC",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1528701800489-20be9c2c8d5d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "Cyberpunk 2077",
    type: "Base Game",
    price: 3499,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
];

/* ── Component ──────────────────────────────────────────── */

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />

      {/* ── Hero banner ── */}
      <section className="home-hero">
        <img src={heroImg} alt="Featured Game" className="home-hero-img" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="home-hero-label">Featured Game</p>
          <h1 className="home-hero-title">
            Red Dead
            <br />
            Redemption 2
          </h1>
          <p className="home-hero-sub">Available Now</p>
          <div className="home-hero-actions">
            <button type="button" className="home-btn-primary">
              Get Now
            </button>
            <button type="button" className="home-btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── Game sliders ── */}
      <div className="home-sections">
        <GameSlider title="Top Picks" games={topPicks} sliderId="topPicks" />
        <GameSlider
          title="New Releases"
          games={newReleases}
          sliderId="newReleases"
        />
      </div>
    </div>
  );
};

export default Home;
