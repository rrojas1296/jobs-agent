import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  withCredentials: true,
  timeout: 15000,
  headers: { "X-Requested-With": "jobs-web" },
});
let refreshing: Promise<unknown> | null = null;
export function refreshSession() {
  refreshing ??= api.post("/auth/refresh").finally(() => {
    refreshing = null;
  });
  return refreshing;
}
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError)) return Promise.reject(error);
    const config = error.config as (InternalAxiosRequestConfig & { retried?: boolean }) | undefined;
    const isAuth = config?.url?.match(/\/auth\/(login|register|refresh|logout)/);
    if (error.response?.status === 401 && config && !config.retried && !isAuth) {
      config.retried = true;
      try {
        await refreshSession();
        return await api(config);
      } catch {
        /* Preserve original unauthorized error. */
      }
    }
    return Promise.reject(error);
  },
);
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    if (error.response?.status === 429)
      return "Demasiados intentos. Espera un minuto y vuelve a intentarlo.";
    const message = error.response?.data.message;
    return typeof message === "string"
      ? message
      : "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.";
  }
  return "Ocurrió un error inesperado. Vuelve a intentarlo.";
}
