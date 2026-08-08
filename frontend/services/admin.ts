import api from "@/lib/axios";

export interface AdminDashboardStats {
  users: number;
  walletBalance: number;
  orders: number;
  activeOrders: number;
  revenue: number;
  payments: number;
  socialLogs: number;
  availableLogs: number;
}

export async function getAdminDashboard(): Promise<AdminDashboardStats> {
  // NOTE: the shared axios instance's response interceptor already
  // unwraps `response.data`, so `api.get(...)` resolves directly to the
  // backend JSON body — { users, walletBalance, orders, ... } — not
  // `{ data: {...} }`. Do not destructure `.data` off of it again.
  const stats = await api.get("/admin/dashboard");
  return stats as unknown as AdminDashboardStats;
}