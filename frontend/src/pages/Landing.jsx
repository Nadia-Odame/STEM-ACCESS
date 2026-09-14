import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <section className="hero">
        <h1>Every STEM opportunity for African women, in one place.</h1>
        <p>
          STEM Access unifies scholarships, internships, mentorship, and tech events with AI-powered, personalized
          recommendations — so relevant opportunities find you, instead of getting lost across a dozen websites.
        </p>
        <div className="btn-row">
          {user ? (
            <Link className="btn-primary" to="/dashboard">
              Go to your dashboard
            </Link>
          ) : (
            <>
              <Link className="btn-primary" to="/register">
                Get started
              </Link>
              <Link className="btn-secondary" to="/opportunities">
                Browse opportunities
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>🎯 Personalized recommendations</h3>
          <p>An AI recommendation engine matches opportunities to your skills, interests, and career goals (FR4).</p>
        </div>
        <div className="feature">
          <h3>🧭 Mentorship, matched</h3>
          <p>Find mentors by expertise and request sessions directly on the platform (FR5).</p>
        </div>
        <div className="feature">
          <h3>📋 Track everything</h3>
          <p>Save, apply, and track every scholarship, internship, and event deadline in one dashboard (FR6, FR8).</p>
        </div>
      </section>
    </div>
  );
}
