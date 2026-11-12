interface Located {
  lat: number;
  lon: number;
}

const km = (a: Located, b: Located) => Math.hypot((a.lat - b.lat) * 110.574, (a.lon - b.lon) * 73.3);

/** Inserts `stop` where it lengthens the path the least (both ends included). */
export function insertByDetour<T extends Located>(order: T[], stop: T): T[] {
  if (order.length === 0) return [stop];
  let best = { index: 0, cost: km(stop, order[0]) };
  const atEnd = km(order[order.length - 1], stop);
  if (atEnd < best.cost) best = { index: order.length, cost: atEnd };
  for (let i = 1; i < order.length; i++) {
    const cost = km(order[i - 1], stop) + km(stop, order[i]) - km(order[i - 1], order[i]);
    if (cost < best.cost) best = { index: i, cost };
  }
  return [...order.slice(0, best.index), stop, ...order.slice(best.index)];
}

/** Orders stops of a new line: the two farthest apart first, then cheapest insertion of the rest. */
export function orderByDetour<T extends Located>(stops: T[]): T[] {
  if (stops.length < 3) return [...stops];
  let ends: [T, T] = [stops[0], stops[1]];
  for (const a of stops) for (const b of stops) if (km(a, b) > km(...ends)) ends = [a, b];
  return stops.filter((s) => !ends.includes(s)).reduce((order, stop) => insertByDetour(order, stop), [...ends] as T[]);
}
