import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import slugify from "slugify";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.galleryCategory.findMany({
    include: { _count: { select: { images: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const slug = slugify(body.name, { lower: true, strict: true });
    const category = await prisma.galleryCategory.create({
      data: { name: body.name, slug, sortOrder: body.sortOrder || 0 },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
