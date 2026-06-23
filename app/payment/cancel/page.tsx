'use client';

import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white p-10 text-center shadow-xl shadow-stone-200/40">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-3xl">
          ↩
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-stone-900">
          Payment Cancelled
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-stone-500">
          No charges were made. You can return home and try again whenever you&apos;re ready.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
