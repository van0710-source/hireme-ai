import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import {
  computeQuotaStatus,
  type DeviceQuota,
} from '@/lib/quota';
import { isValidDeviceId } from '@/lib/validation';

const DEFAULT_QUOTA: DeviceQuota = {
  total_used: 0,
  credits: 0,
  paid_uses: 0,
};

async function getOrCreateDeviceQuota(deviceId: string): Promise<DeviceQuota> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('anonymous_devices')
    .select('total_used, credits, paid_uses')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (existing) {
    return {
      total_used: existing.total_used ?? 0,
      credits: existing.credits ?? 0,
      paid_uses: existing.paid_uses ?? 0,
    };
  }

  await supabase.from('anonymous_devices').insert({
    device_id: deviceId,
    last_seen_at: new Date().toISOString(),
    total_used: 0,
    credits: 0,
    paid_uses: 0,
  });

  return DEFAULT_QUOTA;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');

  if (!deviceId || !isValidDeviceId(deviceId)) {
    return NextResponse.json({ error: 'Valid deviceId required' }, { status: 400 });
  }

  try {
    const quota = await getOrCreateDeviceQuota(deviceId);
    const status = computeQuotaStatus(quota);

    return NextResponse.json({
      remaining: status.freeRemaining,
      freeRemaining: status.freeRemaining,
      credits: status.credits,
      paidUses: status.paidUses,
      totalUsed: status.totalUsed,
      canGenerate: status.canGenerate,
    });
  } catch (error) {
    console.error('remaining API error:', error);
    return NextResponse.json({ error: 'Failed to fetch quota' }, { status: 500 });
  }
}
