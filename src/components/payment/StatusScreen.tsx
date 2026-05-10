"use client";

import Link from "next/link";
import type { PaymentStatus, Transaction } from "@/types/payment";
import { canRetry, retryLabel } from "@/store/paymentStore";
import { useFocusRestore } from "@/hooks/useFocusRestore";

type Props = {
  status: PaymentStatus;
  transaction: Transaction | null;
  onRetry: () => void;
  onNewPayment: () => void;
  isBusy: boolean;
};

export function StatusScreen({ status, transaction, onRetry, onNewPayment, isBusy }: Props) {
  const titleRef = useFocusRestore<HTMLHeadingElement>([status, transaction?.id]);

  if (status === "idle") return null;

  const attemptText = retryLabel(transaction ?? undefined);
  const retryEnabled = canRetry(transaction ?? undefined) && !isBusy;

  const title =
    status === "processing"
      ? "Processing payment"
      : status === "success"
        ? "Payment successful"
        : status === "timeout"
          ? "Payment timed out"
          : "Payment failed";

  const message =
    status === "processing"
      ? "Please keep this tab open. This can take a moment on slow networks."
      : status === "success"
        ? "Your payment was completed. You can view the transaction details anytime."
        : status === "timeout"
          ? transaction?.failureReason ?? "The payment took too long. Please retry."
          : transaction?.failureReason ?? "The payment failed. Please retry.";

  return (
    <section
      className="w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black"
      aria-live="polite"
    >
      <h2 ref={titleRef} className="text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>

      {transaction ? (
        <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-950">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-medium">Transaction</div>
            <Link className="text-zinc-900 underline underline-offset-4 dark:text-zinc-100" href={`/tx/${transaction.id}`}>
              View details
            </Link>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-1 text-zinc-700 dark:text-zinc-300">
            <div>
              <span className="text-zinc-500 dark:text-zinc-500">ID:</span> {transaction.id}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div>
                <span className="text-zinc-500 dark:text-zinc-500">Status:</span> {transaction.status}
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-500">Attempts:</span> {attemptText}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {(status === "failed" || status === "timeout") && transaction ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={!retryEnabled}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Retry
          </button>
        ) : null}

        <button
          type="button"
          onClick={onNewPayment}
          disabled={isBusy}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium shadow-sm disabled:opacity-40 dark:border-zinc-800 dark:bg-black"
        >
          New payment
        </button>

        <Link
          className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium shadow-sm dark:border-zinc-800 dark:bg-black"
          href="/history"
        >
          View history
        </Link>
      </div>

      {(status === "failed" || status === "timeout") && transaction && !canRetry(transaction) ? (
        <p className="mt-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          Maximum retry attempts reached. Please start a new transaction.
        </p>
      ) : null}
    </section>
  );
}

