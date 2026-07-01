# SEO 工作计划

> **项目**：HireMe AI · hireme-ai.com  
> **更新**：2026-07-02  
> **状态**：SEO-1 / SEO-2 已由 Agent 落盘；以下为用户待办

---

## 已由 Agent 完成（无需操作）

| 项 | 说明 |
|----|------|
| Blog 动态页 | `/blog` 列表 + `/blog/[slug]` 详情（读 Supabase `blog_posts`） |
| 结构化数据 | 文章 `Article` + `FAQPage`；首页 `FAQPage` |
| 动态 sitemap | 已发布文章自动加入 `sitemap.xml` |
| robots.txt | 屏蔽 `/api/`、`/payment/` |
| 内链 | 导航 + 页脚 **Resources** → `/blog` |
| llms.txt | `https://www.hireme-ai.com/llms.txt` |
| blog-agent | `SITE_URL` 修正为 `https://www.hireme-ai.com` |

---

## 自动进行（无需操作）

| 时间 (UTC) | 北京时间 | Agent | 作用 |
|------------|----------|-------|------|
| 周一/四 02:00 | 10:00 | Blog | 生成 SEO 文章写入 `blog_posts` |
| 每天 22:00 | 次日 06:00 | Bluesky | 发布社媒帖 |
| 周一 09:00 | 17:00 | PM 周报 | 邮件汇报 |

**最近 Blog 自动运行**：周四 UTC 02:00（北京时间周四 10:00）

---

## 用户待办 — 本周五提醒（2026-07-04）

> 新对话可 `@docs/SEO-WORKPLAN.md` 让 Agent 带你逐项核对。

### 1. 确认 Blog 文章已上线（约 10 分钟）

Blog Agent 会在 **周四 10:00（北京）** 自动生成首篇文章。周五请检查：

- [ ] 打开 https://www.hireme-ai.com/blog — 应看到至少 **1 篇真实文章**（非 “Coming soon”）
- [ ] 点击文章 — 详情页正常、FAQ 显示
- [ ] Supabase 执行：

```sql
SELECT slug, title, status, published_at
FROM blog_posts
ORDER BY published_at DESC
LIMIT 5;
```

若周四后仍无文章：

1. GitHub → Actions → Marketing Automation → Run workflow → **`blog`**
2. 查看运行日志是否有报错，截图发给 Agent

### 2. 注册 Bing Webmaster Tools（约 15 分钟，免费）

1. 打开 https://www.bing.com/webmasters
2. 添加站点 `https://www.hireme-ai.com`
3. 按提示验证（DNS 或 HTML 标签 — 若需改代码，把验证内容发给 Agent）
4. 提交 Sitemap：`https://www.hireme-ai.com/sitemap.xml`

### 3. Google Search Console 快速巡检（约 5 分钟，免费）

- [ ] **编制索引** → 页面：无新增错误
- [ ] **效果** → 查询：记录有展示的前 5 个词（留档即可）

### 4. 可选：手动请求收录首篇 Blog

Search Console → **网址检查** → 输入 `https://www.hireme-ai.com/blog/{slug}` → **请求编入索引**

---

## 暂不执行（已确认不做）

- 付费 Google Ads
- 买外链 / 付费 SEO 工具
- 多语言独立 URL 改造
- 首页 SSR 重构

---

## Reddit 预热期

Reddit Agent 已静默，karma 达标并配置 `REDDIT_*` Secrets 后再恢复。

---

## 变更记录

| 日期 | 变更 |
|------|------|
| 2026-07-02 | SEO-1/2 实施；创建本工作计划 |
