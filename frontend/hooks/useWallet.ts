"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { WalletAPI } from "@/services/wallet";
import { PaymentsAPI } from "@/services/payments";

import type {
  Wallet,
  WalletTransaction,
} from "@/types/wallet";

export function useWallet() {
  /*
  =====================================
  STATE
  =====================================
  */

  const [wallet, setWallet] =
    useState<Wallet | null>(null);

  const [balance, setBalance] =
    useState(0);

  const [transactions, setTransactions] =
    useState<WalletTransaction[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [funding, setFunding] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  /*
  =====================================
  LOAD WALLET
  =====================================
  */

  const loadWallet = useCallback(
    async () => {
      try {
        const response =
          await WalletAPI.balance();

        const walletData =
          response.data?.data ??
          response.data;

        setWallet(walletData);

        setBalance(
          Number(
            walletData?.balance ?? 0,
          ),
        );

        return walletData;
      } catch (error) {
        console.error(
          "Failed to load wallet:",
          error,
        );

        setWallet(null);
        setBalance(0);

        return null;
      }
    },
    [],
  );

  /*
  =====================================
  LOAD BALANCE
  =====================================
  */

  const loadBalance =
    useCallback(async () => {
      try {
        const response =
          await WalletAPI.balance();

        const walletData =
          response.data?.data ??
          response.data;

        const walletBalance =
          Number(
            walletData?.balance ?? 0,
          );

        setBalance(walletBalance);

        return walletBalance;
      } catch (error) {
        console.error(
          "Failed to load balance:",
          error,
        );

        setBalance(0);

        return 0;
      }
    }, []);

  /*
  =====================================
  LOAD TRANSACTIONS
  =====================================
  */

  const loadTransactions =
    useCallback(async () => {
      try {
        const response =
          await WalletAPI.transactions();

        const list =
          Array.isArray(
            response.data,
          )
            ? response.data
            : response.data
                ?.transactions ??
              response.data?.data ??
              [];

        setTransactions(list);

        return list;
      } catch (error) {
        console.error(
          "Failed to load transactions:",
          error,
        );

        setTransactions([]);

        return [];
      }
    }, []);

  /*
  =====================================
  LOAD EVERYTHING
  =====================================
  */

  const load = useCallback(
    async () => {
      try {
        setLoading(true);

        await Promise.all([
          loadWallet(),
          loadTransactions(),
        ]);
      } finally {
        setLoading(false);
      }
    },
    [
      loadWallet,
      loadTransactions,
    ],
  );

  /*
  =====================================
  LOAD SINGLE TRANSACTION
  =====================================
  */

  const loadTransaction =
    useCallback(
      async (
        reference: string,
      ) => {
        const response =
          await WalletAPI.transaction(
            reference,
          );

        return (
          response.data?.data ??
          response.data
        );
      },
      [],
    );

  /*
  =====================================
  INITIALIZE DEPOSIT
  =====================================
  */

  const initializeDeposit =
    useCallback(
      async (
        amount: number,
      ) => {
        try {
          setFunding(true);

          const response =
            await PaymentsAPI.initialize(
              amount,
            );

          return (
            response.data?.data ??
            response.data
          );
        } finally {
          setFunding(false);
        }
      },
      [],
    );

  /*
  =====================================
  VERIFY PAYMENT
  =====================================
  */

  const verifyDeposit =
    useCallback(
      async (
        reference: string,
      ) => {
        try {
          setVerifying(true);

          const response =
            await PaymentsAPI.verify(
              reference,
            );

          await load();

          return (
            response.data?.data ??
            response.data
          );
        } finally {
          setVerifying(false);
        }
      },
      [load],
    );

  /*
  =====================================
  REFRESH
  =====================================
  */

  const refresh =
    useCallback(async () => {
      await load();
    }, [load]);

  /*
  =====================================
  AUTO LOAD
  =====================================
  */

  useEffect(() => {
    load();
  }, [load]);

  /*
  =====================================
  EXPORTS
  =====================================
  */

  return {
    wallet,
    balance,
    transactions,

    loading,
    funding,
    verifying,

    load,
    refresh,

    loadWallet,
    loadBalance,
    loadTransactions,
    loadTransaction,

    initializeDeposit,
    verifyDeposit,
  };
}