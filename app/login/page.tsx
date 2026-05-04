"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    email: "admin@acme.com",
    name: "Acme Admin",
    project: "Acme Corp",
    desc: "E-commerce + CRM integrations",
    color: "#3b82f6",
  },
  {
    email: "admin@beta.com",
    name: "Beta Admin",
    project: "Beta Startup",
    desc: "Analytics + SaaS dashboard",
    color: "#8b5cf6",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => { if (r.ok) router.push("/dashboard"); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [router]);

  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string) => {
    e?.preventDefault();
    const loginEmail = overrideEmail ?? email;
    if (!loginEmail.trim()) { setError("Please enter an email address"); return; }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Welcome, ${data.name}! Redirecting…`);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please run npm run seed first.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setError("");
    handleLogin(undefined, acc.email);
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-base)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", position: "relative", overflow: "hidden",
    }}>
      {/* Background glows */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 55% 55% at 30% 40%, rgba(59,130,246,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 70%, rgba(139,92,246,0.07) 0%, transparent 70%)",
      }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Back */}
        <Link href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "var(--text-3)", textDecoration: "none",
            marginBottom: 28, transition: "color 0.15s", cursor: "pointer",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="glass fade-up" style={{ padding: "32px 28px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: "var(--grad)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={20} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16 }}>Debales AI</p>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>Admin Console</p>
            </div>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Sign in</h1>
          <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 24 }}>
            Choose a demo account or enter your email
          </p>

          {/* Quick account buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {DEMO_ACCOUNTS.map(acc => {
              const isSelected = email === acc.email;
              return (
                <button key={acc.email}
                  onClick={() => quickLogin(acc)}
                  disabled={loading}
                  style={{
                    padding: "13px 14px", borderRadius: 10, textAlign: "left",
                    background: isSelected ? `${acc.color}18` : "var(--bg-surface)",
                    border: `1px solid ${isSelected ? `${acc.color}50` : "var(--border-hi)"}`,
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.18s", opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => {
                    if (!loading) (e.currentTarget.style.borderColor = `${acc.color}70`);
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget.style.borderColor = isSelected ? `${acc.color}50` : "var(--border-hi)");
                  }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: isSelected ? acc.color : "var(--text-1)", marginBottom: 4 }}>
                    {acc.project}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{acc.desc}</p>
                  <p style={{ fontSize: 10, color: isSelected ? acc.color : "var(--text-3)", fontFamily: "monospace" }}>{acc.email}</p>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>or enter manually</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@example.com"
                className="input"
                required
              />
            </div>

            {/* Feedback */}
            {error && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "10px 12px", borderRadius: 9, fontSize: 13,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
              }}>
                <XCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                {error}
              </div>
            )}
            {success && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", borderRadius: 9, fontSize: 13,
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
                color: "#86efac",
              }}>
                <CheckCircle2 size={15} />
                {success}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: 14, justifyContent: "center" }}>
              {loading
                ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2, borderTopColor: "#fff" }} /> Signing in…</>
                : "Sign In"}
            </button>
          </form>

          <p style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", marginTop: 20 }}>
            No account? Run{" "}
            <code style={{ padding: "2px 6px", borderRadius: 5, background: "var(--bg-surface)", fontSize: 11 }}>
              npm run seed
            </code>{" "}
            to create demo data
          </p>
        </div>
      </div>
    </div>
  );
}
