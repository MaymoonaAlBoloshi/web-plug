import { NextResponse } from "next/server";
import { readDb } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const db = await readDb();
  const tenant = db.tenants.find(item => item.slug === slug && item.accessibilityEnabled && item.accessibility);
  if (!tenant) return NextResponse.json({ error: "Accessibility tools unavailable" }, { status: 404, headers: { "access-control-allow-origin": "*" } });
  return NextResponse.json({ name: tenant.name, config: tenant.accessibility }, { headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=60" } });
}
