import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, Globe2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { readDb } from "@/lib/store";
import { ModelForm } from "./model-form";

export default async function CustomerConfigurationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const db = await readDb(); const tenant = db.tenants.find(item => item.id === id); if (!tenant) notFound();
  return <><Link href="/admin" className="muted" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 13, marginBottom: 20 }}><ArrowLeft size={14} />All customers</Link><PageHeader title={tenant.name} description="Installation and answer-engine configuration."><span className={`status ${tenant.enabled ? "" : "failed"}`}>{tenant.enabled ? "enabled" : "paused"}</span></PageHeader><div className="grid two" style={{ marginBottom: 20 }}><div className="card"><Globe2 size={20} /><h2 style={{ marginTop: 18 }}>Website</h2><p className="muted">{tenant.websiteUrl || "Not configured"}</p></div><div className="card"><Bot size={20} /><h2 style={{ marginTop: 18 }}>Installation slug</h2><p className="muted">{tenant.slug}</p></div></div><ModelForm tenantId={tenant.id} config={tenant.modelConfig} /></>;
}
