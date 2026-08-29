import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { updateDb } from "@/lib/store";

const toolSchema = z.object({ textSize: z.boolean(), contrast: z.boolean(), grayscale: z.boolean(), highlightLinks: z.boolean(), readableFont: z.boolean(), reducedMotion: z.boolean(), lineHeight: z.boolean(), textSpacing: z.boolean(), largeCursor: z.boolean() });
const schema = z.object({ title: z.string().min(1).max(60), titleAr: z.string().min(1).max(60), primaryColor: z.string().regex(/^#[0-9a-f]{6}$/i), accentColor: z.string().regex(/^#[0-9a-f]{6}$/i), position: z.enum(["bottom-right", "bottom-left"]), launcherIcon: z.enum(["accessibility", "eye", "settings"]), tools: toolSchema });

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user?.tenantId || user.role !== "customer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid accessibility configuration" }, { status: 400 });
  const changed = await updateDb(db => {
    const tenant = db.tenants.find(item => item.id === user.tenantId && item.accessibilityEnabled);
    if (!tenant) return false; tenant.accessibility = parsed.data; return true;
  });
  return changed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Accessibility product is not enabled" }, { status: 403 });
}
