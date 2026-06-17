import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { getPPG } from "../lib/prospectScoring";

function ProspectCharts({ prospects, getProspectScore }) {
  const chartData = prospects.map((player) => ({
    name: player.name.split(" ")[0],
    score: getProspectScore(player),
    ppg: Number(getPPG(player)),
  }));

  return (
    <section className="charts-grid">
      <div className="chart-card">
        <h3>Prospect Scores</h3>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid
                stroke="rgba(148,163,184,0.12)"
                strokeDasharray="3 3"
              />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#60a5fa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>Points Per Game</h3>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid
                stroke="rgba(148,163,184,0.12)"
                strokeDasharray="3 3"
              />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="ppg"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ fill: "#7dd3fc", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default ProspectCharts;