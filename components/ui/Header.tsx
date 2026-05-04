"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot, LayoutDashboard, MessageSquare, LogOut,
  ChevronDown, User, RefreshCw, Zap,
} from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: projects } = useProjects();
  const logout = useLogout();

  const [userOpen, setUserOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const currentSlug = pathname.match(/\/projects\/([^/]+)/)?.[1];
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
    ...(projects?.slice(0, 3).map((p: any) => ({
      href: `/projects/${p.slug}/chat`,
      label: p.name,
      icon: <MessageSquare size={14} />,
    })) ?? []),
  ];

  const switchUser = async (email: string) => {
    setSwitching(email);
    try {
      await fetch("/api/auth/login", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      window.location.href = "/dashboard";
    } finally {
      setSwitching(null);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 58,
      background: "rgba(6, 11, 23, 0.88)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* ── Brand ── */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "var(--grad)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Bot size={16} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px" }}
          className="gradient-text">
          Debales AI
        </span>
      </Link>

      {/* ── Nav ── */}
      <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("/chat")[0]));
          return (
            <Link key={item.href} href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                textDecoration: "none", transition: "all 0.15s",
                background: active ? "rgba(59,130,246,0.13)" : "transparent",
                color: active ? "#93c5fd" : "var(--text-2)",
                border: `1px solid ${active ? "rgba(59,130,246,0.3)" : "transparent"}`,
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                }
              }}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Right: user ── */}
      <div style={{ position: "relative" }} ref={dropRef}>
        <button
          onClick={() => setUserOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "6px 12px 6px 8px",
            background: userOpen ? "var(--bg-hover)" : "var(--bg-card)",
            border: `1px solid ${userOpen ? "var(--border-hi)" : "var(--border)"}`,
            borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
          }}>
          {/* Avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--grad)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>
          {user && (
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.3 }}>{user.name}</p>
              <p style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.3 }}>{user.email}</p>
            </div>
          )}
          <ChevronDown size={13} color="var(--text-3)"
            style={{ transform: userOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {/* Dropdown */}
        {userOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            width: 240, borderRadius: 12,
            background: "var(--bg-card)", border: "1px solid var(--border-hi)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            overflow: "hidden", zIndex: 200,
          }}>
            {/* Current user info */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: "var(--grad)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <span className="badge badge-blue" style={{ fontSize: 10 }}>
                  <Zap size={9} /> Admin
                </span>
                <span className="badge badge-green" style={{ fontSize: 10 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                  Active
                </span>
              </div>
            </div>

            {/* Switch demo user */}
            <div style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", padding: "0 8px 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Switch Demo User
              </p>
              {[
                { email: "admin@acme.com",  name: "Acme Admin",  project: "acme-corp" },
                { email: "admin@beta.com",  name: "Beta Admin",  project: "beta-startup" },
              ]
              .filter(u => u.email !== user?.email)
              .map(u => (
                <button key={u.email}
                  onClick={() => { setUserOpen(false); switchUser(u.email); }}
                  disabled={switching === u.email}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 8, background: "transparent",
                    border: "none", cursor: "pointer", transition: "background 0.15s",
                    color: "var(--text-2)", fontSize: 13,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  {switching === u.email
                    ? <div className="spinner" style={{ width: 16, height: 16 }} />
                    : <RefreshCw size={14} color="var(--text-3)" />}
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{u.name}</p>
                    <p style={{ fontSize: 10, color: "var(--text-3)" }}>{u.email}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: 8 }}>
              <button
                onClick={() => { setUserOpen(false); logout.mutate(); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 10px", borderRadius: 8, background: "transparent",
                  border: "none", cursor: "pointer", transition: "background 0.15s",
                  color: "#f87171", fontSize: 13, fontWeight: 500,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
