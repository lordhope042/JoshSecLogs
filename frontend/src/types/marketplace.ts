export interface Country {
  iso: string;
  text: string;
}

export interface ServiceItem {
  cost: number;
  count: number;
  priceUsd?: number;
  priceNgn?: number;
}

export interface PriceResponse {
  [service: string]: {
    [operator: string]: ServiceItem;
  };
}