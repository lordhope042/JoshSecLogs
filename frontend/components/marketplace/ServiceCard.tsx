"use client";

import { useState } from "react";
import { ShoppingCart, Boxes } from "lucide-react";
import type { Provider } from "@/services/marketplace";

interface ActivationType {
  activationType: string;
  /** Display label, e.g. "Grade 1". Falls back to activationType. */
  label?: string;
  grade?: number;
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

  /** Provider cost is retained for API compatibility, but is not displayed to buyers. */
  provider?: Provider;

  onBuy: (
    service: string,
    activationType: string,
    price: number,
    /** Display label of the chosen grade, e.g. "Grade 1" (SMSBower). */
    label?: string,
    /** Friendly service name, e.g. "WhatsApp". */
    serviceName?: string,
  ) => void;
}

export default function ServiceCard({
  service,
  name,
  activationTypes,
  provider = "FIVESIM",
  onBuy,
}: ServiceCardProps) {
  const displayName = name ?? service;
  const sortedActivations = [...activationTypes].sort(
    (a, b) => a.priceNgn - b.priceNgn,
  );
  const [selectedKey, setSelectedKey] = useState(
    sortedActivations[0]?.activationType ?? "",
  );
  const selectedActivation =
    sortedActivations.find((item) => item.activationType === selectedKey) ??
    sortedActivations[0];

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-all duration-300 hover:border-orange-500 hover:shadow-xl">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h3 className="text-xl font-bold capitalize text-gray-900 dark:text-white">
            {displayName}
          </h3>

          <p className="text-sm text-gray-400 dark:text-zinc-500">
            Choose an option
          </p>
        </div>

        <ShoppingCart className="h-6 w-6 text-orange-500" />

      </div>

      <div className="space-y-4">
        {selectedActivation ? (
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 p-4">
            <label className="mb-2 block text-xs font-semibold text-gray-500 dark:text-zinc-400">
              Option / grade
            </label>
            <select
              value={selectedActivation.activationType}
              onChange={(event) => setSelectedKey(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              {sortedActivations.map((activation, index) => (
                <option key={activation.activationType} value={activation.activationType}>
                  {activation.label ?? (provider === "SMSBOWER" ? `Grade ${index + 1}` : activation.activationType)}
                </option>
              ))}
            </select>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Boxes className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                <span className="text-green-500">{selectedActivation.stock} Available</span>
              </div>
              <p className="text-xl font-bold text-green-400">
                ₦{selectedActivation.priceNgn.toLocaleString()}
              </p>
            </div>

            <button
              disabled={selectedActivation.stock <= 0}
              onClick={() => onBuy(
                service,
                selectedActivation.activationType,
                selectedActivation.priceNgn,
                selectedActivation.label ?? (provider === "SMSBOWER" ? `Grade ${sortedActivations.indexOf(selectedActivation) + 1}` : undefined),
                displayName,
              )}
              className="mt-4 w-full rounded-xl bg-orange-500 py-2.5 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              Buy Number
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-6 text-center text-gray-400 dark:text-zinc-500">
            No activation types available.
          </div>
        )}

      </div>

    </div>
  );
}
