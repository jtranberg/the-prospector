import Papa from "papaparse";
import rawProspectsCsv from "../data/prospects.csv?raw";

export function loadCsvProspects() {
  return Papa.parse(rawProspectsCsv, {
    header: true,
    skipEmptyLines: true,
  }).data.map((player) => ({
    ...player,
    id: Number(player.id),
    age: Number(player.age),
    games: Number(player.games),
    goals: Number(player.goals),
    assists: Number(player.assists),
    points: Number(player.points),
    pim: Number(player.pim),
    source: "csv",
  }));
}