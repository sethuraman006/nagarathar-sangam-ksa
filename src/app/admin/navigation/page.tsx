"use client";

import { useEffect, useState } from "react";

interface NavItem {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
  parentId: string | null;
}

export default function NavigationAdmin() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [form, setForm] = useState({ label: "", url: "", sortOrder: 0 });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const res = await fetch("/api/navigation");
    setItems(await res.json());
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch("/api/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    } else {
      await fetch("/api/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ label: "", url: "", sortOrder: 0 });
    load();
  };

  const handleEdit = (item: NavItem) => {
    setEditing(item);
    setForm({ label: item.label, url: item.url, sortOrder: item.sortOrder });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this navigation item?")) return;
    await fetch(`/api/navigation?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Navigation</h1>
        <button onClick={() => { setEditing(null); setForm({ label: "", url: "", sortOrder: 0 }); setShowForm(true); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700">
          + Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Item" : "Add Item"}</h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Label</label>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">URL</label>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium mb-1">Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-left px-4 py-3">Label</th>
              <th className="text-left px-4 py-3">URL</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.sortOrder}</td>
                <td className="px-4 py-3 font-medium">{item.label}</td>
                <td className="px-4 py-3 text-gray-500">{item.url}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center py-8 text-gray-400">No navigation items yet</p>}
      </div>
    </div>
  );
}
