// lib/usage.ts
// Central helper for reading and updating device usage quota

import { supabaseAdmin } from './supabase-server'

export const FREE_USES = 3
export const CREDITS_PER_PURCHASE = 200
export const CREDITS_PER_USE = 15

export interface UsageRecord {
  device_id: string
  total_used: number
  credits: number
}

/** Get or create usage record for a device */
export async function getUsage(deviceId: string): Promise<UsageRecord> {
  const { data, error } = await supabaseAdmin
    .from('daily_usage')
    .select('device_id, total_used, credits')
    .eq('device_id', deviceId)
    .maybeSingle()

  if (error) throw new Error(`DB read error: ${error.message}`)

  if (!data) {
    const { data: created, error: createError } = await supabaseAdmin
      .from('daily_usage')
      .insert({ device_id: deviceId, total_used: 0, credits: 0 })
      .select('device_id, total_used, credits')
      .single()
    if (createError) throw new Error(`DB insert error: ${createError.message}`)
    return created
  }

  return data
}

/** Check if device can generate (free quota or paid credits) */
export function canGenerate(usage: UsageRecord): boolean {
  if (usage.total_used < FREE_USES) return true
  if (usage.credits >= CREDITS_PER_USE) return true
  return false
}

/** Which payment type is needed */
export function quotaStatus(usage: UsageRecord): 'free' | 'credits' | 'blocked' {
  if (usage.total_used < FREE_USES) return 'free'
  if (usage.credits >= CREDITS_PER_USE) return 'credits'
  return 'blocked'
}

/** Increment usage after a successful generation */
export async function incrementUsage(deviceId: string): Promise<void> {
  const usage = await getUsage(deviceId)

  if (usage.total_used < FREE_USES) {
    await supabaseAdmin
      .from('daily_usage')
      .update({ total_used: usage.total_used + 1 })
      .eq('device_id', deviceId)
  } else if (usage.credits >= CREDITS_PER_USE) {
    await supabaseAdmin
      .from('daily_usage')
      .update({
        total_used: usage.total_used + 1,
        credits: usage.credits - CREDITS_PER_USE,
      })
      .eq('device_id', deviceId)
  } else {
    throw new Error('No remaining quota')
  }
}

/** Add credits after payment confirmed by webhook */
export async function addPaymentCredits(
  deviceId: string,
  productType: 'single' | 'credits'
): Promise<void> {
  const usage = await getUsage(deviceId)

  if (productType === 'single') {
    await supabaseAdmin
      .from('daily_usage')
      .update({ credits: usage.credits + CREDITS_PER_USE })
      .eq('device_id', deviceId)
  } else {
    await supabaseAdmin
      .from('daily_usage')
      .update({ credits: usage.credits + CREDITS_PER_PURCHASE })
      .eq('device_id', deviceId)
  }
}