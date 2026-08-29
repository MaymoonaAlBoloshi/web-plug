import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { crawlWebsite } from "@/lib/ingestion";
import { readDb } from "@/lib/store";

export async function POST(request: Request) {
  const user = await currentUser();
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ tenantId: z.string() }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid customer" }, { status: 400 });
  const db = await readDb(); const tenant = db.tenants.find(t => t.id === parsed.data.tenantId);
  if (!tenant?.websiteUrl) return NextResponse.json({ error: "Configure a website URL first" }, { status: 400 });
  try { const count = await crawlWebsite(tenant.id, tenant.websiteUrl); return NextResponse.json({ ok: true, count }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Scan failed" }, { status: 400 }); }
}
