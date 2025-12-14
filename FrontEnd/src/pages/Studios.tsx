import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Studio, createStudio, deleteStudio, getStudios, updateStudio } from '../api/studios'

export default function Studios(){
    const [items, setItems] = useState<Studio[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [emptyMessage, setEmptyMessage] = useState<string>('No studios')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [count, setCount] = useState(0)
    const [filterName, setFilterName] = useState('')
    const [filterLocation, setFilterLocation] = useState('')
    const [filterCapacity, setFilterCapacity] = useState<number | ''>('')

    const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

    async function load(){
        setLoading(true)
        setError(null)
        try{
            const res: any = await getStudios({
                page,
                pageSize,
                name: filterName,
                location: filterLocation,
                capacity: filterCapacity === '' ? undefined : filterCapacity,
                orderBy: 'Id',
                sortAsc: true
            })

            const data = res?.data ?? res
            const items = data?.items ?? []
            const count = data?.pager?.count ?? items.length

            setItems(items)
            setCount(count)
        }catch(e:any){
            setItems([])
            setCount(0)

            const backendMsg =
                (e?.errors?.[0]?.message)
                ?? (e?.data?.message)
                ?? (typeof e?.data === 'string' ? e.data : undefined)
                ?? e?.message

            const msg = String(backendMsg || '')

            setEmptyMessage(msg || 'No studios found matching the given criteria.')
            setError(null)
        }
        finally{ setLoading(false) }
    }

    useEffect(()=>{ load() }, [page, pageSize])

    const onSearch = (e: FormEvent) => {
        e.preventDefault()
        setPage(1)
        load()
    }

    const [editing, setEditing] = useState<Studio | null>(null)
    const [form, setForm] = useState<{ name: string; location?: string | null; capacity: number | '' }>({
        name: '',
        location: '',
        capacity: ''
    })

    const startCreate = () => {
        setEditing(null)
        setForm({ name: '', location: '', capacity: '' })
    }

    const startEdit = (s: Studio) => {
        setEditing(s)
        setForm({
            name: s.name || '',
            location: s.location ?? '',
            capacity: s.capacity
        })
    }

    const submitForm = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)

        const formEl = (e.target as HTMLFormElement)
        if (!formEl.checkValidity()) {
            formEl.classList.add('was-validated')
            return
        }

        try{
            const payload = {
                name: form.name,
                location: (form.location ?? '').trim(),
                capacity: Number(form.capacity)
            }
            if(editing){
                await updateStudio(editing.id, payload)
            } else {
                await createStudio(payload)
            }

            await load()
            ;(document.getElementById('studioModalCloseBtn') as HTMLButtonElement)?.click()

        }catch(e:any){

            // 🔥 Improved backend validator error handling
            const messages: string[] = []

            if (Array.isArray(e?.errors)) {
                for (const err of e.errors) {
                    if (Array.isArray(err?.messages)) {
                        messages.push(...err.messages)
                    } else if (err?.message) {
                        messages.push(err.message)
                    }
                }
            }

            const finalMessage =
                messages.length > 0
                    ? messages.join('\n')
                    : (e?.data?.message ?? e?.message ?? 'Save failed')

            setError(String(finalMessage))
            setTimeout(() => setError(null), 6000)
        }
    }

    const [pendingDelete, setPendingDelete] = useState<Studio | null>(null)

    const confirmRemove = (s: Studio) => {
        setPendingDelete(s)
        const el = document.getElementById('deleteStudioModal')
        if(el) new (window as any).bootstrap.Modal(el).show()
    }

    const doRemove = async () => {
        if(!pendingDelete) return
        try{
            await deleteStudio(pendingDelete.id)
            setPendingDelete(null)
            await load()
            ;(document.getElementById('deleteStudioModalCloseBtn') as HTMLButtonElement)?.click()
        }catch(e:any){
            setError(e.message || 'Delete failed')
        }
    }

    return (
        <div className="container-fluid">

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-primary m-0">Studios</h4>
                <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#studioModal" onClick={startCreate}>
                    <i className="fas fa-plus"></i> New Studio
                </button>
            </div>

            <form className="card shadow mb-3" onSubmit={onSearch}>
                <div className="card-body">
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-4">
                            <input className="form-control form-control-sm" placeholder="Name" value={filterName} onChange={e=>setFilterName(e.target.value)} />
                        </div>
                        <div className="col-6 col-md-4">
                            <input className="form-control form-control-sm" placeholder="Location" value={filterLocation} onChange={e=>setFilterLocation(e.target.value)} />
                        </div>
                        <div className="col-6 col-md-2">
                            <input type="number" min={0} className="form-control form-control-sm" placeholder="Capacity" value={filterCapacity} onChange={e=>setFilterCapacity(e.target.value === '' ? '' : Number(e.target.value))} />
                        </div>
                        <div className="col-12 col-md-2 d-flex gap-2 justify-content-end">
                            <button className="btn btn-outline-primary btn-sm" type="submit">
                                <i className="fas fa-search"></i> <span className="ms-1">Search</span>
                            </button>
                            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={()=>{
                                setFilterName('')
                                setFilterLocation('')
                                setFilterCapacity('')
                                setPage(1)
                                load()
                            }}>
                                <i className="fas fa-rotate-left"></i> <span className="ms-1">Reset</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <div className="card shadow">
                <div className="card-body p-0">
                    {error && (
                        <div className="alert alert-danger m-3 white-space-pre-line">
                            {error}
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Capacity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>
                                ) : items.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center p-4">{emptyMessage}</td></tr>
                                ) : (
                                    items.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.id}</td>
                                            <td>{s.name}</td>
                                            <td>{s.location}</td>
                                            <td>{s.capacity}</td>
                                            <td className="d-flex gap-2">
                                                <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#studioModal" onClick={()=>startEdit(s)}>
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

            <div className="modal fade" id="studioModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">{editing ? 'Edit Studio' : 'New Studio'}</h5>
                            <button id="studioModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <form onSubmit={submitForm}>
                            <div className="modal-body">

                                {error && (
                                    <div className="alert alert-danger white-space-pre-line">
                                        {error}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        className="form-control"
                                        value={form.name}
                                        onChange={e=>setForm(f=>({...f, name: e.target.value}))}
                                        required
                                        minLength={3}
                                    />
                                    <div className="invalid-feedback">Name must be at least 3 characters.</div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Location</label>
                                    <input
                                        className="form-control"
                                        value={form.location ?? ''}
                                        onChange={e=>setForm(f=>({...f, location: e.target.value}))}
                                        required
                                        minLength={4}
                                    />
                                    <div className="invalid-feedback">Location must be at least 4 characters.</div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Capacity</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.capacity}
                                        onChange={e=>{
                                            const v = e.target.value
                                            setForm(f=>({...f, capacity: v === '' ? '' : Number(v)}))
                                        }}
                                        required
                                        min={1}
                                        max={10000}
                                    />
                                    <div className="invalid-feedback">Capacity must be between 1 and 10000.</div>
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

            <div className="modal fade" id="deleteStudioModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Delete</h5>
                            <button id="deleteStudioModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body">
                            {pendingDelete ? (
                                <p>Delete studio <strong>{pendingDelete.name}</strong>?</p>
                            ) : (
                                <p>No studio selected.</p>
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