/**
 * Shared Axios instance for the JoshSecLogs frontend.
 *
 * Every service module under `services/*` imports `api` from here. It:
 *   1. Reads `NEXT_PUBLIC_API_URL` (falls back to the local dev server).
 *   2. Attaches the JWT from `localStorage` to every request.
 *   3. Unwraps `response.data` so callers receive the backend JSON body
 *      directly (services can then do `const { data } = await api.get(...)`).
 *   4. Boots the user to `/login` on a 401 (token expired / invalid).
 */
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// ---- Request: attach JWT ----
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers = config.headers ?? ({} as any);
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---- Response: unwrap `.data`, handle 401 ----
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      // Avoid redirect loops if we're already on /login.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
