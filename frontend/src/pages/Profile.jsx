import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

function toCSV(arr) {
  return (arr || []).join(", ");
}
function fromCSV(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { profile, user: u } = await api.getProfile();
      setForm({
        name: u.name,
        education: profile.education || "",
        country: profile.country || "",
        skills: toCSV(profile.skills),
        interests: toCSV(profile.interests),
        careerGoal: profile.careerGoal || "",
        bio: profile.bio || "",
        expertise: toCSV(profile.expertise),
        company: profile.company || "",
      });
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      await api.updateProfile({
        name: form.name,
        education: form.education,
        country: form.country,
        skills: fromCSV(form.skills),
        interests: fromCSV(form.interests),
        careerGoal: form.careerGoal,
        bio: form.bio,
        expertise: fromCSV(form.expertise),
        company: form.company,
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSkillGapAnalysis = async () => {
    const { gaps, roadmap } = await api.getRoadmap();
    setGaps(gaps);
    setRoadmap(roadmap);
  };

  if (!form) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Your Profile</h1>
      <p className="muted">FR2: Create and manage your personal, academic and professional profile.</p>

      {error && <div className="alert-error">{error}</div>}
      {saved && <div className="alert-success">Profile saved.</div>}

      <form className="card form-grid" onSubmit={handleSubmit}>
        <label>
          Full name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Country
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </label>
        <label className="span-2">
          Education
          <input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="e.g. BSc Software Engineering, ALCHE" />
        </label>
        <label className="span-2">
          Skills (comma-separated)
          <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="javascript, python, html" />
        </label>
        <label className="span-2">
          Interests (comma-separated)
          <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="web development, artificial intelligence" />
        </label>
        <label className="span-2">
          Career goal
          <input value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} placeholder="software engineering" />
        </label>
        <label className="span-2">
          Bio
          <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>

        {user?.role === "mentor" && (
          <>
            <label className="span-2">
              Areas of expertise (comma-separated)
              <input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} placeholder="software engineering, career coaching" />
            </label>
            <label>
              Company
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </label>
          </>
        )}

        <button className="btn-primary span-2" type="submit">
          Save profile
        </button>
      </form>

      {user?.role === "student" && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h2>Skill Gap Analysis &amp; Learning Roadmap</h2>
          <p className="muted small">FR4.2 / FR4.3 — based on your career goal versus opportunities requesting skills you don't have yet.</p>
          <button className="btn-secondary-sm" onClick={loadSkillGapAnalysis} type="button">
            Analyze my skill gaps
          </button>
          {gaps.length > 0 && (
            <>
              <h3>Missing skills</h3>
              <div className="tag-row">
                {gaps.map((g) => (
                  <span key={g} className="tag">
                    {g}
                  </span>
                ))}
              </div>
              <h3>Suggested roadmap</h3>
              <ol>
                {roadmap.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}
