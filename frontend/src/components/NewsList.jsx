import React, { useEffect, useState } from "react";
import NewsItem from "./NewsItem";
import { API_BASE_URL, resolveAssetUrl } from "../utils/api";
import { markNewsSeen } from "../utils/newsNotifications";

const API_URL = `${API_BASE_URL}/api/news`;

const NewsList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load news.");
        }

        const loadedArticles = (payload.data || []).map((item) => ({
            ...item,
            image: resolveAssetUrl(item.image),
          }));

        setArticles(loadedArticles);
        markNewsSeen(loadedArticles);
      } catch (loadError) {
        setError(loadError.message || "Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  if (loading) {
    return <p className="news-empty">Loading news...</p>;
  }

  if (error) {
    return <p className="news-empty">{error}</p>;
  }

  if (!articles.length) {
    return <p className="news-empty">No news has been published yet.</p>;
  }

  return (
    <section className="news-list">
      {articles.map((article) => (
        <React.Fragment key={article.id}>
          <NewsItem {...article} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default NewsList;
