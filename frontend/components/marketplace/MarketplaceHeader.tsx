"use client";

import { Country } from "@/src/types/marketplace";

interface Product {
  id?: string;
  name?: string;
  product?: string;
}

interface Props {
  countries: Country[] | any[];
  products?: Product[];

  country: string;
  service: string;

  onCountryChange: (value: string) => void;
  onServiceChange: (value: string) => void;

  disabled?: boolean;
}

export default function MarketplaceHeader({
  countries = [],
  products = [],
  country,
  service,
  onCountryChange,
  onServiceChange,
  disabled = false,
}: Props) {
  const validCountries = Array.isArray(countries)
    ? countries.filter((c) => c && c.name)
    : [];

  const validProducts = Array.isArray(products) ? products : [];

  return (
    <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-[#111827] via-[#0F172A] to-[#111827] p-8 shadow-lg">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Virtual Number Marketplace
        </h1>

        <p className="mt-2 text-zinc-400">
          Select your preferred country and service to continue.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {/* Country */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Country
          </label>

          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            disabled={disabled || validCountries.length === 0}
            className="h-12 w-full rounded-xl border border-zinc-700 bg-[#0F172A] px-4 text-white transition focus:border-orange-500 focus:outline-none"
          >
            <option value="">
              {validCountries.length === 0
                ? "Loading countries..."
                : "Select Country"}
            </option>

            {validCountries.map((country) => (
              <option
                key={country.id}
                value={country.id}
              >
                {country.name.charAt(0).toUpperCase() +
                  country.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Service */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Service
          </label>

          <select
            value={service}
            onChange={(e) => onServiceChange(e.target.value)}
            disabled={!country || validProducts.length === 0}
            className="h-12 w-full rounded-xl border border-zinc-700 bg-[#0F172A] px-4 text-white transition focus:border-orange-500 focus:outline-none"
          >
            <option value="">
              {!country
                ? "Select country first"
                : validProducts.length === 0
                ? "Loading services..."
                : "Select Service"}
            </option>

            {validProducts.map((product) => {
              const value =
                product.product ??
                product.name ??
                product.id ??
                "";

              return (
                <option
                  key={value}
                  value={value}
                >
                  {value
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) =>
                      c.toUpperCase()
                    )}
                </option>
              );
            })}
          </select>
        </div>

      </div>
    </div>
  );
}