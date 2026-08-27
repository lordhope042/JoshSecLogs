"use client";

import { useState } from "react";
import { PaymentsAPI } from "@/services/payments";
import type { VirtualAccount, PocketFiBank } from "@/services/payments";

export interface Payment {
  id: string;
  reference: string;
  gatewayReference?: string;
  amount: number;
  provider: string;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: string;
  paidAt?: string;
  verifiedAt?: string;
}

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>([]);

  /*
  =====================================
      CREATE VIRTUAL ACCOUNT
      (replaces initializePayment — 
       API uses bank + phone, not amount)
  =====================================
  */
  const initializePayment = async (
    bank: PocketFiBank,
    phone: string,
  ) => {
    try {
      setLoading(true);

      const { data } = await PaymentsAPI.createVirtualAccount(bank, phone);

      // createVirtualAccount doesn't return an authorizationUrl.
      // It returns the created virtual account. Handle routing
      // in your component if you still need a redirect.
      return data;
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      VERIFY PAYMENT
      ⚠ NOT AVAILABLE on current PaymentsAPI
  =====================================
  */
  const verifyPayment = async (_reference: string) => {
    // PaymentsAPI.verify() does not exist in the current type definition.
    // Add it to the service, or remove this from the hook.
    throw new Error("verifyPayment is not implemented in PaymentsAPI");
  };

  /*
  =====================================
      LIST VIRTUAL ACCOUNTS
      (replaces payment history)
  =====================================
  */
  const loadPayments = async () => {
    try {
      setLoading(true);

      const { data } = await PaymentsAPI.listVirtualAccounts();

      setVirtualAccounts(Array.isArray(data) ? data : []);

      // If you need to keep the old Payment[] shape elsewhere,
      // map VirtualAccount[] → Payment[] here instead of storing
      // virtualAccounts directly.
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      SINGLE PAYMENT
      ⚠ NOT AVAILABLE on current PaymentsAPI
  =====================================
  */
  const loadPayment = async (_reference: string) => {
    // PaymentsAPI.payment() does not exist in the current type definition.
    throw new Error("loadPayment is not implemented in PaymentsAPI");
  };

  return {
    loading,
    payments,         // kept for backward compat (currently unused)
    virtualAccounts,  // new state from listVirtualAccounts()
    initializePayment,
    verifyPayment,
    loadPayments,
    loadPayment,
  };
}