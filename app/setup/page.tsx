"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useProjects } from "@/hooks/useProjects";
import { Building2, Package, Plug, Check, ChevronRight, Loader2, ArrowLeft } from "lucide-react";

/* ── helpers ────────────────────────────────────────────────────────────── */
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

const PRODUCT_TYPES = [
  { value: "e-commerce", label: "E-Commerce", icon: "🛍️", desc: "Sales, orders, inventory" },
  { value: "support",    label: "Support",    icon: "🎧", desc: "Tickets, helpdesk, FAQ" },
  { value: "sales",      label: "Sales",      icon: "💼", desc: "Leads, deals, pipeline" },
  { value: "general",    label: "General",    icon: "✨", desc: "Multipurpose assistant" },
];

const STEPS = [
  { label: "Company",      icon: Building2 },
  { label: "Product",      icon: Package },
  { label: "Integrations", icon: Plug },
];

/* ── Warm palette constants (CSS vars may not hot-reload immediately) ── */
const W = {
  bg:      "#FAFAF8",
  surface: "#F5F3EF",
  card:    "#FFFFFF",
  hover:   "#EDE9E3",
  border:  "rgba(0,0,0,0.10)",
  borderHi:"rgba(0,0,0,0.15)",
  text1:   "#1A1A1A",
  text2:   "#6B6560",
  text3:   "#A39E97",
  accent:  "#C17F59",
  accentD: "#8B7355",
  grad:    "linear-gradient(135deg,#C17F59,#8B7355)",
};

/* ── Step Bar ───────────────────────────────────────────────────────────── */
function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
      {STEPS.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        const Icon   = s.icon;
        return (
          <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? W.accent : active ? W.card : W.surface,
                border: `2px solid ${done || active ? W.accent : W.borderHi}`,
                transition: "all 0.3s ease",
                boxShadow: active ? `0 0 0 4px rgba(193,127,89,0.15)` : "none",
              }}>
                {done
                  ? <Check size={17} color="#fff" />
                  : <Icon size={17} color={active ? W.accent : W.text3} />
                }
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: active ? W.text1 : done ? W.accent : W.text3,
                letterSpacing: "0.04em",
              }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 72, height: 2, margin: "0 6px", marginBottom: 22,
                background: done ? W.accent : W.border,
                transition: "background 0.3s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Integration Card ───────────────────────────────────────────────────── */
function IntegrationCard({
  label, desc, icon, enabled, onToggle,
}: { label: string; desc: string; icon: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "16px 20px", borderRadius: 12, cursor: "pointer",
      border: `2px solid ${enabled ? W.accent : W.borderHi}`,
      background: enabled ? "rgba(193,127,89,0.06)" : W.surface,
      transition: "all 0.2s ease",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, fontSize: 22,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: enabled ? "rgba(193,127,89,0.12)" : W.card,
        border: `1px solid ${enabled ? "rgba(193,127,89,0.3)" : W.border}`,
        flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: W.text1, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: W.text2 }}>{desc}</p>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        border: `2px solid ${enabled ? W.accent : W.borderHi}`,
        background: enabled ? W.accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.2s ease",
      }}>
        {enabled && <Check size={12} color="#fff" />}
      </div>
    </div>
  );
}

/* ── Shared input style ─────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: W.surface,
  border: `1px solid ${W.borderHi}`,
  borderRadius: 9,
  color: W.text1, fontFamily: "inherit", fontSize: 14,
  outline: "none",
};

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function SetupPage() {
  const router     = useRouter();
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn } = useUser();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const [step,        setStep]        = useState(0);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  const [companyName,         setCompanyName]         = useState("");
  const [workspaceSlug,       setWorkspaceSlug]       = useState("");
  const [slugManuallyEdited,  setSlugManuallyEdited]  = useState(false);
  const [productName,         setProductName]         = useState("");
  const [productType,         setProductType]         = useState<"e-commerce"|"support"|"sales"|"general">("general");
  const [shopifyEnabled,      setShopifyEnabled]      = useState(false);
  const [crmEnabled,          setCrmEnabled]          = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isLoaded, isSignedIn, router]);

  // Only redirect to dashboard if setupComplete is EXPLICITLY true
  useEffect(() => {
    if (!projectsLoading && projects?.length) {
      const project = projects[0];
      if (project?.setupComplete === true) router.push("/dashboard");
    }
  }, [projects, projectsLoading, router]);

  useEffect(() => {
    if (!slugManuallyEdited && companyName) setWorkspaceSlug(slugify(companyName));
  }, [companyName, slugManuallyEdited]);

  const currentSlug = projects?.[0]?.slug ?? "";

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${currentSlug}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          newSlug: workspaceSlug || currentSlug,
          productName,
          productType,
          shopifyEnabled,
          crmEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");

      // Invalidate TanStack Query cache so dashboard sees setupComplete=true
      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Mark setup as done in sessionStorage so dashboard skips redirect check
      sessionStorage.setItem("setup_just_completed", "1");

      // Use full navigation to bypass any cached router state
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  if (!isLoaded || projectsLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: W.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 28, height: 28, border: `3px solid ${W.border}`, borderTopColor: W.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: W.text3 }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: W.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "Inter, sans-serif" }}>

      {/* Brand mark */}
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: W.grad,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
          boxShadow: "0 8px 32px rgba(193,127,89,0.25)",
        }}>
          <Building2 size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: W.text1, marginBottom: 4 }}>
          Welcome to Debales AI
        </h1>
        <p style={{ fontSize: 14, color: W.text2 }}>
          Let&apos;s set up your workspace in 3 quick steps
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 520,
        background: W.card,
        border: `1px solid ${W.borderHi}`,
        borderRadius: 20,
        padding: "36px 40px",
        boxShadow: "0 8px 48px rgba(0,0,0,0.08)",
      }}>
        <StepBar current={step} />

        {/* ── Step 0: Company Info ── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: W.text1 }}>Your company</h2>
            <p style={{ fontSize: 13, color: W.text2, marginBottom: 28 }}>Tell us about your organization</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: W.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>
                  COMPANY NAME
                </label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Acme Corp, Nexus Labs…"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  autoFocus
                  onFocus={e => (e.target.style.borderColor = W.accent)}
                  onBlur={e => (e.target.style.borderColor = W.borderHi)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: W.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>
                  WORKSPACE URL
                </label>
                <div style={{ display: "flex", alignItems: "center", background: W.surface, border: `1px solid ${W.borderHi}`, borderRadius: 9, overflow: "hidden" }}>
                  <span style={{ padding: "11px 12px", fontSize: 13, color: W.text3, borderRight: `1px solid ${W.borderHi}`, flexShrink: 0, userSelect: "none" }}>app/</span>
                  <input
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "11px 14px", fontSize: 14, color: W.text1, fontFamily: "inherit" }}
                    placeholder="my-company"
                    value={workspaceSlug}
                    onChange={e => { setSlugManuallyEdited(true); setWorkspaceSlug(slugify(e.target.value)); }}
                  />
                </div>
                <p style={{ fontSize: 11, color: W.text3, marginTop: 5 }}>Lowercase letters, numbers and hyphens only</p>
              </div>
            </div>

            <button
              style={{
                width: "100%", marginTop: 32, padding: "13px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: companyName.trim() && workspaceSlug.trim() ? W.grad : W.surface,
                color: companyName.trim() && workspaceSlug.trim() ? "#fff" : W.text3,
                border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700,
                cursor: companyName.trim() && workspaceSlug.trim() ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "all 0.2s",
              }}
              disabled={!companyName.trim() || !workspaceSlug.trim()}
              onClick={() => setStep(1)}
            >
              Continue <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* ── Step 1: Product Instance ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: W.text1 }}>Your AI product</h2>
            <p style={{ fontSize: 13, color: W.text2, marginBottom: 28 }}>What will your AI assistant be doing?</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: W.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>PRODUCT NAME</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Sales Assistant, Support Bot…"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  autoFocus
                  onFocus={e => (e.target.style.borderColor = W.accent)}
                  onBlur={e => (e.target.style.borderColor = W.borderHi)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: W.text2, display: "block", marginBottom: 10, letterSpacing: "0.04em" }}>PRODUCT TYPE</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {PRODUCT_TYPES.map(pt => (
                    <div key={pt.value} onClick={() => setProductType(pt.value as any)} style={{
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      border: `2px solid ${productType === pt.value ? W.accent : W.borderHi}`,
                      background: productType === pt.value ? "rgba(193,127,89,0.07)" : W.surface,
                      transition: "all 0.18s ease",
                    }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{pt.icon}</div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: W.text1, marginBottom: 2 }}>{pt.label}</p>
                      <p style={{ fontSize: 11, color: W.text3 }}>{pt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: W.surface, border: `1px solid ${W.borderHi}`, borderRadius: 11, fontSize: 14, fontWeight: 600, color: W.text2, cursor: "pointer", fontFamily: "inherit" }}>
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!productName.trim()}
                style={{ flex: 2, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: productName.trim() ? W.grad : W.surface, color: productName.trim() ? "#fff" : W.text3, border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: productName.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                Continue <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Integrations ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: W.text1 }}>Integrations</h2>
            <p style={{ fontSize: 13, color: W.text2, marginBottom: 28 }}>
              Enable integrations to enrich your AI responses. These use <strong>mock data</strong> for the demo — toggles affect AI context immediately.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <IntegrationCard label="Shopify" desc="Orders, revenue, inventory, pending shipments" icon="🛒" enabled={shopifyEnabled} onToggle={() => setShopifyEnabled(v => !v)} />
              <IntegrationCard label="CRM" desc="Leads, open tickets, deals, satisfaction scores" icon="📊" enabled={crmEnabled} onToggle={() => setCrmEnabled(v => !v)} />
            </div>

            <p style={{ fontSize: 11, color: W.text3, marginTop: 12, textAlign: "center" }}>You can change these at any time from the dashboard</p>

            {error && (
              <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", fontSize: 13, color: "#b91c1c" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: W.surface, border: `1px solid ${W.borderHi}`, borderRadius: 11, fontSize: 14, fontWeight: 600, color: W.text2, cursor: "pointer", fontFamily: "inherit" }}>
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ flex: 2, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: W.grad, color: "#fff", border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}>
                {submitting
                  ? <><Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Setting up…</>
                  : <><Check size={15} /> Launch Workspace</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: W.text3 }}>
        You can always change these settings later from the admin dashboard
      </p>
    </div>
  );
}
