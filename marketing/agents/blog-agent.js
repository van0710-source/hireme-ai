#!/usr/bin/env node
// Agent 1: 博客内容生产
// 触发：GitHub Actions 每周一/周四 UTC 02:00
// Token消耗：~1,500/次

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SITE_URL = 'https://hireme-ai-im92-git-claude-experiment-van0710-sources-projects.vercel.app'

async function generateBlogPost(keyword, language) {
  const isSpanish = language === 'es'

  const systemPrompt = isSpanish
    ? `Eres un experto en búsqueda de empleo en Estados Unidos. Escribes artículos de blog en español neutro (no regionalismos) que ayudan a candidatos latinos a conseguir trabajo en empresas americanas.`
    : `You are a career coach writing blog posts for job seekers targeting US companies. Your writing style is direct, empathetic, and anxiety-aware — you open with a real pain point, not with "In today's competitive job market".`

  const userPrompt = isSpanish
    ? `Escribe un artículo de blog de 700-900 palabras sobre: "${keyword}"

Estructura obligatoria:
1. Abre con un escenario concreto de frustración en la búsqueda de empleo (no generalidades)
2. Explica la causa raíz del problema
3. Da 3-4 pasos accionables
4. Menciona naturalmente que hireme-ai.com puede automatizar el paso más difícil (adaptar el currículum a cada empresa específica)
5. Cierra con 3 preguntas FAQ relevantes con respuestas directas

Formato: JSON con campos title, meta_description, content (HTML simple: solo <h2>, <p>, <ul><li>, <strong>), faq (array de {q, a}).
No incluyas código markdown, solo JSON puro.`
    : `Write a 700-900 word blog post about: "${keyword}"

Required structure:
1. Open with a specific, relatable job search frustration scenario (NOT "In today's competitive job market")
2. Explain the root cause of the problem
3. Give 3-4 actionable steps
4. Naturally mention that hireme-ai.com can automate the hardest step (tailoring resume to each specific company)
5. Close with 3 relevant FAQ questions with direct answers

Format: JSON with fields title, meta_description, content (simple HTML: only <h2>, <p>, <ul><li>, <strong>), faq (array of {q, a}).
No markdown, raw JSON only.`

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
      temperature: 0.8,
      max_tokens: 2000,
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
  console.log('[blog-agent] Starting...')

  // 取下一个未使用关键词
  const { data: keywords, error } = await supabase
    .from('marketing_keywords')
    .select('*')
    .eq('category', 'blog')
    .is('used_at', null)
    .order('id', { ascending: true })
    .limit(1)

  if (error || !keywords?.length) {
    console.log('[blog-agent] No keywords available, exiting.')
    return
  }

  const kw = keywords[0]
  console.log(`[blog-agent] Generating post for: "${kw.keyword}"`)

  let post, tokens
  try {
    const result = await generateBlogPost(kw.keyword, kw.language)
    post = result.content
    tokens = result.tokens
  } catch (err) {
    console.error('[blog-agent] Generation failed:', err.message)
    await logFailure('blog', `Generation failed: ${err.message}`)
    process.exit(1)
  }

  // 生成slug
  const slug = kw.keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60)

  // 写入blog_posts表（复用现有表或新建）
  const { error: insertError } = await supabase
    .from('blog_posts')
    .insert({
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

  // 标记关键词已使用
  await supabase
    .from('marketing_keywords')
    .update({ used_at: new Date().toISOString() })
    .eq('id', kw.id)

  // 记录Token消耗
  await recordTokens('blog', tokens)

  console.log(`[blog-agent] ✅ Published: "${post.title}" (${tokens} tokens)`)
}

async function recordTokens(agent, tokens) {
  const month = new Date().toISOString().slice(0, 7)
  await supabase.from('marketing_token_usage').insert({ agent, tokens_used: tokens, month })

  // 检查月度总消耗是否超300K
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
