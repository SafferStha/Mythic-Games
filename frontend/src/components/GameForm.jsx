import React, { useState, useEffect } from 'react';
import './GameForm.css';

const GameForm = ({ initialData = null, onCancel, onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    price: '',
    originalPrice: '',
    type: '',
    image: '',
    isUpcoming: false,
  });

  useEffect(() => {
    if (initialData) setForm({ ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    // basic validation
    if (!form.title) return;
    onSubmit({ ...form });
  };

  return (
    <form className="game-form" onSubmit={submit}>
      <div className="form-row">
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Type</label>
        <input name="type" value={form.type} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Price</label>
        <input name="price" value={form.price} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Original Price</label>
        <input name="originalPrice" value={form.originalPrice} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Image URL</label>
        <input name="image" value={form.image} onChange={handleChange} />
      </div>

      <div className="form-row checkbox-row">
        <label>Upcoming</label>
        <input name="isUpcoming" type="checkbox" checked={form.isUpcoming} onChange={handleChange} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  );
};

export default GameForm;
