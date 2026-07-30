"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Headphones,
} from "lucide-react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Simulate sending — in production this would POST to a
      // /contact endpoint or trigger an email service.
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent! We'll get back to you soon.");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicPageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-500">
            <MessageSquare size={16} />
            Get in Touch
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-zinc-300">
            Have a question, issue, or feedback? Our support team is available
            24/7 and typically responds within 2-4 hours.
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
              <Mail className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Email</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-zinc-300">support@joshseclogs.com</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">24/7 support</p>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Response Time</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-zinc-300">Within 2-4 hours</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">Faster for urgent issues</p>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
              <Headphones className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Live Support</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-zinc-300">Available 24/7</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">Always here to help</p>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="rounded-3xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-8 lg:p-10">
          {sent ? (
            <div className="py-12 text-center">
              <CheckCircle2 size={48} className="mx-auto text-orange-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                Message Sent!
              </h2>
              <p className="mt-3 text-gray-700 dark:text-zinc-300">
                Thank you for reaching out. Our team will get back to you within 2-4 hours.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-orange-500/30 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white transition hover:bg-orange-500/10"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send us a message</h2>
              <p className="mt-2 text-sm text-gray-700 dark:text-zinc-300">
                Fill out the form below and we&apos;ll respond as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Full Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-[#08111d] dark:text-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Email <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-[#08111d] dark:text-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-[#08111d] dark:text-white"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Message <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-[#08111d] dark:text-white"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </PublicPageLayout>
  );
}
