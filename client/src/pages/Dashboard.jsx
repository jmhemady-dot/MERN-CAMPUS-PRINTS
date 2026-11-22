import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as API from "../services/api";
import "../styles/original-dashboard.css";
import "../styles/original-mobile.css";
import "../styles/student-layout.css";

const api = API.api;

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("adnu-prints-theme") === "dark"
  );

  useEffect(() => {
    let active = true;
    api.get("/dashboard/student")
      .then(({data}) => { if (active) setData(data); })
      .catch(err => {
        if (!active) return;
        if (err.response?.status === 401) navigate("/login");
        else setError("Unable to load dashboard.");
      });
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    document.body.classList.toggle("adnu-dark", dark);
    localStorage.setItem("adnu-prints-theme", dark ? "dark" : "light");
    return () => document.body.classList.remove("adnu-dark");
  }, [dark]);

  async function logout() {
    await api.post("/auth/logout");
    navigate("/login");
  }

  const fullname = data?.user?.fullname || "Student";
  const stats = data?.stats || {
    pending: 0, total: 0, completed: 0
  };
  const recent = data?.recent || [];

  return (
    <div className="container-fluid campus-original-dashboard">
      <div className="row">
        <div className="mobile-app-header">
          <div className="mobile-app-brand">
            <img src="/assets/images/ateneo-logo.png" alt="Ateneo Seal"/>
            <span>ADNU-PRINTS</span>
          </div>
          <button className="mobile-menu-toggle"
            aria-label="Open navigation menu"
            aria-controls="mobileSidebar"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        {menuOpen && <div className="mobile-menu-overlay is-visible"
          onClick={() => setMenuOpen(false)}/>}

        <div id="mobileSidebar"
          className={`col-md-2 sidebar p-0 ${menuOpen ? "mobile-sidebar-open" : ""}`}>
          <div className="student-sidebar-brand">
            <img src="/assets/images/ateneo-logo.png"
              className="student-sidebar-seal" alt=""/>
            <span>ADNU-PRINTS</span>
          </div>
          <div className="user-box">
            <h5>{fullname}</h5>
            <small>
              {data?.user?.role === "faculty"
                ? "Faculty Account" : "Student Account"}
            </small>
          </div>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/submit-request">Submit Request</Link>
          <Link to="/queue">Queue Monitor</Link>
          <Link to="/history">Transaction History</Link>
          <a href="/login" onClick={e => {
            e.preventDefault(); logout();
          }}>Logout</a>
        </div>

        <div className="col-md-10 main">
          <div className="dashboard-theme-toolbar">
            <button className="dashboard-theme-button"
              onClick={() => setDark(!dark)}>
              {dark ? "☀ Light Mode" : "☾ Dark Mode"}
            </button>
          </div>

          <div className="student-page-intro">
            <h2>Good Day, {fullname}</h2>
            <p>Here's what's happening with your print requests today.</p>
          </div>

          {error && <p role="alert">{error}</p>}

          <div className="row">
            {[
              ["Pending Requests", stats.pending],
              ["Total Requests", stats.total],
              ["Completed", stats.completed]
            ].map(([label, value]) => (
              <div className="col-md-4 mb-3" key={label}>
                <div className="card stat-card">
                  <div className="card-body">
                    <h6>{label}</h6>
                    <h2>{value}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="queue-box mt-3">
            <h5>CURRENT QUEUE STATUS</h5>
            <h1>#{data?.latestQueueNumber ?? "-"}</h1>
            <p>Your latest queue number</p>
          </div>

          <div className="row mt-4">
            <div className="col-md-8">
              <div className="card shadow border-0">
                <div className="card-header bg-white">
                  <h4>Recent Requests</h4>
                </div>
                <div className="card-body">
                  {recent.length === 0 && <p>No requests yet.</p>}
                  {recent.map(r => (
                    <div className="request-card" key={r.id}>
                      <h6>{r.filename}</h6>
                      <p>Queue #{r.queueNumber}</p>
                      <span className="badge bg-primary">
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card quick-card shadow">
                <div className="card-header bg-white">
                  <h4>Quick Actions</h4>
                </div>
                <div className="card-body">
                  <Link to="/submit-request"
                    className="btn btn-primary w-100">
                    New Print Request
                  </Link>
                  <Link to="/queue"
                    className="btn btn-success w-100">
                    Queue Monitor
                  </Link>
                  <Link to="/history"
                    className="btn btn-secondary w-100">
                    Transaction History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

