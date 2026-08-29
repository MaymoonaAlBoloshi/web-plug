import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Database } from "./types";
import { hashPassword } from "./crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "database.json");

const seed: Database = {
  users: [
    { id: "usr_admin", email: "admin@webplug.local", name: "WebPlug Admin", role: "admin", passwordHash: hashPassword("admin123") },
    { id: "usr_demo", email: "owner@northstar.local", name: "Maya Chen", role: "customer", tenantId: "tenant_demo", passwordHash: hashPassword("demo123") }
  ],
  tenants: [
    {
      id: "tenant_demo",
      name: "Northstar Studio",
      slug: "northstar",
      websiteUrl: "https://example.com",
      enabled: true,
      accessibilityEnabled: true,
      createdAt: new Date().toISOString(),
      chatbot: {
        name: "Northstar Guide",
        nameAr: "دليل نورث ستار",
        welcomeMessage: "Hi! Ask me anything about Northstar Studio.",
        welcomeMessageAr: "مرحباً! اسألني أي شيء عن نورث ستار.",
        primaryColor: "#17211b",
        accentColor: "#d5ff63",
        logoUrl: "",
        position: "bottom-right"
      },
      accessibility: {
        title: "Accessibility tools",
        titleAr: "أدوات تسهيل الوصول",
        primaryColor: "#17211b",
        accentColor: "#d5ff63",
        position: "bottom-left",
        launcherIcon: "accessibility",
        tools: { textSize: true, contrast: true, grayscale: true, highlightLinks: true, readableFont: true, reducedMotion: true, lineHeight: true, textSpacing: true, largeCursor: true }
      }
    }
  ],
  sources: [],
  supportRequests: []
};

let writeQueue = Promise.resolve();

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

export async function readDb(): Promise<Database> {
  await ensureStore();
  const db = JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as Database;
  const demo = db.tenants.find(tenant => tenant.id === "tenant_demo");
  let migrated = false;
  if (demo && !demo.chatbot.nameAr) {
    demo.chatbot.nameAr = "دليل نورث ستار";
    demo.chatbot.welcomeMessageAr = "مرحباً! اسألني أي شيء عن نورث ستار.";
    migrated = true;
  }
  if (demo && !demo.accessibility) {
    demo.accessibilityEnabled = true;
    demo.accessibility = { title: "Accessibility tools", titleAr: "أدوات تسهيل الوصول", primaryColor: "#17211b", accentColor: "#d5ff63", position: "bottom-left", launcherIcon: "accessibility", tools: { textSize: true, contrast: true, grayscale: true, highlightLinks: true, readableFont: true, reducedMotion: true, lineHeight: true, textSpacing: true, largeCursor: true } };
    migrated = true;
  }
  if (demo && !db.sources.some(source => source.tenantId === demo.id)) {
    const now = new Date().toISOString();
    db.sources.push({
      id: "src_demo_site",
      tenantId: demo.id,
      type: "web",
      title: "Northstar Studio Services",
      url: "/demo-site#services",
      status: "ready",
      createdAt: now,
      updatedAt: now,
      text: "Northstar Studio is a digital product agency based in Dubai. We design and build websites, web applications, and brand systems for growing teams. Projects begin with a discovery workshop, followed by design, development, review, and launch. A typical marketing website takes four to six weeks. Web applications are scoped individually. New projects require a 40 percent deposit, with the remaining balance split across agreed milestones. Clients receive thirty days of launch support. Ongoing care plans are available for updates, monitoring, backups, and content changes. To start a project, use the contact form and the team will respond within two business days. نورث ستار استوديو هي وكالة منتجات رقمية مقرها دبي. نصمم ونطور المواقع الإلكترونية وتطبيقات الويب وأنظمة الهوية للفرق الطموحة. يبدأ كل مشروع بورشة اكتشاف، ثم التصميم والتطوير والمراجعة والإطلاق. يستغرق موقع الشركة عادة من أربعة إلى ستة أسابيع. تتطلب المشاريع الجديدة دفعة مقدمة بنسبة أربعين بالمئة، ويوزع المبلغ المتبقي على مراحل المشروع المتفق عليها. يحصل العملاء على ثلاثين يوماً من الدعم بعد الإطلاق. تتوفر خطط رعاية مستمرة للتحديثات والمراقبة والنسخ الاحتياطي وتغييرات المحتوى. لبدء مشروع، استخدم نموذج التواصل وسيرد الفريق خلال يومي عمل."
    });
    migrated = true;
  }
  const demoSource = db.sources.find(source => source.id === "src_demo_site");
  if (demoSource && !demoSource.text.includes("نورث ستار")) {
    demoSource.text += " نورث ستار استوديو هي وكالة منتجات رقمية مقرها دبي. نصمم ونطور المواقع الإلكترونية وتطبيقات الويب وأنظمة الهوية للفرق الطموحة. يبدأ كل مشروع بورشة اكتشاف، ثم التصميم والتطوير والمراجعة والإطلاق. يستغرق موقع الشركة عادة من أربعة إلى ستة أسابيع. تتطلب المشاريع الجديدة دفعة مقدمة بنسبة أربعين بالمئة، ويوزع المبلغ المتبقي على مراحل المشروع المتفق عليها. يحصل العملاء على ثلاثين يوماً من الدعم بعد الإطلاق. تتوفر خطط رعاية مستمرة للتحديثات والمراقبة والنسخ الاحتياطي وتغييرات المحتوى. لبدء مشروع، استخدم نموذج التواصل وسيرد الفريق خلال يومي عمل.";
    demoSource.updatedAt = new Date().toISOString();
    migrated = true;
  }
  if (migrated) await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}

export async function updateDb<T>(mutator: (db: Database) => T | Promise<T>): Promise<T> {
  let result!: T;
  writeQueue = writeQueue.then(async () => {
    const db = await readDb();
    result = await mutator(db);
    const temp = `${DATA_FILE}.${randomUUID()}.tmp`;
    await fs.writeFile(temp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(temp, DATA_FILE);
  });
  await writeQueue;
  return result;
}

export function makeId(prefix: string) {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}
