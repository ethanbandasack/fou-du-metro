/**
 * Compares src/data with Île-de-France Mobilités open data and prints a report:
 * missing or unknown stations, connections that differ from the official
 * transfer zones, line colors that differ from the official ones.
 *
 * Usage: npm run data:audit
 */
import { buildNetwork } from "@/domain/network";
import { auditNetwork, formatAudit } from "@/server/idfm/audit";
import { IDFM_API, parseOfficialLines, parseOfficialStops } from "@/server/idfm/official";
import { loadSources } from "@/server/loadNetwork";

async function fetchExport(dataset: string, where?: string): Promise<unknown[]> {
  const query = where ? `?where=${encodeURIComponent(where)}` : "";
  const response = await fetch(`${IDFM_API}/${dataset}/exports/json${query}`);
  if (!response.ok) throw new Error(`${dataset}: HTTP ${response.status}`);
  return (await response.json()) as unknown[];
}

async function main() {
  const [stations, lines] = await Promise.all([
    fetchExport("emplacement-des-gares-idf"),
    fetchExport("referentiel-des-lignes", 'transportmode in ("metro", "rail", "tram", "funicular", "cableway")'),
  ]);
  const sources = loadSources();
  const audit = auditNetwork({
    rows: sources.rows,
    stations: buildNetwork(sources).stations,
    official: parseOfficialStops(stations),
    officialLines: parseOfficialLines(lines),
  });
  console.log(formatAudit(audit));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
