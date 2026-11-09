// bigstuff.cpp of HyperRogue 13.1o: large map structures -- (horo)cycles and the alternate maps behind them
// (Camelot, Temple of Cthulhu, Clearing, Mountain, Whirlpool, Caribbean, Palace, Storms), equidistants (Ocean,
// Graveyard, Endorian Forest), Voronoi/horodisk land structures, the 'setland' routines for other geometries and
// buildBigStuff/moreBigStuff which call the equidistant/(horo)cycle/barrier generators.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names (PORTING.md, "Overloads"): buildAnotherEquidistant(c) (void) / buildAnotherEquidistant_n(c, radius)
// (returns the cell). The HDR inlines of namespace altmap are altmap_relspin / altmap_set_relspin,
// altmap_radius / altmap_set_radius, altmap_which / altmap_set_which, altmap_orig_land / altmap_set_orig_land
// (they return `short&` in C++). `eLand& get_euland(int)` is get_euland (read) + the local set_euland.
// hrmap::extend_altmap is assigned to hrmap.prototype in register_bigstuff() (cell.ts declares it).
// `alt->cdata = (cdata*) h` is `alt.cdata_orig = h` (locations.ts).
// landscape_lands: map<array<int,3>, eLand> is a Map keyed by "a0,a1,a2" (as landgen.ts uses it).
// Calls into other geometries (euc::, crystal::, kite::, bt:: beyond updir, reg3::dirdist, hybrid::altmap_heights,
// tour::quickfind, legacy buildBigStuff_legacy) and graphics (inscreenrange) throw NotPorted inline where their
// stub modules lack the function. printf / println debug output is left out (PORTING.md, "Macros").
import { G } from './globals.ts';
import { NotPorted, among, isize, INF } from './hyper.ts';
import { idiv, i16, itrunc } from './cpp.ts';
import {
  type cell, type heptagon, cellwalker, heptspin, celllister, NODIR, NOBARRIERS, hsA, hsOrigin, type hstate,
} from './locations.ts';
import {
  type eLand, type eMonster, linf,
  itHolyGrail, itEmerald, itOrbLuck, itPirate, itCompass, itOrbSafety, itGreenStone, itNone,
  laTemple, laClearing, laCanvas, laCaribbean, laWhirlpool, laMountain, laPrincessQuest, laCamelot, laGraveyard,
  laHaunted, laBarrier, laPalace, laCrossroads2, laNone, laOcean, laCrossroads4, laOceanWall, laLivefjord,
  laWarpSea, laKraken, laDocks, laBrownian, laHauntedWall, laHauntedBorder, laMirrored, laWestWall, laIvoryTower,
  laEndorian, laDungeon, laWarpCoast, laElementalWall, laEFire, laEAir, laEWater, laEEarth, laCrossroads,
  laCrossroads3, laTerracotta, laMercuryRiver, laRlyeh, laMotion, laAlchemist, laDesert, laMemory, laMirror,
  laCrossroads6, laMasterCrossroads, laCrossroads5, laPrairie, laStorms, laDragon, laTortoise, laJungle,
  laOvergrown, laHunting,
  waCIsland, waCIsland2, waCTree, waSea, waTrunk, waTrunk3, waSolidBranch, waWeakBranch, waCanopy, waBarrier,
  waMercury, waEternalFire, waChasm, waStone, waNone, waRubble, waCamelot, waCamelotMoat, waTower, waRoundTable,
  waColumn, waBigTree, waCharged, waGrounded, waSandstone, waSmallTree, waMineUnknown, waMineMine, waPalace,
  moNone, moHedge, moLancer, moFlailer, moPyroCultist, moGoblin, moCultist, moKnight, moMouse,
} from './content.ts';
import { R200, U5 } from './content-req.ts';
import {
  S3, S7, OINF, IRREGULAR, PURE, BITRUNCATED, GOLDBERG, INVERSE, WDIM, a4, cryst, euclid, sphere, quotient,
  hyperbolic, mhybrid, nonisotropic, nonorientable, eubinary, weirdhyperbolic, stdhyperbolic, experimental,
  aperiodic, cgflags, qIDEAL, sol, nih, nil, closed_or_bounded, gNormal, gEuclid, gRhombic3, gHoroRec, gHoroHex,
  gKiteDart3, gSpace435, gSpace535, gSpace534, gBinary3, gHoroTris, gCrystal344, gcSphere, NOWALLSEP_WALL, SG6,
} from './classes.ts';
import { mhyperbolic } from './embeddings.ts';
import { arb_in } from './arbitrile.ts';
import { arcm_in } from './archimedean.ts';
import { bt_in, bt_updir } from './binary-tiling.ts';
import { kite_in } from './kite.ts';
import { hat_in } from './aperiodic-hat.ts';
import { reg3_in_hrmap_rule_or_subrule, reg3_altdist } from './reg3.ts';
import { euc_in, euc2_coordinates, euc_dist, euc_at, euc_dcross, euc_sdxy } from './euclid.ts';
import { princess_coords } from './complex.ts';
import { celldistance } from './cell.ts';
import { gp_eudir } from './goldberg.ts';
import { fake_in, fake_in_underlying_geometry } from './fake.ts';
import { hybrid_get_where, hybrid_in_underlying_geometry, in_s2xe } from './nonisotropic.ts';
import { gp_dist_3 } from './goldberg.ts';
import {
  hrmap, celldist, celldistAlt, createMov, newAltMap, getDistLimit, valence, BARLEV,
  ALTDIST_BOUNDARY, ALTDIST_UNKNOWN, ALTDIST_ERROR,
} from './cell.ts';
import { createStep, init_heptagon } from './heptagon.ts';
import { get_expansion, ts_left_of, type cellfunction } from './expansion.ts';
import { generate_random_path } from './geometry2.ts';
import { hrand, hrandf, hrand_elt, hrandom_shuffle, pick } from './rand.ts';
import { gmod, gdiv } from './util.ts';
import {
  ctof, cdist50, polarb50, pseudohept, ishept, zebra40, emeraldval, getHemisphere,
} from './pattern2.ts';
import { currfp_gmul, currfp_inverses, currfp_distwall } from './fieldpattern.ts';
import {
  isHaunted, isOnCIsland, inmirror, isGravityLand, isElemental, isSealand, isWarpedType, isEquidLand,
} from './flags.ts';
import {
  ls_single, ls_any_order, ls_voronoi_structure, ls_hv_structure, ls_horodisk_structure, ls_no_walls,
  ls_nice_walls, ls_any_chaos, ls_std_chaos, ls_wall_chaos, ls_patched_chaos, ls_chaoticity, ls_any_wall,
  ls_any_nowall, lsVineWalls, getNewLand, getNewLand2, landUnlockedIngame, isCrossroads, rlyehComplete,
  bearsCamelot,
} from './landlock.ts';
import { gold, GRAIL_FOUND } from './items.ts';
import { yendor_clev, YF_WALLS } from './yendor.ts';
import { setdist } from './landgen.ts';
import { canReachPlayer } from './monstergen.ts';
import { raiseBuggyGeneration, describeCell } from './debug.ts';
import { coastvalEdge } from './mapeffects.ts';
import { princess_newInfo, clearingdata, PRADIUS0, PRADIUS1 } from './complex.ts';
import { legacy_racing, UNKNOWN } from './legacy.ts';
import {
  preventbarriers, checkBarriersFront, checkBarriersBack, buildBarrierNowall, buildBarrier, extendBarrier,
  hasbardir, buildBarrierStrong, buildCrossroads2, general_barrier_build, setland, getElementalWall,
} from './barriers.ts';
import { brownian_init_further } from './complex2.ts';

const notp = (what: string): never => { throw new NotPorted(what); };

// EX bool disable_bigstuff: G.disable_bigstuff

// horocycles

export function newRoundTableRadius(): number {
  return 28 + 2 * G.items[itHolyGrail];
}

// #if CAP_COMPLEX2
/** should we generate 'Castle Anthrax' instead of Camelot (an infinite sequence of horocyclic Camelot-likes */
export function anthrax(): boolean {
  return ls_single() && hyperbolic() && !cryst();
}

export function getAnthraxData(c: cell, b: boolean): number {
  let d = celldistAlt(c);
  let rad = 28 + 3 * G.camelot_anthraxBonus;
  while (d < -rad) {
    d += rad + 12;
    rad += 3;
  }
  while (d >= 12) {
    if (rad > 5) rad -= 3;
    else if (rad) rad--;
    d -= rad + 12;
  }
  if (b) return rad;
  return d;
}

/** hyper.h GRAIL_RADIUS_MASK */
export const GRAIL_RADIUS_MASK = 0x3FFF;

export function roundTableRadius(c: cell): number {
  if (eubinary()) return 28;
  // #if CAP_COMPLEX2
  if (ls_single()) return getAnthraxData(c, true);
  if (!c.master.alt) return 28;
  return altmap_radius(c.master.alt.alt) & GRAIL_RADIUS_MASK;
}

export function celldistAltRelative(c: cell): number {
  // #if CAP_CRYSTAL
  if (cryst()) return notp('crystal::dist_relative');
  // #if MAXMDIM >= 4
  if (euc_in(3)) return notp('euc::dist_relative');
  if (euclid() && quotient()) return celldistAlt(c) - roundTableRadius(c);
  if (sphere() || quotient()) {
    return celldist(c) - 3;
  }
  // #if CAP_COMPLEX2
  if (anthrax()) return getAnthraxData(c, false);
  return celldistAlt(c) - roundTableRadius(c);
}

/** gp::loc camelot_coords() */
export function camelot_coords(): [number, number] { return [a4() ? 21 : 20, 10]; }

export function euclidAlt(x: number, y: number): number {
  x = i16(x); y = i16(y);
  if (among(G.specialland, laTemple, laClearing, laCanvas)) {
    if (euc_in(2, 6))
      return Math.max(x, x + y);
    else if (PURE())
      return x + Math.abs(y);
    else
      return Math.max(x, y);
  }
  else if (G.specialland === laCaribbean || G.specialland === laWhirlpool || G.specialland === laMountain) {
    if (euc_in(2, 6))
      return Math.min(
        Math.min(Math.max(-x, -x - y) + 3,
          Math.max(x + y, y) + 3),
        Math.max(x, -y) + 3,
      );
    else if (PURE())
      return 3 - Math.min(Math.abs(x - y), Math.abs(x + y));
    else
      return 3 - Math.min(Math.abs(x), Math.abs(y));
  }
  else if (G.specialland === laPrincessQuest)
    return euc_dist([x, y], [princess_coords()[0], princess_coords()[1]]);
  else return euc_dist([x, y], camelot_coords());
}

export function cylinder_alt(c: cell): number {
  if (G.specialland === laPrincessQuest)
    return celldistance(c, euc_at([princess_coords()[0], princess_coords()[1]]));
  if (G.specialland === laCamelot)
    return celldistance(c, euc_at(camelot_coords()));

  let maxmul = 0;
  for (let d = 0; d < SG6(); d++)
    maxmul = Math.max(maxmul, euc_dcross(euc_sdxy(), gp_eudir(d)));
  return 5 - Math.abs(gdiv(euc_dcross(euc_sdxy(), euc2_coordinates(c)), maxmul));
}

const NOCOMPASS = 1000000;
/** &NOCOMPASS: the identity whichCompass returns */
const NOCOMPASS_ID = { NOCOMPASS };

export function compassDist(c: cell): number {
  if (sphere() || quotient()) return 0;
  if (eubinary() || c.master.alt) return celldistAlt(c);
  if (isHaunted(c.land) || c.land === laGraveyard) return getHauntedDepth(c);
  return NOCOMPASS;
}

/** identify the compass target that compassDist is talking about (a pointer identity in C++) */
export function whichCompass(c: cell): unknown {
  if (sphere() || quotient()) return null;
  if (eubinary()) return null;
  if (c.master.alt) return c.master.alt.alt;
  if (isHaunted(c.land) || c.land === laGraveyard) return linf[laHaunted];
  return NOCOMPASS_ID;
}

export function findcompass(c: cell): cell {
  let d = compassDist(c);
  if (among(d, NOCOMPASS, ALTDIST_BOUNDARY, ALTDIST_UNKNOWN, ALTDIST_ERROR)) return null!;
  const w = whichCompass(c);

  let gc = c;

  // inscreenrange (graph.cpp) needs the view: graphics, a later stage
  const inscreenrange = (_c: cell): boolean => notp('inscreenrange (graph.cpp)');
  while (inscreenrange(c)) {
    gc = c;
    if (!eubinary() && !sphere() && !quotient())
      G.currentmap.extend_altmap(c.master);
    let found = false;
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i); if (!c2) continue;
      if (w === whichCompass(c2) && compassDist(c2) < d) {
        c = c2;
        d = compassDist(c2);
        found = true; break;
      }
    }
    if (found) continue; // goto nextk
    for (let i = 0; i < c.master.type && !found; i++) for (let j = 0; j < c.master.cmove(i).type; j++) {
      const c2 = c.master.cmove(i).cmove(j).c7;
      if (c2) if (w === whichCompass(c2) && compassDist(c2) < d) {
        c = c2;
        d = compassDist(c2);
        found = true; break;
      }
    }
    if (found) continue; // goto nextk
    break;
  }

  return gc;
}

export function grailWasFound(c: cell): boolean {
  if (eubinary() || quotient() || sphere()) return G.items[itHolyGrail] !== 0;
  return (altmap_radius(c.master.alt.alt) & GRAIL_FOUND) !== 0;
}


export function default_levs(): number {
  if (arb_in()) return 2;
  if (IRREGULAR())
    return 1;
  if (S3() >= OINF)
    return 1;
  // #if MAXMDIM >= 4
  if (reg3_in_hrmap_rule_or_subrule()) return 0;
  return S3() - 3;
}

// namespace altmap (HDR inlines)

/** h->move(relspin(h->alt)) corresponds to h->alt->move(0); in quotient space we cannot use alt for quotient */
export function altmap_relspin(alt: heptagon): number {
  if (quotient()) {
    // quotient_relspins[alt]: std::map operator[] inserts 0
    if (!G.altmap_quotient_relspins.has(alt)) G.altmap_quotient_relspins.set(alt, 0);
    return G.altmap_quotient_relspins.get(alt)!;
  }
  return alt.zebraval;
}
export function altmap_set_relspin(alt: heptagon, v: number): void {
  if (quotient()) G.altmap_quotient_relspins.set(alt, i16(v));
  else alt.zebraval = v;
}
/** for Camelot, the radius */
export function altmap_radius(alt: heptagon): number { return alt.emeraldval; }
export function altmap_set_radius(alt: heptagon, v: number): void { alt.emeraldval = v; }
/** type of the horocycle -- currently used in Land of Storms which has two types */
export function altmap_which(alt: heptagon): number { return alt.emeraldval; }
export function altmap_set_which(alt: heptagon, v: number): void { alt.emeraldval = v; }
/** the original land, for altmaps which may appear in multiple lands (Camelot) */
export function altmap_orig_land(alt: heptagon): number { return alt.fiftyval; }
export function altmap_set_orig_land(alt: heptagon, v: number): void { alt.fiftyval = v; }

// map<heptagon*, short> altmap::quotient_relspins: G.altmap_quotient_relspins
// auto qclear = addHook(hooks_clearmemory, 200, ...): register_bigstuff()

/** void hrmap::extend_altmap(heptagon *h, int levs, bool link_cdata) */
function hrmap_extend_altmap(self: hrmap, h: heptagon, levs: number, link_cdata: boolean): void {
  if (mhybrid()) { hybrid_in_underlying_geometry(() => self.extend_altmap(h, levs, link_cdata)); }
  if (!h.alt) return;
  preventbarriers(h.c7);
  if (h.c7) for (let i = 0; i < h.c7.type; i++) { const c2 = h.c7.move(i); if (!c2) continue; preventbarriers(c2); }
  if (GOLDBERG())
    for (let i = 0; i < S7(); i++) preventbarriers(createStep(h, i).c7);
  for (let i = 0; i < h.type; i++)
    createStep(h.alt, i).alt = h.alt.alt;

  const relspin = altmap_relspin(h.alt);

  // h[relspin] matches alt[0]
  // int relspin = h->alt->fieldval;

  if (h.type !== h.alt.type) return;
  for (let i = 0; i < h.type; i++) {
    const ir = gmod(i - relspin, h.type);
    const hm = h.alt.move(ir);
    const ho = createStep(h, i);
    if (ho.alt && ho.alt !== hm) {
      if (ho.alt.alt === hm.alt && !quotient()) {
        // printf("ERROR: alt cross! [%d -> %d]\n", ho->alt->distance, hm->distance);
        // println(hlog, "alt error from ", h->c7, " to ", ho->c7);
        // exit(1);
      }
      continue;
    }
    ho.alt = hm;
    altmap_set_relspin(hm, gmod(h.c.spin(i) - h.alt.c.spin(ir), hm.type));
    if (link_cdata) hm.cdata_orig = ho;
    if (levs) G.currentmap.extend_altmap(ho, levs - 1, link_cdata);
    if (S3() >= OINF) preventbarriers(ho.c7);
  }
}

function new_voronoi_root(h: heptagon, dist: number, dir: number, next: eLand): void {
  let alt = init_heptagon(h.type);
  G.allmaps.push(newAltMap(alt));
  alt.s = hsA;
  alt.alt = alt;
  alt.cdata_orig = h;
  alt.distance = dist;
  const altpairs: [heptagon, heptagon][] = [];
  altpairs.push([h, alt]);
  altmap_set_relspin(alt, dir);

  G.hv_land.set(alt, next);

  while (alt.distance > -100) {
    const alt1 = createStep(alt, 0);
    alt1.alt = alt.alt;
    const h1 = createStep(h, dir);
    if (h1.alt) return;
    altpairs.push([h1, alt1]);
    h1.alt = alt1;

    const dir_alt = alt.c.spin(0);
    const dir_h = h.c.spin(dir);

    altmap_set_relspin(alt1, gmod(dir_h - dir_alt, alt.type));
    dir = altmap_relspin(alt1);

    h = h1; alt = alt1;
  }

  for (const p of altpairs) p[0].alt = p[1];
}

class cand_info {
  best = 0;
  bqty = 0;
  /** uninitialized in C++ */
  candidate: heptagon = null!;
  free_dirs: number[] = [];
}

function voronoi_candidate(h: heptagon): cand_info {
  const ci = new cand_info();
  ci.best = 999999; ci.bqty = 0;

  for (let i = 0; i < h.type; i++) {
    const ho = createStep(h, i);
    const ri = h.c.spin(i);
    const hoa = ho.alt;
    if (hoa && hoa.alt) {
      const relspin = altmap_relspin(hoa);
      /* we want ho->move(ri) which is hoa->move(ri - relspin) */
      const dir = gmod(ri - relspin, hoa.type);
      const hoa1 = createStep(hoa, dir);
      if (!hoa1.alt) hoa1.alt = hoa.alt;
      const dist = hoa1.distance;
      if (dist < ci.best) {
        ci.best = dist;
        ci.bqty = 0;
      }
      if (dist === ci.best && ci.candidate !== hoa1) {
        ci.bqty++;
        ci.candidate = hoa1;
        const rb = hoa.c.spin(dir);
        /* hoa1->alt->move(rb) is h->move(rb+relspin to compute) */
        altmap_set_relspin(ci.candidate, gmod(i - rb, ci.candidate.type));
      }
    }
    else ci.free_dirs.push(i);
  }
  return ci;
}

/** hv_land.at(alt): std::out_of_range when missing */
function hv_land_at(alt: heptagon): eLand {
  if (!G.hv_land.has(alt)) throw new Error('map::at');
  return G.hv_land.get(alt)!;
}

/** hv_land[alt]: std::map operator[] inserts laNone when missing */
function hv_land_ref(alt: heptagon): eLand {
  if (!G.hv_land.has(alt)) G.hv_land.set(alt, laNone);
  return G.hv_land.get(alt)!;
}

function list_adjacent_lands(h: heptagon): eLand[] {
  const res: eLand[] = [];
  for (let i = 0; i < h.type; i++) {
    const hs = new heptspin(h, i);
    hs.addStep();
    let alt = hs.at.alt;
    if (!alt) continue;
    alt = alt.alt;
    res.push(hv_land_at(alt));
    // go arround the region of alt using the 'butterfly' method, to find the other two lands which seem adjacent
    for (const d of [-1, 1]) {
      const hs1 = hs.clone();
      for (let i = 0; i < 100; i++) {
        hs1.add(d);
        hs1.addStep();
        if (!hs1.at.alt) { hs1.addStep(); continue; }
        const alt1 = hs1.at.alt.alt;
        if (alt1 !== alt) {
          res.push(hv_land_at(alt1)); break;
        }
        hs1.add(d);
      }
    }
  }
  if (res.length === 0) return [laBarrier];
  return res;
}

function extend_altmap_voronoi(h: heptagon): void {
  if (h.alt) return;

  const ci = voronoi_candidate(h);

  if (ci.bqty === 0) {
    new_voronoi_root(h, -30, hrand(h.type), G.firstland);
    return;
  }
  else if (ci.bqty > 0 && isize(ci.free_dirs)) {
    const expansion = get_expansion();
    const growth = expansion.get_growth();
    const odds = Math.pow(growth, ci.candidate.distance) * isize(ci.free_dirs);
    if (hrandf() < odds / (1 + odds)) {
      const lands_list = list_adjacent_lands(h);

      let dist = ci.candidate.distance;
      // in PURE, could be a tie, or the new root could win
      if (PURE()) dist -= hrand(2);
      // in BITRUNCATED, it could change too.. need a better formula probably
      if (BITRUNCATED()) dist += hrand(3) - 1;
      // do not care about others...
      // new_voronoi_root(h, dist, hrand_elt(ci.free_dirs), getNewLand2(lands_list)): C++ leaves the order of the
      // argument evaluations unspecified; gcc (x86-64) evaluates them right to left (getNewLand2 first, then
      // hrand_elt). Not checked against the oracle (no scenario uses lsVoronoi).
      const nl = getNewLand2(lands_list);
      const fd = hrand_elt(ci.free_dirs);
      new_voronoi_root(h, dist, fd, nl);
      return;
    }
  }

  h.alt = ci.candidate;
}

export function get_voronoi_winner(c: cell): [heptagon | null, number] {
  if (c === c.master.c7) {
    extend_altmap_voronoi(c.master);
    const ci = voronoi_candidate(c.master);
    if (ci.bqty === 1) return [ci.candidate.alt, ci.best];
    else return [null, ci.best];
  }
  else if (!BITRUNCATED()) return get_voronoi_winner(c.master.c7);
  else {
    const nearh: heptagon[] = [];
    for (let i = 0; i < c.type; i++) {
      c.cmove(i);
      if (c.move(i).master.c7 === c.move(i)) nearh.push(c.move(i).master);
    }
    for (const h of nearh) extend_altmap_voronoi(h);
    for (const h of nearh) if (!h.alt) return [null, 0];
    const best: [heptagon | null, number] = [null, 999999];
    let bqty = 0;
    for (const h of nearh) {
      const dists: number[] = [];
      for (const h1 of nearh) {
        if (h === h1) dists.push(h.alt.distance);
        else {
          for (let i = 0; i < h.type; i++) if (h.cmove(i) === h1) {
            const ha1 = createStep(h.alt, gmod(i - altmap_relspin(h.alt), h.type));
            dists.push(ha1.distance);
          }
        }
      }
      dists.sort((a, b) => a - b);
      let gdist: number;
      if (dists[dists.length - 1] === dists[0]) gdist = dists[0] - 1;
      else if (dists[dists.length - 1] === dists[0] + 2) gdist = dists[0] + 1;
      else gdist = dists[0];
      if (gdist < best[1]) {
        best[1] = gdist; bqty = 0;
      }
      if (gdist === best[1]) {
        bqty++;
        if (bqty === 1 || best[0] === h.alt.alt) best[0] = h.alt.alt;
        else best[0] = null;
      }
    }
    return best;
  }
}

// #if MAXMDIM >= 4
export function hrandom_adjacent(_cw: cellwalker): number {
  return notp('hrandom_adjacent: currentmap->dirdist (3D)');
}

export function create_altmap(c: cell, rad: number, firststate: hstate, special = 0): heptagon {

  if (mhybrid()) {
    return notp('create_altmap: hybrid::under_class / altmap_heights');
  }

  // check for direction
  let gdir = -1;
  for (let i = 0; i < c.type; i++) {
    // #if MAXMDIM >= 4
    if (!reg3_in_hrmap_rule_or_subrule()) {
      if (c.move(i) && c.move(i).mpdist < c.mpdist) gdir = i;
    }
    else {
      /* mpdist may be incorrect */
      if (c.move(i) && c.move(i).master.distance < c.master.distance) gdir = i;
    }
  }
  // #if MAXMDIM >= 4
  if (reg3_in_hrmap_rule_or_subrule() && c.master.distance === 0) gdir = 0;
  if (gdir < 0) return null!;

  // non-crossing in weird hyperbolic
  if (weirdhyperbolic()) {
    if (c.bardir === NOBARRIERS) return null!;
    for (let i = 0; i < c.type; i++) { const c1 = createMov(c, i); if (c1.bardir === NOBARRIERS) return null!; }
    if (IRREGULAR())
      for (let i = 0; i < S7(); i++)
        if (createStep(c.master, i).c7.bardir !== NODIR)
          return null!;
  }

  // check for non-crossing
  const bd = 2;
  const bb = new cellwalker(c, bd);
  if (!weirdhyperbolic() && !(checkBarriersFront(bb) && checkBarriersBack(bb))) {
    return null!;
  }

  const bf = new cellwalker(c, gdir); bf.addRev();
  const p = generate_random_path(bf, rad, false, false);

  for (const c of p.path) if (c.bardir !== NODIR) return null!;

  const h = p.last.at.master;

  if (h.alt) {
    // printf("Error: creatingAlternateMap while one already exists\n");
    return null!;
  }

  if (special === waPalace) {
    const c = p.last.at;
    if (!ctof(c) || cdist50(c) !== 0 || !polarb50(c)) return null!;
  }

  const alt = init_heptagon(h.type);
  G.allmaps.push(newAltMap(alt));
  alt.s = firststate;
  if (!G.currentmap.link_alt(h, alt, firststate, p.last.spin)) {
    return null!;
  }
  if (mhybrid()) notp('hybrid::altmap_heights');
  alt.alt = alt;
  h.alt = alt;
  alt.cdata_orig = h;

  for (let d = rad; d >= 0; d--) {
    G.currentmap.extend_altmap(p.path[d].master);
    preventbarriers(p.path[d]);
  }

  if (special === waPalace) {

    const c = p.last.at;

    G.princess_generating = true;
    c.land = laPalace;
    for (let j = BARLEV(); j >= 0; j--)
      setdist(c, j, null!);
    G.princess_generating = false;

    princess_newInfo(c);
    G.princess_forceMouse = false;

    if (G.princess_gotoPrincess && G.cheater) { G.princess_gotoPrincess = false; G.cwt.at = c; }
  }

  return alt;
  //for(int d=rad; d>=0; d--) printf("%3d. %p {%d}\n", d, hr::voidp(cx[d]->master), cx[d]->master->alt->distance);
}

export function beCIsland(c: cell): void {
  const i = hrand(3);
  if (i === 0) c.wall = waCIsland;
  if (i === 1) c.wall = waCIsland2;
  if (i === 2) c.wall = waCTree;
  return;
}

export function generateTreasureIsland(c: cell): void {
  if (ls_voronoi_structure()) {
    if (c.land !== laCaribbean) return;
  }
  else {
    gen_alt(c);
  }
  if (isOnCIsland(c)) return;

  const src = hrand(100) < 10;
  if (src) {
    beCIsland(c);
    if (c.wall === waCTree) return;
  }
  const ctab: cell[] = [];
  let qlo = 0, qhi = 0; /* set to 0 to silence warning */
  for (let i = 0; i < c.type; i++) {
    let c2 = createMov(c, i);
    if (!eubinary()) G.currentmap.extend_altmap(c2.master);
    const ok = (c2: cell): boolean => {
      if (ls_hv_structure() && get_voronoi_winner(c2)[0] !== get_voronoi_winner(c)[0]) return false;
      return true;
    };
    if (ok(c2) && greater_alt(c, c2)) {
      ctab.push(c2);
      qlo = i; qhi = i;
      while (true && isize(ctab) < c.type) {
        qlo--;
        c2 = c.cmodmove(qlo);
        if (!have_alt(c2)) break;
        if (!ok(c2)) break;
        if (celldistAlt(c2) >= celldistAlt(c)) break;
        ctab.push(c2);
      }
      while (true && isize(ctab) < c.type) {
        qhi++;
        c2 = c.cmodmove(qhi);
        if (!have_alt(c2)) break;
        if (!ok(c2)) break;
        if (celldistAlt(c2) >= celldistAlt(c)) break;
        ctab.push(c2);
      }
      break;
    }
  }
  if (ctab.length === 0) {
    // printf("NO QC\n");
    c.wall = waSea;
    for (let i = 0; i < c.type; i++) void celldistAlt(c.move(i)); // printf("%d ", celldistAlt(c->move(i)));
    void celldistAlt(c); // printf("vs %d\n", celldistAlt(c));
    return;
  }
  const c2 = c.cmodmove(idiv(qlo + qhi, 2));
  if (ls_voronoi_structure() && c2.land !== laCaribbean) c2.land = laCaribbean;
  generateTreasureIsland(c2);
  if (!src) {
    c.wall = c2.wall;
    if (c.wall !== waCTree && hrand(100) < 15)
      c.wall = (c.wall === waCIsland ? waCIsland2 : waCIsland);
  }
  if (src && c2.wall === waCTree && have_alt(c) && celldistAlt(c) <= -10 && G.geometry !== gRhombic3) {
    let end = true;
    for (const cc of ctab) {
      generateTreasureIsland(cc);
      if (cc.wall !== waCTree)
        end = false;
    }
    // printf("%p: end=%d, qc=%d, dist=%d\n", hr::voidp(c), end, qc, celldistAlt(c));
    if (end) c.item = itPirate;
    else c.item = itCompass;
  }
}

// equidistants

// EX bool generatingEquidistant = false: G.generatingEquidistant

/** cell *buildAnotherEquidistant(cell *c, int radius) */
export function buildAnotherEquidistant_n(c: cell, radius: number): cell {
  let gdir = -1;
  for (let i = 0; i < c.type; i++) {
    if (c.move(i) && c.move(i).mpdist < c.mpdist) gdir = i;
  }
  if (gdir === -1) return null!;

  let cw = new cellwalker(c, (gdir + 3) % c.type);
  const coastpath: cell[] = [];

  while (isize(coastpath) < radius || (cw.at.type !== 7 && !weirdhyperbolic())) {
    // this leads to bugs for some reason!
    if (cw.at.land === laCrossroads2) {
      // #ifdef AUTOPLAY ... printf("avoiding the Crossroads II\n");
      return null!;
    }
    if (cw.at.bardir !== NODIR) return null!;
    if (cw.at.landparam && cw.at.landparam < radius) return null!;

    /* forCellEx(c2, cw.at) if(c2->bardir != NODIR) {
      generatingEquidistant = false;
      return;
      } */
    coastpath.push(cw.at);
    if (cw.at.land === laNone && cw.at.mpdist <= 7) {
      raiseBuggyGeneration(cw.at, 'landNone 1');
      for (let i = 0; i < isize(coastpath); i++) coastpath[i].item = itPirate;
      return null!;
    }
    cw = cw.plusStep().add(3);
    if (ctof(cw.at) && hrand(2) === 0) cw.add(1);
  }
  coastpath.push(cw.at);
  // printf("setdists\n");
  for (let i = 1; i < isize(coastpath) - 1; i++) {
    if (coastpath[i - 1].land === laNone) {
      raiseBuggyGeneration(G.cwt.at, 'landNone 3');
      // int mpd[10]; for(int i=0; i<10; i++) mpd[i] = coastpath[i]->mpdist; printf(...)
      for (let i = 0; i < isize(coastpath); i++) coastpath[i].item = itPirate;
      return null!;
    }
    setdist(coastpath[i], BARLEV(), coastpath[i - 1]);
    setdist(coastpath[i], BARLEV() - 1, coastpath[i - 1]);
    if (i < isize(coastpath) - 5) {
      coastpath[i].bardir = NOBARRIERS;
      //      forCellEx(c2, coastpath[i]) c2->bardir = NOBARRIERS;
    }
  }

  //printf("building barrier\n");
  const c2 = coastpath[coastpath.length - 1];

  let nowall = false;

  if (c2.land === laNone) {
    raiseBuggyGeneration(c2, 'landNone 2');
    for (let i = 0; i < isize(coastpath); i++) coastpath[i].item = itPirate;
    return null!;
  }

  // prevent gravity anomalies
  if (c2.land !== c.land) return null!;

  const oc = c.land === laOcean;

  // else if(ctof(c) && hrand(10000) < 20 && !isCrossroads(c->land) && gold() >= 200)
  if (oc && ls_no_walls() && buildBarrierNowall(c2, getNewLand(laOcean))) {
    nowall = true;
  }
  else if (oc && pseudohept(c2) && gold() >= R200() && hrand(10) < 2 && buildBarrierNowall(c2, laCrossroads4)) {
    nowall = true;
    // raiseBuggyGeneration(c2, "check");
    // return;
  }
  else if (ls_nice_walls()) build_barrier_good(c2);
  //printf("building barrier II\n");
  if (hasbardir(c2)) extendBarrier(c2);

  for (let i = isize(coastpath) - (nowall ? 1 : 2); i >= 0; i--) {
    for (let j = BARLEV(); j >= 6; j--)
      setdist(coastpath[i], j, null!);
  }

  return c2;
}

/** hyper.h HAUNTED_RADIUS */
function HAUNTED_RADIUS(): number { return getDistLimit(); }

export function buildAnotherEquidistant(c: cell): void {
  //printf("building another coast\n");

  if (G.yendor_on) return;

  G.generatingEquidistant = true;

  const radius = c.land === laOcean ? 30 : HAUNTED_RADIUS() + 5;

  buildAnotherEquidistant_n(c, radius);

  G.generatingEquidistant = false;
}

export function coastval(c: cell, base: eLand): number {
  if (!c) return UNKNOWN;
  if (c.land === laNone) return UNKNOWN;
  if (base === laGraveyard) {
    if (c.land === laHaunted || c.land === laHauntedWall)
      return 0;
    if (c.land !== laGraveyard && c.land !== laHauntedBorder) return 30;
  }
  else if (base === laMirrored) {
    if (!inmirror(c)) return 0;
    if (!c.landparam) return UNKNOWN;
    return c.landparam & 255;
  }
  else if (base === laWestWall) {
    if (c.land !== base) return 0;
  }
  else {
    if (c.land === laOceanWall || c.land === laCaribbean || c.land === laWhirlpool ||
      c.land === laLivefjord || c.land === laWarpSea || c.land === laKraken || c.land === laDocks || c.land === laBrownian)
      return 30;
    if (c.land !== laOcean && !isGravityLand(c.land) && c.land !== laHaunted) {
      return 0;
    }
  }
  if (!c.landparam) return UNKNOWN;
  return c.landparam;
}

export function checkInTree(c: cell, maxv: number): boolean {
  if (c.landparam <= 3) return false;
  if (!maxv && WDIM() === 3 && bt_in()) {
    for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.landflags) return true; }
  }
  if (!maxv) return false;
  if (c.landflags) return true;
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    if (c2.landparam < c.landparam && checkInTree(c2, maxv - 1))
      return true;
  }
  return false;
}

let loopval = 0;

export function buildEquidistant(c: cell): void {
  loopval++; // loopchecker lc;
  try {
    buildEquidistant_body(c);
  } finally {
    loopval--;
  }
}

function buildEquidistant_body(c: cell): void {
  // sometimes crashes in Archimedean
  if (loopval > 100) { c.landparam = 0; return; }
  if (!c) return;
  if (c.landparam) return;
  /* if(weirdhyperbolic) {
    c->landparam = 50;
    return;
    } */
  if (sphere() || euclid()) return;
  let b = c.land;
  if (ls_any_chaos() && !inmirror(b)) return;
  if (!b) {
    // printf("land missing at %p\n", hr::voidp(c));
    describeCell(c);
    for (let i = 0; i < c.type; i++) if (c.move(i))
      describeCell(c.move(i));
    // buggycells.push_back(c);
  }
  if (b === laHauntedBorder) b = laGraveyard;
  if (inmirror(b)) b = laMirrored;
  let mcv = UNKNOWN;

  // find the lowest coastval
  for (let i = 0; i < c.type; i++) {
    const cv = coastval(createMov(c, i), b);
    if (cv < mcv) mcv = cv;
  }

  if (S3() === OINF) {
    c.landparam = mcv + 1;
    return;
  }

  let mcv2 = 0;

  if (mcv === 0) {
    // if(generatingEquidistant) printf("mcv=0\n");
    c.landparam = 1;
  }
  else if (WDIM() === 3) {
    for (let i = 0; i < c.type; i++) {
      const c2 = createMov(c, i);
      if (coastval(c2, b) === mcv)
        for (let j = 0; j < c2.type; j++) {
          const c3 = c2.move(j); if (!c3) continue;
          if (coastval(c3, b) < mcv)
            for (let k = 0; k < c3.type; k++) {
              const c4 = createMov(c3, k);
              if (c4.land === laNone && c2.mpdist <= BARLEV()) setdist(c4, BARLEV(), c2);
              buildEquidistant(c4);
            }
        }
    }
    for (let i = 0; i < c.type; i++) {
      const c2 = createMov(c, i);
      const cv = coastval(c2, b);
      if (cv < mcv) mcv = cv;
    }
    c.landparam = mcv + 1;
  }
  else {
    // if it appears twice, increase it
    let qcv = 0;
    let sid = 0;
    for (let i = 0; i < c.type; i++)
      if (coastval(c.move(i), b) === mcv) {
        qcv++; sid = i;
      }

    // if(generatingEquidistant) printf("qcv=%d mcv=%d\n", qcv, mcv);
    if (qcv >= 2) c.landparam = mcv + 1; // (mcv == UNKNOWN ? UNKNOWN : mcv+1);
    else {
      // if(qcv != 1) { printf("qcv = %d\n", qcv);  exit(1); }
      const c2 = c.move(sid);
      const bsid = c.c.spin(sid);
      for (let j = 0; j < c2.type; j++) {
        let q = gmod(bsid + j, c2.type);
        let c3 = c2.move(q);
        if (coastval(c3, b) < mcv) {
          const c4 = c2.cmodmove(bsid + 1);
          if (c4.land === laNone && c2.mpdist <= BARLEV()) setdist(c4, BARLEV(), c2);
          buildEquidistant(c4);
          mcv2 = coastval(c4, b);
          break;
        }
        q = gmod(bsid - j, c2.type);
        c3 = c2.move(q);
        if (coastval(c3, b) < mcv) {
          const c4 = c2.cmodmove(bsid - 1);
          if (c4.land === laNone && c2.mpdist <= BARLEV()) setdist(c4, BARLEV(), c2);
          buildEquidistant(c4);
          mcv2 = coastval(c4, b);
          break;
        }
      }
      if (mcv2 > mcv) mcv2 = mcv;
      if (mcv2 === 0) mcv2 = mcv;
      c.landparam = mcv2 + 1;

      /* if(c->heat < 3)
        raiseBuggyGeneration(c, "low heat"); */
    }
  }

  if (!c.landparam) {
    // int z = int(c->heat);
    // if(c->item || c->monst) printf("building coast over %s/%s, mpdist = %d\n", ...);
    if (c.land === laOcean) c.wall = waSea;
  }

  if (c.land === laEndorian) {
    const ct = c.type;
    // #if CAP_BT
    if (bt_in()) {
      notp('buildEquidistant: Endorian Forest in binary tilings (bt::bd_down)');
    }
    // #if MAXMDIM >= 4
    else if (WDIM() === 3 && hyperbolic()) {
      notp('buildEquidistant: Endorian Forest in 3D hyperbolic (currentmap->dirdist)');
    }
    else if (c.landparam === 1 && ctof(c)) {
      for (let i = 0; i < ct; i++) {
        const i1 = (i + 1) % c.type;
        if (c.move(i) && c.move(i).land !== laEndorian && c.move(i).land !== laNone)
          if (c.move(i1) && c.move(i1).land !== laEndorian && c.move(i1).land !== laNone) {
            c.landflags = 2;
            c.wall = waTrunk;
          }
      }
    }
    else if (c.landparam === 1 && !ctof(c)) {
      const ct = c.type;
      for (let i = 0; i < ct; i++) {
        const i1 = (i + 1) % ct;
        const i2 = (i + 2) % ct;
        const i4 = (i + 4) % ct;
        const i5 = (i + 5) % ct;
        if (c.move(i) && c.move(i).land === laBarrier && c.move(i).type === 7)
          if (c.move(i1) && c.move(i1).land !== laBarrier)
            if (c.move(i2) && c.move(i2).land !== laBarrier)
              if (c.move(i4) && c.move(i4).land !== laBarrier)
                if (c.move(i5) && c.move(i5).land !== laBarrier) {
                  c.landflags = 2;
                  c.wall = waTrunk;
                }

        if (c.move(i) && c.move(i).land !== laEndorian && c.move(i).land !== laNone && c.move(i).type === 7)
          if (c.move(i1) && c.move(i1).land !== laEndorian && c.move(i1).land !== laNone)
            if (c.move(i5) && c.move(i5).land !== laEndorian && c.move(i5).land !== laNone) {
              c.landflags = 3;
              c.wall = waTrunk;
            }
      }
    }
    else if (c.landparam > 1) {
      for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i);
        if (c2 && c2.landparam < c.landparam && c2.landflags) {
          let ok = false;
          if (c2.landflags === 3)
            ok = true;
          else if (c2.landflags === 2) {
            ok = c.modmove(i + 1).landparam !== c.landparam - 1
              && c.modmove(i - 1).landparam !== c.landparam - 1;
          }
          else for (let j = 0; j < c2.type; j++) {
            const c3 = c2.move(j);
            if (c3 && c3.landparam < c2.landparam && c3.landflags)
              if (c.c.spin(i) === (j + 3) % c2.type || c.c.spin(i) === (j + c2.type - 3) % c2.type)
                ok = true;
          }
          if (ok) {
            c.wall = waTrunk;
            c.landflags = 1;
          }
        }
        if (c2 && c2.landparam < c.landparam && c2.landflags === 1 && ctof(c)) {
          const c3 = c.modmove(i + 1);
          if (c3 && c3.landparam < c.landparam && c3.landflags === 1) {
            c.wall = waTrunk;
            c.landflags = 2;
          }
        }
      }
    }
    if (!c.landflags && checkInTree(c, 5)) {
      const lev = hrand(100);
      if (lev < 10) c.wall = waSolidBranch;
      else if (lev < 20) c.wall = waWeakBranch;
      else c.wall = waCanopy;
    }
    void waTrunk3;
  }

  const chance =
    ls_no_walls() ? (hrand(100) < 10) :
    ls_nice_walls() ? true :
    false;

  if (c.landparam > 30 && b === laOcean && !G.generatingEquidistant && !mhybrid() && hrand(10) < 5 && chance)
    buildAnotherEquidistant(c);

  if (c.landparam > HAUNTED_RADIUS() + 5 && b === laGraveyard && !G.generatingEquidistant && !mhybrid() && hrand(100) < (PURE() ? 25 : 5) && landUnlockedIngame(laHaunted) && chance)
    buildAnotherEquidistant(c);
}

export function randomDown(c: cell): cell {
  const tab: cell[] = [];
  for (let i = 0; i < c.type; i++)
    if (c.move(i) && coastval(c.move(i), laIvoryTower) < coastval(c, laIvoryTower))
      tab.push(c.move(i));
  if (isize(tab) === 1) return tab[0];
  return hrand_elt(tab, null!);
}

export function edgeDepth(c: cell): number {
  if (c.land === laIvoryTower || c.land === laEndorian || c.land === laDungeon || c.land === laWestWall)
    return coastvalEdge(c);
  else if (c.land !== laBarrier) {
    for (let i = 0; i < c.type; i++) if (c.move(i) && c.move(i).land === laBarrier)
      return -20 + c.cpdist;
  }
  return 0;
}

export function getHauntedDepth(c: cell): number {
  if ((ls_single() || euclid()) && c.land === laHaunted) return celldist(c);
  if (c.land === laHaunted) return c.landparam;
  if (c.land === laHauntedWall) return 0;
  if (c.land === laHauntedBorder || c.land === laGraveyard) return -c.landparam;
  return -100;
}

export function towerval(c: cell, cf: cellfunction): number {
  const cp1 = ts_left_of(c, cf);
  if (!cp1) return 0;
  let under = 0;
  const cfc = cf(c);
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (cf(c2) < cfc) under++; }
  return (c.type - 6) + 2 * (cp1.type - 6) + 4 * under;
}

/* other geometries */

export function setLandWeird(_c: cell): void {
  // replaced with standard CR4
  /* if(specialland == laIvoryTower || specialland == laEndorian || specialland == laDungeon || specialland == laOcean) {
    int d = celldist(c) - (getDistLimit() - 2);
    if(d <= 0)
      c->land = laCrossroads4;
    else
      c->land = specialland, c->landparam = d;
    } */
}

export function setLandQuotient(c: cell): void {
  setland(c, G.specialland);
  let fv = zebra40(c);
  if (idiv(fv, 4) === 4 || idiv(fv, 4) === 6 || idiv(fv, 4) === 5 || idiv(fv, 4) === 10) fv ^= 2;
  if (G.specialland === laWarpCoast)
    if (fv % 4 === 0 || fv % 4 === 2) setland(c, laWarpSea);
  if (G.specialland === laElementalWall)
    setland(c, laEFire + (fv % 4));
  if (G.specialland === laClearing)
    c.land = laClearing;
  if (G.specialland === laIvoryTower || G.specialland === laEndorian || G.specialland === laDungeon || G.specialland === laOcean) {
    const d = celldist(c) - 1;
    if (d <= 0)
      c.land = laCrossroads4;
    else {
      c.land = G.specialland; c.landparam = d;
    }
  }
  if (G.specialland === laWestWall) c.land = laCrossroads4;
}

export function elementalXY(c: cell, x: number, y: number, make_wall: boolean): void {
  if (x > 0 && y > 0) setland(c, laEFire);
  else if (x > 0 && y < 0) setland(c, laEAir);
  else if (x < 0 && y < 0) setland(c, laEWater);
  else if (x < 0 && y > 0) setland(c, laEEarth);
  else if (x > 0) {
    c.land = laElementalWall; c.barleft = laEAir; c.barright = laEFire;
  }
  else if (x < 0) {
    c.land = laElementalWall; c.barleft = laEEarth; c.barright = laEWater;
  }
  else if (y > 0) {
    c.land = laElementalWall; c.barleft = laEEarth; c.barright = laEFire;
  }
  else if (y < 0) {
    c.land = laElementalWall; c.barleft = laEAir; c.barright = laEWater;
  }
  if (x === 0 && y === 0) {
    c.land = laElementalWall; c.wall = waBarrier;
  }
  else if (c.land === laElementalWall && make_wall)
    c.wall = getElementalWall(hrand(2) ? c.barleft : c.barright);
}

export function setLandSphere(c: cell): void {
  setland(c, G.specialland);
  if (G.specialland === laWarpCoast)
    setland(c, getHemisphere(c, 0) > 0 ? laWarpCoast : laWarpSea);
  if (G.specialland === laWestWall) c.land = laCrossroads4;
  if (G.specialland === laClearing)
    c.land = laClearing;
  if (G.specialland === laElementalWall) {
    const x = getHemisphere(c, 1);
    const y = getHemisphere(c, 2);
    elementalXY(c, x, y, (c.type !== 6 || GOLDBERG()));
  }
  if (!(euclid() && (quotient() || G.disksize)))
    if (G.specialland === laCrossroads || G.specialland === laCrossroads2 || G.specialland === laCrossroads3 || G.specialland === laTerracotta) {
      const x = getHemisphere(c, 1);
      if (x === 0 && G.specialland === laTerracotta) {
        setland(c, laMercuryRiver); c.wall = waMercury;
      }
      else if (x === 0 || (G.specialland === laCrossroads3 && getHemisphere(c, 2) === 0)) {
        setland(c, laBarrier); c.wall = waBarrier;
      }
      else setland(c, G.specialland);
      if (G.specialland === laCrossroads3 && c.type !== 6 && c.master.fiftyval === 1 && !GOLDBERG())
        c.wall = waBigTree;
    }
  if (G.specialland === laIvoryTower || G.specialland === laEndorian || G.specialland === laDungeon || G.specialland === laOcean || G.specialland === laMountain) {
    const d = celldist(c);
    if (d <= 0)
      c.land = laCrossroads4;
    else {
      c.land = G.specialland; c.landparam = d;
    }
  }
}

/** hyper.h max_vec */
const max_vec = (1 << 14);

const euland: eLand[] = [];
const euland3 = new Map<number, eLand>();
const euland3_hash = new Map<number, eLand>();
// EX map<array<int, 3>, eLand> landscape_lands: G.landscape_lands (keyed by "a0,a1,a2")

function euland_resize(): void {
  // euland.resize(max_vec): new elements are laNone
  while (euland.length < max_vec) euland.push(laNone);
}

/** eLand& get_euland(int c): the value; set_euland writes through the reference */
export function get_euland(c: number): eLand {
  euland_resize();
  return euland[c & (max_vec - 1)];
}
function set_euland(c: number, v: eLand): eLand {
  euland_resize();
  euland[c & (max_vec - 1)] = v;
  return v;
}

export function clear_euland(first: eLand): void {
  euland_resize();
  for (let i = 0; i < max_vec; i++) euland[i] = laNone;
  if (!nonisotropic()) euland[0] = euland[1] = euland[max_vec - 1] = first;
  euland3.clear();
  euland3.set(0, first);
  G.landscape_lands.clear();
  G.landscape_lands.set('0,0,0', first);
}

function valid_wall_at(c: number): boolean {
  if (nonisotropic() || mhybrid()) return true;
  return i16(c) % 3 === 0;
}

export function switchable(nearland: eLand, farland: eLand, c: number): eLand {
  if (ls_std_chaos()) {
    if (hrand(6) === 0)
      return getNewLand(nearland);
    return nearland;
  }
  else if (ls_no_walls()) {
    if ((G.dual_state && nearland === laCrossroads4) || hrand(15) === 0)
      return getNewLand(nearland);
    if (nearland === laCrossroads4 && (nonisotropic() || mhybrid()))
      return getNewLand(nearland);
    return nearland;
  }
  else if (nearland === laCrossroads && nonisotropic()) {
    return laBarrier;
  }
  else if (nearland === laCrossroads) {
    if (hrand(4) === 0 && valid_wall_at(c))
      return laBarrier;
    return laCrossroads;
  }
  else if (nearland === laBarrier) {
    return getNewLand(farland);
  }
  else {
    if (hrand(20) === 0 && valid_wall_at(c))
      return laBarrier;
    return nearland;
  }
}

export function getEuclidLand(c: number): eLand {
  if (nonorientable() && c < 0) c = -c;
  const la = get_euland(c);
  if (la) return la;
  if (get_euland(c - 2) && !get_euland(c - 1)) getEuclidLand(c - 1);
  if (get_euland(c - 1)) return set_euland(c,
    switchable(get_euland(c - 1), get_euland(c - 2), c));
  if (get_euland(c + 2) && !get_euland(c + 1)) getEuclidLand(c + 1);
  if (get_euland(c + 1)) return set_euland(c,
    switchable(get_euland(c + 1), get_euland(c + 2), c));
  return set_euland(c, laCrossroads);
}

export function setLandSol(c: cell): void {
  setland(c, G.specialland);
  if (ls_std_chaos()) {
    setland(c, getEuclidLand(c.master.distance));
    return;
  }
  else if (ls_nice_walls()) {
    setland(c, getEuclidLand(c.master.distance));
    if (c.land === laBarrier && c.master.emeraldval % 3) c.wall = waBarrier;
  }
  switch (c.land) {
    case laTerracotta:
      if ((c.master.distance & 15) === 1) {
        setland(c, laMercuryRiver);
        if (c.master.emeraldval % 3) c.wall = waMercury;
      }
      break;
    case laOcean: case laIvoryTower: case laEndorian: case laDungeon:
      if (c.master.distance <= 0) setland(c, laRlyeh);
      else c.landparam = c.master.distance;
      break;
    default: ;
  }
}

export function setLandHybrid(c: cell): void {
  if (in_s2xe() && !among(G.specialland, laElementalWall)) {
    const w = hybrid_get_where(c);
    const d = w[1];

    const ps = hybrid_in_underlying_geometry(() => pseudohept(w[0]));
    setland(c, G.specialland);
    if (ls_any_nowall()) {
      setland(c, getEuclidLand(d));
      return;
    }
    else if (ls_any_wall()) {
      setland(c, getEuclidLand(d));
      if (c.land === laBarrier) c.wall = ps ? waNone : waBarrier;
    }
    switch (c.land) {
      case laTerracotta:
        if ((d & 15) === 1) {
          setland(c, laMercuryRiver);
          c.wall = ps ? waNone : waMercury;
        }
        break;
      case laOcean: case laIvoryTower: case laEndorian: case laDungeon:
        if (d < 0) setland(c, laCrossroads);
        else if (d === 0) {
          setland(c, laBarrier); c.wall = ps ? waNone : waBarrier;
        }
        else c.landparam = d;
        break;
      default: ;
    }
    return;
  }
  const wc = hybrid_get_where(c)[0];
  c.barleft = wc.barleft;
  c.barright = wc.barright;
  c.bardir = wc.bardir;
  if (wc.land) setland(c, wc.land);
  if (among(wc.wall, waBarrier, waMercury) || wc.land === laElementalWall)
    c.wall = wc.wall;
}

/** euland3_hash[hash]: operator[] inserts laNone */
function euland3_hash_get(hash: number): eLand {
  if (!euland3_hash.has(hash)) euland3_hash.set(hash, laNone);
  return euland3_hash.get(hash)!;
}

export function setLandNil(c: cell): void {
  setland(c, G.specialland);

  if (ls_patched_chaos()) {
    const hash = (((c.master.zebraval + 4) >> 3) << 16) + ((c.master.emeraldval + 4) >> 3);
    let l = euland3_hash_get(hash);
    if (l === laNone) { l = getNewLand(laNone); euland3_hash.set(hash, l); }
    setland(c, l);
    return;
  }
  else if (ls_nice_walls()) {
    setland(c, getEuclidLand(c.master.zebraval));
    if (c.land === laBarrier && c.master.emeraldval % 3) c.wall = waBarrier;
  }
  else if (ls_no_walls()) {
    setland(c, getEuclidLand(c.master.emeraldval));
    if (c.land === laBarrier && c.master.zebraval % 3) c.wall = waBarrier;
  }

  switch (c.land) {
    case laCrossroads3: {
      const ox = c.master.zebraval - 8;
      const oy = c.master.emeraldval - 8;
      const hash = (((ox + 16) >> 5) << 16) + ((oy + 16) >> 5);
      let l = euland3_hash_get(hash);
      if (l === laNone) { l = getNewLand(laCrossroads3); euland3_hash.set(hash, l); }
      if (ox % 16 === 0) setland(c, laBarrier);
      else if (oy % 16 === 0) setland(c, laBarrier);
      else setland(c, l);
      if ((c.land as eLand) === laBarrier && ((c.master.zebraval & 3) || (c.master.emeraldval & 3))) c.wall = waBarrier;
      break;
    }
    case laElementalWall: {
      const ox = c.master.zebraval - 4;
      const oy = c.master.emeraldval - 4;
      const x = (ox & 7) ? ((ox & 8) ? 1 : -1) : 0;
      const y = (oy & 7) ? ((oy & 8) ? 1 : -1) : 0;
      elementalXY(c, x, y, (ox & 3) !== 0 || (oy & 3) !== 0);
      break;
    }
    case laTerracotta:
      if ((c.master.zebraval & 7) === 4 && (c.master.emeraldval & 7) === 4) {
        setland(c, laMercuryRiver);
        c.wall = waMercury;
      }
      break;
    case laOcean: case laIvoryTower: case laEndorian: case laDungeon:
      if (c.master.zebraval <= 0) setland(c, laRlyeh);
      else c.landparam = c.master.zebraval;
      break;
    default: ;
  }
}

export function setLandEuclid(c: cell): void {
  // #if CAP_RACING
  if (G.racing_track_ready) {
    setland(c, laMemory);
    return;
  }
  if (!c.land) setland(c, G.specialland);
  if (ls_any_nowall()) {
    const co = euc2_coordinates(c);
    const y = co[1];
    c.land = getEuclidLand(y);
  }
  if (ls_any_wall()) {
    const co = euc2_coordinates(c);
    const x = co[0], y = co[1];
    setland(c, getEuclidLand(y + 2 * x));
  }
  if (c.land === laTerracotta) {
    const co = euc2_coordinates(c);
    const x = co[0], y = co[1];
    if (((y + 2 * x) & 15) === 1) {
      setland(c, laMercuryRiver);
      c.wall = waMercury;
    }
  }
  if (G.specialland === laWhirlpool) {
    c.land = laOcean;
    c.landparam = 99;
  }
  if (G.specialland === laPrincessQuest) setland(c, laPalace);
  if (G.specialland === laOcean) {
    const co = euc2_coordinates(c);
    let y = co[1];
    y += 10;
    if (euclid() && quotient()) y = -celldistAlt(c);
    if (y === 0) { setland(c, laBarrier); if (ishept(c)) c.land = laRlyeh; }
    else if (y < 0) setland(c, laRlyeh);
    else c.landparam = y;
  }
  if (G.specialland === laWestWall) {
    const co = euc2_coordinates(c);
    let x = co[0];
    x = -5 - x;
    if (x === 0) { setland(c, laBarrier); if (ishept(c)) setland(c, laMotion); }
    else if (x < 0) setland(c, laMotion);
    else c.landparam = x;
  }
  if (G.specialland === laIvoryTower || G.specialland === laDungeon) {
    const co = euc2_coordinates(c);
    let y = co[1];
    y = -5 - y;
    if (G.specialland === laDungeon) y = -10 - y;
    if (euclid() && quotient()) y = -celldistAlt(c);
    if (y === 0) { setland(c, laBarrier); if (ishept(c)) setland(c, laAlchemist); }
    else if (y < 0) setland(c, laAlchemist);
    else {
      c.landparam = y;
    }
  }
  if (G.specialland === laElementalWall) {
    const co = euc2_coordinates(c);
    const x = co[0], y = co[1];
    let x0 = euc_in(2, 4) ? x : x + (y >> 1);
    let y0 = y;

    let id = 0;
    if (y0 & 16) id += 2;
    if (x0 & 16) id += 1;

    x0 += 8; y0 += 8;

    y0--; x0++;
    let id2 = 0;
    if (y0 & 16) id2 += 2;
    if (x0 & 16) id2 += 1;

    setland(c, laEFire + id);

    if (((y0 & 15) === 15 && (x0 & 1)) || ((x0 & 15) === 0 && ((y0 + 1) & 1))) {
      if (c.land === laEFire) c.wall = waEternalFire;
      if (c.land === laEWater) c.wall = waSea;
      if (c.land === laEAir) c.wall = waChasm;
      if (c.land === laEEarth) c.wall = waStone;
      c.barright = c.land;
      c.barleft = laEFire + id2;
      setland(c, laElementalWall);
    }
  }
  if (c.land === laCrossroads3) {
    const co = euc2_coordinates(c);
    const x = co[0], y = co[1];
    let y0 = euc_in(2, 4) ? 2 * y - x : y;
    let x0 = euc_in(2, 4) ? 2 * x + y : x + idiv(y, 2);

    x0 += 24; y0 += 8;

    let id = 0;
    if (y0 & 16) id ^= 1;
    if (x0 & 16) id ^= 1;

    setland(c, id ? laCrossroads3 : laDesert);

    if (euc_in(2, 4) ? (!(y0 & 15) || !(x0 & 15)) : ((y0 & 15) === 15 && (x0 & 1)) || ((x0 & 15) === 0 && ((y0 + 1) & 1))) {
      setland(c, laBarrier);
      c.wall = waBarrier;
    }
  }
  if (G.specialland === laWarpCoast) {
    const co = euc2_coordinates(c);
    const x = co[0], y = co[1];

    let zz = a4() ? x : 2 * x + y + 10;
    zz = gmod(zz, 30);
    if (zz >= 15)
      setland(c, laWarpSea);
    else
      setland(c, laWarpCoast);
  }
}

export function get_euland3(x: number): eLand {
  if (euland3.has(x)) return euland3.get(x)!;
  // euland3[x-1] / euland3[x+1]: operator[] inserts laNone when missing (evaluated before the store)
  const at = (k: number): eLand => { if (!euland3.has(k)) euland3.set(k, laNone); return euland3.get(k)!; };
  if (x > 0) { euland3.set(x, laNone); const l = getNewLand(at(x - 1)); euland3.set(x, l); return l; }
  if (x < 0) { euland3.set(x, laNone); const l = getNewLand(at(x + 1)); euland3.set(x, l); return l; }
  euland3.set(x, laCrossroads);
  return laCrossroads;
}

export function set_euland3(c: cell, co10: number, co11: number, alt: number, hash: number): void {

  if (ls_std_chaos()) {
    setland(c, get_euland3(gdiv(co10, 60)));
  }

  else if (ls_nice_walls()) {
    const l1 = get_euland3(gdiv(co10, 360));
    const l2 = get_euland3(gdiv(co10 + 59, 360));
    if (l1 !== l2 && hrand(100) < 75) setland(c, laBarrier);
    else setland(c, l1);
  }

  else if (ls_no_walls()) {
    setland(c, get_euland3(idiv(alt, 4)));
  }

  else if (ls_patched_chaos()) {
    let l = euland3_hash_get(hash);
    if (l === laNone) { l = getNewLand(laBarrier); euland3_hash.set(hash, l); }
    setland(c, l);
  }

  if (c.land === laElementalWall) {
    setland(c, laEFire + ((idiv(co10, 240) & 1) ? 0 : 2) + ((idiv(co11, 240) & 1) ? 0 : 1));
  }

  if (c.land === laCamelot) {
    setland(c, laCrossroads);
    buildCamelot(c);
  }

  if (c.land === laTerracotta) {
    if (((alt & 15) === 8) && hrand(100) < 90)
      c.wall = waMercury;
  }

  if (among(c.land, laOcean, laIvoryTower, laDungeon, laEndorian)) {
    if (alt === 0)
      c.land = laCrossroads4;
    else if (alt > 0)
      c.landparam = alt;
    else
      c.landparam = -alt;
  }

  if (c.land === laWarpCoast) {
    if (gmod(co10, 240) >= 120)
      c.land = laWarpSea;
  }
}

// the main big stuff function

// EX bool easy_to_find_specialland = false: G.easy_to_find_specialland

export function quickfind(l: eLand): boolean {
  if (l === G.cheatdest) return true;
  if (l === G.specialland && G.easy_to_find_specialland) return true;
  // #if CAP_TOUR
  if (G.tour_on && notp('tour::quickfind')) return true;
  return false;
}

function INVLUCK(): boolean { return G.items[itOrbLuck] !== 0 && G.inv_on; }
function I2000(): number { return INVLUCK() ? 600 : 2000; }
function I10000(): number { return INVLUCK() ? 3000 : 10000; }

// EX hookset<int(cell*, bool)> hooks_wallchance: G.hooks_wallchance

export function wallchance(c: cell, deepOcean: boolean): number {
  const i = G.hooks_wallchance.callhandlers(-1, c, deepOcean);
  if (i !== -1) return i;
  const l = c.land;
  return (
    inmirror(c) ? 0 :
    isGravityLand(l) ? 0 :
    G.generatingEquidistant ? 0 :
    l === laPrairie ? 0 :
    (G.yendor_on && G.yendor_nexttostart) ? 10000 :
    G.princess_challenge ? 0 :
    isElemental(l) ? 4000 :
    (G.yendor_on && (G.yendor_generating || !(yendor_clev().flags & YF_WALLS))) ? 0 :
    (S3() >= OINF && l === laCrossroads) ? 2000 :
    (S3() >= OINF && l === laCrossroads2) ? 2500 :
    (S3() >= OINF && l === laCrossroads3) ? 3333 :
    (S3() >= OINF && l === laCrossroads4) ? 5000 :
    (S3() >= OINF && l === laCrossroads5) ? 10000 :
    l === laCrossroads3 ? 10000 :
    l === laCrossroads ? 5000 :
    l === laCrossroads2 ? 10000 :
    l === laCrossroads5 ? 10000 :
    l === laCrossroads4 ? 5000 :
    l === laCrossroads6 ? 5000 :
    l === laMasterCrossroads ? 10000 :
    (l === laMirror && !G.yendor_generating) ? 2500 :
    G.tactic_on ? 0 :
    G.racing_on ? 0 :
    l === laCaribbean ? 500 :
    (l === laWarpSea || l === laWarpCoast) ? 500 :
    l === laStorms ? 250 :
    l === laHaunted ? 0 :
    (l === laGraveyard && !deepOcean) ? 0 :
    // (l == laGraveyard && items[itBone] >= 10) ? 120 :
    l === laOcean ? (deepOcean ? (PURE() ? 250 : 2000) : 0) :
    l === laDragon ? 120 :
    50);
}

/** \brief should we generate the horocycles in the current geometry? */
export function horo_ok(): boolean {
  if (INVERSE()) return false;
  if (hat_in()) return false;
  if (G.currentmap.strict_tree_rules()) return true;
  // #if MAXMDIM >= 4
  if (WDIM() === 3 && hyperbolic() && !PURE() && notp('reg3::in_hrmap_h3')) return false;
  return mhyperbolic() && !bt_in() && !arcm_in() && !kite_in() && !experimental() && !mhybrid() && !arb_in() && !quotient();
}

/** \brief should we either generate the horocycles in the current geometry, or have them exist via eubinary? */
export function horo_or_eubinary(): boolean {
  return horo_ok() || eubinary();
}

/** \brief is celldistAlt defined for c? */
export function have_alt(c: cell): boolean {
  return eubinary() || !!c.master.alt;
}

/** \brief generate alts around c if necessary */
export function gen_alt(c: cell): void {
  if (!eubinary()) G.currentmap.extend_altmap(c.master);
}

/** \brief generate alts around c and further if necessary */
export function gen_alt_around(c: cell): void {
  if (!eubinary()) {
    G.currentmap.extend_altmap(c.master);
    for (let i = 0; i < c.master.type; i++)
      G.currentmap.extend_altmap(c.master.move(i));
  }
}

/** \brief is celldistAlt defined for c and c2, and greater for c? */
export function greater_alt(c: cell, c2: cell): boolean {
  return have_alt(c) && have_alt(c2) && celldistAlt(c) > celldistAlt(c2);
}

export function horo_gen_distance(): number {
  return (WDIM() === 3 && hyperbolic()) ? 1 : 2;
}

export function single_horo(horoland: eLand): boolean {
  return G.specialland === horoland && ls_single();
}

export function in_single_horo(c: cell, horoland: eLand): boolean {
  return single_horo(horoland) || celldistAlt(c) <= 0;
}

export function inside_starting_horo(c: cell, horoland: eLand): boolean {
  return G.specialland === horoland && celldistAlt(c) <= 0;
}

export function extend_alt(c: cell, horoland: eLand, overland: eLand, extend_in_single = true, dist: number = horo_gen_distance()): boolean {
  if (c.land !== horoland && c.land !== overland && !(c.land === laBrownian && overland === laOcean)) return false;
  if (bt_in() && !single_horo(horoland) && !inside_starting_horo(c, horoland)) return false;
  if (have_alt(c) && ((ls_single() && extend_in_single) || masterAlt(c) <= dist) && !(euclid() && !ls_single())) {
    gen_alt(c);
    preventbarriers(c);
    return true;
  }
  return false;
}

export function can_start_horo(c: cell, allowed_in_horo = false): boolean {
  if (ls_voronoi_structure()) return false;
  if (!allowed_in_horo && ls_horodisk_structure()) return false;
  if (G.yendor_on && !among(c.land, laCaribbean, laStorms))
    return false;
  return !!ctof(c) && !have_alt(c) && horo_ok() && !G.randomPatternsMode && !G.racing_on;
}

export function gp_wall_test(): boolean {
  // #if CAP_GP
  if (GOLDBERG()) return hrand(gp_dist_3()) === 0;
  // #if CAP_IRR
  if (IRREGULAR()) return notp('gp_wall_test: irr::cells_of_heptagon');
  return true;
}

export function deep_ocean_at(c: cell, from: cell): boolean {

  if (G.generatingEquidistant) return false;

  if (c.land === laOcean) {
    if (!from) return true;
    else for (let i = 0; i < from.type; i++) {
      const c2 = from.move(i);
      if (c2 && c2.land === laOcean && c2.landparam > 30) {
        return true;
      }
      if (c2) for (let j = 0; j < c2.type; j++) {
        const c3 = c2.move(j); if (!c3) continue;
        if (c3 && c3.land === laOcean && c3.landparam > 30)
          return true;
      }
    }
  }

  if (c.land === laGraveyard) {
    if (!from) return true;
    else for (let i = 0; i < from.type; i++) {
      const c2 = from.move(i);
      if (c2 && c2.landparam > HAUNTED_RADIUS() + 5)
        return true;
      if (c2) for (let j = 0; j < c2.type; j++) {
        const c3 = c2.move(j); if (!c3) continue;
        if (c3 && c3.land === laGraveyard && c3.landparam > HAUNTED_RADIUS() + 5)
          return true;
      }
    }
  }

  return false;
}

export function good_for_wall(c: cell): boolean {
  if (arcm_in()) return true;
  if (WDIM() === 3) return true;
  if (INVERSE()) return true;
  if (!old_nice_walls()) return true;
  return pseudohept(c);
}

export function walls_not_implemented(): boolean {
  // if(WDIM == 3 && !PURE) return true;
  if (sphere() || quotient() || nonisotropic() || aperiodic() || experimental()) return true;
  return WDIM() === 3 && (cgflags() & qIDEAL) !== 0n;
}

export function old_nice_walls(): boolean {
  return (G.geometry === gNormal && (PURE() || BITRUNCATED())) || (G.geometry === gEuclid && !(INVERSE() || IRREGULAR()));
}

export function nice_walls_available(): boolean {
  if (mhybrid()) return hybrid_in_underlying_geometry(() => nice_walls_available());
  if (fake_in()) return fake_in_underlying_geometry(() => nice_walls_available());
  return WDIM() === 2;
}

export function build_barrier_good(c: cell, l: eLand = laNone): void {

  if (!old_nice_walls()) {
    general_barrier_build(NOWALLSEP_WALL, c, l ? l : getNewLand(c.land), NODIR);
  }

  else {
    const bd = 2 + hrand(2) * 3;
    buildBarrier(c, bd, l);
  }
}

export function build_walls(c: cell, from: cell): void {
  const deepOcean = deep_ocean_at(c, from);

  // if(weirdhyperbolic && c->land == laOcean) deepOcean = c->landparam >= 30;

  // buildgreatwalls

  if (mhybrid()) return; /* Great Walls generated via the underlying geometry */

  if (walls_not_implemented()) return; // walls not implemented here

  if (ls_chaoticity() >= 60) return;

  if (nice_walls_available()) {
    if (ctof(c) && c.land === laMirror && !G.yendor_generating && hrand(I10000()) < 6000) {
      build_barrier_good(c, laMirrored);
      return;
    }

    if (ctof(c) && c.land === laTerracotta && hrand(I10000()) < 200) {
      build_barrier_good(c, laTerracotta);
      return;
    }

    if (ctof(c) && ls_single()) {
      if (G.specialland === laCrossroads && hrand(I10000()) < 5000) {
        build_barrier_good(c, laCrossroads);
        return;
      }

      if (G.specialland === laCrossroads6 && hrand(I10000()) < 5000) {
        build_barrier_good(c, laCrossroads6);
        return;
      }

      if (G.specialland === laMasterCrossroads && c.land === laMasterCrossroads && good_for_wall(c) && hrand(10000) < 100)
        buildBarrierNowall(c, laCrossroads4);

      if (G.specialland === laMasterCrossroads && hrand(10000) < 1500 && !among(c.land, laCrossroads4, laCrossroads2, laCrossroads5))
        build_barrier_good(c, c.land === laMasterCrossroads ? pick(laCrossroads, laCrossroads2, laCrossroads3, laCrossroads5, laCrossroads6) : laMasterCrossroads);

      if (G.specialland === laMasterCrossroads && hrand(10000) < 1500 && c.land === laCrossroads4)
        buildBarrierNowall(c, laMasterCrossroads);

      if (G.specialland === laCrossroads3) {
        build_barrier_good(c, laCrossroads3);
        return;
      }

      if (G.specialland === laCrossroads5) {
        build_barrier_good(c, laCrossroads5);
        return;
      }

      if (c.land === laCrossroads && isEquidLand(G.specialland)) {
        build_barrier_good(c, G.specialland);
        return;
      }

      if (G.specialland === laElementalWall && hrand(I10000()) < 4000) {
        build_barrier_good(c);
        return;
      }
    }
  }
  else if (good_for_wall(c) && ls_single() && G.specialland === laElementalWall && hrand(I10000()) < 4000) {
    buildBarrierNowall(c, getNewLand(c.land));
  }

  if (c.land === laCrossroads2 && BITRUNCATED()) {
    buildCrossroads2(c);
    return;
  }

  else if (good_for_wall(c) && isWarpedType(c.land) && hrand(10000) < 3000 && c.land &&
    buildBarrierNowall(c, c.land ^ laWarpSea ^ laWarpCoast)) { }

  else if (G.land_structure === lsVineWalls) {
    const ev = emeraldval(c);
    if ((ev | 11) === 43 && c.bardir === NODIR) {
      for (let i = 0; i < c.type; i++) if (emeraldval(c.cmove(i)) === ev - 4) {
        let oldleft = true;
        for (let j = 1; j <= 3; j++)
          if (c.modmove(i + j) && c.modmove(i + j).mpdist < c.mpdist)
            oldleft = false;
        buildBarrierStrong(c, i, oldleft, getNewLand(c.land));
        extendBarrier(c);
      }
    }
    return;
  }

  else if (ls_single()) return;

  else if (G.geometry === gNormal && celldist(c) < 3 && !GOLDBERG()) {
    if (G.top_land && c === G.cwt.at.master.move(3).c7) {
      buildBarrierStrong(c, 6, true, G.top_land);
    }
  }

  else if (ls_wall_chaos()) {
    if (good_for_wall(c) && hrand(10000) < 9000 && c.land && !inmirror(c) && c.bardir !== NOBARRIERS && !c.master.alt) {
      build_barrier_good(c);
      return;
    }
  }

  else if (ls_std_chaos()) {
    if (good_for_wall(c) && hrand(10000) < 9000 && c.land && !inmirror(c) && c.bardir !== NOBARRIERS && !c.master.alt && buildBarrierNowall(c, getNewLand(c.land)))
      return;
  }

  else if (good_for_wall(c) && ls_any_wall() && c.land === laCrossroads4 && hrand(10000) < 7000 && c.land && !c.master.alt && !G.tactic_on && !G.racing_on &&
    buildBarrierNowall(c, getNewLand(laCrossroads4))) { }

  else if (good_for_wall(c) && ls_any_wall() && c.land === laMasterCrossroads && hrand(10000) < 500 && c.land && !c.master.alt && !G.tactic_on && !G.racing_on &&
    landUnlockedIngame(laCrossroads4) && buildBarrierNowall(c, laCrossroads4)) { }

  else if (good_for_wall(c) && ls_any_wall() && hrand(I10000()) < 20 && !G.generatingEquidistant && !G.yendor_on && !G.tactic_on && !G.racing_on && !isCrossroads(c.land) &&
    landUnlockedIngame(laCrossroads4) && !weirdhyperbolic() && !c.master.alt && c.bardir !== NOBARRIERS &&
    !inmirror(c) && !isSealand(c.land) && !isHaunted(c.land) && !isGravityLand(c.land) &&
    (c.land !== laRlyeh || rlyehComplete()) &&
    c.land !== laTortoise && c.land !== laPrairie && c.land &&
    !(c.land === laGraveyard && !deepOcean)
    && c.land !== laCanvas
  ) {
    buildBarrierNowall(c, laCrossroads4);
  }

  else if (ls_no_walls() && hrand(idiv(I10000(), 4)) < wallchance(c, deepOcean) && gp_wall_test() && c.bardir !== NOBARRIERS && !c.master.alt) {
    buildBarrierNowall(c, getNewLand(c.land));
  }

  else if (weirdhyperbolic() && G.yendor_on && G.yendor_nexttostart) {
    if (buildBarrierNowall(c, G.yendor_nexttostart))
      G.yendor_nexttostart = laNone;
  }

  else if (weirdhyperbolic() && G.specialland === laElementalWall && hrand(I10000()) < 1000 && gp_wall_test())
    buildBarrierNowall(c, getNewLand(c.land));

  else if (S3() >= OINF && c.land && hrand(I10000()) < wallchance(c, deepOcean) && c.bardir !== NOBARRIERS)
    buildBarrierNowall(c, getNewLand(c.land));

  else if (!nice_walls_available()) { } // non-Nowall barriers not implemented yet in weird hyperbolic

  // #if CAP_FIELD
  else if (c.land === laPrairie && c.LHU.fi.walldist === 0 && !euclid()) {
    if (ls_nice_walls())
      for (let bd = 0; bd < c.master.type; bd++) {
        const fval2 = createStep(c.master, bd).fieldval;
        const wd = currfp_gmul(fval2, currfp_inverses(c.fval - 1));
        if (currfp_distwall(wd) === 0) {
          buildBarrier(c, bd);
          break;
        }
      }
    if (ls_no_walls()) {
      buildBarrierNowall(c, getNewLand(c.land));
    }
  }

  else if (good_for_wall(c) && c.land && ls_nice_walls() && c.land !== laCrossroads4 && hrand(I10000()) < wallchance(c, deepOcean))
    build_barrier_good(c);
}

export function start_camelot(c: cell): void {
  const rtr = newRoundTableRadius();
  const alt = create_altmap(c, ls_single() ? 2 : rtr + (hyperbolic() && WDIM() === 3 ? 11 : 14), ls_single() ? hsA : hsOrigin);
  if (alt) {
    altmap_set_radius(alt, rtr);
    altmap_set_orig_land(alt, ls_horodisk_structure() ? laCrossroads : c.land);
    G.hv_land.set(alt, laCamelot);
  }
}

// EX bool debug_voronoi: G.debug_voronoi; EX map<heptagon*, eLand> hv_land: G.hv_land

/** clearing::bpdata[h].root = NULL (complex.cpp's std::map; operator[] inserts a default clearingdata) */
function clearing_bpdata_root_null(h: heptagon): void {
  if (!G.clearing_bpdata) throw new NotPorted('clearing::bpdata (complex.cpp, P5: G.clearing_bpdata)');
  const bp = G.clearing_bpdata as Map<heptagon, clearingdata>;
  if (!bp.has(h)) bp.set(h, new clearingdata());
  bp.get(h)!.root = null!;
}

export function build_horocycles(c: cell, from: cell): void {

  const deepOcean = deep_ocean_at(c, from);

  if (!ls_any_order() && !ls_single()) return;

  if (ls_single() && !among(G.specialland, laTemple, laMountain, laClearing, laStorms, laWhirlpool, laCaribbean, laCanvas, laPalace, laPrincessQuest, laCamelot))
    return;

  // buildbigstuff

  if (ls_any_order() && (ls_horodisk_structure() || bearsCamelot(c.land)) && can_start_horo(c, true) && !bt_in() && !ls_voronoi_structure() &&
    // #if MAXMDIM >= 4
    !(hyperbolic() && WDIM() === 3 && !reg3_in_hrmap_rule_or_subrule()) &&
    (quickfind(laCamelot) || G.peace_on || (hrand(I2000()) < (c.land === laCrossroads4 || ls_no_walls() ? 800 : 200) && horo_ok() &&
    G.items[itEmerald] >= U5())))
    start_camelot(c);

  if (c.land === laRlyeh && can_start_horo(c) && (quickfind(laTemple) || (hrand(I2000()) < 100 && landUnlockedIngame(laTemple))))
    create_altmap(c, horo_gen_distance(), hsA);

  if (c.land === laJungle && can_start_horo(c) && (quickfind(laMountain) || (hrand(I2000()) < 100 && landUnlockedIngame(laMountain))))
    create_altmap(c, horo_gen_distance(), hsA);

  if (c.land === laOvergrown && can_start_horo(c) && (quickfind(laClearing) || (hrand(I2000()) < 25 && landUnlockedIngame(laClearing)))) {
    const h = create_altmap(c, horo_gen_distance(), hsA);
    if (h) clearing_bpdata_root_null(h);
  }

  if (stdhyperbolic() && c.land === laStorms && can_start_horo(c) && hrand(2000) < 1000) {
    const h = create_altmap(c, horo_gen_distance(), hsA);
    if (h) altmap_set_which(h.alt, hrand(2));
  }

  if (c.land === laOcean && deepOcean && !G.generatingEquidistant && !G.peace_on && can_start_horo(c) &&
    (quickfind(laWhirlpool) || (
      hrand(2000) < (PURE() ? 500 : 1000) && landUnlockedIngame(laWhirlpool))))
    create_altmap(c, horo_gen_distance(), hsA);

  // #if CAP_COMPLEX2
  if (c.land === laOcean && deepOcean && !G.generatingEquidistant && hrand(10000) < 20 && no_barriers_in_radius(c, 2) && hyperbolic() && !quotient() && !G.tactic_on && !G.safety && !ls_hv_structure()
    && landUnlockedIngame(laBrownian))
    brownian_init_further(c);

  if (c.land === laCaribbean && can_start_horo(c))
    create_altmap(c, horo_gen_distance(), hsA);

  if (ls_horodisk_structure() && can_start_horo(c, true)) {
    const m = create_altmap(c, horo_gen_distance(), hsA);
    if (m) {
      G.hv_land.set(m, getNewLand(laCrossroads));
      clearing_bpdata_root_null(m);
    }
  }

  if (c.land === laCanvas && can_start_horo(c) && ls_any_order())
    create_altmap(c, horo_gen_distance(), hsA);

  if (c.land === laPalace && can_start_horo(c) && !G.princess_generating && !G.shmup_on && G.multi_players === 1 && !weirdhyperbolic() &&
    (G.princess_forceMouse ? canReachPlayer(from, moMouse) :
      (hrand(2000) < (G.peace_on ? 100 : 20))) &&
    landUnlockedIngame(laPrincessQuest)) {
    create_altmap(c, PRADIUS0, hsOrigin, waPalace);
    const cl = new celllister(c, 5, 1000000, null);
    try {
      for (const c of cl.lst) if (c.master.alt) G.currentmap.extend_altmap(c.master);
    } finally { cl.destroy(); }
  }
}

export function buildBigStuff(c: cell, from: cell): void {

  // #if CAP_LEGACY
  if (legacy_racing()) {
    notp('buildBigStuff_legacy (legacy.cpp)');
    return;
  }

  build_walls(c, from);

  build_horocycles(c, from);

  if (hasbardir(c)) extendBarrier(c);
}

export function openplains(c: cell): boolean {
  if (ls_any_chaos() || ls_no_walls()) {
    for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.land !== laHunting) return false; }
    return true;
  }
  let dlimit = getDistLimit();
  if (arcm_in()) dlimit--;
  if (getDistLimit() < 4) {
    return true;
  }
  else if (dlimit < 7) {
    const cl = new celllister(c, dlimit, 1000000, null);
    try {
      let bad = 0;
      for (const c of cl.lst) {
        while (c.mpdist > 8) setdist(c, c.mpdist - 1, null!);
        if (c.land !== laHunting) { bad++; if (bad > 5) return false; }
      }
      return true;
    } finally { cl.destroy(); }
  }
  else {
    const cl = new celllister(c, dlimit, 1000000, null);
    try {
      for (const c of cl.lst) {
        while (c.mpdist > 8) setdist(c, c.mpdist - 1, null!);
        if (c.land !== laHunting) return false;
      }
      return true;
    } finally { cl.destroy(); }
  }
}

export function buildCamelotWall(c: cell): void {
  if (S3() >= OINF) { c.wall = waRubble; return; }
  if (WDIM() === 3 && hyperbolic() && c.master.fieldval === 0) return;
  c.wall = waCamelot;
  if (WDIM() === 3 && hyperbolic()) return;
  for (let i = 0; i < c.type; i++) {
    const c2 = createMov(c, i);
    if (c2.wall === waNone && greater_alt(c2, c) && c2.monst === moNone)
      c2.wall = waCamelotMoat;
  }
}

export function no_barriers_in_radius(c: cell, _rad: number): boolean {
  const cl = new celllister(c, 2, 1000000, null);
  try {
    for (const c of cl.lst) if (c.bardir !== NODIR) return false;
    return true;
  } finally { cl.destroy(); }
}

export function camelot_monster(): eMonster {
  const ms: eMonster[] = [moHedge, moLancer, moFlailer];
  let m = ms[hrand(3)];
  if (m === moHedge && valence() > 3)
    m = moPyroCultist;
  if (getDistLimit() <= 2 && m === moLancer) m = moGoblin;
  if (getDistLimit() <= 3 && m === moPyroCultist) m = moCultist;
  return m;
}

export function buildCamelot(c: cell): void {
  // #if CAP_COMPLEX2
  const d = celldistAltRelative(c);
  if (anthrax() || (d <= 14 && roundTableRadius(c) > 20)) {
    gen_alt(c);
    preventbarriers(c);
    if (d === 10) {
      if (weirdhyperbolic() ? hrand(100) < 50 : pseudohept(c)) buildCamelotWall(c);
      else {
        if (!eubinary()) for (let i = 0; i < c.master.type; i++) G.currentmap.extend_altmap(c.master.move(i));
        let q = 0;
        if (weirdhyperbolic()) {
          for (let t = 0; t < c.type; t++) createMov(c, t);
          q = hrand(100);
          if (q < 10) q = 0;
          else if (q < 50) q = 1;
        }
        else {
          for (let t = 0; t < c.type; t++) {
            createMov(c, t);
            if (celldistAltRelative(c.move(t)) === 10 && !pseudohept(c.move(t))) q++;
          }
        }
        if (q === 1) buildCamelotWall(c);
        // towers of Camelot
        if (q === 0 && BITRUNCATED()) {
          c.monst = moKnight;
          c.wall = waTower;
          for (let i = 0; i < c.type; i++) {
            const c2 = c.move(i); if (!c2) continue;
            const cr = celldistAltRelative(c2);
            if (cr === 9) { }
            else {
              buildCamelotWall(c2);
              if (!ctof(c2)) {
                c2.wall = waTower; c2.wparam = 1;
              }
            }
          }
          for (let i = 0; i < c.type; i++) if (celldistAltRelative(c.move(i)) < d)
            c.mondir = i;
        }
      }
    }
    if (d === 0) c.wall = waRoundTable;
    // if(celldistAlt(c) == 0 && !anthrax()) println(hlog, "placed Holy Grail on ", c);
    if (celldistAlt(c) === 0 && !anthrax()) void 0;
    if (celldistAlt(c) === 0 && !anthrax()) c.item = itHolyGrail;
    if (d < 0 && hrand(7000) <= 10 + G.items[itHolyGrail] * 5)
      c.monst = camelot_monster();
    if (d === 1) {
      // roughly as many knights as table cells
      if (hrand(1000000) < 1000000 / get_expansion().get_growth() && !G.reptilecheat)
        c.monst = moKnight;
      if (!eubinary()) for (let i = 0; i < c.master.type; i++) G.currentmap.extend_altmap(c.master.move(i));
      for (let i = 0; i < c.type; i++)
        if (c.move(i) && celldistAltRelative(c.move(i)) < d)
          c.mondir = (i + 3) % 6;
    }
    if (anthrax() && d >= 2 && d <= 8 && hrand(1000) < 10)
      c.item = itOrbSafety;
    if (d === 5 && anthrax())
      c.item = itGreenStone;
    if (d <= 10) c.land = laCamelot;
    if (d > 10 && !eubinary() && !anthrax()) {
      setland(c, altmap_orig_land(c.master.alt.alt));
      // if(c->land == laNone) printf("Camelot\n"); // NONEDEBUG
    }
  }
  else if (ls_hv_structure()) {
    setland(c, altmap_orig_land(c.master.alt.alt));
  }
}

export function masterAlt(c: cell): number {
  if (eubinary()) return celldistAlt(c);
  // #if MAXMDIM >= 4
  if (WDIM() === 3 && hyperbolic() && !reg3_in_hrmap_rule_or_subrule()) return reg3_altdist(c.master);
  return c.master.alt.distance;
}

/** the distance between two layers of Temple of Cthulhu */
export function temple_layer_size(): number {
  if (among(G.geometry, gHoroRec, gHoroHex, gKiteDart3)) return 3;
  if (sol()) return 6;
  if (WDIM() === 3 && bt_in()) return 2;
  if (among(G.geometry, gSpace435, gSpace535)) return 5;
  if (WDIM() === 3 && hyperbolic()) return 3;
  if (S3() === OINF) return 4;
  return 6;
}

/** generate the (non-chaotic) Temple of Cthulhu */
export function gen_temple(c: cell): void {
  const d = celldistAlt(c);
  if (d <= 0) {
    c.land = laTemple; c.wall = waNone; c.monst = moNone; c.item = itNone;
  }
  if (d % temple_layer_size() === 0) {
    c.landparam = 0;
    if (G.geometry === gSpace534) {
      let i = 0;
      for (let k = 0; k < c.type; k++) { const c2 = createMov(c, k); if (greater_alt(c, c2)) i++; }
      if (i > 1) c.wall = waColumn;
    }
    else if (G.geometry === gSpace535) {
      c.wall = (c.master.fieldval % 5) ? waRubble : waColumn;
    }
    else if (G.geometry === gSpace435) {
      c.wall = waRubble;
      if (c.master.fieldval === 0) c.wall = waColumn;
      for (let k = 0; k < c.type; k++) { const c1 = createMov(c, k); if (c1.master.fieldval === 0) c.wall = waColumn; }
    }
    else if (sol()) {
      if (c.master.emeraldval % 3 || c.master.zebraval % 3)
        c.wall = waColumn;
    }
    else if (nih()) {
      if (c.master.emeraldval % 2)
        c.wall = waColumn;
    }
    // #if CAP_BT
    else if (G.geometry === gBinary3) {
      if (c.master.zebraval % 5 !== 1) c.wall = waColumn;
    }
    else if (G.geometry === gHoroTris || G.geometry === gHoroRec) {
      if (c.c.spin(bt_updir()) !== 0) c.wall = waColumn;
    }
    else if (G.geometry === gKiteDart3) {
      notp('gen_temple: kite::getshape');
    }
    else if (in_s2xe()) {
      const d = hybrid_get_where(c);
      if (!hybrid_in_underlying_geometry(() => pseudohept(d[0]))) c.wall = waColumn;
    }
    else if (mhybrid()) {
      const d = hybrid_get_where(c);
      if (d[0].wall === waColumn || (d[1] & 1)) c.wall = waColumn;
    }
    else if (WDIM() === 3) {
      c.wall = hrand(100) < 10 ? waColumn : waRubble;
    }
    else if (S3() >= OINF) { }
    else if (weirdhyperbolic() && !BITRUNCATED()) {
      if (hrand(100) < 50) c.wall = waColumn;
    }
    else if (pseudohept(c))
      c.wall = waColumn;
    else {
      gen_alt_around(c);
      let q = 0;
      for (let t = 0; t < c.type; t++) {
        createMov(c, t);
        if (have_alt(c.move(t)) && celldistAlt(c.move(t)) % temple_layer_size() === 0 && !ishept(c.move(t))) q++;
      }
      if (q === 2) c.wall = waColumn;
    }
    c.landparam = 1;
  }
  else c.landparam = 2;
}

/* -2 should be perfect */
// EX int horodisk_from = -2: G.horodisk_from

export function pick_hv_subland(c: cell, l: eLand, depth: number): void {
  if (l === laElementalWall) {
    const land_at = (dp: number): eLand => {
      let i = dp - 12;
      if ((i & 7) === 7) return laElementalWall;
      i >>= 3;
      const tab: eLand[] = [laEAir, laEWater, laEEarth, laEFire];
      return tab[i & 3];
    };

    setland(c, land_at(depth));
    if (c.land === laElementalWall) {
      c.barleft = land_at(depth - 1);
      c.barright = land_at(depth + 1);
      if (hrand(100) < 75)
        c.wall = getElementalWall(hrand(2) ? c.barleft : c.barright);
    }
  }
  else if (l === laWarpCoast) {
    const i = (depth & 8);
    setland(c, i ? laWarpCoast : laWarpSea);
  }
  else setland(c, l);
}

export function moreBigStuff(c: cell): void {
  if (G.disable_bigstuff) return;

  if (!ls_hv_structure())
    if ((bearsCamelot(c.land) && !euclid() && !quotient() && !nil()) || c.land === laCamelot)
      if (have_alt(c)) if (!(bt_in() && G.specialland !== laCamelot))
        buildCamelot(c);

  if (quotient()) return;

  if (ls_voronoi_structure()) {
    const p = get_voronoi_winner(c);
    const ph = p[0];
    if (ph) {
      const l = hv_land_ref(ph);
      pick_hv_subland(c, l, p[1]);
      if (isEquidLand(l)) c.landparam = 1 - p[1];
    }
    else {
      setland(c, laBarrier);
    }
  }

  if (ls_horodisk_structure()) {
    if (have_alt(c) && masterAlt(c) <= 0) {
      gen_alt(c);
      preventbarriers(c);
    }
    if (have_alt(c) && hv_land_ref(c.master.alt.alt) === laCamelot) {
      buildCamelot(c);
    }
    else if (have_alt(c) && celldistAlt(c) <= G.horodisk_from) {
      const l = hv_land_ref(c.master.alt.alt);
      pick_hv_subland(c, l, celldistAlt(c));
      if (l === laCaribbean) generateTreasureIsland(c);
      if (l === laWhirlpool && celldistAlt(c) >= -1) {
        setland(c, laOcean);
        c.landparam = 30;
      }
      if (l === laWestWall && celldistAlt(c) >= -1) {
        setland(c, laCrossroads);
      }
      if (isEquidLand(l)) c.landparam = 1 - celldistAlt(c);
    }
    else
      setland(c, laCrossroads);
  }

  extend_alt(c, laCaribbean, laCaribbean, false);
  if (c.land === laCaribbean) {
    if (have_alt(c) && celldistAlt(c) <= 0)
      generateTreasureIsland(c);
    else
      c.wall = waSea;
  }

  if (!ls_hv_structure()) extend_alt(c, laPalace, laPalace, false, PRADIUS1);

  extend_alt(c, laCanvas, laCanvas);

  if (!ls_hv_structure() && extend_alt(c, laStorms, laStorms, false)) {
    const d = celldistAlt(c);
    if (d <= -2) {
      c.wall = eubinary() ? waCharged : (altmap_which(c.master.alt.alt) & 1) ? waCharged : waGrounded;
      c.item = itNone;
      c.monst = moNone;
    }
    else if (d <= -1)
      c.wall = (hrand(100) < 20) ? waSandstone : waNone;
    else if (d <= 0)
      c.wall = waNone;
  }

  if (ls_any_chaos() && c.land === laTemple) {
    for (let i = 0; i < c.type; i++)
      if (pseudohept(c) && c.move(i) && c.move(i).land !== laTemple)
        c.wall = waColumn;
  }

  else if (!ls_hv_structure() && extend_alt(c, laTemple, laRlyeh))
    gen_temple(c);

  if (ls_hv_structure() && c.land === laTemple) gen_temple(c);

  if (!ls_hv_structure() && extend_alt(c, laClearing, laOvergrown)) {
    if (in_single_horo(c, laClearing)) {
      c.land = laClearing; c.wall = waNone;
    }
    else if (celldistAlt(c) === 1) {
      c.wall = waSmallTree; c.monst = moNone; c.item = itNone; c.landparam = 1;
    }
  }

  if (ls_horodisk_structure() && c.land === laClearing) {
    if (celldistAlt(c) >= -1) {
      c.wall = waSmallTree; c.monst = moNone; c.item = itNone; c.landparam = 1;
    }
  }

  if (ls_voronoi_structure() && c.land === laClearing) {
    if (celldistAlt(c) === -20) {
      c.wall = waSmallTree; c.monst = moNone; c.item = itNone; c.landparam = 1;
    }
  }

  if (!ls_hv_structure() && extend_alt(c, laMountain, laJungle) && in_single_horo(c, laMountain)) {
    c.land = laMountain; c.wall = waNone;
  }

  if (!ls_hv_structure() && extend_alt(c, laWhirlpool, laOcean) && in_single_horo(c, laWhirlpool)) {
    c.land = laWhirlpool; c.wall = waSea; c.monst = moNone; c.item = itNone;
  }
}

export function generate_mines(): void {
  const candidates: cell[] = [];

  if (closed_or_bounded())
    for (const c of G.currentmap.allcells())
      setdist(c, 7, null!);

  for (const c of G.currentmap.allcells())
    if (c.wall === waMineUnknown)
      candidates.push(c);
  hrandom_shuffle(candidates);
  G.bounded_mine_max = isize(candidates);
  G.bounded_mine_quantity = itrunc(G.bounded_mine_max * G.bounded_mine_percentage + 0.5);
  for (let i = 0; i < G.bounded_mine_quantity; i++) candidates[i].wall = waMineMine;
}

// EX vector<eLand> currentlands: G.currentlands

export function pregen(): void {
  G.currentlands.length = 0;
  if (ls_any_chaos() && !ls_std_chaos())
    for (const l of G.land_over)
      if (landUnlockedIngame(l))
        G.currentlands.push(l);
}

/** the static initializers of bigstuff.cpp, called by register_all() in include order:
 *  hrmap::extend_altmap (the method), `auto qclear = addHook(hooks_clearmemory, 200, ...)`.
 *  `auto ccm_bigstuff = addHook(hooks_gamedata, 0, ...)` stores euland/euland3/euland3_hash for dual mode
 *  (multigame.cpp, a later stage): not registered. */
export function register_bigstuff(): void {
  hrmap.prototype.extend_altmap = function (this: hrmap, h: heptagon, levs?: number, link_cdata = true): void {
    hrmap_extend_altmap(this, h, levs === undefined ? default_levs() : levs, link_cdata);
  };
  G.hooks_clearmemory.add(200, () => { G.altmap_quotient_relspins.clear(); });
}

void INF; void gCrystal344; void gcSphere;
