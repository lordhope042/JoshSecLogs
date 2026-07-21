"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  SocialLog,
  SocialLogFilters,
  CreateSocialLogDto,
  UpdateSocialLogDto,
} from "@/types/social-log";

import {
  getSocialLogs,
  createSocialLog,
  updateSocialLog,
  deleteSocialLog,
} from "@/services/socialLogs";

function normalizeStatus(status: string | undefined | null): string {
  return (status ?? "").toString().toUpperCase().trim();
}

export function useAdminSocialLogs(
  initialFilters?: SocialLogFilters,
) {
  const [logs, setLogs] = useState<SocialLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] =
    useState<SocialLogFilters>(
      initialFilters ?? {},
    );

  /*
  =====================================
      LOAD LOGS
      NOTE: GET /social-logs only reads @Query("platform") on the
      backend — category/status/country/search/sort are silently
      ignored there. Only refetch when platform changes; everything
      else is applied client-side below via filteredLogs.
  =====================================
  */

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);

      const data =
        await getSocialLogs({ platform: filters.platform });

      setLogs(data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to load social logs.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters.platform]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  /*
  =====================================
      CLIENT-SIDE FILTER + SORT
      Everything the backend doesn't filter for us.
  =====================================
  */

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (filters.search) {
      const keyword = filters.search.toLowerCase();
      result = result.filter(
        (log) =>
          log.username?.toLowerCase().includes(keyword) ||
          log.platform?.toLowerCase().includes(keyword) ||
          log.country?.toLowerCase().includes(keyword),
      );
    }

    if (filters.category) {
      result = result.filter((log) => log.category === filters.category);
    }

    if (filters.status) {
      result = result.filter(
        (log) => normalizeStatus(log.status) === normalizeStatus(filters.status),
      );
    }

    if (filters.country) {
      const keyword = filters.country.toLowerCase();
      result = result.filter((log) => log.country?.toLowerCase().includes(keyword));
    }

    switch (filters.sort) {
      case "price_desc":
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case "price_asc":
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case "followers_desc":
        result.sort((a, b) => (Number(b.followers) || 0) - (Number(a.followers) || 0));
        break;
      case "followers_asc":
        result.sort((a, b) => (Number(a.followers) || 0) - (Number(b.followers) || 0));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    }

    return result;
  }, [logs, filters]);

  /*
  =====================================
      CREATE
  =====================================
  */

  const create = async (
    payload: CreateSocialLogDto,
  ) => {
    try {
      setLoading(true);

      await createSocialLog(payload);

      toast.success(
        "Social log created successfully.",
      );

      await loadLogs();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Unable to create social log.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      UPDATE
  =====================================
  */

  const update = async (
    id: string,
    payload: UpdateSocialLogDto,
  ) => {
    try {
      setLoading(true);

      await updateSocialLog(id, payload);

      toast.success(
        "Social log updated successfully.",
      );

      await loadLogs();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Unable to update social log.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      DELETE
  =====================================
  */

  const remove = async (id: string) => {
    try {
      setLoading(true);

      await deleteSocialLog(id);

      toast.success(
        "Social log deleted successfully.",
      );

      await loadLogs();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Unable to delete social log.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
      FILTERS
  =====================================
  */

  const updateFilters = (
    value: Partial<SocialLogFilters>,
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...value,
    }));
  };

  return {
    logs: filteredLogs,
    loading,

    filters,
    setFilters: updateFilters,

    refresh: loadLogs,

    create,
    update,
    remove,
  };
}