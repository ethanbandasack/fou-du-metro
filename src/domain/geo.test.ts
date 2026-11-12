import { describe, expect, it } from "vitest";
import { fitViewBox, lineSegments, project, zoomViewBox } from "@/domain/geo";

describe("project", () => {
  it("maps coordinates to kilometres, north up", () => {
    const paris = project(48.8566, 2.3522);
    const north = project(48.8656, 2.3522); // ~1 km north
    const east = project(48.8566, 2.3659); // ~1 km east
    expect(north.y - paris.y).toBeCloseTo(-1, 1);
    expect(east.x - paris.x).toBeCloseTo(1, 1);
  });
});

describe("fitViewBox", () => {
  it("frames all points with a margin", () => {
    const view = fitViewBox([{ x: 0, y: 0 }, { x: 10, y: 4 }], { margin: 1 });
    expect(view).toEqual({ x: -1, y: -1, width: 12, height: 6 });
  });

  it("can ignore outliers to frame the dense part", () => {
    const points = [...Array.from({ length: 98 }, (_, i) => ({ x: i % 10, y: i % 7 })), { x: 500, y: 500 }, { x: -500, y: -500 }];
    const view = fitViewBox(points, { margin: 0, trim: 0.02 });
    expect(view.width).toBeLessThan(20);
  });

  it("returns a default box for no points", () => {
    expect(fitViewBox([], { margin: 1 }).width).toBeGreaterThan(0);
  });
});

describe("zoomViewBox", () => {
  it("zooms around a fixed point", () => {
    const view = zoomViewBox({ x: 0, y: 0, width: 10, height: 10 }, 0.5, { x: 10, y: 10 });
    expect(view).toEqual({ x: 5, y: 5, width: 5, height: 5 });
  });
});

describe("lineSegments", () => {
  const stop = (km: number) => ({ lat: 48.8566, lon: 2.3522 + km / 73.3 });

  it("links consecutive stops", () => {
    expect(lineSegments([stop(0), stop(0.5), stop(1)])).toHaveLength(1);
  });

  it("breaks the path where the line jumps to another branch", () => {
    const segments = lineSegments([stop(0), stop(0.5), stop(1), stop(1.5), stop(20), stop(20.5)]);
    expect(segments.map((s) => s.length)).toEqual([4, 2]);
  });
});
