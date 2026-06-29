-- Marketing sub-project tables
-- Run in Supabase SQL editor

-- 关键词队列
CREATE TABLE IF NOT EXISTS marketing_keywords (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  category TEXT, -- 'blog', 'reddit', 'bluesky'
  language TEXT DEFAULT 'en', -- 'en' or 'es'
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 内容队列（Bluesky帖子预生成库）
CREATE TABLE IF NOT EXISTS marketing_content_queue (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL, -- 'bluesky', 'reddit'
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  include_link BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending', -- 'pending', 'published', 'skipped'
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 发布记录
CREATE TABLE IF NOT EXISTS marketing_publish_log (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  content_id INT,
  post_id TEXT, -- platform's post ID
  url TEXT,
  status TEXT, -- 'success', 'failed'
  error TEXT,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token消耗追踪
CREATE TABLE IF NOT EXISTS marketing_token_usage (
  id SERIAL PRIMARY KEY,
  agent TEXT NOT NULL, -- 'blog', 'bluesky', 'reddit', 'analysis', 'pm'
  tokens_used INT NOT NULL,
  month TEXT NOT NULL, -- 'YYYY-MM'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 月度Token汇总视图
CREATE OR REPLACE VIEW marketing_monthly_tokens AS
SELECT month, SUM(tokens_used) as total_tokens
FROM marketing_token_usage
GROUP BY month
ORDER BY month DESC;

-- 互动分析记录
CREATE TABLE IF NOT EXISTS marketing_interactions (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  post_id TEXT,
  content TEXT,
  interaction_type TEXT, -- 'reply', 'like', 'comment'
  interaction_content TEXT,
  analyzed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 焦虑点库（对应anxiety-library.md的数据库版本）
CREATE TABLE IF NOT EXISTS marketing_anxiety_points (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_quotes TEXT[], -- 用户原声
  confirmed BOOLEAN DEFAULT FALSE, -- 是否经过邮件确认
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始化关键词种子数据
INSERT INTO marketing_keywords (keyword, category, language) VALUES
  ('how to tailor resume for Google', 'blog', 'en'),
  ('how to tailor resume for Amazon', 'blog', 'en'),
  ('how to tailor resume for Microsoft', 'blog', 'en'),
  ('resume tips for fintech jobs', 'blog', 'en'),
  ('resume tips for McKinsey application', 'blog', 'en'),
  ('why am i not getting interviews', 'blog', 'en'),
  ('ATS keywords for software engineer', 'blog', 'en'),
  ('how to prepare for Google interview', 'blog', 'en'),
  ('how to write cover letter for startup', 'blog', 'en'),
  ('resume black hole how to avoid', 'blog', 'en'),
  ('best free resume tailoring tool', 'blog', 'en'),
  ('AI resume optimizer no signup', 'blog', 'en'),
  ('como adaptar curriculum para empresa', 'blog', 'es'),
  ('consejos curriculum trabajo USA', 'blog', 'es')
ON CONFLICT DO NOTHING;
