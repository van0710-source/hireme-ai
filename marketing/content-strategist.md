# 内容策略官（Role 2）— 先计划、后产出、去 AI 味

> 版本：v2.0 | 更新：2026-07-02 | 对应 Agent：`content-strategist-agent.js` + 各内容 Agent Prompt

## 角色定位

**内容策略官**负责所有对外文字的 **计划、质量、产能**。原则：**先有计划再生产**；**量多但不水**；**读起来像真人，不像 ChatGPT**。

你 **可抽检**，但 **不需要审批执行过程**。计划与 Prompt 优化由主 Agent 根据战略与项目特性决定，结合同业可借鉴案例后自动推进。

## 工作流

```text
周日：生成本周内容日历（weekly-plan.json）
    ↓
Blog Agent（一/三/五）：按日历关键词 + 焦虑库生产
Bluesky Agent（日更）：按周主题 + 预热规则发布
    ↓
周三：营销策略官抽检质量 → 必要时回调 Prompt
```

## 周计划文件

**路径：** `marketing/content/weekly-plan.json`

```json
{
  "week": 1,
  "period": "2026-07-01 — 2026-07-07",
  "theme": "简历黑洞 + 公司定向",
  "blog": [ { "keyword": "...", "angle": "...", "anxiety": "被无视" } ],
  "bluesky": { "angles": ["..."], "link_policy": "zero_links" },
  "geo_targets": ["how to tailor resume for a specific company"]
}
```

Blog Agent **优先读日历**；日历用尽再取 `marketing_keywords` 队列。

## 产量目标（v2）

| 渠道 | 频率 | 质量底线 |
|------|------|----------|
| Blog | 3 篇/周（一三五 UTC 02:00） | 700–900 词，1 个具体场景开场 |
| Bluesky | 7 条/周 | 200–280 字符，像朋友吐槽 |
| FAQ | 静态 18 问 + 每篇 Blog 3–5 FAQ | 直接作答，可抽取 |
| 西语 | 10–15% | 中性西语，与英语信息一致 |

## 反 AI 味规范（强制写入所有 Prompt）

详见 [anti-ai-voice.md](./content/anti-ai-voice.md)。摘要：

**禁止开头：**

- In today's competitive job market…
- Are you struggling with…
- In this article, we will…
- It's no secret that…
- Whether you're a… or a…

**禁止用词堆砌：**

- leverage, utilize, delve, tapestry, landscape, game-changer, unlock, empower
- 破折号滥用、排比三连、「Here's the thing」

**必须包含：**

- 一个 **可验证的具体数字或场景**（如「47 份申请 2 个回复」）
- **一个非完美的口语细节**（缩写、碎句、真实挫败感）
- 工具出口在 **解法段末尾**，不在首段

## 同业借鉴（结构，非抄袭）

| 来源类型 | 借鉴点 |
|----------|--------|
| r/resumes 高赞帖 | 标题用真实问题，正文先给价值 |
| Lenny / career newsletter | 短段落、一个论点一段 |
| Perplexity 引用页 | FAQ 精确问答、对比型 H2 |
| 独立求职工具落地页 | 焦虑场景图 + 按次付费叙事 |

## 内容结构（不变）

```text
戳痛（焦虑场景）→ 放大（为什么严重）→ 出口（工具自然出现）
```

## 质量自检（Agent 生成后内部规则）

生成后若命中 ≥2 条「禁止开头」或缺少具体数字 → **自动重试 1 次**（temperature 略降）。

## 决策权限

**内容策略官可自动执行：**

- 更新 `weekly-plan.json`
- 调整 Blog/Bluesky Prompt（在 content-guidelines 框架内）
- 从焦虑库选取本周主题
- 追加 `marketing_keywords` 种子词

**需营销策略官 + 主 Agent 对齐：**

- 变更内容红线（strategy.md）
- 西语比例 >20%
- 带链接比例突破预热规则

**不需你审批：**

- 单篇选题、具体标题、发布时间
- Prompt 微调、重试生成

---

*执行载体：`marketing/agents/content-strategist-agent.js`（周日 UTC 08:30，在 Bluesky 生成之前）*
