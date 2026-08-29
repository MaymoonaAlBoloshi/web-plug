"use client";

import { Check, RotateCcw, Trash2 } from "lucide-react";
import type { SupportRequest } from "@/lib/types";

export function SupportClient({ requests }: { requests: SupportRequest[] }) {
  async function change(id: string, body: object) { await fetch("/api/dashboard/support", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, ...body }) }); location.reload(); }
  return <div className="table-wrap">{requests.length ? <table><thead><tr><th>Visitor</th><th>Unanswered question</th><th>Status</th><th>Received</th><th /></tr></thead><tbody>{requests.map(item => <tr key={item.id}><td><a href={`mailto:${item.email}`} style={{ fontWeight: 700 }}>{item.email}</a></td><td style={{ maxWidth: 420, lineHeight: 1.5 }}>{item.query}</td><td><span className={`status ${item.status === "open" ? "processing" : ""}`}>{item.status}</span></td><td className="muted">{new Date(item.createdAt).toLocaleDateString()}</td><td><div className="actions">{item.status === "open" ? <button className="button ghost" onClick={() => change(item.id, { status: "resolved" })}><Check size={14} />Resolve</button> : <button className="button ghost" onClick={() => change(item.id, { status: "open" })}><RotateCcw size={14} />Reopen</button>}<button className="button danger" onClick={() => confirm("Delete this support request?") && change(item.id, { remove: true })}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table> : <div className="empty">No support requests yet. Unanswered visitors can submit one from the chatbot.</div>}</div>;
}
