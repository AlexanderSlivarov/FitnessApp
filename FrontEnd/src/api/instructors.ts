import { apiFetch } from './client'

export interface Instructor {
  id: number
  userId: number
  username?: string | null
  fullName?: string | null
  bio?: string | null
  experienceYears: number
}

export interface InstructorListParams {
  page?: number
  pageSize?: number
  experienceYears?: number
  orderBy?: string
  sortAsc?: boolean
}

export async function getInstructors(params: InstructorListParams = {}){
  const qs = new URLSearchParams()
  qs.set('Pager.Page', String(params.page ?? 1))
  qs.set('Pager.PageSize', String(params.pageSize ?? 10))
  qs.set('OrderBy', String(params.orderBy ?? 'Id'))
  qs.set('SortAsc', String(params.sortAsc ?? true))
  if (params.experienceYears !== undefined) qs.set('Filter.ExperienceYears', String(params.experienceYears))
  const res: any = await apiFetch(`/api/Instructors?${qs.toString()}`, { method: 'GET' })
  return res?.data ?? res
}

export async function createInstructor(payload: { userId: number; bio?: string | null; experienceYears: number }){
  return apiFetch('/api/Instructors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateInstructor(id: number, payload: { userId: number; bio?: string | null; experienceYears: number }){
  return apiFetch(`/api/Instructors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteInstructor(id: number){
  return apiFetch(`/api/Instructors/${id}`, { method: 'DELETE' })
}
