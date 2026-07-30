"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageSearch, ShieldCheck, Zap, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import CategoryTabs from "@/components/social-logs/CategoryTabs";
import SocialLogCard, {
  buildStaticStockGroups,
  groupLogsIntoStock,
  CATEGORY_LABELS,
  PAGE_TYPE_LABELS,
  type SocialLogStockGroup,
} from "@/components/social-logs/SocialLogCard";
import SocialLogDetails from "@/components/social-logs/SocialLogDetails";

import { useSocialLogs } from "@/hooks/useSocialLogs";

import { SocialLog, SocialLogCategoryValue } from "@/types/social-log";

/* ===================================================================
   /shop — PUBLIC marketplace browsing page

   Anyone can browse the full social-log catalogue here without
   logging in. Category tabs and search work exactly like the
   dashboard version. The difference: clicking "View Details" or
   "Purchase" on a card checks for an access_token in localStorage.
   If none exists, the user is redirected to /login with a redirect
   back to /shop so they land back here after authenticating.
=================================================================== */

export default function ShopPage() {
  const router = useRouter();

  const { categories, logs, loading, purchasing, loadCategories, loadLogs, loadDetails, purchase } =
    useSocialLogs();

  const [selectedCategory, setSelectedCategory] = useState<SocialLogCategoryValue | null>(null);
  const [selectedLog, setSelectedLog] = useState<SocialLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---- Auth guard helper ----
     Returns true if the user has a JWT in localStorage, otherwise
     redirects to /login?redirect=/shop and returns false. */
  const requireAuth = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.info("Please log in to view details and purchase.");
      router.push("/login?redirect=/shop");
      return false;
    }
    return true;
  }, [router]);

  /* Every sellable listing type as one card each — same as the
     dashboard social-logs page. Built off ALL logs so the whole
     catalogue is visible at once. */
  const allStockGroups = useMemo(() => buildStaticStockGroups(logs), [logs]);

  /* Category tabs filter client-side. */
  const categoryFilteredGroups = useMemo(() => {
    if (!selectedCategory) return allStockGroups;
    return allStockGroups.filter((g) => g.category === selectedCategory);
  }, [allStockGroups, selectedCategory]);

  const visibleStockGroups = useMemo(() => {
    if (!searchQuery.trim()) return categoryFilteredGroups;
    const q = searchQuery.trim().toLowerCase();
    return categoryFilteredGroups.filter((g) => {
      const categoryLabel = CATEGORY_LABELS[g.category] ?? g.platform;
      const subLabel = g.subType ?? (g.pageType ? PAGE_TYPE_LABELS[g.pageType] ?? g.pageType : g.country ?? "");
      return (
        categoryLabel.toLowerCase().includes(q) ||
        subLabel.toLowerCase().includes(q) ||
        g.platform.toLowerCase().includes(q)
      );
    });
  }, [categoryFilteredGroups, searchQuery]);

  // Real grouping — used to resolve live count + unit ids for purchase.
  const realStockGroups = useMemo(() => groupLogsIntoStock(logs), [logs]);

  const selectedGroup: SocialLogStockGroup | undefined = useMemo(() => {
    if (!selectedLog) return undefined;
    return realStockGroups.find((g) => g.logs.some((l) => l.id === selectedLog.id));
  }, [realStockGroups, selectedLog]);

  /* Load categories + full log set once on mount. */
  const initialize = useCallback(async () => {
    try {
      await Promise.all([loadCategories(), loadLogs()]);
    } catch (error) {
      console.error(error);
    }
  }, [loadCategories, loadLogs]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Tab click is a pure client-side filter.
  function changeCategory(category: SocialLogCategoryValue) {
    setSelectedCategory((prev) => (prev === category ? null : category));
  }

  /* ---- View details (auth-gated) ---- */
  async function viewDetails(id: string) {
    // Static "empty stock" cards have no logs — nothing to view.
    if (!id) return;

    // Require login before fetching private details.
    if (!requireAuth()) return;

    try {
      const log = await loadDetails(id);
      if (!log) return;
      setSelectedLog(log);
      setDetailsOpen(true);
    } catch (error) {
      // 401 is handled by the axios interceptor (redirects to /login).
      console.error(error);
    }
  }

  /* ---- Purchase (auth-gated) ---- */
  async function handlePurchase(id: string, quantity: number) {
    if (!requireAuth()) return;

    const group = realStockGroups.find((g) => g.logs.some((l) => l.id === id));
    const idsToBuy = group ? group.logs.slice(0, quantity).map((l) => l.id) : [id];

    let succeeded = 0;
    try {
      for (const unitId of idsToBuy) {
        await purchase(unitId);
        succeeded += 1;
      }

      if (succeeded > 1) {
        toast.success(`Purchased ${succeeded} accounts successfully.`);
      }

      setDetailsOpen(false);
      setSelectedLog(null);
      await loadLogs();
    } catch (error: any) {
      if (succeeded > 0) {
        toast.error(
          `Only ${succeeded} of ${quantity} purchased — ${error?.response?.data?.message ?? "the rest failed."}`,
        );
        setDetailsOpen(false);
        setSelectedLog(null);
        await loadLogs();
      } else {
        toast.error(error?.response?.data?.message ?? "Purchase failed.");
      }
      console.error(error);
    }
  }

  const inStockCount = allStockGroups.filter((g) => g.logs.length > 0).length;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#050B18] dark:text-white">
      {/* ============================================================
          PUBLIC NAV BAR
      ============================================================ */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-[#050B18]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-black">
              Josh<span className="text-orange-500">SecLogs</span>
            </h1>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white">
              Home
            </Link>
            <Link href="/shop" className="text-sm font-semibold text-orange-500">
              Shop
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white">
              How It Works
            </Link>
            <Link href="/faq" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        {/* HEADER */}
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-white shadow-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1 text-xs font-semibold text-zinc-300">
                Premium Marketplace
              </p>
              <h1 className="text-4xl font-black">Social Logs Marketplace</h1>
              <p className="mt-4 max-w-2xl text-zinc-400">
                Browse premium aged social media accounts. Verified listings, instant purchase and secure delivery.
                Sign up to view full details and buy.
              </p>

              {/* Trust badges */}
              <div className="mt-6 flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
                  <ShieldCheck size={16} /> Verified Accounts
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
                  <Zap size={16} /> Instant Delivery
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
                  <Lock size={16} /> Secure Checkout
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-3xl font-bold">{allStockGroups.length}</p>
                <span className="text-sm text-zinc-500">Listing Types</span>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-3xl font-bold">{inStockCount}</p>
                <span className="text-sm text-zinc-500">In Stock</span>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-3xl font-bold">24/7</p>
                <span className="text-sm text-zinc-500">Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY TABS — click again to clear the filter */}
        {categories.length === 0 && loading ? (
          <div className="h-24 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900" />
        ) : (
          <CategoryTabs
            categories={categories.map((item) => item.category)}
            selected={selectedCategory}
            onSelect={changeCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* CONTENT — every listing type, in or out of stock */}
        {loading ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900" />
            ))}
          </div>
        ) : visibleStockGroups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900 py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
              <PackageSearch size={36} className="text-zinc-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">No Listings Found</h2>
            <p className="mt-3 text-zinc-400">
              {searchQuery.trim() ? `No listings match "${searchQuery.trim()}."` : "Nothing to show yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-300">
            {visibleStockGroups.map((group) => (
              <SocialLogCard key={group.key} group={group} onView={viewDetails} searchQuery={searchQuery} />
            ))}
          </div>
        )}

        {/* DETAILS MODAL — auth-gated, only opens for logged-in users */}
        <SocialLogDetails
          open={detailsOpen}
          log={selectedLog}
          loading={purchasing}
          availableCount={selectedGroup?.logs.length ?? 1}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedLog(null);
          }}
          onPurchase={handlePurchase}
        />

        {/* LOGIN CTA — shown at the bottom for unauthenticated visitors */}
        <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-orange-500/5 p-10 text-center">
          <h2 className="text-2xl font-bold">Ready to Buy?</h2>
          <p className="mx-auto mt-3 max-w-md text-gray-500 dark:text-zinc-400">
            Create a free account to view full listing details, purchase accounts, and access your credentials instantly.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-8 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="border-t border-gray-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <p className="text-sm text-gray-400 dark:text-zinc-500">
            © {new Date().getFullYear()} JoshSecLogs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
