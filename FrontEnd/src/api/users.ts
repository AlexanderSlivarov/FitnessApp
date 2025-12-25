import { apiFetch } from './client'

export interface User {
  id: number
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  gender?: number | null
  role?: number | null
  createdAt?: string
  genderName?: string
  roleName?: string
}

export async function getUsers(params: {
  username?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  gender?: number | null
  role?: number | null
  page?: number
  pageSize?: number
  sortAsc?: boolean
  orderBy?: string
}) {
  const {
    username = '',
    firstName = '',
    lastName = '',
    phoneNumber = '',
    gender = null,
    role = null,
    page = 1,
    pageSize = 10,
    sortAsc = true,
    orderBy = 'Id',
  } = params || {}

  const qs = new URLSearchParams({
    OrderBy: orderBy,
    SortAsc: String(sortAsc),
    'Pager.Page': String(page),
    'Pager.PageSize': String(pageSize),    
    'Filter.Username': username,    
    'Filter.FirstName': firstName,
    'Filter.LastName': lastName,
    'Filter.PhoneNumber': phoneNumber,
  })  
  
  if (gender !== null) {
    qs.append('Filter.Gender', String(gender))
  }

  if (role !== null) {
    qs.append('Filter.Role', String(role))
  }

  return apiFetch(`/api/Users?${qs.toString()}`, { method: 'GET' }) as any
}

export async function createUser(user: any) {
  return apiFetch(`/api/Users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  }) as any
}

export async function updateUser(id: number, user: any) {
  return apiFetch(`/api/Users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  }) as any
}

export async function deleteUser(id: number) {
  return apiFetch(`/api/Users/${id}`, { method: 'DELETE' }) as any
}
