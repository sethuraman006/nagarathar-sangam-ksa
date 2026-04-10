"use client";

import { useEffect, useState } from "react";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  sortOrder: number;
}

export default function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [editing, setEditing] = useState<Page | null>(null);
  const [form, setForm] = useState({ title: "", content: "", status: "draft", sortOrder: 0 });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const res = await fetch("/api/pages");
    setPages(await res.json());
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/pages/${editing.id}` : "/api/pages";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", content: "", status: "draft", sortOrder: 0 });
    load();
  };

  const handleEdit = (page: Page) => {
    setEditing(page);
    setForm({ title: page.title, content: page.content, status: page.status, sortOrder: page.sortOrder });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <button
          onClick={() => { setEditing(null); setForm({ title: "", content: "", status: "draft", sortOrder: 0 }); setShowForm(true); }}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700"
        >
          + New Page
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Page" : "New Page"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border rounded-lg px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} className="w-20 border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-t">
                <td className="px-4 py-3 font-medium">{page.title}</td>
                <td className="px-4 py-3 text-gray-500">{page.slug}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${page.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {page.status}
                  </span>
                </td>
                <td className="px-4 py-3">{page.sortOrder}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleEdit(page)} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && <p className="text-center py-8 text-gray-400">No pages yet</p>}
      </div>
    </div>
  );
}
