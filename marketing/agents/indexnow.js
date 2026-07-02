// IndexNow ping — notify Bing/Yandex of new/updated URLs
// Key file must exist at https://www.hireme-ai.com/{INDEXNOW_KEY}.txt

const SITE = 'https://www.hireme-ai.com'
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'a7f3c9e2b1d84f6a90e5c8d3b7a2f1e6'

export async function pingIndexNow(urls) {
  const list = Array.isArray(urls) ? urls : [urls]
  if (!list.length) return

  const body = {
    host: 'www.hireme-ai.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList: list.map(u => (u.startsWith('http') ? u : `${SITE}${u}`)),
  }

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      })
      console.log(`[indexnow] ${endpoint} → ${res.status}`)
    } catch (err) {
      console.warn(`[indexnow] ${endpoint} failed:`, err.message)
    }
  }
}
