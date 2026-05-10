import React from 'react';
import './NewsCard.css';

const NewsCard = ({ image, title, description, tag, buttonLabel }) => {
  return (
    <div className="news-card">
      <div className="news-card-image">
        <img src={image} alt={title} />
        <button className="news-card-delete">{buttonLabel || 'Delete'}</button>
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
