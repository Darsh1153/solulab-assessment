import type { GatewayOutcome, PaymentPayload } from "@/types/payment";

export class PaymentTimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "PaymentTimeoutError";
  }
}

export class PaymentNetworkError extends Error {
  constructor(message = "Network error") {
    super(message);
    this.name = "PaymentNetworkError";
  }
}

export async function pay(payload: PaymentPayload): Promise<GatewayOutcome> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Treat non-2xx as a friendly failure (not a "network error")
      return { outcome: "failed", reason: "Payment service returned an error. Please try again." };
    }

    const data: unknown = await res.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "outcome" in data &&
      (data as { outcome: unknown }).outcome === "success"
    ) {
      return { outcome: "success" };
    }
    if (
      typeof data === "object" &&
      data !== null &&
      "outcome" in data &&
      (data as { outcome: unknown }).outcome === "timeout"
    ) {
      return { outcome: "timeout" };
    }
    if (typeof data === "object" && data !== null && "outcome" in data) {
      const outcome = (data as { outcome: unknown }).outcome;
      const reason = (data as { reason?: unknown }).reason;
      if (outcome === "failed") {
        return {
          outcome: "failed",
          reason: typeof reason === "string" && reason.trim() ? reason : "Payment failed.",
        };
      }
    }

    return { outcome: "failed", reason: "Unexpected gateway response. Please try again." };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new PaymentTimeoutError("The payment took too long. Please retry.");
    }
    throw new PaymentNetworkError("We couldn’t reach the payment service. Check your connection.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}

