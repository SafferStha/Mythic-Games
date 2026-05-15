import React from 'react';
import Navbar from '../components/Navbar';
import AdminGameList from '../components/AdminGameList';
import './ManageGames.css';

const ManageGames = () => {
  return (
    <div className="manage-games-page">
      <Navbar />
      <main className="container">
        <AdminGameList />
      </main>
    </div>
  );
};

export default ManageGames;
