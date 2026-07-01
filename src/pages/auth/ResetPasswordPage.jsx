import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (!token) {
      setError("This password reset link is invalid or has expired.");
      return;
    }

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

      await resetPassword(token, form.password);

      setSuccess("Your password has been reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="dashboard-card auth-card">
        <p className="eyebrow">Account Recovery</p>

        <h1>Reset Password</h1>

        <p className="muted">
          Enter a new password for your account. Your password must be at least
          8 characters long.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            New Password
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
            Confirm New Password
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

          {error && (
            <div className="dashboard-card" style={{ marginTop: "1rem" }}>
              <strong style={{ color: "#ff6b6b" }}>{error}</strong>
            </div>
          )}

          {success && (
            <div className="dashboard-card" style={{ marginTop: "1rem" }}>
              <strong style={{ color: "#5cc489" }}>{success}</strong>
            </div>
          )}

          <button
            className="button-link"
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link className="button-link" to="/login">
            Back to Login
          </Link>

          <Link className="button-link" to="/register">
            Create Account
          </Link>
        </div>
      </section>
    </main>
  );
}