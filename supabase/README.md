# Supabase migrations

## 001_enable_rls.sql — Row Level Security (Critical)

**When:** After Supabase security alert `rls_disabled_in_public` (2026-06-28).

**How to apply:**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project **hireme-ai**
2. **SQL Editor** → New query
3. Paste contents of `migrations/001_enable_rls.sql` → **Run**
4. **Database** → **Tables** → confirm each table shows RLS **enabled**

**Verify app still works:** register, login, generate resume, payment webhook.

**Optional — confirm anon is blocked** (replace URL and anon key):

```bash
curl "https://<project-ref>.supabase.co/rest/v1/users?select=id&limit=1" \
  -H "apikey: <NEXT_PUBLIC_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <NEXT_PUBLIC_SUPABASE_ANON_KEY>"
```

Expected: empty result or permission error, not user rows.
