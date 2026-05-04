import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/utils/apiClient";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchApi("/api/projects"),
    retry: false,
    staleTime: 0,              // Always treat as stale — never serve cached project data
    refetchOnMount: "always",  // Refetch every time any component using this hook mounts
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

export function useCreateProductInstance(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => fetchApi(`/api/projects/${slug}/product-instances`, {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-instances", slug] });
    }
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
