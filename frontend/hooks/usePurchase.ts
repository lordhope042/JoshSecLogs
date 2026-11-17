import { useRef, useState } from "react";
import { MarketplaceAPI } from "@/services/marketplace";
import type { Provider } from "@/services/marketplace";

export function usePurchase() {
  const [loading, setLoading] = useState(false);
  const pendingRequest = useRef<{ fingerprint: string; key: string } | null>(null);

  async function buy(
    country: string,
    operator: string,
    product: string,
    provider: Provider = "FIVESIM",
  ) {
    setLoading(true);
    const payload = { provider, country, operator, product };
    const fingerprint = JSON.stringify(payload);
    if (!pendingRequest.current || pendingRequest.current.fingerprint !== fingerprint) {
      const key = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      pendingRequest.current = { fingerprint, key };
    }

    try {
      const res = await MarketplaceAPI.buy(payload, pendingRequest.current.key);
      pendingRequest.current = null;
      return res.data;
    } finally {
      setLoading(false);
    }
  }

  return { buy, loading };
}
