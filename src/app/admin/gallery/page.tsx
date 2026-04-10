"use client";

import { useEffect, useState } from "react";

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  categoryId: string;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function GalleryAdmin() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [form, setForm] = useState({ title: "", url: "", caption: "", categoryId: "", sortOrder: 0 });
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const [imgRes, catRes] = await Promise.all([fetch("/api/gallery"), fetch("/api/gallery-categories")]);
    setImages(await imgRes.json());
    setCategories(await catRes.json());
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const media = await res.json();
      setForm({ ...form, url: media.url, title: form.title || file.name.split(".")[0] });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/gallery/${editing.id}` : "/api/gallery";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", url: "", caption: "", categoryId: "", sortOrder: 0 });
    load();
  };

  const handleEdit = (img: GalleryImage) => {
    setEditing(img);
    setForm({ title: img.title, url: img.url, caption: img.caption || "", categoryId: img.categoryId, sortOrder: img.sortOrder });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <button onClick={() => { setEditing(null); setForm({ title: "", url: "", caption: "", categoryId: categories[0]?.id || "", sortOrder: 0 }); setShowForm(true); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700">
          + Add Image
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Image" : "Add Image"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload Image</label>
              <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
              {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              {form.url && <img src={form.url} alt="Preview" className="mt-2 h-24 rounded" />}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Caption</label>
              <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required>
                  <option value="">Select...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} className="w-20 border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="bg-white rounded-lg shadow overflow-hidden">
            <img src={img.url} alt={img.title} className="w-full h-40 object-cover" />
            <div className="p-3">
              <p className="font-medium text-sm">{img.title}</p>
              <p className="text-xs text-gray-500">{img.category?.name}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(img)} className="text-blue-600 text-xs hover:underline">Edit</button>
                <button onClick={() => handleDelete(img.id)} className="text-red-600 text-xs hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {images.length === 0 && <p className="text-center py-8 text-gray-400">No gallery images yet</p>}
    </div>
  );
}
