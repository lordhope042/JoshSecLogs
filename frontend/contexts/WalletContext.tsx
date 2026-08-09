"use client";

/**
 * WalletContext — single source of truth for wallet state across the
 * whole dashboard.
 *
 * THE BUG THIS FIXES: `useWallet()` is a plain hook with no shared
 * state — every component that calls it gets its OWN independent copy
 * of `wallet`/`balance`/`transactions`, and fires its OWN separate
 * network request. DashboardLayout called it once and fed the result
 * into <Topbar> as props (so Topbar worked), while DashboardPage
 * called it AGAIN on its own, getting a second, disconnected fetch —
 * which is why the two could show different values (or one showing
 * real data, the other stuck at 0) even though they're "the same
 * hook". They were never actually sharing anything.
 *
 * THE FIX: call useWallet() exactly ONCE, here, and expose it via
 * React Context. Every component that needs wallet data — Topbar,
 * DashboardPage, WalletPage, anything else — reads from this same
 * Provider instead of calling useWallet() itself. One fetch, one
 * source of truth, no more drift between components.
 */
import { createContext, useContext, useEffect, useRef } from "react";
import { useWallet as useWalletState } from "@/hooks/useWallet";

type WalletContextValue = ReturnType<typeof useWalletState>;

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const walletState = useWalletState();
  const { loadWallet } = walletState;

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Moved here from DashboardLayout — polls the wallet every 15s while
  // the tab is visible, and catches up immediately on return to tab.
  // This now runs exactly once for the whole app, instead of once per
  // component that happens to call useWallet().
  useEffect(() => {
    loadWallet();

    const start = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => {
        if (document.visibilityState === "visible") {
          loadWallet();
        }
      }, 15000);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadWallet();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadWallet]);

  return (
    <WalletContext.Provider value={walletState}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Use this everywhere you'd otherwise call useWallet() directly inside
 * the dashboard (Topbar, DashboardPage, WalletPage, etc.) — it reads
 * the single shared instance from WalletProvider instead of creating
 * a new, disconnected one.
 */
export function useWalletContext(): WalletContextValue {
  const ctx = useContext(WalletContext);

  if (!ctx) {
    throw new Error(
      "useWalletContext() must be used inside <WalletProvider>. Wrap DashboardLayout's return value with it.",
    );
  }

  return ctx;
}