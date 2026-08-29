import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/store";
import { AccessibilityForm } from "./accessibility-form";

export default async function AccessibilityPage() {
  const user = await requireUser("customer"); const db = await readDb(); const tenant = db.tenants.find(item => item.id === user.tenantId);
  if (!tenant?.accessibilityEnabled || !tenant.accessibility) notFound();
  return <><PageHeader title="Accessibility tools" description="Choose the controls visitors can use on your website." /><AccessibilityForm initial={tenant.accessibility} slug={tenant.slug} appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} /></>;
}
