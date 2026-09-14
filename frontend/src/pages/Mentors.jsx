import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Mentors() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const [{ mentors }, { requests }] = await Promise.all([api.listMentors(), api.myMentorshipRequests()]);
    setMentors(mentors);
    setRequests(requests);
  }

  useEffect(() => {
    load();
  }, []);

  const handleRequest = async (mentorId) => {
    await api.requestMentor(mentorId, "Hi! I'd love to be matched with you as a mentor.");
    setMessage("Mentorship request sent.");
    load();
  };

  const respond = async (requestId, status) => {
    await api.respondToRequest(requestId, status);
    load();
  };

  const isMentor = user?.role === "mentor";

  return (
    <div className="page">
      <h1>Mentors</h1>
      <p className="muted">FR5: Mentor matching, mentorship requests, and secure messaging.</p>
      {message && <div className="alert-success">{message}</div>}

      {!isMentor && (
        <>
          <h2>Find a mentor</h2>
          <div className="grid">
            {mentors.map((m) => (
              <div className="card" key={m.id}>
                <h3>{m.name}</h3>
                <p className="muted">{m.profile?.company}</p>
                <div className="tag-row">
                  {(m.profile?.expertise || []).map((e) => (
                    <span key={e} className="tag">
                      {e}
                    </span>
                  ))}
                </div>
                <p>{m.profile?.bio}</p>
                {m.matchScore > 0 && <p className="reason">✨ {m.matchScore} shared area(s) of interest</p>}
                <button className="btn-primary-sm" onClick={() => handleRequest(m.id)}>
                  Request mentorship
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ marginTop: "2rem" }}>{isMentor ? "Requests from students" : "My mentorship requests"}</h2>
      {requests.length === 0 ? (
        <p className="muted">No requests yet.</p>
      ) : (
        <div className="grid">
          {requests.map((r) => (
            <div className="card" key={r.id}>
              <p>
                <strong>{isMentor ? r.student?.name : r.mentor?.name}</strong>
              </p>
              <p className="muted small">{r.message}</p>
              <p>
                Status: <span className={`status status-${r.status}`}>{r.status}</span>
              </p>
              {isMentor && r.status === "pending" && (
                <div className="btn-row">
                  <button className="btn-primary-sm" onClick={() => respond(r.id, "accepted")}>
                    Accept
                  </button>
                  <button className="btn-secondary-sm" onClick={() => respond(r.id, "declined")}>
                    Decline
                  </button>
                </div>
              )}
              {r.status === "accepted" && <Link to={`/mentors/thread/${r.id}`}>Open conversation →</Link>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
