"use client";

import { useState } from "react";
import {
  Globe,
  Smartphone,
  ShoppingCart,
  Clock,
  Hash,
} from "lucide-react";

export default function BuyNumberPage() {
  const [country, setCountry] = useState("");
  const [operator, setOperator] = useState("");
  const [service, setService] = useState("");

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Buy Virtual Number
        </h1>

        <p className="mt-2 text-gray-500 dark:text-zinc-400">
          Purchase virtual numbers for WhatsApp, Telegram, Google,
          Facebook and more.
        </p>
      </div>

      {/* Main Grid */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Purchase Form */}

        <div className="lg:col-span-2 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8">

          <h2 className="mb-8 text-xl font-semibold">
            Purchase Details
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Country */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                <Globe size={16} />
                Country
              </label>

              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#0F172A] px-4 text-gray-900 dark:text-white outline-none focus:border-orange-500"
              >
                <option value="">Select Country</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Russia</option>
                <option>Nigeria</option>
              </select>
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
                className="h-12 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#0F172A] px-4 text-gray-900 dark:text-white outline-none focus:border-orange-500"
              >
                <option value="">Any Operator</option>
                <option>Any</option>
                <option>Vodafone</option>
                <option>MTN</option>
                <option>Orange</option>
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
                onChange={(e) => setService(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#0F172A] px-4 text-gray-900 dark:text-white outline-none focus:border-orange-500"
              >
                <option value="">Select Service</option>
                <option>WhatsApp</option>
                <option>Telegram</option>
                <option>Google</option>
                <option>Facebook</option>
                <option>Instagram</option>
                <option>TikTok</option>
                <option>Discord</option>
              </select>
            </div>

          </div>

          <button
            className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-orange-500 font-semibold text-white transition hover:bg-orange-600"
          >
            <ShoppingCart size={20} />
            Purchase Number
          </button>

        </div>

        {/* Summary */}

        <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8">

          <h2 className="mb-6 text-xl font-semibold">
            Purchase Summary
          </h2>

          <div className="space-y-5">

            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-zinc-400">
                Estimated Price
              </span>

              <span className="text-2xl font-bold text-orange-500">
                ₦0.00
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-zinc-400">
                Available Numbers
              </span>

              <span className="font-semibold">
                --
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                <Clock size={16} />
                Duration
              </span>

              <span>
                20 Minutes
              </span>
            </div>

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">

              <p className="text-sm text-orange-300">
                After purchase your number will appear here.
                Incoming SMS messages will automatically update.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Active Number */}

      <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Active Number
          </h2>

          <span className="rounded-full bg-yellow-500/20 px-4 py-2 text-sm text-yellow-400">
            Waiting...
          </span>

        </div>

        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 p-12 text-center">

          <p className="text-gray-400 dark:text-zinc-500">
            No active virtual number.
          </p>

        </div>

      </div>

    </div>
  );
}