import React from 'react';

const NewsItem = ({ dateLabel, title, excerpt, image }) => {
  const imageSrc = image || '/assets/placeholder-game.png';

  return (
    <article className="news-item">
      <div className="news-thumb">
        <img src={imageSrc} alt={title} />
      </div>

      <div className="news-content">
        <div className="news-meta">{dateLabel}</div>
        <h2 className="news-title">{title}</h2>
        <p className="news-excerpt">{excerpt}</p>
        <a className="read-more" href="#">Read more</a>
      </div>
    </article>
  );
};

export default NewsItem;
