import { describe, expect, it } from "vitest";
import { citationsFor, retrieve } from "./retrieval";
import type { KnowledgeSource } from "./types";

const source = (tenantId: string, title: string, text: string): KnowledgeSource => ({ id: title, tenantId, title, text, type: "web", url: `https://example.com/${title}`, status: "ready", createdAt: "2026-01-01", updatedAt: "2026-01-01" });

describe("tenant-scoped retrieval", () => {
  it("returns relevant grounded chunks", () => {
    const result = retrieve("What is the refund policy?", [source("a", "returns", "Our refund policy allows returns within thirty days."), source("a", "hours", "The office opens Monday morning.")]);
    expect(result[0].source.title).toBe("returns");
    expect(citationsFor(result)[0].url).toContain("returns");
  });
  it("does not find unrelated answers", () => {
    expect(retrieve("quantum rocket engine", [source("a", "hours", "The office opens Monday morning.")])).toEqual([]);
  });
  it("retrieves Arabic knowledge with Unicode tokenization", () => {
    const result = retrieve("كم يستغرق موقع الشركة؟", [source("a", "arabic", "يستغرق موقع الشركة عادة من أربعة إلى ستة أسابيع.")]);
    expect(result[0].source.title).toBe("arabic");
  });
  it("can only see sources supplied for the active tenant", () => {
    const all = [source("a", "alpha", "Alpha pricing is ten dollars."), source("b", "beta", "Beta pricing is fifty dollars.")];
    const result = retrieve("Beta pricing", all.filter(item => item.tenantId === "a"));
    expect(result.every(item => item.source.tenantId === "a")).toBe(true);
    expect(result.some(item => item.source.title === "beta")).toBe(false);
  });
});
