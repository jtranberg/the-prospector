import { getPPG } from "../lib/prospectScoring";

function getTopLoadedProspects(prospects, getProspectScore) {
  return [...prospects]
    .map((player) => ({
      ...player,
      score: getProspectScore(player),
      ppg: Number(getPPG(player)) || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function getCountryPipeline(prospects) {
  const countryCounts = {};

  prospects.forEach((player) => {
    const country = player.nationality || "Unknown";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  return Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function ProspectCharts({ prospects = [], getProspectScore }) {
  const topProspects = getTopLoadedProspects(prospects, getProspectScore);
  const countryPipeline = getCountryPipeline(prospects);

  const maxCountryCount = Math.max(
    ...countryPipeline.map((item) => item.count),
    1,
  );

  return (
    <section className="charts-grid">
      <div className="chart-card hockey-chart-card">
        <div className="section-header">
          <h3>Top Loaded Prospects</h3>
          <p>Highest scoring players in the current review set.</p>
        </div>

        <div className="leaderboard-list">
          {topProspects.map((player, index) => (
            <div className="leaderboard-row" key={player.eliteId || player.id}>
              <span className="leaderboard-rank">#{index + 1}</span>

              <div>
                <strong>{player.name || "Unknown Player"}</strong>
                <small>
                  {player.team || "Unknown Team"} • {player.position || "N/A"} •{" "}
                  {player.nationality || "N/A"} • {player.ppg.toFixed(2)} PPG
                </small>
              </div>

              <span className="leaderboard-score">{player.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-card hockey-chart-card">
        <div className="section-header">
          <h3>Country Pipeline</h3>
          <p>Loaded review set grouped by prospect nationality.</p>
        </div>

        <div className="country-pipeline-list">
          {countryPipeline.map((item) => {
            const width = Math.round((item.count / maxCountryCount) * 100);

            return (
              <div className="country-pipeline-row" key={item.country}>
                <div className="country-pipeline-label">
                  <strong>{item.country}</strong>
                  <span>{item.count}</span>
                </div>

                <div className="country-pipeline-track">
                  <div
                    className="country-pipeline-fill"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProspectCharts;