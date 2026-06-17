import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "./App.css";

import DashboardPage from "./pages/DashboardPage";
import ProspectsPage from "./pages/ProspectsPage";

import { loadCsvProspects } from "./lib/prospectMapper";
import { loadLiveProspects } from "./lib/liveProspects";
import { getProspectScore } from "./lib/prospectScoring";

const csvProspects = loadCsvProspects();

function App() {
  const [prospects, setProspects] = useState(csvProspects);

  useEffect(() => {
    async function loadProspects() {
      try {
        const livePlayers = await loadLiveProspects();

        if (livePlayers.length > 0) {
          setProspects(livePlayers);
        }
      } catch (error) {
        console.error("Using CSV fallback:", error.message);
      }
    }

    loadProspects();
  }, []);

  const rankedProspects = [...prospects].sort(
    (a, b) => getProspectScore(b) - getProspectScore(a)
  );

  return (
    <>
      <nav className="top-nav">
        <Link to="/">Dashboard</Link>
        <Link to="/prospects">Prospect Database</Link>
      </nav>

      <Routes>
        <Route path="/" element={<DashboardPage prospects={rankedProspects} />} />

        <Route
          path="/prospects"
          element={<ProspectsPage prospects={rankedProspects} />}
        />
      </Routes>
    </>
  );
}

export default App;