# HireMe AI — Marketing Sub-Project

> 版本：v2.0 | 战略：快速迭代 GEO+SEO 并行

## 文件索引

| 文件 | 内容 |
|------|------|
| [plan.md](./plan.md) | **v2 快速迭代计划**（当前执行源） |
| [strategy.md](./strategy.md) | 推广定位、焦虑点、内容红线 |
| [pm-agent.md](./pm-agent.md) | **Role 1** 营销策略官 |
| [content-strategist.md](./content-strategist.md) | **Role 2** 内容策略官 |
| [content-guidelines.md](./content-guidelines.md) | 渠道内容规范 |
| [content/anti-ai-voice.md](./content/anti-ai-voice.md) | 反 AI 味规范 |
| [content/weekly-plan.json](./content/weekly-plan.json) | 本周内容日历 |
| [tech-spec.md](./tech-spec.md) | 自动化架构 |
| [GEO-AUDIT.md](./GEO-AUDIT.md) | 技术审计 |
| [logs/](./logs/) | GEO 抽检、脉冲记录 |

## Agent 索引

| Agent | 文件 | 触发 |
|-------|------|------|
| 内容策略官 | `agents/content-strategist-agent.js` | 周日 08:30 UTC |
| 博客 | `agents/blog-agent.js` | 周一三五 02:00 UTC |
| Bluesky | `agents/bluesky-agent.js` | 日更 |
| 营销策略官 | `agents/pm-agent.js` | 周报 + 脉冲 |
| 互动分析 | `agents/analysis-agent.js` | 每 3 天 |

## 快速状态

- 启动：2026-07-01
- 阶段：v2 第 1 周
- PM 邮件：van0710@gmail.com
- Token 预警：月 > 300,000
