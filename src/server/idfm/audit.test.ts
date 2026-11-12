import { describe, expect, it } from "vitest";
import type { StopRow } from "@/domain/csv";
import { buildNetwork } from "@/domain/network";
import { auditNetwork, formatAudit } from "@/server/idfm/audit";
import type { OfficialStop } from "@/server/idfm/official";

const row = (name: string, lineId: string, lat = 48.85, lon = 2.35): StopRow => ({
  name, lineId, mode: "METRO", order: 0, lat, lon, arrondissement: 1, historicFigure: false, colorInName: false,
  openedAfter1980: false, leftBank: false, hasRer: false, hasTram: false, commune: "Paris",
});
const official = (name: string, lineId: string, zdcId: string, lat = 48.85, lon = 2.35): OfficialStop => ({
  name, lineId, mode: "METRO", lat, lon, zdcId, zdcName: name, openedOn: null,
});

function audit(rows: StopRow[], officialStops: OfficialStop[], officialLines = []) {
  const { stations } = buildNetwork({ rows, lineOrders: [], aliases: [] });
  return auditNetwork({ rows, stations, official: officialStops, officialLines });
}

describe("auditNetwork", () => {
  it("matches a stop spelled differently on the same line", () => {
    const result = audit([row("La Défense (Grande Arche)", "1")], [official("La Défense", "1", "z1", 48.851)]);
    expect(result.unmatched).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it("reports local stops without an official counterpart and official stops missing locally", () => {
    const result = audit([row("Ghost", "1")], [official("Nation", "2", "z1"), official("Polytechnique", "18", "z2")]);
    expect(result.unmatched).toEqual([{ lineId: "1", name: "Ghost" }]);
    expect(result.missing).toEqual([
      { lineId: "2", name: "Nation" },
      { lineId: "18", name: "Polytechnique" },
    ]);
  });

  it("compares the lines of each station with its official transfer zone", () => {
    const rows = [row("Châtelet", "1"), row("Châtelet", "4"), row("Rivoli", "7", 48.86)];
    const officialStops = [official("Châtelet", "1", "z1"), official("Châtelet", "4", "z1"), official("Châtelet", "7", "z1", 48.851)];
    expect(audit(rows, officialStops).connections).toEqual([{ station: "Châtelet", local: ["1", "4"], official: ["1", "4", "7"] }]);
  });

  it("reports colors that differ from the official ones, for local lines only", () => {
    const result = audit([row("Nation", "1")], [official("Nation", "1", "z1")], [
      { lineId: "1", colors: { background: "#123456", text: "#FFFFFF" } },
      { lineId: "18", colors: { background: "#00A092", text: "#FFFFFF" } },
    ] as never);
    expect(result.colors).toEqual([{ lineId: "1", local: "#FFBE00 / #000000", official: "#123456 / #FFFFFF" }]);
  });
});

describe("formatAudit", () => {
  it("summarizes each section with its count", () => {
    const text = formatAudit({ unmatched: [], missing: [{ lineId: "18", name: "Polytechnique" }], connections: [], colors: [] });
    expect(text).toContain("Gares officielles absentes localement : 1");
    expect(text).toContain("- 18 · Polytechnique");
    expect(text).toContain("Correspondances différentes : 0");
  });
});
