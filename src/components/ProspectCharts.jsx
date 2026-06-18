import { getPPG } from "../lib/prospectScoring";

const COUNTRY_LIMIT = 20;

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

function getCountryPipelineFromStats(nationalities, limit = COUNTRY_LIMIT) {
  const sortedCountries = [...nationalities]
    .map((item) => ({
      country: item.nationality || item.country || "Unknown",
      count: item.count || 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topCountries = sortedCountries.slice(0, limit);
  const otherCountries = sortedCountries.slice(limit);

  const otherCount = otherCountries.reduce(
    (total, item) => total + item.count,
    0,
  );

  if (otherCount > 0) {
    topCountries.push({
      country: `Other ${otherCountries.length} Countries Combined`,
      count: otherCount,
    });
  }

  return topCountries;
}

function ProspectCharts({
  prospects = [],
  nationalityStats = [],
  getProspectScore,
}) {
  const topProspects = getTopLoadedProspects(prospects, getProspectScore);
  const countryPipeline = getCountryPipelineFromStats(nationalityStats);

  console.log("Prospects loaded:", prospects.length);
  console.log("Nationality stats loaded:", nationalityStats.length);

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
          <h3>Global Prospect Pipeline</h3>
          <p>
            Top nationality pipelines from the full database, with remaining
            countries grouped together.
          </p>
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