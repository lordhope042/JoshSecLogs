export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

/* -----------------------------------------
 * Transaction Types
 * ----------------------------------------- */

export type WalletTransactionType =
  | "CREDIT"
  | "DEBIT"
  | "PURCHASE"
  | "WITHDRAWAL"
  | "REFUND"
  | "ADJUSTMENT";

export type WalletTransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

/* -----------------------------------------
 * Wallet Transaction
 * ----------------------------------------- */

export interface WalletTransaction {
  id: string;

  reference: string;

  description: string;

  amount: number;

  type: WalletTransactionType;

  status: WalletTransactionStatus;

  balanceBefore: number;

  balanceAfter: number;

  createdAt: string;

  /**
   * Set CLIENT-SIDE ONLY (in TransactionHistory) when a CREDIT is pattern-matched
   * against a prior DEBIT/PURCHASE of the same amount within a short window.
   * This is a heuristic guess, not a backend-confirmed fact — the backend does
   * not currently distinguish "top-up" credits from "cancellation refund" credits.
   * Once the backend tags real refunds with type: "REFUND" (or a relatedTransactionId),
   * this field and the matching logic in TransactionHistory should be deleted.
   */
  inferredRefundOf?: string;
}

/* -----------------------------------------
 * Wallet Funding
 * ----------------------------------------- */

export interface InitializeDepositResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyDepositResponse {
  success: boolean;
  wallet: Wallet;
}