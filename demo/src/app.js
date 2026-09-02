const translations = {
  ar: {
    services: "خدماتنا", process: "منهجنا", contact: "تواصل معنا", start: "ابدأ مشروعاً", kicker: "استوديو رقمي مستقل · دبي", hero: "نصنع تجارب رقمية<br /><em>أكثر إنسانية.</em>", lead: "استراتيجية وتصميم وتطوير للفرق الطموحة التي تبني المستقبل.", explore: "اكتشف أعمالنا", websites: "المواقع الإلكترونية", apps: "تطبيقات الويب", brands: "أنظمة الهوية", products: "المنتجات الرقمية", what: "ماذا نقدم", servicesTitle: "من الفكرة الأولى<br />إلى آخر تفصيل.", strategy: "الاستراتيجية الرقمية", strategyText: "ورش اكتشاف تحول الأفكار المعقدة إلى اتجاه واضح للمنتج.", design: "التصميم والهوية", designText: "أنظمة بصرية وواجهات واضحة تعبر عن هويتك بشكل مميز.", development: "التطوير", developmentText: "مواقع وتطبيقات سريعة وسهلة الوصول ومصممة للنمو طويل الأمد.", how: "كيف نعمل", processTitle: "مسار واضح<br />من الفكرة إلى الإطلاق.", discover: "الاكتشاف", discoverText: "نتفق على المستخدمين والأهداف والنطاق ومعايير النجاح.", designStep: "التصميم", designStepText: "نصمم التجربة ونراجعها معاً في كل مرحلة.", build: "التطوير", buildText: "نبني ونختبر ونحسن ونجهز كل شيء للإطلاق.", grow: "النمو", growText: "ثلاثون يوماً من دعم الإطلاق مع خطط رعاية مستمرة.", mind: "لديك فكرة؟", contactTitle: "لنبنِ معاً<br />الشيء الجميل القادم.", contactLead: "أخبرنا عما تعمل عليه وسنرد عليك خلال يومي عمل.", booking: "نستقبل مشاريع جديدة حالياً", demo: "تجربة منتجات WebPlug المدمجة"
  }
};

const english = {};
document.querySelectorAll("[data-i18n]").forEach(node => { english[node.dataset.i18n] = node.textContent; });
document.querySelectorAll("[data-i18n-html]").forEach(node => { english[node.dataset.i18nHtml] = node.innerHTML; });
translations.en = english;

let language = "en";
function setLanguage(next) {
  language = next;
  document.documentElement.lang = next;
  document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(node => { node.textContent = translations[next][node.dataset.i18n]; });
  document.querySelectorAll("[data-i18n-html]").forEach(node => { node.innerHTML = translations[next][node.dataset.i18nHtml]; });
  document.getElementById("language").textContent = next === "en" ? "العربية" : "English";
  document.getElementById("webplug-widget")?.contentWindow?.postMessage({ type: "webplug:set-language", language: next }, window.WEBPLUG_ORIGIN);
  window.dispatchEvent(new CustomEvent("webplug:language", { detail: { language: next } }));
}
document.getElementById("language").addEventListener("click", () => setLanguage(language === "en" ? "ar" : "en"));

function loadEmbed(path, attribute, value) {
  const script = document.createElement("script");
  script.src = `${window.WEBPLUG_ORIGIN}${path}`;
  script.setAttribute(attribute, value);
  script.defer = true;
  document.body.appendChild(script);
}
loadEmbed("/widget.js", "data-bot", "northstar");
loadEmbed("/accessibility.js", "data-site", "northstar");
