"use client";

import { usePaymentStore } from "@/store/paymentStore";
import { TransactionRow } from "@/components/history/TransactionRow";

export function TransactionHistoryList() {
  const ids = usePaymentStore((s) => s.transactionIds);
  const byId = usePaymentStore((s) => s.transactionsById);

  if (ids.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
        No transactions yet. Make a payment to see it here.
      </div>
    );
  }

  return (
    <ol className="space-y-4">
      {ids.map((id) => {
        const tx = byId[id];
        if (!tx) return null;
        return <TransactionRow key={id} tx={tx} />;
      })}
    </ol>
  );
}

