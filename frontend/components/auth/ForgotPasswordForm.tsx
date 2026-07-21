"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  return (
    <form className="space-y-6">

      <div>

        <label className="mb-2 block text-sm text-gray-700 dark:text-zinc-300">
          Email Address
        </label>

        <input
          type="email"
          placeholder="example@email.com"
          className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-[#1b2434] px-4 py-3 text-gray-900 dark:text-white outline-none transition-all focus:border-orange-500"
        />

      </div>

      <Button className="h-12 w-full rounded-xl bg-orange-500 hover:bg-orange-600">

        Send Reset Link

      </Button>

      <Link
        href="/login"
        className="block text-center text-orange-500 hover:underline"
      >
        ← Back to Login
      </Link>

    </form>
  );
} 