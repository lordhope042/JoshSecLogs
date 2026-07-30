"use client";

import { FileText } from "lucide-react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By creating an account on JoshSecLogs or using any of our services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our platform. These terms constitute a legally binding agreement between you and JoshSecLogs.

We may revise these terms at any time by updating this page. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms. It is your responsibility to review these terms periodically.`,
  },
  {
    title: "2. Eligibility",
    content: `You must be at least 18 years old to use JoshSecLogs. By registering, you represent and warrant that you meet this age requirement and that the information you provide during registration is accurate, complete, and current. You are responsible for maintaining the accuracy of your account information.

You may not create an account if you have been previously banned from the platform for violations of these terms.`,
  },
  {
    title: "3. Account Security",
    content: `You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other security breach. We are not liable for any losses caused by unauthorized access to your account resulting from your failure to maintain the confidentiality of your credentials.

You agree not to share your account credentials with third parties or allow others to use your account. Each account is intended for individual use only.`,
  },
  {
    title: "4. Wallet and Payments",
    content: `JoshSecLogs operates on a prepaid wallet system. You fund your wallet using Paystack, and purchases are deducted from your wallet balance automatically. All wallet balances are denominated in Nigerian Naira (₦). 

We reserve the right to refuse or reverse any payment that we suspect may be fraudulent, unauthorized, or in violation of these terms. Wallet balances are non-transferable between accounts and cannot be converted back to cash except in cases of verified platform errors, at our sole discretion.`,
  },
  {
    title: "5. Virtual Phone Numbers",
    content: `Virtual phone numbers provided through our platform are rented for temporary use, typically for SMS verification purposes. The rental period varies by product and is displayed at the time of purchase. Numbers are not permanently owned by you and will be deactivated after the rental period expires.

You agree not to use virtual numbers for any illegal activities, including but not limited to fraud, harassment, spam, or creating accounts in violation of third-party platform terms. JoshSecLogs is not responsible for any consequences resulting from your use of virtual numbers, including account suspensions or bans by third-party platforms.`,
  },
  {
    title: "6. Social Accounts",
    content: `Social media accounts sold through our marketplace are provided on an "as-is" basis. We make reasonable efforts to verify that accounts are functional at the time of sale, but we cannot guarantee the ongoing availability or status of any account after purchase, as third-party platforms may suspend or ban accounts at their discretion.

If a purchased social account is non-functional at the time of delivery, you may request a replacement or refund within 24 hours of purchase by contacting support. Requests made after 24 hours will be evaluated on a case-by-case basis.`,
  },
  {
    title: "7. Prohibited Conduct",
    content: `You agree not to use JoshSecLogs to engage in any of the following: creating accounts on third-party platforms for fraudulent purposes; sending unsolicited commercial messages; impersonating another person or entity; violating any applicable local, national, or international law; attempting to reverse-engineer, hack, or disrupt the platform; using automated scripts or bots to access the platform in a manner that exceeds normal usage; or reselling purchased numbers or accounts without authorization.

Violation of these provisions may result in immediate account suspension, wallet balance forfeiture, and legal action where applicable.`,
  },
  {
    title: "8. Refund Policy",
    content: `If a virtual phone number fails to receive an SMS within its rental period, you are entitled to an automatic full refund by canceling the order from your dashboard. The refund is credited to your wallet balance immediately upon cancellation.

For social account purchases, refunds or replacements are available within 24 hours if the account is non-functional at delivery. Wallet balance refunds for unused funds are handled on a case-by-case basis — contact support@joshseclogs.com to request a wallet withdrawal.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `JoshSecLogs is provided on an "as-is" and "as-available" basis. To the maximum extent permitted by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.

Our total liability for any claim arising from your use of the platform shall not exceed the total amount you have paid to JoshSecLogs in the 30 days preceding the claim.`,
  },
  {
    title: "10. Termination",
    content: `We may suspend or terminate your account at any time, with or without cause, including for violations of these terms. Upon termination, your right to use the platform ceases immediately. You may close your account at any time by contacting support.

Provisions that by their nature should survive termination — including ownership rights, disclaimers, and limitation of liability — shall remain in effect after account closure.`,
  },
  {
    title: "11. Governing Law",
    content: `These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from your use of JoshSecLogs shall be resolved in the courts of Nigeria, without regard to conflict of law principles.`,
  },
];

export default function TermsPage() {
  return (
    <PublicPageLayout>
      <section className="relative overflow-hidden py-20">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-500">
            <FileText size={16} />
            Legal
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Terms of Service
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
