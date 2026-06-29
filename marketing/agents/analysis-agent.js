#!/usr/bin/env node
// Agent 4: 互动分析 + 邮件报告
// 触发：每3天 UTC 08:00
// Token消耗：~5,000/次

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function collectInteractions() {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  // 收集Reddit回复的评论（近3天发布的帖子）
  const { data: redditLogs } = await supabase
    .from('marketing_publish_log')
    .select('*')
    .eq('platform', 'reddit')
    .eq('status', 'success')
    .gte('created_at', threeDaysAgo.toISOString())

  // 收集Bluesky发布记录
  const { data: blueskyLogs } = await supabase
    .from('marketing_publish_log')
    .select('*')
    .eq('platform', 'bluesky')
    .eq('status', 'success')
    .gte('created_at', threeDaysAgo.toISOString())

  // 收集Token消耗
  const month = new Date().toISOString().slice(0, 7)
  const { data: tokenData } = await supabase
    .from('marketing_monthly_tokens')
    .select('total_tokens')
    .eq('month', month)
    .single()

  return {
    redditReplies: redditLogs?.length ?? 0,
    blueskyPosts: blueskyLogs?.length ?? 0,
    monthlyTokens: tokenData?.total_tokens ?? 0,
    redditUrls: redditLogs?.map(l => l.url).filter(Boolean) ?? [],
  }
}

async function analyzeAndGenerateReport(stats, reportNumber) {
  const prompt = `You are analyzing marketing performance for HireMe AI, a job application tool targeting US/Europe job seekers.

Stats from the last 3 days:
- Reddit replies posted: ${stats.redditReplies}
- Bluesky posts published: ${stats.blueskyPosts}
- Monthly token usage so far: ${stats.monthlyTokens.toLocaleString()} (warning threshold: 300,000)

Based on common job seeker anxiety patterns on Reddit and social media, generate an analysis report in Chinese (Simplified) with the following sections:

1. 新增焦虑点建议（2-3个，基于求职者常见痛点，尚未在我们内容库中的）
2. 内容方向建议（哪类焦虑场景值得多写）
3. 风险提示（如有）
4. 内容指导原则更新建议（如有）

Format as structured text, not JSON. Keep it concise and actionable.`

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
      max_tokens: 1000,
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  const data = await res.json()
  return {
    analysis: data.choices[0].message.content.trim(),
    tokens: data.usage?.total_tokens ?? 0,
  }
}

async function getReportNumber() {
  const { count } = await supabase
    .from('marketing_publish_log')
    .select('*', { count: 'exact', head: true })
    .eq('platform', 'analysis')
  return (count ?? 0) + 1
}

async function sendReport(reportNumber, stats, analysis) {
  const subject = `[HireMe Marketing] 互动分析报告 #${reportNumber} — ${new Date().toISOString().slice(0, 10)}`

  const body = `HireMe AI 推广 — 互动分析报告 #${reportNumber}
生成时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

══════════════════════════════
近3天执行数据
══════════════════════════════
Reddit 回复发布：${stats.redditReplies} 条
Bluesky 帖子发布：${stats.blueskyPosts} 条
本月累计 Token 消耗：${stats.monthlyTokens.toLocaleString()} / 300,000

══════════════════════════════
AI 分析报告
══════════════════════════════
${analysis}

══════════════════════════════
操作指令
══════════════════════════════
如需将以上建议更新到焦虑点库和内容 Prompt，请回复此邮件：

  确认更新 → 自动将建议写入内容库
  忽略     → 本次跳过，不做任何更新

——
HireMe AI Marketing PM Agent
自动发送，请勿直接回复（回复指令除外）`

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
}

async function run() {
  console.log('[analysis-agent] Starting analysis...')

  const stats = await collectInteractions()
  const reportNumber = await getReportNumber()

  let analysis, tokens
  try {
    const result = await analyzeAndGenerateReport(stats, reportNumber)
    analysis = result.analysis
    tokens = result.tokens
  } catch (err) {
    console.error('[analysis-agent] Analysis failed:', err.message)
    process.exit(1)
  }

  await sendReport(reportNumber, stats, analysis)

  // 记录本次运行
  await supabase.from('marketing_publish_log').insert({
    platform: 'analysis',
    status: 'success',
    tokens_used: tokens,
  })

  const month = new Date().toISOString().slice(0, 7)
  await supabase.from('marketing_token_usage').insert({
    agent: 'analysis',
    tokens_used: tokens,
    month,
  })

  console.log(`[analysis-agent] ✅ Report #${reportNumber} sent (${tokens} tokens)`)
}

run().catch(err => {
  console.error('[analysis-agent] Fatal:', err)
  process.exit(1)
})
