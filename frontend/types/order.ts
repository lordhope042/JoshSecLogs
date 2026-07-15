// frontend/types/order.ts

export interface MarketplaceSms {
  id?: number;
  code?: string;
  text: string;
  createdAt?: string;
}

export interface MarketplaceOrder {
  id: string | number;
  providerOrderId: string;
  phoneNumber: string;
  phone: string;
  country: string;
  operator: string;
  product: string;
  status: "PENDING" | "RECEIVED" | "FINISHED" | "CANCELLED" | "ACTIVE" | "COMPLETED" | "FAILED";
  expires: string;
  price: number;
  sms?: MarketplaceSms[];
  // Add any additional dynamic properties here if needed
  [key: string]: any; // Use 'any' instead of 'string' to allow mixed types
}

// If you need strictly typed properties without index signature
export interface StrictMarketplaceOrder {
  id: string | number;
  providerOrderId: string;
  phoneNumber: string;
  phone: string;
  country: string;
  operator: string;
  product: string;
  status: "PENDING" | "RECEIVED" | "FINISHED" | "CANCELLED" | "ACTIVE" | "COMPLETED" | "FAILED";
  expires: string;
  price: number;
  sms?: MarketplaceSms[];
}

// For API responses that might have additional fields
export interface MarketplaceOrderResponse {
  data: MarketplaceOrder;
  message?: string;
  statusCode?: number;
}

// For multiple orders
export interface MarketplaceOrdersResponse {
  data: MarketplaceOrder[];
  total?: number;
  page?: number;
  limit?: number;
}

// For creating/updating orders
export interface CreateMarketplaceOrderDto {
  country: string;
  operator: string;
  product: string;
}

// Type guard to check if order has SMS
export function hasSms(order: MarketplaceOrder): order is MarketplaceOrder & { sms: MarketplaceSms[] } {
  return Array.isArray(order.sms) && order.sms.length > 0;
}