"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutDashboard, MessageSquare } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Header() {
  const pathname = usePathname();
  const { data: projects } = useProjects();
  const { user } = useUser();

  const isAdmin = projects?.some((p: any) => 
    p.members?.some((m: any) => m.userId === user?.id && m.role === "admin")
  );

  let currentSlug = "";
  if (pathname.startsWith("/projects/")) {
    currentSlug = pathname.split("/")[2];
  }

  const navItems = [];
  
  if (isAdmin) {
    navItems.push({ href: currentSlug ? `/dashboard?slug=${currentSlug}` : "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> });
  }

  return (
    <header data-testid="main-header" style={{
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 58,
      background: "rgba(250,250,248,0.92)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
    }}>
      {/* ── Brand ── */}
      <Link href="/workspaces" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "linear-gradient(135deg, #C17F59, #8B7355)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Bot size={16} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px", color: "#1A1A1A" }}>
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
                background: active ? "rgba(193,127,89,0.12)" : "transparent",
                color: active ? "#8B4513" : "var(--text-2)",
                border: `1px solid ${active ? "rgba(193,127,89,0.35)" : "transparent"}`,
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg" } }} />
      </div>
    </header>
  );
}
