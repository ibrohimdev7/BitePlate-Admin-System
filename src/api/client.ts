import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useSocketStore } from "../store/socketStore";

const getErrorMessage = (error: any) => {
  const data = error?.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (Array.isArray(data?.message)) return data.message.join(", ");
  if (typeof data?.error === "string") return data.error;
  return error?.message ?? "API xatolik yuz berdi.";
};

const notifyApiError = (error: any) => {
  if (error?.config?.__skipToast) return;
  useSocketStore.getState().addNotification({
    title: "API xatolik",
    message: getErrorMessage(error),
    tone: "danger",
  });
};

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:3001/api",
  timeout: 12000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      refreshRequest ??= useAuthStore
        .getState()
        .refreshToken()
        .then(() => useAuthStore.getState().accessToken)
        .finally(() => {
          refreshRequest = null;
        });

      const token = await refreshRequest;
      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }
    }
    // If we reach here and it's an auth failure, ensure the user is logged out and
    // redirect to login (unless the request was to an auth endpoint).
    try {
      const status = error.response?.status;
      const url = originalRequest?.url ?? "";
      const isAuthEndpoint = /auth/.test(url);
      if (status === 401 && !isAuthEndpoint) {
        notifyApiError(error);
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } catch (e) {
      // ignore
    }

    if (error.response?.status !== 401) notifyApiError(error);
    return Promise.reject(error);
  },
);
