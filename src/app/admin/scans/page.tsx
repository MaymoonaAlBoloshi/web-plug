import { PageHeader } from "@/components/app-shell";
import { readDb } from "@/lib/store";

export default async function ScansPage() {
  const db = await readDb(); const sources = db.sources.filter(s => s.type === "web").sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  return <><PageHeader title="Scan activity" description="Website pages currently available to customer chatbots." /><div className="table-wrap">{sources.length ? <table><thead><tr><th>Customer</th><th>Page</th><th>Status</th><th>Updated</th></tr></thead><tbody>{sources.map(source => <tr key={source.id}><td>{db.tenants.find(t => t.id === source.tenantId)?.name}</td><td><a href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong><small className="muted" style={{ display: "block", marginTop: 3 }}>{source.url}</small></a></td><td><span className={`status ${source.status}`}>{source.status}</span></td><td className="muted">{new Date(source.updatedAt).toLocaleString()}</td></tr>)}</tbody></table> : <div className="empty">No website scans yet. Start one from a customer workspace.</div>}</div></>;
}
