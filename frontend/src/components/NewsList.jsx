import React from 'react';
import NewsItem from './NewsItem';
import { defaultNewsArticles, newsStorageKey } from '../data/news';

const getNewsItems = () => {
  try {
    const raw = localStorage.getItem(newsStorageKey);
    if (!raw) return defaultNewsArticles;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultNewsArticles;
  } catch (error) {
    return defaultNewsArticles;
  }
};

const NewsList = () => {
  const articles = getNewsItems();

  return (
    <section className="news-list">
      {articles.map((a) => (
        <React.Fragment key={a.id}>
          <NewsItem {...a} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default NewsList;
