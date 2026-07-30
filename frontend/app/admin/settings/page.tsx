"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Loader2,
  DollarSign,
  Percent,
  Shield,
  Mail,
  Bell,
  Globe,
  CreditCard,
  CheckCircle2,
  Server,
} from "lucide-react";
import { toast } from "sonner";

/* ── Types ── */

interface PlatformSettings {
  /* Currency & pricing */
  usdToNgnRate: string;
  markupMultiplier: string;
  defaultCurrency: string;
  /* 5sim provider */
  fivesimEnabled: boolean;
  fivesimApiKey: string;
  fivesimDefaultCountry: string;
  /* Paystack gateway */
  paystackEnabled: boolean;
  paystackPublicKey: string;
  paystackSecretKey: string;
  /* Platform toggles */
  registrationOpen: boolean;
  emailVerificationRequired: boolean;
  maintenanceMode: boolean;
  /* Notifications */
  adminNotificationEmail: string;
  lowWalletThreshold: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  usdToNgnRate: "1650",
  markupMultiplier: "1.2",
  defaultCurrency: "NGN",
  fivesimEnabled: true,
  fivesimApiKey: "",
  fivesimDefaultCountry: "nigeria",
  paystackEnabled: true,
  paystackPublicKey: "",
  paystackSecretKey: "",
  registrationOpen: true,
  emailVerificationRequired: false,
  maintenanceMode: false,
  adminNotificationEmail: "",
  lowWalletThreshold: "500",
};

/* ── Page ── */

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [dirty, setDirty] = useState(false);

  /* Load persisted settings from localStorage (no backend settings endpoint yet) */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_platform_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const update = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Persist to localStorage until a dedicated backend settings endpoint exists.
      // This keeps the admin UI functional and survives reloads.
      localStorage.setItem("admin_platform_settings", JSON.stringify(settings));
      await new Promise((r) => setTimeout(r, 600)); // simulate save latency
      toast.success("Platform settings saved.");
      setDirty(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setDirty(true);
    toast.info("Settings reset to defaults (not yet saved).");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure currency conversion, payment providers, and platform-wide toggles.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Persisted notice */}
      <div className="flex items-start gap-3 rounded-md border border-blue-500/20 bg-blue-500/5 p-3 text-sm">
        <Server className="mt-0.5 h-4 w-4 text-blue-500" />
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">Note:</span> These settings are persisted
          locally in this admin session. A dedicated backend configuration endpoint can be added to
          apply them platform-wide across services.
        </div>
      </div>

      {/* Currency & Pricing */}
      <SettingsSection
        title="Currency & Pricing"
        description="Controls how provider USD costs are converted to Nigerian Naira selling prices."
        icon={DollarSign}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="USD → NGN Exchange Rate" hint="Base rate before markup.">
            <input
              type="number"
              step="1"
              value={settings.usdToNgnRate}
              onChange={(e) => update("usdToNgnRate", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Markup Multiplier" hint="Applied on top of the converted price.">
            <input
              type="number"
              step="0.01"
              value={settings.markupMultiplier}
              onChange={(e) => update("markupMultiplier", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Default Currency">
            <select
              value={settings.defaultCurrency}
              onChange={(e) => update("defaultCurrency", e.target.value)}
              className={inputClass}
            >
              <option value="NGN">NGN — Nigerian Naira (₦)</option>
              <option value="USD">USD — US Dollar ($)</option>
            </select>
          </Field>
        </div>
        <PreviewCalc settings={settings} />
      </SettingsSection>

      {/* 5sim Provider */}
      <SettingsSection
        title="5sim Provider"
        description="Integration settings for the 5sim virtual number API."
        icon={Globe}
      >
        <Toggle
          label="Enable 5sim"
          description="Allow purchases of virtual phone numbers through 5sim."
          checked={settings.fivesimEnabled}
          onChange={(v) => update("fivesimEnabled", v)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="5sim API Key">
            <input
              type={showSecrets ? "text" : "password"}
              value={settings.fivesimApiKey}
              onChange={(e) => update("fivesimApiKey", e.target.value)}
              placeholder="Enter 5sim API key"
              className={inputClass}
            />
          </Field>
          <Field label="Default Country" hint="Used when no country is selected by the user.">
            <input
              type="text"
              value={settings.fivesimDefaultCountry}
              onChange={(e) => update("fivesimDefaultCountry", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </SettingsSection>

      {/* Paystack Gateway */}
      <SettingsSection
        title="Paystack Gateway"
        description="Payment gateway configuration for wallet funding."
        icon={CreditCard}
      >
        <Toggle
          label="Enable Paystack"
          description="Allow users to fund their wallet via Paystack."
          checked={settings.paystackEnabled}
          onChange={(v) => update("paystackEnabled", v)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Paystack Public Key">
            <input
              type={showSecrets ? "text" : "password"}
              value={settings.paystackPublicKey}
              onChange={(e) => update("paystackPublicKey", e.target.value)}
              placeholder="pk_live_... or pk_test_..."
              className={inputClass}
            />
          </Field>
          <Field label="Paystack Secret Key">
            <input
              type={showSecrets ? "text" : "password"}
              value={settings.paystackSecretKey}
              onChange={(e) => update("paystackSecretKey", e.target.value)}
              placeholder="sk_live_... or sk_test_..."
              className={inputClass}
            />
          </Field>
        </div>
        <button
          onClick={() => setShowSecrets((s) => !s)}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-accent"
        >
          {showSecrets ? "Hide secrets" : "Show secrets"}
        </button>
      </SettingsSection>

      {/* Platform Toggles */}
      <SettingsSection
        title="Platform Controls"
        description="Global toggles that affect sign-up and platform availability."
        icon={Shield}
      >
        <Toggle
          label="Open Registration"
          description="Allow new users to create accounts."
          checked={settings.registrationOpen}
          onChange={(v) => update("registrationOpen", v)}
        />
        <Toggle
          label="Require Email Verification"
          description="New users must verify their email before accessing the platform."
          checked={settings.emailVerificationRequired}
          onChange={(v) => update("emailVerificationRequired", v)}
        />
        <Toggle
          label="Maintenance Mode"
          description="Temporarily disable non-admin access. Use with caution."
          checked={settings.maintenanceMode}
          onChange={(v) => update("maintenanceMode", v)}
        />
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection
        title="Notifications"
        description="Admin alerts for important platform events."
        icon={Bell}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Admin Notification Email" hint="Receives alerts for new orders, refunds, etc.">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={settings.adminNotificationEmail}
                onChange={(e) => update("adminNotificationEmail", e.target.value)}
                placeholder="admin@joshseclogs.com"
                className={`${inputClass} pl-9`}
              />
            </div>
          </Field>
          <Field label="Low Wallet Threshold (₦)" hint="Alert when a user's wallet drops below this.">
            <input
              type="number"
              step="50"
              value={settings.lowWalletThreshold}
              onChange={(e) => update("lowWalletThreshold", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </SettingsSection>

      {/* Save bar */}
      {dirty && (
        <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
          <span className="text-sm text-muted-foreground">You have unsaved changes.</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Now
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Shared UI ── */

const inputClass =
  "h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border p-4">
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function PreviewCalc({ settings }: { settings: PlatformSettings }) {
  const rate = parseFloat(settings.usdToNgnRate) || 0;
  const markup = parseFloat(settings.markupMultiplier) || 0;
  const exampleUsd = 1;
  const baseNgn = exampleUsd * rate;
  const finalNgn = baseNgn * markup;
  const symbol = settings.defaultCurrency === "NGN" ? "₦" : "$";
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
      <Percent className="h-3.5 w-3.5" />
      <span>
        Example: ${exampleUsd} USD → {symbol}
        {baseNgn.toLocaleString()} base → <strong className="text-foreground">{symbol}
        {finalNgn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> selling price
        (×{markup} markup)
      </span>
    </div>
  );
}
