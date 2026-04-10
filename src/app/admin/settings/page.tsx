"use client";

import { useEffect, useState } from "react";

const SETTING_FIELDS = [
  { key: "site_name", label: "Site Name" },
  { key: "site_description", label: "Site Description" },
  { key: "contact_email", label: "Contact Email" },
  { key: "contact_phone", label: "Contact Phone" },
  { key: "hero_title", label: "Hero Title" },
  { key: "hero_subtitle", label: "Hero Subtitle" },
  { key: "about_text", label: "About Text", multiline: true },
  { key: "_divider_email", label: "📧 Email Notification Settings", divider: true },
  { key: "notification_email", label: "Notification Email (receives form submissions)" },
  { key: "smtp_host", label: "SMTP Host (e.g. smtp.gmail.com)" },
  { key: "smtp_port", label: "SMTP Port (587 for TLS, 465 for SSL)" },
  { key: "smtp_user", label: "SMTP Username" },
  { key: "smtp_pass", label: "SMTP Password", secret: true },
  { key: "smtp_from", label: "From Email Address" },
];

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) setMessage("Settings saved!");
    else setMessage("Error saving settings");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button onClick={handleSave} disabled={saving} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${message.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {SETTING_FIELDS.map((field) => {
          if ('divider' in field && field.divider) {
            return (
              <div key={field.key} className="pt-6 pb-2 border-t border-gray-200 mt-4">
                <h3 className="text-lg font-semibold text-gray-800">{field.label}</h3>
              </div>
            );
          }
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.multiline ? (
                <textarea
                  value={settings[field.key] || ""}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              ) : (
                <input
                  type={'secret' in field && field.secret ? "password" : "text"}
                  value={settings[field.key] || ""}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
