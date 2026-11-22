import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import OriginalLayout from "./OriginalLayout";
import "../styles/queue-original.css";

const progress = {
  Pending: 10, "In Progress": 35,
  Printing: 65, "Ready for Pickup": 90, Completed: 100
};

const badges = {
  Pending: "bg-warning text-dark",
  "In Progress": "bg-info text-dark",
  Printing: "bg-primary",
  "Ready for Pickup": "bg-success",
  Completed: "bg-secondary"
};

export default function QueueMonitor() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const id = params.get("request_id");
    api.get("/student/queue", { params: id ? { request_id: id } : {} })
      .then(r => { if (active) setData(r.data); })
      .catch(e => {
        if (!active) return;
        if (e.response?.status === 401) navigate("/login");
        else setError("Unable to load queue.");
      });
    return () => { active = false; };
  }, [params, navigate]);

  const r = data?.selected;
  const status = r?.status;
  const wait = status === "Ready for Pickup" ? "Ready to collect" :
    status === "Printing" ? "Printing now" :
    status === "In Progress" ? "Being prepared" :
    `~${data?.estimate || 0} min`;

  return <OriginalLayout pageClassName="queue-page" sidebarId="queueSidebar">
    <div className="student-page-intro">
      <h1>Queue Monitor</h1>
      <p>Track your print request in real time.</p>
    </div>
    {error && <p role="alert">{error}</p>}
    {!data && !error && <p>Loading...</p>}

    {data && !r && <div className="empty-card mt-4">
      <div className="empty-icon">No requests yet</div>
      <h2 className="mt-4">No Active Print Requests</h2>
      <p className="text-muted mt-3">
        You don't have any active printing requests.
        Completed requests can be viewed in Transaction History.
        Submit a new request to join the queue.
      </p>
      <Link to="/submit-request" className="btn btn-primary btn-lg mt-3">
        Create Your First Request
      </Link>
    </div>}

    {data && r && <>
      <div className="queue-banner mb-4">
        <div className="row">
          <div className="col-md-8">
            <p>YOUR QUEUE NUMBER</p>
            <div className="big-number">#{r.queue_number}</div>
            <p className="mt-3">Current Status:{" "}
              <span className={`badge ${badges[status] || "bg-secondary"} fs-6`}>
                {status}
              </span>
            </p>
          </div>
          <div className="col-md-4">
            {[
              [data.ahead, "Ahead of You"],
              [wait, "Estimated Wait"],
              [data.totalQueue, "In Queue"]
            ].map(([value,label]) =>
              <div className="stat-card mb-3" key={label}>
                <h2>{value}</h2><div>{label}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card card-box">
        <div className="card-body">
          <h4 className="mb-3">Queue Progress</h4>
          <div className="progress" style={{height:25}}>
            <div className="progress-bar progress-bar-striped progress-bar-animated"
              style={{width:`${progress[status] || 0}%`}}>
              {progress[status] || 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="card card-box mt-4">
        <div className="card-body">
          <h4>My Active Print Requests</h4>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr>
                <th>Queue</th><th>Document</th>
                <th>Status</th><th>Progress</th>
              </tr></thead>
              <tbody>{data.requests.map(item =>
                <tr key={item._id} style={{cursor:"pointer"}}
                  onClick={() => setParams({request_id:item._id})}>
                  <td><span className="fw-bold text-primary">
                    #{item.queue_number}</span></td>
                  <td>{item.filename}</td>
                  <td><span className={`badge ${badges[item.status] || "bg-secondary"}`}>
                    {item.status}</span></td>
                  <td>{progress[item.status] || 0}%</td>
                </tr>
              )}</tbody>
            </table>
          </div>
        </div>
      </div>
    </>}
  </OriginalLayout>;
}
