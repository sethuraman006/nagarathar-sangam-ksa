"use client";

import { useEffect, useState } from "react";

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: string;
  status: string;
  _count?: { submissions: number };
}

export default function FormsAdmin() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [editing, setEditing] = useState<FormData | null>(null);
  const [form, setForm] = useState({ name: "", description: "", status: "active" });
  const [fields, setFields] = useState<FormField[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const res = await fetch("/api/forms");
    setForms(await res.json());
  };

  useEffect(() => { load(); }, []);

  const addField = () => {
    setFields([...fields, { name: "", label: "", type: "text", required: false }]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    if (updates.label && !updated[index].name) {
      updated[index].name = updates.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    }
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, fields: JSON.stringify(fields) };
    const url = editing ? `/api/forms/${editing.id}` : "/api/forms";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", description: "", status: "active" });
    setFields([]);
    load();
  };

  const handleEdit = (f: FormData) => {
    setEditing(f);
    setForm({ name: f.name, description: f.description || "", status: f.status });
    try { setFields(JSON.parse(f.fields)); } catch { setFields([]); }
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this form and all submissions?")) return;
    await fetch(`/api/forms/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>
        <button onClick={() => { setEditing(null); setForm({ name: "", description: "", status: "active" }); setFields([]); setShowForm(true); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700">
          + New Form
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Form" : "New Form"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Form Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Fields</label>
                <button type="button" onClick={addField} className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">+ Add Field</button>
              </div>
              {fields.map((field, i) => (
                <div key={i} className="flex gap-2 items-start mb-2 p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <input placeholder="Label" value={field.label} onChange={(e) => updateField(i, { label: e.target.value })} className="w-full border rounded px-2 py-1 text-sm mb-1" />
                    <input placeholder="Field name" value={field.name} onChange={(e) => updateField(i, { name: e.target.value })} className="w-full border rounded px-2 py-1 text-xs text-gray-500" />
                  </div>
                  <select value={field.type} onChange={(e) => updateField(i, { type: e.target.value })} className="border rounded px-2 py-1 text-sm">
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="number">Number</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={field.required} onChange={(e) => updateField(i, { required: e.target.checked })} />
                    Req
                  </label>
                  {field.type === "select" && (
                    <input placeholder="Options (comma sep)" value={field.options?.join(", ") || ""} onChange={(e) => updateField(i, { options: e.target.value.split(",").map((s) => s.trim()) })} className="border rounded px-2 py-1 text-xs w-40" />
                  )}
                  <button type="button" onClick={() => removeField(i)} className="text-red-500 text-lg">×</button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="text-left px-4 py-3">Fields</th>
              <th className="text-left px-4 py-3">Submissions</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f) => {
              let fieldCount = 0;
              try { fieldCount = JSON.parse(f.fields).length; } catch { /* empty */ }
              return (
                <tr key={f.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{f.name}</td>
                  <td className="px-4 py-3 text-gray-500">{f.slug}</td>
                  <td className="px-4 py-3">{fieldCount}</td>
                  <td className="px-4 py-3">{f._count?.submissions ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${f.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEdit(f)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {forms.length === 0 && <p className="text-center py-8 text-gray-400">No forms yet</p>}
      </div>
    </div>
  );
}
