"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Plus, Layers, Settings, ArrowRight } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useProjects } from "@/hooks/useProjects";

export default function WorkspacesPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { data: projects, isLoading: projectsLoading, isFetching } = useProjects();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/login");
  }, [isSignedIn, isLoaded, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    setSyncing(true);
    fetch("/api/auth/sync", { method: "POST" })
      .catch(() => {})
      .finally(() => setSyncing(false));
  }, [isSignedIn]);

  // Check for 0 projects
  useEffect(() => {
    if (isFetching || projectsLoading || syncing) return;
    if (projects && projects.length === 0) {
      router.replace("/setup");
    }
  }, [projects, projectsLoading, isFetching, syncing, router]);

  if (!isLoaded || projectsLoading || syncing || (projects && projects.length === 0)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 58, background: "rgba(250,250,248,0.92)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #C17F59, #8B7355)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#1A1A1A" }}>Debales AI</span>
        </div>
        <UserButton />
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 800 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "var(--text-1)" }}>Select a Workspace</h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", marginBottom: 40 }}>Choose a workspace to continue, or create a new one.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            
            {/* Existing Workspaces */}
            {projects?.map((p: any) => {
              const member = p.members?.find((m: any) => m.userId === user?.id);
              const role = member?.role || "member";
              const isAdmin = role === "admin";

              return (
                <Link key={p._id} href={`/projects/${p.slug}/chat`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16,
                    padding: "24px 20px", display: "flex", flexDirection: "column", gap: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.2s", cursor: "pointer",
                    height: "100%",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hi)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "none";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(193,127,89,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Layers size={20} color="var(--blue)" />
                      </div>
                      <div style={{
                        padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                        background: isAdmin ? "rgba(139,115,85,0.1)" : "rgba(0,0,0,0.05)",
                        color: isAdmin ? "#8B7355" : "var(--text-3)",
                      }}>
                        {role}
                      </div>
                    </div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{p.name}</h2>
                      <p style={{ fontSize: 13, color: "var(--text-3)" }}>{p.slug}</p>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Create New Workspace Card */}
            <Link href="/setup" style={{ textDecoration: "none" }}>
              <div style={{
                background: "transparent", border: "2px dashed var(--border-hi)", borderRadius: 16,
                padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
                transition: "all 0.2s", cursor: "pointer", height: "100%", minHeight: 160
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hi)";
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={20} color="var(--text-2)" />
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Create Workspace</h2>
              </div>
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}
