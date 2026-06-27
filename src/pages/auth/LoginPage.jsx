import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

async function handleSubmit(event) {
  event.preventDefault();

  try {
    setLoading(true);
    setError("");

    await login(form);

    navigate(from, { replace: true });
  } catch (err) {
    if (err.status === 401) {
      setError("Incorrect email or password.");
    } else if (err.status === 500) {
      setError("The server is temporarily unavailable. Please try again.");
    } else {
      setError(err.message || "Unable to log in. Please try again.");
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="app-shell">
      <section className="dashboard-card auth-card">
        <p className="eyebrow">Secure Access</p>

        <h1>Log in to The Prospector</h1>

        <p className="muted">
          Access scouting tools, enrichment workflows, and protected platform
          features.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              className="scout-input"
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              className="scout-input"
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="button-link" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="muted">
          Need an account? <Link to="/register">Register here</Link>
        </p>
      </section>
    </main>
  );
}