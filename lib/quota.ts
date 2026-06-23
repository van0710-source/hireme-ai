export const FREE_LIMIT = 3;
export const CREDITS_PER_USE = 15;
export const CREDITS_PACK_AMOUNT = 200;

export type DeductionType = 'free' | 'paid_uses' | 'credits';

export interface DeviceQuota {
  total_used: number;
  credits: number;
  paid_uses: number;
}

export interface QuotaStatus {
  totalUsed: number;
  freeRemaining: number;
  credits: number;
  paidUses: number;
  canGenerate: boolean;
}

export function computeQuotaStatus(quota: DeviceQuota): QuotaStatus {
  const freeRemaining = Math.max(0, FREE_LIMIT - quota.total_used);
  const canGenerate =
    quota.total_used < FREE_LIMIT ||
    quota.paid_uses > 0 ||
    quota.credits >= CREDITS_PER_USE;

  return {
    totalUsed: quota.total_used,
    freeRemaining,
    credits: quota.credits,
    paidUses: quota.paid_uses,
    canGenerate,
  };
}

export function determineDeduction(quota: DeviceQuota): DeductionType | null {
  if (quota.total_used < FREE_LIMIT) return 'free';
  if (quota.paid_uses > 0) return 'paid_uses';
  if (quota.credits >= CREDITS_PER_USE) return 'credits';
  return null;
}

export function buildQuotaUpdate(
  quota: DeviceQuota,
  deduction: DeductionType
): Partial<DeviceQuota> & { total_used: number } {
  const total_used = quota.total_used + 1;

  if (deduction === 'free') {
    return { total_used };
  }
  if (deduction === 'paid_uses') {
    return { total_used, paid_uses: quota.paid_uses - 1 };
  }
  return { total_used, credits: quota.credits - CREDITS_PER_USE };
}
