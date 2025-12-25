import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Booking, getBookings, createBooking, updateBooking, deleteBooking } from '../api/bookings'
import { getUsers, User } from '../api/users'
import { getSessions, Session } from '../api/sessions'

export default function Bookings(){
	const [items, setItems] = useState<Booking[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [emptyMessage, setEmptyMessage] = useState()
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [count, setCount] = useState(0)

	const [users, setUsers] = useState<User[]>([])
	const [sessions, setSessions] = useState<Session[]>([])

	// Filters
	const [filterUserId, setFilterUserId] = useState<number | ''>('')
	const [filterSessionId, setFilterSessionId] = useState<number | ''>('')
	const [filterStatus, setFilterStatus] = useState<number | ''>('')

	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

	// Load bookings
	async function load(){
		setLoading(true)
		setError(null)
		try{
			const res: any = await getBookings({
				page, pageSize,
				userId: filterUserId === '' ? undefined : filterUserId,
				sessionId: filterSessionId === '' ? undefined : filterSessionId,
				status: filterStatus === '' ? undefined : filterStatus,
				orderBy:'Id', sortAsc:true
			})

			const data = res?.data ?? res
			const list = data?.items ?? []
			const count = data?.pager?.count ?? list.length

			setItems(list)
			setCount(count)
		}catch(e:any){
			setItems([])
            setCount(0)
            setError(null)
		}finally{
			setLoading(false)
		}
	}

	useEffect(()=>{ load() }, [page, pageSize])

	// Load users and sessions once
	const [editing, setEditing] = useState<Booking | null>(null)
	const [form, setForm] = useState<{ userId: number | ''; sessionId: number | ''; status: number | '' }>({
		userId: '', sessionId: '', status: ''
	})

	useEffect(()=>{
		(async()=>{
			try{
				const ures:any = await getUsers({ page:1, pageSize:100, orderBy:'Username', sortAsc:true })
				const udata:any = ures?.data ?? ures
				const list = udata?.items ?? []
				setUsers(list)

				if (!editing && (form.userId === '' || form.userId === 0) && list.length){
					setForm(f=>({ ...f, userId: list[0].id }))
				}
			}catch{}

			try{
				const sres:any = await getSessions({ page:1, pageSize:100, orderBy:'Name', sortAsc:true })
				const sdata:any = sres?.data ?? sres
				const listS = sdata?.items ?? []
				setSessions(listS)

				if (!editing && (form.sessionId === '' || form.sessionId === 0) && listS.length){
					setForm(f=>({ ...f, sessionId: listS[0].id }))
				}
			}catch{}
		})()
	}, [])

	const onSearch = (e: FormEvent) => {
		e.preventDefault()
		setPage(1)
		load()
	}

	const startCreate = () => {
		setEditing(null)
		setForm({
			userId: users[0]?.id ?? '',
			sessionId: sessions[0]?.id ?? '',
			status: 0 as any
		})
	}

	const startEdit = (b: Booking) => {
		setEditing(b)
		setForm({
			userId: b.userId,
			sessionId: b.sessionId,
			status: typeof b.status === "number" ? b.status : 0
		})
	}

	const submitForm = async (ev: FormEvent) => {
		ev.preventDefault()
		setError(null)

		const formEl = (ev.target as HTMLFormElement)
		if (!formEl.checkValidity()){
			formEl.classList.add('was-validated')
			return
		}

		try{
			const payload = {
				userId: Number(form.userId),
				sessionId: Number(form.sessionId),
				status: Number(form.status)
			}

			if (!payload.userId){ setError("Please select a user."); return }
			if (!payload.sessionId){ setError("Please select a session."); return }

			if(editing){
				await updateBooking(editing.id, payload)
			}else{
				await createBooking(payload)
			}

			await load()

			;(document.getElementById('bookingModalCloseBtn') as HTMLButtonElement)?.click()

		}catch(e:any){
			setError(e.message || 'Save failed')
			setTimeout(()=> setError(null), 4000)
		}
	}

	// Delete booking
	const [pendingDelete, setPendingDelete] = useState<Booking | null>(null)

	const confirmRemove = (b: Booking) => {
		setPendingDelete(b)
		const el = document.getElementById('deleteBookingModal')
		if(el) new (window as any).bootstrap.Modal(el).show()
	}

	const doRemove = async () => {
		if(!pendingDelete) return
		try{
			await deleteBooking(pendingDelete.id)
			setPendingDelete(null)
			await load()
			;(document.getElementById('deleteBookingModalCloseBtn') as HTMLButtonElement)?.click()
		}catch(e:any){
			setError(e.message || 'Delete failed')
		}
	}

	//---------------------------------------------------------
	// RENDER
	//---------------------------------------------------------

	return (
		<div className="container-fluid">

			{/* HEADER */}
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4 className="text-primary m-0">Bookings</h4>
				<button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#bookingModal" onClick={startCreate}>
					<i className="fas fa-plus"></i> New Booking
				</button>
			</div>

			{/* FILTERS */}
			<form className="card shadow mb-3" onSubmit={onSearch}>
				<div className="card-body">
					<div className="row g-3">

						{/* USER FILTER */}
						<div className="col-12 col-md-4">
							<label className="form-label mb-1 text-secondary">User</label>
							<select
								className="form-select form-select-sm"
								value={filterUserId === '' ? '' : String(filterUserId)}
								onChange={e => setFilterUserId(e.target.value === '' ? '' : Number(e.target.value))}
								style={{ color: filterUserId === '' ? '#6c757d' : undefined }}							>
								
								{users.map(u => (
									<option key={u.id} value={u.id}>{u.username}</option>
								))}
							</select>
						</div>

						{/* SESSION FILTER */}
						<div className="col-12 col-md-4">
							<label className="form-label mb-1 text-secondary">Session</label>
							<select
								className="form-select form-select-sm"
								value={filterSessionId === '' ? '' : String(filterSessionId)}
								onChange={e => setFilterSessionId(e.target.value === '' ? '' : Number(e.target.value))}
								style={{ color: filterSessionId === '' ? '#6c757d' : undefined }}							>
							
								{sessions.map(s => (
									<option key={s.id} value={s.id}>{s.name}</option>
								))}
							</select>
						</div>

						{/* STATUS FILTER */}
						<div className="col-12 col-md-2">
							<label className="form-label mb-1 text-secondary">Status</label>
							<select
								className="form-select form-select-sm"
								value={filterStatus === '' ? '' : String(filterStatus)}
								onChange={e => setFilterStatus(e.target.value === '' ? '' : Number(e.target.value))}
							>								
								<option value="0">Pending</option>
								<option value="1">Confirmed</option>
								<option value="2">Cancelled</option>
							</select>
						</div>

						{/* BUTTONS */}
						<div className="col-12 col-md-2 d-flex gap-2 justify-content-end align-self-end">
							<button className="btn btn-outline-primary btn-sm" type="submit">
								<i className="fas fa-search"></i> Search
							</button>
							<button
								className="btn btn-outline-secondary btn-sm"
								type="button"
								onClick={()=>{
									setFilterUserId('')
									setFilterSessionId('')
									setFilterStatus('')
									setPage(1)
									setTimeout(()=> load(), 0)
								}}
							>
								<i className="fas fa-rotate-left"></i> Reset
							</button>
						</div>

					</div>
				</div>
			</form>

			{/* TABLE */}
			<div className="card shadow">
				<div className="card-body p-0">
					
					{error && <div className="alert alert-danger m-3">{error}</div>}

					<div className="table-responsive">
						<table className="table table-striped table-hover mb-0">
							<thead>
								<tr>
									<th>Id</th>
									<th>User</th>
									<th>Session</th>
									<th>Activity</th>
									<th>Studio</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>

							<tbody>
								{loading ? (
									<tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
								) 									
								 : (
									items.map(b => (
										<tr key={b.id}>
											<td>{b.id}</td>
											<td>{b.username ?? b.userId}</td>
											<td>{b.sessionName ?? b.sessionId}</td>
											<td>{b.activityName}</td>
											<td>{b.studioName}</td>
											<td>{b.statusName ?? b.status}</td>
											<td className="d-flex gap-2">
												<button
													className="btn btn-sm btn-outline-secondary"
													data-bs-toggle="modal"
													data-bs-target="#bookingModal"
													onClick={()=>startEdit(b)}
												>
													<i className="fas fa-edit"></i>
												</button>
												<button
													className="btn btn-sm btn-outline-danger"
													onClick={()=>confirmRemove(b)}
												>
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
						<div className="text-secondary">Page {page} / {totalPages}</div>
						<div className="d-flex align-items-center gap-3 ms-auto">
							<div className="d-flex align-items-center gap-2">
								<label htmlFor="pageSizeSelect" className="text-secondary m-0">Page size</label>
								<select
									id="pageSizeSelect"
									className="form-select form-select-sm"
									value={pageSize}
									onChange={(e)=>{ const size = Number(e.target.value); setPageSize(size); setPage(1); setTimeout(()=>load(),0); }}
								>
									<option value={5}>5</option>
									<option value={10}>10</option>
									<option value={15}>15</option>
									<option value={20}>20</option>
								</select>
							</div>
							<div className="d-flex gap-2">
								<button className="btn btn-outline-secondary btn-sm" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
								<button className="btn btn-outline-secondary btn-sm" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
							</div>
						</div>
					</div>

				</div>
			</div>

			{/* MODAL: CREATE/EDIT */}
			<div className="modal fade" id="bookingModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">

						<div className="modal-header">
							<h5 className="modal-title">{editing ? 'Edit Booking' : 'New Booking'}</h5>
							<button id="bookingModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal"></button>
						</div>

						<form onSubmit={submitForm}>
							<div className="modal-body">
								
								{error && <div className="alert alert-danger">{error}</div>}

								<div className="mb-3">
									<label className="form-label">User</label>
									<select
										className="form-select"
										value={form.userId === '' ? '' : String(form.userId)}
										onChange={e=>setForm(f=>({...f, userId: e.target.value === '' ? '' : Number(e.target.value)}))}
										required
									>
										{users.map(u => (
											<option key={u.id} value={u.id}>{u.username}</option>
										))}
									</select>
								</div>

								<div className="mb-3">
									<label className="form-label">Session</label>
									<select
										className="form-select"
										value={form.sessionId === '' ? '' : String(form.sessionId)}
										onChange={e=>setForm(f=>({...f, sessionId: e.target.value === '' ? '' : Number(e.target.value)}))}
										required
									>
										{sessions.map(s => (
											<option key={s.id} value={s.id}>{s.name}</option>
										))}
									</select>
								</div>

								<div className="mb-3">
									<label className="form-label">Status</label>
									<select
										className="form-select"
										value={form.status === '' ? '' : String(form.status)}
										onChange={e=>setForm(f=>({...f, status: e.target.value === '' ? '' : Number(e.target.value)}))}
										required
									>
										<option value="0">Pending</option>
										<option value="1">Confirmed</option>
										<option value="2">Cancelled</option>
									</select>
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

			{/* DELETE MODAL */}
			<div className="modal fade" id="deleteBookingModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">

						<div className="modal-header">
							<h5 className="modal-title">Confirm Delete</h5>
							<button id="deleteBookingModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal"></button>
						</div>

						<div className="modal-body">
							{pendingDelete ? (
								<p>Delete booking <strong>#{pendingDelete.id}</strong>?</p>
							) : (
								<p>No booking selected.</p>
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
