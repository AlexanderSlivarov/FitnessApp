import { apiFetch } from './client'

export interface Membership {
  id: number
  name: string
  price: number
  duration: number
  durationType: string   // <-- STRING ENUM
  durationTypeName?: string
  description: string
}

export async function getMemberships(params: {
  name?: string
  price?: number
  duration?: number
  durationType?: string
  page?: number
  pageSize?: number
  sortAsc?: boolean
  orderBy?: string
}) {
  const {
    name = '',
    price = '',
    duration = '',
    durationType = '',
    page = 1,
    pageSize = 10,
    sortAsc = true,
    orderBy = 'Id'
  } = params

  const qs = new URLSearchParams({
    'OrderBy': orderBy,
    'SortAsc': String(sortAsc),
    'Pager.Page': String(page),
    'Pager.PageSize': String(pageSize),
    'Filter.Name': name,
    'Filter.Price': String(price),
    'Filter.Duration': String(duration),
    'Filter.DurationType': durationType ?? ''
  })

  return apiFetch(`/api/Memberships?${qs.toString()}`, { method: 'GET' })
}

export async function createMembership(data: any) {
  const payload = {
    Name: data.name,
    Price: Number(data.price ?? 0),
    Duration: Number(data.duration ?? 1),
    DurationType: data.durationType || "Days", // <-- STRING ENUM
    Description: data.description
  }

  return apiFetch(`/api/Memberships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateMembership(id: number, data: any) {
  const payload = {
    Name: data.name,
    Price: Number(data.price ?? 0),
    Duration: Number(data.duration ?? 1),
    DurationType: data.durationType || "Days", // <-- STRING ENUM
    Description: data.description
  }

  return apiFetch(`/api/Memberships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteMembership(id: number) {
  return apiFetch(`/api/Memberships/${id}`, { method: 'DELETE' })
}
