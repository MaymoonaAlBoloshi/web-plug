"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Chatbot } from "@/components/chatbot";
import type { ChatbotConfig } from "@/lib/types";

export function AppearanceForm({ initial, slug }: { initial: ChatbotConfig; slug: string }) {
  const [config, setConfig] = useState(initial);
  const [previewLanguage, setPreviewLanguage] = useState<"en" | "ar">("en");
  const [status, setStatus] = useState("");
  function field<K extends keyof ChatbotConfig>(key: K, value: ChatbotConfig[K]) { setConfig(current => ({ ...current, [key]: value })); }
  async function save() {
    setStatus("Saving…");
    const response = await fetch("/api/dashboard/appearance", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(config) });
    setStatus(response.ok ? "Saved" : "Could not save");
    setTimeout(() => setStatus(""), 1800);
  }
  return <div className="split">
    <section className="card">
      <div className="form-stack">
        <label className="field">Chatbot name<input className="input" value={config.name} maxLength={60} onChange={e => field("name", e.target.value)} /></label>
        <label className="field">Arabic chatbot name<input className="input" dir="rtl" value={config.nameAr || ""} maxLength={60} placeholder="اسم المساعد" onChange={e => field("nameAr", e.target.value)} /></label>
        <label className="field">Welcome message<textarea className="textarea" value={config.welcomeMessage} maxLength={180} onChange={e => field("welcomeMessage", e.target.value)} /></label>
        <label className="field">Arabic welcome message<textarea className="textarea" dir="rtl" value={config.welcomeMessageAr || ""} maxLength={180} placeholder="مرحباً! كيف يمكنني مساعدتك؟" onChange={e => field("welcomeMessageAr", e.target.value)} /></label>
        <label className="field">Logo URL<input className="input" type="url" placeholder="https://…" value={config.logoUrl} onChange={e => field("logoUrl", e.target.value)} /></label>
        <label className="field">Primary color<div className="color-row"><input className="color-input" type="color" value={config.primaryColor} onChange={e => field("primaryColor", e.target.value)} /><input className="input" value={config.primaryColor} onChange={e => field("primaryColor", e.target.value)} /></div></label>
        <label className="field">Accent color<div className="color-row"><input className="color-input" type="color" value={config.accentColor} onChange={e => field("accentColor", e.target.value)} /><input className="input" value={config.accentColor} onChange={e => field("accentColor", e.target.value)} /></div></label>
        <label className="field">Launcher position<select className="select" value={config.position} onChange={e => field("position", e.target.value as ChatbotConfig["position"])}><option value="bottom-right">Bottom right</option><option value="bottom-left">Bottom left</option></select></label>
        <div className="actions"><button className="button" onClick={save}><Save size={15} />Save changes</button>{status && <span className="pill">{status}</span>}</div>
      </div>
    </section>
    <aside className="preview-frame"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span className="eyebrow">Live preview</span><div className="actions"><button className={`pill ${previewLanguage === "en" ? "preview-active" : ""}`} onClick={() => setPreviewLanguage("en")}>EN</button><button className={`pill ${previewLanguage === "ar" ? "preview-active" : ""}`} onClick={() => setPreviewLanguage("ar")}>ع</button></div></div><div style={{ marginTop: 18, display: "flex", justifyContent: config.position === "bottom-left" ? "flex-start" : "flex-end" }}><Chatbot key={previewLanguage} slug={slug} config={config} preview initialLanguage={previewLanguage} /></div></aside>
  </div>;
}
