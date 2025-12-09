import { apiFetch } from './client';

export interface Equipment {
  id: number;
  studioId: number;
  studioName?: string;
  name: string;
  quantity: number;
  condition: number; // enum backend
}

export interface EquipmentFilter {
  name?: string;
  condition?: number;
  studioId?: number;
}

export interface Pager {
  page: number;
  pageSize: number;
  count?: number;
}

export interface EquipmentListResponse {
  items: Equipment[];
  pager: Pager;
  orderBy: string;
  sortAsc: boolean;
  filter: EquipmentFilter;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
  });
  return q.toString();
}

export async function getEquipments(options: {
  page?: number;
  pageSize?: number;
  name?: string;
  condition?: number;
  studioId?: number;
  orderBy?: string;
  sortAsc?: boolean;
} = {}): Promise<EquipmentListResponse> {
  const query = buildQuery({
    'Pager.Page': options.page ?? 1,
    'Pager.PageSize': options.pageSize ?? 10,
    OrderBy: options.orderBy ?? 'Id',
    SortAsc: options.sortAsc ?? true,
    'Filter.Name': options.name,
    'Filter.Condition': options.condition,
    'Filter.StudioId': options.studioId,
  });
  const res = await apiFetch(`/api/Equipments?${query}`);
  return res.data ?? res; // ServiceResult wrapper
}

export async function createEquipment(payload: Omit<Equipment, 'id'>): Promise<Equipment> {
  const res = await apiFetch(`/api/Equipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.success === false && res.errors) {
    const msg = res.errors.map((e: any) => `${e.key ?? 'Error'}: ${e.message}`).join('\n');
    throw new Error(msg || 'Failed to create equipment');
  }
  return res.data ?? res;
}

export async function updateEquipment(id: number, payload: Omit<Equipment, 'id'>): Promise<Equipment> {
  const res = await apiFetch(`/api/Equipments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.success === false && res.errors) {
    const msg = res.errors.map((e: any) => `${e.key ?? 'Error'}: ${e.message}`).join('\n');
    throw new Error(msg || 'Failed to update equipment');
  }
  return res.data ?? res;
}

export async function deleteEquipment(id: number): Promise<void> {
  const res = await apiFetch(`/api/Equipments/${id}`, { method: 'DELETE' });
  if (res.success === false && res.errors) {
    const msg = res.errors.map((e: any) => `${e.key ?? 'Error'}: ${e.message}`).join('\n');
    throw new Error(msg || 'Failed to delete equipment');
  }
}
