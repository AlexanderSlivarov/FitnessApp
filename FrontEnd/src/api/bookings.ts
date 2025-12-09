import { apiFetch } from './client'

export interface Booking {
  id: number
  userId: number
  sessionId: number
  username?: string | null
  userFullName?: string | null
  sessionName?: string | null
  activityName?: string | null
  studioName?: string | null
  status: number
  statusName?: string
}

export interface BookingListParams {
  page?: number
  pageSize?: number
  userId?: number
  sessionId?: number
  status?: number
  orderBy?: string
  sortAsc?: boolean
}

export async function getBookings(params: BookingListParams = {}){
  const qs = new URLSearchParams()
  qs.set('Pager.Page', String(params.page ?? 1))
  qs.set('Pager.PageSize', String(params.pageSize ?? 10))
  qs.set('OrderBy', String(params.orderBy ?? 'Id'))
  qs.set('SortAsc', String(params.sortAsc ?? true))
  if (params.userId !== undefined) qs.set('Filter.UserId', String(params.userId))
  if (params.sessionId !== undefined) qs.set('Filter.SessionId', String(params.sessionId))
  if (params.status !== undefined) qs.set('Filter.Status', String(params.status))
  const res: any = await apiFetch(`/api/Bookings?${qs.toString()}`, { method: 'GET' })
  return res?.data ?? res
}

export async function createBooking(payload: { userId: number; sessionId: number; status: number }){
  return apiFetch('/api/Bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateBooking(id: number, payload: { userId: number; sessionId: number; status: number }){
  return apiFetch(`/api/Bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteBooking(id: number){
  return apiFetch(`/api/Bookings/${id}`, { method: 'DELETE' })
}
