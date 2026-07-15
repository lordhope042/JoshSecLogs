import { useEffect, useState } from "react";
import { MarketplaceAPI } from "@/services/marketplace";
import { ServicePrices } from "@/types/price";

export function usePrices(country: string) {
  const [prices, setPrices] = useState<ServicePrices>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!country) {
      setPrices([]);
      return;
    }

    setLoading(true);

    MarketplaceAPI.prices(country)
      .then((res) => {
        setPrices(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [country]);

  return {
    prices,
    loading,
  };
}