# 快速迭代推广计划 v2

> 版本：v2.0 | 周期：2026-07-01 起 | 战略：GEO+SEO 并行，周复盘，动态加权

---

## 战略权重（基线，每周 ±10%）

| 渠道 | 权重 | 核心资产 |
|------|------|----------|
| SEO | 50–55% | Blog 3篇/周、内链、GSC |
| GEO | 25–30% | `/faq`、FAQ schema、对比文、llms.txt、IndexNow |
| 社区+社媒 | 20–25% | Bluesky 日更、Reddit 价值回复 |

**转化 KPI：** 进站 → 免费试用（3次）→ 首笔付费（$1 / $20）

---

## 第 1 周（7/1–7/7）：基建 + 首波内容

| 动作 | 负责 | 状态 |
|------|------|------|
| `/faq` 18 问上线 | 工程 | ✅ |
| Blog 3 篇（Google / 没回音 / 对比文） | 内容策略官 + Blog Agent | 进行中 |
| Bluesky 预热零链接 + 首帖发布 | Bluesky Agent | 进行中 |
| IndexNow 每篇新文 ping | Blog Agent | ✅ |
| 内容日历 `weekly-plan.json` | 内容策略官 | ✅ |
| Reddit 每日 2 条价值回复（模板） | 人工/后续自动 | 待 karma |

**周 KPI：** Blog ≥2 · Bluesky ≥3 · FAQ 上线 · **≥1 付费或明确转化卡点**

---

## 第 2 周（7/8–7/14）：并行加量 + GEO 首检

- Blog 维持 2–3 篇/周（长尾 + ATS 词）
- GEO 对比型文章 1 篇
- Bluesky 继续零链接
- **GEO 五问句抽检**（每周五，见 `marketing/logs/geo-check-*.md`）
- Reddit karma 够则开自动跟帖

---

## 第 3 周（7/15–7/21）：只加码有效渠道

- 有展示无点击 → 改 title/meta
- 某篇带来试用 → 同主题集群 +2 篇
- Reddit 带来进站 → 提高跟帖（控链接 ≤30%）
- GEO 某问句已引用 → 扩 FAQ + Blog
- 全无线索 → 查落地页/定价，不加渠道

**可选：** ≥5 篇 Blog + ≥3 笔付费 → 提前 Product Hunt

---

## 第 4 周（7/22–7/28）：战略复盘

- SEO / GEO / 社区谁带来首个付费 → 下月权重
- 焦虑钩子 CTR → 写入 Prompt
- Token / 产能是否可持续

---

## 角色分工

| 角色 | 文档 | Agent |
|------|------|-------|
| 营销策略官（Role 1） | [pm-agent.md](./pm-agent.md) | `pm-agent.js` 周报+脉冲 |
| 内容策略官（Role 2） | [content-strategist.md](./content-strategist.md) | `content-strategist-agent.js` |

---

## 自动化排期（GitHub Actions UTC）

| 任务 | Cron |
|------|------|
| 内容日历 | 周日 08:30 |
| Blog 生产 | 周一三五 02:00 |
| Bluesky 生成 | 周日 10:00（生成后自动发首条） |
| Bluesky 发布 | 每日 22:00 |
| 互动分析 | 周日三五 08:00 |
| PM 周报 | 周一 09:00 |
| PM 脉冲 | 周三周五 09:00 |

---

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| 内容多但质量水 | 反 AI 味规范 + 质量重试 + 只扩已验证主题 |
| Reddit 封号 | 前 2 周零链接；karma 门槛 |
| SEO 薄内容 | 700+ 字 + FAQ，不堆短帖 |
| GEO 短期无引用 | 与 SEO 展示一起看；FAQ 专页持续维护 |
| 4 周零付费 | 优先查产品/落地页，不加渠道 |

---

*原 6 个月计划归档见 git history；本文件为当前执行源。*
