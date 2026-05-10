import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CardType, Currency, PaymentStatus, Transaction } from "@/types/payment";

export type PaymentUiState = {
  status: PaymentStatus;
  currentTransactionId: string | null;
  friendlyMessage: string | null;
};

export type PaymentDraftMeta = {
  amount: number;
  currency: Currency;
  cardType: CardType;
  last4: string;
  cardholderName: string;
};

type PersistedState = {
  transactionsById: Record<string, Transaction>;
  transactionIds: string[];
};

type PaymentStore = PaymentUiState &
  PersistedState & {
    startTransaction: (id: string, meta: PaymentDraftMeta) => void;
    setProcessing: (id: string) => void;
    recordSuccess: (id: string) => void;
    recordFailure: (id: string, reason: string) => void;
    recordTimeout: (id: string, reason: string) => void;
    incrementAttempt: (id: string) => void;
    resetUi: () => void;
    getTransaction: (id: string) => Transaction | undefined;
  };

const MAX_RETRIES = 3;

function nowMs(): number {
  return Date.now();
}

function upsertOrder(ids: string[], id: string): string[] {
  const next = ids.filter((x) => x !== id);
  next.unshift(id);
  return next;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      status: "idle",
      currentTransactionId: null,
      friendlyMessage: null,

      transactionsById: {},
      transactionIds: [],

      startTransaction: (id, meta) => {
        const t = nowMs();
        const tx: Transaction = {
          id,
          amount: meta.amount,
          currency: meta.currency,
          status: "processing",
          createdAt: t,
          updatedAt: t,
          attempts: 1,
          cardType: meta.cardType,
          last4: meta.last4,
          cardholderName: meta.cardholderName,
        };
        set((state) => ({
          status: "processing",
          currentTransactionId: id,
          friendlyMessage: null,
          transactionsById: { ...state.transactionsById, [id]: tx },
          transactionIds: upsertOrder(state.transactionIds, id),
        }));
      },

      setProcessing: (id) => {
        const existing = get().transactionsById[id];
        const t = nowMs();
        if (!existing) return;
        set((state) => ({
          status: "processing",
          currentTransactionId: id,
          friendlyMessage: null,
          transactionsById: {
            ...state.transactionsById,
            [id]: { ...existing, status: "processing", updatedAt: t },
          },
          transactionIds: upsertOrder(state.transactionIds, id),
        }));
      },

      recordSuccess: (id) => {
        const existing = get().transactionsById[id];
        const t = nowMs();
        if (!existing) return;
        set((state) => ({
          status: "success",
          currentTransactionId: id,
          friendlyMessage: null,
          transactionsById: {
            ...state.transactionsById,
            [id]: { ...existing, status: "success", updatedAt: t, failureReason: undefined },
          },
          transactionIds: upsertOrder(state.transactionIds, id),
        }));
      },

      recordFailure: (id, reason) => {
        const existing = get().transactionsById[id];
        const t = nowMs();
        if (!existing) return;
        set((state) => ({
          status: "failed",
          currentTransactionId: id,
          friendlyMessage: reason,
          transactionsById: {
            ...state.transactionsById,
            [id]: { ...existing, status: "failed", updatedAt: t, failureReason: reason },
          },
          transactionIds: upsertOrder(state.transactionIds, id),
        }));
      },

      recordTimeout: (id, reason) => {
        const existing = get().transactionsById[id];
        const t = nowMs();
        if (!existing) return;
        set((state) => ({
          status: "timeout",
          currentTransactionId: id,
          friendlyMessage: reason,
          transactionsById: {
            ...state.transactionsById,
            [id]: { ...existing, status: "timeout", updatedAt: t, failureReason: reason },
          },
          transactionIds: upsertOrder(state.transactionIds, id),
        }));
      },

      incrementAttempt: (id) => {
        const existing = get().transactionsById[id];
        const t = nowMs();
        if (!existing) return;
        const nextAttempts = Math.min(existing.attempts + 1, MAX_RETRIES);
        set((state) => ({
          transactionsById: {
            ...state.transactionsById,
            [id]: { ...existing, attempts: nextAttempts, updatedAt: t },
          },
        }));
      },

      resetUi: () =>
        set((state) => ({
          status: "idle",
          currentTransactionId: null,
          friendlyMessage: null,
          // Only clear live payment flow state; persist history.
          transactionsById: state.transactionsById,
          transactionIds: state.transactionIds,
        })),

      getTransaction: (id) => get().transactionsById[id],
    }),
    {
      name: "payment-store-v1",
      partialize: (state) => ({
        transactionsById: state.transactionsById,
        transactionIds: state.transactionIds,
      }),
    },
  ),
);

export function canRetry(tx: Transaction | undefined): boolean {
  if (!tx) return false;
  if (tx.status === "success") return false;
  return tx.attempts < MAX_RETRIES;
}

export function retryLabel(tx: Transaction | undefined): string {
  const attempt = tx?.attempts ?? 1;
  return `Attempt ${attempt} of ${MAX_RETRIES}`;
}

