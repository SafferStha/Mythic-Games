  import React from 'react';
  import Navbar from '../components/Navbar';
  import NewsList from '../components/NewsList';
  import './News.css';

  const News = () => {
    return (
      <div className="news-page">
        <Navbar />
        <main className="news-container">
          <h1 className="page-title">Mythic Games News</h1>
          <NewsList />
        </main>
      </div>
    );
  };

  export default News;
