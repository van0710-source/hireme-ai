-- 博客文章表（Agent 1 写入，Next.js /blog 路由读取）
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  content TEXT NOT NULL,        -- HTML内容
  faq JSONB,                    -- [{q, a}, ...]
  language TEXT DEFAULT 'en',   -- 'en' | 'es'
  keyword TEXT,                 -- 来源关键词
  status TEXT DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 按发布时间倒序索引
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_language_idx ON blog_posts (language);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts (status);
