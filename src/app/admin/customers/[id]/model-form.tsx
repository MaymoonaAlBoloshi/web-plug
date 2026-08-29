"use client";

import { useState } from "react";
import { KeyRound, Save, Trash2 } from "lucide-react";
import type { ModelConfig } from "@/lib/types";

export function ModelForm({ tenantId, config }: { tenantId: string; config?: ModelConfig }) {
  const [status, setStatus] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("Saving…");
    const values = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/tenants/${tenantId}/model`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ baseUrl: values.get("baseUrl"), model: values.get("model"), apiKey: values.get("apiKey") || undefined }) });
    const data = await response.json(); setStatus(response.ok ? "Encrypted and saved" : data.error || "Could not save");
  }
  async function remove() { if (!confirm("Remove this customer-specific model connection and use the platform fallback?")) return; await fetch(`/api/admin/tenants/${tenantId}/model`, { method: "DELETE" }); location.reload(); }
  return <form className="card" onSubmit={save}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}><div><span className="eyebrow">Customer-specific connection</span><h2 style={{ marginTop: 10 }}>Model provider</h2></div><span className="icon-box"><KeyRound size={18} /></span></div>
    <p className="muted">Works with OpenAI-compatible cloud or internally hosted chat-completions APIs. The key is encrypted before storage and is never returned to the browser.</p>
    <div className="form-stack">
      <label className="field">Base URL<input className="input" name="baseUrl" type="url" defaultValue={config?.baseUrl || "https://api.openai.com/v1"} placeholder="https://api.openai.com/v1" required /></label>
      <label className="field">Model name<input className="input" name="model" defaultValue={config?.model || ""} placeholder="gpt-4.1-mini" required /></label>
      <label className="field">API key<input className="input" name="apiKey" type="password" autoComplete="new-password" placeholder={config?.encryptedApiKey ? "Key saved — leave blank to keep it" : "Optional for keyless internal endpoints"} /><small className="muted">Leave blank to preserve the existing key. Internal endpoints may not require one.</small></label>
      <div className="actions"><button className="button"><Save size={15} />Save connection</button>{config && <button type="button" className="button danger" onClick={remove}><Trash2 size={15} />Use platform fallback</button>}{status && <span className="pill">{status}</span>}</div>
    </div>
  </form>;
}
