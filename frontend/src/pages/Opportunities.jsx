import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import OpportunityCard from "../components/OpportunityCard";

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "scholarship", label: "Scholarships" },
  { value: "internship", label: "Internships" },
  { value: "event", label: "Events" },
  { value: "course", label: "Courses" },
];

export default function Opportunities() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const { opportunities } = await api.listOpportunities({ q, category });
    setOpportunities(opportunities);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleSave = async (opportunity) => {
    if (!user) {
      setMessage("Log in to save opportunities.");
      return;
    }
    await api.actOnOpportunity(opportunity.id, "saved");
    setMessage(`Saved "${opportunity.title}" to your applications.`);
  };

  return (
    <div className="page">
      <h1>Opportunities</h1>
      <p className="muted">FR3: Browse, search and filter scholarships, internships, events, and courses.</p>

      <form className="filter-bar" onSubmit={handleSearch}>
        <input placeholder="Search by title, org, keyword..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button className="btn-primary-sm" type="submit">
          Search
        </button>
      </form>

      {message && <div className="alert-success">{message}</div>}

      {loading ? (
        <p>Loading opportunities...</p>
      ) : opportunities.length === 0 ? (
        <p className="muted">No opportunities match your search.</p>
      ) : (
        <div className="grid">
          {opportunities.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} onAction={handleSave} actionLabel="Save" />
          ))}
        </div>
      )}
    </div>
  );
}
