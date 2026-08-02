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

/*
 * These mirror the ACTUAL PostgreSQL enums confirmed from the live schema:
 *   enum "TransactionType"   => CREDIT | DEBIT | DEPOSIT | PURCHASE | REFUND | TRANSFER
 *   enum "TransactionStatus" => PENDING | SUCCESS | FAILED
 *
 * NOTE: the backend may return these in either UPPERCASE (raw enum) or
 * lowercase (Prisma client default). Components should normalise with
 * `.toUpperCase()` before comparing. The TransactionHistory component
 * already does this.
 *
 * Previous (incorrect) values that have been removed:
 *   - WITHDRAWAL, ADJUSTMENT  (not in DB enum — replaced by DEPOSIT, TRANSFER)
 *   - COMPLETED, CANCELLED    (not in DB enum — SUCCESS is the success value;
 *                              there is no CANCELLED status)
 */
export type WalletTransactionType =
  | "CREDIT"
  | "DEBIT"
  | "DEPOSIT"
  | "PURCHASE"
  | "REFUND"
  | "TRANSFER";

export type WalletTransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED";

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
