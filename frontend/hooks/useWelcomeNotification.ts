"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";

/**
 * useWelcomeNotification
 *
 * Decides whether the welcome/notification modal should appear when the user
 * reaches the dashboard, AND fetches the currently active admin-configured
 * notification to populate it.
 *
 * Every notification is entered by the admin the same way — there's no
 * "type" to pick. The single latest active notification is fetched for
 * everyone; whether the modal renders it as a first-time "welcome" or a
 * "welcome back" card is decided here, purely from this login's own
 * `isFirstLogin` flag (set by `LoginForm` via `markJustLoggedIn`) — not
 * from anything on the notification itself.
 *
 * Trigger logic:
 *   - `LoginForm` sets `sessionStorage["jsl_just_logged_in"] = "1"` and
 *     `sessionStorage["jsl_is_first_login"]` right after a successful login.
 *   - On dashboard mount, this hook checks for the "just logged in" flag.
 *   - If present AND the user hasn't permanently dismissed it this session
 *     (`jsl_welcome_dismissed`), it fetches GET /notifications/active.
 *   - The modal only shows if the backend actually returns an active
 *     notification — no notification, no popup, even on a fresh login.
 *   - On dismiss, both flags are cleared so it never re-triggers until the
 *     next real login.
 */

const JUST_LOGGED_IN_KEY = "jsl_just_logged_in";
const IS_FIRST_LOGIN_KEY = "jsl_is_first_login";
const DISMISSED_KEY = "jsl_welcome_dismissed";

export interface ActiveNotification {
  id: string;
  title: string;
  message: string;
  telegramUrl?: string | null;
  whatsappUrl?: string | null;
}

export function useWelcomeNotification() {
  const [shouldShow, setShouldShow] = useState(false);
  const [notification, setNotification] =
    useState<ActiveNotification | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    // Guard for SSR — sessionStorage only exists in the browser.
    if (typeof window === "undefined") return;

    const justLoggedIn =
      sessionStorage.getItem(JUST_LOGGED_IN_KEY) === "1";
    const dismissed =
      sessionStorage.getItem(DISMISSED_KEY) === "1";

    if (!justLoggedIn || dismissed) return;

    const isFirstLoginRaw = sessionStorage.getItem(IS_FIRST_LOGIN_KEY);
    if (isFirstLoginRaw === "true" || isFirstLoginRaw === "false") {
      setIsFirstLogin(isFirstLoginRaw === "true");
    }

    let cancelled = false;

    api
      .get("/notifications/active")
      .then((res) => {
        if (cancelled) return;
        // NOTE: the shared axios instance's response interceptor already
        // unwraps `response.data`, so `res` here IS the backend JSON body
        // directly (the notification object, or null) — not `{ data }`.
        const data = res as unknown as ActiveNotification | null;
        if (data) {
          setNotification(data);
          setShouldShow(true);
        }
      })
      .catch(() => {
        // Silently skip the modal if the fetch fails — a broken
        // notification fetch should never block dashboard access.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    if (typeof window === "undefined") return;
    // Clear the "just logged in" markers so navigating around the
    // dashboard (or refreshing) won't re-trigger the modal.
    sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
    sessionStorage.removeItem(IS_FIRST_LOGIN_KEY);
    setShouldShow(false);
  }, []);

  return { shouldShow, notification, isFirstLogin, dismiss };
}

/**
 * markJustLoggedIn
 *
 * Call this immediately after a successful login (in `LoginForm`), passing
 * the `isFirstLogin` flag from the login response. Stamps the sessionStorage
 * flags that `useWelcomeNotification` watches. Safe to call during SSR — it
 * no-ops on the server.
 */
export function markJustLoggedIn(isFirstLogin?: boolean) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(JUST_LOGGED_IN_KEY, "1");
  if (typeof isFirstLogin === "boolean") {
    sessionStorage.setItem(IS_FIRST_LOGIN_KEY, String(isFirstLogin));
  }
}