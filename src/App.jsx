import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "./App.css";

import DashboardPage from "./pages/DashboardPage";
import ProspectsPage from "./pages/ProspectsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import ContactPage from "./pages/ContactPage";

import { loadCsvProspects } from "./lib/prospectMapper";
import { loadProspects } from "./lib/liveProspects";
import { getProspectScore } from "./lib/prospectScoring";

const csvProspects = loadCsvProspects();

function App() {
  const [prospects, setProspects] = useState(csvProspects);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <strong>The Prospector</strong>

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
            to="/privacy"
            className="nav-pill"
            onClick={() => setMobileMenuOpen(false)}
          >
            Privacy
          </Link>

          <Link
            to="/terms"
            className="nav-pill"
            onClick={() => setMobileMenuOpen(false)}
          >
            Terms
          </Link>

          <a
            href="https://appintelligence.ca"
            target="_blank"
            rel="noreferrer"
            className="ai-badge nav-ai-badge"
            onClick={() => setMobileMenuOpen(false)}
          >
            Powered by App Intelligence
          </a>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<DashboardPage prospects={rankedProspects} />}
        />

        <Route
          path="/prospects"
          element={<ProspectsPage prospects={rankedProspects} />}
        />

        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
  <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </>
  );
}

export default App;