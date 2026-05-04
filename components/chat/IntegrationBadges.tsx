"use client";
import { useProductInstances } from "@/hooks/useProjects";

interface IntegrationBadgesProps {
  slug: string;
  /** optional: pass conversation's productInstanceId to scope to the right PI */
  productInstanceId?: string;
}

export default function IntegrationBadges({ slug, productInstanceId }: IntegrationBadgesProps) {
  const { data: instances } = useProductInstances(slug);

  // Resolve the right product instance
  const pi = productInstanceId
    ? instances?.find((i: any) => (i._id ?? i.id) === productInstanceId)
    : instances?.[0];

  if (!pi) return null;

  const shopify = !!pi.integrations?.shopify?.enabled;
  const crm = !!pi.integrations?.crm?.enabled;

  // Don't render the row if no integrations exist at all
  if (!shopify && !crm) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 14px", fontSize: 11, color: "var(--text-3)",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-3)", flexShrink: 0 }} />
        No integrations active — AI responds without external context
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "6px 14px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-surface)",
      flexWrap: "wrap",
    }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        AI Context:
      </span>

      {shopify && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
          color: "#86efac",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
          🛒 Shopify Active
        </span>
      )}

      {crm && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
          background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
          color: "#c4b5fd",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", flexShrink: 0 }} />
          📊 CRM Active
        </span>
      )}

      <span style={{ fontSize: 10, color: "var(--text-3)", marginLeft: "auto" }}>
        Toggles on dashboard affect AI responses instantly
      </span>
    </div>
  );
}
