import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./crypto";

describe("credentials", () => {
  it("uses salted hashes and verifies without storing plaintext", () => {
    const first = hashPassword("correct horse battery staple");
    const second = hashPassword("correct horse battery staple");
    expect(first).not.toBe(second);
    expect(first).not.toContain("correct horse");
    expect(verifyPassword("correct horse battery staple", first)).toBe(true);
    expect(verifyPassword("wrong", first)).toBe(false);
  });
});
