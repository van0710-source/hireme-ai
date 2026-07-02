#!/usr/bin/env node
// Agent 6: 内容策略官 — 每周日 UTC 08:30（Bluesky 生成之前）
// 生成本周内容日历 weekly-plan.json

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createSupabase } from './supabase.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLAN_PATH = join(__dirname, '../content/weekly-plan.json')

const sb = createSupabase(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

function getWeekNumber() {
  const now = new Date()
  const start = new Date('2026-07-01')
  return Math.max(1, Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000)))
}

function getWeekPeriod(weekNum) {
  const start = new Date('2026-07-01')
  start.setDate(start.getDate() + (weekNum - 1) * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = d => d.toISOString().slice(0, 10)
  return `${fmt(start)} — ${fmt(end)}`
}

const ANTI_AI_RULES = `
ANTI-AI RULES (mandatory):
- NEVER open with "In today's competitive job market", "Are you struggling", "In this article"
- NEVER use: leverage, utilize, delve, game-changer, unlock, empower, seamless
- MUST include specific numbers (e.g. 47 applications, 2 replies)
- MUST sound like a tired job seeker on Reddit, not a brand blog
`

async function fetchUnusedKeywords(limit = 5) {
  const rows = await sb.query('marketing_keywords', {
    category: 'eq.blog',
    used_at: 'is.null',
    select: 'keyword,language',
    order: 'id.asc',
    limit: String(limit),
  })
  return rows ?? []
}

async function generateWeeklyPlan(weekNum, seedKeywords) {
  const linkPolicy = weekNum <= 2 ? 'zero_links' : 'one_in_seven'
  const kwList = seedKeywords.map(k => k.keyword).join(', ') || 'how to tailor resume for Google, why am i not getting interviews'

  const prompt = `You are the content strategist for HireMe AI (hireme-ai.com), a pay-per-use resume tailoring tool for US job seekers.

Create a JSON content plan for week ${weekNum} (${getWeekPeriod(weekNum)}).

Available blog keywords (pick 3, one should be comparison/GEO type): ${kwList}

${ANTI_AI_RULES}

Return JSON only:
{
  "week": ${weekNum},
  "period": "${getWeekPeriod(weekNum)}",
  "theme": "short theme in Chinese",
  "strategy_note": "one line",
  "blog": [
    { "keyword": "...", "angle": "specific angle in English", "anxiety": "被无视|简历黑洞|没准备好|被割韭菜", "priority": 1, "content_type": "standard|comparison" }
  ],
  "bluesky": {
    "angles": ["5 short angle descriptions"],
    "link_policy": "${linkPolicy}",
    "week_number": ${weekNum}
  },
  "geo_targets": ["3 exact search queries for GEO check"],
  "reddit_templates": ["2 reply strategy templates in English"]
}`

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  const data = await res.json()
  const tokens = data.usage?.total_tokens ?? 0
  const plan = JSON.parse(data.choices[0].message.content)
  return { plan, tokens }
}

async function run() {
  console.log('[content-strategist] Generating weekly plan...')

  const weekNum = getWeekNumber()
  const seedKeywords = await fetchUnusedKeywords(8)
  const { plan, tokens } = await generateWeeklyPlan(weekNum, seedKeywords)

  plan.week = weekNum
  plan.period = getWeekPeriod(weekNum)
  if (weekNum <= 2) {
    plan.bluesky = plan.bluesky || {}
    plan.bluesky.link_policy = 'zero_links'
  }

  writeFileSync(PLAN_PATH, JSON.stringify(plan, null, 2) + '\n')
  console.log(`[content-strategist] ✅ Wrote ${PLAN_PATH}`)

  const month = new Date().toISOString().slice(0, 7)
  await sb.insert('marketing_token_usage', { agent: 'content-strategist', tokens_used: tokens, month })
  await sb.insert('marketing_publish_log', { platform: 'content-strategist', status: 'success', tokens_used: tokens })
}

run().catch(err => {
  console.error('[content-strategist] Fatal:', err)
  process.exit(1)
})
