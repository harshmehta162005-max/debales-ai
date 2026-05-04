import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/utils/apiClient";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchApi("/api/projects")
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: () => fetchApi(`/api/projects/${slug}`),
    enabled: !!slug
  });
}

export function useProductInstances(slug: string) {
  return useQuery({
    queryKey: ["product-instances", slug],
    queryFn: () => fetchApi(`/api/projects/${slug}/product-instances`),
    enabled: !!slug
  });
}

export function useUpdateIntegrations(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ piId, integrations }: { piId: string, integrations: any }) => 
      fetchApi(`/api/projects/${slug}/product-instances/${piId}`, {
        method: "PATCH",
        body: JSON.stringify({ integrations })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-instances", slug] });
    }
  });
}
