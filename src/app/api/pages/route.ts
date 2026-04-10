import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import slugify from "slugify";

export const dynamic = "force-dynamic";

export async function GET() {
  const pages = await prisma.page.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(pages);
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const slug = slugify(body.title, { lower: true, strict: true });
    const page = await prisma.page.create({
      data: { title: body.title, slug, content: body.content || "", status: body.status || "draft", sortOrder: body.sortOrder || 0 },
    });
    return NextResponse.json(page, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
