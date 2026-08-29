import Link from "next/link";
import { BookOpen, Headphones, MessageCircle, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/store";

export default async function DashboardPage() {
  const user = await requireUser("customer");
  const db = await readDb();
  const tenant = db.tenants.find((item) => item.id === user.tenantId)!;
  const sources = db.sources.filter((item) => item.tenantId === tenant.id);
  const support = db.supportRequests.filter((item) => item.tenantId === tenant.id);
  return <>
    <PageHeader title={`Good morning, ${user.name.split(" ")[0]}`} description={`Here’s how ${tenant.chatbot.name} is doing today.`}>
      <span className="pill"><span className="dot" />{tenant.enabled ? "Chatbot live" : "Chatbot paused"}</span>
    </PageHeader>
    <section className="grid three">
      <div className="card stat"><div><span className="muted">Knowledge sources</span><strong>{sources.length}</strong><small className="muted">{sources.filter(s => s.status === "ready").length} ready</small></div><span className="icon-box"><BookOpen size={19} /></span></div>
      <div className="card stat"><div><span className="muted">Open requests</span><strong>{support.filter(r => r.status === "open").length}</strong><small className="muted">Need your attention</small></div><span className="icon-box"><Headphones size={19} /></span></div>
      <div className="card stat"><div><span className="muted">Website pages</span><strong>{sources.filter(s => s.type === "web").length}</strong><small className="muted">Last indexed content</small></div><span className="icon-box"><MessageCircle size={19} /></span></div>
    </section>
    <div className="section-head"><h2>Get your chatbot ready</h2><Link className="button ghost" href="/dashboard/appearance">Open preview</Link></div>
    <section className="grid two">
      <div className="card"><span className="eyebrow">Knowledge</span><h2 style={{ marginTop: 10 }}>Give it something useful to say</h2><p className="muted">Upload customer-facing documents to improve grounded answers alongside your website content.</p><Link href="/dashboard/knowledge" className="button">Manage knowledge <BookOpen size={15} /></Link></div>
      <div className="card" style={{ background: "var(--lime)" }}><Sparkles size={25} /><h2 style={{ marginTop: 20 }}>Make it feel like your brand</h2><p style={{ opacity: .7 }}>Adjust the name, greeting, colors, logo, and launcher position, then preview it live.</p><Link href="/dashboard/appearance" className="button">Customize chatbot</Link></div>
    </section>
    <div className="section-head"><h2>Installation</h2></div>
    <div className="card"><p className="muted">Your team installs this snippet before the closing body tag on the configured website.</p><pre className="code">{`<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget.js" data-bot="${tenant.slug}" defer></script>`}</pre></div>
    {tenant.accessibilityEnabled && <div className="card" style={{ marginTop: 14 }}><p className="muted">Accessibility toolkit installation</p><pre className="code">{`<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/accessibility.js" data-site="${tenant.slug}" defer></script>`}</pre></div>}
  </>;
}
