import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/utils/apiClient";

export function useMessages(slug: string, conversationId: string) {
  return useQuery({
    queryKey: ["messages", slug, conversationId],
    queryFn: () =>
      fetchApi(`/api/projects/${slug}/messages?conversationId=${conversationId}`),
    enabled: !!slug && !!conversationId,
    staleTime: 0,        // Messages are always considered stale — refetch immediately on invalidate
    refetchOnMount: true,
  });
}
