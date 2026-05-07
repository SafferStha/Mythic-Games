import React from 'react';
import Navbar from '../components/Navbar';

const Gifts = () => {
  return (
    <div className="gifts-page">
      <Navbar />
      <div style={{ padding: '40px', color: 'var(--text-primary)' }}>
        <h1>Gifts</h1>
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default Gifts;
