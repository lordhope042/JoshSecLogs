"use client";

import { useEffect, useState } from "react";

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

  const {
    wallet,
    loading,
    loadWallet,
  } = useWallet();

  useEffect(() => {
    loadWallet();

    const interval = setInterval(() => {
      loadWallet();
    }, 5000); // refresh every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#050B18]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() =>
          setCollapsed((prev) => !prev)
        }
        mobileOpen={mobileOpen}
        onMobileToggle={() =>
          setMobileOpen((prev) => !prev)
        }
      />

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <Topbar
          wallet={wallet}
          walletLoading={loading}
          onMenuClick={() =>
            setMobileOpen((prev) => !prev)
          }
          onCollapseToggle={() =>
            setCollapsed((prev) => !prev)
          }
        />

        <main className="flex-1 overflow-y-auto bg-[#0F172A] p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}