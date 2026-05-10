import type { GatewayOutcome, PaymentPayload } from "@/types/payment";

export const runtime = "nodejs";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPaymentPayload(value: unknown): value is PaymentPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.transactionId === "string" &&
    typeof v.amount === "number" &&
    (v.currency === "INR" || v.currency === "USD") &&
    typeof v.cardholderName === "string" &&
    typeof v.cardNumber === "string" &&
    typeof v.expiryMonth === "number" &&
    typeof v.expiryYear === "number" &&
    typeof v.cvv === "string" &&
    (v.cardType === "visa" || v.cardType === "mastercard" || v.cardType === "amex" || v.cardType === "unknown")
  );
}

function randomOutcome(): GatewayOutcome {
  const r = Math.random();
  if (r < 0.6) return { outcome: "success" };
  if (r < 0.85) {
    const reasons = [
      "Insufficient funds",
      "Card declined",
      "Invalid card details",
      "Bank rejected the transaction",
    ] as const;
    const reason = reasons[Math.floor(Math.random() * reasons.length)] ?? "Payment failed";
    return { outcome: "failed", reason };
  }
  return { outcome: "timeout" };
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ outcome: "failed", reason: "Invalid request payload." } satisfies GatewayOutcome, {
      status: 400,
    });
  }

  if (!isPaymentPayload(body)) {
    return Response.json({ outcome: "failed", reason: "Invalid request payload." } satisfies GatewayOutcome, {
      status: 400,
    });
  }

  const outcome = randomOutcome();
  if (outcome.outcome === "timeout") {
    // Simulate gateway slowness. The client should AbortController-cancel at 6s.
    await sleep(8000);
  } else {
    // Small jitter so the API doesn't feel "instant".
    await sleep(150 + Math.floor(Math.random() * 250));
  }

  return Response.json(outcome);
}

