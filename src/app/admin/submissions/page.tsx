"use client";

import { useEffect, useState } from "react";

interface Submission {
  id: string;
  formId: string;
  data: Record<string, string>;
  status: string;
  createdAt: string;
  form?: { name: string };
}

export default function SubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);

  const load = async () => {
    const res = await fetch("/api/form-submissions");
    setSubmissions(await res.json());
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/form-submissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    await fetch(`/api/form-submissions/${id}`, { method: "DELETE" });
    setSelected(null);
    load();
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    read: "bg-yellow-100 text-yellow-700",
    replied: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Form Submissions</h1>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Form</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className={`border-t cursor-pointer hover:bg-gray-50 ${selected?.id === s.id ? "bg-amber-50" : ""}`} onClick={() => setSelected(s)}>
                    <td className="px-4 py-3 font-medium">{s.form?.name || "Unknown"}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[s.status] || "bg-gray-100"}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="text-red-600 text-xs hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {submissions.length === 0 && <p className="text-center py-8 text-gray-400">No submissions yet</p>}
          </div>
        </div>

        {selected && (
          <div className="w-96 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Submission Details</h2>
            <p className="text-xs text-gray-500 mb-4">{new Date(selected.createdAt).toLocaleString()}</p>
            <div className="space-y-3 mb-4">
              {Object.entries(selected.data as Record<string, string>).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs font-medium text-gray-500 uppercase">{key.replace(/_/g, " ")}</p>
                  <p className="text-sm">{String(value)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {["new", "read", "replied", "archived"].map((status) => (
                <button key={status} onClick={() => updateStatus(selected.id, status)} className={`px-2 py-1 rounded text-xs ${selected.status === status ? "bg-amber-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
