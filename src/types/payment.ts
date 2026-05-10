export type Currency = "INR" | "USD";

export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export type PaymentStatus = "idle" | "processing" | "success" | "failed" | "timeout";

export interface CardInputValues {
  cardholderName: string;
  cardNumber: string; // formatted with spaces
  expiry: string; // MM/YY
  cvv: string;
}

export interface PaymentFormValues extends CardInputValues {
  amount: string; // keep as string for input control
  currency: Currency;
}

export interface PaymentPayload {
  transactionId: string;
  amount: number;
  currency: Currency;
  cardholderName: string;
  cardNumber: string; // digits only
  expiryMonth: number;
  expiryYear: number; // four-digit year
  cvv: string;
  cardType: CardType;
}

export type GatewayOutcome =
  | { outcome: "success" }
  | { outcome: "failed"; reason: string }
  | { outcome: "timeout" };

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  attempts: number; // number of attempts made (1..max)
  cardType: CardType;
  last4: string;
  cardholderName: string;
  failureReason?: string;
}

