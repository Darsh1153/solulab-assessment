import type { CardType } from "@/types/payment";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(raw: string): string {
  const digits = digitsOnly(raw).slice(0, 19); // hard safety cap
  // Requirement: spaces every 4 digits (even for Amex)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function detectCardType(rawCardNumber: string): CardType {
  const digits = digitsOnly(rawCardNumber);
  if (digits.startsWith("4")) return "visa";
  // Mastercard: 51-55 or 2221-2720
  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720))
    return "mastercard";
  if (digits.startsWith("34") || digits.startsWith("37")) return "amex";
  return "unknown";
}

export function expectedCardLength(cardType: CardType): number {
  if (cardType === "amex") return 15;
  if (cardType === "visa" || cardType === "mastercard") return 16;
  return 16;
}

export function maskCardNumber(formatted: string): string {
  const digits = digitsOnly(formatted);
  const last4 = digits.slice(-4);
  const maskedDigits = digits.length <= 4 ? digits : `${"•".repeat(digits.length - 4)}${last4}`;
  return maskedDigits.replace(/(.{4})(?=.)/g, "$1 ").trim();
}

export function luhnCheck(rawCardNumber: string): boolean {
  const digits = digitsOnly(rawCardNumber);
  if (digits.length < 12) return false;
  let sum = 0;
  let doubleIt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    const d = Number(digits[i]);
    let add = d;
    if (doubleIt) {
      add = d * 2;
      if (add > 9) add -= 9;
    }
    sum += add;
    doubleIt = !doubleIt;
  }
  return sum % 10 === 0;
}

export function last4(rawCardNumber: string): string {
  const digits = digitsOnly(rawCardNumber);
  return digits.slice(-4);
}

