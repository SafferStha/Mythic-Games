import React from "react";
import Navbar from "../components/Navbar";
import GameSlider from "../components/GameSlider";
import "./Discover.css";
import redDeadImg from "../assets/RedDead.png";

const UpcomingGames = [
  {
    id: 1,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 2,
    title: "Cyberpunk 2077",
    type: "Base Game",
    price: 3499,
    isUpcoming: true,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Hades II",
    type: "Early Access",
    price: 2199,
    isUpcoming: true,
    image:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "FIFA 25",
    type: "Sports",
    price: 2999,
    isUpcoming: true,
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Assassins Creed",
    price: 2500,
    image: redDeadImg,
    type: "Base Game",
    isUpcoming: true,
  },
  {
    id: 6,
    title: "God of War",
    price: 3000,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 7,
    title: "Far Cry Primal",
    price: 3000,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 8,
    title: "Night Falls",
    price: 3000,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 9,
    title: "Watch Dogs",
    price: 3000,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 10,
    title: "GTA V",
    price: 3000,
    image: redDeadImg,
    isUpcoming: true,
  },
];

const TopNewRelease = [
  {
    id: 1,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 2,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 3,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 4,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 5,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 6,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 7,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 8,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 9,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 10,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
];

const Trending = [
  {
    id: 1,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 2,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 3,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 4,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 5,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 6,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 7,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 8,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 9,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 10,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
];

const FreeGames = [
  {
    id: 1,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 2,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 3,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 4,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 5,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 6,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 7,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 8,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 9,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
  {
    id: 10,
    title: "Elden Ring",
    type: "Base Game",
    price: 4999,
    image: redDeadImg,
  },
];

const SalesSpotlight = [
  {
    id: 1,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
  {
    id: 2,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
  {
    id: 3,
    title: "Elden Ring",
    type: "Base Game",
    price: 2000,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
  {
    id: 4,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
  {
    id: 5,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
  {
    id: 6,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
  {
    id: 7,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
  {
    id: 8,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
  {
    id: 9,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
  {
    id: 10,
    title: "Elden Ring",
    type: "Base Game",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    image: redDeadImg,
  },
];

const Discover = () => {
  return (
    <div className="discover-page">
      <Navbar />
      <main className="discover-main">
        <GameSlider
          title="Upcoming Games"
          games={UpcomingGames}
          sliderId="Discover"
        />
        <GameSlider
          title="Top New Release"
          games={TopNewRelease}
          sliderId="TopNewRelease"
        />
        <GameSlider
          title="Trending Games"
          games={Trending}
          sliderId="Trending"
        />
        <GameSlider title="Free Games" games={FreeGames} sliderId="FreeGames" />
        <GameSlider
          title="Sales Spotlight"
          games={SalesSpotlight}
          sliderId="SalesSpotlight"
        />
      </main>
    </div>
  );
};

export default Discover;
