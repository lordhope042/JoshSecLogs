"use client";

import { useState } from "react";
import { MarketplaceAPI } from "@/services/marketplace";

// The shared `api` instance already unwraps `response.data`, so we only
// unwrap again if a `.data` wrapper is actually present.
function unwrap<T>(res: any): T {
  return (res && typeof res === "object" && "data" in res ? res.data : res) as T;
}

// Pulls an array out of a flat array or common wrapped shapes
// (handles lowercase and capitalised keys from the backend).
function toList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.Orders)) return data.Orders;
  if (Array.isArray(data?.Data)) return data.Data;
  return [];
}

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [sms, setSms] = useState<any[]>([]);

  // Start as true so the page shows the skeleton instead of
  // flashing "No orders found" before the first fetch begins.
  const [loading, setLoading] = useState(true);

  /* ALL ORDERS */
  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await MarketplaceAPI.orders();
      const list = toList(unwrap<any>(res));

      setOrders(list);

      return list;
    } finally {
      setLoading(false);
    }
  };

  /* SINGLE ORDER */
  const loadOrder = async (id: string) => {
    try {
      setLoading(true);

      const res = await MarketplaceAPI.order(id);
      const data = unwrap<any>(res);

      setCurrentOrder(data);

      return data;
    } finally {
      setLoading(false);
    }
  };

  /* SMS */
  const loadSms = async (id: string) => {
    try {
      setLoading(true);

      const res = await MarketplaceAPI.sms(id);
      const list = toList(unwrap<any>(res));

      setSms(list);

      return list;
    } finally {
      setLoading(false);
    }
  };

  /* FINISH */
  const finishOrder = async (id: string) => {
    const res = await MarketplaceAPI.finish(id);
    const data = unwrap<any>(res);

    await loadOrder(id);

    return data;
  };

  /* CANCEL */
  const cancelOrder = async (id: string) => {
    const res = await MarketplaceAPI.cancel(id);
    const data = unwrap<any>(res);

    await loadOrder(id);

    return data;
  };

  return {
    orders,
    currentOrder,
    sms,
    loading,

    loadOrders,
    loadOrder,
    loadSms,

    finishOrder,
    cancelOrder,
  };
}