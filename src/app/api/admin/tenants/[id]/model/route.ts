import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/secrets";
import { updateDb } from "@/lib/store";

const schema = z.object({
  baseUrl: z.string().url().max(500),
  model: z.string().min(1).max(150),
  apiKey: z.string().max(1000).optional(),
  clearKey: z.boolean().optional()
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid endpoint URL and model name." }, { status: 400 });
  const { id } = await params;
  const changed = await updateDb(db => {
    const tenant = db.tenants.find(item => item.id === id);
    if (!tenant) return false;
    const existingKey = tenant.modelConfig?.encryptedApiKey;
    tenant.modelConfig = {
      baseUrl: parsed.data.baseUrl.replace(/\/$/, ""),
      model: parsed.data.model,
      encryptedApiKey: parsed.data.clearKey ? undefined : parsed.data.apiKey ? encryptSecret(parsed.data.apiKey) : existingKey,
      updatedAt: new Date().toISOString()
    };
    return true;
  });
  return changed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Customer not found" }, { status: 404 });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const changed = await updateDb(db => {
    const tenant = db.tenants.find(item => item.id === id); if (!tenant) return false;
    delete tenant.modelConfig; return true;
  });
  return changed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Customer not found" }, { status: 404 });
}
