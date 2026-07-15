"use client";

import { Country } from "@/src/types/marketplace";

interface Props {
  countries: Country[] | any;
  country: string;
  service: string;

  services?: string[];

  onCountryChange: (value: string) => void;
  onServiceChange: (value: string) => void;

  disabled?: boolean;
}

export default function MarketplaceHeader({
  countries,
  country,
  service,
  services = [],
  onCountryChange,
  onServiceChange,
  disabled = false,
}: Props) {
  const countryList = Array.isArray(countries) ? countries : [];

  const validCountries = countryList.filter(
    (item) => item && typeof item === "object" && item.name
  );

  const serviceList = Array.isArray(services) ? services : [];

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#111827] p-8">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          Virtual Number Marketplace
        </h1>

        <p className="mt-2 text-zinc-400">
          Select a country and service to continue.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {/* Country */}
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Country
          </label>

          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            disabled={disabled || validCountries.length === 0}
            className="h-12 w-full rounded-xl border border-zinc-700 bg-[#0F172A] px-4 text-white outline-none focus:border-orange-500"
          >
            <option value="">
              {validCountries.length === 0
                ? "Loading countries..."
                : "Select Country"}
            </option>

            {validCountries.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Service */}
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Service
          </label>

          <select
            value={service}
            onChange={(e) => onServiceChange(e.target.value)}
            disabled={!country || serviceList.length === 0}
            className="h-12 w-full rounded-xl border border-zinc-700 bg-[#0F172A] px-4 text-white outline-none focus:border-orange-500"
          >
            <option value="">
              {!country
                ? "Select country first"
                : serviceList.length === 0
                ? "Loading services..."
                : "Select Service"}
            </option>

            {serviceList.map((item) => (
              <option key={item} value={item}>
                {item
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}