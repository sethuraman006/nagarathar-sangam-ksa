"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/pages", label: "Pages", icon: "📄" },
  { href: "/admin/gallery", label: "Gallery", icon: "🖼️" },
  { href: "/admin/gallery-categories", label: "Categories", icon: "📁" },
  { href: "/admin/forms", label: "Forms", icon: "📝" },
  { href: "/admin/submissions", label: "Submissions", icon: "📬" },
  { href: "/admin/media", label: "Media", icon: "📎" },
  { href: "/admin/navigation", label: "Navigation", icon: "🧭" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold">NS KSA CMS</h1>
        <p className="text-xs text-gray-400">Admin Panel</p>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm mb-1 transition-colors ${
                isActive ? "bg-amber-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Link href="/" className="block text-sm text-gray-400 hover:text-white mb-2">
          ← View Site
        </Link>
        <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">
          Logout
        </button>
      </div>
    </aside>
  );
}
