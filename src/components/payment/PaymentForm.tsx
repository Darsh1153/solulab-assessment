"use client";

import * as React from "react";
import { CardPreview } from "@/components/payment/CardPreview";
import { CardTypeBadge } from "@/components/payment/CardTypeBadge";
import { CurrencySelect } from "@/components/payment/CurrencySelect";
import { StatusScreen } from "@/components/payment/StatusScreen";
import { usePaymentForm } from "@/hooks/usePaymentForm";
import type { PaymentPayload, Transaction } from "@/types/payment";
import { pay, PaymentNetworkError, PaymentTimeoutError } from "@/utils/payApi";
import { parseAmount } from "@/utils/amount";
import { digitsOnly, last4 as getLast4 } from "@/utils/card";
import { expiryToMonthYear } from "@/utils/expiry";
import { usePaymentStore } from "@/store/paymentStore";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPayload(
  values: ReturnType<typeof usePaymentForm>["values"],
  cardTypeLocal: PaymentPayload["cardType"],
  txId: string,
) {
  const amount = parseAmount(values.amount);
  if (amount === null) throw new Error("Invalid amount");
  const { month, year } = expiryToMonthYear(values.expiry);
  const digits = digitsOnly(values.cardNumber);
  const payload: PaymentPayload = {
    transactionId: txId,
    amount,
    currency: values.currency,
    cardholderName: values.cardholderName.trim(),
    cardNumber: digits,
    expiryMonth: month,
    expiryYear: year,
    cvv: digitsOnly(values.cvv),
    cardType: cardTypeLocal,
  };
  return payload;
}

export function PaymentForm() {
  const {
    values,
    setValues,
    cardType,
    errors,
    isValid,
    handlers,
    markAllTouched,
  } = usePaymentForm();

  const status = usePaymentStore((s) => s.status);
  const currentTransactionId = usePaymentStore((s) => s.currentTransactionId);
  const transactionsById = usePaymentStore((s) => s.transactionsById);

  const startTransaction = usePaymentStore((s) => s.startTransaction);
  const setProcessing = usePaymentStore((s) => s.setProcessing);
  const recordSuccess = usePaymentStore((s) => s.recordSuccess);
  const recordFailure = usePaymentStore((s) => s.recordFailure);
  const recordTimeout = usePaymentStore((s) => s.recordTimeout);
  const incrementAttempt = usePaymentStore((s) => s.incrementAttempt);
  const resetUi = usePaymentStore((s) => s.resetUi);

  const [submitting, setSubmitting] = React.useState(false);

  const tx: Transaction | null = currentTransactionId ? transactionsById[currentTransactionId] ?? null : null;

  const isBusy = submitting || status === "processing";

  const errorIds = React.useMemo(() => {
    return {
      cardholderName: "err-cardholderName",
      cardNumber: "err-cardNumber",
      expiry: "err-expiry",
      cvv: "err-cvv",
      amount: "err-amount",
      currency: "err-currency",
    } as const;
  }, []);

  const runPaymentAttempt = React.useCallback(
    async (txId: string) => {
      const payload = buildPayload(values, cardType, txId);
      const outcomePromise = pay(payload);
      const minDelayPromise = sleep(2000);
      const outcome = await Promise.all([outcomePromise, minDelayPromise]).then(([o]) => o);
      if (outcome.outcome === "success") recordSuccess(txId);
      else if (outcome.outcome === "timeout") recordTimeout(txId, "The payment took too long. Please retry.");
      else recordFailure(txId, outcome.reason);
    },
    [values, cardType, recordSuccess, recordFailure, recordTimeout],
  );

  const onSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) {
        markAllTouched();
        return;
      }
      if (status === "processing") return;
      // Start a brand new payment flow (new transaction id) unless we're already idle.
      if (status !== "idle") resetUi();
      if (isBusy) return;

      const txId = crypto.randomUUID();
      const amount = parseAmount(values.amount);
      if (amount === null) {
        markAllTouched();
        return;
      }
      startTransaction(txId, {
        amount,
        currency: values.currency,
        cardType,
        last4: getLast4(values.cardNumber),
        cardholderName: values.cardholderName.trim(),
      });

      setSubmitting(true);
      try {
        await runPaymentAttempt(txId);
      } catch (err) {
        if (err instanceof PaymentTimeoutError) recordTimeout(txId, err.message);
        else if (err instanceof PaymentNetworkError) recordFailure(txId, err.message);
        else recordFailure(txId, "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [
      isValid,
      markAllTouched,
      status,
      isBusy,
      values.amount,
      values.currency,
      values.cardNumber,
      values.cardholderName,
      resetUi,
      startTransaction,
      cardType,
      runPaymentAttempt,
      recordTimeout,
      recordFailure,
    ],
  );

  const onRetry = React.useCallback(async () => {
    if (!tx || isBusy) return;
    if (tx.attempts >= 3) return;
    incrementAttempt(tx.id);
    setProcessing(tx.id);

    setSubmitting(true);
    try {
      await runPaymentAttempt(tx.id);
    } catch (err) {
      if (err instanceof PaymentTimeoutError) recordTimeout(tx.id, err.message);
      else if (err instanceof PaymentNetworkError) recordFailure(tx.id, err.message);
      else recordFailure(tx.id, "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [tx, isBusy, incrementAttempt, setProcessing, runPaymentAttempt, recordTimeout, recordFailure]);

  const onNewPayment = React.useCallback(() => {
    resetUi();
    setValues((prev) => ({
      ...prev,
      cardholderName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      amount: "",
      currency: prev.currency,
    }));
  }, [resetUi, setValues]);

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <CardPreview
          cardNumber={values.cardNumber}
          cardholderName={values.cardholderName}
          expiry={values.expiry}
          cardType={cardType}
        />
        <StatusScreen status={status} transaction={tx} onRetry={onRetry} onNewPayment={onNewPayment} isBusy={isBusy} />
      </div>

      <section className="w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Pay securely</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Your card details stay in this demo app. No real payment SDK is used.
            </p>
          </div>
          <CardTypeBadge cardType={cardType} />
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4"
          noValidate
          aria-busy={status === "processing"}
        >
          <div>
            <label htmlFor="cardholderName" className="text-sm font-medium">
              Cardholder name
            </label>
            <input
              id="cardholderName"
              value={handlers.cardholderName.value}
              onChange={(e) => handlers.cardholderName.onChange(e.target.value)}
              onBlur={handlers.cardholderName.onBlur}
              disabled={status === "processing"}
              aria-invalid={Boolean(errors.cardholderName)}
              aria-describedby={errors.cardholderName ? errorIds.cardholderName : undefined}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-zinc-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-black"
              autoComplete="cc-name"
              inputMode="text"
            />
            {errors.cardholderName ? (
              <p id={errorIds.cardholderName} className="mt-1 text-sm text-rose-700 dark:text-rose-400">
                {errors.cardholderName}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="cardNumber" className="text-sm font-medium">
              Card number
            </label>
            <input
              id="cardNumber"
              value={handlers.cardNumber.value}
              onChange={(e) => handlers.cardNumber.onChange(e.target.value)}
              onBlur={handlers.cardNumber.onBlur}
              disabled={status === "processing"}
              aria-invalid={Boolean(errors.cardNumber)}
              aria-describedby={errors.cardNumber ? errorIds.cardNumber : undefined}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-mono text-sm tracking-widest shadow-sm outline-none focus:border-zinc-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-black"
              autoComplete="cc-number"
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
            />
            {errors.cardNumber ? (
              <p id={errorIds.cardNumber} className="mt-1 text-sm text-rose-700 dark:text-rose-400">
                {errors.cardNumber}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="expiry" className="text-sm font-medium">
                Expiry (MM/YY)
              </label>
              <input
                id="expiry"
                value={handlers.expiry.value}
                onChange={(e) => handlers.expiry.onChange(e.target.value)}
                onBlur={handlers.expiry.onBlur}
                disabled={status === "processing"}
                aria-invalid={Boolean(errors.expiry)}
                aria-describedby={errors.expiry ? errorIds.expiry : undefined}
                className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-mono text-sm shadow-sm outline-none focus:border-zinc-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-black"
                autoComplete="cc-exp"
                inputMode="numeric"
                placeholder="MM/YY"
              />
              {errors.expiry ? (
                <p id={errorIds.expiry} className="mt-1 text-sm text-rose-700 dark:text-rose-400">
                  {errors.expiry}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="cvv" className="text-sm font-medium">
                CVV
              </label>
              <input
                id="cvv"
                value={handlers.cvv.value}
                onChange={(e) => handlers.cvv.onChange(e.target.value)}
                onBlur={handlers.cvv.onBlur}
                disabled={status === "processing"}
                aria-invalid={Boolean(errors.cvv)}
                aria-describedby={errors.cvv ? errorIds.cvv : undefined}
                className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-mono text-sm shadow-sm outline-none focus:border-zinc-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-black"
                autoComplete="cc-csc"
                inputMode="numeric"
                placeholder={cardType === "amex" ? "4 digits" : "3 digits"}
              />
              {errors.cvv ? (
                <p id={errorIds.cvv} className="mt-1 text-sm text-rose-700 dark:text-rose-400">
                  {errors.cvv}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label htmlFor="currency" className="text-sm font-medium">
                Currency
              </label>
              <div className="mt-1">
                <CurrencySelect
                  id="currency"
                  value={handlers.currency.value}
                  onChange={(v) => handlers.currency.onChange(v)}
                  onBlur={handlers.currency.onBlur}
                  disabled={status === "processing"}
                  aria-describedby={errors.currency ? errorIds.currency : undefined}
                />
              </div>
              {errors.currency ? (
                <p id={errorIds.currency} className="mt-1 text-sm text-rose-700 dark:text-rose-400">
                  {errors.currency}
                </p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
              </label>
              <input
                id="amount"
                value={handlers.amount.value}
                onChange={(e) => handlers.amount.onChange(e.target.value)}
                onBlur={handlers.amount.onBlur}
                disabled={status === "processing"}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? errorIds.amount : undefined}
                className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-zinc-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-black"
                inputMode="decimal"
                placeholder="0.00"
              />
              {errors.amount ? (
                <p id={errorIds.amount} className="mt-1 text-sm text-rose-700 dark:text-rose-400">
                  {errors.amount}
                </p>
              ) : null}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!isValid || isBusy}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {status === "processing" ? "Processing…" : "Pay now"}
            </button>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <button
                type="button"
                onClick={onNewPayment}
                disabled={isBusy}
                className="underline underline-offset-4 text-zinc-700 disabled:opacity-40 dark:text-zinc-300"
              >
                Clear form
              </button>
              <span className="text-zinc-500 dark:text-zinc-500">We’ll cancel if it takes longer than 6 seconds.</span>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

