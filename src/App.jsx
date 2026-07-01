import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "./App.css";

import DashboardPage from "./pages/DashboardPage";
import ProspectsPage from "./pages/ProspectsPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import ContactPage from "./pages/ContactPage";

import TrustCenterPage from "./pages/legal/TrustCenterPage";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import SecurityPage from "./pages/legal/SecurityPage";
import ResponsibleAIPage from "./pages/legal/ResponsibleAIPage";
import DataSourcesPage from "./pages/legal/DataSourcesPage";
import CompliancePage from "./pages/legal/CompliancePage";
import AboutPage from "./pages/legal/AboutPage";
import TermsOfServicePage from "./pages/legal/TermsOfServicePage";
import ReleaseNotesPage from "./pages/legal/ReleaseNotesPage";
import AccessibilityPage from "./pages/legal/AccessibilityPage";
import SystemArchitecturePage from "./pages/legal/SystemArchitecturePage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import DeleteAccountDataPage from "./pages/auth/DeleteAccountDataPage";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import CookieConsentBanner from "./components/common/CookieConsentBanner";

import { loadCsvProspects } from "./lib/prospectMapper";
import { loadProspects } from "./lib/liveProspects";
import { getProspectScore } from "./lib/prospectScoring";
import { useAuth } from "./hooks/useAuth";

const csvProspects = loadCsvProspects();

function App() {
  const [prospects, setProspects] = useState(csvProspects);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadMongoProspects() {
      try {
        const mongoPlayers = await loadProspects(100);

        if (mongoPlayers.length > 0) {
          setProspects(mongoPlayers);
        }
      } catch (error) {
        console.error("Using CSV fallback:", error.message);
      }
    }

    loadMongoProspects();
  }, []);

  const rankedProspects = [...prospects].sort(
    (a, b) => getProspectScore(b) - getProspectScore(a),
  );

  return (
    <>
      <nav className="top-nav">
        <div className="mobile-nav-header">
          <strong>Dave Hall&apos;s Prospector</strong>

          <button
            className="hamburger-button"
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        </div>

        <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <Link
            to="/"
            className="nav-pill"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            to="/prospects"
            className="nav-pill"
            onClick={() => setMobileMenuOpen(false)}
          >
            Prospect Database
          </Link>

          <Link
            to="/trust"
            className="nav-pill"
            onClick={() => setMobileMenuOpen(false)}
          >
            Trust Center
          </Link>

          <Link
            to="/contact"
            className="nav-pill"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
        </div>

        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="account-menu">
              <button
                className="account-button"
                type="button"
                onClick={() => setAccountMenuOpen((open) => !open)}
                aria-expanded={accountMenuOpen}
              >
                {user?.name || "Scout"} ▾
              </button>

              {accountMenuOpen && (
                <div className="account-dropdown">
                  <div className="account-summary">
                    <strong>{user?.name || "Scout"}</strong>
                    <span>{user?.role || "SCOUT"}</span>
                    <small>Secure Scout Session</small>
                  </div>

                  <Link
                    to="/change-password"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Change Password
                  </Link>

                  <Link
                    to="/delete-my-data"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Delete My Account Data
                  </Link>

                  <span className="session-badge">Secure Session</span>

                  <Link
                    to="/trust"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Trust Center
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setAccountMenuOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-pill"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-pill"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>

        <a
          href="https://appintelligence.ca"
          target="_blank"
          rel="noreferrer"
          className="ai-badge nav-ai-badge"
          onClick={() => setMobileMenuOpen(false)}
        >
          Powered by App Intelligence.ca
        </a>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage prospects={rankedProspects} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prospects"
          element={
            <ProtectedRoute>
              <ProspectsPage prospects={rankedProspects} />
            </ProtectedRoute>
          }
        />

        <Route path="/trust" element={<TrustCenterPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/responsible-ai" element={<ResponsibleAIPage />} />
        <Route path="/data-sources" element={<DataSourcesPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/release-notes" element={<ReleaseNotesPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route
          path="/system-architecture"
          element={<SystemArchitecturePage />}
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delete-my-data"
          element={
            <ProtectedRoute>
              <DeleteAccountDataPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <CookieConsentBanner />
    </>
  );
}

export default App;