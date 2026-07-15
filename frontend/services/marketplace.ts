import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const MarketplaceAPI = {
  /*
  =====================================
      MARKETPLACE
  =====================================
  */

  countries() {
    return api.get("/marketplace/countries");
  },

  products(country: string) {
    return api.get(
      `/marketplace/products/${country}`,
    );
  },

  prices(country: string) {
    return api.get(
      `/marketplace/prices/${country}`,
    );
  },

  buy(data: {
    country: string;
    operator: string;
    product: string;
  }) {
    return api.post(
      "/marketplace/buy",
      data,
    );
  },

  /*
  =====================================
      ORDERS
  =====================================
  */

  orders() {
    return api.get("/orders");
  },

  order(id: string) {
    return api.get(`/orders/${id}`);
  },

  sms(id: string) {
    return api.get(
      `/orders/${id}/messages`,
    );
  },

  finish(id: string) {
    return api.post(
      `/orders/${id}/finish`,
    );
  },

  cancel(id: string) {
    return api.post(
      `/orders/${id}/cancel`,
    );
  },

  ban(id: string) {
    return api.post(
      `/orders/${id}/ban`,
    );
  },
};

export default api;