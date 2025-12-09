import { apiFetch } from './client'

export interface Subscription {
  id: number
  userId: number
  membershipId: number
  username?: string | null
  membershipName?: string | null
  startDate: string
  endDate: string
  status: string
  statusName?: string
}

export interface SubscriptionListParams {
  page?: number
  pageSize?: number
  userId?: number
  membershipId?: number
  status?: number
  orderBy?: string
  sortAsc?: boolean
}

// MUST MATCH BACKEND ENUM
const SubscriptionStatusMap: Record<number, string> = {
  0: "Active",
  1: "Frozen",
  2: "Cancelled"
}

export async function getSubscriptions(params: SubscriptionListParams = {}) {
  const qs = new URLSearchParams()

  qs.set("Pager.Page", String(params.page ?? 1))
  qs.set("Pager.PageSize", String(params.pageSize ?? 10))
  qs.set("OrderBy", params.orderBy ?? "Id")
  qs.set("SortAsc", String(params.sortAsc ?? true))

  if (params.userId !== undefined)
    qs.set("Filter.UserId", String(params.userId))

  if (params.membershipId !== undefined)
    qs.set("Filter.MembershipId", String(params.membershipId))

  if (params.status !== undefined)
    qs.set("Filter.Status", SubscriptionStatusMap[params.status])

  const res: any = await apiFetch(`/api/Subscriptions?${qs}`, { method: "GET" })
  return res?.data ?? res
}

export async function createSubscription(payload: {
  userId: number
  membershipId: number
  startDate: string
  endDate: string
  status: number
}) {
  const body = {
    UserId: Number(payload.userId),
    MembershipId: Number(payload.membershipId),
    StartDate: payload.startDate,
    EndDate: payload.endDate,
    Status: SubscriptionStatusMap[payload.status] || "Active"
  }

  return apiFetch(`/api/Subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
}

export async function updateSubscription(id: number, payload: {
  userId: number
  membershipId: number
  startDate: string
  endDate: string
  status: number
}) {
  const body = {
    UserId: Number(payload.userId),
    MembershipId: Number(payload.membershipId),
    StartDate: payload.startDate,
    EndDate: payload.endDate,
    Status: SubscriptionStatusMap[payload.status] || "Active"
  }

  return apiFetch(`/api/Subscriptions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
}

export async function deleteSubscription(id: number) {
  return apiFetch(`/api/Subscriptions/${id}`, {
    method: "DELETE"
  })
}