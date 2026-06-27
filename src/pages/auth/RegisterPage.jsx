import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    try {
      setLoading(true);

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="dashboard-card auth-card">
        <p className="eyebrow">Create Account</p>

        <h1>Join The Prospector</h1>

        <p className="muted">
          Create your secure scouting account to access protected platform
          features.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              className="scout-input"
              type="text"
              name="name"
              value={form.name}
              onChange={updateField}
              required
            />
          </label>

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

          <button
            className="button-link"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="muted">
          Already have an account?{" "}
          <Link to="/login">Log in here</Link>
        </p>
      </section>
    </main>
  );
}