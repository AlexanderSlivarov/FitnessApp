import { apiBase, apiFetch } from './client'

export interface User {
  id: number
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  gender?: number | null
  role: number | null
  createdAt?: string
  genderName?: string
  roleName?: string
}

export interface Pager {
  page: number
  pageSize: number
  count?: number
}

export interface UserListResponse {
  success: boolean
  data: {
    pager: Pager
    orderBy: string
    sortAsc: boolean
    filter: {
      username?: string
      firstName?: string
      lastName?: string
      phoneNumber?: string
      gender?: number | null
      role?: number | null
    }
    items: User[]
  }
}

export async function getUsers(params: {
  username?: string
  firstName?: string
  lastName?: string
  page?: number
  pageSize?: number
  sortAsc?: boolean
  orderBy?: string
}) {
  const {
    username = '',
    firstName = '',
    lastName = '',
    page = 1,
    pageSize = 10,
    sortAsc = true,
    orderBy = 'Id',
  } = params || {}

  const qs = new URLSearchParams({
    'OrderBy': orderBy,
    'SortAsc': String(sortAsc),
    'Pager.Page': String(page),
    'Pager.PageSize': String(pageSize),
    'Filter.Username': username,
    'Filter.FirstName': firstName,
    'Filter.LastName': lastName,
  })
  const res = await apiFetch(`/api/Users?${qs.toString()}`, { method: 'GET' })
  return res as any
}

export async function createUser(user: {
  username: string
  password: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  gender?: number | null
  role?: number | null
}) {
  const res = await apiFetch(`/api/Users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  return res as any
}

export async function updateUser(id: number, user: {
  username: string
  password?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  gender?: number | null
  role?: number | null
}) {
  const res = await apiFetch(`/api/Users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  return res as any
}

export async function deleteUser(id: number) {
  const res = await apiFetch(`/api/Users/${id}`, { method: 'DELETE' })
  return res as any
}