"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
  Shield,
  BadgeCheck,
  Globe,
  Users,
  Calendar,
  ImageIcon,
  Lock,
  ChevronDown,
  ChevronUp,
  Package,
  Tag,
  MapPin,
  DollarSign,
  Layers,
} from "lucide-react";

import type { SocialLog, SocialLogCategoryValue } from "@/types/social-log";

interface Props {
  logs: SocialLog[];
  loading: boolean;
  onEdit: (log: SocialLog) => void;
  onDelete: (id: string) => void;
  onMarkSold?: (log: SocialLog) => void;
}

const platformColors: Record<string, string> = {
  INSTAGRAM: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  FACEBOOK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  TIKTOK: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  X: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  SNAPCHAT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  TELEGRAM: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  DISCORD: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  REDDIT: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  LINKEDIN: "bg-blue-600/10 text-blue-500 border-blue-600/20",
  YOUTUBE: "bg-red-500/10 text-red-400 border-red-500/20",
  GMAIL: "bg-red-400/10 text-red-300 border-red-400/20",
  OUTLOOK: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  VPN: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  TEXTPLUS: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  NEXTPLUS: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  MAIL: "bg-red-400/10 text-red-300 border-red-400/20",
};

const CATEGORY_LABELS: Record<SocialLogCategoryValue, string> = {
  FACEBOOK_PAGE: "Facebook — Page",
  FACEBOOK_COUNTRY: "Facebook — By Country",
  TWITTER_FOLLOWERS: "Twitter — Followers",
  INSTAGRAM_FOLLOWERS: "Instagram — Followers",
  VPN: "VPN",
  TEXTPLUS_NEXTPLUS: "Textplus & Nextplus",
  TELEGRAM_ACCOUNT: "Telegram",
  TIKTOK_COUNTRY: "TikTok — By Country",
  TIKTOK_FOLLOWERS: "TikTok — Followers",
  MAIL: "Mail",
};

const PAGE_TYPE_LABELS: Record<string, string> = {
  CREATE_PAGE: "Create Page",
  CREATED_PAGE: "Created Page",
  MULTI_PAGE: "2+ Pages",
  PAGE_WITH_FOLLOWERS: "Page with Followers",
};

const statusConfig = {
  AVAILABLE: {
    label: "Available",
    class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  SOLD: {
    label: "Sold",
    class: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    dot: "bg-orange-400",
  },
  PENDING: {
    label: "Pending",
    class: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
};

// Followers is a bare tier threshold on the model (0/100/200/500/1000).
// This renders it the way it's picked in the form — "100+", "1k+",
// "Empty" for Instagram's 0 tier.
function formatFollowersTier(value: number): string {
  if (value === 0) return "Empty";
  if (value >= 1000) return `${(value / 1000).toString().replace(/\.0$/, "")}k+`;
  return `${value}+`;
}

export default function SocialLogsTable({
  logs,
  loading,
  onEdit,
  onDelete,
  onMarkSold,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 dark:border-zinc-700 border-t-orange-500" />
          <p className="text-sm text-gray-500 dark:text-zinc-400">Loading social logs...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 dark:bg-zinc-800">
          <Package size={36} className="text-gray-400 dark:text-zinc-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Social Logs Found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          No accounts match your current filters. Try adjusting your search or add a new social log.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const isExpanded = expandedId === log.id;
        const platformStyle =
          platformColors[log.platform] ||
          "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        const statusStyle =
          statusConfig[log.status as keyof typeof statusConfig] || statusConfig.AVAILABLE;
        const categoryLabel = CATEGORY_LABELS[log.category] ?? log.category;

        return (
          <div
            key={log.id}
            className={`overflow-hidden rounded-3xl border transition-all duration-300 ${
              isExpanded
                ? "border-orange-500/30 bg-white dark:bg-zinc-900 shadow-[0_0_40px_rgba(234,88,12,0.08)]"
                : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700"
            }`}
          >
            {/* Main Row */}
            <div className="flex items-center gap-4 p-5 md:p-6">
              {/* Avatar / Platform Icon */}
              <div className="relative flex-shrink-0">
                {log.image ? (
                  <img
                    src={log.image}
                    alt={log.username}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-gray-200 dark:ring-zinc-800"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800 ring-2 ring-zinc-700">
                    <ImageIcon size={24} className="text-gray-400 dark:text-zinc-500" />
                  </div>
                )}
                <div
                  className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-200 dark:border-zinc-900 ${statusStyle.dot}`}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                    @{log.username}
                  </h3>
                  {log.verified && (
                    <BadgeCheck size={16} className="flex-shrink-0 text-blue-400" />
                  )}
                  {log.ogEmail && (
                    <span className="flex-shrink-0 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      OG
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-medium text-orange-400">
                    <Layers size={11} />
                    {categoryLabel}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 font-medium ${platformStyle}`}
                  >
                    <Globe size={11} />
                    {log.platform}
                  </span>
                  {log.country && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} />
                      {log.country}
                    </span>
                  )}
                  {log.pageType && (
                    <span className="inline-flex items-center gap-1">
                      <Tag size={11} />
                      {PAGE_TYPE_LABELS[log.pageType] ?? log.pageType}
                    </span>
                  )}
                  {log.followers !== null && log.followers !== undefined && (
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} />
                      {formatFollowersTier(log.followers)}
                    </span>
                  )}
                  {log.age > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} />
                      {log.age}y
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="hidden flex-shrink-0 text-right md:block">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ₦{log.price.toLocaleString()}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${statusStyle.class}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {statusStyle.label}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-1">
                <button
                  onClick={() => toggleExpand(log.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                  title="View Details"
                >
                  {isExpanded ? <ChevronUp size={18} /> : <Eye size={18} />}
                </button>
                {log.status === "AVAILABLE" && onMarkSold && (
                  <button
                    onClick={() => onMarkSold(log)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 dark:text-zinc-400 transition hover:bg-orange-500/10 hover:text-orange-400"
                    title="Mark as Sold"
                  >
                    <Tag size={18} />
                  </button>
                )}
                <button
                  onClick={() => onEdit(log)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 dark:text-zinc-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => onDelete(log.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 dark:text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Expanded Details - Matches Form Sections */}
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/40 px-5 pb-6 pt-4 md:px-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Basic Info Column */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-400">
                      <Globe size={14} />
                      Basic Information
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <DetailItem icon={<Layers size={14} />} label="Category" value={categoryLabel} />
                      <DetailItem icon={<Globe size={14} />} label="Platform" value={log.platform} />
                      {log.country && (
                        <DetailItem icon={<MapPin size={14} />} label="Country" value={log.country} />
                      )}
                      {log.pageType && (
                        <DetailItem
                          icon={<Tag size={14} />}
                          label="Page Type"
                          value={PAGE_TYPE_LABELS[log.pageType] ?? log.pageType}
                        />
                      )}
                      {log.followers !== null && log.followers !== undefined && (
                        <DetailItem
                          icon={<Users size={14} />}
                          label="Followers Tier"
                          value={formatFollowersTier(log.followers)}
                        />
                      )}
                      <DetailItem icon={<Calendar size={14} />} label="Account Age" value={log.age > 0 ? `${log.age} years` : "—"} />
                      <DetailItem 
                        icon={<DollarSign size={14} />} 
                        label="Price" 
                        value={`₦${log.price.toLocaleString()}`}
                        valueClass="text-orange-400 font-bold"
                      />
                      <DetailItem 
                        icon={<Shield size={14} />} 
                        label="Status" 
                        value={log.status}
                        valueClass={log.status === "SOLD" ? "text-orange-400" : "text-emerald-400"}
                      />
                    </div>

                    {/* Feature Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <FeatureBadge active={log.emailAttached} label="Email Attached" icon={<Mail size={12} />} />
                      <FeatureBadge active={log.phoneAttached} label="Phone Attached" icon={<Phone size={12} />} />
                      <FeatureBadge active={log.twoFactor} label="2FA Enabled" icon={<Shield size={12} />} />
                      <FeatureBadge active={log.verified} label="Verified" icon={<BadgeCheck size={12} />} />
                      <FeatureBadge active={log.ogEmail} label="OG Email" icon={<Lock size={12} />} />
                    </div>
                  </div>

                  {/* Description & Notes Column */}
                  <div className="space-y-4">
                    {log.description && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          <Tag size={14} />
                          Marketplace Description
                        </h4>
                        <p className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
                          {log.description}
                        </p>
                      </div>
                    )}

                    {/* Hidden Credentials Notice */}
                    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                      <div className="flex items-start gap-3">
                        <Lock size={18} className="mt-0.5 flex-shrink-0 text-orange-400" />
                        <div>
                          <p className="text-sm font-semibold text-orange-300">
                            Login Credentials Hidden
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">
                            Login email, password, 2FA secrets, recovery info, backup codes, 
                            and cookies are hidden from this view. They are only revealed to 
                            the buyer after successful purchase.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Width Image Preview */}
                {log.image && (
                  <div className="mt-6">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                      <ImageIcon size={14} />
                      Profile Preview
                    </h4>
                    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800">
                      <img
                        src={log.image}
                        alt={log.username}
                        className="h-64 w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===============================
   SUB-COMPONENTS
=============================== */

function DetailItem({
  icon,
  label,
  value,
  valueClass = "text-white",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">
        {icon}
        {label}
      </p>
      <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function FeatureBadge({
  active,
  label,
  icon,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
        active
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}
