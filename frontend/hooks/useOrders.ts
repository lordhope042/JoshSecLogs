"use client";

import { useState } from "react";
import { MarketplaceAPI } from "@/services/marketplace";

// FIX: the shared `api` instance (lib/axios.ts) already unwraps
// `response.data` in its response interceptor, so every MarketplaceAPI
// method that calls `api.get(...)` / `api.post(...)` already resolves
// directly to the backend's JSON body — not an Axios response object.
// Every call in this hook was doing `const { data } = await
// MarketplaceAPI.xxx()`, which pulled a `.data` property off an
// already-unwrapped value (an array has no such property) and silently
// produced `undefined` every time — e.g. `setOrders(undefined)` on the
// dashboard's order list. Same trap as OrdersPage.tsx had.
//
// This mirrors the `unwrap()` helper already used safely in
// hooks/useWallet.ts: it checks at runtime whether a `.data` wrapper is
// actually present before unwrapping, so it works correctly whether
// MarketplaceAPI happens to double-wrap a given endpoint or not.
function unwrap<T>(res: any): T {
  return (res && typeof res === "object" && "data" in res ? res.data : res) as T;
}

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [sms, setSms] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  /*
  =====================================
      ALL ORDERS
  =====================================
  */

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await MarketplaceAPI.orders();
      const data = unwrap<any>(res);

      // Backend returns a flat array, but guard against a wrapped
      // shape (e.g. { orders: [...] }) just in case, same as
      // OrdersPage.tsx's own loadOrders().
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : [];

      setOrders(list);

      return list;
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      SINGLE ORDER
  =====================================
  */

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

  /*
  =====================================
      SMS
  =====================================
  */

  const loadSms = async (id: string) => {
    try {
      setLoading(true);

      const res = await MarketplaceAPI.sms(id);
      const data = unwrap<any>(res);

      // The backend's sms() endpoint returns { Data: [...] | null, Total }
      // (see OrdersPage.tsx's extractSmsList for the full defensive
      // parsing) — here we only need the array shape for `sms` state.
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.Data)
          ? data.Data
          : [];

      setSms(list);

      return list;
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      FINISH
  =====================================
  */

  const finishOrder = async (id: string) => {
    const res = await MarketplaceAPI.finish(id);
    const data = unwrap<any>(res);

    await loadOrder(id);

    return data;
  };

  /*
  =====================================
      CANCEL
  =====================================
  */

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