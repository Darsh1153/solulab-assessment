"use client";

import type { CardType } from "@/types/payment";

const LABEL: Record<CardType, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  unknown: "Card",
};

export function CardTypeBadge({ cardType }: { cardType: CardType }) {
  const label = LABEL[cardType];
  const tone =
    cardType === "visa"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : cardType === "mastercard"
        ? "bg-orange-50 text-orange-700 ring-orange-200"
        : cardType === "amex"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-zinc-50 text-zinc-700 ring-zinc-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ${tone}`}>
      {label}
    </span>
  );
}

