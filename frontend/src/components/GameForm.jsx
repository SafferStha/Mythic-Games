import React, { useEffect, useState } from "react";
import "./GameForm.css";

const emptyForm = {
  title: "",
  price: "",
  originalPrice: "",
  type: "",
  image: "",
  imageFile: null,
  description: "",
  isUpcoming: false,
};

const GameForm = ({ initialData = null, onCancel, onSubmit }) => {
  const [form, setForm] = useState(emptyForm);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({ ...emptyForm, ...initialData, imageFile: null });
      setPreviewUrl(initialData.image || "");
      return;
    }

    setForm(emptyForm);
    setPreviewUrl("");
  }, [initialData]);

  useEffect(() => {
    if (!form.imageFile) return undefined;

    const nextPreviewUrl = URL.createObjectURL(form.imageFile);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [form.imageFile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((current) => ({ ...current, imageFile: file }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
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
        <input
          name="price"
          value={form.isUpcoming ? "" : form.price}
          onChange={handleChange}
          disabled={form.isUpcoming}
          placeholder={form.isUpcoming ? "N/A — Coming Soon" : "e.g. 2999"}
        />
      </div>

      <div className="form-row">
        <label>Original Price</label>
        <input
          name="originalPrice"
          value={form.isUpcoming ? "" : form.originalPrice}
          onChange={handleChange}
          disabled={form.isUpcoming}
          placeholder={form.isUpcoming ? "N/A — Coming Soon" : "e.g. 3999"}
        />
      </div>

      <div className="form-row">
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <div className="form-row">
        <label>Game Image</label>
        <input
          name="imageFile"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {previewUrl && (
          <img className="image-preview" src={previewUrl} alt="Game preview" />
        )}
      </div>

      <div className="form-row checkbox-row">
        <label>Upcoming game</label>
        <input
          name="isUpcoming"
          type="checkbox"
          checked={form.isUpcoming}
          onChange={handleChange}
        />
        {form.isUpcoming && (
          <span className="upcoming-hint">Price will display as &ldquo;Coming Soon&rdquo;</span>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>
    </form>
  );
};

export default GameForm;
