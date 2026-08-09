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

export type Provider = "FIVESIM" | "GRIZZYSMS";

export const MarketplaceAPI = {
  /*
  =====================================
      MARKETPLACE
  =====================================
  */

  countries(provider: Provider = "FIVESIM") {
    return api.get("/marketplace/countries", {
      params: { provider },
    });
  },

  products(country: string, provider: Provider = "FIVESIM") {
    return api.get(
      `/marketplace/products/${country}`,
      { params: { provider } },
    );
  },

  prices(country: string, provider: Provider = "FIVESIM") {
    return api.get(
      `/marketplace/prices/${country}`,
      { params: { provider } },
    );
  },

  buy(data: {
    provider: Provider;
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
    return api.get("/marketplace/orders");
  },

  order(id: string) {
    return api.get(`/marketplace/orders/${id}`);
  },

  sms(id: string) {
    return api.get(
      `/marketplace/orders/${id}/sms`,
    );
  },

  finish(id: string) {
    return api.post(
      `/marketplace/orders/${id}/finish`,
    );
  },

  cancel(id: string) {
    return api.post(
      `/marketplace/orders/${id}/cancel`,
    );
  },

  ban(id: string) {
    return api.post(
      `/marketplace/orders/${id}/ban`,
    );
  },

  sync(id: string) {
    return api.get(
      `/marketplace/orders/${id}/sync`,
    );
  },
};

export default api;