// lib/device-id.ts
// Client-side only — generates and persists a device ID in localStorage
// Import dynamically or inside useEffect to avoid SSR issues

const KEY = 'hireme_device_id'

function generateId(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = generateId()
    localStorage.setItem(KEY, id)
  }
  return id
}