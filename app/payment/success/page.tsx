'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState<'confirming' | 'ready' | 'timeout'>('confirming');
  const [quotaSummary, setQuotaSummary] = useState('');

  const deviceId = searchParams.get('deviceId') ?? '';
  const checkoutId = searchParams.get('checkout_id') ?? searchParams.get('checkoutId') ?? '';

  const pollQuota = useCallback(async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/remaining?deviceId=${id}`);
    const data = await res.json();
    const canGenerate = Boolean(data.canGenerate);
    const parts: string[] = [];
    if (data.freeRemaining > 0) parts.push(`${data.freeRemaining} free`);
    if (data.paidUses > 0) parts.push(`${data.paidUses} pass(es)`);
    if (data.credits > 0) parts.push(`${data.credits} credits`);
    setQuotaSummary(parts.join(' · ') || 'Balance updated');
    return canGenerate;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function confirmAndPoll() {
      if (!deviceId) {
        setStatus('timeout');
        return;
      }

      if (checkoutId) {
        try {
          await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkoutId, deviceId }),
          });
        } catch {
          // Webhook may have already applied credits
        }
      }

      for (let i = 0; i < 10; i++) {
        if (cancelled) return;
        const ready = await pollQuota(deviceId);
        if (ready) {
          setStatus('ready');
          return;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (!cancelled) setStatus('timeout');
    }

    void confirmAndPoll();
    return () => {
      cancelled = true;
    };
  }, [deviceId, checkoutId, pollQuota]);

  useEffect(() => {
    if (status === 'confirming') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/?payment=success';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white p-10 text-center shadow-xl shadow-stone-200/40">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
          ✓
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-stone-900">
          Payment Successful
        </h1>
        <p className="mb-2 text-sm leading-relaxed text-stone-500">
          Your credits have been added. You&apos;re ready to generate tailored interview prep.
        </p>
        {status === 'confirming' && (
          <p className="mb-4 text-xs text-stone-400">Confirming your balance…</p>
        )}
        {status !== 'confirming' && quotaSummary && (
          <p className="mb-4 rounded-lg bg-stone-50 px-3 py-2 text-xs font-medium text-stone-600">
            {quotaSummary}
          </p>
        )}
        {status === 'timeout' && (
          <p className="mb-4 text-xs text-amber-600">
            Balance may take a moment to update. If needed, refresh the home page.
          </p>
        )}
        {status !== 'confirming' && (
          <p className="mb-6 text-xs text-stone-400">
            Redirecting in {countdown}s…
          </p>
        )}
        <Link
          href="/?payment=success"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf9f7]">
          <p className="text-sm text-stone-500">Loading…</p>
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
