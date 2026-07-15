type Props = {
  onDeposit: () => void;
};

export default function DepositCard({
  onDeposit,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <button
        onClick={onDeposit}
        className="w-full rounded-lg bg-blue-600 py-3 text-white"
      >
        Deposit Funds
      </button>
    </div>
  );
}