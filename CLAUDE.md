@AGENTS.md
# HireMe AI 工作规范 v1.0

## 项目信息
- 仓库：van0710-source/hireme-ai，分支：claude-experiment
- 技术栈：Next.js + TailwindCSS + Supabase + DeepSeek API + Creem 支付 + Resend 邮件
- 预览链接：https://hireme-ai-im92-git-claude-experiment-van0710-sources-projects.vercel.app

## 工作习惯
1. Push 命令：每条命令单独一个代码块，末尾加"逐条执行"提示
2. 代码确认原则：未经我明确确认前，不开始写代码或生成文件
3. 上下文提醒：对话超过 20 条消息时，提醒我开启新对话继续
4. 工作习惯更新：当我说"把这个方式补充到工作习惯里"时，立即输出更新后的完整规范内容供我替换
5. 优先级执行：按 P0→P1→P2 顺序推进，完成一项确认后再进入下一项

## 当前进度
- P0 ✅ Resend 域名验证 + 注册登录测试完成
- P1 ✅ PaywallModal 升级完成
- P2 ✅ 简历导出（复制体验优化）完成
- P3 ✅ 移动端适配完成
- P4 ✅ Privacy/Terms 页面样式完成
- P5 ✅ Vercel Authentication — 保持关闭（网站已公开上线）
- P6 ✅ 营销自动化子项目（marketing/）搭建完成
  - 5个 GitHub Actions Agent 运行中（博客/Bluesky/Reddit/分析/PM周报）
  - Bluesky 账号 hireme-ai.bsky.social 已注册，Agent 自动预热中
  - PM 周报邮件已确认正常发送
- P7 ✅ Logo 更换（Diamond 图标 + HireMe-AI 品牌名）
- P8 ✅ SEO 基础设施完成
  - sitemap.xml、robots.txt、OG image 动态生成、Twitter Card
  - WebApplication schema、所有页面 canonical URL
  - Google Search Console 验证完成，sitemap 已提交
  - Vercel 生产部署正确指向 claude-experiment 分支（hireme-ai-im92 项目）

## 下一阶段工作
- [ ] Reddit 账号（hiremeai-Junket）预热：每天在 r/resumes、r/cscareerquestions、r/jobs 手动回复，积累 100+ karma（预计 2-3 周）
- [ ] Reddit karma 达标后：申请 Reddit API，在 GitHub Secrets 配置 REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET / REDDIT_USERNAME / REDDIT_PASSWORD
- [ ] Blog 页面（/app/blog/page.tsx）接入 Supabase 动态内容，替换现有静态文章列表
- [ ] 持续关注：Google Search Console 收录状态（提交后 1-2 周内 Google 开始抓取）

## 已知待修复
- 登录后账户卡片首次加载显示设备额度而非用户额度（刷新后正常）

## 关键技术细节
- Supabase 表：daily_usage（设备）/ users（登录用户）
- 额度逻辑：FREE_USES=3, CREDITS_PER_USE=8, CREDITS_PER_PURCHASE=200
- Session cookie：hireme_session，httpOnly，30天
- Creem Webhook 签名：plain HMAC hex 格式
- PDF worker：/public/pdf.worker.min.mjs