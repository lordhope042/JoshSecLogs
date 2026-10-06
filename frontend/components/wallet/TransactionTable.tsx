import { WalletTransaction } from "@/types/wallet";

type Props = {
  transactions: WalletTransaction[];
};

export default function TransactionTable({
  transactions,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#0a1725] dark:shadow-none">
      <table className="w-full">
        <thead>
          <tr>
            <th>Description</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.description}</td>
              <td>{tx.type}</td>
              <td>
                ₦
                {Number(tx.amount).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}