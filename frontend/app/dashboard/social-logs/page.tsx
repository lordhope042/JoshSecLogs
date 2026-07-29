"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
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

export default function SocialLogsPage() {
  const { categories, logs, loading, purchasing, loadCategories, loadLogs, loadDetails, purchase } =
    useSocialLogs();

  const [selectedCategory, setSelectedCategory] = useState<SocialLogCategoryValue | null>(null);
  const [selectedLog, setSelectedLog] = useState<SocialLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* Every sellable listing type as one card each — VPN, Instagram,
     Textplus & Nextplus, Telegram, Mail, etc. all show up whether or
     not there's current stock, same as the 3 Facebook Page cards.
     Built off ALL logs (not one category's worth), since the whole
     catalog is meant to be visible at once now. */
  const allStockGroups = useMemo(() => buildStaticStockGroups(logs), [logs]);

  /* Category tabs now filter this already-loaded list client-side
     instead of triggering a fresh fetch per click. */
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

  // Real (non-static, exact-match) grouping — used only to resolve the
  // live available count + actual unit ids for the purchase flow, since
  // a static "By Country" card can span multiple real country groups.
  const realStockGroups = useMemo(() => groupLogsIntoStock(logs), [logs]);

  const selectedGroup: SocialLogStockGroup | undefined = useMemo(() => {
    if (!selectedLog) return undefined;
    return realStockGroups.find((g) => g.logs.some((l) => l.id === selectedLog.id));
  }, [realStockGroups, selectedLog]);

  /* Load categories (for the tab list) and the FULL log set once —
     no more per-category fetching, everything's loaded up front. */
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

  // Tab click is now a pure client-side filter — no network call.
  function changeCategory(category: SocialLogCategoryValue) {
    setSelectedCategory((prev) => (prev === category ? null : category));
  }

  async function viewDetails(id: string) {
    // Static "empty stock" cards have no logs at all — nothing to view.
    if (!id) return;
    try {
      const log = await loadDetails(id);
      if (!log) return;
      setSelectedLog(log);
      setDetailsOpen(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePurchase(id: string, quantity: number) {
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
    <div className="space-y-10">
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
            </p>
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
            {searchQuery.trim() ? `No listings match "${searchQuery.trim()}".` : "Nothing to show yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-300">
          {visibleStockGroups.map((group) => (
            <SocialLogCard key={group.key} group={group} onView={viewDetails} searchQuery={searchQuery} />
          ))}
        </div>
      )}

      {/* DETAILS MODAL */}
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
    </div>
  );
}