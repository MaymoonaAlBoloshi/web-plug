"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accessibility, BookOpen, Headphones, LayoutDashboard, LogOut, MessageSquareText, Palette, ScanSearch, Settings, Users } from "lucide-react";
import type { SessionUser } from "@/lib/types";

const customerLinks = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/dashboard/appearance", "Appearance", Palette],
  ["/dashboard/accessibility", "Accessibility", Accessibility],
  ["/dashboard/knowledge", "Knowledge", BookOpen],
  ["/dashboard/support", "Support", Headphones],
  ["/dashboard/settings", "Settings", Settings]
] as const;

const adminLinks = [
  ["/admin", "Customers", Users],
  ["/admin/scans", "Scan activity", ScanSearch],
  ["/admin/settings", "Platform", Settings]
] as const;

export function AppShell({ user, children, accessibilityEnabled = true }: { user: SessionUser; children: React.ReactNode; accessibilityEnabled?: boolean }) {
  const pathname = usePathname();
  const links = user.role === "admin" ? adminLinks : customerLinks.filter(([href]) => href !== "/dashboard/accessibility" || accessibilityEnabled);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href={user.role === "admin" ? "/admin" : "/dashboard"}><span className="brand-mark"><MessageSquareText size={18} /></span> webplug</Link>
        <nav className="nav">
          {links.map(([href, label, Icon]) => {
            const active = pathname === href || (href !== "/dashboard" && href !== "/admin" && pathname.startsWith(href));
            return <Link className={active ? "active" : ""} href={href} key={href}><Icon size={17} />{label}</Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}><strong style={{ fontSize: 13 }}>{user.name}</strong><small>{user.role === "admin" ? "Platform admin" : "Workspace owner"}</small></div>
            <form action="/api/auth/logout" method="post" style={{ marginLeft: "auto" }}><button title="Sign out" style={{ background: "none", border: 0, color: "#95a299", cursor: "pointer" }}><LogOut size={16} /></button></form>
          </div>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

export function PageHeader({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return <header className="topbar"><div className="page-title"><h1>{title}</h1><p>{description}</p></div>{children}</header>;
}
