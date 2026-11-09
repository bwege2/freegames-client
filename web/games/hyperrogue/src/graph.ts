// graph.cpp of HyperRogue 13.1o: the main graphics file (drawthemap, drawfullmap, gamescreen, normalscreen,
// drawscreen, the aura, grid lines, darkening, markers, the actual view). Stage 2, package D3
// (PORTING-STAGE2.md); calcparam, cview, decide_lpu, haveaura, in_wallopt, in_perspective, get_stereo_param and
// namespace sm came with D1.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Not ported (STAGE2-STUB, they throw NotPorted when reached): 3D (wall_radar, make_actual_view's 3D branch,
// pushdown in 3D, the clipping planes, fat edges, precise_mouseover in 3D), VR, the rug, Chinese ASCII glyphs,
// the GL aura (the SDL aura is ported: it draws on the canvas shim's pixels).
// Overloads (PORTING.md "Names"): chei(V: transmatrix) / chei_sm(V: shiftmatrix); at_smart_lof(transmatrix) /
// at_smart_lof_sm(shiftmatrix); draw_ascii(V, string, col, size, size2) / draw_ascii_c(V, glyph char code, col,
// size); gridline(V1, h1, V2, h2, col, prec) / gridline_v(V, h1, h2, col, prec).
// gmatrix / gmatrix0 / View / centerover / cwtV are current_display's cellmatrices / old_cellmatrices /
// view_matrix / precise_center / player_matrix (basegraph.cpp's #defines).
// Functions of package U1's files that are not there yet (displayButton, drawmessages, present_screen) are
// looked up when called (u1fn below): they throw NotPorted until U1 adds them.
import { G, pconf } from './globals.ts';
import { NotPorted, among, callhooks, isize, PPR, OUTLINE_FRIEND, OUTLINE_NONE, OUTLINE_ENEMY,
  OUTLINE_TREASURE, OUTLINE_ORB, OUTLINE_OTHER } from './hyper.ts';
import { IC_TREASURE, IC_ORB, laMirror, waChasm, itWarning, itCrossbow, moCrusher, itOrbDomination, itOrbYendor, moNone,
  itNone, itOrbSummon, itOrbDragon, itOrbAir } from './content.ts';
import { YDIST, DISTANCE_UNKNOWN } from './hyper.ts';
import { sortedKeys } from './cpp.ts';
import { getcs } from './config.ts';
import { haveMount } from './game.ts';
import { isStunnable, isPushable } from './flags.ts';
import { targetRangedOrb, summonedAt, roCheck } from './orbs.ts';
import { rand } from './rand.ts';
import { mhybrid } from './classes.ts';
import { quotient, hyperbolic, WDIM } from './classes.ts';
import { arcm_in } from './archimedean.ts';
import { arb_in } from './arbitrile.ts';
import { IRREGULAR, BITRUNCATED, PURE, S7, a4, GOLDBERG, nonisotropic, gCrystal344, elliptic, LDIM, embedded_plane } from './classes.ts';
import { bt_in } from './binary-tiling.ts';
import { geosupport_football, geosupport_chessboard } from './pattern2.ts';
import { gp_param } from './goldberg.ts';
import { irr_bitruncations_performed } from './irregular.ts';
import { celldistAlt, celldistance, heptdistance } from './cell.ts';
import type { cell } from './locations.ts';
import { itrunc, idiv, c_atan2 } from './cpp.ts';
import { GDIM, sphere, euclid, gproduct, mdJoukowsky, mdJoukowskyInverted, mdFisheye, mdFisheye2, mdDisk } from './classes.ts';
import {
  type shiftmatrix, type shiftpoint, type transmatrix, type hyperpoint, tmul, degree, smul, smulh,
  shiftless_t, ypush, orthogonal_move_fol, tC0_sm, tC0, hdist, hdist0, Id, C0, Hypc, TAU, M_PI, orthogonal_move_fol_t, mzscale, unshift, unshift_sm,
  inverse_shift_sp, normalize, closest_to_zero, midz, towards_inf, safe_classify_ideals, eqmatrix,
  det3, build_matrix, tmulh, z_inverse, xyzscale, zlevel, hdiv, hadd, rgpushxto0, tcopy, sqhypot_d, point2, hsub,
} from './hyperpoint.ts';
import { models_is_perspective, mdAzimuthalEqui } from './models.ts';
import * as basegraph_m from './basegraph.ts';
import { set_cfont, reset_projection, display_data_set_all, textwidth, displayfr } from './basegraph.ts';
import { spin180, tile_center } from './embeddings.ts';
import { ddspin, iddspin, ggmatrix, get_corner_position } from './geometry2.ts';
import { cgi, check_cgi, geom3_factor_to_lev, geom3_lev_to_factor, geom3_scale_at_lev, SIDE_SHALLOW, SIDE_WALL,
  SIDE_RED1, SIDE_RED2, SIDE_RED3, SIDE_WATERLEVEL } from './geometry.ts';
import { gradient, darkena, darkened, darkenedby } from './colors.ts';
import { queuestrn, queueline, queuepolyat, queuepoly, queuecircle_V, queuestr_V, queuestr, queuestr_sp, drawqueue, glflush,
  initquickqueue, quickqueue, OUTLINE_DEFAULT } from './drawing.ts';
import { applymodel, invalid_point, toscrcoord, outofmap, draw_boundary, draw_model_elements, resetview, flip_sphere,
  non_spatial_model } from './hypgraph.ts';
import { getDistLimit } from './cell.ts';
import { eval_programmable_string } from './util.ts';
import { dialog_editingDetail } from './dialogs.ts';
import { iinf, minf, linf, laRedRock, laAlchemist, laWhirlpool, laMinefield, laAsteroids, laHell, laVariant,
  laEclectic, laCanvas, laReptile, laSnakeNest, laTerracotta, laMercuryRiver, laKraken, laDocks, laBurial,
  laIvoryTower, laDungeon, laMountain, laEndorian, laCaribbean, laWhirlwind, laRose, laWarpSea, laTortoise,
  laDragon, laHalloween, laHunting, laOcean, laLivefjord, laIce, laGraveyard, laBlizzard, laRlyeh, laTemple,
  laWineyard, laDeadCaves, laPalace, laCA, laDual, laBrownian, laTrollheim, waMercury, waMirror, waMineMine,
  waMineOpen, moBug0, motypes, itSavedPrincess, moPrincess, itOrbAether,
  type eItem, type eMonster } from './content.ts';
import { isPlayerOn, numplayers, playerpos, player_indices, movepcto, DEFAULTCONTROL } from './pcmove.ts';
import { isFriendly, noHighlight, itemclass, isBug, isPrincess, realred, isWateryOrBoat, get_spatial_info } from './flags.ts';
import { itemHiddenFromSight } from './items.ts';
import { in_line_of_sight, compute_graphical_distance } from './environment.ts';
import { rosedist } from './passable.ts';
import { mine_marked_safe } from './complex2.ts';
import { minecolors, minetexts } from './graph-wall.ts';
import { adj_minefield_cells } from './cell.ts';
import { princessgender } from './config.ts';
import { NUM_GS, genderswitch } from './classes.ts';
import { gmod } from './hyper.ts';
import { its } from './hprint.ts';
import { XLAT, XLAT1_acc } from './language.ts';
import { drawStats } from './hud.ts';
import { dialog_never_keys, dialog_actual_display_keys } from './dialogs.ts';
import { drawWormSegments } from './graph-monster.ts';
import { drawmovestar, draw_movement_arrows } from './graph-player.ts';
import { multi_multiPlayerTarget, multi_playerActive } from './multi.ts';
import { drawing_rng, drawing_rng_begin, drawing_rng_end } from './rand.ts';
import { drawBlizzards, drawArrowTraps } from './blizzard.ts';
import { drawFlashes, ptick, sintick, drawParticles, drawFireParticles } from './animations.ts';
import { spin } from './embeddings.ts';
import { SDL_FillSurfaceRect, sdl_srend } from './sdlgfx.ts';
import { anims_apply, anims_rollback, anims_any_on, anims_any_animation } from './screenshot.ts';
import { history_restore, history_restoreBack } from './history.ts';
import { linepatterns_drawAll, linepatterns_clearAll } from './pattern2.ts';
import { mapeditor_draw_dtshapes } from './mapeditor.ts';
import { calcMousedest, handleKeyNormal, mouseout } from './control.ts';
import { mirror_act, mirror_SPINSINGLE } from './complex.ts';
import { haveRangedOrb } from './flags.ts';
import { standard_help, describeMouseover } from './help.ts';
import { clearAnimations } from './animations.ts';
import { cellwalker } from './locations.ts';
import { subscreens_split } from './basegraph.ts';
import { dual_split } from './multigame.ts';

// --- added by D1 (hypgraph.ts; stage 2): graph.cpp's parts the projection uses ---

/** namespace sm (graph.cpp HDR): the screen mode flags of cmode */
export const sm = {
  NORMAL: 1n, MISSION: 2n, HELP: 4n, MAP: 8n, DRAW: 16n, NUMBER: 32n, SHMUPCONFIG: 64n, OVERVIEW: 128n, SIDE: 256n,
  DOTOUR: 512n, CENTER: 1024n, ZOOMABLE: 4096n, TORUSCONFIG: 8192n, MAYDARK: 16384n, DIALOG_STRICT_X: 32768n,
  EXPANSION: 1n << 16n, HEXEDIT: 1n << 17n, VR_MENU: 1n << 18n, SHOWCURSOR: 1n << 19n, PANNING: 1n << 20n,
  DARKEN: 1n << 21n, NOSCR: 1n << 22n, AUTO_VALUES: 1n << 23n, NARROW_LINES: 1n << 24n, EDIT_BEFORE_WALLS: 1n << 25n,
  EDIT_INSIDE_WALLS: 1n << 26n, DIALOG_WIDE: 1n << 27n, MOUSEAIM: 1n << 28n, DIALOG_OFFMAP: 1n << 29n,
  NO_EXIT: 1n << 30n, EDIT_RULER: 1n << 31n,
} as const;

/** EX bool in_wallopt() { return wallopt || racing::on; } */
export function in_wallopt(): boolean { return G.wallopt || G.racing_on; }

export function in_perspective(): boolean {
  return models_is_perspective(pconf().model);
}

/** in_perspective_v(): vpconf (the VR projection configuration; CAP_VR is off: vpconf = pconf) */
export function in_perspective_v(): boolean {
  return models_is_perspective(pconf().model);
}

export function hide_player(): boolean {
  return GDIM() === 3 && G.playermoved && G.vid.yshift === 0 && G.vid.sspeed > -5 && in_perspective() && (G.first_cell_to_draw || elliptic()) && (WDIM() === 3 || G.vid.camera === 0) && !G.inmirrorcount
    // CAP_RACING
    && !(G.racing_on && racing_not_standard_centering());
}

/** racing::on && !racing::use_standard_centering() && !racing::player_relative (racing is stage 3) */
function racing_not_standard_centering(): boolean { throw new NotPorted('hide_player: racing'); } // STAGE2-STUB

export function ddspin180(c: cell, dir: number): transmatrix { return ddspin(c, dir, M_PI); }
export function iddspin180(c: cell, dir: number): transmatrix { return iddspin(c, dir, M_PI); }

export function lpispin(): transmatrix {
  return spin180();
}

// #define WOLNIEJ 1, BTOFF 0x404040, BTON 0xC0C000 (mobile buttons)

/** bool doHighlight() */
export function doHighlight(): boolean {
  return G.mmhigh;
}

/** ld spina(cell *c, int dir) */
export function spina(c: cell, dir: number): number {
  return TAU * dir / c.type;
}

/** @brief used to alternate colors depending on distance to something. In chessboard-patterned geometries,
 *  automatically a third step. In some cases, we want to avoid a number of colors in the table -- set @param
 *  subtract to the number of such colors. */
export function get_color_auto3(f: number, ctab: readonly number[], subtract = 0): number {
  const size = ctab.length - subtract;
  if (size < 1) return 0;
  if (geosupport_chessboard() && size === 2) {
    f = gmod(f, 3);
    if (f === 1)
      return gradient(ctab[0], ctab[1], 0, 1, 2);
    return ctab[idiv(f, 2)];
  }
  else
    return ctab[gmod(f, size)];
}

export function cheilevel(v: number): number {
  return cgi().FLOOR + (cgi().HEAD - cgi().FLOOR) * v;
}

export function chei(V: transmatrix, a: number, b: number): transmatrix {
  // MAXMDIM >= 4
  if (GDIM() === 2) return V;
  throw new NotPorted('chei: 3D (lzpush)'); // STAGE2-STUB (3D)
  void a; void b;
}

export function chei_sm(V: shiftmatrix, a: number, b: number): shiftmatrix {
  if (GDIM() === 2) return V;
  throw new NotPorted('chei: 3D (lzpush)'); // STAGE2-STUB (3D)
  void a; void b;
}

/** Change the level of V. Takes ivoryz and all geometries into account */
export function at_smart_lof(V: transmatrix, lev: number): transmatrix {
  if (!G.mmspatial) return V;
  if (G.ivoryz) return mzscale(V, lev);
  return orthogonal_move_fol_t(V, lev);
}

export function at_smart_lof_sm(V: shiftmatrix, lev: number): shiftmatrix { return shiftless_t(at_smart_lof(V.T, lev), V.shift); }

export function kind_outline(it: eItem): number {
  switch (itemclass(it)) {
    case IC_TREASURE:
      return OUTLINE_TREASURE;
    case IC_ORB:
      return OUTLINE_ORB;
    default:
      return OUTLINE_OTHER;
  }
}

/** draw_ascii(const shiftmatrix& V, const string& s, color_t col, ld size, ld size2) */
export function draw_ascii(V: shiftmatrix, s: string, col: number, size: number, size2: number): void {
  let id = isize(G.ptds);
  if (WDIM() === 2 && GDIM() === 3)
    throw new NotPorted('draw_ascii: 2D in 3D (lzpush)'); // STAGE2-STUB (3D)
  else
    queuestrn(V, size2 * G.mapfontscale / 100, s, darkenedby(col, G.darken), GDIM() === 3 ? 0 : 2);
  while (id < isize(G.ptds)) G.ptds[id++].prio = PPR.MONSTER_BODY;
  void size;
}

/** draw_ascii(const shiftmatrix& V, char glyph, color_t col, ld size) (glyph: the char code) */
export function draw_ascii_c(V: shiftmatrix, glyph: number, col: number, size: number): void {
  draw_ascii(V, G.s0 + String.fromCharCode(glyph), col, size, 1);
}

export function draw_ascii_or_zh(V: shiftmatrix, glyph: number, name: string, col: number, size: number, zh_size: number): void {
  // CAP_TRANS
  if (G.zh_ascii) {
    const p = XLAT1_acc(name, 8);
    if (p !== null) {
      // chinese.resize(utfsize(chinese[0])): the first character
      const chinese = String.fromCodePoint(p.codePointAt(0)!);
      const df = G.cfont;
      G.cfont = G.cfont_chinese;
      try { draw_ascii(V, chinese, col, size, zh_size); }
      finally { G.cfont = df; }
      return;
    }
  }
  draw_ascii_c(V, glyph, col, size);
}

// push down the queue after q-th element, `down` absolute units down,
// based on cell c and transmatrix V
// do change the zoom factor? do change the priorities?

export function cellcolor(c: cell): number {
  if (isPlayerOn(c) || isFriendly(c)) return OUTLINE_FRIEND;
  if (noHighlight(c.monst)) return OUTLINE_NONE;
  if (c.monst) return OUTLINE_ENEMY;

  if (c.wall === waMirror) return c.land === laMirror ? OUTLINE_TREASURE : OUTLINE_ORB;

  if (c.item && !itemHiddenFromSight(c))
    return kind_outline(c.item);

  return OUTLINE_NONE;
}

const AURA = 180;

/** array<array<int,4>,AURA+1> aurac */
const aurac: number[][] = Array.from({ length: AURA + 1 }, () => [0, 0, 0, 0]);

let haveaura_cached = 0;

/** 0 = no aura, 1 = standard aura, 2 = Joukowsky aura */
export function haveaura(): number {
  const pmodel = pconf().model;
  if (!(G.vid.aurastr > 0 && !G.svg_in && (G.auraNOGL || G.vid.usingGL))) return 0;
  // vrhr::active(): false (CAP_VR)
  if (sphere() && mdAzimuthalEqui()) return 0;
  if (among(pmodel, mdJoukowsky, mdJoukowskyInverted) && hyperbolic() && pconf().model_transition < 1)
    return 2;
  if (among(pmodel, mdFisheye, mdFisheye2)) return 1;
  return (pmodel === mdDisk && (!sphere() || pconf().alpha > 10) && !euclid()) ? 1 : 0;
}

/** vector<pair<int, int> > auraspecials */
const auraspecials: [number, number][] = [];

let auramemo = 0;

export function clearaura(): void {
  haveaura_cached = haveaura();
  if (!haveaura_cached) return;
  for (let a = 0; a < AURA; a++) for (let b = 0; b < 4; b++)
    aurac[a][b] = 0;
  auraspecials.length = 0;
  auramemo = idiv(128 * 128, G.vid.aurastr);
}

function apply_joukowsky_aura(h: shiftpoint): shiftpoint {
  if (haveaura_cached === 2) {
    const ret = [0, 0, 0, 0];
    applymodel(h, ret);
    h = { h: ret, shift: h.shift };
  }
  if (nonisotropic()) {
    throw new NotPorted('apply_joukowsky_aura: nonisotropic (lp_apply(inverse_exp))'); // STAGE2-STUB
  }
  return h;
}

export function addauraspecial(h: shiftpoint, col: number, dir: number): void {
  if (!haveaura_cached) return;
  h = apply_joukowsky_aura(h);
  const r = itrunc(2 * AURA + dir + c_atan2(h.h[1], h.h[0]) * AURA / TAU) % AURA;
  auraspecials.push([r, col]);
}

export function addaura(h: shiftpoint, col: number, fd: number): void {
  if (!haveaura_cached) return;
  h = apply_joukowsky_aura(h);

  const r = gmod(itrunc(c_atan2(h.h[1], h.h[0]) * AURA / TAU), AURA);
  aurac[r][3] += auramemo << fd;
  col = darkened(col);
  aurac[r][0] += (col >> 16) & 255;
  aurac[r][1] += (col >> 8) & 255;
  aurac[r][2] += (col >> 0) & 255;
}

function sumaura(v: number): void {
  const auc: number[] = new Array(AURA);
  for (let t = 0; t < AURA; t++) auc[t] = aurac[t][v];
  let val = 0;
  if (G.vid.aurasmoothen < 1) G.vid.aurasmoothen = 1;
  if (G.vid.aurasmoothen > AURA) G.vid.aurasmoothen = AURA;
  const SMO = G.vid.aurasmoothen;
  for (let t = 0; t < SMO; t++) val += auc[t];
  for (let t = 0; t < AURA; t++) {
    const tt = (t + idiv(SMO, 2)) % AURA;
    aurac[tt][v] = val;
    val -= auc[t];
    val += auc[(t + SMO) % AURA];
  }
  aurac[AURA][v] = aurac[0][v];
}

export function drawaura(): void {
  // indenter_finish(debug_aura, "drawaura");
  if (!haveaura()) return;
  if (G.vid.stereo_mode) return;
  let rad = G.current_display.radius;
  if (sphere() && !mdAzimuthalEqui()) rad /= Math.sqrt(pconf().alpha * pconf().alpha - 1);
  if (hyperbolic() && pconf().model === mdFisheye) {
    let h = 1;
    h /= pconf().fisheye_param;
    const nrad = h / Math.sqrt(2 + h * h);
    rad *= nrad;
  }

  for (let v = 0; v < 4; v++) sumaura(v);
  for (const p of auraspecials) {
    const r = p[0];
    aurac[r][3] = auramemo;
    for (let k = 0; k < 3; k++) aurac[r][k] = (p[1] >> (16 - 8 * k)) & 255;
  }

  // CAP_SDL || CAP_GL: bak
  const bak = [((G.backcolor >> 16) & 255) / 255., ((G.backcolor >> 8) & 255) / 255., ((G.backcolor >> 0) & 255) / 255.];

  // CAP_SDL: if(!vid.usingGL): the software aura, pixel by pixel on the window surface (SDL_LockSurface, qpixel)
  if (!G.vid.usingGL) {
    throw new NotPorted('drawaura: the SDL aura (qpixel on the window surface; package U3, the canvas)'); // STAGE2-STUB
  }
  void bak;
  // CAP_GL: the aura as GL triangles (no GL in stage 2)
}

// int fnt[100][7];

export function bugsNearby(c: cell, dist = 2): boolean {
  if (!(G.havewhat & HF_BUG)) return false;
  if (isBug(c)) return true;
  if (dist) for (let t = 0; t < c.type; t++) if (c.move(t) && bugsNearby(c.move(t), dist - 1)) return true;
  return false;
}
const HF_BUG = 1n << 0n; // Flag(0) (hyper.h)

export function celldistAltPlus(c: cell): number { return 1000000 + celldistAlt(c); }

export function drawstaratvec(dx: number, dy: number): boolean {
  return dx * dx + dy * dy > .05;
}

export function wavefun(x: number): number {
  return Math.sin(x);
  /* x /= TAU;
  x -= (int) x;
  if(x > .5) return (x-.5) * 2;
  else return 0; */
}

// does the current geometry allow nice duals
export function has_nice_dual(): boolean {
  // CAP_IRR
  if (IRREGULAR()) return irr_bitruncations_performed() > 0;
  // CAP_ARCM
  if (arcm_in()) return geosupport_football() >= 2;
  if (bt_in()) return false;
  if (BITRUNCATED()) return true;
  if (a4()) return false;
  if ((S7() & 1) === 0) return true;
  if (PURE()) return false;
  // CAP_GP
  const p = gp_param();
  return (p[0] + p[1] * 2) % 3 === 0;
}

// does the current geometry allow nice duals
export function is_nice_dual(c: cell): boolean {
  return c.land === laDual && has_nice_dual();
}

export function use_swapped_duals(): boolean {
  return (euclid() && !a4()) || GOLDBERG();
}

export function openorsafe(c: cell): boolean {
  // CAP_COMPLEX2
  return c.wall === waMineOpen || mine_marked_safe(c);
}

/** #define Dark(x) darkena(x,0,0xFF) */
const Dark = (x: number): number => darkena(x, 0, 0xFF);

// EX color_t stdgridcolor = 0x202020FF: G.stdgridcolor

export function gridcolor(c1: cell, c2: cell): number {
  if ((G.cmode & sm.DRAW) && !G.mapeditor_drawing_tool) return Dark(G.forecolor);
  if (!c2)
    return Dark(0x202020);

  if (!in_line_of_sight(c1) || !in_line_of_sight(c2))
    return Dark(0x808080);

  const rd1 = rosedist(c1), rd2 = rosedist(c2);
  if (rd1 !== rd2) {
    const r = rd1 + rd2;
    if (r === 1) return Dark(0x802020);
    if (r === 3) return Dark(0xC02020);
    if (r === 2) return Dark(0xF02020);
  }
  if ((get_spatial_info(c1).deep < SIDE_SHALLOW) !== (get_spatial_info(c2).deep < SIDE_SHALLOW) && c1.land !== laAsteroids && c2.land !== laAsteroids)
    return Dark(0x808080);
  if (c1.land === laAlchemist && c2.land === laAlchemist && c1.wall !== c2.wall && !c1.item && !c2.item)
    return Dark(0xC020C0);
  if ((c1.land === laWhirlpool || c2.land === laWhirlpool) && (celldistAlt(c1) !== celldistAlt(c2)))
    return Dark(0x2020A0);
  if (c1.land === laMinefield && c2.land === laMinefield && (openorsafe(c1) !== openorsafe(c2)))
    return Dark(0xA0A0A0);
  if (!G.darken) return G.stdgridcolor;
  return Dark(0x202020);
}

// CAP_SHAPES
/** pushdown(cell *c, int& q, const shiftmatrix &V, double down, bool rezoom, bool repriority): q is updated in
 *  place (a Ref) */
export function pushdown(c: cell, q: { v: number }, V: shiftmatrix, down: number, rezoom: boolean, repriority: boolean): void {

  // MAXMDIM >= 4
  if (GDIM() === 3) {
    throw new NotPorted('pushdown: 3D (lzpush)'); // STAGE2-STUB (3D)
  }

  const ptds = G.ptds;
  // since we might be changing priorities, we have to make sure that we are sorting correctly
  if (down > 0 && repriority) {
    let qq = q.v + 1;
    while (qq < isize(ptds))
      if (qq > q.v && ptds[qq].prio < ptds[qq - 1].prio) {
        const t = ptds[qq]; ptds[qq] = ptds[qq - 1]; ptds[qq - 1] = t;
        qq--;
      }
      else qq++;
  }

  while (q.v < isize(ptds)) {
    const pp = ptds[q.v++].as_poly();
    if (!pp) continue;
    const ptd = pp;

    const z = zlevel(tC0(ptd.V.T));
    const lev = geom3_factor_to_lev(z);
    const nlev = lev - down;

    const xyscale = rezoom ? geom3_scale_at_lev(lev) / geom3_scale_at_lev(nlev) : 1;
    const z2 = geom3_lev_to_factor(nlev);
    const zscale = z2 / z;

    // xyscale = xyscale + (zscale-xyscale) * (1+sin(ticks / 1000.0)) / 2;

    // ptd->V is the queue item's own copy in C++; here queuepoly keeps the caller's object (shared with other
    // items of the cell), so a new object takes its place (package D4)
    ptd.V = { T: tmul(tmul(xyzscale(V.T, xyscale * zscale, zscale),
      z_inverse(V.T)), unshift_sm(ptd.V, V.shift)), shift: ptd.V.shift };

    if (!repriority) { /* */ }
    else if (nlev < -G.vid.lake_bottom - 1e-3) {
      ptd.prio = PPR.DEEP_FALLANIM;
      if (c.wall !== waChasm)
        ptd.color = 0; // disappear!
    }
    else if (nlev < -G.vid.lake_top - 1e-3)
      ptd.prio = PPR.SHALLOW_FALLANIM;
    else if (nlev < 0)
      ptd.prio = PPR.FLOOR_FALLANIM;
  }
}

export function allemptynear(c: cell): boolean {
  if (c.wall) return false;
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (c2 && c2.wall) return false; }
  return true;
}

// EX bool bright; EX int canvasdark: G.bright, G.canvasdark

// how much to darken
export function getfd(c: cell): number {
  if (G.bright) return 0;
  if (among(c.land, laAlchemist, laHell, laVariant, laEclectic) && WDIM() === 2 && GDIM() === 3) return 0;
  switch (c.land) {
    case laCanvas:
      return Math.min(2, Math.max(0, G.canvasdark));

    case laRedRock:
    case laReptile:
      return 0;

    case laSnakeNest:
      return realred(c.wall) ? 0 : 1;

    case laTerracotta:
    case laMercuryRiver:
      return (c.wall === waMercury && G.wmspatial) ? 0 : 1;

    case laKraken:
    case laDocks:
    case laBurial:
    case laIvoryTower:
    case laDungeon:
    case laMountain:
    case laEndorian:
    case laCaribbean:
    case laWhirlwind:
    case laRose:
    case laWarpSea:
    case laTortoise:
    case laDragon:
    case laHalloween:
    case laHunting:
    case laOcean:
    case laLivefjord:
    case laWhirlpool:
    case laAlchemist:
    case laIce:
    case laGraveyard:
    case laBlizzard:
    case laRlyeh:
    case laTemple:
    case laWineyard:
    case laDeadCaves:
    case laPalace:
    case laCA:
    case laDual:
    case laBrownian:
      return 1;

    case laVariant:
      if (isWateryOrBoat(c)) return 1;
      return 2;

    case laTrollheim:
    default:
      return 2;
  }
}

export function colorhash(i: number): number {
  // (i * 0x471211 + i*i*0x124159 + i*i*i*0x982165) & 0xFFFFFF in 32-bit unsigned arithmetic
  const i2 = Math.imul(i, i);
  return (Math.imul(i, 0x471211) + Math.imul(i2, 0x124159) + Math.imul(Math.imul(i2, i), 0x982165)) & 0xFFFFFF;
}

export function mousedist(T: shiftmatrix): number {
  if (GDIM() === 2) return hdist(G.mouseh.h, unshift(smulh(T, C0()), G.mouseh.shift));
  throw new NotPorted('mousedist: 3D'); // STAGE2-STUB (3D)
  void sqhypot_d; void point2; void hsub;
}

// EX vector<vector<hyperpoint>> clipping_plane_sets; EX int noclipped; EX bool frustum_culling = true;
// EX ld threshold, xyz_threshold; EX bool clip_checked = false: G.* (only 3D sets clip_checked)

export function other_stereo_mode(): boolean {
  return G.vid.stereo_mode !== 0; // sOFF
}

export function make_clipping_planes(): void {
  // MAXMDIM >= 4
  G.clip_checked = false;
  if (!G.frustum_culling || sphere() || G.experimental || other_stereo_mode() || gproduct() || embedded_plane()) return;

  if (WDIM() === 3) throw new NotPorted('make_clipping_planes: 3D'); // STAGE2-STUB (3D; mdGeodesic in 2D)
  // (2D: none of the cases applies)
  else return;
}

/** bool celldrawer::cell_clipped(): celldrawer.ts */

// EX ld precise_width = .5; int grid_depth = 0; EX bool fat_edges = false; EX bool gridbelow: G.precise_width,
// grid_depth (module), G.fat_edges, G.gridbelow
let grid_depth = 0;

export function gridline(V1: shiftmatrix, h1: hyperpoint, V2: shiftmatrix, h2: hyperpoint, col: number, prec: number): void {
  const U2 = unshift_sm(V2, V1.shift);

  const c1 = safe_classify_ideals(h1);
  const c2 = safe_classify_ideals(h2);
  const d = (c1 <= 0 || c2 <= 0) ? 99 : hdist(tmulh(V1.T, h1), tmulh(U2, h2));

  // MAXMDIM >= 4
  if (GDIM() === 3 && G.fat_edges) {
    throw new NotPorted('gridline: fat edges (3D)'); // STAGE2-STUB (3D)
  }

  while (d > G.precise_width && d < 100 && grid_depth < 10) {
    if (V1.shift !== V2.shift || !eqmatrix(V1.T, V2.T, 1e-6)) { gridline(V1, h1, V1, inverse_shift_sp(V1, smulh(V2, h2)), col, prec); return; }
    let h: hyperpoint;
    if (c1 <= 0 && c2 <= 0) {
      h = closest_to_zero(h1, h2);
      if (safe_classify_ideals(h) <= 0) return;
      h = normalize(h);
    }
    else if (c2 <= 0) {
      const dw = grid_depth; grid_depth = 99;
      try {
        for (let a = 0; a < G.ideal_limit; a += G.precise_width)
          gridline(V1, towards_inf(h1, h2, a), V1, towards_inf(h1, h2, a + G.precise_width), col, prec);
      } finally { grid_depth = dw; }
      return;
    }
    else if (c1 <= 0) {
      const dw = grid_depth; grid_depth = 99;
      try {
        for (let a = 0; a < G.ideal_limit; a += G.precise_width)
          gridline(V1, towards_inf(h2, h1, a), V1, towards_inf(h2, h1, a + G.precise_width), col, prec);
      } finally { grid_depth = dw; }
      return;
    }
    else h = midz(h1, h2);
    grid_depth++;
    gridline(V1, h1, V1, h, col, prec);
    gridline(V1, h, V1, h2, col, prec);
    grid_depth--;
    return;
  }
  // MAXMDIM >= 4
  if (WDIM() === 2 && GDIM() === 3) {
    throw new NotPorted('gridline: 2D in 3D'); // STAGE2-STUB (3D)
  }
  else
    queueline(smulh(V1, h1), smulh(V2, h2), col, prec, G.gridbelow ? PPR.FLOORd : PPR.LINE);
}

export function gridline_v(V: shiftmatrix, h1: hyperpoint, h2: hyperpoint, col: number, prec: number): void {
  gridline(V, h1, V, h2, col, prec);
}

/** `hdist0(h) - 1e-6 < thr` in the hyperbolic plane (performance, added after stage 2): decided with Math.acosh
 *  (fdlibm, within 1 ulp of the correctly rounded c_acosh hdist0 uses) when it is more than 1e-9 away from the
 *  threshold, which no rounding difference reaches; otherwise null (compute hdist0 exactly) */
function hyp_dist0_below(h: hyperpoint, thr: number): boolean | null {
  const x = h[LDIM()];
  const d = (x < 1 ? 0 : Math.acosh(x)) - 1e-6;
  if (d < thr - 1e-9 * (1 + Math.abs(thr))) return true;
  if (d > thr + 1e-9 * (1 + Math.abs(thr))) return false;
  return null;
}

export function set_detail_level(V: shiftmatrix): void {
  const editing = !!(G.cmode & sm.NUMBER) && dialog_editingDetail();
  if (G.vid.use_smart_range && !editing) { G.detaillevel = 2; return; }
  const h0 = tC0(V.T);
  // the hyperbolic plane: the levels without the exact distance where they are certain (dist0 is used only here)
  if (hyperbolic() && !editing) {
    const hi = hyp_dist0_below(h0, G.vid.highdetail);
    if (hi === true) { G.detaillevel = 2; return; }
    if (hi === false) {
      const mi = hyp_dist0_below(h0, G.vid.middetail);
      if (mi !== null) { G.detaillevel = mi ? 1 : 0; return; }
    }
  }
  const dist0 = hdist0(h0) - 1e-6;
  if (G.vid.use_smart_range) G.detaillevel = 2;
  else if (dist0 < G.vid.highdetail) G.detaillevel = 2;
  else if (dist0 < G.vid.middetail) G.detaillevel = 1;
  else G.detaillevel = 0;

  if (editing) {
    const col =
      dist0 < G.vid.highdetail ? 0xFF80FF80 :
      dist0 >= G.vid.middetail ? 0xFFFF8080 :
      0XFFFFFF80;
    queuepoly(V, cgi().shHeptaMarker, darkena(col & 0xFFFFFF, 0, 0xFF));
  }
}

// CAP_QUEUE
export function queuecircleat1(c: cell, V: shiftmatrix, rad: number, col: number): void {
  if (WDIM() === 3) {
    throw new NotPorted('queuecircleat1: 3D (shWireframe3D)'); // STAGE2-STUB (3D)
  }
  if (G.spatial_graphics || GDIM() === 3) {
    const corners: hyperpoint[] = new Array(c.type + 1);
    for (let i = 0; i < c.type; i++) corners[i] = get_corner_position(c, i, 3 / rad);
    corners[c.type] = corners[0];
    const omf = (h: hyperpoint, fol: number): hyperpoint => orthogonal_move_fol(h, fol);
    for (let i = 0; i < c.type; i++) {
      queueline(smulh(V, omf(corners[i], cgi().FLOOR)), smulh(V, omf(corners[i + 1], cgi().FLOOR)), col, 2, PPR.SUPERLINE);
      queueline(smulh(V, omf(corners[i], cgi().WALL)), smulh(V, omf(corners[i + 1], cgi().WALL)), col, 2, PPR.SUPERLINE);
      queueline(smulh(V, omf(corners[i], cgi().FLOOR)), smulh(V, omf(corners[i], cgi().WALL)), col, 2, PPR.SUPERLINE);
    }
    return;
  }
  // CAP_SHAPES
  if (G.vid.stereo_mode || sphere()) {
    const p = G.poly_outline;
    G.poly_outline = col;
    try { queuepolyat(smul(V, spin(ptick(100))), cgi().shGem[1], 0, PPR.LINE); }
    finally { G.poly_outline = p; }
    return;
  }
  queuecircle_V(V, rad, col);
  if (!G.wmspatial) return;
  const si = get_spatial_info(c);
  const omfs = (fol: number): shiftmatrix => ({ T: orthogonal_move_fol_t(V.T, fol), shift: V.shift });
  if (si.top === SIDE_WALL)
    queuecircle_V(omfs(cgi().WALL), rad, col);
  if (si.top === SIDE_RED1)
    queuecircle_V(omfs(cgi().RED[1]), rad, col);
  if (si.top === SIDE_RED2)
    queuecircle_V(omfs(cgi().RED[2]), rad, col);
  if (si.top === SIDE_RED3)
    queuecircle_V(omfs(cgi().RED[3]), rad, col);
  if (si.top <= SIDE_WATERLEVEL)
    queuecircle_V(omfs(cgi().WATERLEVEL), rad, col);
}

export function queuecircleat(c: cell, rad: number, col: number): void {
  if (!c) return;
  const copies = G.current_display.all_drawn_copies.get(c);
  if (copies) for (const V of copies)
    queuecircleat1(c, V, rad, col);
}

// #define MOBON true (not ISMOBILE)

export function forwardcell(): cell {
  // CAP_VR: vrhr::active() is false
  throw new NotPorted('forwardcell: vectodir(move_destination_vec) (control.cpp, package U3)'); // STAGE2-STUB
}

// EX bool draw_centerover = true: G.draw_centerover

export function should_draw_mouse_cursor(): boolean {
  if (!G.mousing || G.inHighQual) return false;
  if (outofmap(G.mouseh.h)) return false;
  if (G.rug_rugged && !G.rug_renderonce) return true;
  return false;
}

export function drawMarkers(): void {

  // shmup::draw_collision_debug(): shmup (stage 3) draws nothing unless debugging collisions

  if (!(G.cmode & sm.NORMAL)) return;

  const gmatrix = G.current_display.cellmatrices;
  const cwt = G.cwt;

  if (should_draw_mouse_cursor()) {
    for (const i of player_indices()) {
      queueline(smulh(ggmatrix(playerpos(i)), (WDIM() === 2 && GDIM() === 3 ? notp3('drawMarkers: zpush0 (3D)') : C0())), G.mouseh, 0xFF00FF, grid_prec_g() + 1);
    }
  }

  callhooks(G.hooks_markers);
  // CAP_SHAPES
  viewmat_();

  if (G.ticks < G.movehints_ticks) {
    if (G.legalmoves[cwt.at.type] && !G.vid.mobilecompasssize) queuecircleat(cwt.at, 0.5 + 0.25 * sintick(75), darkena(0xFFFFFF, 0, 0xFF));
    for (const it of sortedKeys(G.orb_used_where)) { const c = G.orb_used_where.get(it)!; if (gmatrix.has(c))
      queuestr_V(gmatrix.get(c)!, G.mapfontscale / 100, 'X', gradient(0, iinf[it].color, -1, sintick(75), 1)); }
    if (G.bowtarget && gmatrix.has(G.bowtarget) && G.bowtarget.cpdist >= 2) {
      const V = gmatrix.get(G.bowtarget)!;
      queuestr_V(V, G.mapfontscale / 100, 'X', gradient(0, iinf[itCrossbow].color, -1, sintick(75), 1));
      G.poly_outline = gradient(0, getcs().bowcolor, -1, sintick(75), 1);
      queuepolyat(V, cgi().shCrossbowIcon, 0, PPR.LINE);
      G.poly_outline = gradient(0, getcs().bowcolor2, -1, sintick(75), 1);
      queuepolyat(V, cgi().shCrossbowstringIcon, 0, PPR.LINE);
    }
  }

  // CAP_QUEUE
  for (const c1 of G.crush_now)
    queuecircleat(c1, .8, darkena(minf[moCrusher].color, 0, 0xFF));

  if (!G.inHighQual) {

    const ok = true; // !ISPANDORA || mousepressed

    // CAP_QUEUE
    if (haveMount()) {
      const copies = G.current_display.all_drawn_copies.get(G.dragon_target);
      if (copies) for (const V of copies) {
        queuestr_V(V, G.mapfontscale / 100, 'X',
          gradient(0, iinf[itOrbDomination].color, -1, sintick(G.dragon_whichturn === G.turncount ? 75 : 150), 1));
      }
    }

    /* for(int i=0; i<12; i++) if(c->type == 5 && c->master == &dodecahedron[i]) ... */

    if (1) {
      // using namespace yendor;
      const yi = G.yendor_yi, yii = G.yendor_yii;
      if (yii < isize(yi) && !yi[yii].found) {
        let keycell: cell = null!;
        let last_i = 0;
        for (let i = 0; i < YDIST; i++)
          if (yi[yii].path[i].cpdist <= get_sightrange_ambush()) {
            keycell = yi[yii].path[i]; last_i = i;
          }
        if (keycell) {
          for (let i = last_i + 1; i < YDIST; i++) {
            const c = yi[yii].path[i];
            if (inscreenrange(c))
              keycell = c;
          }
          const H = tC0_sm(ggmatrix(keycell));
          // CAP_QUEUE
          queue_goal_text(H, 2, 'X', 0x10101 * itrunc(128 + 100 * sintick(150)));
          let cd = celldistance(yi[yii].key(), cwt.at);
          if (cd === DISTANCE_UNKNOWN) for (let i2 = 0; i2 < YDIST; i2++) {
            const cd2 = celldistance(cwt.at, yi[yii].path[i2]);
            if (cd2 !== DISTANCE_UNKNOWN) {
              cd = cd2 + (YDIST - 1 - i2);
            }
          }
          queue_goal_text(H, 1, its(cd), 0x10101 * itrunc(128 - 100 * sintick(150)));
          addauraspecial(H, iinf[itOrbYendor].color, 0);
          // addradar(ggmatrix(keycell), 'X', iinf[itKey].color, kind_outline(itKey), true): the 3D radar
        }
      }
    }

    // CAP_RACING: racing::markers()
    if (G.racing_on) throw new NotPorted('drawMarkers: racing::markers'); // STAGE2-STUB (racing)

    // CAP_QUEUE
    if (G.lmouseover && G.vid.drawmousecircle && ok && DEFAULTCONTROL() && WDIM() === 2) {
      const at = G.lmouseover;
      // CAP_VR
      queuecircleat(at, .8, darkena(G.lmouseover.cpdist > 1 ? 0x00FFFF : 0xFF0000, 0, 0xFF));
    }

    if (G.global_pushto && G.vid.drawmousecircle && ok && DEFAULTCONTROL() && WDIM() === 2) {
      queuecircleat(G.global_pushto, .6, darkena(0xFFD500, 0, 0xFF));
    }

    // CAP_SDLJOY && CAP_QUEUE (the desktop build: joydir is zero-initialized, d = 0)
    if (G.joydir.d >= 0 && WDIM() === 2) {
      const c = cwt.plus(G.joydir.d).cpeek();
      const size = .78 - .02 * sintick(199);
      queuecircleat(c, size, getcs().uicolor);

      if ((c.type & 1) && (isStunnable(c.monst) || isPushable(c.wall))) {
        const c1 = cwt.plus(G.joydir.d).plusStep().plus(-(G.joydir.subdir * idiv(c.type, 2))).cpeek();
        queuecircleat(c1, size, getcs().uicolor);
      }
    }

    let m = true;
    // CAP_MODEL: m = netgen::mode == 0;

    // CAP_QUEUE
    if (G.current_display.precise_center && !G.playermoved && m && !anims_any_animation() && WDIM() === 2 && G.draw_centerover)
      queuecircleat(G.current_display.precise_center, .70 - .06 * sintick(200),
        darkena(itrunc(175 + 25 * sintick(200)), 0, 0xFF));

    if (G.multi_players > 1 || G.multi_alwaysuse) for (let i = 0; i < numplayers(); i++) {
      G.multi_cpid = i;
      if (G.multi_players === 1) G.multi_player[i].set(G.cwt);
      const ctgt = multi_multiPlayerTarget(i);
      // sintick(..., i / numplayers()): an int division, always 0
      const size = .40 - .06 * sintick((!G.multi_multi_autojoy && !G.multi_accepted[i]) ? 500 : 200, idiv(i, numplayers()));
      queuecircleat(ctgt, size, getcs().uicolor);
      if (ctgt && (ctgt.type & 1) && (isStunnable(ctgt.monst) || isPushable(ctgt.wall))) {
        const c2 = G.multi_player[i].plus(G.multi_whereto[i].d).plusStep().plus(-(G.multi_whereto[i].subdir * idiv(ctgt.type, 2))).cpeek();
        queuecircleat(c2, size, getcs().uicolor);
      }
    }
    void m;

    // process mouse
    // CAP_SHAPES
    if ((G.vid.axes >= 4 || (G.vid.axes === 1 && !G.mousing)) && !G.shmup_on && GDIM() === 2) {
      if (G.multi_players === 1) {
        for (let d = 0; d < cwt.at.type; d++) {
          const c2 = cwt.at.move(d);
          if (gmatrix.has(cwt.at)) draw_movement_arrows(c2, tmul(unshift_sm(gmatrix.get(cwt.at)!), (G.currentmap as { adj(c: cell, i: number): transmatrix }).adj(cwt.at, d)), d);
        }
      }
      else if (G.multi_players > 1) for (let p = 0; p < G.multi_players; p++) {
        if (multi_playerActive(p) && (G.vid.axes >= 4 || !drawstaratvec(G.multi_mdx[p], G.multi_mdy[p])))
          for (let d = 0; d < G.multi_player[p].at.type; d++) {
            const c2 = G.multi_player[p].at.move(d);
            if (gmatrix.has(G.cwt.at)) {
              G.multi_cpid = p;
              const ttm = G.current_display.player_matrix, tcw = G.cwt.clone();
              G.current_display.player_matrix = G.multi_whereis[p];
              G.cwt.set(G.multi_player[p]);
              try {
                draw_movement_arrows(c2, tmul(unshift_sm(gmatrix.get(G.cwt.at)!), (G.currentmap as { adj(c: cell, i: number): transmatrix }).adj(G.cwt.at, d)), d);
              } finally { G.current_display.player_matrix = ttm; G.cwt.set(tcw); }
            }
          }
      }
    }

    if (GDIM() === 3 && !G.inHighQual && !G.shmup_on && G.vid.axes3 && G.playermoved) {
      const c = forwardcell();
      if (c) queuecircleat(c, .8, getcs().uicolor);
    }

    if (mhybrid() && !G.shmup_on) throw new NotPorted('drawMarkers: hybrid swords'); // STAGE2-STUB
    if (SWORDDIM_() === 3 && !G.shmup_on) throw new NotPorted('drawMarkers: 3D swords'); // STAGE2-STUB
  }

  G.monsterToSummon = moNone;
  G.orbToTarget = itNone;

  if (G.mouseover && G.targetclick) {
    G.multi_cpid = 0;
    G.orbToTarget = targetRangedOrb(G.mouseover, roCheck);
    // CAP_QUEUE
    if (G.bow_fire_mode) {
      queuestr(G.mousex, G.mousey, 0, G.vid.fsize, '+', getcs().bowcolor >>> 8);
      G.orbToTarget = itNone;
    }
    else if (G.orbToTarget === itOrbSummon) {
      G.monsterToSummon = summonedAt(G.mouseover);
      queuestr(G.mousex, G.mousey, 0, G.vid.fsize, G.s0 + String.fromCharCode(minf[G.monsterToSummon].glyph), minf[G.monsterToSummon].color);
      queuecircleat(G.mouseover, 0.6, darkena(minf[G.monsterToSummon].color, 0, 0xFF));
    }
    else if (G.orbToTarget) {
      queuestr(G.mousex, G.mousey, 0, G.vid.fsize, '@', iinf[G.orbToTarget].color);
      queuecircleat(G.mouseover, 0.6, darkena(iinf[G.orbToTarget].color, 0, 0xFF));
    }
    // CAP_SHAPES
    if (G.orbToTarget && rand() % 200 < G.ticks - G.lastt) {
      if (G.orbToTarget === itOrbDragon)
        drawFireParticles(G.mouseover, 2);
      else if (G.orbToTarget === itOrbSummon) {
        drawParticles(G.mouseover, iinf[G.orbToTarget].color, 1);
        drawParticles(G.mouseover, minf[G.monsterToSummon].color, 1);
      }
      else {
        drawParticles(G.mouseover, iinf[G.orbToTarget].color, 2);
      }
    }
    if (G.items[itOrbAir] && G.mouseover.cpdist > 1) {
      throw new NotPorted('drawMarkers: the Orb of Air target (blowoff_destination_dir)'); // STAGE2-STUB
    }
  }
}

/** viewmat() (floorshapes.cpp): the debug view of the floor shapes, only with floorshape_debug */
function viewmat_(): void {
  if (G.floorshape_debug) throw new NotPorted('viewmat (floorshape_debug)'); // STAGE2-STUB (debug)
}

/** queue_goal_text(shiftpoint P1, ld sizemul, const string& s, color_t color) (graph-item.cpp; CAP_VR off) */
function queue_goal_text(P1: shiftpoint, sizemul: number, s: string, color: number): void {
  queuestr_sp(P1, G.vid.fsize * sizemul, s, color);
}

/** grid_prec() (celldrawer.cpp) */
function grid_prec_g(): number { return (sphere() ? 3 : 1) + G.vid.linequality; }

function notp3(what: string): never { throw new NotPorted(what); } // STAGE2-STUB (3D)

/** #define SWORDDIM (hybrid::in_prod() ? 2 : WDIM) */
function SWORDDIM_(): number { return WDIM(); }

export function allowIncreasedSight(): boolean {
  if (G.cheater || G.autocheat) return true;
  if (G.peace_on) return true;
  // CAP_TOUR
  if (G.tour_on) return true;
  if (G.randomPatternsMode) return true;
  if (G.racing_on) return true;
  if (quotient() || !hyperbolic() || arcm_in() || arb_in()) return true;
  if (WDIM() === 3) return true;
  if (!G.canmove) return true;
  return false;
}

export function allowChangeRange(): boolean {
  if (G.cheater || G.peace_on || G.randomPatternsMode) return true;
  // CAP_TOUR
  if (G.tour_on) return true;
  if (G.racing_on) return true;
  if (arcm_in() || arb_in()) return true;
  if (WDIM() === 3) return true;
  return false;
}

// EX purehookset hooks_drawmap; EX transmatrix actual_view_transform: G.*

/** ld wall_radar(cell *c, transmatrix T, transmatrix LPe, ld max): 3D */
export function wall_radar(_c: cell, _T: transmatrix, _LPe: transmatrix, max: number): number {
  if (!in_perspective() || !G.vid.use_wall_radar) return max;
  throw new NotPorted('wall_radar (3D)'); // STAGE2-STUB
}

// /** if this is set to ON, just transform non-isotropic spaces according to View, and apply NLP to view */
// EX bool nonisotropic_weird_transforms: G.nonisotropic_weird_transforms

export function decide_lpu(): void {
  G.nisot_local_perspective_used = gproduct();
}

export function make_actual_view(): void {
  const cd = G.current_display;
  decide_lpu();
  if (!G.nisot_local_perspective_used) cd.local_perspective = tcopy(Id);
  G.sphereflip = tcopy(Id);
  G.sphere_flipped = flip_sphere();
  if (G.sphere_flipped) G.sphereflip[LDIM()][LDIM()] = -1;
  G.actual_view_transform = G.sphereflip;
  if (G.vid.yshift && WDIM() === 2) G.actual_view_transform = tmul(ypush(G.vid.yshift), G.actual_view_transform);
  // MAXMDIM >= 4
  if (GDIM() === 3) {
    throw new NotPorted('make_actual_view: 3D (camera level, wall radar)'); // STAGE2-STUB (3D)
  }
  if ((nonisotropic() || (hyperbolic() && bt_in() && !G.nisot_geodesic_movement)) && !G.nonisotropic_weird_transforms) {
    throw new NotPorted('make_actual_view: nonisotropic / binary tiling (NLP)'); // STAGE2-STUB
  }
  // cgi.emb->set_radar_transform(): the 3D radar (not in stage 2)
  G.Viewbase = cd.view_matrix;
}

/** shiftmatrix cview(ld base_shift IS(0)) */
export function cview(base_shift = 0): shiftmatrix {
  return { T: tmul(G.actual_view_transform, G.current_display.view_matrix), shift: base_shift };
}

// EX int point_direction: G.point_direction

export function through_wall(c: cell, at: hyperpoint): number {
  let dist = hdist0(at);
  let nei = -1;
  for (let i = 0; i < c.type; i++) {
    const dist1 = hdist0(tmulh((G.currentmap as { ray_iadj(c: cell, i: number): transmatrix }).ray_iadj(c, i), at));
    if (dist1 < dist) { nei = i; dist = dist1; }
  }
  return nei;
}

export function precise_mouseover(): void {
  if (WDIM() === 3 && (G.cmode & (sm.EDIT_INSIDE_WALLS | sm.EDIT_BEFORE_WALLS))) {
    throw new NotPorted('precise_mouseover: 3D'); // STAGE2-STUB (3D)
  }
  if (WDIM() === 3) {
    throw new NotPorted('precise_mouseover: 3D'); // STAGE2-STUB (3D)
  }
  if (!G.mouseover) return;
  if (GDIM() === 3) return;
  const omouseover = G.mouseover;
  const gmatrix = G.current_display.cellmatrices;
  for (let loop = 0; loop < 10; loop++) {
    let found = false;
    if (!gmatrix.has(G.mouseover)) return;
    const r_mouseh = inverse_shift_sp(gmatrix.get(G.mouseover)!, G.mouseh);
    for (let i = 0; i < G.mouseover.type; i++) {
      const h1 = get_corner_position(G.mouseover, gmod(i - 1, G.mouseover.type));
      const h2 = get_corner_position(G.mouseover, i);
      if (det3(build_matrix(h1, h2, C0(), C0())) * det3(build_matrix(h1, h2, r_mouseh, C0())) < 0) {
        G.mouseover2 = G.mouseover;
        G.mouseover = G.mouseover.move(i);
        found = true;
        break;
      }
    }
    if (!found) return;
  }
  // probably some error... just return the original
  G.mouseover = omouseover;
}

// EX transmatrix Viewbase; EX bool no_wall_rendering; EX bool set_multi = false; EX hyperpoint multi_point: G.*

export function center_multiplayer_map(hs: hyperpoint[]): void {
  let h: hyperpoint = [...Hypc];
  for (const h1 of hs) h = hadd(h, h1);
  h = hdiv(h, isize(hs));
  h = cgi().emb.normalize_flat(h);
  G.current_display.player_matrix = shiftless_t(rgpushxto0(h));
  if (isize(hs) === 2) {
    G.set_multi = true;
    G.multi_point = hs[1];
  }
}

// EX debugflag debug_map = {"graph_map"}

export function drawthemap(): void {
  // indenter_finish(debug_map, "drawthemap");
  const cd = G.current_display;

  check_cgi();
  cgi().require_shapes();

  G.last_firelimit = G.firelimit;
  G.firelimit = 0;

  make_clipping_planes();
  // current_display->radarpoints.clear(); current_display->radarlines.clear(): the 3D radar (not in stage 2)
  callhooks(G.hooks_drawmap);

  G.frameid++;
  G.cells_drawn = 0;
  G.cells_generated = 0;
  G.noclipped = 0;
  G.first_cell_to_draw = true;

  if (G.sightrange_bonus > 0 && !allowIncreasedSight())
    G.sightrange_bonus = 0;

  // swap(gmatrix0, gmatrix); gmatrix.clear();
  const t = cd.old_cellmatrices; cd.old_cellmatrices = cd.cellmatrices; cd.cellmatrices = t;
  cd.cellmatrices.clear();
  cd.all_drawn_copies.clear();

  const vid = G.vid;
  G.wmspatial = vid.wallmode === 4 || vid.wallmode === 5;
  G.wmescher = vid.wallmode === 3 || vid.wallmode === 5;
  G.wmplain = vid.wallmode === 2 || vid.wallmode === 4;
  G.wmascii = vid.wallmode === 0 || vid.wallmode === 6;
  G.wmascii3 = vid.wallmode === 6;
  G.wmblack = vid.wallmode === 1;

  G.mmitem = vid.monmode >= 1;
  G.mmmon = vid.monmode >= 2;
  G.mmspatial = vid.monmode >= 3;

  G.mmhigh = vid.highlightmode >= 1;
  if (G.hiliteclick) G.mmhigh = !G.mmhigh;

  display_data_set_all(cd, 0, 0); /* so that non_spatial_model works correctly */

  G.spatial_graphics = G.wmspatial || G.mmspatial;
  G.spatial_graphics = G.spatial_graphics && GDIM() === 2;
  // CAP_RUG
  if (G.rug_rugged && !G.rug_spatial_rug) G.spatial_graphics = false;
  if (non_spatial_model())
    G.spatial_graphics = false;
  if (pconf().model === mdDisk && Math.abs(pconf().alpha) < 1e-6) G.spatial_graphics = false;

  if (!G.spatial_graphics) G.wmspatial = G.mmspatial = false;
  if (GDIM() === 3) G.wmspatial = G.mmspatial = true;

  for (let m = 0; m < motypes; m++) if (isPrincess(m as eMonster))
    minf[m].name = princessgender() ? 'Princess' : 'Prince';

  // CAP_RAY: ray::in_use = ray::requested() (the raycaster is GL only: false)
  G.no_wall_rendering = false; // = ray::in_use
  // ray::comparison_mode = true;
  // if(ray::comparison_mode) no_wall_rendering = false;

  iinf[itSavedPrincess].name = minf[moPrincess].name;

  for (let i = 0; i < NUM_GS; i++) {
    const g = genderswitch[i];
    if (g.gender !== princessgender()) continue;
    minf[g.m].help = g.desc;
    minf[g.m].name = g.name;
  }

  if (G.mapeditor_autochoose) throw new NotPorted('drawthemap: mapeditor::autochoose (the map editor)'); // STAGE2-STUB
  G.mapeditor_ewsearch_dist = 1e30;
  G.modist = 1e20; G.mouseover = null!;
  G.modist2 = 1e20; G.mouseover2 = null!;

  compute_graphical_distance();

  for (let i = 0; i < G.multi_players; i++) {
    G.multi_ccdist[i] = 1e20; G.multi_ccat[i] = null!;
  }

  downseek_reset();

  // ISMOBILE: mouseovers = XLAT("No info about this...");
  if (mouseout() && !G.mousepan)
    G.modist = -5;
  G.playerfound = false;
  // playerfoundL = false;
  // playerfoundR = false;

  G.arrowtraps.length = 0;

  make_actual_view();
  (G.currentmap as { draw_all(): void }).draw_all();
  drawWormSegments();
  drawBlizzards();
  drawArrowTraps();

  precise_mouseover();

  G.ivoryz = false;

  linepatterns_drawAll();

  callhooks(G.hooks_frame);

  drawMarkers();
  drawFlashes();

  mapeditor_draw_dtshapes();
  G.set_multi = false;

  if (G.multi_players > 1 && !G.shmup_on) {
    if (G.multi_split_screen)
      throw new NotPorted('drawthemap: subscreens::current_player (split screen)'); // STAGE3-STUB (split screen)
    else if (G.multi_centerplayer !== -1)
      G.current_display.player_matrix = G.multi_whereis[G.multi_centerplayer];
    else {
      const pts: hyperpoint[] = [];
      for (let p = 0; p < G.multi_players; p++) if (multi_playerActive(p))
        pts.push(unshift(smulh(G.multi_whereis[p], tile_center())));
      center_multiplayer_map(pts);
    }
  }

  if (G.shmup_on) {
    throw new NotPorted('drawthemap: shmup (shmup::pc)'); // STAGE2-STUB
  }

  // CAP_SDL
  // const sdl_keystate_type *keystate = SDL12_GetKeyState(NULL);
  G.lmouseover = G.mouseover;
  G.lmouseover_distant = G.lmouseover;
  const shift_held = sdl_shift_held();
  const useRangedOrb = (!(G.vid.shifttarget & 1) && haveRangedOrb() && G.lmouseover && G.lmouseover.cpdist > 1) || shift_held;
  if (!useRangedOrb && !(G.cmode & sm.MAP) && !(G.cmode & sm.DRAW) && DEFAULTCONTROL() && !mouseout() && !G.dual_state) {
    const gs = G.gravity_state;
    try {
      calcMousedest();
      const cw = G.cwt.clone(); const f = G.flipplayer;
      G.items[itWarning] += 2;

      movepcto(G.mousedest.d, G.mousedest.subdir, true);
      G.items[itWarning] -= 2;
      if (cw.spin !== G.cwt.spin) mirror_act(-G.mousedest.d, mirror_SPINSINGLE);
      G.cwt = cw; G.flipplayer = f;
      G.lmouseover = G.mousedest.d >= 0 ? G.cwt.at.modmove(G.cwt.spin + G.mousedest.d) : G.cwt.at;
    } finally { G.gravity_state = gs; }
  }
}

/** keystate[SDL_SCANCODE_RSHIFT] | keystate[SDL_SCANCODE_LSHIFT] (the harness: no key held; the browser: package
 *  U3's SDL_GetKeyboardState) */
function sdl_shift_held(): boolean { return G.sdl_shift_held; }

// old style joystick control

// EX bool dronemode; purehookset hooks_calcparam; EX int corner_centering; EX bool permaside; EX bool old_center;
// EX ld min_scale = 1e-6; EX int forced_center_down = ISANDROID ? 2 : ISIOS ? 40 : 40: G.*

/** enum eStereo { sOFF, sAnaglyph, sLR, sODS, sPanini, sStereographic } (hyper.h) */
const sPanini = 4, sStereographic = 5;

export function get_stereo_param(): number {
  if (among(G.vid.stereo_mode, sPanini, sStereographic)) return G.vid.stereo_param;
  return 0;
}

export function calcparam(): void {

  // indenter_finish(debug_calcparam, "calcparam");
  const cd = G.current_display;
  const vid = G.vid;

  cd.xtop = vid.xres * cd.xmin;
  cd.ytop = vid.yres * cd.ymin;

  cd.xsize = vid.xres * (cd.xmax - cd.xmin);
  cd.ysize = vid.yres * (cd.ymax - cd.ymin);

  cd.xcenter = itrunc(cd.xtop + cd.xsize / 2); // int xcenter, ycenter
  cd.ycenter = itrunc(cd.ytop + cd.ysize / 2);

  if (Math.abs(pconf().scale) < G.min_scale) pconf().scale = 1;

  let realradius = Math.min(cd.xsize / 2, cd.ysize / 2);

  cd.scrsize = itrunc(realradius); // int scrsize
  if (!G.inHighQual) cd.scrsize -= G.forced_center_down;

  G.current_display.sidescreen = G.permaside;

  if (vid.xres < vid.yres - 2 * vid.fsize && !G.inHighQual && (G.old_center || !in_perspective())) {
    cd.ycenter = itrunc(lerp_ld(vid.fsize + cd.scrsize, vid.yres - cd.scrsize - vid.fsize, .8));
  }
  else {
    const ok = true; // !vrhr::active()
    if (vid.xres > idiv(vid.yres * 4, 3) + 16 && (G.cmode & sm.SIDE) && ok && !((G.cmode & sm.MAYDARK) && G.centered_menus))
      G.current_display.sidescreen = true;
    // CAP_TOUR
    if (G.tour_on) throw new NotPorted('calcparam: tour::slides (SIDESCREEN)'); // STAGE2-STUB (tour)
    if ((G.cmode & sm.DIALOG_OFFMAP) && vid.xres > idiv(vid.yres * 11, 10))
      G.current_display.sidescreen = true;

    if (G.current_display.sidescreen) cd.xcenter = idiv(vid.yres, 2);
  }

  cd.radius = pconf().scale * cd.scrsize;
  if (GDIM() === 3 && in_perspective()) cd.radius = cd.scrsize;
  realradius = Math.min(realradius, cd.radius);

  const aradius = sphere() ? cd.radius / (pconf().alpha - 1) : cd.radius;
  // MAXMDIM >= 4: if(euclid && hybrid::drawing_underlying) aradius *= 2.5; (product geometries only)

  if (G.dronemode) { cd.ycenter = itrunc(cd.ycenter - cd.radius); cd.ycenter += idiv(vid.fsize, 2); cd.ycenter += idiv(vid.fsize, 2); cd.radius *= 2; }

  if (G.corner_centering) {
    cd.ycenter = itrunc(cd.ytop + cd.ysize - vid.fsize - aradius);
    if (G.corner_centering === 1)
      cd.xcenter = itrunc(cd.xtop + vid.fsize + aradius);
    if (G.corner_centering === 2)
      cd.xcenter = itrunc(cd.xtop + cd.xsize - vid.fsize - aradius);
  }

  cd.xcenter = itrunc(cd.xcenter + cd.scrsize * pconf().xposition);
  cd.ycenter = itrunc(cd.ycenter + cd.scrsize * pconf().yposition);

  const fov = vid.fov * degree / 2;
  cd.tanfov = Math.sin(fov) / (Math.cos(fov) + get_stereo_param());

  // CAP_SDLTTF
  set_cfont();
  callhooks(G.hooks_calcparam);
  reset_projection();
}

/** ld lerp(ld a0, ld a1, ld x) */
function lerp_ld(a0: number, a1: number, x: number): number { return a0 + (a1 - a0) * x; }


/** EX function<void()> wrap_drawfullmap = drawfullmap */
export let wrap_drawfullmap: () => void = () => drawfullmap();
export function set_wrap_drawfullmap(f: () => void): void { wrap_drawfullmap = f; }

// bool force_sphere_outline = false;

export function drawfullmap(): void {
  if (G.online_isolated && !drawing_rng.depth) { drawing_rng_begin(); try { drawfullmap(); } finally { drawing_rng_end(); } return; }
  // indenter_finish(debug_map, "drawfullmap");

  check_cgi();
  cgi().require_shapes();

  G.ptds.length = 0;

  /*
  if(models::on) {
    ...
    }
  */

  // CAP_QUEUE
  draw_boundary(0);
  draw_boundary(1);

  draw_model_elements();
  // MAXMDIM >= 4 && CAP_GL: prepare_sky() (GL)

  /* if(vid.wallmode < 2 && !euclid && !patterns::whichShape) {
    ...
    } */

  clearaura();
  if (!G.nomap) drawthemap();
  else callhooks(G.hooks_frame);

  if (!G.inHighQual) {
    if ((G.cmode & sm.NORMAL) && !G.rug_rugged) {
      if (G.multi_players > 1) {
        const bcwtV = G.current_display.player_matrix;
        for (let i = 0; i < G.multi_players; i++) if (multi_playerActive(i)) {
          G.current_display.player_matrix = G.multi_whereis[i]; G.multi_cpid = i; drawmovestar(G.multi_mdx[i], G.multi_mdy[i]);
        }
        G.current_display.player_matrix = bcwtV;
      }
      else if (G.multi_alwaysuse)
        drawmovestar(G.multi_mdx[0], G.multi_mdy[0]);
      else
        drawmovestar(0, 0);
    }
    // CAP_EDIT
    if (G.cmode & sm.DRAW) throw new NotPorted('drawfullmap: mapeditor::drawGrid (the map editor)'); // STAGE2-STUB
  }

  drawaura();
  // CAP_QUEUE
  drawqueue();
}

// ISMOBILE: extern bool wclick;

// 0 = not refreshing, 1 = refreshing for keyboard, 2 = refreshing for mouse position analysis
// EX int just_refreshing; EX int menu_darkening = 2; EX bool centered_menus = false; EX string menu_format = "": G.*

export function gamescreen(): void {

  if (G.cmode & sm.NOSCR) {
    G.stillscreen = true;
    emptyscreen();
    return;
  }

  if (G.just_refreshing === 1) return;

  if (subscreens_split(() => {
    calcparam();
    compute_graphical_distance();
    gamescreen();
  })) {
    throw new NotPorted('gamescreen: subscreens (split screen)'); // STAGE2-STUB
  }

  G.stillscreen = false;

  const gx = G.vid.xres;
  const gy = G.vid.yres;

  if (dual_split(() => {
    G.vid.xres = gx;
    G.vid.yres = gy;
    throw new NotPorted('gamescreen: dual::in_subscreen (dual geometry)'); // STAGE2-STUB
  })) {
    calcparam();
    return;
  }

  calcparam();

  G.darken = 0;

  if (!G.inHighQual /* && !vrhr::active() */) {
    if ((G.cmode & sm.MAYDARK) && !G.current_display.sidescreen)
      G.darken += G.menu_darkening;
    else if (G.cmode & sm.DARKEN)
      G.darken += G.menu_darkening;
  }
  if (G.vid.highlightmode === (G.hiliteclick ? 0 : 2))
    G.darken++;
  if (G.darken >= 8) {
    emptyscreen();
    return;
  }

  if (G.history_includeHistory) history_restore();

  G.festive = G.festive_date && G.festive_option;
  G.old_shines = G.shines; G.shines = new Map();

  anims_apply();
  // CAP_RUG
  if (G.rug_rugged) {
    throw new NotPorted('gamescreen: rug::actDraw (the hypersian rug)'); // STAGE2-STUB
  } else
    wrap_drawfullmap();
  anims_rollback();

  if (G.history_includeHistory) history_restoreBack();

  G.poly_outline = OUTLINE_DEFAULT();

  // ISMOBILE: the mobile buttons

  G.darken = 0;

  // CAP_TEXTURE: if(texture::config.tstate == texture::tsAdjusting) texture::config.drawRawTexture(); (stage 3)

  // CAP_VR: vrhr::size_and_draw_ui_box();
}

export function emptyscreen(): void {
  check_cgi();
  cgi().require_shapes();
  make_actual_view();
  G.ptds.length = 0;
  // ray::in_use = false;
  drawqueue();
}

// EX int nohelp; EX bool no_find_player: G.*

export function show_menu_button(): void {
  const vid = G.vid;
  const displayButton = u1fn<(x: number, y: number, name: string, key: number, align: number, rad?: number) => void>('displayButton');
  if (G.menu_format !== '')
    displayButton(vid.xres - 8, vid.yres - vid.fsize, eval_programmable_string(G.menu_format), 'v'.charCodeAt(0), 16);
  else if (G.nomenukey /* || ISMOBILE */) {
    /* */
  }
  // CAP_TOUR
  else if (G.tour_on)
    displayButton(vid.xres - 8, vid.yres - vid.fsize, dialog_never_keys() ? XLAT('tour menu') : XLAT('(ESC) tour menu'), SDLK_ESCAPE, 16);
  else if (dialog_never_keys())
    displayButton(vid.xres - 8, vid.yres - vid.fsize, (G.separate_status && G.mapeditor_drawplayer) ? XLAT('quest') : XLAT('menu'), G.mapeditor_drawplayer ? SDLK_ESCAPE : 'v'.charCodeAt(0), 16);
  else
    displayButton(vid.xres - 8, vid.yres - vid.fsize, XLAT('(v) menu'), 'v'.charCodeAt(0), 16);

  if (G.touch_interface)
    throw new NotPorted('show_menu_button: touch_interface (mobile)'); // STAGE2-STUB
}

// SDLK_ESCAPE, PSEUDOKEY_NOHINT (hyper.h: 2506; fixed by U2, it was 2501 = PSEUDOKEY_WHEELDOWN): from sdl.ts
import { SDLK_ESCAPE, PSEUDOKEY_NOHINT } from './sdl.ts';

export function normalscreen(): void {
  G.help = '@';

  G.mouseovers = standard_help();

  // CAP_TOUR
  if (G.tour_on) throw new NotPorted('normalscreen: tour::slides'); // STAGE2-STUB

  if (GDIM() === 3 || !outofmap(G.mouseh.h)) G.getcstat = '-'.charCodeAt(0);
  G.cmode = sm.NORMAL | sm.DOTOUR | sm.CENTER;
  if (G.viewdists && G.show_distance_lists) G.cmode |= sm.SIDE | sm.MAYDARK;
  // if(tour::on && (tour::slides[tour::currentslide].flags & tour::SIDE)) cmode |= sm::SIDE;
  gamescreen(); drawStats();

  show_menu_button();
  G.keyhandler = handleKeyNormal;
  G.dialog_key_actions.clear();

  const displayButton = u1fn<(x: number, y: number, name: string, key: number, align: number, rad?: number) => void>('displayButton');
  if (!G.playerfound && !anims_any_on() && !sphere() && !G.no_find_player && G.mapeditor_drawplayer)
    displayButton(G.current_display.xcenter, G.current_display.ycenter, (!dialog_actual_display_keys()) ? XLAT('find the player') : XLAT('press SPACE to find the player'), ' '.charCodeAt(0), 8);

  if (!G.mapeditor_drawplayer && G.playermoved && !G.no_find_player && dialog_actual_display_keys())
    displayButton(G.current_display.xcenter, G.current_display.ycenter, XLAT('move the camera with arrow keys and Home/End'), PSEUDOKEY_NOHINT, 8);

  describeMouseover();
}

// EX vector< function<void()> > screens = { normalscreen }: G.screens (starts empty; drawscreen pushes
// normalscreen when it is empty, as it does in C++ -- the original's initial { normalscreen } is set by
// init_screens below, called by drawscreen)

/** inline void popScreen() { if(isize(screens)>1) screens.pop_back(); } */
export function popScreen(): void { if (isize(G.screens) > 1) G.screens.pop(); }
/** inline void popScreenAll() { while(isize(screens)>1) popScreen(); } */
export function popScreenAll_graph(): void { while (isize(G.screens) > 1) popScreen(); }

/** cfunction current_screen_cfunction(): the function on top of the stack (std::function::target: only plain
 *  functions; the port's screens are all functions) */
export function current_screen_cfunction(): (() => void) | null {
  if (!G.screens.length) return null;
  return G.screens[G.screens.length - 1];
}

// EX flagtype cmode; EX bool dont_display_minecount = false; EX color_t titlecolor: G.*

export function drawscreen(): void {
  // online lockstep (ONLINE.md): the frame draws with generators of its own (rand.ts drawing_rng)
  if (G.online_isolated && !drawing_rng.depth) { drawing_rng_begin(); try { drawscreen(); } finally { drawing_rng_end(); } return; }

  // indenter_finish(debug_map, "drawscreen");
  // CAP_GL: GLWRAP;

  const vid = G.vid;
  if (vid.xres === 0 || vid.yres === 0) return;

  calcparam();
  // rug::setVidParam();

  // CAP_GL: if(vid.usingGL) setGLProjection();

  // CAP_XGD: no

  // CAP_VR: vrhr::clear();

  // CAP_SDL
  // CAP_GL: if(!vid.usingGL)
  if (!vid.usingGL)
    SDL_FillSurfaceRect(sdl_srend(), null, G.backcolor);

  // displaynum(vx,100, 0, 24, 0xc0c0c0, celldist(cwt.at), ":");

  G.lgetcstat = G.getcstat;
  G.getcstat = 0; G.inslider = false;

  G.mouseovers = ' ';

  G.cmode = 0n;
  reset_handlers();
  if (!isize(G.screens)) G.screens.push(normalscreen); // pushScreen(normalscreen)
  G.screens[G.screens.length - 1]();

  // !ISMOBILE
  let col = linf[G.cwt.at.land].color;
  if (G.cwt.at.land === laRedRock) col = 0xC00000;
  if (G.titlecolor) col = G.titlecolor;
  if (G.nohelp !== 1) {
    let size = vid.fsize;
    while (size > 3 && textwidth(size, G.mouseovers) > vid.xres) size--;
    G.poly_outline = ((G.backcolor << 8) | 0xFF) >>> 0;
    displayfr(idiv(vid.xres, 2), vid.fsize, 2, size, G.mouseovers, col, 8);
  }

  u1fn<() => void>('drawmessages')();

  const normal = (G.cmode & sm.NORMAL) !== 0n;

  if ((G.havewhat & HF_BUG) && G.darken === 0 && normal) if (G.hive_bugcount[0] || G.hive_bugcount[1] || G.hive_bugcount[2]) for (let k = 0; k < 3; k++)
    displayfr(idiv(vid.xres, 2) + vid.fsize * 5 * (k - 1), vid.fsize * 2, 2, vid.fsize,
      its(G.hive_bugcount[k]), minf[moBug0 + k].color, 8);

  let minefieldNearby = false;
  const mines: number[] = [];
  let tmines = 0;
  for (let p = 0; p < numplayers(); p++) {
    mines[p] = 0;
    const c = playerpos(p);
    if (!c) continue;
    for (const c2 of adj_minefield_cells(c)) {
      if (c2.land === laMinefield)
        minefieldNearby = true;
      if (c2.wall === waMineMine) {
        const ep = false;
        if (!ep) { mines[p]++; tmines++; }
      }
    }
  }

  if ((minefieldNearby || tmines) && !G.items[itOrbAether] && !G.last_gravity_state && G.darken === 0 && normal) {
    if (tmines > 9) tmines = 9;
    const col = minecolors[tmines];

    if (tmines === 7) G.seenSevenMines = true;

    if (!G.dont_display_minecount) for (const p of player_indices())
      displayfr(itrunc(vid.xres * (p + .5) / numplayers()),
        itrunc(G.current_display.ycenter - G.current_display.radius * 3 / 4), 2,
        vid.fsize,
        mines[p] >= minetexts.length ? its(mines[p]) : XLAT(minetexts[mines[p]]), minecolors[mines[p]], 8);

    if (minefieldNearby && !G.shmup_on && G.cwt.at.land !== laMinefield && G.cwt.peek().land !== laMinefield && !G.dont_display_minecount) {
      displayfr(idiv(vid.xres, 2), itrunc(G.current_display.ycenter - G.current_display.radius * 3 / 4 - idiv(vid.fsize * 3, 2)), 2,
        vid.fsize,
        XLAT('WARNING: you are entering a minefield!'),
        col, 8);
    }
  }

  // SDL_UnlockSurface(s);

  glflush();
  // if(debug_map) println(hlog, "swapbuffers");

  // CAP_VR: vrhr::submit();

  // CAP_SDL
  u1fn<() => void>('present_screen')();

  // CAP_VR: vrhr::handoff();

  //printf("\ec");
}

// EX debugflag debug_init_graph = {"init_graph"};

export function restartGraph(): void {
  // indenter_finish di(debug_init_graph, "restartGraph");

  if (!G.autocheat) linepatterns_clearAll();
  if (G.currentmap) resetview();
}

// EX debugflag debug_graph_memory = {"graph_memory"};

/** auto graphcm = addHook(hooks_clearmemory, 0, ...) + addHook(hooks_gamedata, 0, ...): registered in
 *  register_graph (the gamedata hook only stores state for the memory-saving mode, not ported) */
export function register_graph(): void {
  G.hooks_clearmemory.add(0, () => {
    // indenter_finish di(debug_graph_memory, "graph_memory");
    G.mouseover = G.current_display.precise_center = G.lmouseover = null!;
    G.current_display.cellmatrices.clear(); G.current_display.old_cellmatrices.clear(); G.current_display.all_drawn_copies.clear();
    clearAnimations();
  });
  register_graph_swapdim();
}

export function drawBug(cw: cellwalker, col: number): void {
  // CAP_SHAPES
  initquickqueue();
  let V = ggmatrix(cw.at);
  if (cw.spin) V = smul(V, ddspin180(cw.at, cw.spin));
  queuepoly(V, cgi().shBugBody, col);
  quickqueue();
}

export function inscreenrange_actual(c: cell): boolean {
  if (GDIM() === 3) return true;
  const h1 = [0, 0, 0, 0]; applymodel(smulh(ggmatrix(c), tile_center()), h1);
  if (invalid_point(h1)) return false;
  const hscr = toscrcoord(h1);
  const x = hscr[0], y = hscr[1];
  const cd = G.current_display;
  if (x > cd.xtop + cd.xsize) return false;
  if (x < cd.xtop) return false;
  if (y > cd.ytop + cd.ysize) return false;
  if (y < cd.ytop) return false;
  return true;
}

export function inscreenrange(c: cell): boolean {
  if (sphere()) return true;
  if (euclid()) return celldistance(G.current_display.precise_center, c) <= get_sightrange_ambush() && inscreenrange_actual(c);
  if (nonisotropic()) return G.current_display.cellmatrices.has(c);
  if (G.geometry === gCrystal344) return G.current_display.cellmatrices.has(c) && inscreenrange_actual(c);
  const hd = heptdistance(G.current_display.precise_center, c);
  if (hd <= 1) return true;
  return hd <= 8 && inscreenrange_actual(c);
}

// MAXMDIM >= 4: auto hooksw = addHook(hooks_swapdim, 100, ...): registered at the end of register_graph (it is
// at the end of graph.cpp)
function register_graph_swapdim(): void {
  G.hooks_swapdim.add(100, () => { clearAnimations(); G.current_display.cellmatrices.clear(); G.current_display.old_cellmatrices.clear(); G.current_display.all_drawn_copies.clear(); });
}

// --- graph-player.cpp / graph-item.cpp functions that stage-1 files import from here (ported by D4) ---
export { drawSafety } from './graph-player.ts';
export { orb_auxiliary_color } from './graph-item.ts';

// --- helpers ---

/** void downseek_t::reset() (celldrawer.cpp HDR) */
export function downseek_reset(): void {
  const ds = G.downseek;
  ds.qty = 0;
  ds.total = [...Hypc];
  ds.depth = 0;
  ds.best = null!;
}

/** keyhandler = [] (int sym, int uni) {}; joyhandler = ...; texthandler = ignore_text (control.cpp reset_handlers) */
function reset_handlers(): void {
  G.keyhandler = () => { };
}

/** the U1 functions not there yet: looked up in basegraph.ts when called */
function u1fn<F>(name: string): F {
  const f = (basegraph_m as Record<string, unknown>)[name];
  if (typeof f !== 'function') throw new NotPorted(`${name} (package U1)`);
  return f as F;
}

/** get_sightrange_ambush() (basegraph.cpp): max(get_sightrange(), ambush::distance) */
function get_sightrange_ambush(): number { return Math.max(getDistLimit() + G.sightrange_bonus, G.ambush_distance); }
