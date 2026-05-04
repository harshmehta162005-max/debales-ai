import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/utils/apiClient";

/** Derive a short chat title from the user's first message (no API call needed) */
function deriveTitle(userMessage: string): string {
  const cleaned = userMessage.trim().replace(/[?!.,]+$/, "").trim();
  const words = cleaned.split(/\s+/);
  // Take first 5-6 words, capitalize first letter
  const short = words.slice(0, 6).join(" ");
  return short.charAt(0).toUpperCase() + short.slice(1);
}

/** Check if a title looks auto-generated (e.g. "New Chat 11:08") */
function isDefaultTitle(title: string): boolean {
  return /^New Chat/i.test(title);
}

export function useSendMessage(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { conversationId: string; content: string }) =>
      fetchApi(`/api/projects/${slug}/messages`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // Optimistic update: show the user message instantly
    onMutate: async (variables) => {
      const queryKey = ["messages", slug, variables.conversationId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any[] = []) => [
        ...old,
        {
          _id: `optimistic-${Date.now()}`,
          role: "user",
          content: variables.content,
          createdAt: new Date().toISOString(),
          steps: [],
        },
      ]);

      return { previous, queryKey };
    },

    onSuccess: async (_, variables) => {
      const msgQueryKey = ["messages", slug, variables.conversationId];

      // Refetch messages to get both user + assistant messages
      await queryClient.refetchQueries({ queryKey: msgQueryKey });

      // Auto-rename the conversation if it still has a default title
      try {
        const conversations: any[] =
          queryClient.getQueryData(["conversations", slug]) ?? [];
        const conv = conversations.find(
          (c: any) => String(c._id || c.id) === variables.conversationId
        );

        const messages: any[] = queryClient.getQueryData(msgQueryKey) ?? [];
        const isFirst = messages.filter((m) => m.role === "user").length <= 1;

        if (isFirst && (!conv || isDefaultTitle(conv.title ?? ""))) {
          const newTitle = deriveTitle(variables.content);

          // Fire-and-forget PATCH — don't block the UI
          fetchApi(`/api/projects/${slug}/conversations`, {
            method: "PATCH",
            body: JSON.stringify({
              conversationId: variables.conversationId,
              title: newTitle,
            }),
          }).then(() => {
            // Update the conversations list in cache immediately
            queryClient.setQueryData(
              ["conversations", slug],
              (old: any[] = []) =>
                old.map((c: any) =>
                  String(c._id || c.id) === variables.conversationId
                    ? { ...c, title: newTitle }
                    : c
                )
            );
          });
        }
      } catch {
        // Title update is non-critical, ignore errors
      }
    },

    // Rollback optimistic update on error
    onError: (_err, _variables, context: any) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
  });
}
