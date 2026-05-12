import React from 'react';
import './NewsCard.css';

const NewsCard = ({ image, title, description, tag }) => {
  return (
    <div className="news-card">
      <div className="news-card-image">
        <img src={image} alt={title} />
      </div>
      <div className="news-card-content">
        <span className="news-card-tag">{tag}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default NewsCard;
