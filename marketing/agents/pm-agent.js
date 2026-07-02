#!/usr/bin/env node
// Agent 5: 营销策略官 — 周报 (weekly) + 脉冲 (pulse)
// PM_MODE=weekly|pulse (default weekly)

import { createSupabase } from './supabase.js'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGS_DIR = join(__dirname, '../logs')

const sb = createSupabase(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const MODE = process.env.PM_MODE || 'weekly'

const GEO_QUERIES = [
  'How do I tailor my resume for a specific company?',
  'Best free AI resume tailor no signup',
  'Why am I not getting interviews after applying',
  'ATS keywords for software engineer resume',
  'How to prepare for Google interview resume',
]

async function getWeekStats() {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const month = new Date().toISOString().slice(0, 7)
  const weekAgoStr = weekAgo.toISOString()

  const [blogs, bluesky, reddit, failures, queuePending, blogFails] = await Promise.all([
    sb.count('marketing_publish_log', { platform: 'eq.blog', status: 'eq.success', created_at: `gte.${weekAgoStr}` }),
    sb.count('marketing_publish_log', { platform: 'eq.bluesky', status: 'eq.success', created_at: `gte.${weekAgoStr}` }),
    sb.count('marketing_publish_log', { platform: 'eq.reddit', status: 'eq.success', created_at: `gte.${weekAgoStr}` }),
    sb.count('marketing_publish_log', { status: 'eq.failed', created_at: `gte.${weekAgoStr}` }),
    sb.count('marketing_content_queue', { platform: 'eq.bluesky', status: 'eq.pending' }),
    sb.count('marketing_publish_log', { platform: 'eq.blog', status: 'eq.failed', created_at: `gte.${weekAgoStr}` }),
  ])

  const tokenRows = await sb.query('marketing_token_usage', { month: `eq.${month}`, select: 'tokens_used' })
  const monthlyTokens = tokenRows.reduce((sum, r) => sum + (r.tokens_used || 0), 0)

  return { blogs, bluesky, reddit, failures, monthlyTokens, queuePending, blogFails }
}

async function getBlueskyStuck() {
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const pending = await sb.count('marketing_content_queue', {
    platform: 'eq.bluesky',
    status: 'eq.pending',
  })
  const recentPublish = await sb.count('marketing_publish_log', {
    platform: 'eq.bluesky',
    status: 'eq.success',
    created_at: `gte.${twoDaysAgo.toISOString()}`,
  })
  return { pending, stuck: pending >= 3 && recentPublish === 0 }
}

function getWeekNumber() {
  const now = new Date()
  const start = new Date('2026-07-01')
  return Math.max(1, Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000)))
}

function getProposals(stats, stuck) {
  const proposals = []
  if (stats.blogs < 2) {
    proposals.push('博客未达 2 篇/周 → 手动触发 blog workflow 或检查日历关键词是否用尽')
  }
  if (stats.bluesky < 3) {
    proposals.push('Bluesky <3 条/周 → 检查队列积压，运行 bluesky-publish；确认预热零链接规则未阻塞')
  }
  if (stuck.stuck) {
    proposals.push(`Bluesky 队列 ${stuck.pending} 条 pending 且 48h 无发布 → 解锁 scheduled_at 并立即 publish`)
  }
  if (stats.blogFails >= 2) {
    proposals.push('博客连续失败 → 检查 DeepSeek API 与 blog_posts 表权限')
  }
  if (proposals.length === 0) {
    proposals.push('执行正常 → 维持 SEO 55% / GEO 25% / 社媒 20% 权重，关注首个付费来源')
  }
  return proposals
}

function writeGeoCheckLog(weekNum) {
  const date = new Date().toISOString().slice(0, 10)
  if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true })
  const path = join(LOGS_DIR, `geo-check-${date}.md`)
  const body = `# GEO 抽检 — ${date}（第 ${weekNum} 周）

> 在 Perplexity / ChatGPT 中手动或用同一账号询问以下 5 问句，记录是否出现 hireme-ai.com

| # | 问句 | 引用本站 | 备注 |
|---|------|----------|------|
${GEO_QUERIES.map((q, i) => `| ${i + 1} | ${q} | 待填 | |`).join('\n')}

## 自动记录

- FAQ 专页：https://www.hireme-ai.com/faq
- Blog 索引：https://www.hireme-ai.com/blog
- llms.txt：https://www.hireme-ai.com/llms.txt
`
  writeFileSync(path, body)
  return path
}

async function sendEmail(subject, text) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'HireMe Marketing <onboarding@resend.dev>',
      to: process.env.MARKETING_EMAIL,
      subject,
      text,
    }),
  })
  if (!res.ok) throw new Error(`Email failed: ${await res.text()}`)
  return res.json()
}

async function runWeekly() {
  console.log('[pm-agent] Generating weekly report...')
  const stats = await getWeekStats()
  const stuck = await getBlueskyStuck()
  const weekNum = getWeekNumber()
  const tokenWarning = stats.monthlyTokens > 300000

  const risks = []
  if (stats.failures > 5) risks.push(`本周失败记录 ${stats.failures} 次`)
  if (tokenWarning) risks.push(`Token 月消耗 ${stats.monthlyTokens.toLocaleString()} 超预警线`)
  if (stats.blogs === 0) risks.push('本周博客发布为 0')
  if (stats.bluesky === 0) risks.push('本周 Bluesky 发布为 0')
  if (stuck.stuck) risks.push(`Bluesky 队列积压 ${stuck.pending} 条，48h 无发布`)

  const geoPath = writeGeoCheckLog(weekNum)
  const proposals = getProposals(stats, stuck)

  const subject = `[HireMe Marketing] 第${weekNum}周周报 — ${new Date().toISOString().slice(0, 10)}`
  const body = `HireMe AI 推广 — 第${weekNum}周周报（v2 快速迭代）
生成时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

══════════════════════════════
4 指标（执行层）
══════════════════════════════
博客（7日）：${stats.blogs} 篇（目标 ≥2）
Bluesky（7日）：${stats.bluesky} 条（目标 ≥7）
Reddit（7日）：${stats.reddit} 条
队列 pending：${stats.queuePending} 条

进站/试用/付费 → 见 Vercel Analytics + Supabase（周报补充）

══════════════════════════════
Token 消耗
══════════════════════════════
本月累计：${stats.monthlyTokens.toLocaleString()} tokens
状态：${tokenWarning ? '⚠️ 已超预警线' : '✅ 正常'}

══════════════════════════════
风险项
══════════════════════════════
${risks.length ? risks.map((r, i) => `${i + 1}. ⚠️ ${r}`).join('\n') : '✅ 本周无风险项。'}

══════════════════════════════
优化提案（主 Agent 审核后执行）
══════════════════════════════
${proposals.map((p, i) => `${i + 1}. ${p}`).join('\n')}

══════════════════════════════
GEO 抽检
══════════════════════════════
日志已写入：marketing/logs/geo-check-${new Date().toISOString().slice(0, 10)}.md
五问句清单见邮件附录。

${GEO_QUERIES.map((q, i) => `${i + 1}. ${q}`).join('\n')}

——
营销策略官 PM Agent v2 | 自动生成`

  await sendEmail(subject, body)
  if (stuck.stuck) {
    await sendEmail(
      '[⚠️ 队列积压] Bluesky 待发布积压',
      `pending: ${stuck.pending}，48h 内无成功发布。\n建议：workflow_dispatch bluesky-publish`
    )
  }

  await sb.insert('marketing_publish_log', { platform: 'pm', status: 'success', tokens_used: 0 })
  console.log(`[pm-agent] ✅ Week ${weekNum} report sent (geo log: ${geoPath})`)
}

async function runPulse() {
  console.log('[pm-agent] Generating pulse report...')
  const stats = await getWeekStats()
  const stuck = await getBlueskyStuck()
  const weekNum = getWeekNumber()
  const pulseNum = Math.ceil((Date.now() - new Date('2026-07-01').getTime()) / (3.5 * 24 * 60 * 60 * 1000))
  const proposals = getProposals(stats, stuck)

  const subject = `[HireMe Marketing] 脉冲 #${pulseNum} — ${new Date().toISOString().slice(0, 10)}`
  const body = `═══ 4 指标快照（7日滚动）═══
博客：${stats.blogs} 篇 | Bluesky：${stats.bluesky} 条 | 队列 pending：${stats.queuePending}
失败：${stats.failures} | Token 本月：${stats.monthlyTokens.toLocaleString()}

═══ 异常 ═══
${stuck.stuck ? `⚠️ Bluesky 积压 ${stuck.pending} 条` : '无队列积压'}
${stats.blogFails >= 2 ? '⚠️ 博客失败 ≥2' : ''}
${stats.bluesky === 0 && stats.queuePending > 0 ? '⚠️ 有队列但本周零发布' : ''}

═══ 优化提案 ═══
${proposals.map((p, i) => `${i + 1}. ${p}`).join('\n')}

═══ 需你确认 ═══
无（常规脉冲）

——
营销策略官 · 脉冲 v2`

  await sendEmail(subject, body)
  if (stuck.stuck) {
    await sendEmail(
      '[⚠️ 队列积压] Bluesky',
      `pending ${stuck.pending}，48h 无发布。自动建议：bluesky-publish`
    )
  }

  await sb.insert('marketing_publish_log', { platform: 'pm-pulse', status: 'success', tokens_used: 0 })
  console.log('[pm-agent] ✅ Pulse sent')
}

async function run() {
  if (MODE === 'pulse') {
    await runPulse()
  } else {
    await runWeekly()
  }
}

run().catch(err => {
  console.error('[pm-agent] Fatal:', err)
  process.exit(1)
})
