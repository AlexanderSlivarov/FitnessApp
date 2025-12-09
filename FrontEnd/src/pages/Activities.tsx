import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Activity, createActivity, deleteActivity, getActivities, updateActivity } from '../api/activities'

export default function Activities(){
	const [items, setItems] = useState<Activity[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [emptyMessage, setEmptyMessage] = useState<string>('No activities')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [count, setCount] = useState(0)
	const [filterName, setFilterName] = useState('')

	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

	async function load(){
		setLoading(true)
		setError(null)
		try{
			const res = await getActivities({ page, pageSize, name: filterName })
			const data = res?.data ?? res
			setItems(data.items || [])
			setCount(data.pager?.count || (data.items?.length ?? 0))
		}catch(e:any){
			const backendMsg = (e?.errors?.[0]?.message) ?? (e?.data?.message) ?? (typeof e?.data === 'string' ? e.data : undefined) ?? e?.message
			setEmptyMessage(String(backendMsg || 'No activities found matching the given criteria.'))
			setError(null)
		}finally{
			setLoading(false)
		}
	}

	useEffect(()=>{ load() }, [page, pageSize])

	const onSearch = (e: FormEvent) => {
		e.preventDefault()
		setPage(1)
		load()
	}

	const [editing, setEditing] = useState<Activity | null>(null)
	const [form, setForm] = useState({ name: '', description: '' as string | null })
	const startCreate = () => { setEditing(null); setForm({ name: '', description: '' }) }
	const startEdit = (a: Activity) => { setEditing(a); setForm({ name: a.name || '', description: a.description ?? '' }) }

	const submitForm = async (e: FormEvent) => {
		e.preventDefault()
		setError(null)
		const formEl = (e.target as HTMLFormElement)
		if (!formEl.checkValidity()) {
			formEl.classList.add('was-validated')
			return
		}
		try{
			if(editing){
				await updateActivity(editing.id, { name: form.name, description: form.description || null })
			}else{
				await createActivity({ name: form.name, description: form.description || null })
			}
			await load()
			;(document.getElementById('activityModalCloseBtn') as HTMLButtonElement)?.click()
		}catch(e:any){
			setError(e.message || 'Save failed')
			setTimeout(()=> setError(null), 4000)
		}
	}

	const [pendingDelete, setPendingDelete] = useState<Activity | null>(null)
	const confirmRemove = (a: Activity) => { setPendingDelete(a); const el = document.getElementById('deleteActivityModal'); if(el) new (window as any).bootstrap.Modal(el).show() }
	const doRemove = async () => {
		if(!pendingDelete) return
		try{
			await deleteActivity(pendingDelete.id)
			setPendingDelete(null)
			await load()
			;(document.getElementById('deleteActivityModalCloseBtn') as HTMLButtonElement)?.click()
		}catch(e:any){ setError(e.message || 'Delete failed') }
	}

	return (
		<div className="container-fluid">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4 className="text-primary m-0">Activities</h4>
				<button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#activityModal" onClick={startCreate}>
					<i className="fas fa-plus"></i> New Activity
				</button>
			</div>

			<form className="card shadow mb-3" onSubmit={onSearch}>
				<div className="card-body row g-3">
					<div className="col-md-4">
						<input className="form-control" placeholder="Name" value={filterName} onChange={e=>setFilterName(e.target.value)} />
					</div>
					<div className="col-md-8 d-flex gap-2">
						<button className="btn btn-outline-primary btn-sm" type="submit"><i className="fas fa-search"></i> <span className="ms-1">Search</span></button>
						<button className="btn btn-outline-secondary btn-sm" type="button" onClick={()=>{setFilterName('');setPage(1);load()}}><i className="fas fa-rotate-left"></i> <span className="ms-1">Reset</span></button>
					</div>
				</div>
			</form>

			<div className="card shadow">
				<div className="card-body p-0">
					{error && <div className="alert alert-danger m-3">{error}</div>}
					<div className="table-responsive">
						<table className="table table-striped table-hover mb-0">
							<thead>
								<tr>
									<th>Id</th>
									<th>Name</th>
									<th>Description</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>
								) : items.length === 0 ? (
									<tr><td colSpan={4} className="text-center p-4">{emptyMessage}</td></tr>
								) : (
									items.map(a => (
										<tr key={a.id}>
											<td>{a.id}</td>
											<td>{a.name}</td>
											<td>{a.description}</td>
											<td className="d-flex gap-2">
												<button className="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#activityModal" onClick={()=>startEdit(a)}>
													<i className="fas fa-edit"></i>
												</button>
												<button className="btn btn-sm btn-outline-danger" onClick={()=>confirmRemove(a)}>
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

			<div className="modal fade" id="activityModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{editing ? 'Edit Activity' : 'New Activity'}</h5>
							<button id="activityModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
									<label className="form-label">Description</label>
									<textarea className="form-control" rows={3} value={form.description ?? ''} onChange={e=>setForm(f=>({...f, description: e.target.value}))} minLength={10}></textarea>
									<div className="invalid-feedback">Description should be at least 10 characters long.</div>
								</div>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
								<button type="submit" className="btn btn-primary">Save</button>
							</div>
						</form>
					</div>
				</div>
			</div>

			<div className="modal fade" id="deleteActivityModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Confirm Delete</h5>
							<button id="deleteActivityModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							{pendingDelete ? (
								<p>Delete activity <strong>{pendingDelete.name}</strong>?</p>
							) : (
								<p>No activity selected.</p>
							)}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
							<button type="button" className="btn btn-danger" onClick={doRemove}>Delete</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}