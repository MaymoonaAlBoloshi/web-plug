import { notFound } from "next/navigation";
import { Chatbot } from "@/components/chatbot";
import { readDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function EmbedPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const db = await readDb();
  const tenant = db.tenants.find(item => item.slug === slug && item.enabled);
  if (!tenant) notFound();
  return <main className="embed-canvas"><Chatbot slug={slug} config={tenant.chatbot} initialLanguage={lang === "ar" ? "ar" : "en"} /></main>;
}
