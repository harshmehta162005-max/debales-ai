"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Plus, Layers, Loader2, ArrowRight, X, Building2, Package, Plug, Check, ChevronRight, ArrowLeft } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useProjects } from "@/hooks/useProjects";

/* ── Constants & Helpers ── */
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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: W.surface,
  border: `1px solid ${W.borderHi}`,
  borderRadius: 9,
  color: W.text1, fontFamily: "inherit", fontSize: 14,
  outline: "none", transition: "border 0.2s"
};

/* ── Components ── */
function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
      {STEPS.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        const Icon   = s.icon;
        return (
          <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? W.accent : active ? W.card : W.surface,
                border: `2px solid ${done || active ? W.accent : W.borderHi}`,
                transition: "all 0.3s ease",
                boxShadow: active ? `0 0 0 4px rgba(193,127,89,0.15)` : "none",
              }}>
                {done
                  ? <Check size={16} color="#fff" />
                  : <Icon size={16} color={active ? W.accent : W.text3} />
                }
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: active ? W.text1 : done ? W.accent : W.text3, letterSpacing: "0.04em" }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 40, height: 2, margin: "0 6px", marginBottom: 20, background: done ? W.accent : W.border, transition: "background 0.3s ease" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function IntegrationCard({ label, desc, icon, enabled, onToggle }: any) {
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
        border: `1px solid ${enabled ? "rgba(193,127,89,0.3)" : W.border}`, flexShrink: 0,
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

/* ── Main Page ── */
export default function WorkspacesPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { data: projects, isLoading: projectsLoading, isFetching, refetch } = useProjects();
  const [syncing, setSyncing] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<"e-commerce"|"support"|"sales"|"general">("general");
  const [shopifyEnabled, setShopifyEnabled] = useState(false);
  const [crmEnabled, setCrmEnabled] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isSignedIn, isLoaded, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    setSyncing(true);
    fetch("/api/auth/sync", { method: "POST" })
      .then(() => refetch())
      .catch(() => {})
      .finally(() => setSyncing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  // If they have 0 projects and aren't syncing/loading, force open the modal
  useEffect(() => {
    if (isFetching || projectsLoading || syncing || isModalOpen) return;
    // Check if they only have incomplete projects
    const hasValidProject = projects?.some((p: any) => p.setupComplete);
    if (!hasValidProject) {
      setIsModalOpen(true);
    }
  }, [projects, projectsLoading, isFetching, syncing, isModalOpen]);

  useEffect(() => {
    if (!slugManuallyEdited && companyName) setWorkspaceSlug(slugify(companyName));
  }, [companyName, slugManuallyEdited]);

  const handleCreate = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          slug: workspaceSlug,
          productName,
          productType,
          shopifyEnabled,
          crmEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create workspace");

      await refetch();
      setIsModalOpen(false);
      // Reset state for next time
      setStep(0); setCompanyName(""); setWorkspaceSlug(""); setProductName("");
      
      router.push(`/projects/${data.slug}/chat`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (!isLoaded || projectsLoading || syncing) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: W.bg }}>
        <div className="spinner" />
      </div>
    );
  }

  const hasValidProject = projects?.some((p: any) => p.setupComplete);

  return (
    <div style={{ minHeight: "100vh", background: W.bg, display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 58, background: "rgba(250,250,248,0.92)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: W.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: W.text1 }}>Debales AI</span>
        </div>
        <UserButton />
      </header>

      <main style={{ flex: 1, padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 800 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: W.text1 }}>Select a Workspace</h1>
          <p style={{ fontSize: 15, color: W.text2, marginBottom: 40 }}>Choose a workspace to continue, or create a new one.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {projects?.filter((p: any) => p.setupComplete).map((p: any) => {
              const member = p.members?.find((m: any) => m.userId === user?.id);
              const role = member?.role || "member";
              const isAdmin = role === "admin";
              return (
                <Link key={p._id} href={`/projects/${p.slug}/chat`} style={{ textDecoration: "none" }}>
                  <div style={{ background: W.card, border: `1px solid ${W.border}`, borderRadius: 16, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.2s", height: "100%" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = W.borderHi; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = W.border; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(193,127,89,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Layers size={20} color="var(--blue)" />
                      </div>
                      <div style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase", background: isAdmin ? "rgba(139,115,85,0.1)" : "rgba(0,0,0,0.05)", color: isAdmin ? "#8B7355" : W.text3 }}>{role}</div>
                    </div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 700, color: W.text1, marginBottom: 4 }}>{p.name}</h2>
                      <p style={{ fontSize: 13, color: W.text3 }}>{p.slug}</p>
                    </div>
                  </div>
                </Link>
              );
            })}

            <div onClick={() => setIsModalOpen(true)} style={{ background: "transparent", border: `2px dashed ${W.borderHi}`, borderRadius: 16, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, transition: "all 0.2s", cursor: "pointer", height: "100%", minHeight: 160 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = W.hover; (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = W.borderHi; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: W.card, border: `1px solid ${W.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={20} color={W.text2} />
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: W.text1 }}>Create Workspace</h2>
            </div>
          </div>
        </div>
      </main>

      {/* ── 3-Step Setup Modal ── */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 24, animation: "fadeIn 0.2s ease" }}>
          <div style={{ background: W.card, width: "100%", maxWidth: 480, borderRadius: 20, padding: 32, position: "relative", boxShadow: "0 24px 48px rgba(0,0,0,0.15)", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            
            {hasValidProject && (
              <button onClick={() => setIsModalOpen(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%" }}>
                <X size={20} color={W.text3} />
              </button>
            )}

            <StepBar current={step} />

            {/* STEP 0: COMPANY */}
            {step === 0 && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: W.text1 }}>Your company</h2>
                <p style={{ fontSize: 13, color: W.text2, marginBottom: 24 }}>Tell us about your organization</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: W.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>COMPANY NAME</label>
                    <input style={inputStyle} placeholder="e.g. Acme Corp, Nexus Labs…" value={companyName} onChange={e => setCompanyName(e.target.value)} autoFocus onFocus={e => (e.target.style.borderColor = W.accent)} onBlur={e => (e.target.style.borderColor = W.borderHi)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: W.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>WORKSPACE URL</label>
                    <div style={{ display: "flex", alignItems: "center", background: W.surface, border: `1px solid ${W.borderHi}`, borderRadius: 9, overflow: "hidden" }}>
                      <span style={{ padding: "11px 12px", fontSize: 13, color: W.text3, borderRight: `1px solid ${W.borderHi}`, flexShrink: 0, userSelect: "none" }}>app/</span>
                      <input style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "11px 14px", fontSize: 14, color: W.text1 }} placeholder="my-company" value={workspaceSlug} onChange={e => { setSlugManuallyEdited(true); setWorkspaceSlug(slugify(e.target.value)); }} />
                    </div>
                  </div>
                </div>

                <button
                  style={{ width: "100%", marginTop: 28, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: companyName.trim() && workspaceSlug.trim() ? W.grad : W.surface, color: companyName.trim() && workspaceSlug.trim() ? "#fff" : W.text3, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: companyName.trim() && workspaceSlug.trim() ? "pointer" : "not-allowed", transition: "all 0.2s" }}
                  disabled={!companyName.trim() || !workspaceSlug.trim()} onClick={() => setStep(1)}>
                  Continue <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* STEP 1: PRODUCT */}
            {step === 1 && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: W.text1 }}>Your AI product</h2>
                <p style={{ fontSize: 13, color: W.text2, marginBottom: 24 }}>What will your AI assistant be doing?</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: W.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>PRODUCT NAME</label>
                    <input style={inputStyle} placeholder="e.g. Sales Assistant, Support Bot…" value={productName} onChange={e => setProductName(e.target.value)} autoFocus onFocus={e => (e.target.style.borderColor = W.accent)} onBlur={e => (e.target.style.borderColor = W.borderHi)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: W.text2, display: "block", marginBottom: 10, letterSpacing: "0.04em" }}>PRODUCT TYPE</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {PRODUCT_TYPES.map(pt => (
                        <div key={pt.value} onClick={() => setProductType(pt.value as any)} style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer", border: `2px solid ${productType === pt.value ? W.accent : W.borderHi}`, background: productType === pt.value ? "rgba(193,127,89,0.07)" : W.surface, transition: "all 0.18s ease" }}>
                          <div style={{ fontSize: 18, marginBottom: 4 }}>{pt.icon}</div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: W.text1, marginBottom: 2 }}>{pt.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                  <button onClick={() => setStep(0)} style={{ flex: 1, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: W.surface, border: `1px solid ${W.borderHi}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: W.text2, cursor: "pointer" }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button onClick={() => setStep(2)} disabled={!productName.trim()} style={{ flex: 2, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: productName.trim() ? W.grad : W.surface, color: productName.trim() ? "#fff" : W.text3, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: productName.trim() ? "pointer" : "not-allowed" }}>
                    Continue <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: INTEGRATIONS */}
            {step === 2 && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: W.text1 }}>Integrations</h2>
                <p style={{ fontSize: 13, color: W.text2, marginBottom: 24 }}>Enable integrations to enrich your AI responses.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <IntegrationCard label="Shopify" desc="Orders, revenue, inventory" icon="🛒" enabled={shopifyEnabled} onToggle={() => setShopifyEnabled(v => !v)} />
                  <IntegrationCard label="CRM" desc="Leads, open tickets, deals" icon="📊" enabled={crmEnabled} onToggle={() => setCrmEnabled(v => !v)} />
                </div>

                {error && <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", fontSize: 13, color: "#b91c1c" }}>{error}</div>}

                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: W.surface, border: `1px solid ${W.borderHi}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: W.text2, cursor: "pointer" }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button onClick={handleCreate} disabled={submitting} style={{ flex: 2, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: W.grad, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? <><Loader2 size={15} className="spinner" /> Creating…</> : <><Check size={15} /> Launch Workspace</>}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />
    </div>
  );
}
