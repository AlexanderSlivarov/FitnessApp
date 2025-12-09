import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Instructor, getInstructors, createInstructor, updateInstructor, deleteInstructor } from '../api/instructors'
import { getUsers, User } from '../api/users'

export default function Instructors(){
	const [items, setItems] = useState<Instructor[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [emptyMessage, setEmptyMessage] = useState<string>('No instructors found matching the given criteria.')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [count, setCount] = useState(0)

	const [filterExperienceYears, setFilterExperienceYears] = useState<number | ''>('')
	const [users, setUsers] = useState<User[]>([])
	const availableUsers = useMemo(()=>{
		const usedIds = new Set(items.map(i=>i.userId))
		return users.filter(u=> !usedIds.has(u.id))
	}, [users, items])


	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

	async function load(){
		setLoading(true)
		setError(null)
		try{
			const res: any = await getInstructors({ page, pageSize, experienceYears: filterExperienceYears === '' ? undefined : filterExperienceYears, orderBy: 'Id', sortAsc: true })
			const data = res?.data ?? res
			const items = data?.items ?? []
			const count = data?.pager?.count ?? items.length
			setItems(items)
			setCount(count)
		}catch(e:any){
			setItems([])
			setCount(0)
			const backendMsg = (e?.errors?.[0]?.message) ?? (e?.data?.message) ?? (typeof e?.data === 'string' ? e.data : undefined) ?? e?.message
			setEmptyMessage(String(backendMsg || 'No instructors found matching the given criteria.'))
			setError(null)
		}finally{ setLoading(false) }
	}

	useEffect(()=>{ load() }, [page, pageSize])
	useEffect(()=>{ (async()=>{ try{ const ures:any = await getUsers({ page:1, pageSize:100, orderBy:'Username', sortAsc:true }); const udata = ures?.data ?? ures; setUsers(udata?.items ?? []); } catch{} })() }, [])

	const onSearch = (e: FormEvent) => { e.preventDefault(); setPage(1); load() }

	const [editing, setEditing] = useState<Instructor | null>(null)
	const [form, setForm] = useState<{ userId: number | ''; bio: string; experienceYears: number | '' }>({ userId: '', bio: '', experienceYears: '' })
	const startCreate = () => { setEditing(null); setForm({ userId: availableUsers[0]?.id ?? '', bio: '', experienceYears: '' }) }
	const startEdit = (ins: Instructor) => { setEditing(ins); setForm({ userId: ins.userId, bio: ins.bio || '', experienceYears: ins.experienceYears }) }

	const submitForm = async (ev: FormEvent) => {
		ev.preventDefault()
		setError(null)
		const formEl = (ev.target as HTMLFormElement)
		if (!formEl.checkValidity()) { formEl.classList.add('was-validated'); return }
		try{
			const payload = { userId: Number(form.userId), bio: form.bio || null, experienceYears: Number(form.experienceYears) }
			if(editing){ await updateInstructor(editing.id, payload) } else { await createInstructor(payload) }
			await load()
			;(document.getElementById('instructorModalCloseBtn') as HTMLButtonElement)?.click()
		}catch(e:any){ setError(e.message || 'Save failed'); setTimeout(()=> setError(null), 4000) }
	}

	const [pendingDelete, setPendingDelete] = useState<Instructor | null>(null)
	const confirmRemove = (s: Instructor) => { setPendingDelete(s); const el = document.getElementById('deleteInstructorModal'); if(el) new (window as any).bootstrap.Modal(el).show() }
	const doRemove = async () => {
		if(!pendingDelete) return
		try{
			await deleteInstructor(pendingDelete.id)
			setPendingDelete(null)
			await load()
			;(document.getElementById('deleteInstructorModalCloseBtn') as HTMLButtonElement)?.click()
		}catch(e:any){ setError(e.message || 'Delete failed') }
	}

	return (
		<div className="container-fluid">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4 className="text-primary m-0">Instructors</h4>
				<button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#instructorModal" onClick={startCreate}>
					<i className="fas fa-plus"></i> New Instructor
				</button>
			</div>

			<form className="card shadow mb-3" onSubmit={onSearch}>
				<div className="card-body">
					<div className="row g-2 align-items-center">
						<div className="col-12 col-md-4">
							<label className="form-label mb-1 text-secondary">Experience years</label>
							<input type="number" min={0} className="form-control form-control-sm" placeholder="" value={filterExperienceYears === '' ? '' : String(filterExperienceYears)} onChange={e=>setFilterExperienceYears(e.target.value === '' ? '' : Number(e.target.value))} />
						</div>
						<div className="col-12 col-md-2 d-flex gap-2 justify-content-end ms-auto">
							<button className="btn btn-outline-primary btn-sm" type="submit"><i className="fas fa-search"></i> <span className="ms-1">Search</span></button>
							<button className="btn btn-outline-secondary btn-sm" type="button" onClick={()=>{ setFilterExperienceYears(''); setPage(1); setTimeout(()=>{ load() }, 0) }}><i className="fas fa-rotate-left"></i> <span className="ms-1">Reset</span></button>
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
								<tr><th>Id</th><th>Username</th><th>Full Name</th><th>Experience</th><th>Bio</th><th>Actions</th></tr>
							</thead>
							<tbody>
								{loading ? (
									<tr><td colSpan={6} className="text-center p-4">Loading...</td></tr>
								) : items.length === 0 ? (
									<tr>
										<td colSpan={6} className="text-center p-4">{emptyMessage}</td>
									</tr>
								) : (
									items.map(s => (
										<tr key={s.id}>
											<td>{s.id}</td>
											<td>{s.username ?? s.userId}</td>
											<td>{s.fullName}</td>
											<td>{s.experienceYears}</td>
											<td>{s.bio}</td>
											<td className="d-flex gap-2">
												<button className="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#instructorModal" onClick={()=>startEdit(s)}>
													<i className="fas fa-edit"></i>
												</button>
												<button className="btn btn-sm btn-outline-danger" onClick={()=>confirmRemove(s)}>
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

			<div className="modal fade" id="instructorModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog"><div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{editing ? 'Edit Instructor' : 'New Instructor'}</h5>
						<button id="instructorModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<form onSubmit={submitForm}>
						<div className="modal-body">
							{error && <div className="alert alert-danger">{error}</div>}
							<div className="mb-3">
								<label className="form-label">User</label>
								<select className="form-select" value={form.userId === '' ? '' : String(form.userId)} onChange={e=>setForm(f=>({...f, userId: e.target.value === '' ? '' : Number(e.target.value)}))} required>
									{availableUsers.map(u => (<option key={u.id} value={u.id}>{u.username}</option>))}
								</select>
							</div>
							<div className="mb-3">
								<label className="form-label">Experience (years)</label>
								<input type="number" min={0} className="form-control" value={form.experienceYears} onChange={e=>setForm(f=>({...f, experienceYears: e.target.value === '' ? '' : Number(e.target.value)}))} required />
							</div>
							<div className="mb-3">
								<label className="form-label">Bio</label>
								<textarea className="form-control" value={form.bio} onChange={e=>setForm(f=>({...f, bio: e.target.value}))} />
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="submit" className="btn btn-primary">Save</button>
						</div>
					</form>
				</div></div>
			</div>

			<div className="modal fade" id="deleteInstructorModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog"><div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Confirm Delete</h5>
						<button id="deleteInstructorModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div className="modal-body">
						{pendingDelete ? (<p>Delete instructor <strong>#{pendingDelete.id}</strong> ({pendingDelete.username})?</p>) : (<p>No instructor selected.</p>)}
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
