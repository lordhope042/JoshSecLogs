"use client";

import { useEffect, useState } from "react";

import { getAdminDashboard, AdminDashboardStats } from "../services/admin";

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats>();
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return {
    stats,
    loading,
    refresh: load,
  };
}