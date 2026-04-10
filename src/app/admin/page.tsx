import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [pageCount, imageCount, formCount, submissionCount, mediaCount] = await Promise.all([
    prisma.page.count(),
    prisma.galleryImage.count(),
    prisma.form.count(),
    prisma.formSubmission.count(),
    prisma.media.count(),
  ]);

  const stats = [
    { label: "Pages", count: pageCount, icon: "📄", color: "bg-blue-500" },
    { label: "Gallery Images", count: imageCount, icon: "🖼️", color: "bg-green-500" },
    { label: "Forms", count: formCount, icon: "📝", color: "bg-purple-500" },
    { label: "Submissions", count: submissionCount, icon: "📬", color: "bg-orange-500" },
    { label: "Media Files", count: mediaCount, icon: "📎", color: "bg-pink-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className={`${stat.color} text-white rounded-lg p-3 text-xl`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Welcome to Nagarathar Sangam KSA CMS</h2>
        <p className="text-gray-600 text-sm">
          Manage your community website content, gallery images, forms, and more from this admin panel.
        </p>
      </div>
    </div>
  );
}
