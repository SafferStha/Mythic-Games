import React, { useEffect, useState } from 'react';
import NewsItem from './NewsItem';
import NewsForm from './NewsForm';
import { createNewsId, defaultNewsArticles, newsStorageKey } from '../data/news';
import './AdminNewsList.css';

const readStoredNews = () => {
  try {
    const raw = localStorage.getItem(newsStorageKey);
    if (!raw) return defaultNewsArticles;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultNewsArticles;
  } catch (error) {
    return defaultNewsArticles;
  }
};

const AdminNewsList = () => {
  const [news, setNews] = useState(() => readStoredNews());
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(newsStorageKey, JSON.stringify(news));
  }, [news]);

  const openAddForm = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditing(item);
    setShowForm(true);
  };

  const removeNews = (id) => {
    if (!window.confirm('Delete this news item?')) return;
    setNews((current) => current.filter((item) => item.id !== id));
  };

  const saveNews = (data) => {
    if (editing) {
      setNews((current) => current.map((item) => (item.id === editing.id ? { ...item, ...data } : item)));
    } else {
      setNews((current) => [{ id: createNewsId(current), ...data }, ...current]);
    }
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="admin-news">
      <div className="admin-header">
        <h2>Manage News</h2>
        <button className="btn btn-primary" onClick={openAddForm}>Add News</button>
      </div>

      {showForm && (
        <>
          <div className="form-overlay" onClick={() => { setShowForm(false); setEditing(null); }} />
          <div className="form-panel">
            <div className="form-panel-header">
              <h3>{editing ? 'Edit News' : 'Add News'}</h3>
              <button className="close-tab" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close">×</button>
            </div>
            <NewsForm initialData={editing} onCancel={() => { setShowForm(false); setEditing(null); }} onSubmit={saveNews} />
          </div>
        </>
      )}

      <div className="news-admin-list">
        {news.map((item) => (
          <div className="news-admin-card" key={item.id}>
            <NewsItem {...item} />
            <div className="admin-actions">
              <button className="btn btn-edit" onClick={() => openEditForm(item)}>Edit</button>
              <button className="btn btn-danger" onClick={() => removeNews(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNewsList;
