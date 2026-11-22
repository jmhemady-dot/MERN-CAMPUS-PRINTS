import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/admin-dashboard-original.css";

const statuses = [
  ["Pending", "Pending"],
  ["In Progress", "In Progress"],
  ["Printing", "Printing"],
  ["Ready for Pickup", "Ready for Pickup"],
  ["Completed", "Completed"]
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("adnu-prints-theme") === "dark"
  );

  useEffect(() => {
    let active = true;
    api.get("/admin/dashboard")
      .then(({ data }) => {
        if (active) setData(data);
      })
      .catch(err => {
        if (!active) return;
        if (err.response?.status === 401) navigate("/login");
        else if (err.response?.status === 403)
          setError("Administrators only.");
        else setError("Could not load admin dashboard.");
      });
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    document.body.classList.toggle("adnu-dark", dark);
    localStorage.setItem(
      "adnu-prints-theme", dark ? "dark" : "light"
    );
    return () => document.body.classList.remove("adnu-dark");
  }, [dark]);

  async function logout(e) {
    e.preventDefault();
    try {
      await api.post("/auth/logout");
    } finally {
      navigate("/login");
    }
  }

  const counts = data?.counts || {};
  const total = data?.total ?? 0;
  const recent = data?.recent || [];
  const activity = data?.activity || [];
  const highest = Math.max(1, ...activity.map(a => a.count));

  return (
    <div className="container-fluid admin-dashboard-page">
      <div className="row">
        <div className="mobile-app-header">
          <div className="mobile-app-brand">
            <img src="/assets/images/ateneo-logo.png"
              alt="Ateneo Seal" />
            <span>ADNU-PRINTS</span>
          </div>
          <button type="button" className="mobile-menu-toggle"
            onClick={() => setMenu(true)}>☰</button>
        </div>

        {menu && <div className="mobile-menu-overlay"
          onClick={() => setMenu(false)} />}

        <div id="adminSidebar"
          className={`col-md-2 sidebar p-0 ${menu ? "mobile-sidebar-open" : ""}`}>
          <button className="mobile-sidebar-close"
            onClick={() => setMenu(false)}>×</button>

          <div className="logo">
            <img src="/assets/images/ateneo-logo.png"
              className="sidebar-seal" alt="" />
            <span>ADNU-PRINTS</span>
          </div>

          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/requests">Manage Requests</Link>
          <a href="/login" onClick={logout}>Logout</a>
        </div>

        <div className="col-md-10 main">
          <div className="theme-toolbar">
            <button className="theme-button"
              onClick={() => setDark(!dark)}>
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          <h2>Admin Dashboard</h2>
          <p>Manage printing requests and monitor system activity.</p>

          {error && <p role="alert">{error}</p>}
          {!data && !error && <p>Loading dashboard...</p>}

          {data && <>
            <div className="admin-stat-grid mt-4">
              {[...statuses, ["Total", "Total Requests"]].map(
                ([key, label]) => (
                  <div className="admin-stat-item" key={key}>
                    <div className="card stat-card">
                      <div className="card-body">
                        <h6>{label}</h6>
                        <h2>{key === "Total" ? total : counts[key] || 0}</h2>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="row g-3 mt-2 mb-4 admin-activity-section">
              <div className="col-lg-7">
                <div className="activity-panel">
                  <div className="activity-heading">
                    <h5>Order Activity</h5>
                    <span className="activity-period">Last 7 days</span>
                  </div>

                  <div className="activity-chart">
                    {activity.map(a => (
                      <div className="activity-column" key={a.date}>
                        <span className="activity-count">
                          {a.count}
                        </span>
                        <div className="activity-bar-track">
                          <div className="activity-bar"
                            style={{
                              height: `${Math.max(
                                0, a.count / highest * 100
                              )}%`
                            }} />
                        </div>
                        <span className="activity-day">
                          {a.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="activity-panel">
                  <div className="activity-heading">
                    <h5>Order Status Summary</h5>
                  </div>
                  <div className="status-summary-list">
                    {statuses.map(([key, label]) => (
                      <div className="status-summary-row"
                        key={key}>
                        <span>{label}</span>
                        <strong>{counts[key] || 0}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-8">
                <div className="card recent-card">
                  <div className="card-header bg-white">
                    <h5>Recent Requests</h5>
                  </div>
                  <div className="card-body">
                    {recent.length === 0 &&
                      <p>No printing requests yet.</p>}
                    {recent.map(r => (
                      <div className="request-item" key={r.id}>
                        <strong>#{r.queueNumber} — {r.filename}</strong>
                        <div>{r.fullname}</div>
                        <small>{r.status}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card quick-card">
                  <div className="card-header bg-white">
                    <h5>Quick Actions</h5>
                  </div>
                  <div className="card-body d-grid gap-3">
                    <Link to="/admin/requests"
                      className="btn btn-primary">
                      Manage Requests
                    </Link>
                    <Link to="/admin/dashboard"
                      className="btn btn-outline-primary">
                      Refresh Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
