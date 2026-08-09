"use client";

import { ShoppingCart, Boxes } from "lucide-react";
import type { Provider } from "@/services/marketplace";

interface ActivationType {
  activationType: string;
  stock: number;
  priceUsd: number;
  priceNgn: number;
}

interface ServiceCardProps {
  service: string;

  /**
   * Friendly display name (e.g. "WhatsApp") for providers whose raw
   * service codes aren't human-readable (GrizzySMS uses short codes
   * like "wa", "ub"). Falls back to `service` if not provided, so
   * this stays backward-compatible with providers that already use
   * readable codes (5sim).
   *
   * IMPORTANT: `service` (the code) is still what gets passed to
   * onBuy() and ultimately sent to the backend for the purchase — the
   * backend expects the raw code, not the display name. Only the text
   * actually rendered on screen uses `name`.
   */
  name?: string;

  activationTypes: ActivationType[];

  /**
   * GrizzySMS prices in RUB, not USD — the backend still returns that
   * figure in the `priceUsd` field for response-shape consistency, so
   * the currency symbol shown next to it needs to match the actual
   * provider rather than always assuming USD.
   */
  provider?: Provider;

  onBuy: (
    service: string,
    activationType: string,
    price: number,
  ) => void;
}

export default function ServiceCard({
  service,
  name,
  activationTypes,
  provider = "FIVESIM",
  onBuy,
}: ServiceCardProps) {
  const currencySymbol = provider === "GRIZZYSMS" ? "₽" : "$";
  const displayName = name ?? service;

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-all duration-300 hover:border-orange-500 hover:shadow-xl">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h3 className="text-xl font-bold capitalize text-gray-900 dark:text-white">
            {displayName}
          </h3>

          <p className="text-sm text-gray-400 dark:text-zinc-500">
            Available Activation Types
          </p>
        </div>

        <ShoppingCart className="h-6 w-6 text-orange-500" />

      </div>

      <div className="space-y-4">

        {activationTypes.length > 0 ? (
          activationTypes
            .sort((a, b) => a.priceNgn - b.priceNgn)
            .map((activation) => (
              <div
                key={activation.activationType}
                className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 p-4"
              >
                <div className="flex items-center justify-between">

                  <div>

                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {activation.activationType}
                    </h4>

                    <div className="mt-1 flex items-center gap-2 text-sm">

                      <Boxes className="h-4 w-4 text-gray-400 dark:text-zinc-500" />

                      <span
                        className={
                          activation.stock > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {activation.stock} Available
                      </span>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-xl font-bold text-green-400">
                      ₦{activation.priceNgn.toLocaleString()}
                    </p>

                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      {currencySymbol}{activation.priceUsd.toFixed(2)}
                    </p>

                  </div>

                </div>

                <button
                  disabled={activation.stock <= 0}
                  onClick={() =>
                    onBuy(
                      service,
                      activation.activationType,
                      activation.priceNgn,
                    )
                  }
                  className="mt-4 w-full rounded-xl bg-orange-500 py-2.5 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  {activation.stock > 0
                    ? "Buy Number"
                    : "Out of Stock"}
                </button>

              </div>
            ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-6 text-center text-gray-400 dark:text-zinc-500">
            No activation types available.
          </div>
        )}

      </div>

    </div>
  );
}