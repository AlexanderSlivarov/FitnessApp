import { apiFetch } from './client';

export interface Equipment {
  id: number;
  studioId: number;
  studioName?: string;
  name: string;
  quantity: number;
  condition: number;   
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
  // Do NOT skip empty values: backend needs Filter object bound
  const qs = new URLSearchParams();
  qs.set('Pager.Page', String(options.page ?? 1));
  qs.set('Pager.PageSize', String(options.pageSize ?? 10));
  qs.set('OrderBy', String(options.orderBy ?? 'Id'));
  qs.set('SortAsc', String(options.sortAsc ?? true));
  qs.set('Filter.Name', options.name ?? '');
  qs.set('Filter.Condition', options.condition !== undefined ? String(options.condition) : '');
  qs.set('Filter.StudioId', options.studioId !== undefined ? String(options.studioId) : '');
  const res = await apiFetch(`/api/Equipments?${qs.toString()}`);
  return res as any; // let pages unwrap .data if present
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
