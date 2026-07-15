"use client";

import { useState } from "react";
import { PaymentsAPI } from "@/services/payments";

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

  /*
  =====================================
      INITIALIZE PAYMENT
  =====================================
  */

  const initializePayment = async (
    amount: number,
  ) => {
    try {
      setLoading(true);

      const { data } =
        await PaymentsAPI.initialize(amount);

      /*
      Backend returns:
      {
        authorizationUrl,
        reference,
        accessCode
      }
      */

      window.location.href =
        data.authorizationUrl;
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      VERIFY PAYMENT
  =====================================
  */

  const verifyPayment = async (
    reference: string,
  ) => {
    try {
      setLoading(true);

      const { data } =
        await PaymentsAPI.verify(reference);

      return data;
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      PAYMENT HISTORY
  =====================================
  */

  const loadPayments = async () => {
    try {
      const { data } =
        await PaymentsAPI.history();

      setPayments(
        Array.isArray(data)
          ? data
          : data.payments ?? [],
      );
    } catch (err) {
      console.error(err);
    }
  };

  /*
  =====================================
      SINGLE PAYMENT
  =====================================
  */

  const loadPayment = async (
    reference: string,
  ) => {
    const { data } =
      await PaymentsAPI.payment(reference);

    return data;
  };

  return {
    loading,

    payments,

    initializePayment,

    verifyPayment,

    loadPayments,

    loadPayment,
  };
}