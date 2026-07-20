"use client";

import { useMemo, useState } from "react";
import { X, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { createSocialLog } from "@/services/socialLogs";
import type { CreateSocialLogDto, SocialLogPageType, SocialPlatform } from "@/types/social-log";
import { WIZARD_GROUPS, getGroup, type WizardGroup } from "@/shared/category-tree";

type WizardStep = 1 | 2 | 3 | 4;

const STEP_LABELS = ["Platform", "Category", "Audience", "Details"];

interface WizardState {
  group?: WizardGroup;
  selectedPageTypes: SocialLogPageType[];
  selectedPlatforms: SocialPlatform[];
  includeFollowerTier: boolean;
  country?: string;
  followers?: number;
  age?: number;
  details: Record<string, any>;
}

const initialWizardState: WizardState = {
  selectedPageTypes: [],
  selectedPlatforms: [],
  includeFollowerTier: false,
  details: {},
};

interface Submission {
  platform: SocialPlatform;
  category: string;
  pageType?: SocialLogPageType;
  country?: string;
  label: string;
}

interface AddSocialLogModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddSocialLogModal({ open, onClose, onCreated }: AddSocialLogModalProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [wizard, setWizard] = useState<WizardState>(initialWizardState);
  const [submitting, setSubmitting] = useState(false);

  const group = wizard.group ? getGroup(wizard.group) : undefined;
  const needsPlatformChoice = (group?.platforms.length ?? 0) > 1 && group?.value !== "FACEBOOK";

  const submissions: Submission[] = useMemo(() => {
    if (!group) return [];

    if (group.value === "FACEBOOK") {
      const subs: Submission[] = wizard.selectedPageTypes.map((pt) => ({
        platform: "FACEBOOK",
        category: "FACEBOOK_PAGE",
        pageType: pt,
        label: group.pageTypes?.find((p) => p.value === pt)?.label ?? pt,
      }));
      if (wizard.country?.trim()) {
        subs.push({
          platform: "FACEBOOK",
          category: "FACEBOOK_COUNTRY",
          country: wizard.country.trim(),
          label: `By Country — ${wizard.country.trim()}`,
        });
      }
      return subs;
    }

    if (group.value === "TIKTOK") {
      const subs: Submission[] = [];
      if (wizard.includeFollowerTier) {
        subs.push({ platform: "TIKTOK", category: "TIKTOK_FOLLOWERS", label: "Follower Tier" });
      }
      if (wizard.country?.trim()) {
        subs.push({
          platform: "TIKTOK",
          category: "TIKTOK_COUNTRY",
          country: wizard.country.trim(),
          label: `By Country — ${wizard.country.trim()}`,
        });
      }
      return subs;
    }

    if (needsPlatformChoice) {
      return wizard.selectedPlatforms.map((p) => ({
        platform: p,
        category: group.category as string,
        label: p,
      }));
    }

    return [{ platform: group.platforms[0], category: group.category as string, label: group.label }];
  }, [group, needsPlatformChoice, wizard]);

  const showFollowers =
    group?.value === "TWITTER" ||
    group?.value === "INSTAGRAM" ||
    submissions.some((s) => s.category === "TIKTOK_FOLLOWERS" || (s.category === "FACEBOOK_PAGE" && s.pageType === "PAGE_WITH_FOLLOWERS"));

  const step2Complete = submissions.length > 0;

  function reset() {
    setWizard(initialWizardState);
    setStep(1);
  }

  function handleClose() {
    onClose();
    reset();
  }

  function selectGroup(value: WizardGroup) {
    setWizard({ ...initialWizardState, group: value });
    setStep(2);
  }

  function changePlatform() {
    setWizard(initialWizardState);
    setStep(1);
  }

  function togglePageType(pt: SocialLogPageType) {
    setWizard((s) => ({
      ...s,
      selectedPageTypes: s.selectedPageTypes.includes(pt)
        ? s.selectedPageTypes.filter((v) => v !== pt)
        : [...s.selectedPageTypes, pt],
    }));
  }

  function togglePlatform(p: SocialPlatform) {
    setWizard((s) => ({
      ...s,
      selectedPlatforms: s.selectedPlatforms.includes(p)
        ? s.selectedPlatforms.filter((v) => v !== p)
        : [...s.selectedPlatforms, p],
    }));
  }

  async function handleSubmit() {
    if (submissions.length === 0) return;
    setSubmitting(true);
    try {
      for (const sub of submissions) {
        const submissionUsesFollowers =
          sub.category === "TIKTOK_FOLLOWERS" ||
          sub.category === "TWITTER_FOLLOWERS" ||
          sub.category === "INSTAGRAM_FOLLOWERS" ||
          (sub.category === "FACEBOOK_PAGE" && sub.pageType === "PAGE_WITH_FOLLOWERS");

        // wizard.details spread LAST — nothing after it may override
        // username/price/credentials the admin actually typed on step 4.
      const payload = {
  platform: sub.platform,
  category: sub.category as any,
  pageType: sub.pageType,
  country: sub.country,
  followers: submissionUsesFollowers ? wizard.followers : undefined,
  age: wizard.age ?? 0,
  ...wizard.details,
} as CreateSocialLogDto;
        
      }
      toast.success(
        submissions.length > 1 ? `Added ${submissions.length} listings to stock.` : "Added to stock.",
      );
      handleClose();
      onCreated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  }

  function setDetail(key: string, value: any) {
    setWizard((s) => ({ ...s, details: { ...s.details, [key]: value } }));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold text-white">
              {step > 1 && group && (
                <button
                  onClick={changePlatform}
                  title="Change platform"
                  className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              Add Social Log
              {group && <span className="text-base font-medium text-zinc-500">— {group.label}</span>}
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Step {step} of 4 · {STEP_LABELS[step - 1]}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-xl text-zinc-400 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 bg-zinc-900 p-8">
          <div className="flex gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-1.5 rounded-full ${i < step ? "bg-orange-600" : "bg-zinc-800"}`} />
                <p className={`mt-1.5 text-center text-xs ${i < step ? "text-orange-400" : "text-zinc-600"}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {WIZARD_GROUPS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => selectGroup(g.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-6 text-center font-medium text-white transition hover:border-orange-500 hover:bg-zinc-750"
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {step === 2 && group && (
            <div className="space-y-5">
              {group.value === "FACEBOOK" && group.pageTypes && (
                <>
                  <div>
                    <p className="mb-2 text-sm font-medium text-zinc-300">Page Types — select any that apply</p>
                    <div className="grid grid-cols-2 gap-3">
                      {group.pageTypes.map((pt) => {
                        const checked = wizard.selectedPageTypes.includes(pt.value);
                        return (
                          <button
                            key={pt.value}
                            onClick={() => togglePageType(pt.value)}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-4 text-left text-sm font-medium transition ${
                              checked
                                ? "border-orange-500 bg-zinc-800 text-white"
                                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                checked ? "border-orange-500 bg-orange-500" : "border-zinc-600"
                              }`}
                            >
                              {checked && <span className="h-2 w-2 rounded-sm bg-white" />}
                            </span>
                            {pt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Country (optional) — adds a Facebook-by-Country listing alongside any page types above
                    </label>
                    <input
                      placeholder="e.g. Nigeria"
                      value={wizard.country ?? ""}
                      onChange={(e) => setWizard((s) => ({ ...s, country: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                    />
                  </div>
                </>
              )}

              {group.value === "TIKTOK" && (
                <>
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={wizard.includeFollowerTier}
                      onChange={(e) => setWizard((s) => ({ ...s, includeFollowerTier: e.target.checked }))}
                    />
                    Include a Follower-tier listing
                  </label>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Country (optional) — adds a TikTok-by-Country listing alongside the follower tier above
                    </label>
                    <input
                      placeholder="e.g. Nigeria"
                      value={wizard.country ?? ""}
                      onChange={(e) => setWizard((s) => ({ ...s, country: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                    />
                  </div>
                </>
              )}

              {needsPlatformChoice && (
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-300">Select any that apply</p>
                  <div className="grid grid-cols-2 gap-3">
                    {group.platforms.map((p) => {
                      const checked = wizard.selectedPlatforms.includes(p);
                      return (
                        <button
                          key={p}
                          onClick={() => togglePlatform(p)}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-4 text-left text-sm font-medium transition ${
                            checked
                              ? "border-orange-500 bg-zinc-800 text-white"
                              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              checked ? "border-orange-500 bg-orange-500" : "border-zinc-600"
                            }`}
                          >
                            {checked && <span className="h-2 w-2 rounded-sm bg-white" />}
                          </span>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {submissions.length > 0 && (
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
                    Will create {submissions.length} listing{submissions.length > 1 ? "s" : ""}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-orange-100">
                    {submissions.map((s, i) => (
                      <li key={i}>• {s.label}</li>
                    ))}
                  </ul>
                </div>
              )}

              {submissions.length === 0 && (
                <p className="text-xs text-zinc-500">Select at least one option above to continue.</p>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)} className="text-sm text-zinc-400 hover:text-white">
                  Back
                </button>
                <button
                  disabled={!step2Complete}
                  onClick={() => setStep(3)}
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && group && (
            <div className="space-y-4">
              {showFollowers && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">Follower Count</label>
                  <input
                    type="number"
                    value={wizard.followers ?? ""}
                    onChange={(e) => setWizard((s) => ({ ...s, followers: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                  />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Account Age (months)</label>
                <input
                  type="number"
                  value={wizard.age ?? ""}
                  onChange={(e) => setWizard((s) => ({ ...s, age: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                />
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)} className="text-sm text-zinc-400 hover:text-white">
                  Back
                </button>
                <button onClick={() => setStep(4)} className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-medium text-white">
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && group && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  About to create {submissions.length} listing{submissions.length > 1 ? "s" : ""}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                  {submissions.map((s, i) => (
                    <li key={i}>• {s.label}</li>
                  ))}
                </ul>
                {submissions.length > 1 && (
                  <p className="mt-2 text-xs text-zinc-500">
                    The fields below apply to all of them — username/price/credentials are shared.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Username / Label</label>
                <input
                  value={wizard.details.username ?? ""}
                  onChange={(e) => setDetail("username", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Price (₦)</label>
                <input
                  type="number"
                  value={wizard.details.price ?? ""}
                  onChange={(e) => setDetail("price", Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["emailAttached", "phoneAttached", "twoFactor", "ogEmail", "verified"].map((flag) => (
                  <label key={flag} className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={!!wizard.details[flag]}
                      onChange={(e) => setDetail(flag, e.target.checked)}
                    />
                    {flag}
                  </label>
                ))}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  value={wizard.details.description ?? ""}
                  onChange={(e) => setDetail("description", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                />
              </div>

              <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Private details — only revealed to the buyer after purchase
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">Login Email</label>
                  <input
                    value={wizard.details.loginEmail ?? ""}
                    onChange={(e) => setDetail("loginEmail", e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">Login Phone</label>
                  <input
                    value={wizard.details.loginPhone ?? ""}
                    onChange={(e) => setDetail("loginPhone", e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">Password</label>
                  <input
                    type="password"
                    value={wizard.details.accountPassword ?? ""}
                    onChange={(e) => setDetail("accountPassword", e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">2FA Secret</label>
                  <input
                    value={wizard.details.twoFactorSecret ?? ""}
                    onChange={(e) => setDetail("twoFactorSecret", e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">Recovery Email</label>
                  <input
                    value={wizard.details.recoveryEmail ?? ""}
                    onChange={(e) => setDetail("recoveryEmail", e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Notes</label>
                <textarea
                  value={wizard.details.notes ?? ""}
                  onChange={(e) => setDetail("notes", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(3)} className="text-sm text-zinc-400 hover:text-white">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting…"
                    : submissions.length > 1
                      ? `Add ${submissions.length} to Stock`
                      : "Add to Stock"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}