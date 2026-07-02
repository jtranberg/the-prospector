import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    workspaceName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await register({
        name: form.name,
        workspaceName: form.workspaceName,
        email: form.email,
        password: form.password,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="dashboard-card auth-card">
        <p className="eyebrow">Create Your Prospector</p>

        <h1>Register</h1>

        <p className="muted">
          Create your personalized Prospector workspace.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Your Name
            <small className="muted">
              Your personal account name used for your profile.
            </small>
            <input
              className="scout-input"
              type="text"
              name="name"
              value={form.name}
              onChange={updateField}
              autoComplete="name"
              placeholder="Jay Tranberg"
            />
          </label>

          <label>
            My Prospector Name
            <small className="muted">
              The name of your private scouting workspace. It appears on your
              dashboard, browser tab, reports, and shared player cards.
            </small>
            <input
              className="scout-input"
              type="text"
              name="workspaceName"
              value={form.workspaceName}
              onChange={updateField}
              placeholder="Jay's Prospector"
              maxLength={100}
            />
          </label>

          <p className="muted">
            Leave this blank and we&apos;ll create one automatically.
          </p>

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
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              className="scout-input"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateField}
              autoComplete="new-password"
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="button-link" type="submit" disabled={loading}>
            {loading ? "Creating Prospector..." : "Create My Prospector"}
          </button>
        </form>

        <p className="muted">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </section>
    </main>
  );
}