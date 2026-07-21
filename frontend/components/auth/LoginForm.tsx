"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  LoginData,
} from "@/lib/validations/login";

import api from "@/lib/axios";

import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginData) {
    try {
      const res = await api.post(
        "/auth/login",
        data,
      );

      const {
        accessToken,
        user,
      } = res.data;

      localStorage.setItem(
        "access_token",
        accessToken,
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user),
      );

      toast.success(
        `Welcome back ${user.name}!`,
      );

      /*
      =====================================
          ADMIN REDIRECT
      =====================================
      */

      if (user.role === "ADMIN") {
        router.replace("/admin");
        return;
      }

      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Invalid email or password.",
      );
    }
  }

  const input =
    "w-full rounded-2xl border border-zinc-700 bg-[#111827]/80 py-3.5 pl-12 pr-4 text-white outline-none transition-all placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

  return (
    <div className="overflow-hidden rounded-3xl border border-orange-500/20 bg-gray-50/90 dark:bg-[#0b1220]/90 p-8 shadow-[0_0_80px_rgba(255,120,0,.08)] backdrop-blur-xl">

      {/* Header */}

      <div className="mb-8">

        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">

          <ShieldCheck className="h-8 w-8 text-gray-900 dark:text-white" />

        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-zinc-400">
          Login to your JoshSecLogs account
          to purchase Virtual Numbers,
          Social Media Accounts,
          Digital Logs and manage
          your wallet securely.
        </p>

      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >

        {/* EMAIL */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
            Email Address
          </label>

          <div className="relative">

            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
            />

            <input
              type="email"
              placeholder="example@email.com"
              className={input}
              {...register("email")}
            />

          </div>

          {errors.email && (
            <p className="mt-2 text-sm text-red-500">
              {errors.email.message}
            </p>
          )}

        </div>

        {/* PASSWORD */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
            Password
          </label>

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter password"
              className={`${input} pr-12`}
              {...register("password")}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 transition hover:text-orange-500"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>

          {errors.password && (
            <p className="mt-2 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}

        </div>

        {/* REMEMBER */}

        <div className="flex items-center justify-between">

          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">

            <input
              type="checkbox"
              className="accent-orange-500"
            />

            Remember me

          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-orange-500 hover:text-orange-400"
          >
            Forgot Password?
          </Link>

        </div>

        {/* LOGIN */}

        <Button
          disabled={isSubmitting}
          type="submit"
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-base font-semibold transition hover:scale-[1.01] hover:from-orange-600 hover:to-orange-500"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
              Signing In...
            </>
          ) : (
            "Login"
          )}
        </Button>

        {/* DIVIDER */}

        <div className="relative">

          <div className="absolute inset-0 flex items-center">

            <div className="w-full border-t border-gray-300 dark:border-zinc-700"></div>

          </div>

          <div className="relative flex justify-center">

            <span className="bg-gray-50 dark:bg-[#0b1220] px-4 text-sm text-gray-400 dark:text-zinc-500">
              OR CONTINUE WITH
            </span>

          </div>

        </div>

        {/* GOOGLE */}

        <Button
          type="button"
          variant="outline"
          className="h-14 w-full rounded-2xl border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#111827] text-gray-900 dark:text-white transition hover:bg-[#192438]"
        >

          <svg
            className="mr-3 h-5 w-5"
            viewBox="0 0 24 24"
          >
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.4c-.2 1.3-.9 2.4-2 3.2l3.2 2.5c1.9-1.8 3-4.4 3-7.6 0-.7-.1-1.4-.2-2H12z"
            />

            <path
              fill="#34A853"
              d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9v2.7A10 10 0 0012 22z"
            />

            <path
              fill="#FBBC05"
              d="M6.2 13.6A6 6 0 016 12c0-.6.1-1.1.2-1.6V7.7H2.9A10 10 0 002 12c0 1.6.4 3.2.9 4.3l3.3-2.7z"
            />

            <path
              fill="#4285F4"
              d="M12 6c1.5 0 2.9.5 4 1.6l3-3A10 10 0 0012 2 10 10 0 002.9 7.7l3.3 2.7C7 7.8 9.3 6 12 6z"
            />
          </svg>

          Continue with Google

        </Button>

        {/* REGISTER */}

        <div className="pt-2 text-center text-sm text-gray-500 dark:text-zinc-400">

          Don't have an account?

          <Link
            href="/register"
            className="ml-2 font-semibold text-orange-500 hover:text-orange-400"
          >
            Create Account
          </Link>

        </div>

      </form>

    </div>
  );
}