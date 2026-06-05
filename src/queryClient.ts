import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { useSocketStore } from "./store/socketStore";

const notify = (error: unknown) => {
  const anyError = error as any;
  const data = anyError?.response?.data;
  const message =
    (typeof data?.message === "string" && data.message) ||
    (Array.isArray(data?.message) && data.message.join(", ")) ||
    (typeof data?.error === "string" && data.error) ||
    anyError?.message ||
    "Xatolik yuz berdi.";

  useSocketStore.getState().addNotification({
    title: "Xatolik",
    message,
    tone: "danger",
  });
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: notify }),
  mutationCache: new MutationCache({ onError: notify }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false
    }
  }
});
