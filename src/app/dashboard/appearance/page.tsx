import { PageHeader } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/store";
import { AppearanceForm } from "./appearance-form";

export default async function AppearancePage() {
  const user = await requireUser("customer");
  const db = await readDb();
  const tenant = db.tenants.find(t => t.id === user.tenantId)!;
  return <><PageHeader title="Chatbot appearance" description="Make the experience feel at home on your website." /><AppearanceForm initial={tenant.chatbot} slug={tenant.slug} /></>;
}
