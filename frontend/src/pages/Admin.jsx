import { useEffect, useState } from "react";
import { api } from "../api";

const EMPTY_OPPORTUNITY = {
  title: "",
  category: "scholarship",
  description: "",
  organization: "",
  country: "",
  fieldOfStudy: "",
  tags: "",
  deadline: "",
  url: "",
};

export default function Admin() {
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState(null);
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [newOpportunity, setNewOpportunity] = useState(EMPTY_OPPORTUNITY);
  const [oppError, setOppError] = useState("");
  const [oppSaved, setOppSaved] = useState(false);
  const [oppBusy, setOppBusy] = useState(false);

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

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    setOppError("");
    setOppSaved(false);
    setOppBusy(true);
    try {
      await api.createOpportunity({
        ...newOpportunity,
        tags: newOpportunity.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        deadline: newOpportunity.deadline || null,
      });
      setNewOpportunity(EMPTY_OPPORTUNITY);
      setOppSaved(true);
      loadAll();
    } catch (err) {
      setOppError(err.message);
    } finally {
      setOppBusy(false);
    }
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
        <button className={tab === "add" ? "tab active" : "tab"} onClick={() => setTab("add")}>
          Add Opportunity
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

      {tab === "add" && (
        <form className="card form-grid" onSubmit={handleCreateOpportunity} style={{ marginTop: "1rem" }}>
          {oppError && <div className="alert-error span-2">{oppError}</div>}
          {oppSaved && <div className="alert-success span-2">Opportunity published.</div>}
          <label className="span-2">
            Title
            <input
              required
              value={newOpportunity.title}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })}
            />
          </label>
          <label>
            Category
            <select
              value={newOpportunity.category}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, category: e.target.value })}
            >
              <option value="scholarship">Scholarship</option>
              <option value="internship">Internship</option>
              <option value="event">Event</option>
              <option value="course">Course</option>
            </select>
          </label>
          <label>
            Deadline
            <input
              type="date"
              value={newOpportunity.deadline}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, deadline: e.target.value })}
            />
          </label>
          <label>
            Organization
            <input
              value={newOpportunity.organization}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, organization: e.target.value })}
            />
          </label>
          <label>
            Country
            <input
              value={newOpportunity.country}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, country: e.target.value })}
              placeholder="e.g. Ghana, Global"
            />
          </label>
          <label className="span-2">
            Field of study
            <input
              value={newOpportunity.fieldOfStudy}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, fieldOfStudy: e.target.value })}
              placeholder="e.g. software engineering"
            />
          </label>
          <label className="span-2">
            Tags (comma-separated)
            <input
              value={newOpportunity.tags}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, tags: e.target.value })}
              placeholder="javascript, web development"
            />
          </label>
          <label className="span-2">
            Description
            <textarea
              rows={3}
              value={newOpportunity.description}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })}
            />
          </label>
          <label className="span-2">
            External URL
            <input
              value={newOpportunity.url}
              onChange={(e) => setNewOpportunity({ ...newOpportunity, url: e.target.value })}
              placeholder="https://..."
            />
          </label>
          <button className="btn-primary span-2" type="submit" disabled={oppBusy}>
            {oppBusy ? "Publishing..." : "Publish opportunity"}
          </button>
        </form>
      )}
    </div>
  );
}
