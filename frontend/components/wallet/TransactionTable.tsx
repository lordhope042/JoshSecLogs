import { WalletTransaction } from "@/types/wallet";

type Props = {
  transactions: WalletTransaction[];
};

export default function TransactionTable({
  transactions,
}: Props) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
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