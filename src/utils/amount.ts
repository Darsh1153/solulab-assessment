export function parseAmount(amount: string): number | null {
  const cleaned = amount.trim();
  if (!cleaned) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;
  return num;
}

export function isValidAmount(amount: string): boolean {
  const num = parseAmount(amount);
  return num !== null && num > 0;
}

