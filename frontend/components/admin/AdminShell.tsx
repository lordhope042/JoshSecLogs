"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import api from "@/lib/axios";

interface Props {
  children: ReactNode;
}

export default function AdminShell({ children }: Props) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/auth/me")
      .then((user: any) => {
        if (!active) return;
        if (user?.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }
        setAuthorized(true);
      })
      .catch(() => {
        if (active) router.replace("/login");
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0B1220]">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0B1220]">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <AdminTopbar
          onMenuClick={() => setCollapsed((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0F172A] p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
