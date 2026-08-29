import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser, User } from "./types";

const COOKIE = "webplug_session";
const secret = () => process.env.AUTH_SECRET || "development-only-secret-change-me";

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: User) {
  const data: SessionUser & { expiresAt: number } = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 12
  };
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token?: string): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const actual = Buffer.from(signature);
  const expected = Buffer.from(sign(payload));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionUser & { expiresAt: number };
    if (value.expiresAt < Date.now()) return null;
    return value;
  } catch {
    return null;
  }
}

export async function currentUser() {
  return parseSessionToken((await cookies()).get(COOKIE)?.value);
}

export async function requireUser(role?: "admin" | "customer") {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  return user;
}

export async function setSession(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/"
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
