import type { ReactNode } from "react";

export interface MarketplaceSms {
  code?: string;
  text?: string;
  createdAt?: string;
}

export interface MarketplaceOrder {
  id: string;

  userId: string;

  provider: string;
  providerOrderId: string;

  country: string;
  operator: string;
  activationType: string;
  service: string;

  phoneNumber: string;

  providerCostUsd: string;
  sellingPriceNgn: string;

  status: string;

  createdAt: string;
  updatedAt: string;

  sms?: MarketplaceSms[];
}

export interface OrderStatCard {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
}