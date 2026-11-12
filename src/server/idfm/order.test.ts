import { describe, expect, it } from "vitest";
import { insertByDetour, orderByDetour } from "@/server/idfm/order";

const at = (name: string, km: number, northKm = 0) => ({ name, lat: 48.85 + northKm / 110.574, lon: 2.35 + km / 73.3 });
const names = (stops: { name: string }[]) => stops.map((s) => s.name);

describe("insertByDetour", () => {
  const line = [at("A", 0), at("B", 1), at("C", 2)];

  it("extends a line at the nearest end", () => {
    expect(names(insertByDetour(line, at("D", 3)))).toEqual(["A", "B", "C", "D"]);
    expect(names(insertByDetour(line, at("Z", -1)))).toEqual(["Z", "A", "B", "C"]);
  });

  it("fills a gap between two stations", () => {
    expect(names(insertByDetour(line, at("BC", 1.5, 0.1)))).toEqual(["A", "B", "BC", "C"]);
  });

  it("starts an empty line", () => {
    expect(names(insertByDetour([], at("A", 0)))).toEqual(["A"]);
  });
});

describe("orderByDetour", () => {
  it("orders a shuffled straight line from one end to the other", () => {
    const shuffled = [at("C", 2), at("A", 0), at("E", 4), at("B", 1), at("D", 3)];
    const ordered = names(orderByDetour(shuffled));
    expect([ordered.join(), [...ordered].reverse().join()]).toContain("A,B,C,D,E");
  });
});
