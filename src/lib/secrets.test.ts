import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./secrets";

describe("customer provider secrets", () => {
  it("encrypts keys with authenticated encryption", () => {
    const encrypted = encryptSecret("sk-customer-secret");
    expect(encrypted).not.toContain("sk-customer-secret");
    expect(decryptSecret(encrypted)).toBe("sk-customer-secret");
    expect(decryptSecret(`${encrypted}tampered`)).toBe("");
  });
});
