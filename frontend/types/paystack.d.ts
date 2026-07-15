declare module "@paystack/inline-js" {
  export interface PaystackTransaction {
    reference: string;
    status: string;
    trans?: string;
    trxref?: string;
  }

  export interface PaystackOptions {
    key: string;
    email: string;
    amount: number;
    reference: string;

    onSuccess(
      transaction: PaystackTransaction,
    ): void;

    onCancel(): void;
  }

  export default class PaystackPop {
    newTransaction(
      options: PaystackOptions,
    ): void;
  }
}