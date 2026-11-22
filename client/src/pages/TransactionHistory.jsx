import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import OriginalLayout from "./OriginalLayout";
import "../styles/history-original.css";

const badges = {
  Completed: "bg-success",
  "Ready for Pickup": "bg-warning text-dark",
  Printing: "bg-primary",
  "In Progress": "bg-info text-dark",
  Pending: "bg-secondary"
};

export default function TransactionHistory() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      api.get("/student/history", { params: { search } })
        .then(r => { if (active) { setData(r.data); setError(""); } })
        .catch(e => {
          if (!active) return;
          if (e.response?.status === 401) navigate("/login");
          else setError("Unable to load history.");
        });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search, navigate]);

  const stats = data?.stats || {};
  const money = n => `₱${Number(n || 0).toFixed(2)}`;

  return <OriginalLayout pageClassName="history-page" sidebarId="historySidebar">
    <div className="student-page-intro">
      <h1>Transaction History</h1>
      <p>View all your print requests.</p>
    </div>

    <div className="row mb-4">
      {[
        [stats.total || 0, "Total Requests"],
        [stats.completed || 0, "Completed"],
        [stats.pages || 0, "Total Pages"],
        [money(stats.cost), "Total Cost"]
      ].map(([value,label]) =>
        <div className="col-md-3" key={label}>
          <div className="card stat-card">
            <div className="card-body">
              <h2>{value}</h2><p>{label}</p>
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="card card-box">
      <div className="card-body">
        <form className="mb-4" onSubmit={e => e.preventDefault()}>
          <input type="text" className="form-control"
            placeholder="Search file name..."
            value={search}
            onChange={e => setSearch(e.target.value)}/>
        </form>

        {error && <p role="alert">{error}</p>}
        {!data && !error && <p>Loading...</p>}
        {data && <>
          {data.limited && <p>Showing the most recent 500 matches.</p>}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr>
                <th>Queue</th><th>File</th><th>Copies</th>
                <th>Pages</th><th>Cost</th><th>Status</th><th>Date</th>
              </tr></thead>
              <tbody>{data.requests.map(r =>
                <tr key={r._id}>
                  <td>#{r.queue_number}</td>
                  <td>{r.filename}</td>
                  <td>{r.copies}</td>
                  <td>{r.pages}</td>
                  <td>{money(r.estimated_cost)}</td>
                  <td><span className={`badge badge-status ${badges[r.status] || "bg-secondary"}`}>
                    {r.status}
                  </span></td>
                  <td>{r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString("en-US",
                        {month:"short",day:"2-digit",year:"numeric"})
                    : "-"}</td>
                </tr>
              )}</tbody>
            </table>
          </div>
          {data.requests.length === 0 && <p>No matching requests.</p>}
        </>}
      </div>
    </div>
  </OriginalLayout>;
}
