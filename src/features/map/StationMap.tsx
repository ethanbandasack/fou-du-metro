'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Maximize2, Minus, Plus } from 'lucide-react';
import { fitViewBox, lineSegments, project, zoomViewBox, type Point, type ViewBox } from '@/domain/geo';
import type { Line, Stop } from '@/domain/network';

interface StationMapProps {
  lines: Line[];
  found: ReadonlySet<string>;
  /** Keys to emphasise (latest finds). */
  highlighted: string[];
  revealAll: boolean;
  showUnfound: boolean;
  onShowUnfoundChange: (show: boolean) => void;
}

interface PlacedStop extends Point {
  stop: Stop;
  color: string;
}

/** Labels appear once the visible width is below this many kilometres. */
const LABEL_MAX_WIDTH_KM = 14;
const UNFOUND_COLOR = '#9CA3AF';

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number, matrix?: DOMMatrix): Point {
  const inverse = matrix ?? svg.getScreenCTM()?.inverse();
  const point = new DOMPoint(clientX, clientY).matrixTransform(inverse);
  return { x: point.x, y: point.y };
}

export function StationMap({ lines, found, highlighted, revealAll, showUnfound, onShowUnfoundChange }: StationMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ origin: Point; view: ViewBox; inverse: DOMMatrix } | null>(null);

  const paths = useMemo(
    () => lines.map(line => ({ line, segments: lineSegments(line.stops) })),
    [lines]
  );
  const stops = useMemo<PlacedStop[]>(
    () => lines.flatMap(line => line.stops.map(stop => ({ stop, color: line.colors.background, ...project(stop.lat, stop.lon) }))),
    [lines]
  );
  const initialView = useMemo(() => fitViewBox(stops, { margin: 1, trim: 0.02 }), [stops]);
  const [view, setView] = useState(initialView);
  useEffect(() => setView(initialView), [initialView]);

  // Wheel zoom needs a non-passive listener to keep the page from scrolling.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const center = toSvgPoint(svg, event.clientX, event.clientY);
      setView(v => zoomViewBox(v, event.deltaY > 0 ? 1.2 : 1 / 1.2, center));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  const zoomBy = (factor: number) =>
    setView(v => zoomViewBox(v, factor, { x: v.x + v.width / 2, y: v.y + v.height / 2 }));

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const inverse = svg?.getScreenCTM()?.inverse();
    if (!svg || !inverse) return;
    svg.setPointerCapture(event.pointerId);
    drag.current = { origin: toSvgPoint(svg, event.clientX, event.clientY, inverse), view, inverse };
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const start = drag.current;
    if (!svg || !start) return;
    const current = toSvgPoint(svg, event.clientX, event.clientY, start.inverse);
    setView({ ...start.view, x: start.view.x - (current.x - start.origin.x), y: start.view.y - (current.y - start.origin.y) });
  };

  const endDrag = () => { drag.current = null; };

  const dotRadius = view.width * 0.005;
  const showLabels = view.width < LABEL_MAX_WIDTH_KM;
  const isKnown = (stop: Stop) => found.has(stop.key) || revealAll;
  const labelled = new Set<string>();

  return (
    <section className="bg-card border border-border shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-border">
        <h3 className="text-sm font-bold">Carte</h3>
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={showUnfound} onChange={(e) => onShowUnfoundChange(e.target.checked)} />
            Gares à trouver
          </label>
          <button onClick={() => zoomBy(1 / 1.5)} className="p-1.5 border border-border hover:bg-muted" title="Zoomer"><Plus size={14} /></button>
          <button onClick={() => zoomBy(1.5)} className="p-1.5 border border-border hover:bg-muted" title="Dézoomer"><Minus size={14} /></button>
          <button onClick={() => setView(initialView)} className="p-1.5 border border-border hover:bg-muted" title="Recentrer"><Maximize2 size={14} /></button>
        </div>
      </header>
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        className="w-full h-[55vh] min-h-[320px] bg-muted touch-none cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => svgRef.current && setView(v => zoomViewBox(v, 1 / 2, toSvgPoint(svgRef.current!, e.clientX, e.clientY)))}
        role="img"
        aria-label="Carte des gares"
      >
        {paths.map(({ line, segments }) =>
          segments.map((segment, i) => (
            <polyline
              key={`${line.id}-${i}`}
              points={segment.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={line.colors.background}
              strokeWidth={2.5}
              strokeOpacity={0.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))
        )}

        {stops.map(({ stop, color, x, y }) => {
          const known = isKnown(stop);
          if (!known && !showUnfound) return null;
          const isFound = found.has(stop.key);
          return (
            <circle
              key={`${stop.id}-${stop.order}`}
              cx={x}
              cy={y}
              r={known ? dotRadius * 1.3 : dotRadius * 0.8}
              fill={known ? color : UNFOUND_COLOR}
              fillOpacity={isFound || !known ? 1 : 0.45}
              stroke="var(--card)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            >
              <title>{known ? stop.name : '?'}</title>
            </circle>
          );
        })}

        {stops
          .filter(({ stop }) => highlighted.includes(stop.key))
          .map(({ stop, x, y }) => (
            <circle
              key={`highlight-${stop.id}`}
              cx={x}
              cy={y}
              r={dotRadius * 3}
              fill="none"
              stroke="#16A34A"
              strokeWidth={3}
              vectorEffect="non-scaling-stroke"
              className="animate-pulse"
            />
          ))}

        {showLabels &&
          stops.map(({ stop, x, y }) => {
            if (!isKnown(stop) || labelled.has(stop.key)) return null;
            labelled.add(stop.key);
            return (
              <text
                key={`label-${stop.key}`}
                x={x + dotRadius * 1.6}
                y={y + dotRadius}
                fontSize={view.width * 0.013}
                className="font-parisine fill-foreground"
                stroke="var(--muted)"
                strokeWidth={view.width * 0.003}
                style={{ paintOrder: 'stroke' }}
              >
                {stop.name}
              </text>
            );
          })}
      </svg>
    </section>
  );
}
