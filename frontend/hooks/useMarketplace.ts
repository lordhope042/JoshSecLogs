"use client";

import { useState } from "react";
import { MarketplaceAPI } from "@/services/marketplace";

export function useMarketplace() {
  const [countries, setCountries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  /*
  =====================================
      COUNTRIES
  =====================================
  */

  const loadCountries = async () => {
    try {
      setLoading(true);

      const { data } = await MarketplaceAPI.countries();

      setCountries(data);

      return data;
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      PRODUCTS
  =====================================
  */

  const loadProducts = async (country: string) => {
    try {
      setLoading(true);

      const { data } = await MarketplaceAPI.products(country);

      setProducts(data);

      return data;
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      PRICES
  =====================================
  */

  const loadPrices = async (country: string) => {
    try {
      setLoading(true);

      const { data } = await MarketplaceAPI.prices(country);

      setPrices(data);

      return data;
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      BUY NUMBER
  =====================================
  */

  const buy = async (payload: {
    country: string;
    operator: string;
    product: string;
  }) => {
    try {
      setBuying(true);

      const { data } = await MarketplaceAPI.buy(payload);

      return data;
    } finally {
      setBuying(false);
    }
  };

  return {
    countries,
    products,
    prices,

    loading,
    buying,

    loadCountries,
    loadProducts,
    loadPrices,

    buy,
  };
}