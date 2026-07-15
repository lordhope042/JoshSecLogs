"use client";

import ServiceCard from "./ServiceCard";
import { ServicePrices } from "@/types/price";

interface ServiceGridProps {
  prices: ServicePrices;
  selectedService?: string;
  loading?: boolean;

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
  onBuy,
}: ServiceGridProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-[#111827] p-12 text-center">
        <p className="text-zinc-400">
          Loading available services...
        </p>
      </div>
    );
  }

  if (!prices.length) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-800 bg-[#111827] p-16 text-center">
        <h2 className="text-xl font-semibold text-white">
          Select a Country
        </h2>

        <p className="mt-3 text-zinc-500">
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
      <div className="rounded-3xl border border-dashed border-zinc-800 bg-[#111827] p-16 text-center">
        <h2 className="text-xl font-semibold text-white">
          Service Not Available
        </h2>

        <p className="mt-3 text-zinc-500">
          The selected service is not available for this country.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((service) => {
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
            activationTypes={activationTypes}
            onBuy={onBuy}
          />
        );
      })}
    </div>
  );
}