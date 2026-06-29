// 轻量 Supabase 客户端，只用 fetch，无需 npm 包
// 避免 Node 版本和 WebSocket 兼容性问题

export function createSupabase(url, key) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
  }

  async function query(table, params = {}) {
    const qs = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    const res = await fetch(`${url}/rest/v1/${table}${qs ? '?' + qs : ''}`, { headers })
    if (!res.ok) throw new Error(`Supabase query failed: ${res.status} ${await res.text()}`)
    return res.json()
  }

  async function insert(table, data) {
    const res = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`)
    return true
  }

  async function update(table, data, match) {
    const qs = Object.entries(match)
      .map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`)
      .join('&')
    const res = await fetch(`${url}/rest/v1/${table}?${qs}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Supabase update failed: ${res.status} ${await res.text()}`)
    return true
  }

  async function count(table, params = {}) {
    const qs = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    const res = await fetch(`${url}/rest/v1/${table}${qs ? '?' + qs : ''}`, {
      headers: { ...headers, 'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-0' },
    })
    if (!res.ok) throw new Error(`Supabase count failed: ${res.status}`)
    const range = res.headers.get('content-range') // e.g. "0-0/42"
    return parseInt(range?.split('/')[1] ?? '0', 10)
  }

  return { query, insert, update, count }
}
