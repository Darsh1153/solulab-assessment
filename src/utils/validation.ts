import type { CardType, PaymentFormValues } from "@/types/payment";
import { digitsOnly, expectedCardLength, luhnCheck } from "@/utils/card";
import { isValidAmount } from "@/utils/amount";
import { isValidExpiryNotPast } from "@/utils/expiry";

export type FieldKey = keyof PaymentFormValues;

export type FieldErrors = Partial<Record<FieldKey, string>>;

export function validateCardholderName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Cardholder name is required.";
  if (trimmed.length < 2) return "Name looks too short.";
  return null;
}

export function validateCardNumber(cardNumber: string, cardType: CardType): string | null {
  const digits = digitsOnly(cardNumber);
  const expected = expectedCardLength(cardType);
  if (!digits) return "Card number is required.";
  if (digits.length !== expected) return `Card number must be ${expected} digits.`;
  if (!luhnCheck(digits)) return "Card number is invalid.";
  return null;
}

export function validateExpiry(expiry: string): string | null {
  if (!expiry.trim()) return "Expiry date is required.";
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Use MM/YY format.";
  if (!isValidExpiryNotPast(expiry)) return "Card is expired.";
  return null;
}

export function validateCvv(cvv: string, cardType: CardType): string | null {
  const digits = digitsOnly(cvv);
  const expected = cardType === "amex" ? 4 : 3;
  if (!digits) return "CVV is required.";
  if (digits.length !== expected) return `CVV must be ${expected} digits.`;
  return null;
}

export function validateAmount(amount: string): string | null {
  if (!amount.trim()) return "Amount is required.";
  if (!isValidAmount(amount)) return "Enter a valid amount (up to 2 decimals).";
  return null;
}

export function validateCurrency(currency: string): string | null {
  if (currency !== "INR" && currency !== "USD") return "Select a currency.";
  return null;
}

