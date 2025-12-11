import { apiBase, apiFetch } from './client'

export interface Studio {
  id: number
  name: string
  location?: string | null
  capacity: number
}

export interface StudioListResponse {
  success: boolean
  data: {
    pager: { page: number; pageSize: number; count?: number }
    items: Studio[]
  }
}

export async function getStudios(params: { page?: number; pageSize?: number; name?: string; location?: string; capacity?: number; sortAsc?: boolean; orderBy?: string }) {
  const { page = 1, pageSize = 10, name, location, capacity, sortAsc = true, orderBy = 'Id' } = params || {}
  const qs = new URLSearchParams({
    'Pager.Page': String(page),
    'Pager.PageSize': String(pageSize),
    'SortAsc': String(sortAsc),
    'OrderBy': orderBy,
  })
  // Always include string filters even if empty to bind Filter object
  qs.append('Filter.Name', name ?? '')
  qs.append('Filter.Location', location ?? '')
  if (capacity !== undefined) qs.append('Filter.Capacity', String(capacity))
  const res: any = await apiFetch(`/api/Studios?${qs.toString()}`)
  return (res?.data ?? res) as StudioListResponse
}

export async function createStudio(studio: { name: string; location?: string | null; capacity: number }) {
  const res = await apiFetch(`/api/Studios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studio),
  })
  return res as any
}

export async function updateStudio(id: number, studio: { name: string; location?: string | null; capacity: number }) {
  const res = await apiFetch(`/api/Studios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studio),
  })
  return res as any
}

export async function deleteStudio(id: number) {
  const res = await apiFetch(`/api/Studios/${id}`, { method: 'DELETE' })
  return res as any
}
