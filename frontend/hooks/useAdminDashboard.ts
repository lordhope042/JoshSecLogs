"use client";

import { useEffect, useState } from "react";

import { AdminAPI } from "../services/admin";

export function useAdminDashboard() {
  const [stats, setStats] = useState<any>();

  const [loading, setLoading] =
    useState(true);

  async function load() {
    try {
      setLoading(true);

      const { data } =
        await AdminAPI.dashboard();

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