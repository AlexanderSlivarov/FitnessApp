import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Subscription,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../api/subscriptions";
import { getUsers, User } from "../api/users";
import { getMemberships } from "../api/memberships";

export default function Subscriptions() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState("No subscriptions found.");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [count, setCount] = useState(0);

  // Filters (no placeholders, always number | '')
  const [filterUserId, setFilterUserId] = useState<number | "">("");
  const [filterMembershipId, setFilterMembershipId] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<number | "">("");

  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / pageSize)),
    [count]
  );

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res: any = await getSubscriptions({
        page,
        pageSize,
        userId: filterUserId === "" ? undefined : filterUserId,
        membershipId:
          filterMembershipId === "" ? undefined : filterMembershipId,
        status: filterStatus === "" ? undefined : filterStatus,
      });

      const data = res?.data ?? res;
      setItems(data?.items ?? []);
      setCount(data?.pager?.count ?? data?.items?.length ?? 0);
    } catch (e: any) {
      const msg =
        e?.errors?.[0]?.message ||
        e?.data?.message ||
        e?.message ||
        "No subscriptions found.";

      setEmptyMessage(msg);
      setItems([]);
      setCount(0);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    (async () => {
      try {
        const ures: any = await getUsers({ page: 1, pageSize: 100 });
        const udata = ures?.data ?? ures;
        setUsers(udata?.items ?? []);
      } catch {}

      try {
        const mres: any = await getMemberships({ page: 1, pageSize: 100 });
        const mdata = mres?.data ?? mres;
        setMemberships(mdata?.items ?? []);
      } catch {}
    })();
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  // CREATE / EDIT
  const [editing, setEditing] = useState<Subscription | null>(null);

  const [form, setForm] = useState({
    userId: "" as number | "",
    membershipId: "" as number | "",
    startDate: "",
    endDate: "",
    status: 0,
  });

  const mapStatusToNumber = (s: string) => {
    if (s === "Frozen") return 1;
    if (s === "Cancelled") return 2;
    return 0;
  };

  const startCreate = () => {
    setEditing(null);
    setForm({
      userId: users[0]?.id ?? "",
      membershipId: memberships[0]?.id ?? "",
      startDate: "",
      endDate: "",
      status: 0,
    });
  };

  const startEdit = (s: Subscription) => {
    setEditing(s);
    setForm({
      userId: s.userId,
      membershipId: s.membershipId,
      startDate: s.startDate,
      endDate: s.endDate,
      status: mapStatusToNumber(s.status),
    });
  };

  const submitForm = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);

    try {
      const payload = {
        userId: Number(form.userId),
        membershipId: Number(form.membershipId),
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
      };

      if (editing) await updateSubscription(editing.id, payload);
      else await createSubscription(payload);

      await load();
      document.getElementById("subscriptionModalCloseBtn")?.click();
    } catch (e: any) {
      setError(e.message || "Save failed");
    }
  };

  // DELETE logic
  const [pendingDelete, setPendingDelete] = useState<Subscription | null>(null);

  const confirmRemove = (s: Subscription) => {
    setPendingDelete(s);
    const el = document.getElementById("deleteSubscriptionModal");
    if (el) new (window as any).bootstrap.Modal(el).show();
  };

  const doRemove = async () => {
    if (!pendingDelete) return;
    try {
      await deleteSubscription(pendingDelete.id);
      await load();
      document.getElementById("deleteSubscriptionModalCloseBtn")?.click();
    } catch (e: any) {
      setError(e.message || "Delete failed");
    }
  };

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="text-primary m-0">Subscriptions</h4>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#subscriptionModal"
          onClick={startCreate}
        >
          <i className="fas fa-plus"></i> New Subscription
        </button>
      </div>

      {/* FILTERS */}
      <form className="card shadow mb-3" onSubmit={onSearch}>
        <div className="card-body row g-3">
          <div className="col-md-4">
            <label className="form-label mb-1 text-secondary">User</label>
            <select
              className="form-select form-select-sm"
              value={filterUserId}
              onChange={(e) =>
                setFilterUserId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label mb-1 text-secondary">Membership</label>
            <select
              className="form-select form-select-sm"
              value={filterMembershipId}
              onChange={(e) =>
                setFilterMembershipId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              {memberships.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label mb-1 text-secondary">Status</label>
            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value={0}>Active</option>
              <option value={1}>Frozen</option>
              <option value={2}>Cancelled</option>
            </select>
          </div>

          <div className="col-md-2 d-flex align-items-end gap-2">
  <button className="btn btn-outline-primary btn-sm" type="submit">
    <i className="fas fa-search me-1"></i> Search
  </button>

  <button
    className="btn btn-outline-secondary btn-sm"
    type="button"
    onClick={() => {
      setFilterUserId("");
      setFilterMembershipId("");
      setFilterStatus("");
      load();
    }}
  >
    <i className="fas fa-rotate-left me-1"></i> Reset
  </button>
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
                  <th>Membership</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  items.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.username}</td>
                      <td>{s.membershipName}</td>
                      <td>{s.startDate}</td>
                      <td>{s.endDate}</td>
                      <td>{s.statusName ?? s.status}</td>

                      <td className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          data-bs-toggle="modal"
                          data-bs-target="#subscriptionModal"
                          onClick={() => startEdit(s)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmRemove(s)}
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
            <div>Page {page} / {totalPages}</div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <div className="modal fade" id="subscriptionModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Subscription" : "New Subscription"}
              </h5>
              <button
                id="subscriptionModalCloseBtn"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              />
            </div>

            <form onSubmit={submitForm}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                  <label className="form-label text-secondary">User</label>
                  <select
                    className="form-select"
                    required
                    value={form.userId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, userId: Number(e.target.value) }))
                    }
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary">
                    Membership
                  </label>
                  <select
                    className="form-select"
                    required
                    value={form.membershipId}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        membershipId: Number(e.target.value),
                      }))
                    }
                  >
                    {memberships.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary">
                      Start date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startDate: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary">
                      End date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endDate: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary">Status</label>
                  <select
                    className="form-select"
                    required
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: Number(e.target.value) }))
                    }
                  >
                    <option value={0}>Active</option>
                    <option value={1}>Frozen</option>
                    <option value={2}>Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <div className="modal fade" id="deleteSubscriptionModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                id="deleteSubscriptionModalCloseBtn"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              />
            </div>

            <div className="modal-body">
              {pendingDelete ? (
                <p>
                  Delete subscription <strong>#{pendingDelete.id}</strong>?
                </p>
              ) : (
                <p>No subscription selected.</p>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={doRemove}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
