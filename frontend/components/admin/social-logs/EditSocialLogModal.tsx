"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { updateSocialLog } from "@/services/socialLogs";
import type { SocialLog, UpdateSocialLogDto } from "@/types/social-log";

interface EditSocialLogModalProps {
  log: SocialLog | null;
  onClose: () => void;
  onUpdated: () => void;
}

/**
 * Only edits fields that are actually part of the SocialLog the admin
 * list already has in hand — platform/category/pageType/country are
 * fixed once a stock unit exists (changing them would mean it's really
 * a different listing), so they're shown read-only rather than re-picked.
 *
 * Private fields (loginEmail, password, 2FA secret, etc.) are deliberately
 * NOT part of this form — the admin list endpoint doesn't return them, so
 * there's nothing to prefill, and submitting blanks for fields we can't
 * see would silently erase real credentials on the backend. This form
 * never includes those keys in its payload at all.
 */
export default function EditSocialLogModal({ log, onClose, onUpdated }: EditSocialLogModalProps) {
  const [form, setForm] = useState(() => buildInitialForm(log));
  const [submitting, setSubmitting] = useState(false);

  // Re-sync local form state whenever a different log is opened for editing
  const [openedForId, setOpenedForId] = useState<string | null>(log?.id ?? null);
  if (log && log.id !== openedForId) {
    setForm(buildInitialForm(log));
    setOpenedForId(log.id);
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!log) return;
    setSubmitting(true);
    try {
      const payload: UpdateSocialLogDto = {
        username: form.username,
        price: form.price,
        age: form.age,
        followers: form.followers,
        emailAttached: form.emailAttached,
        phoneAttached: form.phoneAttached,
        twoFactor: form.twoFactor,
        ogEmail: form.ogEmail,
        verified: form.verified,
        description: form.description,
        image: form.image,
        // platform / category / pageType / country intentionally omitted — fixed for this unit
        // loginEmail / loginPhone / accountPassword / twoFactorSecret / recoveryEmail /
        // backupCodes / cookies / notes intentionally omitted — not available here, never touched
      };
      await updateSocialLog(log.id, payload);
      toast.success("Social log updated.");
      onUpdated();
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to update social log.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Social Log</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {log.platform} · {log.category}
              {log.pageType ? ` · ${log.pageType}` : ""}
              {log.country ? ` · ${log.country}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-xl text-zinc-400 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-8">
          <p className="rounded-lg bg-zinc-800/50 px-4 py-2 text-xs text-zinc-500">
            Platform and category are fixed for this listing. Private login credentials aren't shown here and
            won't be affected by saving — only the fields below are updated.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Username / Label</label>
            <input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Price (₦)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => set("price", Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {typeof log.followers === "number" || log.followers === null ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Followers</label>
                <input
                  type="number"
                  value={form.followers ?? ""}
                  onChange={(e) => set("followers", e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
                />
              </div>
            ) : null}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Account Age (months)</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => set("age", Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["emailAttached", "emailAttached"],
                ["phoneAttached", "phoneAttached"],
                ["twoFactor", "twoFactor"],
                ["ogEmail", "ogEmail"],
                ["verified", "verified"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Image URL</label>
            <input
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildInitialForm(log: SocialLog | null) {
  return {
    username: log?.username ?? "",
    price: log?.price ?? 0,
    age: log?.age ?? 0,
    followers: log?.followers ?? undefined,
    emailAttached: log?.emailAttached ?? false,
    phoneAttached: log?.phoneAttached ?? false,
    twoFactor: log?.twoFactor ?? false,
    ogEmail: log?.ogEmail ?? false,
    verified: log?.verified ?? false,
    description: log?.description ?? "",
    image: log?.image ?? "",
  };
}