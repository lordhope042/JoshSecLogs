"use client";

import { ShoppingCart, Boxes } from "lucide-react";

interface ActivationType {
  activationType: string;
  stock: number;
  priceUsd: number;
  priceNgn: number;
}

interface ServiceCardProps {
  service: string;

  activationTypes: ActivationType[];

  onBuy: (
    service: string,
    activationType: string,
    price: number,
  ) => void;
}

export default function ServiceCard({
  service,
  activationTypes,
  onBuy,
}: ServiceCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-orange-500 hover:shadow-xl">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h3 className="text-xl font-bold capitalize text-white">
            {service}
          </h3>

          <p className="text-sm text-zinc-500">
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
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
              >
                <div className="flex items-center justify-between">

                  <div>

                    <h4 className="font-semibold text-white capitalize">
                      {activation.activationType}
                    </h4>

                    <div className="mt-1 flex items-center gap-2 text-sm">

                      <Boxes className="h-4 w-4 text-zinc-500" />

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

                    <p className="text-xs text-zinc-500">
                      ${activation.priceUsd.toFixed(2)}
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
          <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-zinc-500">
            No activation types available.
          </div>
        )}

      </div>

    </div>
  );
}