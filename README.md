# solulab-assessment (Payment Gateway UI)

Next.js (App Router) + TypeScript implementation of a **mock payment gateway UI** (no third‑party payment SDK). It simulates real payment-flow edge cases using a Next.js Route Handler and manages the lifecycle + history on the frontend.

## Features
- **Payment form**: cardholder name, card number, expiry (MM/YY), CVV, amount, currency (INR/USD)
- **Realtime validation** (per-field on blur, then as-you-type)
- **Card handling**
  - spaces every 4 digits while typing
  - Visa / Mastercard / Amex detection + badge
  - expiry rejects past dates
  - CVV: 3 digits (4 for Amex)
- **Live card preview** updating as you type
- **Payment lifecycle**: Idle → Processing (~2s) → Success / Failed / Timeout
- **Gateway simulation** via `POST /api/pay`
  - ~60% success
  - ~25% failed with reason
  - ~15% delayed “timeout” response (8s)
- **Frontend timeout handling**: cancels request after **6s** using `AbortController`
- **Retry**: up to **3 attempts** per transaction, shows attempt count, reuses the same transaction ID
- **Transaction history** persisted in **localStorage**, viewable at `/history` with details at `/tx/[id]`

## Tech stack
- Next.js **16.2.6** (App Router)
- React **19**
- TypeScript
- Zustand (global store + persistence)
- Tailwind CSS

## Getting started

### Prerequisites
- Node.js: see `.nvmrc` (recommended) and `package.json#engines`

If you use nvm:

```bash
nvm install
nvm use
```

### Install + run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Useful scripts

```bash
npm run lint
npm run build
npm run start
```

## Routes
- **`/pay`**: payment form + card preview + lifecycle result screen
- **`/history`**: persisted transaction history list
- **`/tx/[id]`**: transaction details
- **`/api/pay`**: mock gateway route handler

## Project structure
- `src/app/` (App Router pages + API route)
- `src/components/` (UI components)
- `src/hooks/` (form + focus hooks)
- `src/store/` (Zustand store with persistence)
- `src/utils/` (formatting, validation, API call with AbortController)
- `src/types/` (shared TypeScript types)

## Assumptions
- Only **Visa / Mastercard / Amex** are treated as supported brands.
- Card validity uses:
  - **length rules** per detected brand (Amex 15, others 16)
  - **Luhn checksum** (common card-number validity check)
- The mock gateway’s 8s delayed response is meant to simulate a slow gateway; the client aborts at 6s and shows **Timeout**.
- History persistence is local to the browser/device via `localStorage` (no backend DB).

## What I would improve with more time
- Add unit tests for `utils/validation.ts`, `utils/card.ts`, `utils/expiry.ts`.
- Add E2E tests (Playwright) for the payment flow, retries, and persistence.
- Better formatting for amounts per currency (e.g., INR grouping) and more robust locale handling.
- More realistic card input behavior (brand-specific grouping, max lengths, copy/paste handling edge cases).
- Optional: a dedicated “transaction context” page state that restores the last viewed tx on refresh.

## Deployment
Not deployed yet. (If you deploy to Vercel, include the link here.)
