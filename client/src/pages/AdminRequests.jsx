import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/admin-requests-original.css";

const statuses = [
  "Pending", "In Progress", "Printing",
  "Ready for Pickup", "Completed"
];

const classes = {
  Pending: "status-pending",
  "In Progress": "status-progress",
  Printing: "status-printing",
  "Ready for Pickup": "status-ready",
  Completed: "status-completed"
};

export default function AdminRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(null);
  const [dark, setDark] = useState(
    () => localStorage.getItem("adnu-prints-theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("adnu-dark", dark);
    localStorage.setItem("adnu-prints-theme", dark ? "dark" : "light");
    return () => document.body.classList.remove("adnu-dark");
  }, [dark]);

  const handleLoadError = useCallback((err) => {
    if (err.response?.status === 401) return navigate("/login");
    setError(err.response?.status === 403
      ? "Administrators only" : "Could not load requests");
  }, [navigate]);

  async function load() {
    try {
      const { data } = await api.get("/admin/requests", {
        params: { search: submittedSearch }
      });
      setRequests(data.requests);
      setError("");
    } catch (err) {
      handleLoadError(err);
    }
  }

  useEffect(() => {
    let active = true;
    api.get("/admin/requests", { params: { search: submittedSearch } })
      .then(({ data }) => {
        if (!active) return;
        setRequests(data.requests);
        setError("");
      })
      .catch(err => {
        if (active) handleLoadError(err);
      });
    return () => { active = false; };
  }, [handleLoadError, submittedSearch]);

  async function updateStatus(id, status) {
    setBusy(id);
    setMessage("");
    try {
      await api.patch(`/admin/requests/${id}/status`, { status });
      setMessage("Request status updated.");
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function download(request) {
    try {
      const result = await api.get(
        `/admin/requests/${request._id}/download`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(result.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = request.filename || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Unable to download document.");
    }
  }

  async function logout(e) {
    e.preventDefault();
    try { await api.post("/auth/logout"); }
    finally { navigate("/login"); }
  }

  return <div className="container-fluid admin-requests-page">
    <div className="row">
      <div className="mobile-app-header">
        <div className="mobile-app-brand">
          <img src="/assets/images/ateneo-logo.png" alt="Ateneo Seal"/>
          <span>ADNU-PRINTS</span>
        </div>
        <button type="button" className="mobile-menu-toggle"
          aria-label="Open navigation menu"
          aria-expanded={menu}
          onClick={() => setMenu(true)}>☰</button>
      </div>

      <div className={`mobile-menu-overlay ${menu ? "is-visible" : ""}`}
        onClick={() => setMenu(false)} />

      <div className={`col-md-2 sidebar p-0 ${menu ? "mobile-sidebar-open" : ""}`}
        id="requestsSidebar">
        <button className="mobile-sidebar-close" aria-label="Close navigation menu"
          onClick={() => setMenu(false)}>×</button>
        <div className="logo">
          <img src="/assets/images/ateneo-logo.png" className="sidebar-seal" alt=""/>
          <span>ADNU-PRINTS</span>
        </div>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/requests">Manage Requests</Link>
        <a href="/login" onClick={logout}>Logout</a>
      </div>

      <div className="col-md-10 main">
        <div className="theme-toolbar">
          <button type="button" className="theme-button"
            onClick={() => setDark(!dark)}>
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <h2>Manage Print Requests</h2>
        <p className="text-muted">
          Update request status and monitor queue activity.
        </p>

        {error && <p role="alert" className="alert alert-danger">{error}</p>}
        {message && <p role="status" className="alert alert-success">{message}</p>}

        <div className="search-card">
          <form onSubmit={e => {
            e.preventDefault();
            setSubmittedSearch(search);
          }}>
            <div className="row">
              <div className="col-md-10">
                <input type="text" className="form-control"
                  placeholder="Search student, file, or queue number..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary w-100">Search</button>
              </div>
            </div>
          </form>
        </div>

        {requests.length === 0 && !error &&
          <p className="mt-4">No printing requests found.</p>}

        {requests.map(r => <article className="request-card" key={r._id}>
          <div className="request-details">
            <div className="request-card-heading">
              <h5>Queue #{r.queue_number}</h5>
              <span className={`badge-custom ${classes[r.status] || ""}`}>
                {r.status}
              </span>
            </div>

            <div className="request-customer">
              <strong>{r.fullname || "Unknown user"}</strong>
              <span>Student ID: {r.student_id || "—"}</span>
            </div>

            <div className="request-file-row">
              <div className="request-file-info">
                <span className="request-detail-label">Document</span>
                <span className="request-filename" title={r.filename}>
                  {r.filename}
                </span>
              </div>
              <button type="button"
                className="btn request-download-button"
                onClick={() => download(r)}>
                Download file
              </button>
            </div>

            <dl className="request-facts">
              <div><dt>Pages</dt><dd>{r.pages}</dd></div>
              <div><dt>Copies</dt><dd>{r.copies}</dd></div>
              <div><dt>Cost</dt><dd>₱{r.estimated_cost}</dd></div>
            </dl>
          </div>

          <form className="request-status-panel" onSubmit={e => {
            e.preventDefault();
            updateStatus(r._id, e.currentTarget.elements.status.value);
          }}>
            <label className="request-status-label" htmlFor={`status-${r._id}`}>
              Update request status
            </label>
            <select id={`status-${r._id}`} name="status" className="form-select"
              defaultValue={r.status} key={r.status}
              disabled={busy === r._id}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <button type="submit" className="btn btn-primary request-status-button"
              disabled={busy === r._id}>
              {busy === r._id ? "Saving…" : "Update status"}
            </button>
          </form>
        </article>)}
      </div>
    </div>
  </div>;
}
