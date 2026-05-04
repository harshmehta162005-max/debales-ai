"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Bot, LayoutDashboard, MessageSquare, ShieldCheck, Layers, Globe, Database, Check, Star, Zap, Settings } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

const FEATURES = [
  { icon: <LayoutDashboard size={20} />, title: "Customize Without Code", desc: "Edit one MongoDB document — the entire dashboard rebuilds instantly. No deployments, no engineering tickets.", color: "#C17F59" },
  { icon: <Bot size={20} />, title: "Real AI, Real Answers", desc: "Google Gemini 1.5 Flash powers every response. Context-aware, multi-turn conversations that actually understand your business.", color: "#8B7355" },
  { icon: <Layers size={20} />, title: "One Platform, Many Teams", desc: "Each tenant gets complete isolation. Users only see their own data, projects, and conversations — enforced at every API layer.", color: "#C17F59" },
  { icon: <ShieldCheck size={20} />, title: "Security by Default", desc: "Role-based access, Zod validation, and server-enforced authorization on every request. Admin routes are locked down.", color: "#8B7355" },
  { icon: <Globe size={20} />, title: "Live Integration Toggles", desc: "Enable Shopify or CRM per workspace. The AI immediately adapts its system prompt and step indicators in real time.", color: "#C17F59" },
  { icon: <Database size={20} />, title: "Zero Direct DB Calls", desc: "TanStack Query handles all server state. Optimistic updates, automatic cache invalidation, clean separation of concerns.", color: "#8B7355" },
];

const HOW = [
  { step: "01", title: "Create Your Workspace", desc: "Sign up and name your company. We provision your project, dashboard, and AI assistant in seconds.", icon: <Settings size={22} color="#C17F59" /> },
  { step: "02", title: "Configure Integrations", desc: "Toggle Shopify and CRM data sources on or off. The AI instantly adapts its context and responses.", icon: <Zap size={22} color="#C17F59" /> },
  { step: "03", title: "Start Chatting", desc: "Your team can now chat with an AI assistant that understands your business data and workflows.", icon: <MessageSquare size={22} color="#C17F59" /> },
];

const TESTIMONIALS = [
  { quote: "The config-driven dashboard is a game changer. We restructured our entire analytics view without touching a single line of code.", name: "Priya Sharma", role: "Head of Product, NexusLabs", stars: 5 },
  { quote: "Multi-tenant isolation done right. Each client workspace is truly separate — we feel confident deploying this at scale.", name: "Marcus Chen", role: "CTO, Aether Ventures", stars: 5 },
  { quote: "The integration toggles affecting the AI in real time blew us away. It's exactly the kind of live configurability we needed.", name: "Sofia Reyes", role: "Engineering Lead, Basecamp AI", stars: 5 },
];

function NavActions() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <div style={{ width: 120 }} />;
  if (isSignedIn) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/workspaces" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#1A1A1A", color: "#fff", textDecoration: "none", transition: "opacity 0.15s" }}>
          <Layers size={13} /> Workspaces
        </Link>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg" } }} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: "#6B6560", textDecoration: "none", padding: "8px 16px" }}>Sign In</Link>
      <Link href="/sign-up" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "#1A1A1A", color: "#fff", textDecoration: "none" }}>
        Get Started <ArrowRight size={13} />
      </Link>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="theme-warm" style={{ background: "var(--bg-base)", color: "var(--text-1)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 62, background: "rgba(250,250,248,0.92)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #C17F59, #8B7355)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#1A1A1A", letterSpacing: "-0.3px" }}>Debales AI</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[["Features", "#features"], ["How it works", "#how"], ["Architecture", "#arch"]].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 13, fontWeight: 500, color: "#6B6560", textDecoration: "none", padding: "6px 14px", borderRadius: 8, transition: "color 0.15s" }}>{label}</a>
          ))}
        </nav>
        <NavActions />
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: "100px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-10%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(193,127,89,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "0", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,115,85,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="fade-up" style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, marginBottom: 28, background: "rgba(193,127,89,0.1)", border: "1px solid rgba(193,127,89,0.25)", fontSize: 12, fontWeight: 600, color: "#C17F59" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0, boxShadow: "0 0 0 3px rgba(22,163,74,0.2)" }} />
            Powered by Google Gemini 1.5 Flash
          </div>

          <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-2px", marginBottom: 22, color: "#1A1A1A" }}>
            AI Assistants That<br />
            <span style={{ background: "linear-gradient(135deg, #C17F59, #8B7355)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Understand Your Business
            </span>
          </h1>

          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#6B6560", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Multi-tenant AI workspaces with config-driven dashboards, real-time Gemini chat, and deep integrations — all enforced by a strict layered architecture.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 60 }}>
            <Link href="/sign-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, background: "#1A1A1A", color: "#fff", textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.15)", transition: "transform 0.2s, box-shadow 0.2s" }}>
              Start for Free <ArrowRight size={16} />
            </Link>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, background: "#fff", color: "#1A1A1A", textDecoration: "none", border: "1px solid rgba(0,0,0,0.12)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <LayoutDashboard size={15} /> Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
            {[{ v: "Multi-tenant", l: "Architecture" }, { v: "Gemini 1.5", l: "AI Model" }, { v: "5-layer", l: "API Design" }, { v: "Real-time", l: "Config Changes" }].map((s, i) => (
              <div key={s.l} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 1, height: 32, background: "rgba(0,0,0,0.1)", margin: "0 28px" }} />}
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.5px" }}>{s.v}</p>
                  <p style={{ fontSize: 11, color: "#A39E97", marginTop: 2, fontWeight: 500 }}>{s.l}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" style={{ padding: "80px 24px", background: "var(--bg-surface)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "rgba(193,127,89,0.1)", color: "#C17F59", border: "1px solid rgba(193,127,89,0.2)", letterSpacing: "0.06em", marginBottom: 14 }}>HOW IT WORKS</span>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.5px", color: "#1A1A1A", marginBottom: 12 }}>Up and running in minutes</h2>
            <p style={{ color: "#6B6560", fontSize: 15, maxWidth: 440, margin: "0 auto" }}>No complex setup. Create your workspace, configure what matters, and start chatting.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {HOW.map((h, i) => (
              <div key={h.step} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "32px 28px", position: "relative", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#C17F59", letterSpacing: "0.1em", marginBottom: 16, opacity: 0.5 }}>{h.step}</div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(193,127,89,0.1)", border: "1px solid rgba(193,127,89,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  {h.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginBottom: 8 }}>{h.title}</h3>
                <p style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.7 }}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "rgba(193,127,89,0.1)", color: "#C17F59", border: "1px solid rgba(193,127,89,0.2)", letterSpacing: "0.06em", marginBottom: 14 }}>FEATURES</span>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.5px", color: "#1A1A1A", marginBottom: 12 }}>Everything you need, nothing you don&apos;t</h2>
            <p style={{ color: "#6B6560", fontSize: 15, maxWidth: 460, margin: "0 auto" }}>Built on a strict layered architecture for correctness, security, and multi-tenancy from day one.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "28px 26px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 18, background: "rgba(193,127,89,0.1)", border: "1px solid rgba(193,127,89,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "#1A1A1A" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section id="arch" style={{ padding: "80px 24px", background: "var(--bg-surface)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "rgba(193,127,89,0.1)", color: "#C17F59", border: "1px solid rgba(193,127,89,0.2)", letterSpacing: "0.06em", marginBottom: 14 }}>ARCHITECTURE</span>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12, color: "#1A1A1A" }}>Strict Layered Architecture</h2>
          <p style={{ color: "#6B6560", fontSize: 14, marginBottom: 44 }}>Every request flows through the same enforced pipeline — no shortcuts, no bypasses.</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "UI", sub: "Next.js App Router" },
              { label: "API Routes", sub: "Thin handlers" },
              { label: "Access Layer", sub: "requireAccess()", accent: true },
              { label: "Service Layer", sub: "Business logic" },
              { label: "MongoDB", sub: "Atlas / Mongoose" },
            ].map((l, i) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: "12px 20px", borderRadius: 12, textAlign: "center", minWidth: 120, background: l.accent ? "rgba(193,127,89,0.08)" : "#fff", border: `1.5px solid ${l.accent ? "rgba(193,127,89,0.4)" : "rgba(0,0,0,0.09)"}`, boxShadow: l.accent ? "0 4px 16px rgba(193,127,89,0.12)" : "0 2px 6px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: l.accent ? "#C17F59" : "#1A1A1A" }}>{l.label}</p>
                  <p style={{ fontSize: 10, color: "#A39E97", marginTop: 3 }}>{l.sub}</p>
                </div>
                {i < 4 && <ArrowRight size={14} color="#A39E97" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "rgba(193,127,89,0.1)", color: "#C17F59", border: "1px solid rgba(193,127,89,0.2)", letterSpacing: "0.06em", marginBottom: 14 }}>TESTIMONIALS</span>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, letterSpacing: "-0.5px", color: "#1A1A1A" }}>Trusted by engineering teams</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "28px 26px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={14} fill="#C17F59" color="#C17F59" />)}
                </div>
                <p style={{ fontSize: 14, color: "#3D3A36", lineHeight: 1.75, marginBottom: 20, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "#A39E97", marginTop: 2 }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "60px 24px 80px", background: "var(--bg-surface)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#1A1A1A", borderRadius: 24, padding: "52px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-30%", right: "-10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(193,127,89,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #C17F59, #8B7355)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bot size={24} color="#fff" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 10, letterSpacing: "-0.5px" }}>Start building in minutes</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7 }}>
              Create your account and get a fully provisioned AI workspace — complete with your first project, integrations, and dashboard automatically configured.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/sign-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg, #C17F59, #8B7355)", color: "#fff", textDecoration: "none", boxShadow: "0 4px 20px rgba(193,127,89,0.4)" }}>
                Create Free Account <ArrowRight size={15} />
              </Link>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600, background: "rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.08)", padding: "32px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #C17F59, #8B7355)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1A1A1A" }}>Debales AI</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Features", "Architecture", "Sign In", "Get Started"].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: "#A39E97", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#A39E97" }}>© 2025 Debales AI · Built with Next.js &amp; Google Gemini</p>
        </div>
      </footer>
    </div>
  );
}
