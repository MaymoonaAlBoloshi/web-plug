import { NextResponse } from "next/server";
import { z } from "zod";
import { makeId, updateDb } from "@/lib/store";

const schema = z.object({ slug: z.string().min(1).max(80), email: z.string().email().max(200), query: z.string().min(2).max(1500) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and question" }, { status: 400 });
  const created = await updateDb(db => {
    const tenant = db.tenants.find(item => item.slug === parsed.data.slug && item.enabled);
    if (!tenant) return false;
    db.supportRequests.push({ id: makeId("req"), tenantId: tenant.id, email: parsed.data.email, query: parsed.data.query, status: "open", createdAt: new Date().toISOString() });
    return true;
  });
  return created ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Chatbot unavailable" }, { status: 404 });
}
