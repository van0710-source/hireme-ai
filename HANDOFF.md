# 部署交接文档
> 上次对话截止状态，下次对话开始前请先读取此文件

## 项目架构（已确认）

| Vercel 项目 | 域名 | 角色 |
|---|---|---|
| `hireme-ai-im92` | `www.hireme-ai.com` | ✅ 正式生产项目 |
| `hireme-ai` | `hireme-ai-blush.vercel.app` | 空项目，不使用 |

- GitHub 仓库：`van0710-source/hireme-ai`
- 当前工作分支：`claude-experiment`
- 部署路径：`claude-experiment` → merge → `main` → `hireme-ai-im92` 自动部署 → `www.hireme-ai.com`

---

## 环境变量状态（hireme-ai-im92）

| 变量 | 状态 |
|---|---|
| `CREEM_API_KEY` | ✅ 已更新为 Live key |
| `CREEM_WEBHOOK_SECRET` | ✅ 已更新为 Live webhook secret |
| `CREEM_PRODUCT_SINGLE` | ✅ `prod_1SV5C6ZwprVv8KfIpYnfel`（$1，Live）|
| `CREEM_PRODUCT_CREDITS` | ✅ `prod_4vsdVMjmvYUGRx70V5ZOlP`（$20，Live）|
| `NEXT_PUBLIC_APP_URL` | ✅ 已更新为 `https://www.hireme-ai.com` |
| `RESEND_API_KEY` | ✅ 已有 |
| `DEEPSEEK_API_KEY` | ✅ 已有 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ 已有 |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ 已有 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ 已有 |
| `SESSION_SECRET` | ⚠️ **待确认**：是否已更新为新生成的64位随机字符串 |
| `OPENAI_API_KEY` | ❌ **待删除**（旧版遗留）|
| `OPENAI_BASE_URL` | ❌ **待删除**（旧版遗留）|
| `ALERT_EMAIL` | ❌ **待删除**（旧版遗留）|

---

## 下次对话需要完成的步骤

### Step 1：完成环境变量清理（用户操作）
- [ ] 确认 `SESSION_SECRET` 已更新为强随机密钥
- [ ] 删除 `OPENAI_API_KEY`
- [ ] 删除 `OPENAI_BASE_URL`
- [ ] 删除 `ALERT_EMAIL`

### Step 2：合并部署（代码操作）
```bash
git checkout main
git merge claude-experiment
git push origin main
```
推送到 main 后，`hireme-ai-im92` 会自动触发生产部署。

### Step 3：部署后验证
- [ ] 访问 `https://www.hireme-ai.com` 确认新设计已上线
- [ ] 测试免费额度（3次，无需注册）
- [ ] 测试付费流程（$1 产品，用真实小额支付验证）
- [ ] 测试注册登录（邮件验证码）
- [ ] 确认 Creem Webhook 接收正常（付款后 credits 到账）

### Step 4：上线后清理
- [ ] 确认 `hireme-ai-im92` Vercel Authentication 对 Preview 环境开启保护
- [ ] 旧的 `hireme-ai` Vercel 空项目可以归档或删除

---

## 本次迭代完成的功能清单

- ✅ 首页全面重设计（Concept A "Signal"风格）
- ✅ 移动端 / 平板全面适配
- ✅ 导航栏重设计（纯文字 logo，汉堡菜单，Sign in only）
- ✅ 注册按钮从导航栏移除（注册仅在付费时触发）
- ✅ Privacy / Terms 页面样式升级
- ✅ 登录后额度卡片首次加载显示设备额度的 bug 修复
- ✅ 删除无保护的 `/api/analyze` 路由（DeepSeek 费用风险）
- ✅ 登录接口加 rate limiting（IP，10次/15分钟）
- ✅ 注册接口加双重 rate limiting（IP + 邮箱级）
- ✅ 清除 create-checkout 调试日志
- ✅ Vercel Authentication 开启（hireme-ai-im92 预览环境保护）

---

## 待下次迭代的事项（已记录到 memory）
- 多语言支持（8种语言，next-intl）
