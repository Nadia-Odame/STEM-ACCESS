import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        <p className="muted">Welcome back to STEM Access.</p>
        {error && <div className="alert-error">{error}</div>}
        <label>
          Email
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Password
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? "Logging in..." : "Log in"}
        </button>
        <p className="muted small">
          No account? <Link to="/register">Sign up</Link>
        </p>
        <p className="muted small">
          Demo accounts (after running <code>npm run seed</code>): <code>student@stemaccess.demo</code> / <code>Password123!</code>
        </p>
      </form>
    </div>
  );
}
