"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";

import CategoryTabs from "@/components/social-logs/CategoryTabs";
import SocialLogCard, {
  groupLogsIntoStock,
  CATEGORY_LABELS,
  PAGE_TYPE_LABELS,
} from "@/components/social-logs/SocialLogCard";
import SocialLogDetails from "@/components/social-logs/SocialLogDetails";

import { useSocialLogs } from "@/hooks/useSocialLogs";

import { SocialLog, SocialLogCategoryValue } from "@/types/social-log";

export default function SocialLogsPage() {
  const { categories, logs, loading, purchasing, loadCategories, loadCategory, loadDetails, purchase } =
    useSocialLogs();

  const [selectedCategory, setSelectedCategory] = useState<SocialLogCategoryValue | null>(null);
  const [selectedLog, setSelectedLog] = useState<SocialLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* Group the current category's logs into stock — e.g. within
     FACEBOOK_PAGE, "Created Page" and "2x Created" show as separate
     cards, each with its own count, instead of one card per account. */
  const stockGroups = useMemo(() => groupLogsIntoStock(logs), [logs]);

  /* Same search query CategoryTabs uses to filter its tab list also
     filters the actual cards shown — so once a category is selected
     and its tabs collapse, typing still narrows down which stock
     groups (page types / countries) are visible. */
  const visibleStockGroups = useMemo(() => {
    if (!searchQuery.trim()) return stockGroups;
    const q = searchQuery.trim().toLowerCase();
    return stockGroups.filter((g) => {
      const categoryLabel = CATEGORY_LABELS[g.category] ?? g.platform;
      const subLabel = g.pageType ? PAGE_TYPE_LABELS[g.pageType] ?? g.pageType : g.country ?? "";
      return (
        categoryLabel.toLowerCase().includes(q) ||
        subLabel.toLowerCase().includes(q) ||
        g.platform.toLowerCase().includes(q)
      );
    });
  }, [stockGroups, searchQuery]);

  const initialize = useCallback(async () => {
    try {
      const list = await loadCategories();
      if (!list.length) return;
      const first = list[0].category;
      setSelectedCategory(first);
      await loadCategory(first);
    } catch (error) {
      console.error(error);
    }
  }, [loadCategories, loadCategory]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  async function changeCategory(category: SocialLogCategoryValue) {
    setSelectedCategory(category);
    await loadCategory(category);
  }

  async function viewDetails(id: string) {
    try {
      const log = await loadDetails(id);
      if (!log) return;
      setSelectedLog(log);
      setDetailsOpen(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePurchase(id: string) {
    try {
      await purchase(id);
      setDetailsOpen(false);
      setSelectedLog(null);
      if (selectedCategory) {
        await loadCategory(selectedCategory);
      }
    } catch (error) {
      console.error(error);
    }
  }

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
              <p className="text-3xl font-bold">{categories.length}</p>
              <span className="text-sm text-zinc-500">Categories</span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              {/* Listings = distinct stock groups in this category, not raw units */}
              <p className="text-3xl font-bold">{stockGroups.length}</p>
              <span className="text-sm text-zinc-500">Listings</span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-3xl font-bold">24/7</p>
              <span className="text-sm text-zinc-500">Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
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

      {/* CONTENT */}
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
          <h2 className="text-2xl font-bold text-white">No Accounts Available</h2>
          <p className="mt-3 text-zinc-400">
            {searchQuery.trim()
              ? `No listings match "${searchQuery.trim()}" in this category.`
              : "There are currently no accounts available for this category."}
          </p>
        </div>
      ) : (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-300">
          {visibleStockGroups.map((group) => (
            <SocialLogCard key={group.key} group={group} onView={viewDetails} searchQuery={searchQuery} />
          ))}
        </div>
      )}

      {/* DETAILS MODAL — unchanged, still operates on a single log id */}
      <SocialLogDetails
        open={detailsOpen}
        log={selectedLog}
        loading={purchasing}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedLog(null);
        }}
        onPurchase={handlePurchase}
      />
    </div>
  );
}