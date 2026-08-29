import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { updateDb } from "@/lib/store";

const schema = z.object({
  name: z.string().min(1).max(60),
  nameAr: z.string().max(60).optional(),
  welcomeMessage: z.string().min(1).max(180),
  welcomeMessageAr: z.string().max(180).optional(),
  primaryColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  logoUrl: z.union([z.string().url(), z.literal("")]),
  position: z.enum(["bottom-right", "bottom-left"])
});

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user?.tenantId || user.role !== "customer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid configuration" }, { status: 400 });
  const updated = await updateDb(db => {
    const tenant = db.tenants.find(t => t.id === user.tenantId);
    if (!tenant) return false;
    tenant.chatbot = parsed.data;
    return true;
  });
  return updated ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Workspace not found" }, { status: 404 });
}
