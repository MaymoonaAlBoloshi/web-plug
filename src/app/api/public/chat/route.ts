import { NextResponse } from "next/server";
import { z } from "zod";
import { generateGroundedAnswer } from "@/lib/llm";
import { citationsFor, retrieve } from "@/lib/retrieval";
import { readDb } from "@/lib/store";

const schema = z.object({
  slug: z.string().min(1).max(80),
  query: z.string().min(2).max(1000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).max(6).default([])
});

const requests = new Map<string, { count: number; reset: number }>();
function rateLimited(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const now = Date.now(); const current = requests.get(ip);
  if (!current || current.reset < now) { requests.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  current.count++; return current.count > 30;
}

export async function POST(request: Request) {
  if (rateLimited(request)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  const db = await readDb();
  const tenant = db.tenants.find(item => item.slug === parsed.data.slug && item.enabled);
  if (!tenant) return NextResponse.json({ error: "Chatbot unavailable" }, { status: 404 });
  const sources = db.sources.filter(source => source.tenantId === tenant.id && source.status === "ready");
  const matches = retrieve(parsed.data.query, sources);
  const arabic = /[\u0600-\u06ff]/.test(parsed.data.query);
  if (!matches.length || matches[0].score < 0.045) {
    return NextResponse.json({ answer: arabic ? "لم أجد معلومات موثوقة عن ذلك في مصادر هذا الموقع. هل ترغب في إرسال السؤال إلى الفريق؟" : "I couldn’t find verified information about that in this website’s knowledge base. Would you like to send the question to the team?", citations: [], unsupported: true });
  }
  const citations = citationsFor(matches);
  try {
    const answer = await generateGroundedAnswer(parsed.data.query, matches, parsed.data.history, citations, tenant.modelConfig);
    if (!answer) return NextResponse.json({ answer: arabic ? "لم أجد معلومات موثوقة كافية للإجابة. هل ترغب في سؤال الفريق؟" : "I couldn’t find enough verified information to answer that. Would you like to ask the team?", citations: [], unsupported: true });
    return NextResponse.json({ answer, citations, unsupported: false });
  } catch {
    return NextResponse.json({ answer: arabic ? "أواجه مشكلة في إعداد الإجابة الآن. يمكنك إرسال سؤالك إلى الفريق بدلاً من ذلك." : "I’m having trouble preparing an answer right now. You can send this question to the team instead.", citations: [], unsupported: true });
  }
}
