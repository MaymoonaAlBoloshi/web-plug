import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/store";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("customer");
  const db = await readDb();
  const tenant = db.tenants.find(item => item.id === user.tenantId);
  return <AppShell user={user} accessibilityEnabled={Boolean(tenant?.accessibilityEnabled)}>{children}</AppShell>;
}
