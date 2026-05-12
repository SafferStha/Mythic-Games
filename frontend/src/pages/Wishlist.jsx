import React from 'react';
import Navbar from '../components/Navbar';

const Wishlist = () => {
  return (
    <div className="wishlist-page">
      <Navbar />
      <div style={{ padding: '40px', color: 'var(--text-primary)' }}>
        <h1>Wishlist</h1>
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default Wishlist;
