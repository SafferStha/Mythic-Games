import React, { useEffect, useState } from "react";
import NewsItem from "./NewsItem";
import NewsForm from "./NewsForm";
import { API_BASE_URL, resolveAssetUrl, apiFetch } from "../utils/api";
import { NEWS_UPDATED_EVENT } from "../utils/newsNotifications";
import "./AdminNewsList.css";

const API_URL = `${API_BASE_URL}/api/news`;

function normalizeNewsItem(item) {
  return {
    ...item,
    image: resolveAssetUrl(item.image),
  };
}

function buildNewsFormData(data) {
  const formData = new FormData();

  formData.append("title", data.title || "");
  formData.append("excerpt", data.excerpt || "");

  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }

  return formData;
}

const AdminNewsList = () => {
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadNews = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_URL);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load news.");
      }

      setNews((payload.data || []).map(normalizeNewsItem));
    } catch (loadError) {
      setError(loadError.message || "Failed to load news.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const closeForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditing(item);
    setShowForm(true);
  };

  const removeNews = async (id) => {
    if (!window.confirm("Delete this news item?")) return;

    try {
      setError("");
      const response = await apiFetch(`${API_URL}/${id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete news.");
      }

      setNews((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete news.");
    }
  };

  const saveNews = async (data) => {
    try {
      setSaving(true);
      setError("");

      const response = await apiFetch(editing ? `${API_URL}/${editing.id}` : API_URL, {
        method: editing ? "PUT" : "POST",
        body: buildNewsFormData(data),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save news.");
      }

      const savedNews = normalizeNewsItem(payload.data);

      setNews((current) =>
        editing
          ? current.map((item) => (item.id === savedNews.id ? savedNews : item))
          : [savedNews, ...current],
      );
      if (!editing) {
        window.dispatchEvent(new Event(NEWS_UPDATED_EVENT));
      }
      closeForm();
    } catch (saveError) {
      setError(saveError.message || "Failed to save news.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-news">
      <div className="admin-header">
        <h2>Manage News</h2>
        <button className="btn btn-primary" onClick={openAddForm}>
          Add News
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {loading && <p className="admin-status">Loading news...</p>}

      {showForm && (
        <>
          <div className="form-overlay" onClick={closeForm} />
          <div className="form-panel">
            <div className="form-panel-header">
              <h3>{editing ? "Edit News" : "Add News"}</h3>
              <button
                className="close-tab"
                onClick={closeForm}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <NewsForm
              initialData={editing}
              onCancel={closeForm}
              onSubmit={saveNews}
            />
            {saving && <p className="admin-status form-status">Saving...</p>}
          </div>
        </>
      )}

      <div className="news-admin-list">
        {news.map((item) => (
          <div className="news-admin-card" key={item.id}>
            <NewsItem {...item} />
            <div className="admin-actions">
              <button className="btn btn-edit" onClick={() => openEditForm(item)}>
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => removeNews(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNewsList;
