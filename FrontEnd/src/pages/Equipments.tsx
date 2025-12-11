import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Equipment, getEquipments, createEquipment, updateEquipment, deleteEquipment } from '../api/equipments'
import { getStudios, Studio } from '../api/studios'

export default function Equipments(){
	const [items, setItems] = useState<Equipment[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [emptyMessage, setEmptyMessage] = useState<string>('No equipment matching given criteria')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [count, setCount] = useState(0)
	const [filterName, setFilterName] = useState('')
 	const [filterCondition, setFilterCondition] = useState<number | ''>('')
	const [filterStudioId, setFilterStudioId] = useState<number | ''>('')

	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

	const [studios, setStudios] = useState<Studio[]>([])
	async function load(){
		setLoading(true)
		setError(null)
		try{
			const res: any = await getEquipments({ page, pageSize, name: filterName, condition: filterCondition === '' ? undefined : filterCondition, studioId: filterStudioId === '' ? undefined : filterStudioId, orderBy: 'Id', sortAsc: true })
			const data = res?.data ?? res
			const items = data?.items ?? []
			const count = data?.pager?.count ?? items.length
			setItems(items)
			setCount(count)
		}catch(e:any){
			setItems([])
			setCount(0)
			const backendMsg = (e?.errors?.[0]?.message) ?? (e?.data?.message) ?? e?.message
			const msg = String(backendMsg || '')
			setEmptyMessage(msg || 'No equipment matching given criteria')
			setError(null)
		}finally{ setLoading(false) }
	}

	useEffect(()=>{ load() }, [page, pageSize])
	const onSearch = (e: FormEvent) => { e.preventDefault(); setPage(1); load() }

	const [editing, setEditing] = useState<Equipment | null>(null)
	const [form, setForm] = useState<{ name: string; quantity: number; condition: number; studioId: number | '' }>({ name: '', quantity: 1, condition: 0, studioId: '' })
	const startCreate = () => { setEditing(null); setForm({ name: '', quantity: 1, condition: 0, studioId: (studios[0]?.id ?? '') }) }
	const startEdit = (e: Equipment) => { setEditing(e); setForm({ name: e.name || '', quantity: e.quantity, condition: typeof e.condition === "number" ? e.condition : 0, studioId: e.studioId }) }

	useEffect(()=>{ (async()=>{ try{ const res:any = await getStudios({ page:1, pageSize:100, orderBy:'Name', sortAsc:true }); const data = res?.data ?? res; const list = data?.items ?? []; setStudios(list); if (!editing && (form.studioId === '' || form.studioId === 0) && list.length){ setForm(f=>({ ...f, studioId: list[0].id })) } } catch{} })() }, [])
	const submitForm = async (ev: FormEvent) => {
		ev.preventDefault()
		setError(null)
		const formEl = (ev.target as HTMLFormElement)
		if (!formEl.checkValidity()) { formEl.classList.add('was-validated'); return }
		try{
			const payload = { ...form, studioId: Number(form.studioId) }
			if (!payload.studioId || payload.studioId <= 0) { setError('Please select a studio.'); return }
			if(editing){ await updateEquipment(editing.id, payload as any) } else { await createEquipment(payload as any) }
			await load()
			;(document.getElementById('equipmentModalCloseBtn') as HTMLButtonElement)?.click()
		}catch(e:any){ setError(e.message || 'Save failed'); setTimeout(()=> setError(null), 4000) }
	}

	const [pendingDelete, setPendingDelete] = useState<Equipment | null>(null)
	const confirmRemove = (e: Equipment) => { setPendingDelete(e); const el = document.getElementById('deleteEquipmentModal'); if(el) new (window as any).bootstrap.Modal(el).show() }
	const doRemove = async () => {
		if(!pendingDelete) return
		try{
			await deleteEquipment(pendingDelete.id)
			setPendingDelete(null)
			await load()
			;(document.getElementById('deleteEquipmentModalCloseBtn') as HTMLButtonElement)?.click()
		}catch(e:any){ setError(e.message || 'Delete failed') }
	}

	return (
		<div className="container-fluid">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4 className="text-primary m-0">Equipments</h4>
				<button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#equipmentModal" onClick={startCreate}>
					<i className="fas fa-plus"></i> New Equipment
				</button>
			</div>

			<form className="card shadow mb-3" onSubmit={onSearch}>
				<div className="card-body">
					<div className="row g-3 align-items-end">
						<div className="col-12 col-md-4">
							<input className="form-control form-control-sm" placeholder="Name" value={filterName} onChange={e=>setFilterName(e.target.value)} />
						</div>
						<div className="col-6 col-md-4">
							<label className="form-label mb-1 text-secondary">Condition</label>
							<select className="form-select form-select-sm" value={filterCondition === '' ? '' : String(filterCondition)}
								onChange={e=>{
									const v = e.target.value;
									setFilterCondition(v === '' ? '' : Number(v))
								}}>
								<option value="0">New</option>
								<option value="1">Excellent</option>
								<option value="2">Good</option>
								<option value="3">Fair</option>
								<option value="4">Poor</option>
								<option value="5">Broken</option>
							</select>
						</div>
						<div className="col-6 col-md-2">
							<label className="form-label mb-1 text-secondary">Studio</label>
							<select className="form-select form-select-sm" value={filterStudioId === '' ? '' : String(filterStudioId)} onChange={e=>setFilterStudioId(e.target.value === '' ? '' : Number(e.target.value))}>
								{studios.map(s => (
									<option key={s.id} value={s.id}>{s.name}</option>
								))}
							</select>
						</div>
						<div className="col-12 col-md-2 d-flex gap-2 justify-content-end">
							<button className="btn btn-outline-primary btn-sm" type="submit"><i className="fas fa-search"></i> <span className="ms-1">Search</span></button>
							<button className="btn btn-outline-secondary btn-sm" type="button" onClick={()=>{ setFilterName(''); setFilterCondition(''); setFilterStudioId(''); setPage(1); setTimeout(()=>{ load() }, 0) }}><i className="fas fa-rotate-left"></i> <span className="ms-1">Reset</span></button>
						</div>
					</div>
				</div>
			</form>

			<div className="card shadow">
				<div className="card-body p-0">
					{error && <div className="alert alert-danger m-3">{error}</div>}
					<div className="table-responsive">
						<table className="table table-striped table-hover mb-0">
							<thead>
								<tr><th>Id</th><th>Name</th><th>Quantity</th><th>Condition</th><th>Studio</th><th>Actions</th></tr>
							</thead>
							<tbody>
								{loading ? (
									<tr><td colSpan={6} className="text-center p-4">Loading...</td></tr>
								) : items.length === 0 ? (
									<tr>
										<td colSpan={6} className="text-center p-4">{emptyMessage}</td>
									</tr>
								) : (
									items.map(e => (
										<tr key={e.id}>
											<td>{e.id}</td>
											<td>{e.name}</td>
											<td>{e.quantity}</td>
											<td>{['New','Excellent','Good','Fair','Poor','Broken'][e.condition] ?? e.condition}</td>
											  <td>{e.studioName ?? e.studioId}</td>
											<td className="d-flex justify-content-center gap-3">
												<button className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#equipmentModal" onClick={()=>startEdit(e)}>
													<i className="fas fa-edit"></i>
												</button>
												<button className="btn btn-outline-danger" onClick={()=>confirmRemove(e)}>
													<i className="fas fa-trash"></i>
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
					<div className="d-flex justify-content-between align-items-center p-3">
						<div>Page {page} / {totalPages}</div>
						<div className="d-flex gap-2">
							<button className="btn btn-outline-secondary" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
							<button className="btn btn-outline-secondary" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
						</div>
					</div>
				</div>
			</div>

			<div className="modal fade" id="equipmentModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog"><div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{editing ? 'Edit Equipment' : 'New Equipment'}</h5>
						<button id="equipmentModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<form onSubmit={submitForm}>
						<div className="modal-body">
							{error && <div className="alert alert-danger">{error}</div>}
							<div className="mb-3">
								<label className="form-label">Name</label>
								<input className="form-control" value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} required minLength={3} />
								<div className="invalid-feedback">Name must be at least 3 characters.</div>
							</div>
							<div className="mb-3">
								<label className="form-label">Quantity</label>
								<input type="number" className="form-control" value={form.quantity} onChange={e=>setForm(f=>({...f, quantity: Number(e.target.value)}))} required min={0} />
								<div className="invalid-feedback">Quantity is required and must be &gt;= 0.</div>
							</div>
							<div className="mb-3">
								<label className="form-label">Condition</label>
								<select className="form-select" value={String(form.condition)} onChange={e=>setForm(f=>({...f, condition: Number(e.target.value)}))} required>
									<option value="0">New</option>
									<option value="1">Excellent</option>
									<option value="2">Good</option>
									<option value="3">Fair</option>
									<option value="4">Poor</option>
									<option value="5">Broken</option>
								</select>
							</div>
							<div className="mb-3">
								<label className="form-label">Studio</label>
								<select className="form-select" value={form.studioId === '' ? '' : String(form.studioId)} onChange={e=>setForm(f=>({...f, studioId: e.target.value === '' ? '' : Number(e.target.value)}))} required>
									{studios.map(s => (
										<option key={s.id} value={s.id}>{s.name}</option>
									))}
								</select>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="submit" className="btn btn-primary">Save</button>
						</div>
					</form>
				</div></div>
			</div>

			<div className="modal fade" id="deleteEquipmentModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog"><div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Confirm Delete</h5>
						<button id="deleteEquipmentModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div className="modal-body">
						{pendingDelete ? (<p>Delete equipment <strong>{pendingDelete.name}</strong>?</p>) : (<p>No equipment selected.</p>)}
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" className="btn btn-danger" onClick={doRemove}>Delete</button>
					</div>
				</div></div>
			</div>
		</div>
	)
}