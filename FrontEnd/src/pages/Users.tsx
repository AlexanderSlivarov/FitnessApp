import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createUser, deleteUser, getUsers, updateUser, User } from '../api/users'

export default function Users() {
	const [items, setItems] = useState<User[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [count, setCount] = useState(0)
	const [filterUsername, setFilterUsername] = useState('')
	const [filterFirstName, setFilterFirstName] = useState('')
	const [filterLastName, setFilterLastName] = useState('')

	const [editing, setEditing] = useState<User | null>(null)
	const [form, setForm] = useState({
		username: '',
		password: '',
		firstName: '',
		lastName: '',
		phoneNumber: '',
		gender: null as number | null,
	})

	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

	async function load() {
		setLoading(true)
		setError(null)
		try {
			const res = await getUsers({
				username: filterUsername,
				firstName: filterFirstName,
				lastName: filterLastName,
				page,
				pageSize,
				sortAsc: true,
				orderBy: 'Id',
			})
			setItems(res.data.items || [])
			setCount(res.data.pager?.count || 0)
		} catch (e: any) {
			setError(e.message || 'Failed to load users')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [page, pageSize])

	const onSearch = (e: FormEvent) => {
		e.preventDefault()
		setPage(1)
		load()
	}

	const startCreate = () => {
		setEditing(null)
		setForm({ username: '', password: '', firstName: '', lastName: '', phoneNumber: '', gender: null })
	}

	const startEdit = (u: User) => {
		setEditing(u)
		setForm({
			username: u.username || '',
			password: '',
			firstName: u.firstName || '',
			lastName: u.lastName || '',
			phoneNumber: u.phoneNumber || '',
			gender: (u.gender ?? null) as number | null,
		})
	}

	const submitForm = async (e: FormEvent) => {
		e.preventDefault()
		setError(null)
		try {
			if (editing) {
				await updateUser(editing.id, {
					username: form.username,
					password: form.password || undefined,
					firstName: form.firstName,
					lastName: form.lastName,
					phoneNumber: form.phoneNumber,
					gender: form.gender,
				})
			} else {
				await createUser({
					username: form.username,
					password: form.password,
					firstName: form.firstName,
					lastName: form.lastName,
					phoneNumber: form.phoneNumber,
					gender: form.gender,
				})
			}
			await load()
			;(document.getElementById('userModalCloseBtn') as HTMLButtonElement)?.click()
		} catch (e: any) {
			setError(e.message || 'Save failed')
		}
	}

	const remove = async (u: User) => {
		if (!confirm(`Delete user ${u.username}?`)) return
		try {
			await deleteUser(u.id)
			await load()
		} catch (e: any) {
			setError(e.message || 'Delete failed')
		}
	}

	return (
		<div className="container-fluid">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4 className="text-primary m-0">Users</h4>
				<button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#userModal" onClick={startCreate}>
					<i className="fas fa-plus"></i> New User
				</button>
			</div>

			<form className="card shadow mb-3" onSubmit={onSearch}>
				<div className="card-body row g-3">
					<div className="col-md-3">
						<input className="form-control" placeholder="Username" value={filterUsername} onChange={e=>setFilterUsername(e.target.value)} />
					</div>
					<div className="col-md-3">
						<input className="form-control" placeholder="First name" value={filterFirstName} onChange={e=>setFilterFirstName(e.target.value)} />
					</div>
					<div className="col-md-3">
						<input className="form-control" placeholder="Last name" value={filterLastName} onChange={e=>setFilterLastName(e.target.value)} />
					</div>
					<div className="col-md-3 d-flex gap-2">
						<button className="btn btn-outline-primary" type="submit"><i className="fas fa-search"></i> Search</button>
						<button className="btn btn-outline-secondary" type="button" onClick={()=>{setFilterUsername('');setFilterFirstName('');setFilterLastName('');setPage(1);load()}}>Reset</button>
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
									<th>Username</th>
									<th>First</th>
									<th>Last</th>
									<th>Phone</th>
									<th>Role</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
								) : items.length === 0 ? (
									<tr><td colSpan={7} className="text-center p-4">No users</td></tr>
								) : (
									items.map(u => (
										<tr key={u.id}>
											<td>{u.id}</td>
											<td>{u.username}</td>
											<td>{u.firstName}</td>
											<td>{u.lastName}</td>
											<td>{u.phoneNumber}</td>
											<td>{u.role}</td>
											<td className="d-flex gap-2">
												<button className="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#userModal" onClick={()=>startEdit(u)}>
													<i className="fas fa-edit"></i>
												</button>
												<button className="btn btn-sm btn-outline-danger" onClick={()=>remove(u)}>
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

			<div className="modal fade" id="userModal" tabIndex={-1} aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{editing ? 'Edit User' : 'New User'}</h5>
							<button id="userModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<form onSubmit={submitForm}>
							<div className="modal-body">
								{error && <div className="alert alert-danger">{error}</div>}
								<div className="mb-3">
									<label className="form-label">Username</label>
									<input className="form-control" value={form.username} onChange={e=>setForm(f=>({...f, username: e.target.value}))} required />
								</div>
								<div className="mb-3">
									<label className="form-label">Password {editing && <span className="text-muted">(leave blank to keep)</span>}</label>
									<input type="password" className="form-control" value={form.password} onChange={e=>setForm(f=>({...f, password: e.target.value}))} {...(editing ? {} : {required: true})} />
								</div>
								<div className="row">
									<div className="col-md-6 mb-3">
										<label className="form-label">First name</label>
										<input className="form-control" value={form.firstName} onChange={e=>setForm(f=>({...f, firstName: e.target.value}))} />
									</div>
									<div className="col-md-6 mb-3">
										<label className="form-label">Last name</label>
										<input className="form-control" value={form.lastName} onChange={e=>setForm(f=>({...f, lastName: e.target.value}))} />
									</div>
								</div>
								<div className="mb-3">
									<label className="form-label">Phone</label>
									<input className="form-control" value={form.phoneNumber} onChange={e=>setForm(f=>({...f, phoneNumber: e.target.value}))} />
								</div>
								<div className="mb-3">
									<label className="form-label">Gender</label>
									<select className="form-select" value={form.gender ?? ''} onChange={e=>setForm(f=>({...f, gender: e.target.value === '' ? null : Number(e.target.value)}))}>
										<option value="">Not set</option>
										<option value={0}>Male</option>
										<option value={1}>Female</option>
										<option value={2}>Other</option>
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
		</div>
	)
}