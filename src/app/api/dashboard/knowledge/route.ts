import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { addPdfSource } from "@/lib/ingestion";
import { updateDb } from "@/lib/store";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.tenantId || user.role !== "customer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.type !== "application/pdf") return NextResponse.json({ error: "Choose a PDF file" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "PDFs must be 10 MB or smaller" }, { status: 400 });
  const id = await addPdfSource(user.tenantId, file);
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user?.tenantId || user.role !== "customer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing source" }, { status: 400 });
  const removed = await updateDb(db => {
    const index = db.sources.findIndex(source => source.id === id && source.tenantId === user.tenantId && source.type === "pdf");
    if (index < 0) return false;
    db.sources.splice(index, 1); return true;
  });
  if (removed) await fs.rm(path.join(process.cwd(), ".data", "uploads", `${id}.pdf`), { force: true });
  return removed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Source not found" }, { status: 404 });
}
