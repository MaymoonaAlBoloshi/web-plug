import { PageHeader } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/store";
import { SupportClient } from "./support-client";

export default async function SupportPage() {
  const user = await requireUser("customer"); const db = await readDb();
  const requests = db.supportRequests.filter(item => item.tenantId === user.tenantId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  return <><PageHeader title="Support requests" description="Questions visitors chose to send to your team." /><div className="card" style={{ marginBottom: 20 }}><strong>Conversation privacy is on</strong><p className="muted" style={{ margin: "7px 0 0" }}>Only the email and submitted question are stored. Chat transcripts disappear with the visitor session.</p></div><SupportClient requests={requests} /></>;
}
