import React, { useEffect, useState } from 'react';
import './NewsForm.css';

const NewsForm = ({ initialData = null, onCancel, onSubmit }) => {
  const [form, setForm] = useState({
    dateLabel: '',
    title: '',
    excerpt: '',
    image: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        dateLabel: initialData.dateLabel || '',
        title: initialData.title || '',
        excerpt: initialData.excerpt || '',
        image: initialData.image || '',
      });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      dateLabel: form.dateLabel.trim(),
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      image: form.image.trim(),
    });
  };

  return (
    <form className="news-form" onSubmit={submit}>
      <div className="form-row">
        <label>Time Label</label>
        <input name="dateLabel" value={form.dateLabel} onChange={handleChange} placeholder="10H AGO" />
      </div>

      <div className="form-row">
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="News title" />
      </div>

      <div className="form-row">
        <label>Excerpt</label>
        <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows="5" placeholder="Short news summary" />
      </div>

      <div className="form-row">
        <label>Image URL or local path</label>
        <input name="image" value={form.image} onChange={handleChange} placeholder="/src/assets/hero.png or image URL" />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  );
};

export default NewsForm;
