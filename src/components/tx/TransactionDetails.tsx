"use client";

import type { Transaction } from "@/types/payment";

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function TransactionDetails({ tx }: { tx: Transaction }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black">
      <h1 className="text-xl font-semibold tracking-tight">Transaction details</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">ID: {tx.id}</p>

      <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-500">Amount</dt>
          <dd className="mt-1 font-medium">{formatMoney(tx.amount, tx.currency)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-500">Status</dt>
          <dd className="mt-1 font-medium">{tx.status.toUpperCase()}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-500">Created</dt>
          <dd className="mt-1 font-medium">{new Date(tx.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-500">Updated</dt>
          <dd className="mt-1 font-medium">{new Date(tx.updatedAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-500">Attempts</dt>
          <dd className="mt-1 font-medium">{tx.attempts}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-500">Card</dt>
          <dd className="mt-1 font-medium">
            {tx.cardType.toUpperCase()} •••• {tx.last4}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-zinc-500 dark:text-zinc-500">Cardholder</dt>
          <dd className="mt-1 font-medium">{tx.cardholderName}</dd>
        </div>
        {tx.failureReason ? (
          <div className="sm:col-span-2">
            <dt className="text-zinc-500 dark:text-zinc-500">Failure reason</dt>
            <dd className="mt-1 font-medium text-rose-800 dark:text-rose-300">{tx.failureReason}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
