type Props = {
  balance: number;
};

export default function BalanceCard({
  balance,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        Wallet Balance
      </p>

      <h1 className="mt-2 text-3xl font-bold">
        ₦{balance.toLocaleString()}
      </h1>
    </div>
  );
}