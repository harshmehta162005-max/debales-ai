"use client";
import { use, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { PlusCircle, MessageSquare, LayoutDashboard, Loader2, Bot } from "lucide-react";
import { useConversations, useCreateConversation } from "@/hooks/useConversations";
import { useProductInstances } from "@/hooks/useProjects";
import { useCurrentUser } from "@/hooks/useAuth";
import Header from "@/components/ui/Header";

export default function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  const { data: conversations, isLoading: convsLoading } = useConversations(slug);
  const { data: instances } = useProductInstances(slug);
  const createConv = useCreateConversation(slug);

  const handleNew = async () => {
    let pi = instances?.[0];

    // If instances not loaded yet, fetch directly
    if (!pi) {
      try {
        const res = await fetch(`/api/projects/${slug}/product-instances`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          pi = data?.[0];
        }
      } catch { /* ignore */ }
    }

    if (!pi) {
      alert("No product instance found. Please check your login session and try again.");
      return;
    }

    const piId = pi._id ?? pi.id;
    createConv.mutate(
      {
        productInstanceId: piId,
        title: `New Chat ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      },
      {
        onSuccess: (data: any) => {
          const id = data._id ?? data.id;
          if (id) router.push(`/projects/${slug}/chat/${id}`);
        },
      }
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      <Header />

      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 58px)" }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: 260, flexShrink: 0, display: "flex", flexDirection: "column",
          background: "var(--bg-surface)", borderRight: "1px solid var(--border)",
          overflowY: "auto",
        }}>
          {/* Project label + new chat */}
          <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Bot size={15} color="var(--blue)" />
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {slug}
              </p>
            </div>
            <button
              onClick={handleNew}
              disabled={createConv.isPending}
              className="btn btn-primary"
              style={{ width: "100%", fontSize: 13, padding: "9px 12px" }}>
              {createConv.isPending
                ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating…</>
                : <><PlusCircle size={14} /> New Chat</>}
            </button>
          </div>

          {/* Conversations list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
            {convsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 4 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
              </div>
            ) : !conversations?.length ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <MessageSquare size={28} color="var(--text-3)" style={{ margin: "0 auto 8px" }} />
                <p style={{ fontSize: 12, color: "var(--text-3)" }}>No conversations yet</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Click New Chat to start</p>
              </div>
            ) : (
              conversations.map((c: any) => {
                const active = pathname.includes(c._id);
                return (
                  <Link key={c._id} href={`/projects/${slug}/chat/${c._id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "9px 12px", borderRadius: 9, marginBottom: 2,
                      textDecoration: "none", transition: "all 0.15s",
                      background: active ? "rgba(59,130,246,0.13)" : "transparent",
                      color: active ? "#93c5fd" : "var(--text-2)",
                      border: `1px solid ${active ? "rgba(59,130,246,0.3)" : "transparent"}`,
                      cursor: "pointer",
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
                    <MessageSquare size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </span>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)" }}>
            <Link href="/dashboard"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px", borderRadius: 9, textDecoration: "none",
                color: "var(--text-3)", fontSize: 13, transition: "all 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
              }}>
              <LayoutDashboard size={14} />
              Back to Dashboard
            </Link>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
