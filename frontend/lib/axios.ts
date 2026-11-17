/**
 * Shared Axios instance for the JoshSecLogs frontend.
 *
 * Every service module under `services/*` imports `api` from here. It:
 *   1. Reads `NEXT_PUBLIC_API_URL` (falls back to the local dev server).
 *   2. Sends the server-managed HttpOnly session cookie.
 *   3. Unwraps `response.data` so callers receive the backend JSON body
 *      directly (services can then do `const { data } = await api.get(...)`).
 *   4. Boots the user to `/login` on a 401 (token expired / invalid).
 */
import axios, { AxiosError, AxiosResponse } from "axios";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
  withCredentials: true,
});

// ---- Response: unwrap `.data`, handle 401 ----
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Avoid redirect loops if we're already on /login.
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
