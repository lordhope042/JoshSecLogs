"use client";

type Props = {
  amount: number;
};

export default function DepositSuccess({
  amount,
}: Props) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6">

      <h2 className="text-lg font-bold text-green-700">
        Deposit Successful
      </h2>

      <p className="mt-2">
        ₦{amount.toLocaleString()} has been
        added to your wallet.
      </p>

    </div>
  );
}