#!/usr/bin/env node
// Agent 5: PM 督导 — 每周一 UTC 09:00
// 零依赖，只用原生 fetch

import { createSupabase } from './supabase.js'

const sb = createSupabase(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function getWeekStats() {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const month = new Date().toISOString().slice(0, 7)
  const weekAgoStr = weekAgo.toISOString()

  const [blogs, bluesky, reddit, analysis, failures] = await Promise.all([
    sb.count('marketing_publish_log', { 'platform': 'eq.blog', 'status': 'eq.success', 'created_at': `gte.${weekAgoStr}` }),
    sb.count('marketing_publish_log', { 'platform': 'eq.bluesky', 'status': 'eq.success', 'created_at': `gte.${weekAgoStr}` }),
    sb.count('marketing_publish_log', { 'platform': 'eq.reddit', 'status': 'eq.success', 'created_at': `gte.${weekAgoStr}` }),
    sb.count('marketing_publish_log', { 'platform': 'eq.analysis', 'status': 'eq.success', 'created_at': `gte.${weekAgoStr}` }),
    sb.count('marketing_publish_log', { 'status': 'eq.failed', 'created_at': `gte.${weekAgoStr}` }),
  ])

  const tokenRows = await sb.query('marketing_token_usage', { 'month': `eq.${month}`, 'select': 'tokens_used' })
  const monthlyTokens = tokenRows.reduce((sum, r) => sum + (r.tokens_used || 0), 0)

  return { blogs, bluesky, reddit, analysis, failures, monthlyTokens }
}

function getWeekNumber() {
  const now = new Date()
  const start = new Date('2026-07-01')
  const diff = now - start
  return Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)))
}

function getNextWeekPlan(weekNum) {
  const plans = {
    1: '- 完成首批博客关键词（Google/Amazon/McKinsey方向）\n- Bluesky 账号建立，开始纯干货阶段\n- Reddit 账号预热（只提供价值，不推产品）',
    2: '- 继续博客发布节奏（目标：累计4篇）\n- Bluesky 开始自然带产品出口（每5条1次）\n- Reddit 开始低频提及产品（每周≤2次）',
    3: '- 准备 Product Hunt 上线物料\n- 西语内容首次测试（1条 Bluesky 西语帖）\n- 博客累计目标：6篇',
    4: '- 第1个月收尾复盘\n- Reddit Agent 全速启动（需先完成API配置）\n- 评估是否提前 Product Hunt 上线',
  }
  const weekInMonth = ((weekNum - 1) % 4) + 1
  return plans[weekInMonth] || `- 按 plan.md 第${Math.ceil(weekNum / 4)}个月计划执行`
}

async function sendEmail(subject, text) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
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

async function run() {
  console.log('[pm-agent] Generating weekly report...')

  const stats = await getWeekStats()
  const weekNum = getWeekNumber()
  const month = Math.ceil(weekNum / 4)
  const tokenWarning = stats.monthlyTokens > 300000

  const risks = []
  if (stats.failures > 5) risks.push(`本周失败记录 ${stats.failures} 次，建议检查日志`)
  if (tokenWarning) risks.push(`本月 Token 消耗 ${stats.monthlyTokens.toLocaleString()} 已超预警线`)
  if (stats.blogs === 0) risks.push('本周博客发布为0，内容流可能中断')
  if (stats.bluesky === 0) risks.push('本周 Bluesky 发布为0')

  const subject = `[HireMe Marketing] 第${weekNum}周周报 — ${new Date().toISOString().slice(0, 10)}`
  const body = `HireMe AI 推广 — 第${weekNum}周周报（第${month}个月）
生成时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

══════════════════════════════
本周执行情况
══════════════════════════════
${stats.blogs >= 2 ? '✅' : '⚠️'} 博客发布：${stats.blogs}篇（计划2篇）
${stats.bluesky >= 7 ? '✅' : '⚠️'} Bluesky 发帖：${stats.bluesky}条（计划7条）
${stats.reddit >= 15 ? '✅' : '⚠️'} Reddit 回复：${stats.reddit}条（计划15条）
✅ 互动分析报告：${stats.analysis}次

══════════════════════════════
Token 消耗
══════════════════════════════
本月累计：${stats.monthlyTokens.toLocaleString()} tokens
状态：${tokenWarning ? '⚠️ 已超预警线 300,000' : '✅ 正常'}

══════════════════════════════
风险项
══════════════════════════════
${risks.length ? risks.map((r, i) => `${i + 1}. ⚠️ ${r}`).join('\n') : '✅ 本周无风险项。'}

══════════════════════════════
下周计划
══════════════════════════════
${getNextWeekPlan(weekNum)}

——
HireMe AI Marketing PM Agent | 自动生成`

  await sendEmail(subject, body)

  await sb.insert('marketing_publish_log', { platform: 'pm', status: 'success', tokens_used: 0 })
  await sb.insert('marketing_token_usage', { agent: 'pm', tokens_used: 0, month: new Date().toISOString().slice(0, 7) })

  console.log(`[pm-agent] ✅ Week ${weekNum} report sent`)
}

run().catch(err => {
  console.error('[pm-agent] Fatal:', err)
  process.exit(1)
})
