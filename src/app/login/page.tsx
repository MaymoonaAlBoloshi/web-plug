import { MessageSquareText } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-art">
        <div className="brand"><span className="brand-mark"><MessageSquareText size={18} /></span> webplug</div>
        <div className="auth-copy">
          <h1>Every website deserves a great answer.</h1>
          <p>Turn your pages and documents into a focused, private support experience your visitors can trust.</p>
        </div>
        <small style={{ color: "#87938b", position: "relative", zIndex: 1 }}>Grounded answers. Clear sources. No noise.</small>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">Customer workspace</span>
          <h2>Welcome back</h2>
          <p className="muted">Manage your chatbot knowledge, appearance, and support requests.</p>
          <LoginForm />
          <div className="demo-note"><strong>Demo customer</strong><br />owner@northstar.local · demo123<br /><strong>Admin</strong><br />admin@webplug.local · admin123</div>
        </div>
      </section>
    </main>
  );
}
