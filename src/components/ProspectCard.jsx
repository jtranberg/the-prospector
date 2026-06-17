import { getPPG } from "../lib/prospectScoring";

function formatValue(value, fallback = "N/A") {
  return value === null || value === undefined || value === "" ? fallback : value;
}

function ProspectCard({ player, getProspectScore }) {
  if (!player) return null;

  return (
    <div className="prospect-card">
      <div className="prospect-card-top">
        <div>
          <p className="prospect-league">{player.league || "Unknown League"}</p>

          <h3>{player.name || "Unknown Player"}</h3>

          <p className="prospect-team">
            {player.team || "Unknown Team"} • {player.position || "N/A"}
          </p>

          <p className="prospect-team">
            {formatValue(player.nationality, "Nationality unavailable")} • Age{" "}
            {formatValue(player.age)}
          </p>
        </div>

        <div className="prospect-score">
          <span>Score</span>
          <strong>{getProspectScore(player)}</strong>
        </div>
      </div>

      <div className="prospect-stats">
        <div>
          <span>GP</span>
          <strong>{player.games ?? 0}</strong>
        </div>

        <div>
          <span>G</span>
          <strong>{player.goals ?? 0}</strong>
        </div>

        <div>
          <span>A</span>
          <strong>{player.assists ?? 0}</strong>
        </div>

        <div>
          <span>PTS</span>
          <strong>{player.points ?? 0}</strong>
        </div>

        <div>
          <span>PPG</span>
          <strong>{getPPG(player)}</strong>
        </div>

        <div>
          <span>PIM</span>
          <strong>{player.pim ?? 0}</strong>
        </div>
      </div>

      <div className="prospect-stats">
        <div>
          <span>Height</span>
          <strong>
            {player.height ? `${player.height} cm` : "N/A"}
          </strong>
        </div>

        <div>
          <span>Weight</span>
          <strong>
            {player.weight ? `${player.weight} kg` : "N/A"}
          </strong>
        </div>

        <div>
          <span>Shoots</span>
          <strong>{player.shoots || player.catches || "N/A"}</strong>
        </div>

        <div>
          <span>Source</span>
          <strong>{player.source === "elite_prospects" ? "Elite" : "CSV"}</strong>
        </div>
      </div>

      <div className="prospect-footer">
        <span className="status-pill">{player.status || "Watch"}</span>

        <span className="upside-pill">
          {player.upside || "Medium"} Upside
        </span>
      </div>
    </div>
  );
}

export default ProspectCard;