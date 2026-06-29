#!/usr/bin/env node
// Agent 5: PM 督导 — 每周一 UTC 09:00
// 检查所有Agent运行状态，发送周报，触发风险告警
// Token消耗：~2,000/次

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function getWeekStats() {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const month = new Date().toISOString().slice(0, 7)

  const [blogs, bluesky, reddit, analysis, failures, tokenData] = await Promise.all([
    supabase.from('marketing_publish_log').select('*', { count: 'exact', head: true })
      .eq('platform', 'blog').eq('status', 'success').gte('created_at', weekAgo.toISOString()),
    supabase.from('marketing_publish_log').select('*', { count: 'exact', head: true })
      .eq('platform', 'bluesky').eq('status', 'success').gte('created_at', weekAgo.toISOString()),
    supabase.from('marketing_publish_log').select('*', { count: 'exact', head: true })
      .eq('platform', 'reddit').eq('status', 'success').gte('created_at', weekAgo.toISOString()),
    supabase.from('marketing_publish_log').select('*', { count: 'exact', head: true })
      .eq('platform', 'analysis').eq('status', 'success').gte('created_at', weekAgo.toISOString()),
    supabase.from('marketing_publish_log').select('*', { count: 'exact', head: true })
      .eq('status', 'failed').gte('created_at', weekAgo.toISOString()),
    supabase.from('marketing_monthly_tokens').select('total_tokens').eq('month', month).single(),
  ])

  return {
    blogs: blogs.count ?? 0,
    bluesky: bluesky.count ?? 0,
    reddit: reddit.count ?? 0,
    analysis: analysis.count ?? 0,
    failures: failures.count ?? 0,
    monthlyTokens: tokenData.data?.total_tokens ?? 0,
  }
}

function getWeekNumber() {
  const now = new Date()
  const start = new Date('2026-07-01')
  const diff = now - start
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
}

async function generateWeeklyReport(stats) {
  // 对照月计划判断是否达标
  const weekNum = getWeekNumber()
  const month = Math.ceil(weekNum / 4)

  // 月计划基准（对照plan.md）
  const targets = {
    blogs: 2,       // 每周2篇
    bluesky: 7,     // 每周7条
    reddit: 15,     // 每周约15条回复
    analysis: 1,    // 每3天1次，每周约2次
  }

  const blogStatus = stats.blogs >= targets.blogs ? '✅' : '⚠️'
  const blueskyStatus = stats.bluesky >= targets.bluesky ? '✅' : '⚠️'
  const redditStatus = stats.reddit >= targets.reddit ? '✅' : '⚠️'
  const tokenWarning = stats.monthlyTokens > 300000

  const risks = []
  if (stats.failures > 5) risks.push(`本周失败记录 ${stats.failures} 次，超过正常范围，建议检查日志`)
  if (tokenWarning) risks.push(`本月 Token 消耗 ${stats.monthlyTokens.toLocaleString()} 已超预警线 300,000`)
  if (stats.blogs === 0) risks.push('本周博客发布为0，内容流可能中断')
  if (stats.bluesky === 0) risks.push('本周 Bluesky 发布为0，账号可能有问题')

  const subject = `[HireMe Marketing] 第${weekNum}周周报 — ${new Date().toISOString().slice(0, 10)}`

  const body = `HireMe AI 推广 — 第${weekNum}周周报（第${month}个月）
生成时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

══════════════════════════════
本周执行情况
══════════════════════════════
${blogStatus} 博客发布：${stats.blogs}篇（计划${targets.blogs}篇）
${blueskyStatus} Bluesky 发帖：${stats.bluesky}条（计划${targets.bluesky}条）
${redditStatus} Reddit 回复：${stats.reddit}条（计划${targets.reddit}条）
✅ 互动分析报告：${stats.analysis}次

══════════════════════════════
Token 消耗
══════════════════════════════
本月累计：${stats.monthlyTokens.toLocaleString()} tokens
预警线：300,000 tokens
状态：${tokenWarning ? '⚠️ 已超预警线，请确认是否继续' : '✅ 正常'}

══════════════════════════════
风险项
══════════════════════════════
${risks.length ? risks.map((r, i) => `${i + 1}. ⚠️ ${r}`).join('\n') : '✅ 本周无风险项，一切正常。'}

══════════════════════════════
下周计划
══════════════════════════════
${getNextWeekPlan(weekNum)}

══════════════════════════════
需要你确认的事项
══════════════════════════════
${tokenWarning ? '1. Token 已超预警线，请回复"继续运行"或"暂停"' : '本周无需确认事项。'}

——
HireMe AI Marketing PM Agent | 自动生成`

  return { subject, body }
}

function getNextWeekPlan(weekNum) {
  const plans = {
    1: '- 完成首批博客关键词（Google/Amazon/McKinsey方向）\n- Bluesky 账号建立，开始纯干货阶段\n- Reddit 账号预热（只提供价值，不推产品）',
    2: '- 继续博客发布节奏（目标：累计4篇）\n- Bluesky 开始自然带产品出口（每5条1次）\n- Reddit 开始低频提及产品（每周≤2次）',
    3: '- 准备 Product Hunt 上线物料\n- 西语内容首次测试（1条 Bluesky 西语帖）\n- 博客累计目标：6篇',
    4: '- 第1个月收尾复盘\n- Reddit 关键词监控 Agent 全速启动\n- 评估是否提前 Product Hunt 上线',
  }
  const weekInMonth = ((weekNum - 1) % 4) + 1
  return plans[weekInMonth] || `- 按 plan.md 第${Math.ceil(weekNum / 4)}个月计划执行`
}

async function run() {
  console.log('[pm-agent] Generating weekly report...')

  const stats = await getWeekStats()
  const { subject, body } = await generateWeeklyReport(stats)

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
      text: body,
    }),
  })

  // 记录运行
  const month = new Date().toISOString().slice(0, 7)
  await supabase.from('marketing_token_usage').insert({
    agent: 'pm',
    tokens_used: 0, // PM agent 本身不调用AI
    month,
  })

  console.log(`[pm-agent] ✅ Week ${getWeekNumber()} report sent`)
}

run().catch(err => {
  console.error('[pm-agent] Fatal:', err)
  process.exit(1)
})
