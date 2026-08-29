import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, expected: string) {
  // Existing development stores created before scrypt are migrated on the next
  // password change, while all new credentials use a salted slow hash.
  if (!expected.startsWith("scrypt$")) {
    const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
    const target = Buffer.from(expected);
    return actual.length === target.length && timingSafeEqual(actual, target);
  }
  const [, salt, encoded] = expected.split("$");
  const actual = scryptSync(password, salt, 64);
  const target = Buffer.from(encoded, "hex");
  return actual.length === target.length && timingSafeEqual(actual, target);
}
