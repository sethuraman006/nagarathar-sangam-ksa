import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sendFormNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuth();
    const submissions = await prisma.formSubmission.findMany({
      include: { form: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(submissions);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.formId || !body.data) {
      return NextResponse.json({ error: "formId and data are required" }, { status: 400 });
    }
    const form = await prisma.form.findUnique({ where: { id: body.formId } });
    if (!form || form.status !== "active") {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 });
    }
    const submission = await prisma.formSubmission.create({
      data: { formId: body.formId, data: body.data },
    });

    // Send email notification (non-blocking)
    try {
      const fields = JSON.parse(form.fields as string);
      sendFormNotification(form.name, form.description, fields, body.data, submission.createdAt).catch(() => {});
    } catch { /* ignore parse errors */ }

    return NextResponse.json(submission, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
