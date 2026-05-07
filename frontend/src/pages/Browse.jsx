import React from 'react';
import Navbar from '../components/Navbar';

const Browse = () => {
  return (
    <div className="browse-page">
      <Navbar />
      <div style={{ padding: '40px', color: 'var(--text-primary)' }}>
        <h1>Browse Games</h1>
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default Browse;
