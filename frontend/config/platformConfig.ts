// platformConfig.ts
export type LogOption = {
  key: string;
  label: string;
  followerRange?: string;
  age?: "empty" | "months" | "aged";
  durationDays?: number;   // for VPN
};

export const PLATFORM_CONFIG: Record<string, {
  resource: "SOCIAL_LOG" | "DIGITAL_PRODUCT";
  axes: ("type" | "country")[];
  types?: LogOption[];
  countries?: { country: string; followerRange: string }[];
}> = {
  FACEBOOK: {
    resource: "SOCIAL_LOG",
    axes: ["type", "country"],
    types: [
      { key: "CREATE", label: "Create Page" },
      { key: "CREATED", label: "Created Page" },
      { key: "CREATED_X2", label: "2x Created Page" },
      { key: "CREATED_1K", label: "Created Page w/ 1K+ Followers", followerRange: "RANGE_1000_PLUS" },
    ],
    countries: [
      { country: "USA", followerRange: "RANGE_200_300" },
      { country: "CANADA", followerRange: "RANGE_100_200" },
      { country: "SPAIN", followerRange: "RANGE_100_200" },
      { country: "AUSTRALIA", followerRange: "RANGE_100_200" },
      { country: "NETHERLANDS", followerRange: "RANGE_100_200" },
      { country: "BELGIUM", followerRange: "RANGE_100_200" },
    ],
  },

  TWITTER: {
    resource: "SOCIAL_LOG",
    axes: ["type"],
    types: [
      { key: "EMPTY_AGED", label: "Empty Aged", age: "aged" },
      { key: "F100", label: "100+ Followers", followerRange: "RANGE_100_200" },
      { key: "F200", label: "200+ Followers", followerRange: "RANGE_200_300" },
      { key: "F500", label: "500+ Followers", followerRange: "RANGE_500_1000" },
      { key: "F1K", label: "1K+ Followers", followerRange: "RANGE_1000_PLUS" },
    ],
  },

  INSTAGRAM: {
    resource: "SOCIAL_LOG",
    axes: ["type"],
    types: [
      { key: "MONTHS_OLD", label: "Months Old", age: "months" },
      { key: "EMPTY_AGED", label: "Empty Aged", age: "aged" },
      { key: "AGED_500", label: "Aged w/ 500+ Followers", followerRange: "RANGE_500_1000", age: "aged" },
      { key: "AGED_1K", label: "Aged w/ 1K+ Followers", followerRange: "RANGE_1000_PLUS", age: "aged" },
    ],
  },

  TIKTOK: {
    resource: "SOCIAL_LOG",
    axes: ["type", "country"],
    types: [
      { key: "F100", label: "100+ Followers", followerRange: "RANGE_100_200" },
      { key: "F200", label: "200+ Followers", followerRange: "RANGE_200_300" },
      { key: "F500", label: "500+ Followers", followerRange: "RANGE_500_1000" },
      { key: "F1K", label: "1K+ Followers", followerRange: "RANGE_1000_PLUS" },
    ],
    countries: [
      { country: "USA", followerRange: "" },
      { country: "UK", followerRange: "" },
      { country: "CANADA", followerRange: "" },
      { country: "GERMANY", followerRange: "" },
      { country: "RANDOM", followerRange: "" },
    ],
  },

  VPN: {
    resource: "DIGITAL_PRODUCT",
    axes: ["type"],
    types: [
      { key: "PIA_7D", label: "7 Days PIA VPN", durationDays: 7 },
      { key: "EXPRESS_1M", label: "Express VPN One Month", durationDays: 30 },
      { key: "HMA_1M", label: "HMA VPN One Month", durationDays: 30 },
      { key: "NORD_1M", label: "Nord VPN One Month", durationDays: 30 },
    ],
  },

  TEXTING_APP: {
    resource: "DIGITAL_PRODUCT",
    axes: ["type"],
    types: [
      { key: "TEXTPLUS", label: "TextPlus" },
      { key: "NEXTPLUS", label: "NextPlus" },
    ],
  },

  WEBSITE: {
    resource: "DIGITAL_PRODUCT",
    axes: ["type"],
    types: [
      { key: "LOGS_WEBSITE", label: "Logs Website" },
      { key: "SMS_WEBSITE", label: "SMS Website" },
      { key: "BOTH_WEBSITE", label: "Both Logs and SMS Website" },
      { key: "BOOSTING_WEBSITE", label: "Boosting Website" },
    ],
  },
};