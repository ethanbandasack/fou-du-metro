import { describe, expect, it } from "vitest";
import type { StopRow } from "@/domain/csv";
import { auditNetwork, formatAudit } from "@/server/idfm/audit";
import type { OfficialStop } from "@/server/idfm/official";

const row = (name: string, lineId: string, lat = 48.85, lon = 2.35, zone = ""): StopRow => ({
  name, lineId, mode: "METRO", order: 0, lat, lon, arrondissement: 1, historicFigure: false, colorInName: false,
  openedAfter1980: false, leftBank: false, commune: "Paris", zone, opening: null,
});
const official = (name: string, lineId: string, zdcId: string, lat = 48.85, lon = 2.35): OfficialStop => ({
  name, lineId, mode: "METRO", lat, lon, zdcId, zdcName: name, openedOn: null,
});

function audit(rows: StopRow[], officialStops: OfficialStop[], officialLines = []) {
  return auditNetwork({ rows, official: officialStops, officialLines });
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

  it("ignores official duplicates and stations whose zone the line already serves", () => {
    const rows = [row("Paris Saint-Lazare", "J", 48.876, 2.325, "z1")];
    const officialStops = [official("Saint-Lazare", "J", "z1", 48.876, 2.325), official("Saint-Lazare", "J", "z1", 48.876, 2.325)];
    expect(audit(rows, officialStops).missing).toEqual([]);
  });

  it("does not expect future stations in the official open data", () => {
    const future = { ...row("Bagneux", "15"), opening: "2099-12-31" };
    expect(audit([future], []).unmatched).toEqual([]);
  });

  it("reports rows whose stored zone differs from the official one", () => {
    const rows = [row("Châtelet", "1", 48.85, 2.35, "old"), row("Châtelet", "4", 48.85, 2.35, "z1")];
    const officialStops = [official("Châtelet", "1", "z1"), official("Châtelet", "4", "z1")];
    expect(audit(rows, officialStops).zones).toEqual([{ lineId: "1", name: "Châtelet", local: "old", official: "z1" }]);
  });

  it("reports colors that differ from the official ones, for local lines only", () => {
    const result = audit([row("Nation", "1")], [official("Nation", "1", "z1")], [
      { lineId: "1", active: true, colors: { background: "#123456", text: "#FFFFFF" } },
      { lineId: "18", active: true, colors: { background: "#00A092", text: "#FFFFFF" } },
    ] as never);
    expect(result.colors).toEqual([{ lineId: "1", local: "#FFBE00 / #000000", official: "#123456 / #FFFFFF" }]);
  });
});

describe("formatAudit", () => {
  it("summarizes each section with its count", () => {
    const text = formatAudit({ unmatched: [], missing: [{ lineId: "18", name: "Polytechnique" }], zones: [], colors: [] });
    expect(text).toContain("Gares officielles absentes localement : 1");
    expect(text).toContain("- 18 · Polytechnique");
    expect(text).toContain("Zones de correspondance à mettre à jour : 0");
  });
});

describe("colors of lines not open yet", () => {
  it("are not compared: the referential holds placeholders for them", () => {
    const result = auditNetwork({
      rows: [row("Bagneux", "15")],
      official: [],
      officialLines: [{ lineId: "15", active: false, colors: { background: "#AAAAAA", text: "#000000" } }],
    });
    expect(result.colors).toEqual([]);
  });
});
