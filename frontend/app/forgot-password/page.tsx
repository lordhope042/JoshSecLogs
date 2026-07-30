"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err: any) {
      // The backend always returns a generic success message to
      // prevent account enumeration, so we show success even on
      // network errors to avoid leaking information.
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
          {!submitted ? (
            <>
              <h1 className="text-xl font-semibold mb-1">Forgot password?</h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-zinc-400 block mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 size={40} className="text-orange-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold mb-1">Check your email</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                If an account exists for <span className="text-gray-800 dark:text-zinc-200">{email}</span>, we&apos;ve sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 mt-4 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
