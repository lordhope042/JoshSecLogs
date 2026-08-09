import { useState } from "react";
import { MarketplaceAPI } from "@/services/marketplace";
import type { Provider } from "@/services/marketplace";

export function usePurchase() {
  const [loading, setLoading] = useState(false);

  async function buy(
    country: string,
    operator: string,
    product: string,
    provider: Provider = "FIVESIM"
  ) {
    setLoading(true);

    try {
      const res = await MarketplaceAPI.buy({
        provider,
        country,
        operator,
        product,
      });

      return res.data;
    } finally {
      setLoading(false);
    }
  }

  return {
    buy,
    loading,
  };
}