"use server";

import { redirect } from "next/navigation";
import { createSessionToken, setSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/crypto";
import { readDb } from "@/lib/store";

export interface LoginState { error: string }

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const db = await readDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email);
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "That email and password do not match." };
  await setSession(createSessionToken(user));
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}
