import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function ChangePasswordPage() {
  const { changePassword } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
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

    setSuccess("");
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await changePassword(
        form.currentPassword,
        form.newPassword,
      );

      setSuccess("Password updated successfully.");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="dashboard-card auth-card">
        <p className="eyebrow">Account Security</p>

        <h1>Change Password</h1>

        <p className="muted">
          Keep your account secure by using a strong password that you don't use
          anywhere else.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Current Password
            <input
              className="scout-input"
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={updateField}
              autoComplete="current-password"
              required
            />
          </label>

          <label>
            New Password
            <input
              className="scout-input"
              type="password"
              name="newPassword"
              value={form.newPassword}
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
            {loading ? "Updating Password..." : "Update Password"}
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
          <Link className="button-link" to="/">
            Dashboard
          </Link>

          <Link className="button-link" to="/login">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}