import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { readDb } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const source = db.sources.find(item => item.id === id && item.type === "pdf" && item.status === "ready");
  if (!source) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  try {
    const data = await fs.readFile(path.join(process.cwd(), ".data", "uploads", `${id}.pdf`));
    return new NextResponse(data, { headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="${source.title.replace(/["\r\n]/g, "")}"`, "cache-control": "private, max-age=300" } });
  } catch { return NextResponse.json({ error: "Document not found" }, { status: 404 }); }
}
