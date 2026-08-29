"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="form-stack">
      {state.error && <div className="error">{state.error}</div>}
      <label className="field">Email address<input className="input" type="email" name="email" placeholder="you@company.com" required /></label>
      <label className="field">Password<input className="input" type="password" name="password" placeholder="Enter your password" required /></label>
      <button className="button lime" disabled={pending}>{pending ? "Signing in…" : "Sign in to WebPlug"}</button>
    </form>
  );
}
