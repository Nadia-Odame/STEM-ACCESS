import { useEffect, useState } from "react";
import { api } from "../api";

export default function Admin() {
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState(null);
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);

  async function loadAll() {
    const [r, u, p] = await Promise.all([api.adminReports(), api.adminListUsers(), api.adminPendingOpportunities()]);
    setReports(r);
    setUsers(u.users);
    setPending(p.opportunities);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const setUserFlag = async (id, payload) => {
    await api.adminUpdateUser(id, payload);
    loadAll();
  };

  const deleteUser = async (id) => {
    await api.adminDeleteUser(id);
    loadAll();
  };

  const setOpportunityStatus = async (id, status) => {
    await api.adminSetOpportunityStatus(id, status);
    loadAll();
  };

  return (
    <div className="page">
      <h1>Administration</h1>
      <p className="muted">FR9: Manage users, approve opportunities, and generate platform reports.</p>

      <div className="tabs">
        <button className={tab === "reports" ? "tab active" : "tab"} onClick={() => setTab("reports")}>
          Reports
        </button>
        <button className={tab === "users" ? "tab active" : "tab"} onClick={() => setTab("users")}>
          Users
        </button>
        <button className={tab === "opportunities" ? "tab active" : "tab"} onClick={() => setTab("opportunities")}>
          Pending Opportunities ({pending.length})
        </button>
      </div>

      {tab === "reports" && reports && (
        <div className="stat-row">
          <div className="stat-card">
            <span className="stat-value">{reports.users.total}</span>
            <span className="stat-label">Total users</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{reports.users.students}</span>
            <span className="stat-label">Students</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{reports.opportunities.approved}</span>
            <span className="stat-label">Approved opportunities</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{reports.applications.total}</span>
            <span className="stat-label">Applications tracked</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{reports.mentorship.accepted}</span>
            <span className="stat-label">Active mentorships</span>
          </div>
        </div>
      )}

      {tab === "users" && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Approved</th>
              <th>Suspended</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isApproved ? "Yes" : "No"}</td>
                <td>{u.isSuspended ? "Yes" : "No"}</td>
                <td className="btn-row">
                  {!u.isApproved && (
                    <button className="btn-secondary-sm" onClick={() => setUserFlag(u.id, { isApproved: true })}>
                      Approve
                    </button>
                  )}
                  <button className="btn-secondary-sm" onClick={() => setUserFlag(u.id, { isSuspended: !u.isSuspended })}>
                    {u.isSuspended ? "Unsuspend" : "Suspend"}
                  </button>
                  <button className="btn-secondary-sm" onClick={() => deleteUser(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "opportunities" && (
        <div className="grid">
          {pending.length === 0 ? (
            <p className="muted">No opportunities awaiting approval.</p>
          ) : (
            pending.map((o) => (
              <div className="card" key={o.id}>
                <h3>{o.title}</h3>
                <p className="muted">
                  {o.organization} · {o.category}
                </p>
                <p>{o.description}</p>
                <div className="btn-row">
                  <button className="btn-primary-sm" onClick={() => setOpportunityStatus(o.id, "approved")}>
                    Approve
                  </button>
                  <button className="btn-secondary-sm" onClick={() => setOpportunityStatus(o.id, "rejected")}>
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
