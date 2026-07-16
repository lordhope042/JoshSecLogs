import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api/v1",
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach JWT automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      switch (error.response?.status) {
        case 401:
          localStorage.removeItem("access_token");
          window.location.href = "/login";
          break;

        case 403:
          console.error("Forbidden");
          break;

        case 500:
          console.error("Server Error");
          break;

        default:
          break;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
