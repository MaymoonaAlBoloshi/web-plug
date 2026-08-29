"use client";

import { useRef, useState } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import type { KnowledgeSource } from "@/lib/types";

export function KnowledgeClient({ sources }: { sources: KnowledgeSource[] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    const form = new FormData(); form.set("file", file);
    const response = await fetch("/api/dashboard/knowledge", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Upload failed"); setBusy(false); return; }
    location.reload();
  }
  async function remove(id: string) {
    if (!confirm("Remove this document from the chatbot knowledge base?")) return;
    await fetch(`/api/dashboard/knowledge?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    location.reload();
  }
  return <>
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files[0]); }}>
      <UploadCloud size={28} style={{ marginBottom: 10 }} /><h3>Drop a PDF here</h3><p className="muted">Up to 10 MB. Text-based PDFs work best.</p>
      <input ref={input} hidden type="file" accept="application/pdf" onChange={e => upload(e.target.files?.[0])} />
      <button className="button ghost" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Processing…" : "Choose PDF"}</button>
      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
    </div>
    <div className="section-head"><h2>Documents</h2><span className="muted" style={{ fontSize: 13 }}>{sources.length} uploaded</span></div>
    <div className="table-wrap">{sources.length ? <table><thead><tr><th>Document</th><th>Status</th><th>Added</th><th /></tr></thead><tbody>{sources.map(source => <tr key={source.id}><td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="icon-box"><FileText size={17} /></span><div><strong>{source.title}</strong>{source.error && <small style={{ display: "block", color: "var(--danger)", marginTop: 4 }}>{source.error}</small>}</div></div></td><td><span className={`status ${source.status}`}>{source.status}</span></td><td className="muted">{new Date(source.createdAt).toLocaleDateString()}</td><td><button className="button danger" onClick={() => remove(source.id)}><Trash2 size={14} />Remove</button></td></tr>)}</tbody></table> : <div className="empty">No PDFs yet. Upload the first document above.</div>}</div>
  </>;
}
