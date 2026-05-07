import React from 'react';
import Navbar from '../components/Navbar';

const News = () => {
  return (
    <div className="news-page">
      <Navbar />
      <div style={{ padding: '40px', color: 'var(--text-primary)' }}>
        <h1>News</h1>
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default News;
