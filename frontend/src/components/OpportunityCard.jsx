import { Link } from "react-router-dom";

const CATEGORY_LABEL = {
  scholarship: "Scholarship",
  internship: "Internship",
  event: "Event",
  course: "Course",
};

export default function OpportunityCard({ opportunity, reason, onAction, actionLabel = "Save" }) {
  return (
    <div className="card opportunity-card">
      <div className="card-top">
        <span className={`badge badge-${opportunity.category}`}>{CATEGORY_LABEL[opportunity.category] || opportunity.category}</span>
        {opportunity.deadline && <span className="deadline">Deadline: {opportunity.deadline}</span>}
      </div>
      <h3>
        <Link to={`/opportunities/${opportunity.id}`}>{opportunity.title}</Link>
      </h3>
      <p className="muted">{opportunity.organization} · {opportunity.country}</p>
      <p>{opportunity.description}</p>
      {reason && <p className="reason">✨ {reason}</p>}
      <div className="tag-row">
        {(opportunity.tags || []).map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      {onAction && (
        <button className="btn-secondary-sm" onClick={() => onAction(opportunity)}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
