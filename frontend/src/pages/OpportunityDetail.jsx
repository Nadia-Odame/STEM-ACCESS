import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getOpportunity(id).then(({ opportunity }) => setOpportunity(opportunity));
  }, [id]);

  const act = async (status) => {
    if (!user) {
      setMessage("Log in to do that.");
      return;
    }
    await api.actOnOpportunity(id, status);
    setMessage(`Marked as "${status}". Check My Applications to track it.`);
  };

  if (!opportunity) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <span className={`badge badge-${opportunity.category}`}>{opportunity.category}</span>
      <h1>{opportunity.title}</h1>
      <p className="muted">
        {opportunity.organization} · {opportunity.country} {opportunity.deadline && `· Deadline: ${opportunity.deadline}`}
      </p>
      <p>{opportunity.description}</p>
      <div className="tag-row">
        {(opportunity.tags || []).map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>

      {message && <div className="alert-success">{message}</div>}

      <div className="btn-row">
        <button className="btn-secondary-sm" onClick={() => act("saved")}>
          Save for later
        </button>
        <button className="btn-primary-sm" onClick={() => act(opportunity.category === "event" ? "registered" : "applied")}>
          {opportunity.category === "event" ? "Register" : "Apply"}
        </button>
        {opportunity.url && (
          <a className="btn-secondary-sm" href={opportunity.url} target="_blank" rel="noreferrer">
            Visit official page ↗
          </a>
        )}
      </div>
    </div>
  );
}
