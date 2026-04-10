import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import slugify from "slugify";

export const dynamic = "force-dynamic";

export async function GET() {
  const forms = await prisma.form.findMany({
    include: { _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(forms);
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const slug = slugify(body.name, { lower: true, strict: true });
    const form = await prisma.form.create({
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        fields: body.fields,
        status: body.status || "active",
      },
    });
    return NextResponse.json(form, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
