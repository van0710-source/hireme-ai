import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DAILY_LIMIT = 3;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');
  
  if (!deviceId) {
    return NextResponse.json({ error: 'deviceId required' }, { status: 400 });
  }
  
  const today = new Date().toISOString().slice(0, 10);
  
  const { data } = await supabase
    .from('daily_usage')
    .select('call_count')
    .eq('device_id', deviceId)
    .eq('usage_date', today)
    .maybeSingle();
  
  const used = data?.call_count || 0;
  const remaining = Math.max(0, DAILY_LIMIT - used);
  
  return NextResponse.json({ remaining });
}