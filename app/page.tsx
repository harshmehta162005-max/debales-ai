"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowRight, Bot, LayoutDashboard, MessageSquare,
  ShieldCheck, Layers, Zap, Globe, Database, Code2,
} from "lucide-react";

const FEATURES = [
  {
    icon: <LayoutDashboard size={18} />,
    title: "Config-Driven Dashboard",
    desc: "Edit one MongoDB document — the entire dashboard UI rebuilds. No deployments, no code changes. True config-as-code.",
    color: "#3b82f6",
  },
  {
    icon: <Bot size={18} />,
    title: "Real Gemini AI Chat",
    desc: "Multi-turn conversations with Google Gemini 1.5 Flash. Context-aware responses based on active Shopify and CRM integrations.",
    color: "#8b5cf6",
  },
  {
    icon: <Layers size={18} />,
    title: "Multi-Tenant Isolation",
    desc: "Strict project-level data isolation. Users only see their own projects, conversations, and stats — enforced at every layer.",
    color: "#06b6d4",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Layered Security",
    desc: "Access → Service → Model pattern. HMAC-signed HTTP-only cookies, Zod validation, and role checks on every request.",
    color: "#22c55e",
  },
  {
    icon: <Globe size={18} />,
    title: "Live Integration Toggles",
    desc: "Enable Shopify or CRM per product instance. The AI immediately adapts its system prompt and responses in real time.",
    color: "#f59e0b",
  },
  {
    icon: <Database size={18} />,
    title: "TanStack Query",
    desc: "Every data fetch and mutation uses hooks. Optimistic updates, automatic cache invalidation, zero direct DB calls from UI.",
    color: "#ef4444",
  },
];

const ARCH = [
  { label: "UI", sub: "Next.js 16", color: "#3b82f6" },
  { label: "API Routes", sub: "Thin handlers", color: "#6366f1" },
  { label: "Access Layer", sub: "requireAccess()", color: "#8b5cf6", highlight: true },
  { label: "Service Layer", sub: "Business logic", color: "#06b6d4" },
  { label: "MongoDB", sub: "Atlas", color: "#22c55e" },
];

const STATS = [
  { value: "2", label: "Tenants" },
  { value: "Gemini", label: "AI Model" },
  { value: "5-layer", label: "Architecture" },
];

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#3b82f6", "#8b5cf6", "#06b6d4"];
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4, a: Math.random() * 0.5 + 0.1,
      c: colors[Math.floor(Math.random() * 3)],
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = "#3b82f6"; ctx.globalAlpha = (1 - d / 110) * 0.12;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div style={{ background: "var(--bg-base)", color: "var(--text-1)", minHeight: "100vh" }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 58,
        background: "rgba(6,11,23,0.85)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: "var(--grad)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bot size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15 }} className="gradient-text">Debales AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/login" className="btn btn-ghost" style={{ fontSize: 13, padding: "7px 16px" }}>Sign In</Link>
          <Link href="/login" className="btn btn-primary" style={{ fontSize: 13, padding: "7px 16px" }}>Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "91vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 24px", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.65 }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 65% 55% at 50% 45%, rgba(59,130,246,0.11) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="fade-up" style={{ position: "relative", zIndex: 1, maxWidth: 720 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 99, marginBottom: 28,
            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
            fontSize: 12, fontWeight: 600, color: "#93c5fd",
          }}>
            <span style={{ position: "relative", width: 7, height: 7 }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--green)", animation: "pulse-ring 1.8s ease infinite" }} />
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--green)" }} />
            </span>
            Powered by Google Gemini 1.5 Flash
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 70px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-1.5px", marginBottom: 22 }}>
            The <span className="gradient-text">AI Platform</span>
            <br />Built for Teams
          </h1>

          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-2)", maxWidth: 540, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Multi-tenant AI assistants with config-driven dashboards, real-time
            Gemini chat, and deep integrations with Shopify and CRM — all backed
            by a strict layered architecture.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/login" className="btn btn-primary" style={{ fontSize: 15, padding: "12px 28px" }}>
              Launch Demo <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard" className="btn btn-ghost" style={{ fontSize: 15, padding: "12px 28px" }}>
              <LayoutDashboard size={15} /> View Dashboard
            </Link>
          </div>

          {/* Mini stats */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 48, flexWrap: "wrap" }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && <div style={{ width: 1, height: 28, background: "var(--border)" }} />}
                <div style={{ textAlign: "center", padding: "0 20px" }}>
                  <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px" }} className="gradient-text">{s.value}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--bg-surface)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span className="badge badge-blue" style={{ marginBottom: 14, display: "inline-flex" }}>
              <Code2 size={10} /> Core Features
            </span>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>
              Everything you need, nothing you don&apos;t
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
              Built on a strict layered architecture for correctness, security, and multi-tenancy from day one.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="card card-lift" style={{ padding: "24px 22px", cursor: "default" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, marginBottom: 16,
                  background: `${f.color}15`, border: `1px solid ${f.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: f.color,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <span className="badge badge-violet" style={{ marginBottom: 14, display: "inline-flex" }}>
            <Layers size={10} /> Architecture
          </span>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>
            Strict Layered Architecture
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 44 }}>
            Every request flows through the same enforced pipeline — no shortcuts, no bypasses.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 10 }}>
            {ARCH.map((layer, i) => (
              <div key={layer.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="card" style={{
                  padding: "12px 18px", textAlign: "center", minWidth: 110,
                  borderColor: layer.highlight ? `${layer.color}50` : "var(--border)",
                  background: layer.highlight ? `${layer.color}0d` : "var(--bg-card)",
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: layer.highlight ? layer.color : "var(--text-1)" }}>
                    {layer.label}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3 }}>{layer.sub}</p>
                </div>
                {i < ARCH.length - 1 && (
                  <ArrowRight size={14} color="var(--text-3)" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px 80px", background: "var(--bg-surface)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }} className="card">
          <div style={{ padding: "48px 32px" }}>
            <MessageSquare size={32} color="var(--blue)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Ready to explore?</h2>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24, lineHeight: 1.7 }}>
              Login as{" "}
              <code style={{ padding: "2px 7px", borderRadius: 5, background: "var(--blue-dim)", color: "#93c5fd", fontSize: 12 }}>admin@acme.com</code>
              {" "}or{" "}
              <code style={{ padding: "2px 7px", borderRadius: 5, background: "rgba(139,92,246,0.15)", color: "#c4b5fd", fontSize: 12 }}>admin@beta.com</code>
              {" "}to see multi-tenancy in action.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ fontSize: 15, padding: "12px 28px" }}>
              Launch Demo <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: "center", padding: "20px 24px", fontSize: 12, color: "var(--text-3)",
        borderTop: "1px solid var(--border)",
      }}>
        <span className="gradient-text" style={{ fontWeight: 700 }}>Debales AI</span>
        {" "}— Multi-Tenant AI Assistant Platform · Built with Next.js 16, Google Gemini &amp; MongoDB
      </footer>
    </div>
  );
}
