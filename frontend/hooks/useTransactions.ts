"use client";

import { useEffect, useState } from "react";
import { WalletAPI } from "@/services/wallet";
import { WalletTransaction } from "@/types/wallet";

export function useTransactions() {
  const [transactions, setTransactions] =
    useState<WalletTransaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function refresh() {
    try {
      setLoading(true);

      const res =
        await WalletAPI.transactions();

      setTransactions(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return {
    transactions,
    loading,
    refresh,
  };
}