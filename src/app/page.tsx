import { prisma } from "@/lib/prisma";
import PublicSite from "@/components/PublicSite";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, navigation, galleryCategories, galleryImages, forms] = await Promise.all([
    prisma.setting.findMany(),
    prisma.navigation.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.galleryCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.galleryImage.findMany({ include: { category: true }, orderBy: { sortOrder: "asc" } }),
    prisma.form.findMany({ where: { status: "active" }, orderBy: { createdAt: "asc" } }),
  ]);

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => (settingsMap[s.key] = s.value));

  const serializedForms = forms.map((f) => ({
    ...f,
    fields: typeof f.fields === "string" ? f.fields : JSON.stringify(f.fields),
  }));

  return (
    <PublicSite
      settings={settingsMap}
      navigation={navigation}
      galleryCategories={galleryCategories}
      galleryImages={galleryImages}
      forms={serializedForms}
    />
  );
}
