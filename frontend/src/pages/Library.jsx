import React from 'react';
import Navbar from '../components/Navbar';

const Library = () => {
  return (
    <div className="library-page">
      <Navbar />
      <div style={{ padding: '40px', color: 'var(--text-primary)' }}>
        <h1>My Library</h1>
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default Library;