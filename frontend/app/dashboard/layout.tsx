"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import WelcomeNotificationModal from "@/components/dashboard/WelcomeNotificationModal";

import { WalletProvider, useWalletContext } from "@/contexts/WalletContext";
import { useWelcomeNotification } from "@/hooks/useWelcomeNotification";

// The actual layout body — split out so it can sit INSIDE
// <WalletProvider> and call useWalletContext(). (Providers can't
// supply context to their own direct children's props before the
// provider itself has rendered, so the consumer has to be a child
// component, not the same component that renders the provider.)
function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // FIX: was `useWallet()` directly — now reads the single shared
  // instance from WalletProvider. Polling/loadWallet-on-mount is now
  // handled once inside WalletProvider itself, not duplicated here.
  const { wallet, loading } = useWalletContext();

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </WalletProvider>
  );
}