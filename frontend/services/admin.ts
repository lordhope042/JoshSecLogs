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
  const { data } = await api.get("/admin/dashboard");
  return data.data ?? data;
}