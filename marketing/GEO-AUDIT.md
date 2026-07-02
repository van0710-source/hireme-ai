# GEO / 推广计划检核报告

> **日期**：2026-07-02  
> **触发**：Bluesky `@hireme-ai.bsky.social` 显示 0 帖  
> **结论**：计划方向正确，但 **执行层有 3 个阻塞点** 导致「有队列、无发帖」

---

## 一、Bluesky 为何 0 帖（根因）

### 已确认事实

| 项 | 状态 |
|----|------|
| 内容生成 | ✅ 手动 `bluesky-generate` 成功，队列 7 条 `pending` |
| 账号帖子数 | ❌ `postsCount: 0`（2026-07-02 UTC 核查） |
| 发布定时 | 每日 UTC 22:00（北京次日 06:00） |

### 根因 1：排期与 Cron **时间竞态**（主因）

生成逻辑把每条帖排在 **当天 UTC 22:00–22:29** 的随机时刻：

```javascript
scheduledAt.setHours(22, Math.floor(Math.random() * 30), 0, 0)
```

但发布 Cron 在 **整点 22:00:00** 触发。若 `scheduled_at = 22:17`，22:00 那次发布会判定「尚无到期内容」，**当天错过**。

### 根因 2：首周发布窗口错过

队列首条排期为 **7/1 22:xx UTC**。在 7/2 02:09 UTC 时：

- 7/1 的 22:00 Cron 已跑过（可能因根因 1 未发）
- 7/2 的 22:00 Cron 尚未到

→ 账号仍为空。

### 根因 3：7/1 前发布任务曾失败

7/1 之前 `bluesky-publish` 因 **缺少 `npm ci`** 失败；修复前即使队列有数据也无法发。

### 次要：计划 vs 实现偏差

`plan.md` 第 1–2 周要求 Bluesky **只发干货、不提产品**，但生成 Prompt 仍允许 7 条里 2 条带链接。不影响「0 帖」，但影响预热策略一致性。

---

## 二、GEO 计划完成度对照

### 站内（SEO + GEO）

| 计划项 | 文档要求 | 实际 | 评级 |
|--------|----------|------|------|
| FAQ 专页 `/faq` | plan.md 第1个月 | ❌ 仅有首页 FAQ schema | **缺口** |
| 博客 + FAQ schema | ✅ | ✅ 动态 `/blog/[slug]` | 完成 |
| WebApplication schema | — | ✅ layout.tsx | 完成 |
| HowTo schema | content-guidelines | ❌ 未做 | 低优先 |
| llms.txt | — | ✅ `/llms.txt` | 完成 |
| 首页 FAQ schema | content-guidelines | ✅ 2026-07-02 已加 | 完成 |
| 动态 sitemap | — | ✅ 含 blog | 完成 |

### 站外（分发 + GEO 信号）

| 渠道 | 计划 | 实际 | 评级 |
|------|------|------|------|
| Bluesky | 第1月 28 条/月 | 0 帖（队列有货未发） | **阻塞** |
| Blog Agent | 8 篇/月 | 待周四首次自动跑 | 待验证 |
| Reddit | 预热 karma | Agent 已静默 | 符合计划 |
| Bing Webmaster | — | 用户待办（周五） | 待做 |
| 焦虑点资产库 | 动态更新 | 表在，分析 Agent 未跑够 | 早期 |

### GEO 引用（第 3 个月 KPI）

Perplexity / ChatGPT 引用验证 — **为时尚早**，但需先保证 **可抓取内容**（blog 发文 + FAQ 专页）。

---

## 三、优化建议（按优先级）

### P0 — 立即（修复 Bluesky 发帖）

1. **修复排期逻辑**：首条立即可发，其余按日 22:00 UTC 排期（见 `bluesky-agent.js` 更新）
2. **手动发首帖**：Actions → `bluesky-publish`，或 Supabase 将首条 `scheduled_at` 改为过去时间
3. **补全 Bluesky 资料**：显示名、简介（含 hireme-ai.com）— 需你在 bsky.app 设置或提供文案由我写入 Agent

### P1 — 本周（GEO 基础设施）

4. **新增 `/faq` 专页**：独立 URL + FAQPage schema（plan.md 原要求，利于 AI 引用）
5. **更新 `marketing_publish_log` 监控**：PM 周报应突出「队列 pending 但 0 发布」异常
6. **Bluesky 预热 Prompt**：第 1–2 周 `include_link: false` 全部干货

### P2 — 本月（计划对齐）

7. Blog 周四首篇 → Search Console 请求收录
8. Bing Webmaster 提交 sitemap（SEO-WORKPLAN 周五待办）
9. 第 3 周起：Perplexity 测试 5 个目标查询，记录是否引用

### 不做（已确认）

- 付费广告、买外链、多语言独立 URL、首页 SSR 重构

---

## 四、修订后的 Bluesky 节奏

```
周日 10:00 UTC  → 生成 7 条入队（第 1 条立即可发）
每日 22:00 UTC  → 发布 1 条到期内容
```

首条在生成后 **下一次 publish（当日或次日 22:00）** 即可发出；不再依赖「22:00 整点碰 22:17 排期」的运气。

---

## 五、用户可立即操作（解锁首帖）

**方式 A — GitHub Actions（推荐）**

1. Actions → Marketing Automation → Run workflow  
2. Branch：`claude-experiment`  
3. Agent：`bluesky-publish`

**方式 B — Supabase SQL（让首条到期）**

```sql
UPDATE marketing_content_queue
SET scheduled_at = NOW() - INTERVAL '1 hour'
WHERE id = (
  SELECT id FROM marketing_content_queue
  WHERE platform = 'bluesky' AND status = 'pending'
  ORDER BY scheduled_at ASC
  LIMIT 1
);
```

然后运行 `bluesky-publish`。

---

## 变更记录

| 日期 | 变更 |
|------|------|
| 2026-07-02 | 初版检核；定位 Bluesky 0 帖根因 |
