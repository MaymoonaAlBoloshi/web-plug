import * as cheerio from "cheerio";
import { promises as fs } from "node:fs";
import path from "node:path";
import { makeId, updateDb } from "./store";
import { assertSafePublicUrl } from "./url-safety";
import type { KnowledgeSource } from "./types";

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 120_000);
}

export async function addPdfSource(tenantId: string, file: File) {
  const id = makeId("src");
  const now = new Date().toISOString();
  const source: KnowledgeSource = { id, tenantId, type: "pdf", title: file.name, url: `/api/public/documents/${id}`, text: "", status: "processing", createdAt: now, updatedAt: now };
  await updateDb(db => { db.sources.push(source); });
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), ".data", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, `${id}.pdf`), bytes);
    const pdf = (await import("pdf-parse")).default;
    const parsed = await pdf(bytes);
    const text = normalizeText(parsed.text);
    if (!text) throw new Error("No readable text was found in this PDF");
    await updateDb(db => {
      const item = db.sources.find(s => s.id === id && s.tenantId === tenantId);
      if (item) Object.assign(item, { text, status: "ready", updatedAt: new Date().toISOString() });
    });
  } catch (error) {
    await updateDb(db => {
      const item = db.sources.find(s => s.id === id && s.tenantId === tenantId);
      if (item) Object.assign(item, { status: "failed", error: error instanceof Error ? error.message : "PDF processing failed", updatedAt: new Date().toISOString() });
    });
  }
  return id;
}

export async function crawlWebsite(tenantId: string, websiteUrl: string, limit = 25) {
  const root = await assertSafePublicUrl(websiteUrl);
  const queue = [root.href];
  const visited = new Set<string>();
  const results: KnowledgeSource[] = [];
  while (queue.length && visited.size < limit) {
    const next = queue.shift()!;
    if (visited.has(next)) continue;
    visited.add(next);
    try {
      await assertSafePublicUrl(next);
      const response = await fetch(next, { redirect: "error", signal: AbortSignal.timeout(10_000), headers: { "user-agent": "WebPlugIndexer/1.0" } });
      if (!response.ok || !(response.headers.get("content-type") || "").includes("text/html")) continue;
      const html = (await response.text()).slice(0, 1_000_000);
      const $ = cheerio.load(html);
      $("script,style,noscript,svg,nav,footer").remove();
      const title = normalizeText($("title").text() || $("h1").first().text() || new URL(next).pathname);
      const text = normalizeText($("main,article,[role=main]").first().text() || $("body").text());
      if (text.length > 80) {
        const now = new Date().toISOString();
        results.push({ id: makeId("src"), tenantId, type: "web", title: title || next, url: next, text, status: "ready", createdAt: now, updatedAt: now });
      }
      $("a[href]").each((_, element) => {
        try {
          const url = new URL($(element).attr("href")!, next);
          url.hash = "";
          if (url.origin === root.origin && ["http:", "https:"].includes(url.protocol) && !visited.has(url.href) && !/\.(pdf|jpg|jpeg|png|gif|zip)$/i.test(url.pathname)) queue.push(url.href);
        } catch { /* Ignore malformed links. */ }
      });
    } catch { /* A single bad page should not stop the site scan. */ }
  }
  await updateDb(db => {
    db.sources = db.sources.filter(source => source.tenantId !== tenantId || source.type !== "web");
    db.sources.push(...results);
  });
  return results.length;
}
