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
  =====================================
  LOAD CATEGORIES
  =====================================
  */

  const loadCategories = useCallback(async () => {
    try {
      const data =
        await getSocialLogCategories();

      setCategories(data);

      return data;
    } catch (error) {
      console.error(error);

      return [];
    }
  }, []);

  /*
  =====================================
  LOAD ALL LOGS
  =====================================
  */

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);

      const data =
        await getSocialLogs();

      setLogs(data);

      return data;
    } catch (error) {
      console.error(error);

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  =====================================
  LOAD CATEGORY
  Hits GET /social-logs/category/:category directly now.
  The old approach (getSocialLogs({ category })) hit
  GET /social-logs?category=X — but that controller route
  only ever reads @Query("platform"), never "category", so
  every tab silently returned the same unfiltered list.
  This dedicated endpoint actually filters server-side.
  =====================================
  */

  const loadCategory = useCallback(
    async (
      category: SocialLogCategoryValue,
    ) => {
      try {
        setLoading(true);

        const data =
          await getSocialLogsByCategory(
            category,
          );

        setLogs(data);

        return data;
      } catch (error) {
        console.error(error);

        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /*
  =====================================
  LOAD DETAILS
  =====================================
  */

  const loadDetails = useCallback(
    async (
      id: string,
    ) => {
      try {
        const data =
          await getSocialLog(id);

        setSelected(data);

        return data;
      } catch (error) {
        console.error(error);

        return null;
      }
    },
    [],
  );

  /*
  =====================================
  PURCHASE ACCOUNT
  =====================================
  */
  const purchase = useCallback(
    async (id: string) => {
      try {
        setPurchasing(true);

        const response = await purchaseSocialLog(id);

        if (response.account) {
          setPurchasedAccount(response.account);
        }

        // Remove purchased account immediately
        setLogs((prev) =>
          prev.filter((log) => log.id !== id)
        );

        // Update category tab counts (was matching on `.platform`,
        // now matches on `.category` since that's the tab key)
        setCategories((prev) =>
          prev.map((category) => ({
            ...category,
            count:
              category.category === response.account?.category
                ? Math.max(0, category.count - 1)
                : category.count,
          }))
        );

        return response;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setPurchasing(false);
      }
    },
    []
  );

  /*
  =====================================
  LOAD PURCHASED ACCOUNT
  =====================================
  */

  const loadPurchasedAccount =
    useCallback(
      async (
        id: string,
      ) => {
        try {
          const account =
            await getPurchasedSocialLog(
              id,
            );

          setPurchasedAccount(
            account,
          );

          return account;
        } catch (error) {
          console.error(error);

          return null;
        }
      },
      [],
    );

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