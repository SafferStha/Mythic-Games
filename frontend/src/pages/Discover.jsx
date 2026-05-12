import React from "react";
import Navbar from "../components/Navbar";
import GameSlider from "../components/GameSlider";
import "./Discover.css";
import redDeadImg from "../assets/RedDead.png";

const UpcomingGames = [
  {
    id: 1,
    title: "Stellar Voyager",
    type: "Base Game",
    price: 4299,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 2,
    title: "Neon Pulse Racing",
    type: "Base Game",
    price: 3199,
    isUpcoming: true,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Echoes of Tomorrow",
    type: "Early Access",
    price: 2499,
    isUpcoming: true,
    image:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Apex Champions Pro",
    type: "Sports",
    price: 2699,
    isUpcoming: true,
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Shadow Legends: Origins",
    price: 3899,
    image: redDeadImg,
    type: "Base Game",
    isUpcoming: true,
  },
  {
    id: 6,
    title: "Twilight Chronicles",
    price: 2799,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 7,
    title: "Primal Fury: Expedition",
    price: 3599,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 8,
    title: "Digital Dreams",
    price: 2399,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 9,
    title: "Midnight Vigilante",
    price: 3399,
    image: redDeadImg,
    isUpcoming: true,
  },
  {
    id: 10,
    title: "Metropolis Empire",
    price: 3799,
    image: redDeadImg,
    isUpcoming: true,
  },
];

const TopNewRelease = [
  {
    id: 1,
    title: "Quantum Nexus",
    type: "Base Game",
    price: 3899,
    image: redDeadImg,
  },
  {
    id: 2,
    title: "Frost and Flame",
    type: "Base Game",
    price: 3199,
    image: redDeadImg,
  },
  {
    id: 3,
    title: "Crimson Skies: Legacy",
    type: "Base Game",
    price: 4299,
    image: redDeadImg,
  },
  {
    id: 4,
    title: "Digital Dreams",
    type: "Base Game",
    price: 2599,
    image: redDeadImg,
  },
  {
    id: 5,
    title: "Stellar Voyager",
    type: "Base Game",
    price: 4199,
    image: redDeadImg,
  },
  {
    id: 6,
    title: "Midnight Vigilante",
    type: "Base Game",
    price: 3399,
    image: redDeadImg,
  },
  {
    id: 7,
    title: "Neon Pulse Racing",
    type: "Base Game",
    price: 2999,
    image: redDeadImg,
  },
  {
    id: 8,
    title: "Primal Fury: Expedition",
    type: "Base Game",
    price: 3599,
    image: redDeadImg,
  },
  {
    id: 9,
    title: "Shadow Legends: Origins",
    type: "Base Game",
    price: 3899,
    image: redDeadImg,
  },
  {
    id: 10,
    title: "Echoes of Tomorrow",
    type: "Base Game",
    price: 2799,
    image: redDeadImg,
  },
];

const Trending = [
  {
    id: 1,
    title: "Metropolis Empire",
    type: "Base Game",
    price: 3799,
    image: redDeadImg,
  },
  {
    id: 2,
    title: "Twilight Chronicles",
    type: "Base Game",
    price: 2799,
    image: redDeadImg,
  },
  {
    id: 3,
    title: "Apex Champions Pro",
    type: "Base Game",
    price: 2699,
    image: redDeadImg,
  },
  {
    id: 4,
    title: "Shadow Legends: Origins",
    type: "Base Game",
    price: 3899,
    image: redDeadImg,
  },
  {
    id: 5,
    title: "Quantum Nexus",
    type: "Base Game",
    price: 1899,
    image: redDeadImg,
  },
  {
    id: 6,
    title: "Frost and Flame",
    type: "Base Game",
    price: 3199,
    image: redDeadImg,
  },
  {
    id: 7,
    title: "Digital Dreams",
    type: "Base Game",
    price: 2599,
    image: redDeadImg,
  },
  {
    id: 8,
    title: "Midnight Vigilante",
    type: "Base Game",
    price: 3399,
    image: redDeadImg,
  },
  {
    id: 9,
    title: "Primal Fury: Expedition",
    type: "Base Game",
    price: 3599,
    image: redDeadImg,
  },
  {
    id: 10,
    title: "Stellar Voyager",
    type: "Base Game",
    price: 4199,
    image: redDeadImg,
  },
];

const FreeGames = [
  {
    id: 1,
    title: "Echoes of Tomorrow",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
  {
    id: 2,
    title: "Crimson Skies: Legacy",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
  {
    id: 3,
    title: "Neon Pulse Racing",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
  {
    id: 4,
    title: "Digital Dreams",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
  {
    id: 5,
    title: "Quantum Nexus",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
  {
    id: 6,
    title: "Frost and Flame",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
  {
    id: 7,
    title: "Twilight Chronicles",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
  {
    id: 8,
    title: "Shadow Legends: Origins",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
  {
    id: 9,
    title: "Midnight Vigilante",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
  {
    id: 10,
    title: "Stellar Voyager",
    type: "Base Game",
    price: 0,
    image: redDeadImg,
  },
];

const SalesSpotlight = [
  {
    id: 1,
    title: "Primal Fury: Expedition",
    type: "Base Game",
    price: 2799,
    originalPrice: 3599,
    discountPercent: 22,
    image: redDeadImg,
  },
  {
    id: 2,
    title: "Shadow Legends: Origins",
    type: "Base Game",
    price: 2799,
    originalPrice: 3899,
    discountPercent: 28,
    image: redDeadImg,
  },
  {
    id: 3,
    title: "Metropolis Empire",
    type: "Base Game",
    price: 1999,
    originalPrice: 3799,
    discountPercent: 47,
    image: redDeadImg,
  },
  {
    id: 4,
    title: "Stellar Voyager",
    type: "Base Game",
    price: 2599,
    originalPrice: 4299,
    discountPercent: 40,
    image: redDeadImg,
  },
  {
    id: 5,
    title: "Quantum Nexus",
    type: "Base Game",
    price: 1299,
    originalPrice: 1899,
    discountPercent: 32,
    image: redDeadImg,
  },
  {
    id: 6,
    title: "Frost and Flame",
    type: "Base Game",
    price: 1999,
    originalPrice: 3199,
    discountPercent: 37,
    image: redDeadImg,
  },
  {
    id: 7,
    title: "Digital Dreams",
    type: "Base Game",
    price: 1599,
    originalPrice: 2599,
    discountPercent: 38,
    image: redDeadImg,
  },
  {
    id: 8,
    title: "Midnight Vigilante",
    type: "Base Game",
    price: 2099,
    originalPrice: 3399,
    discountPercent: 38,
    image: redDeadImg,
  },
  {
    id: 9,
    title: "Twilight Chronicles",
    type: "Base Game",
    price: 1799,
    originalPrice: 2799,
    discountPercent: 36,
    image: redDeadImg,
  },
  {
    id: 10,
    title: "Apex Champions Pro",
    type: "Base Game",
    price: 1699,
    originalPrice: 2699,
    discountPercent: 37,
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
