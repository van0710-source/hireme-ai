#!/usr/bin/env node
// Agent 3: Reddit 监控 + 回复
// 触发：每小时，含随机偏移模拟人类行为
// Token消耗：~500/次触发，仅在关键词命中时调用AI

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SITE_URL = 'https://hireme-ai.com'
const MODE = process.env.REDDIT_MODE || 'monitor' // 'monitor' | 'post_original'

// 目标社区
const SUBREDDITS = {
  en: ['resumes', 'cscareerquestions', 'jobs', 'jobsearch', 'careerguidance'],
  es: ['EmpleoUSA', 'Latinx'],
}

// 零Token关键词过滤（先匹配，再调AI）
const TRIGGER_KEYWORDS = [
  'cover letter', 'resume help', 'tailored resume', 'ats', 'applicant tracking',
  'job application', 'interview prep', 'no response', 'ghosted', 'resume black hole',
  'not getting interviews', 'same resume', 'customize resume', 'tailor resume',
  'carta de presentación', 'currículum', 'solicitud de empleo',
]

// 不带链接的纯价值回复关键词（用于建立可信度）
const VALUE_ONLY_KEYWORDS = [
  'how do i', 'what should i', 'any tips', 'advice', 'help me',
]

async function getRedditToken() {
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'HireMeAI/1.0',
    },
    body: `grant_type=password&username=${process.env.REDDIT_USERNAME}&password=${encodeURIComponent(process.env.REDDIT_PASSWORD)}`,
  })

  if (!res.ok) {
    throw new Error(`Reddit auth failed: ${res.status}`)
  }
  const data = await res.json()
  return data.access_token
}

async function fetchNewPosts(token, subreddit, limit = 25) {
  const res = await fetch(`https://oauth.reddit.com/r/${subreddit}/new?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'HireMeAI/1.0',
    },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.data?.children?.map(c => c.data) ?? []
}

function matchesKeywords(text) {
  const lower = text.toLowerCase()
  return TRIGGER_KEYWORDS.some(kw => lower.includes(kw))
}

function shouldIncludeLink(text) {
  // 30%的回复带链接，且只有在场景高度匹配时
  const highMatchKeywords = ['tailor resume', 'customize resume', 'same resume', 'no response', 'black hole']
  const isHighMatch = highMatchKeywords.some(kw => text.toLowerCase().includes(kw))
  return isHighMatch && Math.random() < 0.3
}

async function generateReply(post, includeLink, language = 'en') {
  const isSpanish = language === 'es'

  const systemPrompt = isSpanish
    ? `Eres un buscador de empleo experimentado en Reddit. Respondes de forma natural y útil, como un amigo que ya pasó por lo mismo. NUNCA suenas como un bot o una marca.`
    : `You are an experienced job seeker on Reddit. You reply naturally and helpfully, like a friend who's been through the same thing. You NEVER sound like a bot or a brand account.`

  const userPrompt = isSpanish
    ? `Un usuario de Reddit publicó esto:
Título: "${post.title}"
Contenido: "${(post.selftext || '').slice(0, 500)}"

Escribe una respuesta en español neutro que:
1. Reconozca genuinamente su situación específica
2. Dé 2-3 consejos prácticos reales
${includeLink ? `3. Mencione naturalmente que ${SITE_URL} le ayudó a adaptar su currículum a empresas específicas (como si fuera experiencia personal)` : '3. No menciones ninguna herramienta o sitio web'}

Máximo 150 palabras. Tono casual, no de blog corporativo.`
    : `A Reddit user posted this:
Title: "${post.title}"
Body: "${(post.selftext || '').slice(0, 500)}"

Write a reply that:
1. Genuinely acknowledges their specific situation
2. Gives 2-3 real, actionable tips
${includeLink ? `3. Naturally mentions that ${SITE_URL} helped you tailor your resume to specific companies (as if personal experience)` : '3. Does NOT mention any tool or website'}

Max 150 words. Casual tone, not a corporate blog post.`

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
      temperature: 0.9,
      max_tokens: 300,
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  const data = await res.json()
  return {
    reply: data.choices[0].message.content.trim(),
    tokens: data.usage?.total_tokens ?? 0,
  }
}

async function postReply(token, postId, text) {
  // 随机延迟 2-8 秒，模拟人类打字时间
  await new Promise(r => setTimeout(r, 2000 + Math.random() * 6000))

  const res = await fetch('https://oauth.reddit.com/api/comment', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'HireMeAI/1.0',
    },
    body: `thing_id=t3_${postId}&text=${encodeURIComponent(text)}`,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Reply failed: ${err}`)
  }
  return res.json()
}

async function alreadyReplied(postId) {
  const { count } = await supabase
    .from('marketing_publish_log')
    .select('*', { count: 'exact', head: true })
    .eq('platform', 'reddit')
    .eq('post_id', postId)
  return count > 0
}

async function run() {
  console.log('[reddit-agent] Starting monitor run...')

  let token
  try {
    token = await getRedditToken()
  } catch (err) {
    console.error('[reddit-agent] Auth failed:', err.message)
    await sendAlert('[⚠️ 紧急] Reddit 登录失败', `Reddit Agent 无法获取访问令牌。\n错误：${err.message}`)
    process.exit(1)
  }

  let totalTokensUsed = 0
  let repliesPosted = 0

  // 遍历所有目标社区
  for (const [lang, subs] of Object.entries(SUBREDDITS)) {
    for (const sub of subs) {
      let posts
      try {
        posts = await fetchNewPosts(token, sub)
      } catch {
        console.warn(`[reddit-agent] Failed to fetch r/${sub}, skipping`)
        continue
      }

      for (const post of posts) {
        const text = `${post.title} ${post.selftext || ''}`

        // 零Token过滤
        if (!matchesKeywords(text)) continue

        // 检查是否已回复过
        if (await alreadyReplied(post.id)) continue

        // 限制每次运行最多回复3条（防止账号行为异常）
        if (repliesPosted >= 3) break

        const includeLink = shouldIncludeLink(text)

        let reply, tokens
        try {
          const result = await generateReply(post, includeLink, lang)
          reply = result.reply
          tokens = result.tokens
          totalTokensUsed += tokens
        } catch (err) {
          console.warn(`[reddit-agent] Generation failed for post ${post.id}:`, err.message)
          continue
        }

        try {
          await postReply(token, post.id, reply)
          repliesPosted++

          await supabase.from('marketing_publish_log').insert({
            platform: 'reddit',
            post_id: post.id,
            url: `https://reddit.com${post.permalink}`,
            status: 'success',
            tokens_used: tokens,
          })

          console.log(`[reddit-agent] ✅ Replied to r/${sub}: "${post.title.slice(0, 50)}..." (link: ${includeLink})`)

          // 回复之间随机等待 30-120 秒，进一步模拟真人行为
          await new Promise(r => setTimeout(r, 30000 + Math.random() * 90000))

        } catch (err) {
          console.error(`[reddit-agent] Reply failed:`, err.message)

          // 检测封号信号
          if (err.message.includes('RATELIMIT') || err.message.includes('BANNED')) {
            await sendAlert(
              '[⚠️ 紧急] Reddit 账号受限',
              `Reddit 账号可能被限流或封禁。\n错误信息：${err.message}\n\n建议：暂停 Reddit Agent，检查账号状态。`
            )
            process.exit(1)
          }

          await supabase.from('marketing_publish_log').insert({
            platform: 'reddit',
            post_id: post.id,
            status: 'failed',
            error: err.message,
          })
        }
      }
    }
  }

  if (totalTokensUsed > 0) {
    await recordTokens('reddit', totalTokensUsed)
  }

  console.log(`[reddit-agent] Done. Replies: ${repliesPosted}, Tokens: ${totalTokensUsed}`)
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
      `本月 Token 消耗已达 ${data.total_tokens.toLocaleString()}，超过 300,000 预警线。\n\n请回复确认是否继续本月剩余自动化运行。`
    )
  }
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
  console.error('[reddit-agent] Fatal:', err)
  process.exit(1)
})
