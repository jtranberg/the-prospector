import { getProspectScore } from "../lib/prospectScoring";

function ProspectTable({ prospects = [] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Nationality</th>
            <th>Pos</th>
            <th>Status</th>
            <th>Source</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {prospects.map((player) => (
            <tr key={player.id}>
              <td>
                <strong>{player.name || "Unknown Player"}</strong>
                <small>{player.dateOfBirth || "Birth date unavailable"}</small>
              </td>

              <td>{player.nationality || "N/A"}</td>
              <td>{player.position || "N/A"}</td>

              <td>
                <span className="status-pill">{player.status || "Watch"}</span>
              </td>

              <td>{player.source === "elite_prospects" ? "Elite" : "CSV"}</td>

              <td>
                <strong>{getProspectScore(player)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProspectTable;