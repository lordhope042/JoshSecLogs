"use client";

import { Cookie } from "lucide-react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";

const SECTIONS = [
  {
    title: "1. What Are Cookies",
    content: `Cookies are small text files that websites place on your device when you visit them. They allow the website to recognize your device and remember information about your visit, such as your login status, preferences, and browsing behavior. Cookies are widely used to make websites work efficiently and to provide a better user experience.

JoshSecLogs uses both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device until they expire or you delete them) to provide our services.`,
  },
  {
    title: "2. Types of Cookies We Use",
    content: `Essential Cookies: These are required for the platform to function. They maintain your authentication session, allowing you to stay logged in as you navigate between pages. Without these cookies, you would need to log in again on every page load. These cookies cannot be disabled if you wish to use the platform.

Preference Cookies: These remember your choices, such as whether you prefer light or dark mode. They are stored locally in your browser's localStorage and enhance your experience by applying your preferred settings automatically.

Functional Cookies: These allow the platform to remember your notification preferences and other customizable settings. They are stored in localStorage and persist across sessions.

We do NOT use advertising cookies, tracking cookies, or third-party analytics cookies. We do not sell cookie-based data to advertisers or third parties.`,
  },
  {
    title: "3. Managing Cookies",
    content: `You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. If you disable essential cookies, you will not be able to log in or use the platform's core features.

To manage cookies in Chrome: Settings → Privacy and security → Cookies and other site data. In Firefox: Settings → Privacy & Security → Cookies and Site Data. In Safari: Preferences → Privacy → Cookies and website data.

Note that clearing cookies will log you out of your account and reset your theme preference. You will need to log in again after clearing cookies.`,
  },
  {
    title: "4. localStorage Usage",
    content: `In addition to cookies, JoshSecLogs uses browser localStorage to store the following non-sensitive data: your JWT access token (for authentication), your theme preference (light/dark), and your notification preferences. This data is stored on your device and is not transmitted to our servers except where needed for authentication.

You can clear localStorage by clearing your browser data or using your browser's developer tools. Clearing localStorage will log you out of the platform.`,
  },
  {
    title: "5. Updates to This Policy",
    content: `We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. We will post any changes on this page and update the "last updated" date. We encourage you to review this policy periodically.`,
  },
];

export default function CookiesPage() {
  return (
    <PublicPageLayout>
      <section className="relative overflow-hidden py-20">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-500">
            <Cookie size={16} />
            Legal
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-4 text-sm text-gray-500 dark:text-zinc-500">Last updated: January 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-700 dark:text-zinc-300">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PublicPageLayout>
  );
}
