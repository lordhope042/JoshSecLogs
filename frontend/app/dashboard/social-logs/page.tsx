"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import CategoryTabs from "@/components/social-logs/CategoryTabs";
import SocialLogCard, {
  buildStaticStockGroups,
  CATEGORY_LABELS,
  PAGE_TYPE_LABELS,
} from "@/components/social-logs/SocialLogCard";
import SocialLogDetails from "@/components/social-logs/SocialLogDetails";
import { useSocialLogs } from "@/hooks/useSocialLogs";
import {
  SocialLog,
  SocialLogCategoryValue,
} from "@/types/social-log";

export default function SocialLogsPage() {
  const {
    categories,
    logs,
    loading,
    purchasing,
    loadCategories,
    loadLogs,
    loadDetails,
    purchase,
  } = useSocialLogs();

  const [selectedCategory, setSelectedCategory] =
    useState<SocialLogCategoryValue | null>(null);

  const [selectedLog, setSelectedLog] =
    useState<SocialLog | null>(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const allGroups = useMemo(
    () => buildStaticStockGroups(logs),
    [logs]
  );

  const visibleGroups = useMemo(() => {
    const filtered = selectedCategory
      ? allGroups.filter(
          (group) =>
            group.category === selectedCategory
        )
      : allGroups;

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return filtered;
    }

    return filtered.filter((group) => {
      const category =
        CATEGORY_LABELS[group.category] ??
        group.platform;

      const sub =
        group.subType ??
        (group.pageType
          ? PAGE_TYPE_LABELS[group.pageType] ??
            group.pageType
          : group.country ?? "");

      return [
        category,
        sub,
        group.platform,
      ].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }, [
    allGroups,
    searchQuery,
    selectedCategory,
  ]);

  const initialize = useCallback(async () => {
    await Promise.all([
      loadCategories(),
      loadLogs(),
    ]);
  }, [loadCategories, loadLogs]);

  useEffect(() => {
    initialize().catch((error) => {
      console.error(
        "Failed to initialize social logs:",
        error
      );
    });
  }, [initialize]);

  async function viewDetails(id: string) {
    if (!id) {
      return;
    }

    const log = await loadDetails(id);

    if (log) {
      setSelectedLog(log);
      setDetailsOpen(true);
    }
  }

  /*
  ========================================================
  PURCHASE ACCOUNT
  ========================================================
  */

  async function handlePurchase(
    id: string,
    quantity: number
  ) {
    try {
      /*
       * The current backend purchase endpoint accepts
       * one social log ID per purchase.
       *
       * SocialLogDetails supports quantity, but the current
       * page only exposes one selected log as the purchase
       * target. Therefore we safely process one purchase
       * here until a batch-purchase endpoint is available.
       */

      if (quantity !== 1) {
        console.warn(
          "Quantity purchase requested:",
          quantity,
          "but the current purchase endpoint processes one account at a time."
        );
      }

      await purchase(id);

      /*
       * Purchase succeeded.
       * Close the details modal and clear the selected item.
       */
      setDetailsOpen(false);
      setSelectedLog(null);

      /*
       * Refresh the catalogue so the purchased item
       * disappears and stock/category counts are current.
       */
      await Promise.all([
        loadCategories(),
        loadLogs(),
      ]);
    } catch (error) {
      console.error(
        "Purchase failed:",
        error
      );

      /*
       * Keep the modal open when purchase fails.
       * The purchase hook already resets its loading state.
       */
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ==================================================
          HERO
      ================================================== */}
      <section
        className="
          relative overflow-hidden
          rounded-[28px]
          border border-slate-200
          bg-white
          p-7
          shadow-sm
          dark:border-slate-800
          dark:bg-[#0a1725]
          lg:p-9
        "
      >
        <div
          className="
            absolute -right-24 -top-24
            h-64 w-64
            rounded-full
            bg-orange-500/10
            blur-3xl
          "
        />

        <div
          className="
            relative flex flex-col gap-7
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="max-w-2xl">
            <div
              className="
                mb-4 inline-flex items-center gap-2
                rounded-full
                border border-orange-200
                bg-orange-50
                px-3 py-1.5
                text-xs font-bold
                text-orange-600
                dark:border-orange-500/20
                dark:bg-orange-500/10
                dark:text-orange-400
              "
            >
              <Sparkles size={13} />

              Social Logs
            </div>

            <h1
              className="
                text-3xl font-black
                tracking-tight
                text-slate-950
                dark:text-white
                sm:text-4xl
              "
            >
              Explore available social log listings
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              Browse the catalog, filter by platform
              and inspect listing information before
              continuing.
            </p>
          </div>

          <div
            className="
              grid grid-cols-2
              gap-3
              sm:grid-cols-3
            "
          >
            <Stat
              value={allGroups.length}
              label="Listing types"
            />

            <Stat
              value={
                allGroups.filter(
                  (group) =>
                    group.logs.length > 0
                ).length
              }
              label="Available"
            />

            <Stat
              value="24/7"
              label="Support"
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          SEARCH / FILTERS
      ================================================== */}
      <section
        className="
          rounded-[24px]
          border border-slate-200
          bg-white
          p-4
          shadow-sm
          dark:border-slate-800
          dark:bg-[#0a1725]
        "
      >
        <div className="relative mb-4">
          <Search
            className="
              absolute left-4 top-1/2
              -translate-y-1/2
              text-slate-400
            "
            size={17}
          />

          <input
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search social logs..."
            className="
              h-12 w-full
              rounded-xl
              border border-slate-200
              bg-slate-50
              pl-11 pr-4
              text-sm
              text-slate-900
              outline-none
              transition
              focus:border-orange-400
              focus:ring-4
              focus:ring-orange-500/10
              dark:border-slate-700
              dark:bg-[#071321]
              dark:text-white
            "
          />
        </div>

        {categories.length === 0 && loading ? (
          <div
            className="
              h-12
              animate-pulse
              rounded-xl
              bg-slate-100
              dark:bg-slate-800
            "
          />
        ) : (
          <CategoryTabs
            categories={categories.map(
              (item) => item.category
            )}
            selected={selectedCategory}
            onSelect={(category) =>
              setSelectedCategory(
                (prev) =>
                  prev === category
                    ? null
                    : category
              )
            }
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </section>

      {/* ==================================================
          SECURITY NOTE
      ================================================== */}
      <div
        className="
          flex items-center gap-2
          text-xs
          text-slate-500
          dark:text-slate-400
        "
      >
        <ShieldCheck
          size={15}
          className="text-emerald-500"
        />

        Review listing information carefully
        before taking any action.
      </div>

      {/* ==================================================
          LISTINGS
      ================================================== */}
      {loading ? (
        <div
          className="
            grid gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  h-72
                  animate-pulse
                  rounded-3xl
                  bg-slate-100
                  dark:bg-slate-900
                "
              />
            )
          )}
        </div>
      ) : visibleGroups.length === 0 ? (
        <div
          className="
            rounded-[28px]
            border border-dashed
            border-slate-300
            bg-white
            py-20
            text-center
            dark:border-slate-700
            dark:bg-[#0a1725]
          "
        >
          <PackageSearch
            className="
              mx-auto mb-5
              text-slate-400
            "
            size={40}
          />

          <h2
            className="
              text-xl font-bold
              text-slate-900
              dark:text-white
            "
          >
            No listings found
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Try another search or category.
          </p>
        </div>
      ) : (
        <div
          className="
            grid gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {visibleGroups.map((group) => (
            <SocialLogCard
              key={group.key}
              group={group}
              onView={viewDetails}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* ==================================================
          DETAILS / PURCHASE MODAL
      ================================================== */}
      <SocialLogDetails
        open={detailsOpen}
        log={selectedLog}
        loading={purchasing}
        availableCount={1}
        onClose={() => {
          if (!purchasing) {
            setDetailsOpen(false);
            setSelectedLog(null);
          }
        }}
        onPurchase={handlePurchase}
      />
    </div>
  );
}

function Stat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div
      className="
        min-w-[100px]
        rounded-2xl
        border border-slate-200
        bg-slate-50
        px-4 py-3
        dark:border-slate-700
        dark:bg-[#071321]
      "
    >
      <p
        className="
          text-xl font-black
          text-slate-900
          dark:text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-0.5
          text-[11px]
          font-medium
          text-slate-500
          dark:text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}