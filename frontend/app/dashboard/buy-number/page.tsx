"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Smartphone,
  ShoppingCart,
  Clock,
  Hash,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useMarketplace } from "@/hooks/useMarketplace";
import { useWallet } from "@/hooks/useWallet";

/* ===================================================================
   Buy Virtual Number page

   Previously this was a static stub with hardcoded dropdowns and a
   non-functional "Purchase Number" button. Now wired to the real
   5sim API through the same useMarketplace hook the /marketplace
   page uses:

     - Countries come from GET /marketplace/countries (5sim)
     - Products come from GET /marketplace/products/:country
     - Prices come from GET /marketplace/prices/:country
     - Purchase hits POST /marketplace/buy

   After a successful purchase the user is redirected to /dashboard/orders
   where they can see their active number and incoming SMS.
=================================================================== */

interface PriceOption {
  service: string;
  activationType: string;
  priceNgn: number;
  priceUsd: number;
  stock: number;
}

export default function BuyNumberPage() {
  const router = useRouter();

  const [country, setCountry] = useState("");
  const [operator, setOperator] = useState("any");
  const [service, setService] = useState("");
  const [selectedPrice, setSelectedPrice] = useState<PriceOption | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const {
    countries,
    products,
    prices,
    loading,
    buy,
    loadCountries,
    loadProducts,
    loadPrices,
  } = useMarketplace();

  const { balance, loadBalance } = useWallet();

  useEffect(() => {
    loadCountries();
    loadBalance();
  }, [loadCountries, loadBalance]);

  async function handleCountry(value: string) {
    setCountry(value);
    setService("");
    setSelectedPrice(null);
    await Promise.all([loadProducts(value), loadPrices(value)]);
  }

  function handleService(value: string) {
    setService(value);
    // Find the first available price option for this service
    const match = prices?.find(
      (p: any) => p.service === value && p.stock > 0,
    );
    if (match) {
      setSelectedPrice({
        service: match.service,
        activationType: match.activationType,
        priceNgn: match.priceNgn,
        priceUsd: match.priceUsd,
        stock: match.stock,
      });
    } else {
      setSelectedPrice(null);
    }
  }

  async function handlePurchase() {
    if (!country) {
      toast.error("Please select a country.");
      return;
    }
    if (!service) {
      toast.error("Please select a service.");
      return;
    }
    if (!selectedPrice || selectedPrice.stock <= 0) {
      toast.error("This service is currently out of stock.");
      return;
    }

    setPurchasing(true);
    try {
      await buy({
        country,
        operator: selectedPrice.activationType || "any",
        product: service,
      });

      await loadBalance();
      toast.success("Number purchased successfully!");
      router.push("/dashboard/orders");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Purchase failed. Please check your wallet balance and try again.",
      );
      console.error(err);
    } finally {
      setPurchasing(false);
    }
  }

  const displayPrice = selectedPrice
    ? `₦${selectedPrice.priceNgn.toLocaleString()}`
    : "₦0.00";

  const availableNumbers = selectedPrice?.stock ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Buy Virtual Number
        </h1>
        <p className="mt-2 text-gray-500 dark:text-zinc-400">
          Purchase virtual numbers for WhatsApp, Telegram, Google, Facebook and more.
          Numbers are sourced live from our provider.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Purchase Form */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8">
          <h2 className="mb-8 text-xl font-semibold">Purchase Details</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Country */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                <Globe size={16} />
                Country
              </label>
              <select
                value={country}
                onChange={(e) => handleCountry(e.target.value)}
                disabled={loading}
                className="h-12 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#0F172A] px-4 text-gray-900 dark:text-white outline-none focus:border-orange-500 disabled:opacity-50"
              >
                <option value="">Select Country</option>
                {countries?.map((c: any) => (
                  <option key={c.code || c.id} value={c.code || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {loading && !country && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin" /> Loading countries…
                </p>
              )}
            </div>

            {/* Operator */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                <Smartphone size={16} />
                Operator
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                disabled={!country}
                className="h-12 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#0F172A] px-4 text-gray-900 dark:text-white outline-none focus:border-orange-500 disabled:opacity-50"
              >
                <option value="any">Any Operator</option>
                {products?.map((p: any) => (
                  <option key={p.id || p.product} value={p.id || p.product}>
                    {p.name || p.product}
                  </option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                <Hash size={16} />
                Service
              </label>
              <select
                value={service}
                onChange={(e) => handleService(e.target.value)}
                disabled={!country || loading}
                className="h-12 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#0F172A] px-4 text-gray-900 dark:text-white outline-none focus:border-orange-500 disabled:opacity-50"
              >
                <option value="">Select Service</option>
                {prices
                  ?.reduce((acc: string[], p: any) => {
                    if (!acc.includes(p.service)) acc.push(p.service);
                    return acc;
                  }, [])
                  .map((svc: string) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
              </select>
              {!country && (
                <p className="mt-2 text-xs text-gray-400">
                  Select a country to see available services.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={purchasing || !country || !service || !selectedPrice || selectedPrice.stock <= 0}
            className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-orange-500 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {purchasing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Purchasing…
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                Purchase Number
              </>
            )}
          </button>
        </div>

        {/* Summary */}
        <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8">
          <h2 className="mb-6 text-xl font-semibold">Purchase Summary</h2>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-zinc-400">Estimated Price</span>
              <span className="text-2xl font-bold text-orange-500">{displayPrice}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-zinc-400">Available Numbers</span>
              <span className="font-semibold">{availableNumbers > 0 ? availableNumbers : "--"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                <Clock size={16} />
                Duration
              </span>
              <span>20 Minutes</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-zinc-400">Wallet Balance</span>
              <span className="font-semibold">₦{(balance ?? 0).toLocaleString()}</span>
            </div>

            {selectedPrice && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                <p className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle2 size={16} />
                  {selectedPrice.stock} numbers in stock for {selectedPrice.activationType}
                </p>
              </div>
            )}

            {country && service && (!selectedPrice || selectedPrice.stock <= 0) && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="flex items-center gap-2 text-sm text-red-400">
                  <XCircle size={16} />
                  Out of stock for this service.
                </p>
              </div>
            )}

            {!country && (
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                <p className="flex items-center gap-2 text-sm text-orange-300">
                  <AlertCircle size={16} />
                  Select a country and service to see pricing.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Number */}
      <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Number</h2>
          <span className="rounded-full bg-yellow-500/20 px-4 py-2 text-sm text-yellow-400">
            Waiting…
          </span>
        </div>

        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 p-12 text-center">
          <p className="text-gray-400 dark:text-zinc-500">
            No active virtual number. Purchase a number above, then visit{" "}
            <button
              onClick={() => router.push("/dashboard/orders")}
              className="font-medium text-orange-500 hover:underline"
            >
              Orders
            </button>{" "}
            to view your number and incoming SMS.
          </p>
        </div>
      </div>
    </div>
  );
}
