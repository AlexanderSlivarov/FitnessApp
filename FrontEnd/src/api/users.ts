import { apiBase } from './client'

export interface User {
  id: number
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  gender?: number | null
  role: number
  createdAt?: string
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
  const res = await fetch(`${apiBase}/api/Users?${qs.toString()}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('fitnessapp_token') || ''}`,
    },
  })
  if (!res.ok) throw new Error(`Users list failed ${res.status}`)
  return res.json() as Promise<UserListResponse>
}

export async function createUser(user: {
  username: string
  password: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  gender?: number | null
}) {
  const res = await fetch(`${apiBase}/api/Users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('fitnessapp_token') || ''}`,
    },
    body: JSON.stringify(user),
  })
  if (!res.ok) throw new Error(`Create user failed ${res.status}`)
  return res.json()
}

export async function updateUser(id: number, user: {
  username: string
  password?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  gender?: number | null
}) {
  const res = await fetch(`${apiBase}/api/Users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('fitnessapp_token') || ''}`,
    },
    body: JSON.stringify(user),
  })
  if (!res.ok) throw new Error(`Update user failed ${res.status}`)
  return res.json()
}

export async function deleteUser(id: number) {
  const res = await fetch(`${apiBase}/api/Users/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('fitnessapp_token') || ''}`,
    },
  })
  if (!res.ok) throw new Error(`Delete user failed ${res.status}`)
  return res.json()
}
