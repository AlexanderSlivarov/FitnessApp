import { apiFetch } from './client'

export interface Session {
  id: number
  instructorId: number
  studioId: number
  activityId: number
  instructorName?: string | null
  studioName?: string | null
  activityName?: string | null
  name: string
  startTime: string
  duration: number
  date: string
  minParticipants: number
  difficulty: number
  difficultyName?: string
}

export interface SessionListParams {
  page?: number
  pageSize?: number
  instructorId?: number
  studioId?: number
  activityId?: number
  name?: string
  date?: string
  orderBy?: string
  sortAsc?: boolean
}

export async function getSessions(params: SessionListParams = {}){
  const qs = new URLSearchParams()
  qs.set('Pager.Page', String(params.page ?? 1))
  qs.set('Pager.PageSize', String(params.pageSize ?? 10))
  qs.set('OrderBy', String(params.orderBy ?? 'Id'))
  qs.set('SortAsc', String(params.sortAsc ?? true))
  if (params.instructorId !== undefined) qs.set('Filter.InstructorId', String(params.instructorId))
  if (params.studioId !== undefined) qs.set('Filter.StudioId', String(params.studioId))
  if (params.activityId !== undefined) qs.set('Filter.ActivityId', String(params.activityId))
  if (params.name) qs.set('Filter.Name', params.name)
  if (params.date) qs.set('Filter.Date', params.date)
  const res: any = await apiFetch(`/api/Sessions?${qs.toString()}`, { method: 'GET' })
  return res?.data ?? res
}

export async function createSession(payload: {
  instructorId: number
  studioId: number
  activityId: number
  name: string
  startTime: string
  duration: number
  date: string
  minParticipants: number
  difficulty: number
}){
  return apiFetch('/api/Sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateSession(id: number, payload: {
  instructorId: number
  studioId: number
  activityId: number
  name: string
  startTime: string
  duration: number
  date: string
  minParticipants: number
  difficulty: number
}){
  return apiFetch(`/api/Sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteSession(id: number){
  return apiFetch(`/api/Sessions/${id}`, { method: 'DELETE' })
}
