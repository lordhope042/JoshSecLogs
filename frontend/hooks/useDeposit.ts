"use client";

import { useState, useCallback } from "react";
import { PaymentsAPI, PocketFiBank, VirtualAccount } from "@/services/payments";

export function useDeposit() {
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  /*
  =====================================
      LOAD EXISTING VIRTUAL ACCOUNTS
  =====================================
  */
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);

      const data = await PaymentsAPI.listVirtualAccounts();

      setAccounts(Array.isArray(data) ? data : []);

      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  =====================================
      CREATE A NEW VIRTUAL ACCOUNT
      (or fetch the existing one for that bank — the backend is
      idempotent per user+bank)
  =====================================
  */
  const createAccount = useCallback(
    async (bank: PocketFiBank, phone: string) => {
      try {
        setCreating(true);

        const account = await PaymentsAPI.createVirtualAccount(bank, phone);

        setAccounts((prev) => {
          const withoutThisBank = prev.filter((a) => a.bank !== bank);
          return [...withoutThisBank, account as unknown as VirtualAccount];
        });

        return account;
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  return {
    accounts,
    loading,
    creating,
    loadAccounts,
    createAccount,
  };
}
