"use client";

import { useCallback, useEffect, useState } from "react";
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
  =====================================
  */

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);

      const data =
        await getSocialLogs(filters);

      setLogs(data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to load social logs.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

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
    logs,
    loading,

    filters,
    setFilters: updateFilters,

    refresh: loadLogs,

    create,
    update,
    remove,
  };
}