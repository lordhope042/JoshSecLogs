"use client";

import {
  useCallback,
  useState,
} from "react";

import {
  getSocialLogs,
  getSocialLogsByCategory,
  getSocialLog,
  getSocialLogCategories,
  purchaseSocialLog,
  getPurchasedSocialLog,
} from "@/services/socialLogs";

import { ALL_CATEGORIES } from "@/components/social-logs/CategoryTabs";

import {
  PurchasedSocialLog,
  SocialLog,
  SocialLogCategory,
  SocialLogCategoryValue,
} from "@/types/social-log";

export function useSocialLogs() {
  const [categories, setCategories] =
    useState<SocialLogCategory[]>([]);

  const [logs, setLogs] =
    useState<SocialLog[]>([]);

  const [selected, setSelected] =
    useState<SocialLog | null>(null);

  const [purchasedAccount, setPurchasedAccount] =
    useState<PurchasedSocialLog | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [purchasing, setPurchasing] =
    useState(false);

  /*
  ========================================================
  LOAD CATEGORIES
  ========================================================
  */

  const loadCategories = useCallback(
    async () => {
      try {
        const data =
          await getSocialLogCategories();

        const byCategory = new Map(
          data.map((category) => [
            category.category,
            category.count,
          ])
        );

        const complete: SocialLogCategory[] =
          ALL_CATEGORIES.map((category) => ({
            category,
            count:
              byCategory.get(category) ?? 0,
            total:
              byCategory.get(category) ?? 0,
          }));

        setCategories(complete);

        return complete;
      } catch (error) {
        console.error(
          "Failed to load social log categories:",
          error
        );

        return [];
      }
    },
    []
  );

  /*
  ========================================================
  LOAD ALL LOGS
  ========================================================
  */

  const loadLogs = useCallback(
    async () => {
      try {
        setLoading(true);

        const data =
          await getSocialLogs();

        setLogs(data);

        return data;
      } catch (error) {
        console.error(
          "Failed to load social logs:",
          error
        );

        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
  ========================================================
  LOAD CATEGORY
  ========================================================
  */

  const loadCategory = useCallback(
    async (
      category: SocialLogCategoryValue
    ) => {
      try {
        setLoading(true);

        const data =
          await getSocialLogsByCategory(
            category
          );

        setLogs(data);

        return data;
      } catch (error) {
        console.error(
          "Failed to load social log category:",
          error
        );

        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
  ========================================================
  LOAD DETAILS
  ========================================================
  */

  const loadDetails = useCallback(
    async (id: string) => {
      try {
        const data =
          await getSocialLog(id);

        setSelected(data);

        return data;
      } catch (error) {
        console.error(
          "Failed to load social log details:",
          error
        );

        return null;
      }
    },
    []
  );

  /*
  ========================================================
  PURCHASE ACCOUNT
  ========================================================
  */

  const purchase = useCallback(
    async (id: string) => {
      if (!id) {
        throw new Error(
          "A social log ID is required."
        );
      }

      try {
        setPurchasing(true);

        const response =
          await purchaseSocialLog(id);

        /*
        -----------------------------------------------
        Save purchased account
        -----------------------------------------------
        */

        if (response.account) {
          setPurchasedAccount(
            response.account
          );
        }

        /*
        -----------------------------------------------
        Remove purchased listing immediately
        -----------------------------------------------
        */

        setLogs((previousLogs) =>
          previousLogs.filter(
            (log) => log.id !== id
          )
        );

        /*
        -----------------------------------------------
        Update category count
        -----------------------------------------------
        */

        if (response.account?.category) {
          setCategories(
            (previousCategories) =>
              previousCategories.map(
                (category) => ({
                  ...category,

                  count:
                    category.category ===
                    response.account.category
                      ? Math.max(
                          0,
                          category.count - 1
                        )
                      : category.count,

                  total:
                    category.category ===
                    response.account.category
                      ? Math.max(
                          0,
                          category.total - 1
                        )
                      : category.total,
                })
              )
          );
        }

        return response;
      } catch (error) {
        console.error(
          "Failed to purchase social log:",
          error
        );

        throw error;
      } finally {
        setPurchasing(false);
      }
    },
    []
  );

  /*
  ========================================================
  LOAD PURCHASED ACCOUNT
  ========================================================
  */

  const loadPurchasedAccount =
    useCallback(
      async (id: string) => {
        try {
          const account =
            await getPurchasedSocialLog(
              id
            );

          setPurchasedAccount(
            account
          );

          return account;
        } catch (error) {
          console.error(
            "Failed to load purchased account:",
            error
          );

          return null;
        }
      },
      []
    );

  /*
  ========================================================
  RETURN
  ========================================================
  */

  return {
    categories,
    logs,
    selected,
    purchasedAccount,

    loading,
    purchasing,

    loadCategories,
    loadLogs,
    loadCategory,
    loadDetails,

    purchase,

    loadPurchasedAccount,
  };
}