// market.c: markets, and getting and putting goods from markets in range or from the transport around
// a building (get_stuff2/3/4, put_stuff2/3/4 walk the squares around it as pointer offsets, (ThMO)).
import * as C from './consts.ts';
import { G, marketx, markety } from './g.ts';
import { MT, MG, MI, MPOL, P, IX, FLAGS, I1, I2, I3, I4, I5, I6, I7, INFO } from './map.ts';
import { abs, idiv, rand } from './c.ts';
import { main_groups, get_group_of_type } from './lintypes.ts';
import { inventory } from './stats.ts';
import { do_error } from './main.ts';
import { mps_store_title, mps_store_sfp } from './mps.ts';

const W = C.WORLD_SIDE_LEN;
const inRange = (q: number, x: number, y: number, r: number): boolean => abs(marketx[q] - x) < r && abs(markety[q] - y) < r;
const mi = (q: number): number => IX(marketx[q], markety[q]);

export function get_jobs(x: number, y: number, jobs: number): number {
  if (G.numof_markets > 0) {
    for (let q = 0; q < G.numof_markets; q++) {
      if (inRange(q, x, y, C.MARKET_RANGE) && MI[mi(q) + I2] > idiv(3 * jobs, 2)) {
        MI[mi(q) + I2] -= jobs;
        G.income_tax = (G.income_tax + jobs) | 0;
        return 1;
      }
    }
  }
  if (get_stuff(x, y, jobs, C.T_JOBS) !== 0) {
    G.income_tax = (G.income_tax + jobs) | 0;
    return 1;
  }
  return 0;
}

export function put_jobs(x: number, y: number, jobs: number): number {
  if (G.numof_markets > 0) {
    for (let q = 0; q < G.numof_markets; q++) {
      if (MI[mi(q) + I2] >= C.MAX_JOBS_IN_MARKET - jobs) continue;
      if (inRange(q, x, y, C.EMPLOYER_RANGE)) {
        MI[mi(q) + I2] += jobs;
        return 1;
      }
    }
  }
  if (put_stuff(x, y, jobs, C.T_JOBS) !== 0) return 1;
  return 0;
}

/** get_food, get_steel, get_ore, get_coal, get_waste: the same code on another field */
function getFrom(field: number, type: number, x: number, y: number, n: number): number {
  if (G.numof_markets > 0) {
    for (let q = 0; q < G.numof_markets; q++) {
      if (inRange(q, x, y, C.MARKET_RANGE) && MI[mi(q) + field] > n) {
        MI[mi(q) + field] -= n;
        return 1;
      }
    }
  }
  if (get_stuff(x, y, n, type) !== 0) return 1;
  return 0;
}
/** put_food (range ORG_FARM_RANGE), put_goods, put_waste, put_steel, put_ore, put_coal */
function putTo(field: number, type: number, max: number, range: number, x: number, y: number, n: number): number {
  if (G.numof_markets > 0) {
    for (let q = 0; q < G.numof_markets; q++) {
      if (MI[mi(q) + field] >= max - n) continue;
      if (inRange(q, x, y, range)) {
        MI[mi(q) + field] += n;
        return 1;
      }
    }
  }
  if (put_stuff(x, y, n, type) !== 0) return 1;
  return 0;
}

export const get_food = (x: number, y: number, n: number): number => getFrom(I1, C.T_FOOD, x, y, n);
export const put_food = (x: number, y: number, n: number): number => putTo(I1, C.T_FOOD, C.MAX_FOOD_IN_MARKET, C.ORG_FARM_RANGE, x, y, n);

export function get_goods(x: number, y: number, goods: number): number {
  if (G.numof_markets > 0) {
    for (let q = 0; q < G.numof_markets; q++) {
      if (inRange(q, x, y, C.MARKET_RANGE) && MI[mi(q) + I4] > goods) {
        MI[mi(q) + I4] -= goods;
        G.goods_tax = (G.goods_tax + goods) | 0;
        G.goods_used = (G.goods_used + goods) | 0;
        MI[mi(q) + I7] += idiv(goods, 3);
        return 1;
      }
    }
  }
  if (get_stuff(x, y, goods, C.T_GOODS) !== 0) {
    put_stuff(x, y, idiv(goods, 3), C.T_WASTE);
    G.goods_tax = (G.goods_tax + goods) | 0;
    G.goods_used = (G.goods_used + goods) | 0;
    return 1;
  }
  return 0;
}
export const put_goods = (x: number, y: number, n: number): number => putTo(I4, C.T_GOODS, C.MAX_GOODS_IN_MARKET, C.MARKET_RANGE, x, y, n);
export const put_waste = (x: number, y: number, n: number): number => putTo(I7, C.T_WASTE, C.MAX_WASTE_IN_MARKET, C.MARKET_RANGE, x, y, n);
export const get_waste = (x: number, y: number, n: number): number => getFrom(I7, C.T_WASTE, x, y, n);
export const get_steel = (x: number, y: number, n: number): number => getFrom(I6, C.T_STEEL, x, y, n);
export const put_steel = (x: number, y: number, n: number): number => putTo(I6, C.T_STEEL, C.MAX_STEEL_IN_MARKET, C.MARKET_RANGE, x, y, n);
export const get_ore = (x: number, y: number, n: number): number => getFrom(I5, C.T_ORE, x, y, n);
export const put_ore = (x: number, y: number, n: number): number => putTo(I5, C.T_ORE, C.MAX_ORE_IN_MARKET, C.MARKET_RANGE, x, y, n);
export const get_coal = (x: number, y: number, n: number): number => getFrom(I3, C.T_COAL, x, y, n);
export const put_coal = (x: number, y: number, n: number): number => putTo(I3, C.T_COAL, C.MAX_COAL_IN_MARKET, C.MARKET_RANGE, x, y, n);

export function add_a_market(x: number, y: number): number {
  if (G.numof_markets >= C.MAX_NUMOF_MARKETS) return 0;
  marketx[G.numof_markets] = x;
  markety[G.numof_markets] = y;
  G.numof_markets++;
  MI[IX(x, y) + I2] = 2000;
  return 1;
}

export function remove_a_market(x: number, y: number): void {
  let q;
  for (q = 0; q < G.numof_markets; q++) if (marketx[q] === x && markety[q] === y) break;
  for (; q < G.numof_markets; q++) {
    marketx[q] = marketx[q + 1];
    markety[q] = markety[q + 1];
  }
  G.numof_markets--;
}

export function do_market(x: number, y: number): void {
  let extra_jobs = 0;
  const t = (xx: number, yy: number): boolean => (MI[IX(xx, yy) + FLAGS] & C.FLAG_IS_TRANSPORT) !== 0;
  shuffle_markets();
  if (x > 0 && t(x - 1, y)) extra_jobs += deal_with_transport(x, y, x - 1, y);
  if (x > 0 && t(x - 1, y + 1)) extra_jobs += deal_with_transport(x, y, x - 1, y + 1);
  if (y > 0 && t(x, y - 1)) extra_jobs += deal_with_transport(x, y, x, y - 1);
  if (y > 0 && t(x + 1, y - 1)) extra_jobs += deal_with_transport(x, y, x + 1, y - 1);
  if (x < W - 2 && t(x + 2, y)) extra_jobs += deal_with_transport(x, y, x + 2, y);
  if (x < W - 2 && t(x + 2, y + 1)) extra_jobs += deal_with_transport(x, y, x + 2, y + 1);
  if (y < W - 2 && t(x, y + 2)) extra_jobs += deal_with_transport(x, y, x, y + 2);
  if (y < W - 2 && t(x + 1, y + 2)) extra_jobs += deal_with_transport(x, y, x + 1, y + 2);
  const i = IX(x, y);
  if (MI[i + I1] > C.MAX_FOOD_IN_MARKET) MI[i + I1] = C.MAX_FOOD_IN_MARKET;
  if (MI[i + I2] > C.MAX_JOBS_IN_MARKET) MI[i + I2] = C.MAX_JOBS_IN_MARKET;
  if (MI[i + I4] > C.MAX_GOODS_IN_MARKET) MI[i + I4] = C.MAX_GOODS_IN_MARKET;
  if (G.total_time % 25 === 17) {
    if (MI[i + I1] <= 0) {
      if (MI[i + I2] > 0) MT[P(x, y)] = C.CST_MARKET_LOW;
      else MT[P(x, y)] = C.CST_MARKET_EMPTY;
    } else if (MI[i + I1] < idiv(C.MARKET_FOOD_SEARCH_TRIGGER, 2)) MT[P(x, y)] = C.CST_MARKET_LOW;
    else if (MI[i + I1] < C.MAX_FOOD_IN_MARKET - idiv(C.MAX_FOOD_IN_MARKET, 4)) MT[P(x, y)] = C.CST_MARKET_MED;
    else MT[P(x, y)] = C.CST_MARKET_FULL;
  }
  get_jobs(x, y, 1 + idiv(extra_jobs, 5));
  inventory(x, y);
}

export function shuffle_markets(): void {
  const m = idiv(G.numof_markets, 4) + 1;
  for (let x = 0; x < m; x++) {
    const r = rand() % G.numof_markets;
    if (r === x) continue;
    let q = marketx[x];
    marketx[x] = marketx[r];
    marketx[r] = q;
    q = markety[x];
    markety[x] = markety[r];
    markety[r] = q;
  }
}

/** the market's and the transport's share of one kind of stuff: market keeps MAX_IN_MARKET / (MAX_ON + MAX_IN) */
function share(mi_: number, ti: number, field: number, maxOn: number, maxIn: number): void {
  const r = idiv(maxIn * 1000, maxOn + maxIn);
  const i = (MI[mi_ + field] + MI[ti + field]) | 0;
  MI[mi_ + field] = idiv(Math.imul(i, r), 1000);
  MI[ti + field] = i - MI[mi_ + field];
}

export function deal_with_transport(x: number, y: number, tx: number, ty: number): number {
  let extra_jobs = 3;
  const flags = MI[IX(x, y) + FLAGS];
  const mi_ = IX(x, y), ti = IX(tx, ty);
  const tg = MG[P(tx, ty)];
  let k: 0 | 1 | 2;
  if (tg === C.GROUP_TRACK) k = 0;
  else if (tg === C.GROUP_RAIL) k = 2;
  else if (tg === C.GROUP_ROAD) k = 1;
  else return 0;
  const on = [
    [C.MAX_FOOD_ON_TRACK, C.MAX_JOBS_ON_TRACK, C.MAX_COAL_ON_TRACK, C.MAX_GOODS_ON_TRACK, C.MAX_ORE_ON_TRACK, C.MAX_STEEL_ON_TRACK, C.MAX_WASTE_ON_TRACK],
    [C.MAX_FOOD_ON_ROAD, C.MAX_JOBS_ON_ROAD, C.MAX_COAL_ON_ROAD, C.MAX_GOODS_ON_ROAD, C.MAX_ORE_ON_ROAD, C.MAX_STEEL_ON_ROAD, C.MAX_WASTE_ON_ROAD],
    [C.MAX_FOOD_ON_RAIL, C.MAX_JOBS_ON_RAIL, C.MAX_COAL_ON_RAIL, C.MAX_GOODS_ON_RAIL, C.MAX_ORE_ON_RAIL, C.MAX_STEEL_ON_RAIL, C.MAX_WASTE_ON_RAIL],
  ][k];
  if (flags & C.FLAG_MB_FOOD) share(mi_, ti, I1, on[0], C.MAX_FOOD_IN_MARKET);
  if (flags & C.FLAG_MB_JOBS) share(mi_, ti, I2, on[1], C.MAX_JOBS_IN_MARKET);
  if (flags & C.FLAG_MB_COAL) share(mi_, ti, I3, on[2], C.MAX_COAL_IN_MARKET);
  if (flags & C.FLAG_MB_GOODS) share(mi_, ti, I4, on[3], C.MAX_GOODS_IN_MARKET);
  if (flags & C.FLAG_MB_ORE) share(mi_, ti, I5, on[4], C.MAX_ORE_IN_MARKET);
  if (flags & C.FLAG_MB_STEEL) share(mi_, ti, I6, on[5], C.MAX_STEEL_IN_MARKET);
  share(mi_, ti, I7, on[6], C.MAX_WASTE_IN_MARKET);
  // track only: if it's full of waste, burn some to make pollution
  if (k === 0 && MI[mi_ + I7] >= idiv(99 * C.MAX_WASTE_IN_MARKET, 100)) {
    MPOL[P(x, y)] += 3000;
    MI[mi_ + I7] -= idiv(7 * C.MAX_WASTE_IN_MARKET, 10);
  }
  void extra_jobs;
  return 3;
}

export function get_stuff(x: number, y: number, stuff: number, stuff_type: number): number {
  const minfo = IX(x, y);
  switch (main_groups[MG[P(x, y)]].size) {
    case 2: return get_stuffN(minfo, stuff, stuff_type, t2, 0);
    case 3: return get_stuffN(minfo, stuff, stuff_type, t3, 1);
    case 4: return get_stuffN(minfo, stuff, stuff_type, t4, 2);
    default: do_error('Bad area size in get_stuff()');
  }
  return 0;
}

const t2 = [-1, W - 1, 2 * W, 2 * W + 1, W + 2, 2, 1 - W, -W];
const t3 = [-1, W - 1, 2 * W - 1, 3 * W, 3 * W + 1, 3 * W + 2, 2 * W + 3, W + 3, 3, 2 - W, 1 - W, -W];
const t4 = [-1, W - 1, 2 * W - 1, 3 * W - 1, 4 * W, 4 * W + 1, 4 * W + 2, 4 * W + 3, 3 * W + 4, 2 * W + 4, W + 4, 4,
  3 - W, 2 - W, 1 - W, -W];
/** get_stuff2's, get_stuff3's and get_stuff4's static tstart */
const getStart = [0, 0, 0];
const putStart = [0, 0, 0];

/** get_stuff2/3/4: take `stuff` from the transport squares around, starting where it stopped last time */
function get_stuffN(map: number, stuff: number, stuff_type: number, t: number[], which: number): number {
  const n = t.length;
  let tst = getStart[which];
  const stack: number[] = [];
  let st = 0;
  for (let i = 0; i < n; i++) {
    const rec = map + t[tst] * INFO;
    if (MI[rec + FLAGS] & C.FLAG_IS_TRANSPORT) {
      const ip = rec + I1 + stuff_type;
      st += MI[ip];
      stack.push(ip);
      if (st >= stuff) {
        let s = 0;
        do {
          const p = stack[s++];
          stuff = (stuff - MI[p]) | 0;
          MI[p] = stuff < 0 ? -stuff : 0;
        } while (stuff > 0);
        ++tst;
        // get_stuff2 and 4: ++tst & 7 (& 15); get_stuff3: tst >= 12 ? 0 : tst
        getStart[which] = n === 12 ? (tst >= 12 ? 0 : tst) : tst & (n - 1);
        return 1;
      }
    }
    if (++tst >= n) tst = 0;
  }
  return 0;
}

export function put_stuff(x: number, y: number, stuff: number, stuff_type: number): number {
  const minfo = IX(x, y);
  const type = P(x, y);
  switch (main_groups[MG[P(x, y)]].size) {
    case 2: return put_stuffN(minfo, type, stuff, stuff_type, t2, 0);
    case 3: return put_stuffN(minfo, type, stuff, stuff_type, t3, 1);
    case 4: return put_stuffN(minfo, type, stuff, stuff_type, t4, 2);
    default: do_error('Bad area size in put_stuff()');
  }
  return 0;
}

const tmax = [
  [C.MAX_FOOD_ON_TRACK, C.MAX_JOBS_ON_TRACK, C.MAX_COAL_ON_TRACK, C.MAX_GOODS_ON_TRACK, C.MAX_ORE_ON_TRACK, C.MAX_STEEL_ON_TRACK, C.MAX_WASTE_ON_TRACK],
  [C.MAX_FOOD_ON_ROAD, C.MAX_JOBS_ON_ROAD, C.MAX_COAL_ON_ROAD, C.MAX_GOODS_ON_ROAD, C.MAX_ORE_ON_ROAD, C.MAX_STEEL_ON_ROAD, C.MAX_WASTE_ON_ROAD],
  [C.MAX_FOOD_ON_RAIL, C.MAX_JOBS_ON_RAIL, C.MAX_COAL_ON_RAIL, C.MAX_GOODS_ON_RAIL, C.MAX_ORE_ON_RAIL, C.MAX_STEEL_ON_RAIL, C.MAX_WASTE_ON_RAIL],
];

function put_stuffN(minfo: number, type: number, stuff: number, stuff_type: number, t: number[], which: number): number {
  const n = t.length;
  let tst = putStart[which];
  const sip: number[] = [];
  const smax: number[] = [];
  let st = 0;
  let tp = 0;
  for (let i = 0; i < n; i++) {
    const map_index = t[tst];
    const rec = minfo + map_index * INFO;
    if (MI[rec + FLAGS] & C.FLAG_IS_TRANSPORT) {
      switch (get_group_of_type(MT[type + map_index])) {
        case C.GROUP_TRACK: tp = tmax[0][stuff_type]; break;
        case C.GROUP_ROAD: tp = tmax[1][stuff_type]; break;
        case C.GROUP_RAIL: tp = tmax[2][stuff_type]; break;
        default: do_error(`Bad transport type in put_stuff${n === 8 ? 2 : n === 12 ? 3 : 4}`);
      }
      const ip = rec + I1 + stuff_type;
      sip.push(ip);
      smax.push(tp);
      st += tp - MI[ip];
      if (st >= stuff) {
        let s = 0;
        do {
          tp = smax[s] - MI[sip[s]];
          if ((stuff = (stuff - tp) | 0) < 0) MI[sip[s]] += tp + stuff;
          else MI[sip[s]] = smax[s];
          ++s;
        } while (stuff > 0);
        ++tst;
        putStart[which] = n === 12 ? (tst >= 12 ? 0 : tst) : tst & (n - 1);
        return 1;
      }
    }
    if (++tst >= n) tst = 0;
  }
  return 0;
}

export function mps_market(x: number, y: number): void {
  let i = 0;
  const b = IX(x, y);
  mps_store_title(i++, 'Market');
  i++;
  mps_store_sfp(i++, 'Food', MI[b + I1] * 100.0 / C.MAX_FOOD_IN_MARKET);
  mps_store_sfp(i++, 'Jobs', MI[b + I2] * 100.0 / C.MAX_JOBS_IN_MARKET);
  mps_store_sfp(i++, 'Coal', MI[b + I3] * 100.0 / C.MAX_COAL_IN_MARKET);
  mps_store_sfp(i++, 'Goods', MI[b + I4] * 100.0 / C.MAX_GOODS_IN_MARKET);
  mps_store_sfp(i++, 'Ore', MI[b + I5] * 100.0 / C.MAX_ORE_IN_MARKET);
  mps_store_sfp(i++, 'Steel', MI[b + I6] * 100.0 / C.MAX_STEEL_IN_MARKET);
  mps_store_sfp(i++, 'Waste', MI[b + I7] * 100.0 / C.MAX_WASTE_IN_MARKET);
}
