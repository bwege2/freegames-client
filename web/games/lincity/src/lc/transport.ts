// transport.c: general_transport() evens out the seven kinds of stuff (food, jobs, coal, goods, ore,
// steel, waste: int_1..int_7) between a transport square and its connected neighbours, and burns waste.
import { MI, MPOL, INFO, FLAGS, I1, I7 } from './map.ts';
import { WORLD_SIDE_LEN, WASTE_BURN_ON_TRANSPORT, TRANSPORT_BURN_WASTE_COUNT } from './consts.ts';

const L = -WORLD_SIDE_LEN * INFO, U = -INFO, R = WORLD_SIDE_LEN * INFO, D = INFO;
/** the neighbours to average with, by the low 4 flags (FLAG_LEFT 1, FLAG_UP 2, FLAG_RIGHT 4, FLAG_DOWN 8) */
const NEIGHBOURS: number[][] = [];
for (let f = 0; f < 16; f++) {
  const n: number[] = [];
  if (f & 1) n.push(L);
  if (f & 2) n.push(U);
  if (f & 4) n.push(R);
  if (f & 8) n.push(D);
  NEIGHBOURS.push(n);
}

/** minfo: the square's record in MI; pol: its index in MPOL; wb: the caller's static wb_count */
export function general_transport(minfo: number, pol: number, max_waste: number, wb: { count: number }): void {
  const nb = NEIGHBOURS[MI[minfo + FLAGS] & 0x0f];
  if (nb.length === 0) return;
  const k = nb.length + 1;
  for (let base = minfo + I1; base <= minfo + I7; base++) {
    let tot = MI[base];
    for (const o of nb) tot = (tot + MI[base + o]) | 0;
    const av = (tot / k) | 0;
    for (const o of nb) MI[base + o] = av;
    MI[base] = av + (tot % k);
  }
  const w = minfo + I7;
  if (MI[w] >= max_waste) {
    MI[w] -= WASTE_BURN_ON_TRANSPORT;
    ++MPOL[pol];
    if (wb.count > TRANSPORT_BURN_WASTE_COUNT) wb.count = 0;
    else ++wb.count;
  }
}
