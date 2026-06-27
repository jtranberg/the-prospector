import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { authLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <main className="app-shell">
        <section className="dashboard-card">
          <p>Checking authentication...</p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}