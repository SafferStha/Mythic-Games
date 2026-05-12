import React from "react";
import Navbar from "../components/Navbar";
import "./Home.css";
import GameSlider from "../components/GameSlider";

/* ── Dummy data ─────────────────────────────────────────── */

const topPicks = [
  {
    id: 1,
    title: "Cyberpunk 2077",
    type: "Base Game",
    price: 3499,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Hades II",
    type: "Early Access",
    price: 2199,
    image:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "FIFA 25",
    type: "Sports",
    price: 2999,
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Assassin's Creed",
    type: "Base Game",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "God of War",
    type: "Base Game",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
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
