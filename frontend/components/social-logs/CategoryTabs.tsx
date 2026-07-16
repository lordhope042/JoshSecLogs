"use client";

import {
  FaFacebook,
  FaTelegramPlane,
  FaTiktok,
  FaShieldAlt,
} from "react-icons/fa";

import { FaCommentSms, FaXTwitter } from "react-icons/fa6";

import { FaInstagram } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

import { IconType } from "react-icons";

import { cn } from "@/lib/utils";

import { SocialLogCategoryValue } from "@/types/social-log";

interface Props {
  categories: SocialLogCategoryValue[];

  selected: SocialLogCategoryValue | null;

  onSelect: (
    category: SocialLogCategoryValue,
  ) => void;
}

const labels: Record<
  SocialLogCategoryValue,
  string
> = {
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

const icons: Record<
  SocialLogCategoryValue,
  IconType
> = {
  FACEBOOK_PAGE: FaFacebook,
  FACEBOOK_COUNTRY: FaFacebook,
  TWITTER_FOLLOWERS: FaXTwitter,
  INSTAGRAM_FOLLOWERS: FaInstagram,
  VPN: FaShieldAlt,
  TEXTPLUS_NEXTPLUS: FaCommentSms,
  TELEGRAM_ACCOUNT: FaTelegramPlane,
  TIKTOK_COUNTRY: FaTiktok,
  TIKTOK_FOLLOWERS: FaTiktok,
  MAIL: MdOutlineMail,
};

export default function CategoryTabs({
  categories,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-2 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">

      <div className="flex gap-3 overflow-x-auto">

        {categories.map((category) => {
          const active =
            selected === category;

          const Icon =
            icons[category];

          return (
            <button
              key={category}
              onClick={() =>
                onSelect(category)
              }
              className={cn(
                "group flex shrink-0 items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300",

                active
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-orange-500 dark:hover:bg-zinc-700",
              )}
            >
              <Icon
                size={20}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              <span>
                {labels[category]}
              </span>
            </button>
          );
        })}

      </div>

    </div>
  );
}
