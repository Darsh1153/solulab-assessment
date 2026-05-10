"use client";

import type { CardType } from "@/types/payment";
import { maskCardNumber } from "@/utils/card";

type Props = {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cardType: CardType;
};

function prettyName(name: string): string {
  const t = name.trim();
  return t ? t.toUpperCase() : "CARDHOLDER NAME";
}

function prettyExpiry(expiry: string): string {
  const t = expiry.trim();
  if (!t) return "MM/YY";
  return t;
}

function prettyNumber(cardNumber: string): string {
  const t = cardNumber.trim();
  if (!t) return "•••• •••• •••• ••••";
  return maskCardNumber(t);
}

export function CardPreview({ cardNumber, cardholderName, expiry, cardType }: Props) {
  const accent =
    cardType === "visa"
      ? "from-blue-600 to-indigo-600"
      : cardType === "mastercard"
        ? "from-orange-600 to-rose-600"
        : cardType === "amex"
          ? "from-emerald-600 to-teal-600"
          : "from-zinc-700 to-zinc-900";

  return (
    <section
      aria-label="Card preview"
      className={`w-full rounded-2xl bg-gradient-to-br ${accent} p-5 text-white shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm/6 opacity-90">Payment card</div>
        <div className="text-xs font-medium tracking-wide opacity-90">{cardType.toUpperCase()}</div>
      </div>

      <div className="mt-8 font-mono text-lg tracking-widest">{prettyNumber(cardNumber)}</div>

      <div className="mt-6 flex items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide opacity-80">Cardholder</div>
          <div className="truncate text-sm font-medium">{prettyName(cardholderName)}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[11px] uppercase tracking-wide opacity-80">Expiry</div>
          <div className="text-sm font-medium">{prettyExpiry(expiry)}</div>
        </div>
      </div>
    </section>
  );
}

