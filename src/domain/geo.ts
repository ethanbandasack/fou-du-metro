/** Planar point in kilometres (x east, y south: SVG orientation). */
export interface Point {
  x: number;
  y: number;
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const KM_PER_DEGREE_LAT = 110.574;
const KM_PER_DEGREE_LON_AT_PARIS = 111.32 * Math.cos((48.8566 * Math.PI) / 180);

/** Equirectangular projection, accurate enough at the scale of Île-de-France. */
export function project(lat: number, lon: number): Point {
  return { x: lon * KM_PER_DEGREE_LON_AT_PARIS, y: -lat * KM_PER_DEGREE_LAT };
}

function quantiles(values: number[], trim: number): [number, number] {
  const sorted = [...values].sort((a, b) => a - b);
  const last = sorted.length - 1;
  return [sorted[Math.floor(trim * last)], sorted[Math.ceil((1 - trim) * last)]];
}

/**
 * Smallest box around the points plus `margin` km. `trim` drops that share of
 * extreme values on each axis, so a few far-away stops do not shrink the rest.
 */
export function fitViewBox(points: Point[], { margin, trim = 0 }: { margin: number; trim?: number }): ViewBox {
  if (points.length === 0) {
    const paris = project(48.8566, 2.3522);
    return { x: paris.x - 10, y: paris.y - 10, width: 20, height: 20 };
  }
  const [minX, maxX] = quantiles(points.map((p) => p.x), trim);
  const [minY, maxY] = quantiles(points.map((p) => p.y), trim);
  return { x: minX - margin, y: minY - margin, width: maxX - minX + 2 * margin, height: maxY - minY + 2 * margin };
}

/** Scales the box by `factor` (< 1 zooms in) keeping `center` at the same place on screen. */
export function zoomViewBox(view: ViewBox, factor: number, center: Point): ViewBox {
  return {
    x: center.x - (center.x - view.x) * factor,
    y: center.y - (center.y - view.y) * factor,
    width: view.width * factor,
    height: view.height * factor,
  };
}

const MIN_JUMP_KM = 3;
const JUMP_FACTOR = 4;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/**
 * Polylines of a line's ordered stops. Line files list branches one after
 * another, so the path is cut where the gap is far larger than usual.
 */
export function lineSegments(stops: { lat: number; lon: number }[]): Point[][] {
  const points = stops.map((s) => project(s.lat, s.lon));
  const gaps = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  const maxGap = Math.max(MIN_JUMP_KM, JUMP_FACTOR * median(gaps));

  const segments: Point[][] = [];
  points.forEach((point, i) => {
    if (i === 0 || gaps[i - 1] > maxGap) segments.push([point]);
    else segments[segments.length - 1].push(point);
  });
  return segments;
}
