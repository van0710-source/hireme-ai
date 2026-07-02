#!/usr/bin/env node
// Agent 2: Bluesky — v2: 预热零链接、生成后自动发布、反 AI 味
// 模式: generate | publish

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLAN_PATH = join(__dirname, '../content/weekly-plan.json')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SITE_URL = 'https://www.hireme-ai.com'
const MODE = process.env.BLUESKY_MODE || 'publish'
const AUTO_PUBLISH = process.env.BLUESKY_AUTO_PUBLISH !== 'false'

function getWeekNumber() {
  const now = new Date()
  const start = new Date('2026-07-01')
  return Math.max(1, Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000)))
}

function loadBlueskyPlan() {
  if (!existsSync(PLAN_PATH)) return null
  try {
    const plan = JSON.parse(readFileSync(PLAN_PATH, 'utf8'))
    return plan.bluesky ?? null
  } catch {
    return null
  }
}

function requireEnv(name) {
  if (!process.env[name]) throw new Error(`Missing required env: ${name}`)
}

function assertSupabaseOk(error, context) {
  if (error) throw new Error(`${context}: ${error.message}`)
}

async function generateWeeklyContent() {
  console.log('[bluesky-agent] Generating weekly content batch...')

  const { count, error: countError } = await supabase
    .from('marketing_content_queue')
    .select('*', { count: 'exact', head: true })
    .eq('platform', 'bluesky')
    .eq('status', 'pending')

  assertSupabaseOk(countError, 'Queue count failed')

  if ((count ?? 0) >= 5) {
    console.log(`[bluesky-agent] Queue has ${count} items, skipping generation.`)
    return false
  }

  const weekNum = getWeekNumber()
  const blueskyPlan = loadBlueskyPlan()
  const zeroLinks = weekNum <= 2 || blueskyPlan?.link_policy === 'zero_links'
  const angles = blueskyPlan?.angles?.join('; ') ?? 'resume black hole, ghosted, subscription fatigue, interview prep'

  const prompt = `Generate 7 Bluesky posts for HireMe AI (${SITE_URL}) — a pay-per-use resume tailor for US job seekers.

WEEK ${weekNum} RULES:
- ${zeroLinks ? 'ZERO posts may include the site link. Pure value/anxiety posts only.' : 'Only 1 of 7 posts may include the site link.'}
- Content angles to rotate: ${angles}

ANTI-AI RULES:
- NEVER: "Are you struggling", "Did you know", "Unlock your", hashtags spam
- MUST: specific numbers, lowercase casual tone, like a friend venting
- Max 280 chars per post (link not included in count if separate line)
- 6 English, 1 Spanish (neutral)
- Vary: application count vs replies, same resume problem, recruiter ghosting, tool subscription fatigue

Return JSON: { "posts": [{ "content": "...", "language": "en"|"es", "include_link": false }] }
All include_link must be ${zeroLinks ? 'false' : 'true for at most one post'}.
Raw JSON only.`

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  const data = await res.json()
  const tokens = data.usage?.total_tokens ?? 0
  const parsed = JSON.parse(data.choices[0].message.content)
  const posts = Array.isArray(parsed) ? parsed : parsed.posts ?? []

  const now = new Date()
  const inserts = posts.map((p, i) => {
    const scheduledAt = new Date(now)
    if (i === 0) {
      scheduledAt.setMinutes(scheduledAt.getMinutes() - 10)
    } else {
      scheduledAt.setDate(now.getDate() + i)
      scheduledAt.setUTCHours(22, 0, 0, 0)
    }
    const includeLink = !zeroLinks && p.include_link
    return {
      platform: 'bluesky',
      content: includeLink ? `${p.content}\n\n${SITE_URL}` : p.content,
      language: p.language,
      include_link: includeLink,
      status: 'pending',
      scheduled_at: scheduledAt.toISOString(),
    }
  })

  const { error: insertError } = await supabase.from('marketing_content_queue').insert(inserts)
  assertSupabaseOk(insertError, 'Queue insert failed')
  await recordTokens('bluesky', tokens)
  console.log(`[bluesky-agent] ✅ Generated ${posts.length} posts (${tokens} tokens)`)
  return true
}

async function unlockStaleQueue() {
  const { data: items } = await supabase
    .from('marketing_content_queue')
    .select('id, scheduled_at')
    .eq('platform', 'bluesky')
    .eq('status', 'pending')
    .order('scheduled_at', { ascending: true })
    .limit(1)

  if (!items?.length) return

  const first = items[0]
  const scheduled = new Date(first.scheduled_at)
  if (scheduled > new Date()) {
    const backdate = new Date()
    backdate.setMinutes(backdate.getMinutes() - 15)
    await supabase
      .from('marketing_content_queue')
      .update({ scheduled_at: backdate.toISOString() })
      .eq('id', first.id)
    console.log('[bluesky-agent] Unlocked first pending post for immediate publish')
  }
}

async function publishNext() {
  console.log('[bluesky-agent] Publishing next queued post...')

  await unlockStaleQueue()

  const { data: items, error: queryError } = await supabase
    .from('marketing_content_queue')
    .select('*')
    .eq('platform', 'bluesky')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)

  assertSupabaseOk(queryError, 'Queue query failed')

  if (!items?.length) {
    const { count } = await supabase
      .from('marketing_content_queue')
      .select('*', { count: 'exact', head: true })
      .eq('platform', 'bluesky')
      .eq('status', 'pending')
    console.log(`[bluesky-agent] No posts scheduled for now. (${count ?? 0} pending in queue)`)
    return false
  }

  const item = items[0]
  const session = await blueskyLogin()
  if (!session) return false

  const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        $type: 'app.bsky.feed.post',
        text: item.content,
        createdAt: new Date().toISOString(),
      },
    }),
  })

  if (!postRes.ok) {
    const err = await postRes.text()
    console.error('[bluesky-agent] Post failed:', err)
    await supabase.from('marketing_publish_log').insert({
      platform: 'bluesky',
      content_id: item.id,
      status: 'failed',
      error: err,
    })
    return false
  }

  const postData = await postRes.json()

  await supabase
    .from('marketing_content_queue')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', item.id)

  await supabase.from('marketing_publish_log').insert({
    platform: 'bluesky',
    content_id: item.id,
    post_id: postData.uri,
    status: 'success',
    tokens_used: 0,
  })

  console.log(`[bluesky-agent] ✅ Published: "${item.content.slice(0, 50)}..."`)
  return true
}

async function blueskyLogin() {
  const res = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: process.env.BLUESKY_IDENTIFIER,
      password: process.env.BLUESKY_PASSWORD,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[bluesky-agent] Login failed:', err)
    await sendAlert('[⚠️ Bluesky故障] 登录失败', `Bluesky 账号登录失败。\n错误：${err}`)
    return null
  }

  return res.json()
}

async function recordTokens(agent, tokens) {
  const month = new Date().toISOString().slice(0, 7)
  await supabase.from('marketing_token_usage').insert({ agent, tokens_used: tokens, month })
}

async function sendAlert(subject, text) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'HireMe Marketing <marketing@hireme-ai.com>',
      to: process.env.MARKETING_EMAIL,
      subject,
      text,
    }),
  })
}

async function run() {
  requireEnv('SUPABASE_URL')
  requireEnv('SUPABASE_SERVICE_KEY')
  requireEnv('DEEPSEEK_API_KEY')

  if (MODE === 'generate') {
    const generated = await generateWeeklyContent()
    if (generated && AUTO_PUBLISH) {
      requireEnv('BLUESKY_IDENTIFIER')
      requireEnv('BLUESKY_PASSWORD')
      await publishNext()
    }
  } else {
    requireEnv('BLUESKY_IDENTIFIER')
    requireEnv('BLUESKY_PASSWORD')
    await publishNext()
  }
}

run().catch(err => {
  console.error('[bluesky-agent] Fatal:', err)
  process.exit(1)
})
