"use client";

import { useState } from "react";
import { MarketplaceAPI } from "@/services/marketplace";

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

      const { data } = await MarketplaceAPI.orders();

      setOrders(data);

      return data;
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

      const { data } = await MarketplaceAPI.order(id);

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

      const { data } = await MarketplaceAPI.sms(id);

      setSms(data);

      return data;
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
    const { data } = await MarketplaceAPI.finish(id);

    await loadOrder(id);

    return data;
  };

  /*
  =====================================
      CANCEL
  =====================================
  */

  const cancelOrder = async (id: string) => {
    const { data } = await MarketplaceAPI.cancel(id);

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