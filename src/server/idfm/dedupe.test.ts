import { describe, expect, it } from "vitest";
import type { StopRow } from "@/domain/csv";
import { dedupeByZone } from "@/server/idfm/dedupe";

const row = (name: string, lineId: string, zone: string): StopRow => ({
  name, lineId, mode: "TRAIN", order: 0, lat: 48.8, lon: 2.3, arrondissement: 13, historicFigure: false, colorInName: false,
  openedAfter1980: false, leftBank: true, commune: "Paris", zone, opening: null,
});

describe("dedupeByZone", () => {
  it("keeps one row per line and zone, named like the rest of the zone", () => {
    const rows = [
      row("Paris Austerlitz", "TER Centre", "z1"),
      row("Gare d'Austerlitz", "TER Centre", "z1"),
      row("Gare d'Austerlitz", "5", "z1"),
      row("Gare d'Austerlitz", "C", "z1"),
    ];
    const { kept, dropped } = dedupeByZone(rows);
    expect(kept.map((r) => `${r.lineId}·${r.name}`)).toEqual(["TER Centre·Gare d'Austerlitz", "5·Gare d'Austerlitz", "C·Gare d'Austerlitz"]);
    expect(dropped.map((r) => r.name)).toEqual(["Paris Austerlitz"]);
  });

  it("leaves rows without a zone alone", () => {
    const rows = [row("Futur", "15", ""), row("Futur bis", "15", "")];
    expect(dedupeByZone(rows).kept).toHaveLength(2);
  });
});
