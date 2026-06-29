# 内容生产规范

> 版本：v1.1 | 更新：2026-06-29

## 内容结构公式

```
戳痛（焦虑场景） → 放大（为什么这很严重） → 出口（工具自然出现）
```

**禁止的内容结构：** 先介绍功能 → 再说好处（这是卖功能，不是卖焦虑）

---

## 渠道内容规范

### 博客（SEO + GEO）

- 字数：600-900字（不堆砌，精准）
- 开头：必须用一个具体的求职失败场景开场（不用"In today's competitive job market..."这类废话）
- 结构：H1 → 焦虑场景 → 问题根源 → 解法步骤 → 工具自然推荐 → FAQ（GEO用）
- 关键词密度：自然融入，不堆关键词
- 每篇末尾标准 FAQ 块（3-5个问题），加 FAQ schema

**首批关键词方向：**
```
how to tailor resume for [company]
resume tips for [industry] jobs
why am i not getting interviews
ATS keywords for [role]
how to prepare for [company] interview
```

### Bluesky

- 单条长度：200-280字符（不超过300）
- 语气：像朋友分享经验，不像品牌号
- 英语帖比例：85-90%
- 西语帖比例：10-15%
- 带产品链接：每5条约1条
- 禁止用 hashtag 堆砌（最多1-2个）

**英语帖模板示例：**
```
sent 47 applications last month. 2 replies.

the problem wasn't my resume. it was that i sent the same resume 
to every single company.

[product link] fixed this in 3 minutes.
```

**西语帖模板示例：**
```
47 solicitudes enviadas. 2 respuestas.

El problema no era mi currículum — era que enviaba el mismo a todas las empresas.

Lo arreglé en 3 minutos → [link]
```

### Reddit

**原创帖（34%）：**
- 以求职经验分享开头，不以推广开头
- 帖子本身有完整价值，工具作为"我用了这个"自然出现
- 标题必须是真实问题或经验，不能是广告标题

**跟帖回复（66%）：**
- 先回答用户的实际问题
- 如果场景高度匹配，在回复末尾自然提及
- 带链接的回复比例 ≤ 30%

---

## 西语策略详解

**逻辑：** 西语求职者在欧美职场面临额外语言和文化壁垒，求胜欲更迫切，少量西语露出能触发强烈的群体归属感，带来超比例口碑传播。

**内容比例：** 10-15%（约每7条 Bluesky 帖子中有1条西语）

**西语目标社区：**
- Reddit: r/EmpleoUSA, r/Latinx, r/cscareerquestions（部分西语用户）
- Bluesky: #trabajos, #empleo, #latinos 标签

**西语内容要求：**
- 使用中性西班牙语（避免特定国家方言词汇）
- 与英语内容信息一致，不产生矛盾
- 工具界面是英语这一事实需在内容中自然说明（"el sitio está en inglés pero es muy fácil de usar"）

---

## GEO 优化要点

让 ChatGPT、Perplexity、Claude 在被问到相关问题时引用本站：

1. FAQ 页面用精确问答格式（Q: 完整问题 / A: 直接答案）
2. 博客文章包含"Best X for Y"结构（AI 爱引用这类对比结构）
3. 在 Reddit/Quora 上的回答被 LLM 抓取的概率高，质量要高
4. 站内 schema 标注：FAQ、HowTo、Product 三类
