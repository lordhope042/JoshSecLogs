"use client";

import PaystackPop, {
  PaystackTransaction,
} from "@paystack/inline-js";

type Props = {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string) => void;
};

export function usePaystack({
  email,
  amount,
  reference,
  onSuccess,
}: Props) {
  function open() {
    const popup = new PaystackPop();

    popup.newTransaction({
      key:
        process.env
          .NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,

      email,

      amount: amount * 100,

      reference,

      onSuccess(
        transaction: PaystackTransaction,
      ) {
        onSuccess(transaction.reference);
      },

      onCancel() {
        console.log("Payment cancelled");
      },
    });
  }

  return { open };
}