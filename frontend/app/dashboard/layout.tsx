"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

import { useWallet } from "@/hooks/useWallet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { wallet, loading, loadWallet } = useWallet();

  // Poll the wallet, but pause while the tab is hidden — no point
  // hammering the API for a user who isn't looking at the screen.
  useEffect(() => {
    loadWallet();

    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          loadWallet();
        }
      }, 15000); // was labeled "15 seconds" but set to 5000 — fixed to match
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadWallet(); // catch up immediately on return to tab
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadWallet]);

  // Close the mobile drawer on Escape, and don't let the drawer
  // steal scroll from the body when it's open on a small screen.
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleCollapsed = useCallback(() => setCollapsed((p) => !p), []);
  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), []);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#050B18]">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileToggle={toggleMobile}
      />

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <div className="px-4 pt-4 lg:px-8 lg:pt-6">
          <Topbar
            wallet={wallet}
            walletLoading={loading}
            onMenuClick={toggleMobile}
            onCollapseToggle={toggleCollapsed}
            collapsed={collapsed}
          />
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
