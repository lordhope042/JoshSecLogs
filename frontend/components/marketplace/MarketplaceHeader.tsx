"use client";

// FIX: was importing `Country` from "@/src/types/marketplace" — that path
// doesn't exist (the real folder is "types/", no "/src/" prefix), and
// `types/marketplace.ts` doesn't export a `Country` type anyway. The real
// export lives in "@/types/country". The old import would fail the
// TypeScript build.
import { Country } from "@/types/country";
import type { Provider } from "@/services/marketplace";

interface Product {
  id?: string;
  service?: string;
  name?: string;
  product?: string;
}

interface Props {
  countries: Country[] | any[];
  products?: Product[];

  provider: Provider;
  country: string;
  service: string;

  onProviderChange: (value: Provider) => void;
  onCountryChange: (value: string) => void;
  onServiceChange: (value: string) => void;

  disabled?: boolean;
}

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: "FIVESIM", label: "Provider 1" },
  { value: "GRIZZYSMS", label: "Provider 2" },
];

export default function MarketplaceHeader({
  countries = [],
  products = [],
  provider,
  country,
  service,
  onProviderChange,
  onCountryChange,
  onServiceChange,
  disabled = false,
}: Props) {
  const validCountries = Array.isArray(countries)
    ? countries.filter((c) => c && c.name)
    : [];

  const validProducts = Array.isArray(products) ? products : [];

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-gray-50 dark:from-[#111827] via-gray-50 dark:via-[#0F172A] to-gray-50 dark:to-[#111827] p-8 shadow-lg">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Virtual Number Marketplace
        </h1>

        <p className="mt-2 text-gray-500 dark:text-zinc-400">
          Select a provider, country and service to continue.
        </p>
      </div>

      {/* Provider */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-zinc-400">
          Provider
        </label>

        <div className="grid grid-cols-2 gap-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              type="button"
              disabled={disabled}
              onClick={() => onProviderChange(p.value)}
              className={`h-12 rounded-xl border px-4 text-sm font-semibold transition ${
                provider === p.value
                  ? "border-orange-500 bg-orange-500/10 text-orange-500"
                  : "border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#0F172A] text-gray-500 dark:text-zinc-400 hover:border-orange-500/40"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {/* Country */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-zinc-400">
            Country
          </label>

          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            disabled={disabled || validCountries.length === 0}
            className="h-12 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#0F172A] px-4 text-gray-900 dark:text-white transition focus:border-orange-500 focus:outline-none"
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
          <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-zinc-400">
            Service
          </label>

          <select
            value={service}
            onChange={(e) => onServiceChange(e.target.value)}
            disabled={!country || validProducts.length === 0}
            className="h-12 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#0F172A] px-4 text-gray-900 dark:text-white transition focus:border-orange-500 focus:outline-none"
          >
            <option value="">
              {!country
                ? "Select country first"
                : validProducts.length === 0
                ? "Loading services..."
                : "Select Service"}
            </option>

            {validProducts.map((product) => {
              // FIX: previously used `product.product ?? product.name ??
              // product.id`, so when only `name` was populated (the
              // friendly display name, e.g. "Apple") the <option>'s
              // VALUE became that display name instead of the provider's
              // raw service code (e.g. "wx"). ServiceGrid then filtered
              // on `item.service === selectedService`, where item.service
              // is always the raw code from the backend — so the
              // dropdown's selection could never match anything and the
              // grid always rendered empty. Now `service`/`product`/`id`
              // (the actual code fields) are tried first, and `name` is
              // used ONLY for the visible label, never the value.
              const value =
                product.service ??
                product.product ??
                product.id ??
                "";

              const label =
                product.name ??
                value
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) =>
                    c.toUpperCase()
                  );

              return (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              );
            })}
          </select>
        </div>

      </div>
    </div>
  );
}