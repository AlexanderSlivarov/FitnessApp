export const apiBase = import.meta.env.VITE_API_BASE_URL as string

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('fitnessapp_token')
  const headers = new Headers(options.headers)
  const method = (options.method || 'GET').toUpperCase()
  // Only set Content-Type for requests that actually send a JSON body
  if (!headers.has('Content-Type') && options.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    headers.set('Content-Type', 'application/json')
  }
  // Ensure GET/DELETE requests do not carry a Content-Type implying a body
  if ((method === 'GET' || method === 'DELETE') && headers.has('Content-Type')) {
    headers.delete('Content-Type')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${apiBase}${path}`, { ...options, headers })
  const contentType = res.headers.get('Content-Type') || ''
  if (!res.ok) {
    let body: any = null
    try {
      if (contentType.includes('application/json')) body = await res.json()
      else body = await res.text()
    } catch {
      body = null
    }
    const fallbackMessage = `API error ${res.status}`
    // Prefer backend-provided text body or JSON message/detail
    const backendMessage = typeof body === 'string' ? body : (body?.message || body?.detail || undefined)
    const err: any = new Error(backendMessage ? String(backendMessage) : fallbackMessage)
    err.status = res.status
    err.data = body
    // normalize possible validation shape
    if (body && typeof body === 'object') {
      err.errors = body.errors || body.detail || body.message ? [{ key: body.title || 'Error', message: body.detail || body.message }] : undefined
    }
    throw err
  }
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}
