"use client";

import Link from "next/link";
import type { Transaction } from "@/types/payment";

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString();
}

export function TransactionRow({ tx }: { tx: Transaction }) {
  const statusTone =
    tx.status === "success"
      ? "text-emerald-700 bg-emerald-50 ring-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:ring-emerald-900"
      : tx.status === "processing"
        ? "text-blue-700 bg-blue-50 ring-blue-200 dark:text-blue-300 dark:bg-blue-950/40 dark:ring-blue-900"
        : tx.status === "timeout"
          ? "text-amber-800 bg-amber-50 ring-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:ring-amber-900"
          : "text-rose-800 bg-rose-50 ring-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:ring-rose-900";

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">{tx.id}</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{formatTime(tx.updatedAt)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">{formatMoney(tx.amount, tx.currency)}</div>
          <div className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ${statusTone}`}>
            {tx.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-zinc-600 dark:text-zinc-400">
          {tx.cardType.toUpperCase()} •••• {tx.last4} • {tx.attempts} attempt{tx.attempts === 1 ? "" : "s"}
        </div>
        <Link className="underline underline-offset-4" href={`/tx/${tx.id}`}>
          View details
        </Link>
      </div>
    </li>
  );
}

