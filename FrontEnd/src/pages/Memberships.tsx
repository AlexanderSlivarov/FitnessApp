import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  Membership,
  getMemberships,
  createMembership,
  deleteMembership,
  updateMembership
} from '../api/memberships'

export default function Memberships() {
  const { token } = useAuth()

  const [items, setItems] = useState<Membership[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emptyMessage, setEmptyMessage] = useState('No memberships')

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [count, setCount] = useState(0)

  const [filterName, setFilterName] = useState('')
  const [filterPrice, setFilterPrice] = useState('')
  const [filterDuration, setFilterDuration] = useState('')
  const [filterDurationType, setFilterDurationType] = useState('')

  const [editing, setEditing] = useState<Membership | null>(null)

  // FORM WITH STRING ENUM
  const [form, setForm] = useState({
    name: '',
    price: undefined as number | undefined,
    duration: undefined as number | undefined,
    durationType: "Days",   // <-- STRING DEFAULT
    description: ''
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

  async function load() {
    setLoading(true)
    setError(null)

    try {
      const res = await getMemberships({
        name: filterName,
        price: filterPrice ? Number(filterPrice) : undefined,
        duration: filterDuration ? Number(filterDuration) : undefined,
        durationType: filterDurationType || undefined,
        page,
        pageSize,
        sortAsc: true,
        orderBy: 'Id'
      })

      const data = res?.data ?? res
      setItems(data?.items || [])
      setCount(data?.pager?.count || data?.items?.length || 0)

    } catch {
      setEmptyMessage('No memberships found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (token) load() }, [token, page])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    setPage(1)
    load()
  }

  const startCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      price: undefined,
      duration: undefined,
      durationType: "Days", // <-- STRING
      description: ''
    })
  }

  const startEdit = (m: Membership) => {
    setEditing(m)
    setForm({
      name: m.name,
      price: m.price,
      duration: m.duration,
      durationType: m.durationType || "Days", // <-- ALWAYS STRING
      description: m.description
    })
  }

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price ?? 0),
        duration: Number(form.duration ?? 1),
        durationType: form.durationType || "Days", // <-- STRING ENUM
        description: form.description.trim()
      }

      if (editing) await updateMembership(editing.id, payload)
      else await createMembership(payload)

      await load()
      document.getElementById('membershipModalCloseBtn')?.click()

    } catch (e: any) {
      setError(e.message || 'Save failed')
    }
  }

  const [pendingDelete, setPendingDelete] = useState<Membership | null>(null)

  const confirmRemove = (m: Membership) => {
    setPendingDelete(m)
    new (window as any).bootstrap.Modal(document.getElementById('deleteMembershipModal')).show()
  }

  const doRemove = async () => {
    if (!pendingDelete) return

    try {
      await deleteMembership(pendingDelete.id)
      setPendingDelete(null)
      await load()
      document.getElementById('deleteMembershipModalCloseBtn')?.click()

    } catch (e: any) {
      setError(e.message || 'Delete failed')
    }
  }

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="text-primary m-0">Memberships</h4>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#membershipModal"
          onClick={startCreate}
        >
          <i className="fas fa-plus"></i> New Membership
        </button>
      </div>

      {/* Filters */}
      <form className="card shadow mb-3" onSubmit={onSearch}>
        <div className="card-body row g-3">

          <div className="col-md-3">
            <input className="form-control" placeholder="Name"
              value={filterName} onChange={e => setFilterName(e.target.value)} />
          </div>

          <div className="col-md-3">
            <input className="form-control" placeholder="Price" type="number"
              value={filterPrice} onChange={e => setFilterPrice(e.target.value)} />
          </div>

          <div className="col-md-3">
            <input className="form-control" placeholder="Duration" type="number"
              value={filterDuration} onChange={e => setFilterDuration(e.target.value)} />
          </div>

          <div className="col-md-3">            
            <select className="form-select"
              value={filterDurationType}
              onChange={e => setFilterDurationType(e.target.value)}
            >
              <option value="Days">Days</option>
              <option value="Months">Months</option>
              <option value="Years">Years</option>
            </select>
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm" type="submit">
              <i className="fas fa-search"></i> Search
            </button>

            <button className="btn btn-outline-secondary btn-sm" type="button"
              onClick={() => {
                setFilterName('')
                setFilterPrice('')
                setFilterDuration('')
                setFilterDurationType('')
                load()
              }}
            >
              <i className="fas fa-rotate-left"></i> Reset
            </button>
          </div>

        </div>
      </form>

      {/* Table */}
      <div className="card shadow">
        <div className="card-body p-0">

          {error && <div className="alert alert-danger m-3">{error}</div>}

          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="text-center p-4">{emptyMessage}</td></tr>
                ) : (
                  items.map(m => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td>{m.name}</td>
                      <td>{m.price}</td>
                      <td>{m.duration}</td>
                      <td>{m.durationTypeName}</td>
                      <td>{m.description}</td>

                      <td className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          data-bs-toggle="modal"
                          data-bs-target="#membershipModal"
                          onClick={() => startEdit(m)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmRemove(m)}
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

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center p-3">
            <div>Page {page} / {totalPages}</div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}>Prev</button>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>

        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <div className="modal fade" id="membershipModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">{editing ? 'Edit Membership' : 'New Membership'}</h5>
              <button id="membershipModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>

            <form onSubmit={submitForm}>
              <div className="modal-body">

                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" required minLength={2}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <input className="form-control" type="number" required min={0}
                    value={form.price ?? ''}
                    onChange={e => {
                      const v = e.target.value
                      setForm(f => ({ ...f, price: v === '' ? undefined : Number(v) }))
                    }} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Duration</label>
                  <input className="form-control" type="number" required min={1}
                    value={form.duration ?? ''}
                    onChange={e => {
                      const v = e.target.value
                      setForm(f => ({ ...f, duration: v === '' ? undefined : Number(v) }))
                    }} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Duration Type</label>
                  <select className="form-select"
                    value={form.durationType} 
                    onChange={e => setForm(f => ({ ...f, durationType: e.target.value }))}
                  >
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" required minLength={10}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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
      <div className="modal fade" id="deleteMembershipModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button id="deleteMembershipModalCloseBtn" type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>

            <div className="modal-body">
              {pendingDelete ? (
                <p>Delete membership <strong>{pendingDelete.name}</strong>?</p>
              ) : (
                <p>No membership selected.</p>
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
