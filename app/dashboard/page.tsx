"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  MessageSquare, Bot, Activity, Layers, ShieldCheck,
  RefreshCw, TrendingUp, ChevronRight, Database,
} from "lucide-react";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { useProjects, useProductInstances, useUpdateIntegrations } from "@/hooks/useProjects";
import { useProjectStats } from "@/hooks/useProjectStats";
import { useCurrentUser } from "@/hooks/useAuth";
import Header from "@/components/ui/Header";

/* ── helpers ──────────────────────────────────────────────────────────────── */
function Sk({ w = "100%", h = 16 }: { w?: string | number; h?: number }) {
  return (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: 6 }} />
  );
}

/* ── Custom Recharts Tooltip ──────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a2235", border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 8, padding: "8px 14px", boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
      fontSize: 12, color: "#f1f5f9",
    }}>
      <p style={{ color: "#94a3b8", marginBottom: 4 }}>{label}</p>
      <p style={{ fontWeight: 700, color: "#93c5fd" }}>{payload[0].value} responses</p>
    </div>
  );
}

/* ── Toggle Switch ────────────────────────────────────────────────────────── */
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div className={`toggle-root ${on ? "on" : "off"}`} onClick={onClick}
      role="switch" aria-checked={on} tabIndex={0}
      onKeyDown={e => e.key === " " && onClick()}>
      <div className="toggle-thumb" />
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────────────────────────────── */
function StatCard({
  label, value, icon, color, sub, loading,
}: {
  label: string; value: string | number; icon: React.ReactNode;
  color: string; sub?: string; loading?: boolean;
}) {
  return (
    <div className="card card-lift fade-up" style={{ padding: "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>{label}</p>
        <div style={{
          width: 36, height: 36, borderRadius: 9, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: `${color}18`, color,
        }}>
          {icon}
        </div>
      </div>
      {loading
        ? <Sk w={80} h={32} />
        : <p style={{ fontSize: 30, fontWeight: 800, color: "var(--text-1)", lineHeight: 1 }}>{value}</p>
      }
      {sub && !loading && (
        <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>{sub}</p>
      )}
    </div>
  );
}

/* ── Widget (config-driven) ───────────────────────────────────────────────── */
const WEEK = [
  { day: "Mon", v: 3 }, { day: "Tue", v: 5 }, { day: "Wed", v: 2 },
  { day: "Thu", v: 8 }, { day: "Fri", v: 6 }, { day: "Sat", v: 1 }, { day: "Sun", v: 4 },
];

function Widget({ widget, stats, loading }: { widget: any; stats: any; loading: boolean }) {
  const val = stats?.[widget.valueKey];

  return (
    <div className="card fade-up" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>{widget.label}</p>
        {widget.type === "stat"   && <Activity size={15} color="var(--blue)" />}
        {widget.type === "chart"  && <TrendingUp size={15} color="var(--violet)" />}
        {widget.type === "list"   && <MessageSquare size={15} color="var(--cyan)" />}
        {widget.type === "table"  && <Database size={15} color="var(--green)" />}
      </div>

      {/* body */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Sk h={28} w={90} /><Sk h={12} w={60} />
        </div>
      ) : widget.type === "stat" ? (
        <div>
          <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)" }}>{val ?? "—"}</p>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>from {widget.valueKey}</p>
        </div>

      ) : widget.type === "chart" ? (
        <div style={{ height: 110, marginTop: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEK} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#4b5670" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#4b5670" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(59,130,246,0.07)", radius: 4 }} />
              <Bar dataKey="v" radius={[5, 5, 0, 0]}>
                {WEEK.map((_, i) => (
                  <Cell key={i} fill={`url(#barGrad-${i % 2})`} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGrad-0" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="barGrad-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

      ) : widget.type === "list" ? (
        <div style={{
          maxHeight: 220,
          overflowY: "auto",
          marginTop: 2,
          paddingRight: 4,          // breathing room so scrollbar doesn't overlap text
          /* custom scrollbar is handled globally in globals.css */
        }}>
          {(val ?? []).length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>No conversations yet</p>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none", margin: 0, padding: 0 }}>
              {(val ?? []).map((c: any, i: number) => (
                <li key={c.id ?? i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 8px", borderRadius: 7,
                  transition: "background 0.15s",
                  cursor: "default",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <MessageSquare size={12} color="var(--cyan)" style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: 13, color: "var(--text-2)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {c.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      ) : widget.type === "table" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
          {(val ?? []).length === 0 && (
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>No integrations</p>
          )}
          {(val ?? []).map((row: any, i: number) => (
            <div key={i} style={{
              background: "var(--bg-surface)", borderRadius: 8, padding: "10px 12px",
              border: "1px solid var(--border)",
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>{row.name}</p>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "Shopify", on: row.shopify },
                  { label: "CRM", on: row.crm },
                ].map(({ label, on }) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: on ? "var(--green)" : "var(--text-3)",
                      display: "inline-block", flexShrink: 0,
                    }} />
                    <span style={{ color: on ? "#86efac" : "var(--text-3)" }}>{label}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [activeSlug, setActiveSlug] = useState("");

  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  useEffect(() => {
    if (projects?.[0]?.slug && !activeSlug) setActiveSlug(projects[0].slug);
  }, [projects, activeSlug]);

  const { data: config, isLoading: configLoading } = useDashboardConfig(activeSlug);
  const { data: instances, isLoading: instLoading } = useProductInstances(activeSlug);
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useProjectStats(activeSlug);
  const updateIntegrations = useUpdateIntegrations(activeSlug);

  const handleToggle = (piId: string, current: any, type: "shopify" | "crm") => {
    updateIntegrations.mutate({
      piId,
      integrations: {
        ...current,
        [type]: { ...current?.[type], enabled: !current?.[type]?.enabled },
      },
    }, { onSuccess: () => refetchStats() });
  };

  /* ── loading / auth guard ── */
  if (userLoading || projectsLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  /* ── render ── */
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Header />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Admin Dashboard</h1>
            <p style={{ fontSize: 13, color: "var(--text-2)" }}>
              Layout driven by MongoDB •&nbsp;
              <span style={{ color: "var(--blue)", cursor: "pointer" }}
                onClick={() => window.open("https://www.mongodb.com/products/compass", "_blank")}>
                Edit DashboardConfig document to change this UI
              </span>
            </p>
          </div>

          {/* Project switcher tabs */}
          {projects && projects.length > 0 && (
            <div style={{
              display: "flex", gap: 6, padding: 4,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 12,
            }}>
              {projects.map((p: any) => (
                <button key={p.slug} onClick={() => setActiveSlug(p.slug)}
                  style={{
                    padding: "7px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", border: "none", transition: "all 0.18s",
                    background: activeSlug === p.slug ? "var(--grad)" : "transparent",
                    color: activeSlug === p.slug ? "#fff" : "var(--text-2)",
                  }}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── KPI cards row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard label="Conversations" value={stats?.total_conversations ?? "—"} icon={<MessageSquare size={16} />} color="var(--blue)" sub="All time" loading={statsLoading} />
          <StatCard label="AI Responses" value={stats?.ai_responses ?? "—"} icon={<Bot size={16} />} color="var(--violet)" sub="Generated by Gemini" loading={statsLoading} />
          <StatCard label="Total Messages" value={stats?.total_messages ?? "—"} icon={<Activity size={16} />} color="var(--cyan)" sub="Across all chats" loading={statsLoading} />
          <StatCard label="Active Integrations" value={stats?.active_integrations ?? "—"} icon={<Layers size={16} />} color="var(--green)" sub="Shopify + CRM" loading={statsLoading} />
        </div>

        {/* ── Product Integrations ── */}
        <div className="card" style={{ padding: 24, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={18} color="var(--blue)" />
              <p style={{ fontSize: 15, fontWeight: 700 }}>Product Integrations</p>
            </div>
            <span className="badge badge-blue" style={{ fontSize: 11 }}>
              Live — changes affect AI chat responses instantly
            </span>
          </div>

          {instLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2].map(i => <Sk key={i} h={56} />)}
            </div>
          ) : !instances?.length ? (
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>No product instances found</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {instances.map((pi: any) => (
                <div key={pi._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: 12,
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "14px 18px",
                }}>
                  {/* left: name + type */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, background: "var(--bg-hover)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid var(--border-hi)",
                    }}>
                      <Layers size={16} color="var(--blue)" />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{pi.name}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{pi.productType}</p>
                    </div>
                  </div>

                  {/* right: toggles */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    {(["shopify", "crm"] as const).map(type => {
                      const enabled = !!pi.integrations?.[type]?.enabled;
                      return (
                        <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                          onClick={() => handleToggle(pi._id, pi.integrations, type)}>
                          <Toggle on={enabled} onClick={() => {}} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: enabled ? "var(--text-1)" : "var(--text-3)", textTransform: "capitalize", userSelect: "none" }}>
                            {type}
                          </span>
                          {enabled && (
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Config-driven sections ── */}
        {configLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {[1, 2].map(i => (
              <div key={i}>
                <Sk w={160} h={20} /><br />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                  <Sk h={140} /><Sk h={140} />
                </div>
              </div>
            ))}
          </div>
        ) : !config ? (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <RefreshCw size={28} color="var(--text-3)" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>No dashboard config for <b>{activeSlug}</b></p>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>Run <code>npm run seed</code> to create config</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {config.layout?.map((section: any) => (
              <div key={section.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>{section.title}</h2>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                  {section.widgets?.map((w: any, idx: number) => (
                    <Widget key={idx} widget={w} stats={stats} loading={statsLoading} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Quick nav to Chat ── */}
        {projects && projects.length > 0 && (
          <div className="card" style={{ padding: 24, marginTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Go to AI Chat</p>
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>
                Start a conversation with the Gemini-powered assistant
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {projects.map((p: any) => (
                <Link key={p.slug} href={`/projects/${p.slug}/chat`}
                  className="btn btn-primary" style={{ fontSize: 13, padding: "9px 18px" }}>
                  {p.name} Chat <ChevronRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
