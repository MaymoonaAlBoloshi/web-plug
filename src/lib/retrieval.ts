import type { Citation, KnowledgeSource } from "./types";

const stop = new Set("a an and are as at be by for from has have how i in is it of on or that the this to was what when where which who will with you your في من على إلى عن هل ما ماذا كيف متى أين هذا هذه هو هي و أو مع تم يتم كان تكون لدى عند".split(" "));

function terms(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(word => word.length > 2 && !stop.has(word));
}

function chunks(source: KnowledgeSource) {
  const sentences = source.text.split(/(?<=[.!?؟])\s+/);
  const output: string[] = [];
  for (let i = 0; i < sentences.length; i += 5) output.push(sentences.slice(i, i + 7).join(" ").slice(0, 1500));
  return output;
}

export function retrieve(query: string, sources: KnowledgeSource[], count = 4) {
  const queryTerms = terms(query);
  if (!queryTerms.length) return [];
  return sources.flatMap(source => chunks(source).map(text => {
    const haystack = terms(text);
    const frequency = new Map<string, number>();
    haystack.forEach(term => frequency.set(term, (frequency.get(term) || 0) + 1));
    const matches = queryTerms.filter(term => frequency.has(term));
    const score = matches.reduce((sum, term) => sum + 1 + Math.log(frequency.get(term) || 1), 0) / Math.sqrt(Math.max(haystack.length, 1));
    return { source, text, score, matches: matches.length };
  })).filter(item => item.matches > 0).sort((a, b) => b.score - a.score).slice(0, count);
}

export function citationsFor(items: ReturnType<typeof retrieve>): Citation[] {
  const seen = new Set<string>();
  return items.filter(item => !seen.has(item.source.url) && seen.add(item.source.url)).map(item => ({ title: item.source.title, url: item.source.url, excerpt: item.text.slice(0, 180) }));
}
