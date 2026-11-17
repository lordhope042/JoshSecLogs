import api from "@/lib/axios";

/** Clear the server-managed HttpOnly session cookie. */
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    // This is profile display data only; authentication lives in the HttpOnly cookie.
    if (typeof window !== "undefined") localStorage.removeItem("user");
  }
}
