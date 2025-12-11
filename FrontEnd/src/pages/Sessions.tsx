import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Session,
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from "../api/sessions";
import { getActivities, Activity } from "../api/activities";
import { getStudios, Studio } from "../api/studios";
import { getInstructors, Instructor } from "../api/instructors";

export default function Sessions() {
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState(
    "No sessions found matching the given criteria."
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [count, setCount] = useState(0);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // --------- FILTERS ---------
  const [filterActivityId, setFilterActivityId] = useState<number | undefined>();
  const [filterInstructorId, setFilterInstructorId] = useState<number | undefined>();
  const [filterStudioId, setFilterStudioId] = useState<number | undefined>();
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / pageSize)),
    [count, pageSize]
  );

  // --------- LOAD SESSIONS ---------
  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res: any = await getSessions({
        page,
        pageSize,
        activityId: filterActivityId,
        instructorId: filterInstructorId,
        studioId: filterStudioId,
        name: filterName || undefined,
        date: filterDate || undefined,
        orderBy: "Id",
        sortAsc: true,
      });

      const data = res?.data ?? res;
      const list = data?.items ?? [];
      setItems(list);
      setCount(data?.pager?.count ?? list.length);
    } catch (e: any) {
      setItems([]);
      setCount(0);
      setEmptyMessage(e?.data?.message || e?.message || "No sessions found.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, pageSize]);

  // --------- LOAD DROPDOWNS ---------
  useEffect(() => {
    (async () => {
      try {
        const aRes: any = await getActivities({ page: 1, pageSize: 200, orderBy: "Name", sortAsc: true });
        setActivities(aRes?.data?.items ?? aRes?.items ?? []);
      } catch {}

      try {
        const sRes: any = await getStudios({ page: 1, pageSize: 200, orderBy: "Name", sortAsc: true });
        setStudios(sRes?.data?.items ?? sRes?.items ?? []);
      } catch {}

      try {
        const iRes: any = await getInstructors({ page: 1, pageSize: 200, orderBy: "Id", sortAsc: true });
        setInstructors(iRes?.data?.items ?? iRes?.items ?? []);
      } catch {}
    })();
  }, []);

  // --------- SEARCH ---------
  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  // --------- FORM HANDLING ---------
  const [editing, setEditing] = useState<Session | null>(null);

  const [form, setForm] = useState({
    name: "",
    activityId: 0,
    instructorId: 0,
    studioId: 0,
    date: "",
    startTime: "",
    duration: 1,
    minParticipants: 1,
    difficulty: 0,
  });

  const startCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      activityId: activities[0]?.id ?? 0,
      instructorId: instructors[0]?.id ?? 0,
      studioId: studios[0]?.id ?? 0,
      date: "",
      startTime: "",
      duration: 1,
      minParticipants: 1,
      difficulty: 0,
    });
  };

  const startEdit = (s: Session) => {
    setEditing(s);
    setForm({
      name: s.name,
      activityId: s.activityId ?? 0,
      instructorId: s.instructorId ?? 0,
      studioId: s.studioId ?? 0,
      date: s.date,
      startTime: s.startTime,
      duration: s.duration,
      minParticipants: s.minParticipants,
      difficulty: s.difficulty ?? 0,
    });
  };

  const submitForm = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);

    const formEl = ev.target as HTMLFormElement;
    if (!formEl.checkValidity()) {
      formEl.classList.add("was-validated");
      return;
    }

    const payload = { ...form };

    try {
      if (editing) await updateSession(editing.id, payload);
      else await createSession(payload);

      await load();
      (document.getElementById("sessionModalCloseBtn") as HTMLButtonElement)?.click();
    } catch (e: any) {
      setError(e.message || "Save failed");
      setTimeout(() => setError(null), 4000);
    }
  };

  // --------- DELETE ---------
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);

  const confirmRemove = (s: Session) => {
    setPendingDelete(s);
    const modal = document.getElementById("deleteSessionModal");
    if (modal) new (window as any).bootstrap.Modal(modal).show();
  };

  const doRemove = async () => {
    if (!pendingDelete) return;

    try {
      await deleteSession(pendingDelete.id);
      setPendingDelete(null);
      await load();
      (document.getElementById("deleteSessionModalCloseBtn") as HTMLButtonElement)?.click();
    } catch (e: any) {
      setError(e.message || "Delete failed");
    }
  };

  // --------- UI ---------
  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="text-primary m-0">Sessions</h4>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#sessionModal"
          onClick={startCreate}
        >
          <i className="fas fa-plus"></i> New Session
        </button>
      </div>

      {/* FILTERS */}
      <form className="card shadow mb-3" onSubmit={onSearch}>
        <div className="card-body">

          <div className="row g-3">

            {/* ACTIVITY */}
            <div className="col-md-3">
              <label className="form-label mb-1 text-secondary">Activity</label>
              <select
                className="form-select form-select-sm"
                value={filterActivityId ?? ""}
                onChange={(e) =>
                  setFilterActivityId(e.target.value === "" ? undefined : Number(e.target.value))
                }
              >                
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* INSTRUCTOR */}
            <div className="col-md-3">
              <label className="form-label mb-1 text-secondary">Instructor</label>
              <select
                className="form-select form-select-sm"
                value={filterInstructorId ?? ""}
                onChange={(e) =>
                  setFilterInstructorId(e.target.value === "" ? undefined : Number(e.target.value))
                }
              >                
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.username}</option>
                ))}
              </select>
            </div>

            {/* STUDIO */}
            <div className="col-md-3">
              <label className="form-label mb-1 text-secondary">Studio</label>
              <select
                className="form-select form-select-sm"
                value={filterStudioId ?? ""}
                onChange={(e) =>
                  setFilterStudioId(e.target.value === "" ? undefined : Number(e.target.value))
                }
              >                
                {studios.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* NAME */}
            <div className="col-md-3 d-flex flex-column justify-content-end">
  <input
    className="form-control form-control-sm"
    placeholder="Name"
    value={filterName}
    onChange={(e) => setFilterName(e.target.value)}
    style={{ marginTop: "22px" }}  // aligns with select inputs
  />
</div>

          </div>

          <div className="row g-3 mt-2">

            {/* DATE */}
            <div className="col-md-3">
              <label className="form-label mb-1 text-secondary">Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            {/* BUTTONS */}
            <div className="col-md-9 d-flex justify-content-end align-items-end gap-2">
              <button className="btn btn-outline-primary btn-sm" type="submit">
                <i className="fas fa-search"></i> Search
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={() => {
                  setFilterActivityId(undefined);
                  setFilterInstructorId(undefined);
                  setFilterStudioId(undefined);
                  setFilterName("");
                  setFilterDate("");
                  setPage(1);
                  load();
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
                  <th>Name</th>
                  <th>Activity</th>
                  <th>Instructor</th>
                  <th>Studio</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>Duration</th>
                  <th>Min</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center p-4">Loading...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center p-4">{emptyMessage}</td>
                  </tr>
                ) : (
                  items.map((s) => (
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
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          data-bs-toggle="modal"
                          data-bs-target="#sessionModal"
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SESSION MODAL */}
      <div className="modal fade" id="sessionModal" tabIndex={-1}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">{editing ? "Edit Session" : "New Session"}</h5>
              <button
                id="sessionModalCloseBtn"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <form onSubmit={submitForm}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary">Name</label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary">Activity</label>
                    <select
                      className="form-select"
                      value={form.activityId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, activityId: Number(e.target.value) }))
                      }
                      required
                    >
                      {activities.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label className="form-label text-secondary">Instructor</label>
                    <select
                      className="form-select"
                      value={form.instructorId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, instructorId: Number(e.target.value) }))
                      }
                      required
                    >
                      {instructors.map((i) => (
                        <option key={i.id} value={i.id}>{i.username}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary">Studio</label>
                    <select
                      className="form-select"
                      value={form.studioId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, studioId: Number(e.target.value) }))
                      }
                      required
                    >
                      {studios.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label className="form-label text-secondary">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary">Start Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startTime: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label className="form-label text-secondary">Duration (minutes)</label>
                    <input
                      type="number"
                      min={1}
                      className="form-control"
                      value={form.duration}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary">Min Participants</label>
                    <input
                      type="number"
                      min={1}
                      className="form-control"
                      value={form.minParticipants}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          minParticipants: Number(e.target.value),
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label className="form-label text-secondary">Difficulty</label>
                    <select
                      className="form-select"
                      value={form.difficulty}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, difficulty: Number(e.target.value) }))
                      }
                      required
                    >
                      <option value={0}>Beginner</option>
                      <option value={1}>Intermediate</option>
                      <option value={2}>Advanced</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>

          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <div className="modal fade" id="deleteSessionModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                id="deleteSessionModalCloseBtn"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {pendingDelete ? (
                <p>
                  Delete session <strong>{pendingDelete.name}</strong>?
                </p>
              ) : (
                <p>No session selected.</p>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
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
