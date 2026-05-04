import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/utils/apiClient";

export function useDashboardConfig(slug: string) {
  return useQuery({
    queryKey: ["dashboard-config", slug],
    queryFn: () => fetchApi(`/api/dashboard/config?projectSlug=${slug}`),
    enabled: !!slug
  });
}

export function useUpdateDashboardConfig(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (layout: any) => 
      fetchApi(`/api/dashboard/config?projectSlug=${slug}`, {
        method: "PATCH",
        body: JSON.stringify({ layout })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-config", slug] });
    }
  });
}
