// graph-wall.cpp of HyperRogue 13.1o: the terrain graphics (floor colours of the lands, mine counts, pattern
// directions, sidewalls, the 3D wall test, transparent walls). Stage 2, package D3 (PORTING-STAGE2.md).
// The 3D parts (generate_subcellshape_if_needed, hrmap::wall_offset: 3D walls) are STAGE2-STUBs.
// Overloads: isWall3(c, wcol) takes the colour as a Ref (isWall3(c) without it).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G } from './globals.ts';
import { NotPorted, among, isize, PPR } from './hyper.ts';
import type { Ref } from './cpp.ts';
import type { cell } from './locations.ts';
import {
  landtypes, linf, winf,
  laDesert, laKraken, laDocks, laCA, laMotion, laGraveyard, laWineyard, laLivefjord, laMinefield, laCaribbean,
  laAlchemist, laRlyeh, laHell, laCrossroads, laJungle, laZebra, laCaves, laEmerald, laDeadCaves, laPalace,
  laHunting, laBlizzard, laCocytus, laIce, laCamelot, laOvergrown, laClearing, laHaunted, laCursed, laDice,
  laMirror, laMirrorWall, laMirrorOld, laNone, laBarrier, laRedRock, laMemory, laMirrorWall2, laMirrored,
  laMirrored2, laCrossroads2, laCrossroads3, laCrossroads4, laCrossroads5, laCrossroads6, laMasterCrossroads,
  laEAir, laStorms, laMountain, laHauntedWall, laHauntedBorder, laWhirlwind, laBurial, laHalloween, laReptile,
  laVolcano, laDual, laWestWall, laAsteroids, laPower, laDryForest, laOcean, laWhirlpool, laEWater, laOceanWall,
  laWildWest, laRose, laWarpCoast, laWarpSea, laEndorian, laTortoise, laPrairie, laDragon, laSnakeNest, laBrownian,
  laVariant, laFrog, laWet, laHive, laIvoryTower, laEFire, laEEarth, laElementalWall,
  laTrollheim, laDungeon, laBull, laTerracotta, laMercuryRiver, laMagnetic, laSwitch, laEclectic, laCanvas,
  laPrincessQuest, laRuins, laTemple,
  waMineMine, waChasm, waMagma, waRose, waInvisibleFloor, waMirror, waCloud, waMineUnknown, waLadder, waTrapdoor,
  waCanopy, waSolidBranch, waWeakBranch, waFloorA, waFloorB, waRubble, waDeadfloor2, waSulphur, waSulphurC,
  type eWall,
} from './content.ts';
import { adj_minefield_cells } from './cell.ts';
import {
  patterns_downdir, zebra40, type patterns_patterninfo,
} from './pattern2.ts';
import { NONSTDVAR, euclid, sphere, hyperbolic, S7, mhybrid, sol, nih, nil, cgflags, qFRACTAL, GDIM, WDIM,
  PURE } from './classes.ts';
import { arcm_in } from './archimedean.ts';
import { bt_in } from './binary-tiling.ts';
import { ddspin180, iddspin180 } from './graph.ts';
import { lmirror } from './embeddings.ts';
import { type transmatrix, type shiftmatrix, Id, tmul, smul, smulh, hdist0_sp, orthogonal_move_fol_t } from './hyperpoint.ts';
import { cgi } from './geometry.ts';
import {
  SIDE_RED1, SIDE_RED3, SIDE_WALL, SIDE_FLOOR, SIDE_WATERLEVEL, SIDE_SHALLOW, SIDE_DEEP, SIDEPARS, side_to_prio,
  type hpcshape,
} from './geometry.ts';
import { gradient, darkena3 } from './colors.ts';
import { qfi, draw_qfi, draw_shapevec } from './floorshapes.ts';
import { queuepolyat, type dqi_poly } from './drawing.ts';
import { model_needs_depth } from './basegraph.ts';
import { zgrad0, applymodel } from './hypgraph.ts';
import { geom3_actual_wall_height } from './geometry.ts';
import { isWall, isAlch, isFire, isWateryOrBoat, realred, get_spatial_info } from './flags.ts';
import { pseudohept, geosupport_football } from './pattern2.ts';
import { ls_chaoticity } from './landlock.ts';
import { sintick } from './animations.ts';
import { lavatide } from './mapeffects.ts';
import { in_perspective } from './graph.ts';
import { OUTLINE_TRANS } from './hyper.ts';
import { kite_in } from './kite.ts';
import { asonov_in } from './asonov.ts';
import { shvid } from './floorshapes.ts';
import { gHoroHex, gHoroRec, gOctTet3 } from './classes.ts';

/** EX colortable minecolors */
export const minecolors: number[] = [
  0xFFFFFF, 0xF0, 0xF060, 0xF00000,
  0x60, 0x600000, 0x00C0C0, 0x000000, 0x808080, 0xFFD500,
];

/** EX colortable distcolors */
export const distcolors: number[] = [
  0xFFFFFF, 0xF0, 0xF060, 0xF00000,
  0xA0A000, 0xA000A0, 0x00A0A0, 0xFFD500,
];

/** EX const char* minetexts[15] */
export const minetexts: readonly string[] = [
  'No mines next to you.',
  'A mine is next to you!',
  'Two mines next to you!',
  'Three mines next to you!',
  'Four mines next to you!',
  'Five mines next to you!',
  'Six mines next to you!',
  'Seven mines next to you!',
  'Eight mines next to you!',
  'Nine mines next to you!',
  'Ten mines next to you!',
  'Eleven mines next to you!',
  'Twelve mines next to you!',
  'Thirteen mines next to you!',
  'Fourteen mines next to you!',
];

/** EX map<cell*, int> fake_minecount */
export const fake_minecount = new Map<cell, number>();

export function countMinesAround(c: cell): number {
  if (fake_minecount.has(c)) return fake_minecount.get(c)!;
  let mines = 0;
  for (const c2 of adj_minefield_cells(c))
    if (c2.wall === waMineMine)
      mines++;
  return mines;
}

export function applyPatterndir(c: cell, si: patterns_patterninfo): transmatrix {
  if (NONSTDVAR() || bt_in() || cgi().emb.is_euc_in_noniso()) return Id;
  let V = ddspin180(c, si.dir);
  if (si.reflect) V = tmul(V, lmirror());
  if (euclid()) return V;
  return tmul(V, iddspin180(c, 0));
}

export function applyDowndir(c: cell, cf: (c: cell) => number): transmatrix {
  return ddspin180(c, patterns_downdir(c, cf));
}

export function reptilecolor(c: cell): number {
  let i: number;

  if (arcm_in())
    i = c.master.rval0 & 3;
  else {
    i = zebra40(c);

    if (!euclid()) {
      if (i >= 4 && i < 16) i = 0;
      else if (i >= 16 && i < 28) i = 1;
      else if (i >= 28 && i < 40) i = 2;
      else i = 3;
    }
  }

  const reptilecolors = [0xe3bb97, 0xc2d1b0, 0xebe5cb, 0xA0A0A0];
  return reptilecolors[i];
}

// Color components in nestcolors must be less than 0x80 (for addition in drawMonster for Rock Snakes)
// and must be divisible by 4 (for brightening of raised cells in celldrawer::setcolors)
/** EX colortable nestcolors */
export const nestcolors: number[] = [0x7C0000, 0x007C00, 0x00007C, 0x404040, 0x700070, 0x007070, 0x707000, 0x606060];

// color_t floorcolors[landtypes]: G.floorcolors (classes.cpp section of globals.ts)

export function init_floorcolors(): void {
  const floorcolors = G.floorcolors;
  for (let i = 0; i < landtypes; i++)
    floorcolors[i] = linf[i].color;

  floorcolors[laDesert] = 0xEDC9AF;
  floorcolors[laKraken] = 0x20A020;
  floorcolors[laDocks] = 0x202020;
  floorcolors[laCA] = 0x404040;
  floorcolors[laMotion] = 0xF0F000;
  floorcolors[laGraveyard] = 0x107010;
  floorcolors[laWineyard] = 0x006000;
  floorcolors[laLivefjord] = 0x306030;

  floorcolors[laMinefield] = 0x80A080;
  floorcolors[laCaribbean] = 0x006000;

  floorcolors[laAlchemist] = 0x202020;

  floorcolors[laRlyeh] = 0x004080;
  floorcolors[laHell] = 0xC00000;
  floorcolors[laCrossroads] = 0xFF0000;
  floorcolors[laJungle] = 0x008000;

  floorcolors[laZebra] = 0xE0E0E0;

  floorcolors[laCaves] = 0x202020;
  floorcolors[laEmerald] = 0x202020;
  floorcolors[laDeadCaves] = 0x202020;

  floorcolors[laPalace] = 0x806020;

  floorcolors[laHunting] = (0x40E0D0 / 2) | 0;

  floorcolors[laBlizzard] = 0x5050C0;
  floorcolors[laCocytus] = 0x80C0FF;
  floorcolors[laIce] = 0x8080FF;
  floorcolors[laCamelot] = 0xA0A0A0;

  floorcolors[laOvergrown] = 0x00C020;
  floorcolors[laClearing] = 0x60E080;
  floorcolors[laHaunted] = 0x609F60;
  floorcolors[laCursed] = 0x481848;
  floorcolors[laDice] = 0xC0C0FF;

  floorcolors[laMirror] = floorcolors[laMirrorWall] = floorcolors[laMirrorOld] = 0x808080;
}

export function magma_color(id: number): number {
  if (id === ((95 / 4) | 0) - 1) return 0x200000;
  else if (id === ((95 / 4) | 0)) return 0x100000;
  else if (id < ((48 / 4) | 0)) return gradient(0xF0F000, 0xF00000, 0, id, (48 / 4) | 0);
  else if (id < ((96 / 4) | 0)) return gradient(0xF00000, 0x400000, (48 / 4) | 0, id, ((95 / 4) | 0) - 2);
  else return winf[waMagma].color;
}

export function noAdjacentChasms(c: cell): boolean {
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (c2 && c2.wall === waChasm) return false; }
  return true;
}

// CAP_SHAPES
export function floorShadow(c: cell, V: shiftmatrix, col: number): void {
  if (model_needs_depth() || G.noshadow)
    return; // shadows break the depth testing
  const p = G.poly_outline;
  G.poly_outline = OUTLINE_TRANS;
  try {
    if (qfi.shape) {
      queuepolyat(smul(smul(V, qfi.spin), cgi().shadowmulmatrix), qfi.shape, col, PPR.WALLSHADOW);
    }
    else if (qfi.usershape >= 0)
      throw new NotPorted('floorShadow: mapeditor::drawUserShape (the map editor)'); // STAGE2-STUB (map editor)
    else
      draw_shapevec(c, V, qfi.fshape!.shadow, col, PPR.WALLSHADOW);
  } finally { G.poly_outline = p; }
}

export function use_warp_graphics(): boolean {
  if (G.shmup_on) return false;
  if (geosupport_football() !== 2) return false;
  if (ls_chaoticity() >= 75) return false;
  return true;
}

/** SIDE sidepar as its number (enum class SIDE) */
export function escherSidewall(c: cell, sidepar: number, V: shiftmatrix, col: number): void {
  const omf = (fol: number): shiftmatrix => omf_sm(V, fol);
  const detaillevel = G.detaillevel;
  if (sidepar >= SIDE_RED1 && sidepar <= SIDE_RED3) {
    const sl = sidepar - SIDE_RED1;
    for (let z = 1; z <= 4; z++) if (z === 1 || (z === 4 && detaillevel === 2))
      draw_qfi(c, omf(zgrad0(cgi().slev * sl, cgi().slev * (sl + 1), z, 4)), col, PPR.RED1_ESCHER + 3 * sl);
  }
  else if (sidepar === SIDE_WALL) {
    const layers = 2 << detaillevel;
    for (let z = 1; z < layers; z++)
      draw_qfi(c, omf(zgrad0(0, geom3_actual_wall_height(), z, layers)), col, PPR.WALL_ESCHER);
  }
  else if (sidepar === SIDE_FLOOR) {
    const layers = 1 << (detaillevel - 1);
    if (detaillevel) for (let z = 0; z < layers; z++)
      draw_qfi(c, omf(zgrad0(-G.vid.lake_top, 0, z, layers)), col, PPR.FLOOR_ESCHER);
  }
  else if (sidepar === SIDE_WATERLEVEL) {
    const layers = 1 << (detaillevel - 1);
    if (detaillevel) for (let z = 0; z < layers; z++)
      draw_qfi(c, omf(zgrad0(-G.vid.lake_shallow, -G.vid.lake_top, z, layers)), col, PPR.WATERLEVEL_ESCHER);
  }
  else if (sidepar === SIDE_SHALLOW) {
    const layers = 1 << (detaillevel - 1);
    if (detaillevel) for (let z = 0; z < layers; z++)
      draw_qfi(c, omf(zgrad0(-G.vid.lake_bottom, -G.vid.lake_shallow, z, layers)), col, PPR.SHALLOW_ESCHER);
  }
  else if (sidepar === SIDE_DEEP) {
    const layers = 1 << detaillevel;
    draw_qfi(c, omf(cgi().INFDEEP), col, PPR.MINUSINF);
    for (let z = layers - 1; z > 1; z--)
      draw_qfi(c, omf(zgrad0(-G.vid.lake_bottom, -G.vid.lake_top, -z, 1)), col, PPR.DEEP_ESCHER);
  }
}

export function use_escher(sidepar: number): boolean {
  return (!qfi.fshape || !qfi.fshape.is_plain || !cgi().validsidepar[sidepar] || qfi.usershape >= 0) && (GDIM() === 2);
}

export function placeSidewall(c: cell, i: number, sidepar: number, V: shiftmatrix, col: number): boolean {

  if (use_escher(sidepar)) {
    escherSidewall(c, sidepar, V, col);
    return true;
  }
  if (!qfi.fshape) return true;

  if (qfi.fshape === cgi().shBigTriangle && pseudohept(c.move(i))) return false;
  if (qfi.fshape === cgi().shTriheptaFloor && !pseudohept(c) && !pseudohept(c.move(i))) return false;

  let prio = side_to_prio[sidepar];

  if ((col & 255) < 255) prio = PPR.TRANSPARENT_WALL;

  const ncor = G.approx_nearcorner;
  G.approx_nearcorner = true;
  try {
    // CAP_ARCM
    if (arcm_in() && !PURE())
      throw new NotPorted('placeSidewall: arcm::parent_index_of (archimedean)'); // STAGE2-STUB
    if ((G.currentmap as { strict_tree_rules(): boolean }).strict_tree_rules()) {
      throw new NotPorted('placeSidewall: rulegen::get_arb_dir'); // STAGE2-STUB (rulegen)
    }
    if (sidepar >= SIDEPARS) {
      // println(hlog, "ERROR: sidepar >= SIDEPARS: ", ...)
      return false;
    }
    if (i >= isize(qfi.fshape.side[sidepar])) {
      // println(hlog, "ERROR: i >= side[sidepar]", ...)
      return false;
    }
    draw_shapevec(c, V, qfi.fshape.side[sidepar][i], col, prio);
    return false;
  } finally { G.approx_nearcorner = ncor; }
}

// EX int mine_opacity = 255: G.mine_opacity

/** bool isWall3(cell *c, color_t& wcol) / bool isWall3(cell *c) (without wcol) */
export function isWall3(c: cell, wcol?: Ref<number>): boolean {
  const w: Ref<number> = wcol ?? { v: 0 };
  if (c.wall === waRose) { w.v = gradient(0, w.v, -5 - 5 * (7 - G.rosephase), sintick(50 * (8 - G.rosephase)), 1); }
  if (isWall(c)) return true;
  if (c.wall === waChasm && c.land === laMemory && (G.anyshiftclick || !(cgflags() & qFRACTAL))) { w.v = 0x606000; return true; }
  if (c.wall === waInvisibleFloor) return false;
  // if(chasmgraph(c)) return true;
  if (among(c.wall, waMirror, waCloud)) return true;
  if (among(c.wall, waMineUnknown, waMineMine) && G.mine_opacity === 255) return true;
  return false;
}

export function isSulphuric(w: eWall): boolean { return among(w, waSulphur, waSulphurC); }

// 'land color', but a bit twisted for Alchemist Lab
function lcolor(c: cell): number {
  if (isAlch(c.wall) && !c.item) return winf[c.wall].color;
  return G.floorcolors[c.land];
}

export function transcolor(c: cell, c2: cell, wcol: number): number {
  if (isWall3(c2)) return 0;
  if (c.land !== c2.land && c.land !== laNone && c2.land !== laNone) {
    if (c._id > c2._id) return 0; // c>c2 (pointer order: the creation serial, PORTING.md)
    if (c.land === laBarrier) return darkena3(lcolor(c2), 0, 0x40);
    if (c2.land === laBarrier) return darkena3(lcolor(c), 0, 0x40);
    return darkena3(gradient(lcolor(c), lcolor(c2), 0, 1, 2), 0, 0x40);
  }
  if (sol() && c.land === laWineyard && c2.master.distance < c.master.distance)
    return 0x00800040;
  if (isAlch(c) && !c.item && (c2.item || !isAlch(c2))) return darkena3(winf[c.wall].color, 0, 0x40);
  if (c.wall === c2.wall) return 0;
  if (isFire(c) && !isFire(c2)) return darkena3(wcol, 0, 0x30);
  if (c.wall === waLadder) return darkena3(wcol, 0, 0x30);

  if (c.land === laZebra && c2.land === laZebra && c2.wall === waTrapdoor) return 0x202020A0;

  if (c.wall === waChasm && c2.wall !== waChasm) return 0x606060A0;
  if (isWateryOrBoat(c) && !isWateryOrBoat(c2)) return 0x0000C060;
  if (isSulphuric(c.wall) && !isSulphuric(c2.wall)) return darkena3(winf[c.wall].color, 0, 0x40);
  if (among(c.wall, waCanopy, waSolidBranch, waWeakBranch) && !among(c2.wall, waCanopy, waSolidBranch, waWeakBranch)) return 0x00C00060;
  if (c.wall === waFloorA && c2.wall === waFloorB && !c.item && !c2.item) return darkena3(0xFF00FF, 0, 0x80);
  if (realred(c.wall) || realred(c2.wall)) {
    const l = get_spatial_info(c).top - get_spatial_info(c2).top;
    if (l > 0) return darkena3(G.floorcolors[laRedRock], 0, 0x30 * l);
  }
  if (among(c.wall, waRubble, waDeadfloor2) && !among(get_spatial_info(c2).top, SIDE_RED1, SIDE_RED1 + 1, SIDE_RED3)) return darkena3(winf[c.wall].color, 0, 0x40);
  if (c.wall === waMagma && c2.wall !== waMagma) return darkena3(magma_color((lavatide(c, -1) / 4) | 0), 0, 0x80);
  if (among(c.wall, waMineUnknown, waMineMine) && !among(c2.wall, waMineMine, waMineUnknown) && G.mine_opacity > 0 && G.mine_opacity < 255)
    return (0xFFFFFF00 | G.mine_opacity) >>> 0;
  return 0;
}

// EX bool no_darken = false: G.no_darken

// how much should be the d-th wall darkened in 3D
export function get_darkval(c: cell, d: number): number {
  if (G.no_darken) return 0;
  if (mhybrid()) {
    return d >= c.type - 2 ? 4 : 0;
  }
  const darkval_hbt = [0, 2, 2, 0, 6, 6, 8, 8, 0];
  const darkval_s12 = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5];
  const darkval_e6 = [0, 4, 6, 0, 4, 6];
  const darkval_e12 = [0, 4, 6, 0, 4, 6, 0, 4, 6, 0, 4, 6];
  const darkval_e14 = [0, 0, 0, 4, 6, 4, 6, 0, 0, 0, 6, 4, 6, 4];
  const darkval_hh = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 1, 0];
  const darkval_hrec = [0, 0, 2, 4, 2, 4, 0];
  const darkval_sol = [0, 2, 4, 4, 0, 2, 4, 4];
  const darkval_arnold = [0, 2, 0, 2, 4, 5, 0, 2, 0, 2, 4, 5];
  const darkval_kite = [0, 2, 0, 2, 4, 4, 6, 6, 6, 6, 6, 6];
  const darkval_nil = [6, 6, 0, 3, 6, 6, 0, 3];
  const darkval_nih = [0, 2, 0, 2, 4, 6, 6, 6, 6, 6, 6];
  const darkval_ot = [0, 1, 2, 3, 6, 5, 4, 3];
  // MAXMDIM >= 4: the subcube/bch/coxeter variations (3D: reg3::get_face_vertex_count)
  if (WDIM() === 3) throw new NotPorted('get_darkval: reg3::get_face_vertex_count (3D)'); // STAGE2-STUB (3D)
  if (sphere()) return darkval_s12[d];
  if (euclid() && S7() === 6) return darkval_e6[d];
  if (euclid() && S7() === 12) return darkval_e12[d];
  if (euclid() && S7() === 14) return darkval_e14[d];
  if (G.geometry === gHoroHex) return darkval_hh[d];
  if (G.geometry === gHoroRec) return darkval_hrec[d];
  if (G.geometry === gOctTet3) return darkval_ot[d + (shvid(c) === 2 ? 4 : 0)];
  if (kite_in()) return darkval_kite[d];
  if (asonov_in()) return darkval_arnold[d];
  if (sol()) return darkval_sol[d];
  if (nih()) return darkval_nih[d];
  if (bt_in()) return darkval_hbt[d];
  if (hyperbolic() && S7() === 6) return darkval_e6[d];
  if (hyperbolic() && S7() === 12) return darkval_s12[d];
  if (nil()) return darkval_nil[d];
  return 0;
}

/** subcellshape& generate_subcellshape_if_needed(cell *c, int id): 3D walls (product and 2D-in-3D geometries) */
export function generate_subcellshape_if_needed(_c: cell, _id: number): never {
  throw new NotPorted('generate_subcellshape_if_needed (3D walls)'); // STAGE2-STUB (3D)
}

// int hrmap::wall_offset(cell *c): 3D walls (cell.ts hrmap.wall_offset stays a STAGE2-STUB)

export function queue_transparent_wall(V: shiftmatrix, sh: hpcshape, color: number): void {
  const poly: dqi_poly = queuepolyat(V, sh, color, PPR.TRANSPARENT_WALL);
  const h = smulh(V, sh.intester);
  if (in_perspective())
    poly.subprio = Math.trunc(hdist0_sp(h) * 100000);
  else {
    const h2 = [0, 0, 0, 0];
    applymodel(h, h2);
    poly.subprio = Math.trunc(h2[2] * 100000);
  }
}

// MAXMDIM >= 4
export function ceiling_category(c: cell): number {
  switch (c.land) {
    case laNone:
    case laMemory:
    case laMirrorWall2:
    case laMirrored:
    case laMirrored2:
    case landtypes:
      return 0;

    /* starry levels */
    case laIce:
    case laCrossroads:
    case laCrossroads2:
    case laCrossroads3:
    case laCrossroads4:
    case laCrossroads5:
    case laCrossroads6:
    case laMasterCrossroads:
    case laCursed:
    case laJungle:
    case laGraveyard:
    case laMotion:
    case laRedRock:
    case laZebra:
    case laHunting:
    case laEAir:
    case laStorms:
    case laMountain:
    case laHaunted:
    case laHauntedWall:
    case laHauntedBorder:
    case laWhirlwind:
    case laBurial:
    case laHalloween:
    case laReptile:
    case laVolcano:
    case laBlizzard:
    case laDual:
    case laWestWall:
    case laAsteroids:
      return 1;

    case laPower:
    case laWineyard:
    case laDice:
    case laDesert:
    case laAlchemist:
    case laDryForest:
    case laCaribbean:
    case laMinefield:
    case laOcean:
    case laWhirlpool:
    case laLivefjord:
    case laEWater:
    case laOceanWall:
    case laWildWest:
    case laOvergrown:
    case laClearing:
    case laRose:
    case laWarpCoast:
    case laWarpSea:
    case laEndorian:
    case laTortoise:
    case laPrairie:
    case laDragon:
    case laSnakeNest:
    case laDocks:
    case laKraken:
    case laBrownian:
    case laHell:
    case laVariant:
    case laFrog:
    case laWet:
      return 2;

    case laBarrier:
    case laCaves:
    case laMirror:
    case laMirrorOld:
    case laCocytus:
    case laEmerald:
    case laDeadCaves:
    case laHive:
    case laCamelot:
    case laIvoryTower:
    case laEFire:
    case laEEarth:
    case laElementalWall:
    case laTrollheim:
    case laDungeon:
    case laBull:
    case laCA:
    case laMirrorWall:
    case laTerracotta:
    case laMercuryRiver:
    case laMagnetic:
    case laSwitch:
    case laEclectic:
      return 3;

    case laCanvas:
      if (G.canvas_default_wall === waInvisibleFloor) return 0;
      return 3;

    case laPalace:
    case laPrincessQuest:
    default:
      return 4;

    case laRuins:
      return 6;

    case laTemple:
    case laRlyeh:
      return 7;
  }
}

// --- helpers ---

/** orthogonal_move_fol(const shiftmatrix& V, ld fol) */
export function omf_sm(V: shiftmatrix, fol: number): shiftmatrix {
  return { T: orthogonal_move_fol_t(V.T, fol), shift: V.shift };
}
