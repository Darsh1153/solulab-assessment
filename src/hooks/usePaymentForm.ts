import * as React from "react";
import type { CardType, PaymentFormValues } from "@/types/payment";
import {
  type FieldErrors,
  validateAmount,
  validateCardholderName,
  validateCardNumber,
  validateCurrency,
  validateCvv,
  validateExpiry,
} from "@/utils/validation";
import { detectCardType, digitsOnly, formatCardNumber } from "@/utils/card";
import { normalizeExpiry } from "@/utils/expiry";

type Touched = Partial<Record<keyof PaymentFormValues, boolean>>;

function validateField(
  key: keyof PaymentFormValues,
  values: PaymentFormValues,
  derivedCardType: CardType,
): string | null {
  switch (key) {
    case "cardholderName":
      return validateCardholderName(values.cardholderName);
    case "cardNumber":
      return validateCardNumber(values.cardNumber, derivedCardType);
    case "expiry":
      return validateExpiry(values.expiry);
    case "cvv":
      return validateCvv(values.cvv, derivedCardType);
    case "amount":
      return validateAmount(values.amount);
    case "currency":
      return validateCurrency(values.currency);
    default:
      return null;
  }
}

function computeAllErrors(values: PaymentFormValues, derivedCardType: CardType): FieldErrors {
  const keys: (keyof PaymentFormValues)[] = [
    "cardholderName",
    "cardNumber",
    "expiry",
    "cvv",
    "amount",
    "currency",
  ];
  const next: FieldErrors = {};
  for (const k of keys) {
    const msg = validateField(k, values, derivedCardType);
    if (msg) next[k] = msg;
  }
  return next;
}

export function usePaymentForm(initial?: Partial<PaymentFormValues>) {
  const [values, setValues] = React.useState<PaymentFormValues>({
    cardholderName: initial?.cardholderName ?? "",
    cardNumber: initial?.cardNumber ?? "",
    expiry: initial?.expiry ?? "",
    cvv: initial?.cvv ?? "",
    amount: initial?.amount ?? "",
    currency: initial?.currency ?? "INR",
  });

  const cardType = React.useMemo(() => detectCardType(values.cardNumber), [values.cardNumber]);

  const [touched, setTouched] = React.useState<Touched>({});
  const [errors, setErrors] = React.useState<FieldErrors>({});

  const setField = React.useCallback(
    <K extends keyof PaymentFormValues>(key: K, rawValue: PaymentFormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [key]: rawValue } as PaymentFormValues;
        return next;
      });
      setErrors((prev) => {
        if (!touched[key]) return prev;
        const nextValues = { ...values, [key]: rawValue } as PaymentFormValues;
        const msg = validateField(key, nextValues, detectCardType(nextValues.cardNumber));
        const next = { ...prev };
        if (msg) next[key] = msg;
        else delete next[key];
        return next;
      });
    },
    [touched, values],
  );

  const onBlur = React.useCallback(
    <K extends keyof PaymentFormValues>(key: K) => {
      setTouched((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => {
        const msg = validateField(key, values, cardType);
        const next = { ...prev };
        if (msg) next[key] = msg;
        else delete next[key];
        return next;
      });
    },
    [values, cardType],
  );

  const handlers = React.useMemo(() => {
    return {
      cardholderName: {
        value: values.cardholderName,
        onChange: (v: string) => setField("cardholderName", v),
        onBlur: () => onBlur("cardholderName"),
      },
      cardNumber: {
        value: values.cardNumber,
        onChange: (v: string) => setField("cardNumber", formatCardNumber(v)),
        onBlur: () => onBlur("cardNumber"),
      },
      expiry: {
        value: values.expiry,
        onChange: (v: string) => setField("expiry", normalizeExpiry(v)),
        onBlur: () => onBlur("expiry"),
      },
      cvv: {
        value: values.cvv,
        onChange: (v: string) => {
          const maxLen = cardType === "amex" ? 4 : 3;
          const next = digitsOnly(v).slice(0, maxLen);
          setField("cvv", next);
        },
        onBlur: () => onBlur("cvv"),
      },
      amount: {
        value: values.amount,
        onChange: (v: string) => setField("amount", v),
        onBlur: () => onBlur("amount"),
      },
      currency: {
        value: values.currency,
        onChange: (v: string) => setField("currency", v as PaymentFormValues["currency"]),
        onBlur: () => onBlur("currency"),
      },
    };
  }, [values, setField, onBlur, cardType]);

  const isValid = React.useMemo(() => {
    const all = computeAllErrors(values, cardType);
    return Object.keys(all).length === 0;
  }, [values, cardType]);

  const markAllTouched = React.useCallback(() => {
    setTouched({
      cardholderName: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
      amount: true,
      currency: true,
    });
    setErrors(computeAllErrors(values, cardType));
  }, [values, cardType]);

  return {
    values,
    setValues,
    cardType,
    touched,
    errors,
    isValid,
    handlers,
    markAllTouched,
  };
}

