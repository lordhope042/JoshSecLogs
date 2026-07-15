export interface MarketplaceSms {
  id?: number;
  code?: string;
  text: string;
  created_at: string;
}

export interface MarketplaceOrder {
  id: number;

  phone: string;

  country: string;

  operator: string;

  product: string;

  status:
    | "PENDING"
    | "RECEIVED"
    | "FINISHED"
    | "CANCELLED";

  expires: string;

  price: number;

  sms?: MarketplaceSms[];
}