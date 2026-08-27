"use client";

import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import { ServicePrices } from "@/types/price";
import type { Provider } from "@/services/marketplace";

interface ServiceGridProps {
  prices: ServicePrices;
  selectedService?: string;
  loading?: boolean;
  provider?: Provider;

  onBuy: (
    service: string,
    activationType: string,
    price: number,
  ) => void;
}

export default function ServiceGrid({
  prices = [],
  selectedService = "",
  loading = false,
  provider = "FIVESIM",
  onBuy,
}: ServiceGridProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!prices.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Select a Country
        </h2>

        <p className="mt-3 text-gray-400 dark:text-zinc-500">
          Choose a country to view available virtual numbers.
        </p>
      </div>
    );
  }

  const filtered =
    selectedService === ""
      ? prices
      : prices.filter(
          (item) => item.service === selectedService
        );

  if (!filtered.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Service Not Available
        </h2>

        <p className="mt-3 text-gray-400 dark:text-zinc-500">
          The selected service is not available for this country.
        </p>
      </div>
    );
  }

  // Build the actual cards first — a service can pass the `filtered`
  // check above but still have zero *in-stock* activation types, in
  // which case it renders nothing. Without this check the grid would
  // silently come out blank instead of telling the user why.
  const cards = filtered
    .map((service) => {
      const activationTypes = service.activationTypes
        .filter((item) => item.stock > 0)
        .sort((a, b) => a.priceNgn - b.priceNgn);

      if (!activationTypes.length) {
        return null;
      }

      return (
        <ServiceCard
          key={service.service}
          service={service.service}
          name={(service as any).name}
          activationTypes={activationTypes}
          provider={provider}
          onBuy={onBuy}
        />
      );
    })
    .filter(Boolean);

  if (!cards.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          No Numbers In Stock
        </h2>

        <p className="mt-3 text-gray-400 dark:text-zinc-500">
          There are currently no numbers available for this country and
          service. Please try a different country, service, or check
          back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cards}
    </div>
  );
}