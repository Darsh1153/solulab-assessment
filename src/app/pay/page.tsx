"use client";

import Link from "next/link";
import { PaymentForm } from "@/components/payment/PaymentForm";

export default function PayPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-black/40">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Payment Gateway Demo
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="underline underline-offset-4" href="/pay">
              Pay
            </Link>
            <Link className="underline underline-offset-4" href="/history">
              History
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <PaymentForm />
      </main>
    </div>
  );
}

