import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email);

      setSuccess(
        "If an account exists for that email address, password reset instructions have been sent."
      );

      setEmail("");
    } catch (err) {
      setError(err.message || "Unable to process your request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="dashboard-card auth-card">
        <p className="eyebrow">Account Recovery</p>

        <h1>Forgot Password</h1>

        <p className="muted">
          Enter the email address associated with your account. If it exists,
          we'll send you instructions to reset your password.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email Address
            <input
              className="scout-input"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
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
            {loading ? "Sending..." : "Send Reset Link"}
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