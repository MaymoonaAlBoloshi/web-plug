import { PageHeader } from "@/components/app-shell";

export default function AdminSettingsPage() {
  const configured = Boolean(process.env.LLM_BASE_URL && process.env.LLM_API_KEY && process.env.LLM_MODEL);
  return <><PageHeader title="Platform settings" description="Provider-independent model and privacy configuration." /><div className="grid two"><div className="card"><span className="eyebrow">Answer engine</span><h2 style={{ marginTop: 10 }}>OpenAI-compatible provider</h2><p className="muted">Configure LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL in the server environment. This supports cloud or internally hosted compatible models.</p><span className={`status ${configured ? "" : "processing"}`}>{configured ? "configured" : "local retrieval mode"}</span></div><div className="card"><span className="eyebrow">Privacy</span><h2 style={{ marginTop: 10 }}>Ephemeral conversations</h2><p className="muted">Messages are processed in memory and are never written to the platform store. Only explicitly submitted support requests persist.</p><span className="status">enforced</span></div></div></>;
}
