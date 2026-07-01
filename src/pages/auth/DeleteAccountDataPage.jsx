import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function DeleteAccountDataPage() {
  const { deleteMyData, logout } = useAuth();
  const navigate = useNavigate();

  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmText === "DELETE";

  async function handleDelete(event) {
    event.preventDefault();

    setError("");

    if (!canDelete) {
      setError("Type DELETE to confirm.");
      return;
    }

    try {
      setLoading(true);

      await deleteMyData();

      logout();

      navigate("/login", {
        replace: true,
        state: {
          message: "Your private account data has been deleted.",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to delete your private account data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="dashboard-card auth-card">
        <p className="eyebrow">Danger Zone</p>

        <h1>Delete My Account Data</h1>

        <p className="muted">
          This permanently deletes your private account data, including your
          email and password login record.
        </p>

        <div className="dashboard-card" style={{ marginTop: "1rem" }}>
          <strong style={{ color: "#ffcc66" }}>Important:</strong>

          <p className="muted" style={{ marginTop: "0.75rem" }}>
            Prospect records, player notes, manual scouting details,
            enrichment data, exported hockey cards, and platform database
            content are public/shared Prospector data and will not be deleted.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleDelete}>
          <label>
            Type DELETE to confirm
            <input
              className="scout-input"
              type="text"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              autoComplete="off"
              required
            />
          </label>

          {error && (
            <div className="dashboard-card" style={{ marginTop: "1rem" }}>
              <strong style={{ color: "#ff6b6b" }}>{error}</strong>
            </div>
          )}

          <button
            className="button-link"
            type="submit"
            disabled={!canDelete || loading}
          >
            {loading
              ? "Deleting Account Data..."
              : "Delete My Private Account Data"}
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
            Cancel and Return to Dashboard
          </Link>

          <Link className="button-link" to="/change-password">
            Change Password
          </Link>
        </div>
      </section>
    </main>
  );
}