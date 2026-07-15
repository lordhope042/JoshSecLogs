"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

interface Props {
  children: ReactNode;
}

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return decoded;
  } catch {
    return null;
  }
}

export default function AdminShell({ children }: Props) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const decoded = decodeToken(token);

    if (!decoded) {
      localStorage.removeItem("access_token");
      router.replace("/login");
      return;
    }

    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      localStorage.removeItem("access_token");
      router.replace("/login");
      return;
    }

    if (decoded.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1220]">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0B1220]">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <AdminTopbar
          onMenuClick={() => setCollapsed((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto bg-[#0F172A] p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}