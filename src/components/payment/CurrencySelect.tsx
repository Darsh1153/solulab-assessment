"use client";

import type { Currency } from "@/types/payment";

export function CurrencySelect({
  value,
  onChange,
  onBlur,
  id,
  disabled,
  "aria-describedby": ariaDescribedBy,
}: {
  id: string;
  value: Currency;
  onChange: (v: Currency) => void;
  onBlur: () => void;
  disabled?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as Currency)}
      onBlur={onBlur}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none ring-0 focus:border-zinc-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-black"
    >
      <option value="INR">INR</option>
      <option value="USD">USD</option>
    </select>
  );
}

