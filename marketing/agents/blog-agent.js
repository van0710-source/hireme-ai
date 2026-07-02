#!/usr/bin/env node
// Agent 1: 博客内容生产 — v2: 日历优先、反 AI 味、IndexNow
// 触发：周一/周三/周五 UTC 02:00

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { pingIndexNow } from './indexnow.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLAN_PATH = join(__dirname, '../content/weekly-plan.json')
const SITE_URL = 'https://www.hireme-ai.com'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const BANNED_OPENERS = [
  "in today's competitive",
  'are you struggling',
  'are you tired',
  'in this article',
  'in this post',
  'in this guide',
  "it's no secret",
  'whether you',
  'did you know',
]

const BANNED_WORDS = ['leverage', 'utilize', 'delve', 'game-changer', 'unlock your', 'empower', 'seamless', 'tapestry', 'landscape']

function loadWeeklyPlan() {
  if (!existsSync(PLAN_PATH)) return null
  try {
    return JSON.parse(readFileSync(PLAN_PATH, 'utf8'))
  } catch {
    return null
  }
}

async function getNextBlogItem() {
  const plan = loadWeeklyPlan()
  if (plan?.blog?.length) {
    const { data: published } = await supabase
      .from('blog_posts')
      .select('keyword')
      .eq('status', 'published')

    const used = new Set((published ?? []).map(p => p.keyword?.toLowerCase()))
    const next = plan.blog
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
      .find(b => !used.has(b.keyword?.toLowerCase()))

    if (next) {
      return {
        keyword: next.keyword,
        language: 'en',
        angle: next.angle,
        content_type: next.content_type ?? 'standard',
        from_calendar: true,
      }
    }
  }

  const { data: keywords, error } = await supabase
    .from('marketing_keywords')
    .select('*')
    .eq('category', 'blog')
    .is('used_at', null)
    .order('id', { ascending: true })
    .limit(1)

  if (error || !keywords?.length) return null
  return { ...keywords[0], from_calendar: false }
}

function qualityCheck(text) {
  const lower = (text || '').toLowerCase()
  let issues = 0
  for (const o of BANNED_OPENERS) {
    if (lower.includes(o)) issues++
  }
  for (const w of BANNED_WORDS) {
    if (lower.includes(w)) issues++
  }
  if (!/\d/.test(text)) issues++
  return issues
}

async function generateBlogPost(keyword, language, options = {}) {
  const isSpanish = language === 'es'
  const isComparison = options.content_type === 'comparison'

  const antiAi = `ANTI-AI RULES:
- NEVER: "In today's competitive job market", "Are you struggling", "In this article"
- NEVER use: leverage, utilize, delve, game-changer, unlock, empower
- MUST open with a specific scenario and a number (e.g. 47 applications, 2 replies)
- Write like a career coach who sounds human on Reddit, not a SaaS blog
${options.angle ? `- Angle for this piece: ${options.angle}` : ''}`

  const systemPrompt = isSpanish
    ? `Eres coach de empleo para latinos buscando trabajo en EE.UU. Español neutro. ${antiAi}`
    : `You are a career coach for US job seekers. Direct, empathetic, anxiety-aware. ${antiAi}`

  const comparisonBlock = isComparison
    ? `\nThis is a COMPARISON article (GEO-optimized). Include an H2 like "Manual tailoring vs using HireMe-AI" with an honest pros/cons table in HTML <ul> lists. Do not trash competitors by name.`
    : ''

  const userPrompt = isSpanish
    ? `Artículo 700-900 palabras: "${keyword}"${comparisonBlock}\nJSON: title, meta_description, content (HTML: h2,p,ul,strong), faq ([{q,a}] x3-5).`
    : `Write 700-900 words: "${keyword}"${comparisonBlock}

Structure:
1. Specific frustration scenario with numbers (NOT generic opener)
2. Root cause
3. 3-4 actionable steps
4. HireMe-AI as natural solution at end of steps (not paragraph 1)
5. 3-5 FAQ items

JSON: title, meta_description, content (HTML: only h2,p,ul,strong), faq ([{q,a}]).
Raw JSON only.`

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 2200,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  const data = await res.json()
  const tokens = data.usage?.total_tokens ?? 0
  const content = JSON.parse(data.choices[0].message.content)
  return { content, tokens }
}

async function run() {
  console.log('[blog-agent] Starting (v2)...')

  const kw = await getNextBlogItem()
  if (!kw) {
    console.log('[blog-agent] No keywords/calendar items available, exiting.')
    return
  }

  console.log(`[blog-agent] Generating: "${kw.keyword}"${kw.from_calendar ? ' (calendar)' : ''}`)

  let post, tokens, attempts = 0
  while (attempts < 2) {
    attempts++
    try {
      const result = await generateBlogPost(kw.keyword, kw.language, {
        angle: kw.angle,
        content_type: kw.content_type,
      })
      post = result.content
      tokens = result.tokens
      const checkText = `${post.title} ${post.content}`
      if (qualityCheck(checkText) >= 2 && attempts < 2) {
        console.log('[blog-agent] Quality check failed, retrying...')
        continue
      }
      break
    } catch (err) {
      if (attempts >= 2) throw err
      console.warn('[blog-agent] Retry after error:', err.message)
    }
  }

  const slug = kw.keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60)

  const { error: insertError } = await supabase.from('blog_posts').insert({
    slug,
    title: post.title,
    meta_description: post.meta_description,
    content: post.content,
    faq: post.faq,
    language: kw.language,
    keyword: kw.keyword,
    status: 'published',
    published_at: new Date().toISOString(),
  })

  if (insertError) {
    console.error('[blog-agent] DB insert failed:', insertError.message)
    await logFailure('blog', `DB insert failed: ${insertError.message}`)
    process.exit(1)
  }

  if (!kw.from_calendar) {
    await supabase
      .from('marketing_keywords')
      .update({ used_at: new Date().toISOString() })
      .eq('keyword', kw.keyword)
  } else {
    const { data: rows } = await supabase
      .from('marketing_keywords')
      .select('id')
      .eq('keyword', kw.keyword)
      .limit(1)
    if (rows?.[0]) {
      await supabase
        .from('marketing_keywords')
        .update({ used_at: new Date().toISOString() })
        .eq('id', rows[0].id)
    }
  }

  const postUrl = `${SITE_URL}/blog/${slug}`
  await pingIndexNow([postUrl, `${SITE_URL}/blog`, `${SITE_URL}/faq`])

  await recordTokens('blog', tokens)
  await supabase.from('marketing_publish_log').insert({
    platform: 'blog',
    url: postUrl,
    status: 'success',
    tokens_used: tokens,
  })

  console.log(`[blog-agent] ✅ Published: "${post.title}" (${tokens} tokens)`)
}

async function recordTokens(agent, tokens) {
  const month = new Date().toISOString().slice(0, 7)
  await supabase.from('marketing_token_usage').insert({ agent, tokens_used: tokens, month })

  const { data } = await supabase
    .from('marketing_monthly_tokens')
    .select('total_tokens')
    .eq('month', month)
    .single()

  if (data?.total_tokens > 300000) {
    await sendAlert(
      '[⚠️ Token预警] HireMe Marketing Token消耗超限',
      `本月 Token 消耗已达 ${data.total_tokens.toLocaleString()}，超过 300,000 预警线。`
    )
  }
}

async function logFailure(agent, error) {
  await supabase.from('marketing_publish_log').insert({
    platform: agent,
    status: 'failed',
    error,
  })
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

run().catch(err => {
  console.error('[blog-agent] Fatal:', err)
  process.exit(1)
})
