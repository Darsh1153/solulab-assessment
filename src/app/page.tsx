import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
        <div className="space-y-5">
          <p className="text-sm font-medium text-zinc-500">
            Mock Payment Gateway
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple payment flow simulation
          </h1>

          <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Test a mock checkout experience with payment processing,
            transaction history, retries, and simulated success or failure
            states.
          </p>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Link
              href="/pay"
              className="flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
            >
              Start payment
            </Link>

            <Link
              href="/history"
              className="flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Transaction history
            </Link>
          </div>

          <div className="pt-6">
            <p className="text-sm text-zinc-500">
              Test card:
            </p>

            <p className="mt-1 font-mono text-sm text-zinc-700 dark:text-zinc-300">
              4242 4242 4242 4242
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
