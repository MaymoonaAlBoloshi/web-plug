import { PageHeader } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/store";

export default async function SettingsPage() {
  const user = await requireUser("customer");
  const db = await readDb();
  const tenant = db.tenants.find(t => t.id === user.tenantId)!;
  return <><PageHeader title="Account settings" description="Your workspace and installation details." />
    <div className="card" style={{ maxWidth: 720 }}>
      <div className="form-stack">
        <label className="field">Workspace<input className="input" value={tenant.name} readOnly /></label>
        <label className="field">Configured website<input className="input" value={tenant.websiteUrl || "Not configured"} readOnly /></label>
        <label className="field">Account email<input className="input" value={user.email} readOnly /></label>
        <p className="muted" style={{ fontSize: 13 }}>Website and account access are managed by the WebPlug team.</p>
      </div>
    </div>
  </>;
}
