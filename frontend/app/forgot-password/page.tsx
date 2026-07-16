"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

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
      // TODO: wire to real API endpoint, e.g. POST /auth/forgot-password
      await new Promise((r) => setTimeout(r, 900));
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="bg-[#0B1220] border border-zinc-800 rounded-xl p-6">
          {!submitted ? (
            <>
              <h1 className="text-xl font-semibold mb-1">Forgot password?</h1>
              <p className="text-sm text-zinc-400 mb-6">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 block mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0f172a] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 size={40} className="text-orange-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold mb-1">Check your email</h2>
              <p className="text-sm text-zinc-400">
                We&apos;ve sent a password reset link to <span className="text-zinc-200">{email}</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}