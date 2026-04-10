"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function MediaAdmin() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/media");
    setMedia(await res.json());
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      await fetch("/api/upload", { method: "POST", body: fd });
    }
    setUploading(false);
    load();
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    load();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <label className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 cursor-pointer">
          {uploading ? "Uploading..." : "+ Upload Files"}
          <input type="file" multiple accept="image/*,application/pdf" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden group">
            {item.mimeType.startsWith("image/") ? (
              <img src={item.url} alt={item.filename} className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-3xl">📄</div>
            )}
            <div className="p-2">
              <p className="text-xs font-medium truncate">{item.filename}</p>
              <p className="text-xs text-gray-400">{formatSize(item.size)}</p>
              <div className="flex justify-between items-center mt-1">
                <button onClick={() => navigator.clipboard.writeText(item.url)} className="text-xs text-blue-600 hover:underline">Copy URL</button>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {media.length === 0 && <p className="text-center py-8 text-gray-400">No media files yet</p>}
    </div>
  );
}
