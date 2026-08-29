import { PageHeader } from "@/components/app-shell";
import { readDb } from "@/lib/store";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const db = await readDb(); const counts: Record<string, number> = {};
  db.sources.forEach(source => { counts[source.tenantId] = (counts[source.tenantId] || 0) + 1; });
  return <><PageHeader title="Customer workspaces" description="Provision access, configure websites, and keep knowledge fresh." /><AdminClient tenants={db.tenants} sourceCounts={counts} /></>;
}
