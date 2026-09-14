import { useEffect, useState } from "react";
import { api } from "../api";

const STATUS_LABEL = {
  saved: "Saved",
  applied: "Applied",
  registered: "Registered",
  in_review: "In review",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.myApplications().then(({ applications }) => {
      setApplications(applications);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      <h1>My Applications</h1>
      <p className="muted">FR6.1 Application Tracking — every opportunity you've saved, applied to, or registered for.</p>

      {loading ? (
        <p>Loading...</p>
      ) : applications.length === 0 ? (
        <p className="muted">You haven't saved or applied to anything yet. Browse opportunities to get started.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Opportunity</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id}>
                <td>{a.Opportunity?.title}</td>
                <td>{a.Opportunity?.category}</td>
                <td>
                  <span className={`status status-${a.status}`}>{STATUS_LABEL[a.status] || a.status}</span>
                </td>
                <td>{a.dateApplied ? new Date(a.dateApplied).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
