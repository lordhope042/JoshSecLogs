export interface ActivationType {
  activationType: string;
  stock: number;
  priceUsd: number;
  priceNgn: number;
}

export interface ServicePrice {
  service: string;
  activationTypes: ActivationType[];
}

export type ServicePrices = ServicePrice[];