# 自动化技术规范

> 版本：v1.1 | 更新：2026-06-29

## 架构总览

```
GitHub Actions (定时触发)
    ├── Agent 1: 博客内容生产 (周一/周四)
    ├── Agent 2: Bluesky 发布 (每日)
    ├── Agent 3: Reddit 监控+回复 (每小时)
    ├── Agent 4: 互动分析+邮件 (每3天)
    └── Agent 5: PM 督导报告 (每周)

共享资源:
    ├── Supabase: 内容队列、发布记录、Token计数
    ├── DeepSeek API: 所有 AI 生成
    └── Resend API: 邮件通知 (复用现有)
```

---

## Token 预算与控制

| Agent | 单次消耗 | 触发频率 | 月预估消耗 |
|-------|---------|---------|-----------|
| 博客生产 | ~1,500 tokens | 8次/月 | ~12,000 |
| Bluesky 批量生成 | ~3,000 tokens | 4次/月 | ~12,000 |
| Reddit 回复生成 | ~500 tokens | 最多150次/月 | ~75,000 |
| 互动分析 | ~5,000 tokens | 10次/月 | ~50,000 |
| PM 督导报告 | ~2,000 tokens | 4次/月 | ~8,000 |
| **月合计** | | | **~157,000** |

**预警规则：** Supabase 记录每次 Token 消耗，月累计超过 300,000 时触发 Resend 邮件至 van0710@gmail.com 请求确认是否继续。

---

## Agent 1：博客内容生产

**文件：** `marketing/agents/blog-agent.js`
**触发：** 每周一、周四 UTC 02:00（北京时间10:00）
**流程：**
1. 从 Supabase `marketing_keywords` 表取下一个未使用关键词
2. 调用 DeepSeek 按模板生成文章（含 SEO meta、schema 标注）
3. 写入 Supabase `blog_posts` 表，`status = published`
4. 触发 Next.js revalidation（自动上线）
5. 记录 Token 消耗

**Prompt 设计原则：** 焦虑切入开场，具体场景，工具自然出现在解法段落。不超过800字，避免 AI 腔。

---

## Agent 2：Bluesky 发布

**文件：** `marketing/agents/bluesky-agent.js`
**触发：**
- 批量生成：每周日 UTC 10:00，一次生成7条入队列
- 逐条发布：每日 UTC 22:00（美东下午6点，欧美下班浏览高峰）

**发布比例：**
- 英语内容：85-90%
- 西语内容：10-15%（穿插在英语内容中）

**带产品链接比例：** 每5条约1条带链接，其余纯干货。

---

## Agent 3：Reddit 监控+回复

**文件：** `marketing/agents/reddit-agent.js`
**触发：** 每小时，UTC 整点（含随机偏移 ±20分钟，模拟人类行为）

**监控社区：**
- r/resumes, r/cscareerquestions, r/jobs, r/jobsearch（英语主力）
- r/EmpleoUSA, r/Latinx（西语补充）

**触发关键词（零Token，规则匹配）：**
```
cover letter, resume help, ATS, tailored resume, job application,
interview prep, no response, ghosted by recruiter, resume black hole,
carta de presentación, currículum
```

**发布策略：**
- 34% 原创帖（焦虑切入，每周约2-3帖）
- 66% 跟帖回复（关键词命中时触发）
- 带产品链接的回复 ≤ 30%
- 发布时间随机偏移 ±30-90分钟

**Reddit 账号要求：**
- 启动前账号需有 ≥ 100 karma 和 ≥ 2周历史
- 账号预热脚本单独运行（仅参与非推广讨论）

---

## Agent 4：互动分析+邮件

**文件：** `marketing/agents/analysis-agent.js`
**触发：** 每3天，UTC 08:00

**数据来源：**
- Bluesky API：近3天帖子的回复和点赞
- Reddit API：近3天回复的评论
- Supabase：博客文章浏览数据

**输出：**
- 新焦虑表达词汇提取
- 内容方向建议（哪类内容互动率高）
- Token 消耗统计
- 更新建议列表

**邮件格式：** 纯文本，标题 `[HireMe Marketing] 互动分析报告 #N`，包含"确认更新"指令（回复邮件触发自动更新，或登录后台操作）。

---

## Agent 5：PM 督导 Agent

**文件：** `marketing/agents/pm-agent.js`
**触发：** 每周一 UTC 09:00

**职责：**
- 检查本周各 Agent 运行状态（是否有失败记录）
- 统计本周 KPI 进度（博客发布数、帖子数、Token消耗）
- 对比月度计划，标记滞后项
- 生成周报邮件至 van0710@gmail.com

**风险预警规则：**
- Reddit 账号被封 → 立即邮件告警
- 连续2次博客生产失败 → 邮件告警
- Token 月消耗 > 300K → 邮件确认是否继续
- DeepSeek API 错误率 > 20% → 邮件告警

---

## 环境变量（新增，需配置到 GitHub Secrets）

```
DEEPSEEK_API_KEY          # 已有
RESEND_API_KEY            # 已有
SUPABASE_URL              # 已有
SUPABASE_SERVICE_KEY      # 需新增（server-side写入权限）
BLUESKY_IDENTIFIER        # Bluesky 账号
BLUESKY_PASSWORD          # Bluesky 密码
REDDIT_CLIENT_ID          # Reddit API
REDDIT_CLIENT_SECRET      # Reddit API
REDDIT_USERNAME           # Reddit 账号
REDDIT_PASSWORD           # Reddit 密码
MARKETING_EMAIL           # van0710@gmail.com
```
