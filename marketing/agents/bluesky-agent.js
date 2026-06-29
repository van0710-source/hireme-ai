#!/usr/bin/env node
// Agent 2: Bluesky 内容生产+发布
// 模式A（生成）：每周日批量生成7条存队列 — ~3,000 tokens
// 模式B（发布）：每日取队列头部一条发布 — 0 tokens

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SITE_URL = 'https://hireme-ai.com'
const MODE = process.env.BLUESKY_MODE || 'publish' // 'generate' | 'publish'

// ── 模式A：批量生成本周7条内容 ──

async function generateWeeklyContent() {
  console.log('[bluesky-agent] Generating weekly content batch...')

  // 检查队列是否已有足够内容（避免重复生成）
  const { count } = await supabase
    .from('marketing_content_queue')
    .select('*', { count: 'exact', head: true })
    .eq('platform', 'bluesky')
    .eq('status', 'pending')

  if (count >= 5) {
    console.log(`[bluesky-agent] Queue has ${count} items, skipping generation.`)
    return
  }

  const prompt = `Generate 7 Bluesky posts for a job search tool called HireMe AI (${SITE_URL}).

Rules:
- Each post must open with a specific job search anxiety/frustration scenario (NOT generic advice)
- Writing style: like a friend sharing experience, NOT a brand account
- Max 280 characters per post
- 6 posts in English, 1 post in Spanish (neutral Spanish, no regional slang)
- Only 2 of the 7 posts should include the site link (${SITE_URL})
- Vary the anxiety angles: resume black hole / interview unpreparedness / subscription fatigue / privacy concerns
- NO hashtag spam (max 1 per post, or none)
- Do NOT start with "Are you..." or "Did you know..." or "In today's..."

Return JSON array of 7 objects: [{content: "post text", language: "en"|"es", include_link: true|false}]
Raw JSON only, no markdown.`

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  const data = await res.json()
  const tokens = data.usage?.total_tokens ?? 0
  const parsed = JSON.parse(data.choices[0].message.content)
  const posts = Array.isArray(parsed) ? parsed : parsed.posts ?? []

  // 写入队列，按天排期
  const now = new Date()
  const inserts = posts.map((p, i) => {
    const scheduledAt = new Date(now)
    scheduledAt.setDate(now.getDate() + i)
    scheduledAt.setHours(22, Math.floor(Math.random() * 30), 0, 0) // UTC 22:00 ±30min
    return {
      platform: 'bluesky',
      content: p.include_link ? `${p.content}\n\n${SITE_URL}` : p.content,
      language: p.language,
      include_link: p.include_link,
      status: 'pending',
      scheduled_at: scheduledAt.toISOString(),
    }
  })

  await supabase.from('marketing_content_queue').insert(inserts)
  await recordTokens('bluesky', tokens)
  console.log(`[bluesky-agent] ✅ Generated ${posts.length} posts (${tokens} tokens)`)
}

// ── 模式B：发布队列中下一条内容 ──

async function publishNext() {
  console.log('[bluesky-agent] Publishing next queued post...')

  const { data: items } = await supabase
    .from('marketing_content_queue')
    .select('*')
    .eq('platform', 'bluesky')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)

  if (!items?.length) {
    console.log('[bluesky-agent] No posts scheduled for now.')
    return
  }

  const item = items[0]

  // 登录 Bluesky
  const session = await blueskyLogin()
  if (!session) return

  // 发布
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
    return
  }

  const postData = await postRes.json()

  // 更新队列状态
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
    await sendAlert('[⚠️ Bluesky故障] 登录失败', `Bluesky 账号登录失败，请检查凭据。\n错误：${err}`)
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
  if (MODE === 'generate') {
    await generateWeeklyContent()
  } else {
    await publishNext()
  }
}

run().catch(err => {
  console.error('[bluesky-agent] Fatal:', err)
  process.exit(1)
})
