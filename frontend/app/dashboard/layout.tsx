"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import WelcomeNotificationModal from "@/components/dashboard/WelcomeNotificationModal";

import { useWallet } from "@/hooks/useWallet";
import { useWelcomeNotification } from "@/hooks/useWelcomeNotification";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { wallet, loading, loadWallet } = useWallet();

  // Show the welcome/notification modal once, right after a fresh login,
  // populated with whatever the admin currently has marked active.
  // The hook is session-gated: it only fires when `LoginForm` set the
  // "just logged in" marker, and clears it on dismiss so it won't reappear
  // on sub-route navigation or refresh.
  const {
    shouldShow: showWelcome,
    notification: welcomeNotification,
    isFirstLogin,
    dismiss: dismissWelcome,
  } = useWelcomeNotification();

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
    <div className="flex min-h-screen overflow-x-hidden bg-white dark:bg-[#050B18]">
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

      {/* Login notification — pops once after a fresh login, if the admin
          currently has an active notification set. */}
      <WelcomeNotificationModal
        shouldShow={showWelcome}
        notification={welcomeNotification}
        isFirstLogin={isFirstLogin}
        onDismiss={dismissWelcome}
      />
    </div>
  );
}