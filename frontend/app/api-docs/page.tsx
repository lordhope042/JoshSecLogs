"use client";

import Link from "next/link";
import { Code2, Key, Terminal, Webhook, ArrowRight, Copy } from "lucide-react";
import { useState } from "react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/auth/register",
    description: "Create a new user account. Returns the user object.",
    auth: false,
  },
  {
    method: "POST",
    path: "/auth/login",
    description: "Authenticate with email and password. Returns a JWT access token.",
    auth: false,
  },
  {
    method: "GET",
    path: "/auth/me",
    description: "Get the authenticated user's profile.",
    auth: true,
  },
  {
    method: "PATCH",
    path: "/auth/me",
    description: "Update the authenticated user's name and email.",
    auth: true,
  },
  {
    method: "PATCH",
    path: "/auth/me/password",
    description: "Change password. Requires currentPassword and newPassword.",
    auth: true,
  },
  {
    method: "GET",
    path: "/marketplace/countries",
    description: "List all available countries for virtual numbers.",
    auth: true,
  },
  {
    method: "GET",
    path: "/marketplace/products/:country",
    description: "List available products/services for a given country.",
    auth: true,
  },
  {
    method: "GET",
    path: "/marketplace/prices/:country",
    description: "Get pricing for all services in a country, including stock counts.",
    auth: true,
  },
  {
    method: "POST",
    path: "/marketplace/buy",
    description: "Purchase a virtual number. Deducts from wallet balance.",
    auth: true,
  },
  {
    method: "GET",
    path: "/marketplace/orders",
    description: "List all orders for the authenticated user.",
    auth: true,
  },
  {
    method: "GET",
    path: "/marketplace/orders/:id/sms",
    description: "Get SMS messages received on a specific order's number.",
    auth: true,
  },
  {
    method: "POST",
    path: "/marketplace/orders/:id/finish",
    description: "Finish an order (confirm SMS received).",
    auth: true,
  },
  {
    method: "POST",
    path: "/marketplace/orders/:id/cancel",
    description: "Cancel an order. Refunds the wallet if SMS was not received.",
    auth: true,
  },
  {
    method: "GET",
    path: "/social-logs/categories",
    description: "List all social log categories.",
    auth: true,
  },
  {
    method: "GET",
    path: "/social-logs",
    description: "List available social logs. Optional ?category= filter.",
    auth: true,
  },
  {
    method: "GET",
    path: "/social-logs/:id",
    description: "Get full details of a social log (including credentials after purchase).",
    auth: true,
  },
  {
    method: "POST",
    path: "/social-logs/:id/purchase",
    description: "Purchase a social log. Deducts from wallet and assigns to buyer.",
    auth: true,
  },
  {
    method: "GET",
    path: "/social-logs/my-purchases",
    description: "List all social logs purchased by the authenticated user.",
    auth: true,
  },
  {
    method: "GET",
    path: "/wallet",
    description: "Get the authenticated user's wallet balance.",
    auth: true,
  },
  {
    method: "GET",
    path: "/wallet/transactions",
    description: "List wallet transaction history.",
    auth: true,
  },
  {
    method: "POST",
    path: "/payments/initialize",
    description: "Initialize a Paystack payment to fund the wallet.",
    auth: true,
  },
  {
    method: "POST",
    path: "/payments/verify",
    description: "Verify a Paystack payment and credit the wallet.",
    auth: true,
  },
  {
    method: "GET",
    path: "/api-keys",
    description: "List the authenticated user's API keys (masked).",
    auth: true,
  },
  {
    method: "POST",
    path: "/api-keys",
    description: "Generate a new API key. Returns the full key once.",
    auth: true,
  },
  {
    method: "DELETE",
    path: "/api-keys/:id",
    description: "Delete an API key permanently.",
    auth: true,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  POST: "bg-green-500/10 text-green-500 border-green-500/20",
  PATCH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false);

  const copyExample = () => {
    navigator.clipboard.writeText(
      `curl -X GET https://api.joshseclogs.com/api/v1/marketplace/countries \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PublicPageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-500">
            <Code2 size={16} />
            Developer Documentation
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            API Reference
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-zinc-300">
            Build integrations with the JoshSecLogs REST API. All endpoints are
            JSON-based and authenticated with JWT or API keys.
          </p>
        </div>
      </section>

      {/* Quick start */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <div className="rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <Terminal className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Start</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-700 dark:text-zinc-300">
            All API requests are made to <code className="rounded bg-orange-500/10 px-1.5 py-0.5 text-orange-500 text-xs">https://api.joshseclogs.com/api/v1</code>.
            Authenticate by including your JWT token or API key in the Authorization header.
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-900 p-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Example Request</span>
              <button
                onClick={copyExample}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 transition"
              >
                <Copy size={12} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto text-xs text-gray-300"><code>{`curl -X GET https://api.joshseclogs.com/api/v1/marketplace/countries \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code></pre>
          </div>
        </div>
      </section>

      {/* Auth info */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-6">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Authentication</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-zinc-300">
              Use the JWT access token from <code className="text-orange-500">/auth/login</code> or
              generate an API key from your dashboard. Include it as a Bearer token in the
              Authorization header for all authenticated requests.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-6">
            <div className="flex items-center gap-3">
              <Webhook className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Response Format</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-zinc-300">
              All responses are JSON. Successful responses return the data directly or wrapped
              in <code className="text-orange-500">{`{ data: ... }`}</code>. Errors return
              <code className="text-orange-500">{` { statusCode, message }`}</code> with
              appropriate HTTP status codes.
            </p>
          </div>
        </div>
      </section>

      {/* Endpoints table */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Endpoints</h2>
        <div className="space-y-3">
          {ENDPOINTS.map((endpoint) => (
            <div
              key={`${endpoint.method}-${endpoint.path}`}
              className="flex flex-col gap-3 rounded-xl border border-orange-500/10 bg-white dark:bg-[#0d1525] p-4 transition hover:border-orange-500/30 sm:flex-row sm:items-center"
            >
              <span
                className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-bold ${METHOD_COLORS[endpoint.method]}`}
              >
                {endpoint.method}
              </span>
              <code className="text-sm font-medium text-gray-900 dark:text-white">
                {endpoint.path}
              </code>
              <p className="flex-1 text-sm text-gray-700 dark:text-zinc-300">
                {endpoint.description}
              </p>
              {endpoint.auth && (
                <span className="inline-flex w-fit items-center gap-1 rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500">
                  <Key size={10} />
                  Auth
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Need an API Key?</h3>
          <p className="mt-3 text-sm text-gray-700 dark:text-zinc-300">
            Generate API keys from your dashboard after registering.
          </p>
          <Link
            href="/register"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Create Account
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  );
}
