import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "./App.css";

import DashboardPage from "./pages/DashboardPage";
import ProspectsPage from "./pages/ProspectsPage";

import { loadCsvProspects } from "./lib/prospectMapper";
import { loadProspects } from "./lib/liveProspects";
import { getProspectScore } from "./lib/prospectScoring";

const csvProspects = loadCsvProspects();

function App() {
  const [prospects, setProspects] = useState(csvProspects);

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
        <Link to="/" className="nav-pill">
          Dashboard
        </Link>

        <Link to="/prospects" className="nav-pill">
          Prospect Database
        </Link>
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
      </Routes>
    </>
  );
}

export default App;
