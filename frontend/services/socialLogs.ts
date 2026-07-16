import api from "@/lib/axios";

import type {
  SocialLog,
  PurchasedSocialLog,
  SocialLogCategory,
  SocialLogFilters,
  CreateSocialLogDto,
  UpdateSocialLogDto,
  PurchaseSocialLogResponse,
} from "@/types/social-log";

/* ===============================
   GET ALL SOCIAL LOGS
   Accepts optional filters — { platform } and/or
   { category } both work here since the backend's
   GET /social-logs route reads both query params.
=============================== */
export async function getSocialLogs(
  filters?: SocialLogFilters,
): Promise<SocialLog[]> {
  const { data } = await api.get("/social-logs", {
    params: filters,
  });
  return data.data ?? data;
}

/* ===============================
   GET SINGLE SOCIAL LOG
=============================== */
export async function getSocialLog(
  id: string,
): Promise<SocialLog> {
  const { data } = await api.get(`/social-logs/${id}`);
  return data.data ?? data;
}

/* ===============================
   CREATE (Admin)
=============================== */
export async function createSocialLog(
  payload: CreateSocialLogDto,
): Promise<SocialLog> {
  const { data } = await api.post("/social-logs", payload);
  return data.data ?? data;
}

/* ===============================
   UPDATE (Admin)
=============================== */
export async function updateSocialLog(
  id: string,
  payload: UpdateSocialLogDto,
): Promise<SocialLog> {
  const { data } = await api.patch(`/social-logs/${id}`, payload);
  return data.data ?? data;
}

/* ===============================
   DELETE (Admin)
=============================== */
export async function deleteSocialLog(
  id: string,
): Promise<void> {
  await api.delete(`/social-logs/${id}`);
}

/* ===============================
   MARK SOLD (Admin)
=============================== */
export async function markSoldSocialLog(
  id: string,
  buyerId: string,
): Promise<SocialLog> {
  const { data } = await api.patch(`/social-logs/${id}/sold/${buyerId}`);
  return data.data ?? data;
}

/* ===============================
   GET CATEGORIES
   Grouped tab-summary list — { category, count, total }[]
=============================== */
export async function getSocialLogCategories(): Promise<SocialLogCategory[]> {
  const { data } = await api.get("/social-logs/categories");
  return data.data ?? data;
}

/* ===============================
   PURCHASE ACCOUNT
=============================== */
export async function purchaseSocialLog(
  id: string,
): Promise<PurchaseSocialLogResponse> {
  const { data } = await api.post(`/social-logs/${id}/purchase`);
  return data.data ?? data;
}

/* ===============================
   GET MY PURCHASES (list)
=============================== */
export async function getMyPurchases(): Promise<SocialLog[]> {
  const { data } = await api.get("/social-logs/my-purchases");
  return data.data ?? data;
}

/* ===============================
   GET PURCHASED ACCOUNT (credentials)
=============================== */
export async function getPurchasedSocialLog(
  id: string,
): Promise<PurchasedSocialLog> {
  const { data } = await api.get(`/social-logs/my-purchases/${id}`);
  return data.data ?? data;
}