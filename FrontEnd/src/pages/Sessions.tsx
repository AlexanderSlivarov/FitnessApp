import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Session, getSessions, createSession, updateSession, deleteSession } from '../api/sessions'
import { getActivities, Activity } from '../api/activities'
import { getStudios, Studio } from '../api/studios'
import { getInstructors, Instructor } from '../api/instructors'

export default function Sessions(){
	const [items, setItems] = useState<Session[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [emptyMessage, setEmptyMessage] = useState<string>('No sessions found matching the given criteria.')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [count, setCount] = useState(0)

	const [activities, setActivities] = useState<Activity[]>([])
	const [studios, setStudios] = useState<Studio[]>([])
	const [instructors, setInstructors] = useState<Instructor[]>([])

	const [filterActivityId, setFilterActivityId] = useState<number | ''>('')
	const [filterInstructorId, setFilterInstructorId] = useState<number | ''>('')
	const [filterStudioId, setFilterStudioId] = useState<number | ''>('')
	const [filterName, setFilterName] = useState<string>('')
	const [filterDate, setFilterDate] = useState<string>('')

	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

	async function load(){
		setLoading(true)
		setError(null)
		try{
			const res: any = await getSessions({
				page, pageSize,
				activityId: filterActivityId === '' ? undefined : filterActivityId,
				instructorId: filterInstructorId === '' ? undefined : filterInstructorId,
				studioId: filterStudioId === '' ? undefined : filterStudioId,
				name: filterName || undefined,
				date: filterDate || undefined,
				orderBy:'Id', sortAsc:true
			})
			const data = res?.data ?? res
			const items = data?.items ?? []
			const count = data?.pager?.count ?? items.length
			setItems(items)
			setCount(count)
		}catch(e:any){
			setItems([])
			setCount(0)
			const backendMsg = (e?.errors?.[0]?.message) ?? (e?.data?.message) ?? (typeof e?.data === 'string' ? e.data : undefined) ?? e?.message
			setEmptyMessage(String(backendMsg || 'No sessions found matching the given criteria.'))
			setError(null)
		}finally{ setLoading(false) }
	}

	useEffect(()=>{ load() }, [page, pageSize])
	useEffect(()=>{ (async()=>{
		try{
			const ares:any = await getActivities({ page:1, pageSize:100, orderBy:'Name', sortAsc:true })
			const adata:any = ares?.data ?? ares
			const listA = adata?.items ?? []
			setActivities(listA)
			if (!editing && (form.activityId === '' || form.activityId === 0) && listA.length){ setForm(f=>({ ...f, activityId: listA[0].id })) }
		}catch{}
		try{
			const sres:any = await getStudios({ page:1, pageSize:100, orderBy:'Name', sortAsc:true })
			const sdata:any = sres?.data ?? sres
			const listS = sdata?.items ?? []
			setStudios(listS)
			if (!editing && (form.studioId === '' || form.studioId === 0) && listS.length){ setForm(f=>({ ...f, studioId: listS[0].id })) }
		}catch{}
		try{
			const ires:any = await getInstructors({ page:1, pageSize:100, orderBy:'Id', sortAsc:true })
			const idata:any = ires?.data ?? ires
			const listI = idata?.items ?? []
			setInstructors(listI)
			if (!editing && (form.instructorId === '' || form.instructorId === 0) && listI.length){ setForm(f=>({ ...f, instructorId: listI[0].id })) }
		}catch{}
	})() }, [])

	const onSearch = (e: FormEvent) => { e.preventDefault(); setPage(1); load() }

	const [editing, setEditing] = useState<Session | null>(null)
	const [form, setForm] = useState<{ name: string; activityId: number | ''; instructorId: number | ''; studioId: number | ''; date: string; startTime: string; duration: number | ''; minParticipants: number | ''; difficulty: number | '' }>({ name: '', activityId: '', instructorId: '', studioId: '', date: '', startTime: '', duration: '', minParticipants: '', difficulty: '' })
	const startCreate = () => { setEditing(null); setForm({ name: '', activityId: activities[0]?.id ?? '', instructorId: instructors[0]?.id ?? '', studioId: studios[0]?.id ?? '', date: '', startTime: '', duration: '', minParticipants: '', difficulty: 0 as any }) }
	const startEdit = (s: Session) => {
		setEditing(s)
		setForm({ name: s.name, activityId: s.activityId, instructorId: s.instructorId, studioId: s.studioId, date: s.date, startTime: s.startTime, duration: s.duration, minParticipants: s.minParticipants, difficulty: s.difficulty })
	}

	const submitForm = async (ev: FormEvent) => {
		ev.preventDefault()
		setError(null)
		const formEl = (ev.target as HTMLFormElement)
		if (!formEl.checkValidity()) { formEl.classList.add('was-validated'); return }
		try{
			const payload = {
				name: form.name,
				activityId: Number(form.activityId),
				instructorId: Number(form.instructorId),
				studioId: Number(form.studioId),
				date: form.date,
				startTime: form.startTime,
				duration: Number(form.duration),
				minParticipants: Number(form.minParticipants),
				difficulty: Number(form.difficulty)
			}
			if (!payload.activityId || payload.activityId <= 0) { setError('Please select an activity.'); return }
			if (!payload.instructorId || payload.instructorId <= 0) { setError('Please select an instructor.'); return }
			if (!payload.studioId || payload.studioId <= 0) { setError('Please select a studio.'); return }
			if(editing){ await updateSession(editing.id, payload) } else { await createSession(payload) }
			await load()
			;(document.getElementById('sessionModalCloseBtn') as HTMLButtonElement)?.click()
		}catch(e:any){ setError(e.message || 'Save failed'); setTimeout(()=> setError(null), 4000) }
	}

	const [pendingDelete, setPendingDelete] = useState<Session | null>(null)
	const confirmRemove = (s: Session) => { setPendingDelete(s); const el = document.getElementById('deleteSessionModal'); if(el) new (window as any).bootstrap.Modal(el).show() }
	const doRemove = async () => {
		if(!pendingDelete) return
		try{
			await deleteSession(pendingDelete.id)
			setPendingDelete(null)
			await load()
			;(document.getElementById('deleteSessionModalCloseBtn') as HTMLButtonElement)?.click()
		}catch(e:any){ setError(e.message || 'Delete failed') }
	}

	return (
		<div className="container-fluid">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4 className="text-primary m-0">Sessions</h4>
				<button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#sessionModal" onClick={startCreate}>
					<i className="fas fa-plus"></i> New Session
				</button>
			</div>

			<form className="card shadow mb-3" onSubmit={onSearch}>
				<div className="card-body">
					<div className="row g-3 align-items-end">
						<div className="col-12 col-md-3">
							<label className="form-label text-muted mb-1">Activity</label>
							<select className="form-select form-select-sm" value={filterActivityId === '' ? '' : String(filterActivityId)} onChange={e=>setFilterActivityId(e.target.value === '' ? '' : Number(e.target.value))}>
								{activities.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
							</select>
						</div>
						<div className="col-6 col-md-3">
							<label className="form-label text-muted mb-1">Instructor</label>
							<select className="form-select form-select-sm" value={filterInstructorId === '' ? '' : String(filterInstructorId)} onChange={e=>setFilterInstructorId(e.target.value === '' ? '' : Number(e.target.value))}>
								{instructors.map(i => (<option key={i.id} value={i.id}>{i.username}</option>))}
							</select>
						</div>
						<div className="col-6 col-md-3">
							<label className="form-label text-muted mb-1">Studio</label>
							<select className="form-select form-select-sm" value={filterStudioId === '' ? '' : String(filterStudioId)} onChange={e=>setFilterStudioId(e.target.value === '' ? '' : Number(e.target.value))}>
								{studios.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
							</select>
						</div>
						<div className="col-12 col-md-3 d-flex align-items-end">
							<input id="fltName" type="text" className="form-control form-control-sm" placeholder="Name" value={filterName} onChange={e=>setFilterName(e.target.value)} style={{ color: filterName ? undefined : '#6c757d' }} />
						</div>
					</div>
					<div className="row g-3 align-items-end mt-1">
						<div className="col-12 col-md-3">
							<input id="fltDate" type="date" className="form-control form-control-sm" placeholder="Date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} style={{ color: filterDate ? undefined : '#6c757d' }} />
						</div>
						<div className="col-12 col-md-3"></div>
						<div className="col-12 col-md-3"></div>
						<div className="col-12 col-md-3 d-flex gap-2 justify-content-end align-items-end">
							<button className="btn btn-outline-primary btn-sm" type="submit" title="Search"><i className="fas fa-search"></i> <span className="ms-1">Search</span></button>
							<button className="btn btn-outline-secondary btn-sm" type="button" title="Reset" onClick={()=>{ setFilterActivityId(''); setFilterInstructorId(''); setFilterStudioId(''); setFilterName(''); setFilterDate(''); setPage(1); load() }}><i className="fas fa-rotate-left"></i> <span className="ms-1">Reset</span></button>
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
								<tr><th>Id</th><th>Name</th><th>Activity</th><th>Instructor</th><th>Studio</th><th>Date</th><th>Start</th><th>Duration</th><th>Min</th><th>Difficulty</th><th>Actions</th></tr>
							</thead>
							<tbody>
								{loading ? (
									<tr><td colSpan={11} className="text-center p-4">Loading...</td></tr>
								) : items.length === 0 ? (
									<tr>
										<td colSpan={11} className="text-center p-4">{emptyMessage}</td>
									</tr>
								) : (
									items.map(s => (
										<tr key={s.id}>
											<td>{s.id}</td>
											<td>{s.name}</td>
											<td>{s.activityName ?? s.activityId}</td>
											<td>{s.instructorName ?? s.instructorId}</td>
											<td>{s.studioName ?? s.studioId}</td>
											<td>{s.date}</td>
											<td>{s.startTime}</td>
											<td>{s.duration}</td>
											<td>{s.minParticipants}</td>
											<td>{s.difficultyName ?? s.difficulty}</td>
											<td className="d-flex gap-2">
												<button className="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#sessionModal" onClick={()=>startEdit(s)}>
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

			<div className="modal fade" id="sessionModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog modal-lg"><div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{editing ? 'Edit Session' : 'New Session'}</h5>
						<button id="sessionModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<form onSubmit={submitForm}>
						<div className="modal-body">
							{error && <div className="alert alert-danger">{error}</div>}
							<div className="row g-3">
								<div className="col-md-6">
									<label className="form-label">Name</label>
									<input className="form-control" value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} required />
								</div>
								<div className="col-md-6">
									<label className="form-label">Activity</label>
									<select className="form-select" value={form.activityId === '' ? '' : String(form.activityId)} onChange={e=>setForm(f=>({...f, activityId: e.target.value === '' ? '' : Number(e.target.value)}))} required>
										{activities.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
									</select>
								</div>
							</div>
							<div className="row g-3 mt-1">
								<div className="col-md-6">
									<label className="form-label">Instructor</label>
									<select className="form-select" value={form.instructorId === '' ? '' : String(form.instructorId)} onChange={e=>setForm(f=>({...f, instructorId: e.target.value === '' ? '' : Number(e.target.value)}))} required>
										{instructors.map(i => (<option key={i.id} value={i.id}>{i.username}</option>))}
									</select>
								</div>
								<div className="col-md-6">
									<label className="form-label">Studio</label>
									<select className="form-select" value={form.studioId === '' ? '' : String(form.studioId)} onChange={e=>setForm(f=>({...f, studioId: e.target.value === '' ? '' : Number(e.target.value)}))} required>
										{studios.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
									</select>
								</div>
							</div>
							<div className="row g-3 mt-1">
								<div className="col-md-6">
									<label className="form-label">Date</label>
									<input type="date" className="form-control" value={form.date} onChange={e=>setForm(f=>({...f, date: e.target.value}))} required />
								</div>
								<div className="col-md-6">
									<label className="form-label">Start time</label>
									<input type="time" className="form-control" value={form.startTime} onChange={e=>setForm(f=>({...f, startTime: e.target.value}))} required />
								</div>
							</div>
							<div className="row g-3 mt-1">
								<div className="col-md-6">
									<label className="form-label">Duration (minutes)</label>
									<input type="number" min={1} className="form-control" value={form.duration} onChange={e=>setForm(f=>({...f, duration: e.target.value === '' ? '' : Number(e.target.value)}))} required />
								</div>
								<div className="col-md-6">
									<label className="form-label">Min participants</label>
									<input type="number" min={1} className="form-control" value={form.minParticipants} onChange={e=>setForm(f=>({...f, minParticipants: e.target.value === '' ? '' : Number(e.target.value)}))} required />
								</div>
							</div>
							<div className="row g-3 mt-1">
								<div className="col-md-6">
									<label className="form-label">Difficulty</label>
									<select className="form-select" value={form.difficulty === '' ? '' : String(form.difficulty)} onChange={e=>setForm(f=>({...f, difficulty: e.target.value === '' ? '' : Number(e.target.value)}))} required>
										<option value="0">Beginner</option>
										<option value="1">Intermediate</option>
										<option value="2">Advanced</option>
									</select>
								</div>
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

			<div className="modal fade" id="deleteSessionModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Confirm Delete</h5>
							<button id="deleteSessionModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							{pendingDelete ? (<p>Delete session <strong>{pendingDelete.name}</strong>?</p>) : (<p>No session selected.</p>)}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
							<button type="button" className="btn btn-danger" onClick={doRemove}>Delete</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
