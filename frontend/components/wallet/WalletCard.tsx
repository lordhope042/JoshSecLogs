"use client";

type Props = {
  balance: number;
  onDeposit: () => void;
};

export default function WalletCard({
  balance,
  onDeposit,
}: Props) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-gray-900 dark:text-white">

      <p className="text-sm opacity-80">
        Available Balance
      </p>

      <h1 className="mt-2 text-4xl font-bold">
        ₦{balance.toLocaleString()}
      </h1>

      <button
        onClick={onDeposit}
        className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-blue-600"
      >
        Deposit
      </button>

    </div>
  );
}