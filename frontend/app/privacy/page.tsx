"use client";

import { Shield } from "lucide-react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `We collect information that you provide directly to us when you create an account, including your name, email address, and password. When you fund your wallet or make purchases, we record transaction details including payment references, amounts, and dates. We also automatically collect certain technical data such as your IP address, browser type, and usage patterns through cookies and similar technologies.

We do not collect or store your full payment card details — all payment processing is handled securely by our payment gateway partner, Paystack. We only receive a transaction reference and confirmation of payment success or failure.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to provide and improve our services, including authenticating your account, processing transactions, delivering purchased virtual numbers and social accounts, and communicating with you about your orders and account status. We also use your data to detect and prevent fraud, comply with legal obligations, and provide customer support.

We do not sell, rent, or trade your personal information to third parties. We may share limited data with our service providers (such as Paystack and 5sim) who help us operate the platform, but only to the extent necessary to provide the services you requested.`,
  },
  {
    title: "3. Data Security",
    content: `We take security seriously. Your password is hashed using bcrypt with a salt factor of 12 — we never store passwords in plain text. Authentication is handled via JSON Web Tokens (JWT) with a 7-day expiration. All API communication is encrypted over HTTPS. Wallet balances are stored as decimal values in our database with precision safeguards to prevent rounding errors.

Access to your account is protected by your password. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. We recommend using a strong, unique password and enabling two-factor authentication where available.`,
  },
  {
    title: "4. SMS and Purchase Data",
    content: `When you purchase a virtual phone number, the SMS messages received on that number are stored temporarily in our database so you can view them through your dashboard. SMS data is automatically purged after the rental period expires. Social account credentials (login emails, passwords, cookies, backup codes) are stored encrypted and are only accessible to the purchaser after a successful transaction.

You may delete your purchased social log data at any time from your dashboard. Once deleted, this data cannot be recovered.`,
  },
  {
    title: "5. Cookies",
    content: `We use cookies to maintain your authentication session, remember your theme preference (light/dark mode), and analyze platform usage. We do not use cookies for third-party advertising tracking. You can control cookies through your browser settings, but disabling them may affect your ability to log in and use certain features. See our Cookie Policy for more details.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the right to access, correct, or delete your personal information. You can update your profile information from your dashboard settings. To request a full data export or account deletion, contact us at support@joshseclogs.com. We will process your request within 30 days.

You may also opt out of promotional communications at any time by adjusting your notification preferences in your dashboard settings or by clicking the unsubscribe link in any promotional email.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain your account information for as long as your account is active. Transaction records are retained for a minimum of 5 years to comply with financial record-keeping requirements. SMS data is purged after rental periods expire. If you delete your account, we will remove your personal information within 30 days, except where we are legally required to retain certain records.`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "last updated" date. We encourage you to review this policy periodically to stay informed about how we protect your information.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PublicPageLayout>
      <section className="relative overflow-hidden py-20">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-500">
            <Shield size={16} />
            Legal
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Privacy Policy
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
