import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/crypto";
import { makeId, updateDb } from "@/lib/store";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]{2,60}$/),
  websiteUrl: z.union([z.string().url(), z.literal("")]),
  ownerName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export async function POST(request: Request) {
  const user = await currentUser();
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check all fields and use a password of at least 8 characters." }, { status: 400 });
  const result = await updateDb(db => {
    if (db.tenants.some(t => t.slug === parsed.data.slug) || db.users.some(u => u.email.toLowerCase() === parsed.data.email.toLowerCase())) return false;
    const tenantId = makeId("tenant");
    db.tenants.push({ id: tenantId, name: parsed.data.name, slug: parsed.data.slug, websiteUrl: parsed.data.websiteUrl, enabled: true, accessibilityEnabled: false, createdAt: new Date().toISOString(), chatbot: { name: `${parsed.data.name} Guide`, nameAr: `دليل ${parsed.data.name}`, welcomeMessage: `Hi! How can I help you with ${parsed.data.name}?`, welcomeMessageAr: `مرحباً! كيف يمكنني مساعدتك بخصوص ${parsed.data.name}؟`, primaryColor: "#17211b", accentColor: "#d5ff63", logoUrl: "", position: "bottom-right" }, accessibility: { title: "Accessibility tools", titleAr: "أدوات تسهيل الوصول", primaryColor: "#17211b", accentColor: "#d5ff63", position: "bottom-left", launcherIcon: "accessibility", tools: { textSize: true, contrast: true, grayscale: true, highlightLinks: true, readableFont: true, reducedMotion: true, lineHeight: true, textSpacing: true, largeCursor: true } } });
    db.users.push({ id: makeId("usr"), tenantId, role: "customer", name: parsed.data.ownerName, email: parsed.data.email, passwordHash: hashPassword(parsed.data.password) });
    return true;
  });
  return result ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "That slug or email is already in use." }, { status: 409 });
}

const patchSchema = z.object({ id: z.string(), enabled: z.boolean().optional(), accessibilityEnabled: z.boolean().optional(), websiteUrl: z.string().url().optional() });
export async function PATCH(request: Request) {
  const user = await currentUser();
  if (user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const changed = await updateDb(db => {
    const tenant = db.tenants.find(t => t.id === parsed.data.id); if (!tenant) return false;
    if (parsed.data.enabled !== undefined) tenant.enabled = parsed.data.enabled;
    if (parsed.data.accessibilityEnabled !== undefined) tenant.accessibilityEnabled = parsed.data.accessibilityEnabled;
    if (parsed.data.websiteUrl !== undefined) tenant.websiteUrl = parsed.data.websiteUrl;
    return true;
  });
  return changed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Customer not found" }, { status: 404 });
}
