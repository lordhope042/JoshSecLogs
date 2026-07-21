"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import type {
  CreateSocialLogDto,
  SocialPlatform,
  SocialLogCategoryValue,
  SocialLogPageType,
} from "@/types/social-log";

interface FormValues {
  platform: SocialPlatform | "";
  category: SocialLogCategoryValue | "";
  pageType?: SocialLogPageType | "";
  country: string;
  username: string;
  age: number | "";
  followers?: number | "";
  price: number | "";
  emailAttached: boolean;
  phoneAttached: boolean;
  twoFactor: boolean;
  ogEmail: boolean;
  verified: boolean;
  description?: string;
  image?: string;

  loginEmail?: string;
  emailPassword?: string;
  accountPassword?: string;
  twoFactorSecret?: string;
  recoveryEmail?: string;
  backupCodes?: string;
  cookies?: string;
  notes?: string;
}

interface Props {
  initialData?: Partial<FormValues>;
  onSubmit: (values: CreateSocialLogDto) => Promise<void>;
}

const PLATFORMS: SocialPlatform[] = [
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "X",
  "SNAPCHAT",
  "TELEGRAM",
  "DISCORD",
  "REDDIT",
  "LINKEDIN",
  "YOUTUBE",
  "GMAIL",
  "OUTLOOK",
  "VPN",
  "TEXTPLUS",
  "NEXTPLUS",
  "MAIL",
];

const CATEGORIES: { value: SocialLogCategoryValue; label: string }[] = [
  { value: "FACEBOOK_PAGE", label: "Facebook — Page" },
  { value: "FACEBOOK_COUNTRY", label: "Facebook — By Country" },
  { value: "TWITTER_FOLLOWERS", label: "Twitter — Followers" },
  { value: "INSTAGRAM_FOLLOWERS", label: "Instagram — Followers" },
  { value: "VPN", label: "VPN" },
  { value: "TEXTPLUS_NEXTPLUS", label: "Textplus & Nextplus" },
  { value: "TELEGRAM_ACCOUNT", label: "Telegram" },
  { value: "TIKTOK_COUNTRY", label: "TikTok — By Country" },
  { value: "TIKTOK_FOLLOWERS", label: "TikTok — Followers" },
  { value: "MAIL", label: "Mail" },
];

const PAGE_TYPES: { value: SocialLogPageType; label: string }[] = [
  { value: "CREATE_PAGE", label: "Create Page" },
  { value: "CREATED_PAGE", label: "Created Page" },
  { value: "MULTI_PAGE", label: "2+ Pages" },
  { value: "PAGE_WITH_FOLLOWERS", label: "Page with Followers" },
];

// Tier thresholds shown as quick-pick buttons when the category needs
// a followers tier. Values match what's stored on the `followers`
// column — 0 doubles as "empty" for Instagram.
const FOLLOWER_TIERS: Record<string, { value: number; label: string }[]> = {
  TWITTER_FOLLOWERS: [
    { value: 100, label: "100+" },
    { value: 200, label: "200+" },
    { value: 500, label: "500+" },
    { value: 1000, label: "1k+" },
  ],
  INSTAGRAM_FOLLOWERS: [
    { value: 0, label: "Empty" },
    { value: 500, label: "500+" },
    { value: 1000, label: "1k+" },
  ],
  // No tier list was given for this one — reusing Twitter's tiers as a
  // starting point. Tell me the real tiers and I'll swap these.
  TIKTOK_FOLLOWERS: [
    { value: 100, label: "100+" },
    { value: 200, label: "200+" },
    { value: 500, label: "500+" },
    { value: 1000, label: "1k+" },
  ],
};

const COUNTRY_CATEGORIES = new Set<SocialLogCategoryValue>([
  "FACEBOOK_COUNTRY",
  "TIKTOK_COUNTRY",
]);

const FOLLOWER_CATEGORIES = new Set<SocialLogCategoryValue>([
  "TWITTER_FOLLOWERS",
  "INSTAGRAM_FOLLOWERS",
  "TIKTOK_FOLLOWERS",
]);

const EMPTY_FORM: FormValues = {
  platform: "",
  category: "",
  pageType: "",
  country: "",
  username: "",
  age: "",
  followers: "",
  price: "",
  emailAttached: false,
  phoneAttached: false,
  twoFactor: false,
  ogEmail: false,
  verified: false,
  description: "",
  image: "",
  loginEmail: "",
  emailPassword: "",
  accountPassword: "",
  twoFactorSecret: "",
  recoveryEmail: "",
  backupCodes: "",
  cookies: "",
  notes: "",
};

const URL_PATTERN = /^https?:\/\/.+/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SocialLogForm({
  initialData,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<FormValues>({
    ...EMPTY_FORM,
    ...initialData,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    setValues({ ...EMPTY_FORM, ...initialData });
  }, [initialData]);

  const needsCountry = values.category ? COUNTRY_CATEGORIES.has(values.category) : false;
  const needsFollowers = values.category ? FOLLOWER_CATEGORIES.has(values.category) : false;
  const needsPageType = values.category === "FACEBOOK_PAGE";
  const tierOptions = values.category ? FOLLOWER_TIERS[values.category] : undefined;

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function updateCategory(category: SocialLogCategoryValue | "") {
    // Clear whichever conditional fields no longer apply so a stray
    // country/pageType/followers value from a previous category can't
    // sneak through on submit.
    setValues((prev) => ({
      ...prev,
      category,
      country: category && COUNTRY_CATEGORIES.has(category) ? prev.country : "",
      followers: category && FOLLOWER_CATEGORIES.has(category) ? prev.followers : "",
      pageType: category === "FACEBOOK_PAGE" ? prev.pageType : "",
    }));
    setErrors((prev) => ({ ...prev, category: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormValues, string>> = {};

    if (!values.platform) next.platform = "Platform is required.";
    if (!values.category) next.category = "Category is required.";
    if (!values.username.trim()) next.username = "Username is required.";
    if (values.age === "" || Number(values.age) <= 0)
      next.age = "Enter a valid age.";
    if (values.price === "" || Number(values.price) <= 0)
      next.price = "Enter a valid price in NGN.";

    if (needsCountry && !values.country.trim())
      next.country = "Country is required for this category.";

    if (needsFollowers && (values.followers === "" || values.followers === undefined))
      next.followers = "Select a followers tier for this category.";

    if (needsPageType && !values.pageType)
      next.pageType = "Select a page type.";

    if (values.image?.trim() && !URL_PATTERN.test(values.image.trim()))
      next.image = "Must be a valid URL starting with http:// or https://";

    if (!values.loginEmail?.trim())
      next.loginEmail = "Login email is required.";

    if (values.loginEmail?.trim() && !EMAIL_PATTERN.test(values.loginEmail.trim()))
      next.loginEmail = "Enter a valid email address.";

    if (values.recoveryEmail?.trim() && !EMAIL_PATTERN.test(values.recoveryEmail.trim()))
      next.recoveryEmail = "Enter a valid email address.";

    if (!values.accountPassword?.trim())
      next.accountPassword = "Password is required to deliver the account.";

    if (values.cookies?.trim()) {
      try {
        JSON.parse(values.cookies);
      } catch {
        next.cookies = "Cookies must be valid JSON.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload: CreateSocialLogDto = {
        platform: values.platform as SocialPlatform,
        category: values.category as SocialLogCategoryValue,
        pageType:
          needsPageType && values.pageType
            ? (values.pageType as SocialLogPageType)
            : undefined,
        country: needsCountry && values.country.trim() ? values.country.trim() : undefined,
        username: values.username.trim(),
        age: Number(values.age),
        followers:
          needsFollowers && values.followers !== "" && values.followers !== undefined
            ? Number(values.followers)
            : undefined,
        price: Number(values.price),
        emailAttached: values.emailAttached,
        phoneAttached: values.phoneAttached,
        twoFactor: values.twoFactor,
        ogEmail: values.ogEmail,
        verified: values.verified,
        description: values.description?.trim() || undefined,
        image: values.image?.trim() || undefined,

        loginEmail: values.loginEmail?.trim() || undefined,
        emailPassword: values.emailPassword?.trim() || undefined,
        accountPassword: values.accountPassword?.trim() || undefined,
        twoFactorSecret: values.twoFactorSecret?.trim() || undefined,
        recoveryEmail: values.recoveryEmail?.trim() || undefined,
        backupCodes: values.backupCodes?.trim()
          ? values.backupCodes.split(",").map((c) => c.trim()).filter(Boolean)
          : undefined,
        cookies: values.cookies?.trim() ? JSON.parse(values.cookies) : undefined,
        notes: values.notes?.trim() || undefined,
      } as CreateSocialLogDto;

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ============================
                ACCOUNT INFO
      ============================ */}

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Account Info
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <Field label="Category" error={errors.category}>
            <select
              value={values.category}
              onChange={(e) => updateCategory(e.target.value as SocialLogCategoryValue | "")}
              className={inputClass(!!errors.category)}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Platform" error={errors.platform}>
            <select
              value={values.platform}
              onChange={(e) => update("platform", e.target.value as SocialPlatform)}
              className={inputClass(!!errors.platform)}
            >
              <option value="">Select platform</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Username" error={errors.username}>
            <input
              type="text"
              value={values.username}
              onChange={(e) => update("username", e.target.value)}
              placeholder="e.g. johndoe123"
              className={inputClass(!!errors.username)}
            />
          </Field>

          <Field label="Age (account age, years)" error={errors.age}>
            <input
              type="number"
              min={0}
              value={values.age}
              onChange={(e) =>
                update("age", e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass(!!errors.age)}
            />
          </Field>

          {/* Conditional: only for FACEBOOK_PAGE */}
          {needsPageType && (
            <Field label="Page Type" error={errors.pageType}>
              <select
                value={values.pageType}
                onChange={(e) => update("pageType", e.target.value as SocialLogPageType)}
                className={inputClass(!!errors.pageType)}
              >
                <option value="">Select page type</option>
                {PAGE_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* Conditional: only for *_COUNTRY categories */}
          {needsCountry && (
            <Field label="Country" error={errors.country}>
              <input
                type="text"
                value={values.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="e.g. Nigeria"
                className={inputClass(!!errors.country)}
              />
            </Field>
          )}

          {/* Conditional: only for *_FOLLOWERS categories */}
          {needsFollowers && (
            <Field label="Followers Tier" error={errors.followers}>
              {tierOptions ? (
                <div className="flex flex-wrap gap-2">
                  {tierOptions.map((tier) => (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => update("followers", tier.value)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        values.followers === tier.value
                          ? "border-orange-500 bg-orange-500/10 text-orange-400"
                          : "border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="number"
                  min={0}
                  value={values.followers}
                  onChange={(e) =>
                    update("followers", e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className={inputClass(!!errors.followers)}
                />
              )}
            </Field>
          )}

          <Field label="Price (₦)" error={errors.price}>
            <input
              type="number"
              min={0}
              value={values.price}
              onChange={(e) =>
                update("price", e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass(!!errors.price)}
            />
          </Field>

        </div>

        <Field label="Cover Image URL (optional)" error={errors.image} className="mt-5">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={values.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="https://..."
              className={inputClass(!!errors.image)}
            />
            {values.image && URL_PATTERN.test(values.image.trim()) && (
              <img
                src={values.image}
                alt="preview"
                className="h-12 w-12 shrink-0 rounded-lg border border-gray-300 dark:border-zinc-700 object-cover"
              />
            )}
          </div>
        </Field>

        <Field label="Description (optional)" className="mt-5">
          <textarea
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            placeholder="Any notes about the account's history, niche, engagement, etc."
            className={inputClass(false)}
          />
        </Field>

      </div>

      {/* ============================
                SECURITY BADGES
      ============================ */}

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Security & Attributes
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Toggle
            label="Verified"
            checked={values.verified}
            onChange={(v) => update("verified", v)}
          />
          <Toggle
            label="OG Email"
            checked={values.ogEmail}
            onChange={(v) => update("ogEmail", v)}
          />
          <Toggle
            label="2FA Enabled"
            checked={values.twoFactor}
            onChange={(v) => update("twoFactor", v)}
          />
          <Toggle
            label="Email Attached"
            checked={values.emailAttached}
            onChange={(v) => update("emailAttached", v)}
          />
          <Toggle
            label="Phone Attached"
            checked={values.phoneAttached}
            onChange={(v) => update("phoneAttached", v)}
          />
        </div>
      </div>

      {/* ============================
                CREDENTIALS
      ============================ */}

      <div>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Login Credentials
        </h3>
        <p className="mb-4 text-xs text-gray-400 dark:text-zinc-500">
          These are handed to the buyer after purchase.
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <Field label="Login Email" error={errors.loginEmail}>
            <input
              type="text"
              value={values.loginEmail}
              onChange={(e) => update("loginEmail", e.target.value)}
              placeholder="name@example.com"
              className={inputClass(!!errors.loginEmail)}
            />
          </Field>

          <Field label="Email Password">
            <input
              type="password"
              value={values.emailPassword}
              onChange={(e) => update("emailPassword", e.target.value)}
              className={inputClass(false)}
            />
          </Field>

          <Field label="Account Password" error={errors.accountPassword}>
            <input
              type="password"
              value={values.accountPassword}
              onChange={(e) => update("accountPassword", e.target.value)}
              className={inputClass(!!errors.accountPassword)}
            />
          </Field>

          <Field label="Recovery Email" error={errors.recoveryEmail}>
            <input
              type="text"
              value={values.recoveryEmail}
              onChange={(e) => update("recoveryEmail", e.target.value)}
              placeholder="name@example.com"
              className={inputClass(!!errors.recoveryEmail)}
            />
          </Field>

          <Field label="2FA Secret (optional)">
            <input
              type="text"
              value={values.twoFactorSecret}
              onChange={(e) => update("twoFactorSecret", e.target.value)}
              className={inputClass(false)}
            />
          </Field>

          <Field label="Backup Codes (comma separated)">
            <input
              type="text"
              value={values.backupCodes}
              onChange={(e) => update("backupCodes", e.target.value)}
              placeholder="code1, code2, code3"
              className={inputClass(false)}
            />
          </Field>

        </div>

        <Field label="Cookies (optional, valid JSON)" error={errors.cookies} className="mt-5">
          <textarea
            value={values.cookies}
            onChange={(e) => update("cookies", e.target.value)}
            rows={3}
            placeholder='{"sessionid": "..."}'
            className={`${inputClass(!!errors.cookies)} font-mono text-xs`}
          />
        </Field>

        <Field label="Internal Notes (optional)" className="mt-5">
          <textarea
            value={values.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
            placeholder="Admin-only notes, not shown to buyer"
            className={inputClass(false)}
          />
        </Field>

      </div>

      {/* ============================
                SUBMIT
      ============================ */}

      <div className="flex justify-end border-t border-gray-200 dark:border-zinc-800 pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? "Saving…" : "Save Social Log"}
        </button>
      </div>

    </form>
  );
}

/* ===============================
      SHARED FIELD WRAPPER
=============================== */

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border ${
    hasError ? "border-red-500" : "border-gray-300 dark:border-zinc-700"
  } bg-gray-100 dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 outline-none focus:border-orange-500`;
}

/* ===============================
      TOGGLE PILL
=============================== */

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
        checked
          ? "border-orange-500 bg-orange-500/10 text-orange-400"
          : "border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-zinc-600"
      }`}
    >
      {label}
    </button>
  );
}
