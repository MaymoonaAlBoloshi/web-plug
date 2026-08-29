"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, ExternalLink, Headphones, MessageCircle, X } from "lucide-react";
import type { ChatbotConfig, Citation } from "@/lib/types";

type Message = { role: "user" | "assistant"; content: string; citations?: Citation[]; unsupported?: boolean };
type Language = "en" | "ar";

const copy = {
  en: { online: "Online", intro: "Ask a question and I’ll use this website’s verified information to help.", ask: "Ask a question…", private: "Private session · Powered by WebPlug", askTeam: "Ask the team", needHuman: "Need a human?", sendQuestion: "Send your question", email: "Email", emailPlaceholder: "you@example.com", question: "Question", send: "Send request", sent: "Request sent", followup: "The team can now follow up with you.", back: "Back to chat", error: "Something went wrong. Please try again." },
  ar: { online: "متصل", intro: "اطرح سؤالك وسأساعدك باستخدام المعلومات الموثوقة في هذا الموقع.", ask: "اكتب سؤالك…", private: "جلسة خاصة · بدعم WebPlug", askTeam: "اسأل الفريق", needHuman: "تحتاج إلى مساعدة؟", sendQuestion: "أرسل سؤالك", email: "البريد الإلكتروني", emailPlaceholder: "you@example.com", question: "السؤال", send: "إرسال الطلب", sent: "تم إرسال الطلب", followup: "يمكن للفريق الآن التواصل معك.", back: "العودة للمحادثة", error: "حدث خطأ. يرجى المحاولة مرة أخرى." }
} as const;

export function Chatbot({ slug, config, preview = false, initialLanguage = "en" }: { slug: string; config: ChatbotConfig; preview?: boolean; initialLanguage?: Language }) {
  const [open, setOpen] = useState(preview);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  useEffect(() => {
    if (!preview && window.parent !== window) window.parent.postMessage({ type: "webplug:state", open, position: config.position }, "*");
  }, [open, config.position, preview]);
  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.data?.type === "webplug:set-language" && ["en", "ar"].includes(event.data.language)) setLanguage(event.data.language);
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  const lastQuery = [...messages].reverse().find(m => m.role === "user")?.content || "";
  async function send(event: FormEvent) {
    event.preventDefault();
    const query = input.trim();
    if (!query || loading) return;
    if (/[\u0600-\u06ff]/.test(query)) setLanguage("ar");
    setMessages(current => [...current, { role: "user", content: query }]);
    setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/public/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, query, history: messages.slice(-6) }) });
      const data = await response.json();
      setMessages(current => [...current, { role: "assistant", content: data.answer || "I couldn't find an answer to that.", citations: data.citations, unsupported: data.unsupported }]);
    } catch {
      setMessages(current => [...current, { role: "assistant", content: copy[language].error, unsupported: true }]);
    } finally { setLoading(false); }
  }

  async function sendSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const response = await fetch("/api/public/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, email: values.get("email"), query: values.get("query") }) });
    if (response.ok) setSupportSent(true);
  }

  const style = { "--bot-primary": config.primaryColor, "--bot-accent": config.accentColor } as React.CSSProperties;
  const t = copy[language];
  return <div className={`bot-root ${config.position} ${preview ? "preview" : ""}`} style={style} dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
    {open && <section className="bot-window">
      <header className="bot-head">
        <div className="bot-logo">{config.logoUrl ? <img src={config.logoUrl} alt="" /> : <MessageCircle size={20} />}</div>
        <div><strong>{language === "ar" ? config.nameAr || config.name : config.name}</strong><small><span /> {t.online}</small></div>
        {!preview && <button onClick={() => setOpen(false)} aria-label="Close chatbot"><X size={19} /></button>}
      </header>
      <div className="bot-messages">
        {messages.length === 0 && <div className="bot-welcome"><div className="bot-logo large"><MessageCircle size={23} /></div><h3>{language === "ar" ? config.welcomeMessageAr || config.welcomeMessage : config.welcomeMessage}</h3><p>{t.intro}</p></div>}
        {messages.map((message, index) => <div key={index} className={`bot-message ${message.role}`}>
          <div>{message.content}</div>
          {!!message.citations?.length && <div className="bot-sources">{message.citations.map((source, i) => <a key={`${source.url}-${i}`} href={source.url} target="_blank" rel="noreferrer"><ExternalLink size={12} />{source.title}</a>)}</div>}
          {message.unsupported && <button className="bot-help" onClick={() => setSupportOpen(true)}><Headphones size={14} /> {t.askTeam}</button>}
        </div>)}
        {loading && <div className="bot-typing"><i /><i /><i /></div>}
        <div ref={bottom} />
      </div>
      {supportOpen ? <div className="support-sheet">
        {supportSent ? <div className="support-success"><div>✓</div><h3>{t.sent}</h3><p>{t.followup}</p><button onClick={() => setSupportOpen(false)}>{t.back}</button></div> : <form onSubmit={sendSupport}><button type="button" className="sheet-close" onClick={() => setSupportOpen(false)}><X size={16} /></button><span className="eyebrow">{t.needHuman}</span><h3>{t.sendQuestion}</h3><label>{t.email}<input type="email" name="email" required placeholder={t.emailPlaceholder} /></label><label>{t.question}<textarea name="query" required defaultValue={lastQuery} /></label><button className="support-submit">{t.send}</button></form>}
      </div> : <form className="bot-compose" onSubmit={send}><input value={input} onChange={e => setInput(e.target.value)} placeholder={t.ask} aria-label={t.ask} /><button disabled={!input.trim() || loading} aria-label={t.send}><ArrowUp size={17} /></button></form>}
      <footer className="bot-footer">{t.private}</footer>
    </section>}
    {!open && <button className="bot-launcher" onClick={() => setOpen(true)} aria-label="Open chatbot"><MessageCircle size={24} /></button>}
  </div>;
}
