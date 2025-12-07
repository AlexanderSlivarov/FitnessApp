export const apiBase = import.meta.env.VITE_API_BASE_URL as string

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('fitnessapp_token')
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${apiBase}${path}`, { ...options, headers })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const contentType = res.headers.get('Content-Type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}
