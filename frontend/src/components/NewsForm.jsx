import React, { useEffect, useState } from "react";
import "./NewsForm.css";

const emptyForm = {
  title: "",
  excerpt: "",
  imageFile: null,
};

const NewsForm = ({ initialData = null, onCancel, onSubmit }) => {
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({ ...current, imageFile: file }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      imageFile: form.imageFile,
    });
  };

  return (
    <form className="news-form" onSubmit={submit}>
      <div className="form-row">
        <label>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="News title"
        />
      </div>

      <div className="form-row">
        <label>Excerpt</label>
        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          rows="5"
          placeholder="Short news summary"
        />
      </div>

      <div className="form-row">
        <label>Choose Image</label>
        <input
          name="imageFile"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {previewUrl && (
          <img className="news-image-preview" src={previewUrl} alt="Preview" />
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

export default NewsForm;
