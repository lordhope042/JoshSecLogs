"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  PackageSearch,
} from "lucide-react";

import CategoryTabs from "@/components/social-logs/CategoryTabs";
import SocialLogCard from "@/components/social-logs/SocialLogCard";
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
    loadCategory,
    loadDetails,
    purchase,
  } = useSocialLogs();

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<SocialLogCategoryValue | null>(null);

  const [
    selectedLog,
    setSelectedLog,
  ] = useState<SocialLog | null>(null);

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);


  /*
  =====================================
  INITIAL LOAD
  =====================================
  */

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

  }, [
    loadCategories,
    loadCategory,
  ]);


  useEffect(() => {
    initialize();
  }, [initialize]);


  /*
  =====================================
  CHANGE CATEGORY
  =====================================
  */

  async function changeCategory(
    category: SocialLogCategoryValue,
  ) {
    setSelectedCategory(category);

    await loadCategory(category);
  }


  /*
  =====================================
  VIEW DETAILS
  =====================================
  */

  async function viewDetails(
    id: string,
  ) {
    try {

      const log =
        await loadDetails(id);

      if (!log) return;

      setSelectedLog(log);

      setDetailsOpen(true);

    } catch (error) {
      console.error(error);
    }
  }


  /*
  =====================================
  PURCHASE
  =====================================
  */

  async function handlePurchase(
    id: string,
  ) {

    try {

      await purchase(id);

      setDetailsOpen(false);

      setSelectedLog(null);


      if (selectedCategory) {

        await loadCategory(
          selectedCategory,
        );

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


            <h1 className="text-4xl font-black">

              Social Logs Marketplace

            </h1>


            <p className="mt-4 max-w-2xl text-zinc-400">

              Browse premium aged social media accounts.
              Verified listings, instant purchase and
              secure delivery.

            </p>


          </div>



          <div className="grid grid-cols-3 gap-4">


            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

              <p className="text-3xl font-bold">

                {categories.length}

              </p>

              <span className="text-sm text-zinc-500">

                Categories

              </span>

            </div>



            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

              <p className="text-3xl font-bold">

                {logs.length}

              </p>

              <span className="text-sm text-zinc-500">

                Listings

              </span>

            </div>



            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

              <p className="text-3xl font-bold">

                24/7

              </p>

              <span className="text-sm text-zinc-500">

                Support

              </span>

            </div>


          </div>


        </div>


      </div>



      {/* CATEGORY TABS */}


      <CategoryTabs
        categories={
          categories.map(
            (item) =>
              item.category,
          )
        }
        selected={
          selectedCategory
        }
        onSelect={
          changeCategory
        }
      />



      {/* CONTENT */}


      {loading ? (


        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">


          {Array.from({
            length: 6,
          }).map((_, index) => (

            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900"
            />

          ))}


        </div>


      ) : logs.length === 0 ? (


        <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900 py-20 text-center">


          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">


            <PackageSearch
              size={36}
              className="text-zinc-500"
            />


          </div>



          <h2 className="text-2xl font-bold text-white">

            No Accounts Available

          </h2>



          <p className="mt-3 text-zinc-400">

            There are currently no accounts
            available for this category.

          </p>


        </div>


      ) : (


        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">


          {logs.map((log) => (

            <SocialLogCard
              key={log.id}
              log={log}
              onView={viewDetails}
            />

          ))}


        </div>


      )}



      {/* DETAILS MODAL */}


      <SocialLogDetails
        open={detailsOpen}
        log={selectedLog}
        loading={purchasing}
        onClose={() => {

          setDetailsOpen(false);

          setSelectedLog(null);

        }}
        onPurchase={
          handlePurchase
        }
      />


    </div>

  );
}
