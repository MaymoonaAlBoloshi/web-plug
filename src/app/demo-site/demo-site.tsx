"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ArrowRight, Check, MoveUpRight, Sparkles } from "lucide-react";

const content = {
  en: {
    nav: ["Services", "Process", "Contact"], start: "Start a project", kicker: "Independent digital studio · Dubai", hero: <>We make digital<br />feel <em>human.</em></>, lead: "Strategy, design, and development for ambitious teams building what comes next.", explore: "Explore our work",
    marquee: ["Websites", "Web applications", "Brand systems", "Digital products"], what: "What we do", servicesTitle: <>From first thought<br />to final pixel.</>, services: [["Digital strategy", "Discovery workshops that turn complex ideas into a focused product direction."], ["Design & identity", "Clear visual systems and interfaces made to feel unmistakably yours."], ["Development", "Fast, accessible websites and applications built for long-term growth."]],
    how: "How it works", processTitle: <>A straightforward path<br />from idea to launch.</>, steps: [["Discover", "We align on users, goals, scope, and what success looks like."], ["Design", "We shape the experience and review it together at every step."], ["Build", "We develop, test, refine, and prepare everything for launch."], ["Grow", "Thirty days of launch support, with ongoing care plans available."]],
    mind: "Have something in mind?", contactTitle: <>Let’s build the<br />next good thing.</>, contactLead: "Tell us what you’re working on. We’ll get back to you within two business days.", booking: "Currently booking new projects", demo: "WebPlug embedded-chat demo"
  },
  ar: {
    nav: ["خدماتنا", "منهجنا", "تواصل معنا"], start: "ابدأ مشروعاً", kicker: "استوديو رقمي مستقل · دبي", hero: <>نصنع تجارب رقمية<br /><em>أكثر إنسانية.</em></>, lead: "استراتيجية وتصميم وتطوير للفرق الطموحة التي تبني المستقبل.", explore: "اكتشف أعمالنا",
    marquee: ["المواقع الإلكترونية", "تطبيقات الويب", "أنظمة الهوية", "المنتجات الرقمية"], what: "ماذا نقدم", servicesTitle: <>من الفكرة الأولى<br />إلى آخر تفصيل.</>, services: [["الاستراتيجية الرقمية", "ورش اكتشاف تحول الأفكار المعقدة إلى اتجاه واضح للمنتج."], ["التصميم والهوية", "أنظمة بصرية وواجهات واضحة تعبر عن هويتك بشكل مميز."], ["التطوير", "مواقع وتطبيقات سريعة وسهلة الوصول ومصممة للنمو طويل الأمد."]],
    how: "كيف نعمل", processTitle: <>مسار واضح<br />من الفكرة إلى الإطلاق.</>, steps: [["الاكتشاف", "نتفق على المستخدمين والأهداف والنطاق ومعايير النجاح."], ["التصميم", "نصمم التجربة ونراجعها معاً في كل مرحلة."], ["التطوير", "نبني ونختبر ونحسن ونجهز كل شيء للإطلاق."], ["النمو", "ثلاثون يوماً من دعم الإطلاق مع خطط رعاية مستمرة."]],
    mind: "لديك فكرة؟", contactTitle: <>لنبنِ معاً<br />الشيء الجميل القادم.</>, contactLead: "أخبرنا عما تعمل عليه وسنرد عليك خلال يومي عمل.", booking: "نستقبل مشاريع جديدة حالياً", demo: "تجربة محادثة WebPlug المدمجة"
  }
} as const;

export function DemoSite() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const t = content[language];
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    const frame = document.getElementById("webplug-widget") as HTMLIFrameElement | null;
    frame?.contentWindow?.postMessage({ type: "webplug:set-language", language }, window.location.origin);
    window.dispatchEvent(new CustomEvent("webplug:language", { detail: { language } }));
    return () => { document.documentElement.lang = "en"; document.documentElement.dir = "ltr"; };
  }, [language]);
  return <main className="demo-site" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
    <nav className="demo-nav"><a className="demo-logo" href="#top">Northstar<span>●</span></a><div>{t.nav.map((label, i) => <a key={label} href={["#services", "#process", "#contact"][i]}>{label}</a>)}</div><div className="demo-nav-actions"><button className="demo-language" onClick={() => setLanguage(language === "en" ? "ar" : "en")}>{language === "en" ? "العربية" : "English"}</button><a className="demo-nav-cta" href="#contact">{t.start} <MoveUpRight size={14} /></a></div></nav>
    <section className="demo-hero" id="top"><div className="demo-kicker"><Sparkles size={14} />{t.kicker}</div><h1>{t.hero}</h1><p>{t.lead}</p><a href="#services" className="demo-cta">{t.explore} <ArrowRight size={17} /></a><div className="demo-orbit"><span>NS</span></div></section>
    <section className="demo-marquee">{t.marquee.map(item => <span key={item}>{item} <i>✦</i></span>)}</section>
    <section className="demo-services" id="services"><div><span className="demo-label">{t.what}</span><h2>{t.servicesTitle}</h2></div><div className="demo-service-list">{t.services.map(([title, description], i) => <article key={title}><b>0{i + 1}</b><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></section>
    <section className="demo-process" id="process"><span className="demo-label">{t.how}</span><h2>{t.processTitle}</h2><div className="demo-steps">{t.steps.map(([title, description], i) => <div key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{description}</p></div>)}</div></section>
    <section className="demo-contact" id="contact"><div><span className="demo-label">{t.mind}</span><h2>{t.contactTitle}</h2></div><div><p>{t.contactLead}</p><a href="mailto:hello@northstar.example">hello@northstar.example <ArrowRight size={18} /></a><small><Check size={13} />{t.booking}</small></div></section>
    <footer className="demo-footer"><a className="demo-logo" href="#top">Northstar<span>●</span></a><span>{t.demo}</span><span>© 2026 Northstar Studio</span></footer>
    <Script src="/widget.js" data-bot="northstar" data-language={language} strategy="afterInteractive" />
    <Script src="/accessibility.js" data-site="northstar" strategy="afterInteractive" />
  </main>;
}
