import { PageHeader } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/store";
import { KnowledgeClient } from "./knowledge-client";

export default async function KnowledgePage() {
  const user = await requireUser("customer");
  const db = await readDb();
  const sources = db.sources.filter(source => source.tenantId === user.tenantId && source.type === "pdf").sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const webCount = db.sources.filter(source => source.tenantId === user.tenantId && source.type === "web").length;
  return <><PageHeader title="Knowledge base" description="Add the verified information your chatbot can use." /><div className="card" style={{ marginBottom: 20 }}><strong>Website knowledge</strong><p className="muted" style={{ margin: "7px 0 0" }}>{webCount} pages are managed and scanned by the WebPlug team.</p></div><KnowledgeClient sources={sources} /></>;
}
