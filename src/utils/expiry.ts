export function parseExpiry(expiry: string): { month: number; year2: number } | null {
  const cleaned = expiry.replace(/\s/g, "");
  const m = cleaned.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const year2 = Number(m[2]);
  if (!Number.isFinite(month) || !Number.isFinite(year2)) return null;
  return { month, year2 };
}

export function normalizeExpiry(expiry: string): string {
  const digits = expiry.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isValidExpiryNotPast(expiry: string, now = new Date()): boolean {
  const parsed = parseExpiry(expiry);
  if (!parsed) return false;
  const { month, year2 } = parsed;
  if (month < 1 || month > 12) return false;

  const currentYear = now.getFullYear();
  const century = Math.floor(currentYear / 100) * 100;
  const year = century + year2;

  // Card expiry usually valid through end of month.
  const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999); // day 0 => last day of prior month (month is 1-indexed here)
  return expiryEnd.getTime() >= now.getTime();
}

export function expiryToMonthYear(expiry: string, now = new Date()): { month: number; year: number } {
  const parsed = parseExpiry(expiry);
  if (!parsed) {
    throw new Error("Invalid expiry");
  }
  const { month, year2 } = parsed;
  const currentYear = now.getFullYear();
  const century = Math.floor(currentYear / 100) * 100;
  return { month, year: century + year2 };
}

