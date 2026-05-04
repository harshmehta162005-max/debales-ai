import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/utils/apiClient";

export function useConversations(slug: string) {
  return useQuery({
    queryKey: ["conversations", slug],
    queryFn: () => fetchApi(`/api/projects/${slug}/conversations`),
    enabled: !!slug
  });
}

export function useCreateConversation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { productInstanceId: string, title: string }) => 
      fetchApi(`/api/projects/${slug}/conversations`, {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", slug] });
    }
  });
}
