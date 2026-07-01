// lib/supabase-server.ts
// Server-side Supabase client using service role key (bypasses RLS)
// ONLY use in API routes — never import in client components

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseAdminClient: SupabaseClient | null = null

/** Lazy init so `next build` does not require env vars at module load time. */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminClient) return supabaseAdminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  supabaseAdminClient = createClient(url, key, { auth: { persistSession: false } })
  return supabaseAdminClient
}
