"use client";
import { use } from "react";
import { useProject } from "@/hooks/useProjects";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { isLoading } = useProject(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--border-normal)", borderTopColor: "var(--accent-blue)" }} />
      </div>
    );
  }

  return <>{children}</>;
}
