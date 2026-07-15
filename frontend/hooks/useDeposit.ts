"use client";

import { useState } from "react";
import { PaymentsAPI } from "@/services/payments";

export function useDeposit() {
  const [loading, setLoading] = useState(false);

  async function verify(reference: string) {
    try {
      setLoading(true);

      const { data } = await PaymentsAPI.verify(reference);

      return data;
    } finally {
      setLoading(false);
    }
  }

  return {
    verify,
    loading,
  };
}