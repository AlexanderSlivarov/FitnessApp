import { apiBase, apiFetch } from './client'

export interface Activity {
  id: number
  name: string
  description?: string | null
}

export interface ActivityListResponse {
  success: boolean
  data: {
    pager: { page: number; pageSize: number; count?: number }
    items: Activity[]
  }
}

export async function getActivities(params: { page?: number; pageSize?: number; name?: string; sortAsc?: boolean; orderBy?: string }) {
  const { page = 1, pageSize = 10, name = '', sortAsc = true, orderBy = 'Id' } = params || {}
  const qs = new URLSearchParams({
    'Pager.Page': String(page),
    'Pager.PageSize': String(pageSize),
    'Filter.Name': name,
    'SortAsc': String(sortAsc),
    'OrderBy': orderBy,
  })
  const res = await apiFetch(`/api/Activities?${qs.toString()}`, { method: 'GET' })
  return res as any
}

export async function createActivity(activity: { name: string; description?: string | null }) {
  const res = await apiFetch(`/api/Activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  })
  return res as any
}

export async function updateActivity(id: number, activity: { name: string; description?: string | null }) {
  const res = await apiFetch(`/api/Activities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  })
  return res as any
}

export async function deleteActivity(id: number) {
  const res = await apiFetch(`/api/Activities/${id}`, { method: 'DELETE' })
  return res as any
}
