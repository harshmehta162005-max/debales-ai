import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/utils/apiClient";

export function useProjectStats(slug: string) {
  return useQuery({
    queryKey: ["project-stats", slug],
    queryFn: () => fetchApi(`/api/projects/${slug}/stats`),
    enabled: !!slug,
    refetchInterval: 30000, // refresh every 30s
  });
}
