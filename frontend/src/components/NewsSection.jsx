import React from 'react';
import NewsCard from './NewsCard';
import './NewsSection.css';

const NewsSection = ({ title, items }) => {
  return (
    <section className="news-section">
      <div className="news-section-header">
        <h2>{title}</h2>
      </div>
      <div className="news-section-list">
        {items.map((item) => (
          <NewsCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
};

export default NewsSection;
