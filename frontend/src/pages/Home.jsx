import React from 'react';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <div className="home-content">
        <h1>Welcome to Mythic Games</h1>
        <p>Your ultimate gaming destination</p>
      </div>
    </div>
  );
};

export default Home;
