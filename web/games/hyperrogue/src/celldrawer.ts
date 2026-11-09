// celldrawer.cpp of HyperRogue 13.1o: drawing one cell (struct celldrawer): its colours by land and wall, the
// floor shape of the land, walls (flat and spatial), the sidewalls, features (bushes, boats, traps, mines, ...),
// the item and monster calls, the grid, the map effects (air currents, lightning, whirlwinds, bow paths,
// gravity) and the ASCII glyph when nothing else is drawn. Stage 2, package D3 (PORTING-STAGE2.md).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Not ported (STAGE2-STUB, throwing NotPorted when reached): the 3D branches (WDIM == 3 walls,
// draw_features_and_walls_3d, 2D-in-3D GDIM == 3, the ceiling, the radar), textures, the map editor's user
// shapes, debug labels of other geometries. FOR_LIST(li, c->contents) is shmup's (stage 3): nothing in stage 2.
// `dynamicval<qfloorinfo> x(qfi, qfi)` is a copy of qfi restored at the end of the block (qfi_save/qfi_restore).
// In C++ `celldrawer` is a struct with `#define c` style members; here a class with the same fields.
import { G } from './globals.ts';
import { NotPorted, among, isize, PPR, callhandlers, OUTLINE_TRANS, OUTLINE_TREASURE, OUTLINE_ORB, OUTLINE_ENEMY,
  OUTLINE_FRIEND, GUNRANGE } from './hyper.ts';
import { itrunc, c_sin, c_cos } from './cpp.ts';
import type { cell } from './locations.ts';
import { cellwalker, NODIR, NOBARRIERS, NOBARRIERS2 } from './locations.ts';
import {
  type shiftmatrix, type transmatrix, type hyperpoint, Id, Mirror, C0, TAU, M_PI, degree, smul, smulh, tmul,
  tC0, tC0_sm, hdist0_sp, xpush, det, eqmatrix, inverse_shift, xyzscale,
  hadd, hmul, unshift, orthogonal_move,
} from './hyperpoint.ts';
import { spin, xspinpush, xspinpush0 } from './embeddings.ts';
import { tmulh, zlevel, cyclefix } from './hyperpoint.ts';
import { Hypc, xpush0, xtangent, rspintox, gpushxto0, rgpushxto0, hneg, hsub, normalize } from './hyperpoint.ts';
import { bow_bpFIRST, bow_bpLAST, bow_bpCOPIED } from './crossbow.ts';
import { frac } from './util.ts';
import { getcs } from './config.ts';
import {
  GDIM, WDIM, sphere, euclid, PURE, BITRUNCATED, GOLDBERG, S3, S7, weirdhyperbolic, stdhyperbolic, eubinary,
  STDVAR, gEuclidSquare, mproduct, embedded_plane,
} from './classes.ts';
import { bt_in } from './binary-tiling.ts';
import { arcm_in } from './archimedean.ts';
import { euc_in } from './euclid.ts';
import { hat_in } from './aperiodic-hat.ts';
import { kite_in } from './kite.ts';
import { fake_in } from './fake.ts';
import { cgi, geom3_actual_wall_height, geom3_factor_to_lev, type floorshape, type hpcshape,
  SIDE_INFDEEP, SIDE_DEEP, SIDE_SHALLOW, SIDE_WATERLEVEL, SIDE_FLOOR, SIDE_RED1, SIDE_RED2, SIDE_RED3, SIDE_RED4,
  SIDE_WALL, side_to_prio_top } from './geometry.ts';
import { qfi, type qfloorinfo, set_floor, set_floor_h, set_floor_t, draw_qfi, draw_floorshape, draw_shapevec } from './floorshapes.ts';
import { queuepoly, queuepolyat, queueline, queuestr_V, queuestrn, curvepoint, queuecurve, OUTLINE_DEFAULT } from './drawing.ts';
import { gradient, darkena, darkena3, darkened, darkenedby, part, set_part, firecolor, weakfirecolor, fghostcolor,
  watercolor } from './colors.ts';
import {
  winf, iinf, minf, linf,
  laOcean, laOceanWall, laVariant, laKraken, laDocks, laAlchemist, laWhirlpool, laLivefjord, laBurial, laTrollheim,
  laBarrier, laCrossroads2, laCrossroads3, laCrossroads4, laCrossroads5, laCrossroads6, laMasterCrossroads, laRose,
  laPower, laWildWest, laHalloween, laRedRock, laDragon, laStorms, laTerracotta, laMercuryRiver, laDesert, laMotion,
  laGraveyard, laWineyard, laRlyeh, laHell, laCrossroads, laJungle, laFrog, laCursed, laDice, laCA, laWet, laRuins,
  laDual, laBrownian, laVolcano, laMinefield, laCaribbean, laReptile, laCaves, laEmerald, laDeadCaves, laMirror,
  laMirrorWall, laMirrorOld, laDryForest, laMountain, laCanvas, laPalace, laElementalWall, laZebra, laHive,
  laSwitch, laTortoise, laOvergrown, laClearing, laTemple, laWhirlwind, laHunting, laIvoryTower, laWestWall,
  laDungeon, laEndorian, laPrairie, laCamelot, laIce, laCocytus, laBlizzard, laEclectic, laSnakeNest, laNone,
  laMirrored, laMirrorWall2, laMirrored2, laWarpCoast, laEFire, laEAir, laEWater, laEEarth, laHauntedWall,
  laHaunted, laHauntedBorder, laBull, laAsteroids, laMotion as _laMotion,
  waMineMine, waMineUnknown, waReptileBridge, waShallow, waAncientGrave, waFreshGrave, waMagma, waCIsland,
  waCIsland2, waCavefloor, waCavewall, waPlatform, waWaxWall, waClosedGate, waOpenGate, waTrapdoor, waBigTree,
  waSmallTree, waColumn, waTrunk, waCanopy, waSolidBranch, waWeakBranch, waFrozenLake, waLake, waNone, waSulphur,
  waSulphurC, waMercury, waDock, waThumperOn, waThumperOff, waBonfireOff, waRoundTable, waExplosiveBarrel,
  waCrateCrate, waCrateTarget, waCrateOnTarget, waDeadTroll2, waPetrifiedBridge, waPetrified, waFloorA, waFloorB,
  waBoat, waEternalFire, waFire, waPartialFire, waBurningDock, waDeadfloor, waMineOpen, waEditStatue, waGlass,
  waRed1, waTower, moBug0, waWarpGate, waVinePlant, waIcewall, waDeepWater, waMirror, waCloud, waLadder, waTerraWarrior,
  waStrandedBoat, waBigStatue, waClosePlate, waOpenPlate, waCamelotMoat, waSea, waBubble, waRose, waMirrorWall,
  waFan, waArrowTrap, waFireTrap, waGiantRug, waBarrier, waChasm, waCamelot, waReptile, waBigBush, waSmallBush,
  moForestTroll, moFriendlyGhost, moMimic, moMutant, moSlime, moTortoise,
  itOrbInvis, itOrbWater, itOrbEmpathy, itRevolver, itCompass, itOrbLightning, itOrbGravity, itNone,
  type eItem, type eMonster,
} from './content.ts';
import {
  isWateryOrBoat, isWarpedType, useHeatColoring, realred, snakelevel, isElemental, isHaunted, isWatery, highwall,
  inmirror, get_spatial_info, isGrave, conegraph, cellHalfvine, halfvine_direction, isFire, isThumper, hasTimeout,
  isDie, isMultitile, isFriendly, isGravityLand, isTroll, isReptile, isMetalBeast, isDragon, isKraken, mirrorcolor,
  noHighlight,
} from './flags.ts';
import { celldistAlt, celldist, getBits, getDistLimit, valence, RPV_MODULO, RPV_ZEBRA, RPV_EMERALD, RPV_CYCLE } from './cell.ts';
import { ls_any_chaos, ls_hv_structure, ls_single } from './landlock.ts';
import { kraken_pseudohept, warptype, geosupport_chessboard, chessvalue, geosupport_threecolor, pattern_threecolor,
  pseudohept, emeraldval, ctof, patterns_getpatterninfo, patterns_PAT_ZEBRA,
  patterns_PAT_EMERALD, patterns_PAT_TYPES, patterns_PAT_COLORING, patterns_SPF_SYM0123, patterns_SPF_CHANGEROT,
  geosupport_football } from './pattern2.ts';
import { brownian_get_color, mine_marked_safe, mine_marked_mine, brownian_level } from './complex2.ts';
import { lavatide, checkTide, isWarped, cellEdgeUnstable, coastvalEdge, isCentralTrap } from './mapeffects.ts';
import { edgeDepth, celldistAltRelative, temple_layer_size, getHauntedDepth, towerval, coastval } from './bigstuff.ts';
import { prairie_isriver, prairie_get_val, prairie_nearriver, whirlwind_fzebra3, tortoise_shading_on, tortoise_getb,
  mirror_reflect, mirror_reflect_view, mirror_mirrordir, windmap_getId, sword_at, whirlwind_calcdirs } from './complex.ts';
import { conditional_flip_slime, gun_targets } from './attack.ts';
import { rosedist, airdist, calcAirdir, againstWind } from './passable.ts';
import { player_positions, isPlayerOn, player_indices, playerpos } from './pcmove.ts';
import { multi_playerActive } from './multi.ts';
import { hdist_sp } from './hyperpoint.ts';
import { celldistance } from './cell.ts';
import { active_switch } from './game.ts';
import { itemHidden, itemHiddenFromSight } from './items.ts';
import { in_line_of_sight, in_line_of_sight_for_player } from './environment.ts';
import { ggmatrix, ddspin, cellgfxdist, get_warp_corner } from './geometry2.ts';
import { UNKNOWN } from './legacy.ts';
import { sintick, ptick, fractick, drawParticle, animations, LAYER_BOAT, LAYER_SMALL, LAYER_THROW, applyAnimation,
  celldrawer_draw_fallanims, anim_at } from './animations.ts';
import { rand } from './rand.ts';
import { zgrad0, back_to_view, confusingGeometry, spherity_T, mirrorif_sm } from './hypgraph.ts';
import { drawMonster, drawMonsterType, drawTerraWarrior, tortoise_getMatchColor, drawstar } from './graph-monster.ts';
import { drawItemType, mark_compass } from './graph-item.ts';
import { set_blizzard_frame } from './blizzard.ts';
import {
  minecolors, nestcolors, reptilecolor, magma_color, floorShadow, escherSidewall, placeSidewall, applyPatterndir,
  applyDowndir, use_warp_graphics, countMinesAround, omf_sm,
} from './graph-wall.ts';
import {
  get_color_auto3, addaura as hr_addaura, ddspin180, at_smart_lof_sm, lpispin, doHighlight, kind_outline,
  gridcolor, gridline_v, has_nice_dual, is_nice_dual, getfd, mousedist, set_detail_level, pushdown, celldistAltPlus,
  hide_player, chei_sm, sm, downseek_reset,
} from './graph.ts';
import { its } from './hprint.ts';
import { mapeditor_drawGhosts } from './mapeditor.ts';
import { gmod } from './hyper.ts';
import { get_corner_position } from './geometry2.ts';

/** struct spatial_info { SIDE top, deep; int levels; int sl; } */
export interface spatial_info { top: number; deep: number; levels: number; sl: number; }

const trapcol = [0x904040, 0xA02020, 0xD00000, 0x303030];
const terracol = [0xD000, 0xE25050, 0xD0D0D0, 0x606060, 0x303030, 0x181818, 0x0080, 0x8080];

export const prairie_colors: number[] = [0x402000, 0x503000];
export const prairie_colors_high_cont: number[] = [0x102030, 0x905010];
export const mountain_colors: number[] = [0x181008 * 2, 0x181008 * 4];
export const tower_colors: number[] = [0x202010, 0x404030];
export const westwall_colors: number[] = [0x211F6F, 0x413F8F];
export const endorian_colors: number[] = [0x202010, 0x404030, 0x0000D0];
export const canopy_colors: number[] = [0x60C060, 0x489048];
export const camelot_cheat_colors: number[] = [0x606060, 0xC0C0C0];
export const haunted_cheat_colors: number[] = [0x609F60, 0xC0FFC0, 0x003F00];

/** return the special colortable for the given cell -- color menu uses this to know that a colortable should be edited */
export function special_colortable_for(c: cell): number[] | null {
  if (c.land === laPrairie && prairie_isriver(c)) return prairie_colors;
  if (c.land === laMountain && !c.wall && (eubinary() || sphere() || c.master.alt)) return mountain_colors;
  if (c.land === laIvoryTower && !c.wall) return tower_colors;
  if (c.land === laWestWall) return westwall_colors;
  if (c.land === laEndorian && !c.wall) return endorian_colors;
  if (c.land === laEndorian && c.wall === waCanopy) return canopy_colors;
  if (c.land === laCamelot && (G.camelotcheat || G.shadingcheat)) return camelot_cheat_colors;
  if (isHaunted(c.land) && G.shadingcheat) return haunted_cheat_colors;
  return null;
}

/* Eclectic City's version of Red Rock is of slightly different color, */
/* to make it different from hot cells */
function eclectic_red(col: number): number {
  if (!G.higher_contrast) {
    col = set_part(col, 0, idiv3(part(col, 2) * 3, 4));
  } else {
    const v = part(col, 0) + part(col, 1) + part(col, 2);
    const t = part(col, 0);
    col = set_part(col, 0, part(col, 1));
    col = set_part(col, 1, part(col, 2));
    col = set_part(col, 2, t + idiv3(v, 3));
  }
  return col;
}
function idiv3(a: number, b: number): number { return Math.trunc(a / b); }

const spinspeed = .75 / 3.14159265358979323846; // .75 / M_PI (hyperpoint.ts is not a leaf module)

export function apply_mine_knowledge(wcol: number, c: cell): number {
  // CAP_COMPLEX2
  if (mine_marked_safe(c))
    return gradient(wcol, 0x40FF40, 0, 0.2, 1);
  if (mine_marked_mine(c))
    return gradient(wcol, 0xFF4040, -1, G.vid.ispeed ? sintick(100) : 1, 1);
  return wcol;
}

export function w_monochromatize(x: number, d: number): number {
  let c = part(x, 2) + part(x, 1) + part(x, 0) + 1;
  c = Math.trunc(c / 3);
  if (d !== 0) c = Math.trunc((c + 2 * 255) / 3);
  return c * 0x10101;
}

/** grid_prec() */
export function grid_prec(): number {
  let prec = sphere() ? 3 : 1;
  prec += G.vid.linequality;
  return prec;
}

// should we draw t-th edge of c, or the opposite edge?
export function pick_for_grid(c: cell, t: number): boolean {
  const c1 = c.move(t);
  if (!c1) return false;
  // removed: if(WDIM == 3 && bt::in() && !sn::in()) return !among(t, 5, 6, 8);
  if (c === c1 && t <= c.c.spin(t)) return true;
  let order = c._id < c1._id; // c < c1 (pointer order: the creation serial, PORTING.md)
  if (G.disksize) throw new NotPorted('pick_for_grid: disk_index (disk geometries)'); // STAGE2-STUB
  return order || isWarped(c.move(t)) || fake_split();
  void order;
}

/** fake::split() { return in() || arb::in_slided(); } (arb::in_slided: false without arbitrary tilings) */
function fake_split(): boolean { return fake_in(); }

// EX int canvasfloor: G.canvasfloor
const caflNone = 0, caflM = 1, caflFull = 2, caflWarp = 3, caflStar = 4, caflCloud = 5, caflCross = 6,
  caflCharged = 7, caflSStar = 8, caflOver = 9, caflTri = 10, caflFeather = 11, caflBarrow = 12, caflNew = 13,
  caflTroll = 14, caflButterfly = 15, caflLava = 16, caflPalace = 17, caflDemon = 18, caflCave = 19,
  caflDesert = 20, caflPower = 21, caflRose = 22, caflTurtle = 23, caflDragon = 24, caflReptile = 25,
  caflHive = 26, caflSwitch = 27, caflTower = 28;
void caflNone; void caflWarp;

// EX bool numerical_minefield; EX int mine_zero_display = 1; EX bool mine_hollow; EX bool mine_markers: G.*

export function draw_mine_numbers(mines: number, V: shiftmatrix, ct6: number): void {
  const hollow = (sh: hpcshape, col: number): void => {
    if (G.mine_hollow) {
      const dc = G.poly_outline;
      G.poly_outline = col;
      try { queuepoly(V, sh, 0); } finally { G.poly_outline = dc; }
    }
    else
      queuepoly(V, sh, col);
  };
  if (mines === 0 && G.mine_zero_display < (WDIM() === 3 ? 1 : 2)) return;
  if (G.numerical_minefield) {
    const label = its(mines);
    const dc = G.poly_outline;
    try {
      if (mines >= isize(minecolors)) G.poly_outline = darkena(minecolors[Math.trunc(mines / isize(minecolors))], 0, 0xFF);
      queuestr_V(V, (mines >= 10 ? .5 : 1) * G.mapfontscale / 100, label, darkened(minecolors[mines]), 8);
    } finally { G.poly_outline = dc; }
  }
  else {
    if (mines >= isize(minecolors)) hollow(cgi().shBigMineMark[ct6], darkena(minecolors[Math.trunc(mines / isize(minecolors))], 0, 0xFF));
    hollow(cgi().shMineMark[ct6], darkena(minecolors[mines], 0, 0xFF));
  }
}

// CAP_COMPLEX2
export function draw_mine_markers(c: cell, V: shiftmatrix): void {
  if (G.mine_markers && !mine_marked_safe(c)) {
    let col = 0xFF4040;
    if (mine_marked_mine(c))
      col = gradient(winf[waMineMine].color, col, -1, G.vid.ispeed ? sintick(100) : 1, 1);
    const dc = G.poly_outline;
    G.poly_outline = ((col << 8) | 0xFF) >>> 0;
    try { queuepoly(V, cgi().shJoint, 0); } finally { G.poly_outline = dc; }
  }
}

/** the state of qfi, for dynamicval<qfloorinfo> */
function qfi_save(): qfloorinfo {
  return { spin: qfi.spin, shape: qfi.shape, fshape: qfi.fshape, tinf: qfi.tinf, usershape: qfi.usershape } as qfloorinfo;
}
function qfi_restore(s: qfloorinfo): void {
  qfi.spin = s.spin; qfi.shape = s.shape; qfi.fshape = s.fshape; qfi.tinf = s.tinf; qfi.usershape = s.usershape;
}

/** orthogonal_move_fol(V, fol) for a shiftmatrix */
const omf = (V: shiftmatrix, fol: number): shiftmatrix => omf_sm(V, fol);

/** V * T for a shiftmatrix and a transmatrix */
const smv = (V: shiftmatrix, T: transmatrix): shiftmatrix => smul(V, T);

/** lightat (graph-player.cpp; set when Orb of Lightning is used) */

// EX int debug_tiles: G.debug_tiles

/** EX shiftmatrix ocwtV */
export let ocwtV: shiftmatrix = { T: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], shift: 0 };

/** cwtV = current_display->player_matrix */
const cd = () => G.current_display;

export class celldrawer {
  c: cell = null!;
  V: shiftmatrix = null!;

  fcol = 0;
  wcol = 0;
  wcol_star = 0;
  asciicol = 0;
  aura_color = 0;
  fd = 0;
  ct6 = 0;
  error = false;
  onradar = false;
  asciichar = 0;
  Vboat: shiftmatrix = null!;
  Vd: shiftmatrix = null!;
  sha: spatial_info = { top: 0, deep: 0, levels: 0, sl: 0 };
  asciiborder = 0;
  asciicol1 = 0;
  asciichar1 = 0;

  addaura(): void {
    hr_addaura(tC0_sm(this.V), darkened(this.aura_color), this.fd);
  }

  setcolors(): void {
    const c = this.c;
    const floorcolors = G.floorcolors;

    this.wcol = this.fcol = winf[c.wall].color;

    if (c.wall === waMineMine)
      this.wcol = this.fcol = winf[waMineUnknown].color;

    // water colors
    if (isWateryOrBoat(c) || c.wall === waReptileBridge) {
      if (c.land === laOcean)
        this.fcol =
          // CAP_FIELD
          (c.landparam > 25 && !ls_any_chaos()) ? (
            0x90 + 8 * sintick(1000, G.windmap_windcodes[windmap_getId(c)] / 256.)
          ) :
          0x1010C0 + itrunc(32 * sintick(500, (ls_any_chaos() ? c.LHU.byte(2) : c.landparam) * spinspeed));
      else if (c.land === laOceanWall)
        this.fcol = 0x2020FF;
      else if (c.land === laVariant)
        this.fcol = 0x002090 + 15 * sintick(300, 0);
      else if (c.land === laKraken) {
        this.fcol = 0x0000A0;
        const mafcol = (kraken_pseudohept(c) ? 64 : 8);
        /* bool nearshore = false; ... */
        this.fcol = this.fcol + mafcol * (4 + sintick(500, ((eubinary() || c.master.alt) ? celldistAlt(c) : 0) * spinspeed)) / 5;
      }
      else if (c.land === laDocks) {
        this.fcol = 0x0000A0;
      }
      else if (c.land === laAlchemist)
        this.fcol = 0x900090;
      else if (c.land === laWhirlpool)
        this.fcol = 0x0000C0 + itrunc(32 * sintick(200, ((eubinary() || c.master.alt) ? celldistAlt(c) : 0) * spinspeed));
      else if (c.land === laLivefjord)
        this.fcol = 0x000080;
      else if (isWarpedType(c.land))
        this.fcol = 0x0000C0 + itrunc((warptype(c) ? 30 : -30) * sintick(600));
      else
        this.fcol = this.wcol;
    }

    else if (c.wall === waShallow)
      this.fcol = 0x40C0C0;

    // floor colors for all the lands
    else switch (c.land) {
      case laBurial: case laTrollheim: case laBarrier: case laOceanWall:
      case laCrossroads2: case laCrossroads3: case laCrossroads4: case laCrossroads5: case laCrossroads6: case laMasterCrossroads:
      case laRose: case laPower: case laWildWest: case laHalloween: case laRedRock:
      case laDragon: case laStorms: case laTerracotta: case laMercuryRiver:
      case laDesert: case laKraken: case laDocks:
      case laMotion: case laGraveyard: case laWineyard: case laLivefjord:
      case laRlyeh: case laHell: case laCrossroads: case laJungle:
      case laAlchemist: case laFrog: case laCursed: case laDice:
        this.fcol = floorcolors[c.land]; break;

      case laCA:
        this.fcol = floorcolors[c.land];
        if (geosupport_chessboard()) {
          if (chessvalue(c)) this.fcol += 0x202020;
        }
        else if (geosupport_threecolor()) {
          this.fcol += 0x202020 * pattern_threecolor(c);
        }
        break;

      case laWet:
        this.fcol = 0x40FF40; break;

      // CAP_COMPLEX2
      case laVariant: {
        const b = getBits(c);
        this.fcol = 0x404040;
        for (let a = 0; a < 21; a++)
          if ((b >> a) & 1)
            this.fcol += G.variant_features[a].color_change;
        if (!G.higher_contrast) {
          if (c.wall === waAncientGrave)
            this.wcol = 0x080808;
          else if (c.wall === waFreshGrave)
            this.wcol = 0x202020;
        }
        break;
      }

      case laRuins:
        this.fcol = pseudohept(c) ? 0xC0E0C0 : 0x40A040;
        break;

      case laDual:
        this.fcol = floorcolors[c.land];
        if (c.landparam === 2) this.fcol = 0x40FF00;
        if (c.landparam === 3) this.fcol = 0xC0FF00;
        break;

      // CAP_COMPLEX2
      case laBrownian: {
        if (c.wall === waNone)
          this.fcol = this.wcol = brownian_get_color(c.landparam);
        break;
      }

      // CAP_FIELD
      case laVolcano: {
        const id = Math.trunc(lavatide(c, -1) / 4);
        if (c.wall === waMagma)
          this.fcol = this.wcol = magma_color(id);
        else if (c.wall === waNone) {
          this.fcol = this.wcol = 0x404040;
          if (id === Math.trunc(255 / 4)) this.fcol = 0xA0A040;
          if (id === Math.trunc(255 / 4) - 1) this.fcol = 0x606040;
        }
        /* { ... } */
        break;
      }

      case laMinefield:
        this.fcol = floorcolors[c.land];
        if (c.wall === waMineMine && ((G.cmode & sm.MAP) || !G.canmove))
          this.fcol = this.wcol = 0xFF4040;
        break;

      case laCaribbean:
        if (c.wall !== waCIsland && c.wall !== waCIsland2)
          this.fcol = floorcolors[c.land];
        else if (G.shadingcheat)
          this.fcol = celldistAlt(c) % 2 ? winf[waCIsland].color : winf[waCIsland2].color;
        break;

      case laReptile:
        this.fcol = reptilecolor(c);
        break;

      case laCaves: case laEmerald: case laDeadCaves:
        this.fcol = 0x202020;
        if (c.land === laEmerald)
          if (c.wall === waCavefloor || c.wall === waCavewall) {
            this.fcol = this.wcol = gradient(winf[waCavefloor].color, 0xFF00, 0, 0.5, 1);
            if (c.wall === waCavewall) this.wcol = 0xC0FFC0;
          }
        break;
      case laMirror: case laMirrorWall: case laMirrorOld:
        if (c.land === laMirrorWall) this.fcol = floorcolors[laMirror];
        else this.fcol = floorcolors[c.land];
        break;
      case laDryForest:
        this.fcol = gradient(0x008000, 0x800000, 0, c.landparam, 10);
        break;
      case laMountain:
        if (eubinary() || sphere() || c.master.alt)
          this.fcol = get_color_auto3(celldistAlt(c), mountain_colors);
        else this.fcol = 0;
        if (c.wall === waPlatform) this.wcol = 0xF0F0A0;
        break;
      case laCanvas:
        this.fcol = c.landparam;
        if (c.wall === waWaxWall) this.wcol = c.landparam;
        break;
      case laPalace:
        this.fcol = floorcolors[c.land];
        if (c.wall === waClosedGate || c.wall === waOpenGate)
          this.fcol = this.wcol;
        break;
      case laElementalWall:
        this.fcol = (linf[c.barleft].color >> 1) + (linf[c.barright].color >> 1);
        break;
      case laZebra:
        this.fcol = floorcolors[c.land];
        if (c.wall === waTrapdoor) this.fcol = 0x808080;
        break;
      case laHive:
        this.fcol = linf[c.land].color;
        if (c.wall === waWaxWall) this.wcol = c.landparam;
        if (G.items[itOrbInvis] && c.wall === waNone && c.landparam)
          this.fcol = gradient(this.fcol, 0xFF0000, 0, c.landparam, 100);
        if (among(c.bardir, NOBARRIERS, NOBARRIERS2) && c.barleft)
          this.fcol = minf[moBug0 + c.barright].color;
        break;
      case laSwitch:
        this.fcol = minf[G.passive_switch].color;
        break;
      case laTortoise:
        this.fcol = tortoise_getMatchColor(getBits(c));
        if (c.wall === waBigTree) this.wcol = 0x709000;
        else if (c.wall === waSmallTree) this.wcol = 0x905000;
        break;
      case laOvergrown: case laClearing:
        this.fcol = floorcolors[c.land];
        if (c.wall === waSmallTree) this.wcol = 0x008060;
        else if (c.wall === waBigTree) this.wcol = 0x0080C0;
        break;
      case laTemple: {
        const d = (eubinary() || c.master.alt) ? celldistAlt(c) : 99;
        if (ls_any_chaos())
          this.fcol = 0x405090;
        else if (d % temple_layer_size() === 0)
          this.fcol = gradient(0x304080, winf[waColumn].color, 0, 0.5, 1);
        //    else if(c->type == 7)
        //      wcol = 0x707070;
        else if (d % 2 === -1)
          this.fcol = 0x304080;
        else
          this.fcol = 0x405090;
        break;
      }

      case laWhirlwind:
        if (c.land === laWhirlwind) {
          const whirlcolors = [0x404040, 0x404080, 0x2050A0, 0x5050C0];
          this.fcol = whirlcolors[whirlwind_fzebra3(c)];
        }
        break;

      case laHunting:
        this.fcol = floorcolors[c.land];
        if (pseudohept(c)) this.fcol = Math.trunc(this.fcol * 3 / 4);
        break;

      case laIvoryTower:
        this.fcol = get_color_auto3(c.landparam, tower_colors);
        break;

      case laWestWall:
        this.fcol = get_color_auto3(c.landparam, westwall_colors);
        break;

      case laDungeon: {
        const lp = c.landparam % 5;
        // xcol = (c->landparam&1) ? 0xD00000 : 0x00D000;
        const lps = [0x402000, 0x302000, 0x202000, 0x282000, 0x382000];
        this.fcol = lps[lp];
        if (c.wall === waClosedGate)
          this.fcol = this.wcol = 0xC0C0C0;
        if (c.wall === waOpenGate)
          this.fcol = this.wcol = 0x404040;
        if (c.wall === waPlatform)
          this.fcol = this.wcol = 0xDFB520;
        break;
      }

      case laEndorian: {
        const clev = G.pd_from.land === laEndorian ? edgeDepth(G.pd_from) : 0;
        // xcol = (c->landparam&1) ? 0xD00000 : 0x00D000;
        this.fcol = get_color_auto3(c.landparam, endorian_colors, 1);
        let ed = edgeDepth(c);
        const sr = get_sightrange_ambush();

        if (clev === UNKNOWN || ed === UNKNOWN)
          this.fcol = endorian_colors[endorian_colors.length - 1];
        else {
          while (ed > clev + sr) ed -= 2;
          while (ed < clev - sr) ed += 2;
          this.fcol = gradient(this.fcol, endorian_colors[endorian_colors.length - 1], clev - sr, ed, clev + sr);
        }
        if (c.wall === waTrunk) this.fcol = winf[waTrunk].color;

        if (c.wall === waCanopy || c.wall === waSolidBranch || c.wall === waWeakBranch) {
          this.fcol = get_color_auto3(c.landparam, canopy_colors);
        }
        break;
      }

      // CAP_FIELD
      case laPrairie:
        if (prairie_isriver(c)) {
          this.fcol = get_color_auto3(prairie_get_val(c),
            G.higher_contrast ? prairie_colors_high_cont : prairie_colors);
        }
        else {
          this.fcol = 0x004000 + 0x001000 * c.LHU.fi.walldist;
          this.fcol += 0x10000 * (255 - Math.trunc(511 / (1 + Math.max(c.LHU.fi.flowerdist, 1))));
          if (ls_hv_structure()) this.fcol = prairie_nearriver(c) ? 0x40FF00 : 0x40D000;
          // fcol += 0x1 * (511 / (1 + max((int) c->LHU.fi.walldist2, 1)));
        }
        break;

      case laCamelot: {
        const d = ((eubinary() || c.master.alt) ? celldistAltRelative(c) : 0);
        // CAP_TOUR
        if (!G.tour_on) G.camelotcheat = false;
        if (G.camelotcheat || G.shadingcheat)
          this.fcol = get_color_auto3(d, camelot_cheat_colors);
        else if (d < 0) {
          this.fcol = floorcolors[c.land];
        }
        else {
          // a nice floor pattern
          const v = emeraldval(c);
          const v0 = (v & ~3);
          let sw = (v & 1) !== 0;
          if (v0 === 8 || v0 === 12 || v0 === 20 || v0 === 40 || v0 === 36 || v0 === 24)
            sw = !sw;
          if (sw)
            this.fcol = 0xC0C0C0;
          else
            this.fcol = 0xA0A0A0;
        }
        break;
      }

      case laIce: case laCocytus: case laBlizzard: case laEclectic:
        if (useHeatColoring(c)) {
          const h = Math.fround(c.LHU.heat); // float h = HEAT(c)
          const l = c.land;

          const colorN04 = l === laCocytus ? 0x4080FF : 0x4040FF;
          const colorN10 = 0x0000FF;
          const color0 = floorcolors[c.land];
          const color02 = 0xFFFFFF;
          const color06 = 0xFF0000;
          const color08 = 0xFFFF00;

          if (h < -1)
            this.wcol = colorN10;
          else if (h < -0.4)
            this.wcol = gradient(colorN04, colorN10, -0.4, h, -1);
          else if (h < 0)
            this.wcol = gradient(color0, colorN04, 0, h, -0.4);
          else if (h < 0.2)
            this.wcol = gradient(color0, color02, 0, h, 0.2);
          // else if(h < 0.4)
          //  wcol = gradient(0xFFFFFF, 0xFFFF00, 0.2, h, 0.4);
          else if (h < 0.6)
            this.wcol = gradient(color02, color06, 0.2, h, 0.6);
          else if (h < 0.8)
            this.wcol = gradient(color06, color08, 0.6, h, 0.8);
          else
            this.wcol = color08;
          if (c.wall === waFrozenLake)
            this.fcol = this.wcol;
          else
            this.fcol = (this.wcol & 0xFEFEFE) >>> 1;
          if (c.wall === waLake)
            this.fcol = this.wcol = (this.wcol & 0xFCFCFC) >>> 2;
        }
        if (realred(c))
          this.wcol = eclectic_red(this.wcol);
        break;

      case laOcean:
        if (ls_any_chaos())
          this.fcol = gradient(0xD0A090, 0xD0D020, 0, c.LHU.byte(2), 30);
        else
          this.fcol = gradient(0xD0D090, 0xD0D020, -1, c_sin(c.landparam), 1);
        break;

      case laSnakeNest: {
        const fv = pattern_threecolor(c);
        this.fcol = nestcolors[fv & 7];
        if (realred(c.wall))
          this.wcol = Math.trunc(this.fcol * (4 + snakelevel(c)) / 4);
        break;
      }

      default:
        if (isElemental(c.land)) this.fcol = linf[c.land].color;
        if (isWarpedType(c.land)) {
          this.fcol = warptype(c) ? 0x80C080 : 0xA06020;
          if (c.wall === waSmallTree) this.wcol = 0x608000;
        }
        if (isHaunted(c.land)) {
          if (G.shadingcheat) {
            const d = getHauntedDepth(c);
            if (d === 0) this.fcol = haunted_cheat_colors[2];
            else this.fcol = get_color_auto3(d, haunted_cheat_colors, 1);
          } else {
            let itcolor = 0;
            for (let i = 0; i < c.type; i++) if (c.move(i) && c.move(i).item)
              itcolor = 1;
            if (c.item) itcolor |= 2;
            this.fcol = floorcolors[laHaunted] + 0x202020 * itcolor;

            for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (c2 && c2.monst === moFriendlyGhost)
              this.fcol = gradient(this.fcol, fghostcolor(c2), 0, .25, 1); }

            if (c.monst === moFriendlyGhost)
              this.fcol = gradient(this.fcol, fghostcolor(c), 0, .5, 1);
          }

          if (!G.higher_contrast) {
            if (c.wall === waSmallTree) this.wcol = 0x004000;
            else if (c.wall === waBigTree) this.wcol = 0x008000;
          }
        }
    }

    /* if(c->land == laCaribbean && (c->wall == waCIsland || c->wall == waCIsland2))
      fcol = wcol = winf[c->wall].color; */

    let fallthrough = false;
    switch (c.wall) {
      case waSulphur: case waSulphurC: case waPlatform: case waMercury: case waDock:
      case waAncientGrave: case waFreshGrave: case waThumperOn: case waThumperOff: case waBonfireOff:
      case waRoundTable: case waExplosiveBarrel:
        // floors become fcol
        this.fcol = this.wcol;
        break;

      case waCrateCrate: case waCrateTarget: case waCrateOnTarget:
        this.fcol = c.landparam;
        break;

      case waDeadTroll2: case waPetrifiedBridge: case waPetrified: {
        const m = (c.wparam & 0xFF) as eMonster;
        if (c.wall === waPetrified || c.wall === waPetrifiedBridge)
          this.wcol = gradient(this.wcol, minf[m].color, 0, .2, 1);
        if (c.wall === waPetrified || isTroll(m)) if (!(m === moForestTroll && c.land === laOvergrown))
          this.wcol = gradient(this.wcol, minf[m].color, 0, .4, 1);
        break;
      }

      case waFloorA: case waFloorB: // isAlch
        this.wcol = winf[conditional_flip_slime(det(this.V.T) < 0, c.wall)].color;

        if (c.item && !(G.history_includeHistory && G.history_infindhistory.has(c)))
          this.fcol = this.wcol = iinf[c.item].color;
        else
          this.fcol = this.wcol;
        break;

      case waBoat:
        if (G.wmascii) this.wcol = 0xC06000;
        break;

      case waEternalFire:
        this.fcol = this.wcol = weakfirecolor(1500);
        break;

      case waFire: case waPartialFire: case waBurningDock:
        this.fcol = this.wcol = firecolor(100);
        break;

      case waDeadfloor: case waCavefloor:
        this.fcol = this.wcol;
        break;

      case waNone:
        if (c.land === laNone)
          this.wcol = this.fcol = 0x101010;
        if (c.land === laHive)
          this.wcol = this.fcol;
        break;

      case waMineUnknown: case waMineMine:
        // CAP_COMPLEX2
        if (!G.mine_markers) this.fcol = this.wcol = apply_mine_knowledge(this.wcol, c);
        fallthrough = true;
        break;

      case waMineOpen:
        fallthrough = true;
        break;

      case waCavewall:
        if (c.land !== laEmerald) this.fcol = winf[waCavefloor].color;
        break;

      case waEditStatue:
        if (c.land === laCanvas) this.wcol = c.landparam;
        else this.wcol = Math.imul(0x125628, c.wparam) & 0xFFFFFF;
        break;

      default:
        break;
    }
    if (fallthrough) { // fallthrough: (waMineOpen)
      if (G.wmblack || G.wmascii) {
        this.wcol &= 0xFEFEFE;
        this.wcol >>>= 1;
      }
      this.fcol = this.wcol;
    }

    /* if(false && isAlch2(c, true)) { ... } */

    if (WDIM() === 2) {
      const rd = rosedist(c);
      if (rd === 1) {
        this.wcol = gradient(0x804060, this.wcol, 0, 1, 3);
        this.fcol = gradient(0x804060, this.fcol, 0, 1, 3);
      }
      if (rd === 2) {
        this.wcol = gradient(0x804060, this.wcol, 0, 2, 3);
        this.fcol = gradient(0x804060, this.fcol, 0, 2, 3);
      }
    }

    if (G.items[itRevolver] && !G.shmup_on) {
      let inrange = c.mpdist <= GUNRANGE;
      if (inrange) {
        inrange = false;
        for (const pc of player_positions())
          for (const c1 of gun_targets(pc)) if (c1 === c)
            inrange = true;
      }
      if (!inrange) {
        this.fcol = gradient(this.fcol, 0, 0, 25, 100);
        this.wcol = gradient(this.wcol, 0, 0, 25, 100);
      }
    }

    if (highwall(c) && !G.wmspatial)
      this.fcol = this.wcol;

    if (G.wmascii && (c.wall === waNone || isWatery(c))) this.wcol = this.fcol;

    if (!G.wmspatial && snakelevel(c) && !realred(c.wall)) this.fcol = this.wcol;

    if (c.wall === waGlass && !G.wmspatial) this.fcol = this.wcol;

    this.wcol_star = this.wcol;

    if (G.festive) {
      const at = G.old_shines.get(c);
      if (at) {
        this.fcol = darkenedby(this.fcol, this.fd);
        this.wcol = darkenedby(this.wcol, this.fd);
        this.fd = 0;
        for (let p = 0; p < 3; p++) {
          this.fcol = set_part(this.fcol, p, Math.min(255, part(this.fcol, p) + Math.trunc(at[p] / 4)));
          this.wcol = set_part(this.wcol, p, Math.min(255, part(this.wcol, p) + Math.trunc(at[p] / 8)));
        }
      }
    }

    if (G.neon_mode === eNeon_illustration) {
      this.fcol = highwall(c) ? w_monochromatize(this.fcol, 0) : w_monochromatize(this.fcol, 1);
      this.wcol = w_monochromatize(this.wcol, 0);
      if (c.land === laWarpCoast && !pseudohept(c) && c.wall === waNone) this.fcol = 0x707070;
    }
  }

  tune_colors(): void {
    const c = this.c;
    if (inmirror(c)) {
      // for debugging
      if (c.land === laMirrored) this.fcol = 0x008000;
      if (c.land === laMirrorWall2) this.fcol = 0x800000;
      if (c.land === laMirrored2) this.fcol = 0x000080;
    }

    for (let k = 0; k < G.inmirrorcount; k++) {
      this.wcol = gradient(this.wcol, 0xC0C0FF, 0, 0.2, 1);
      this.fcol = gradient(this.fcol, 0xC0C0FF, 0, 0.2, 1);
    }

    this.aura_color = this.fcol;

    if (G.peace_on && G.peace_hint && (c.land !== laTortoise || !tortoise_shading_on())) {
      const d =
        (c.land === laCamelot || (c.land === laCaribbean && celldistAlt(c) <= 0) || (c.land === laPalace && celldistAlt(c))) ? celldistAlt(c) :
          celldist(c);

      const dc =
        0x10101 * (127 + itrunc(127 * sintick(200, d * spinspeed)));
      this.wcol = gradient(this.wcol, dc, 0, .3, 1);
      this.fcol = gradient(this.fcol, dc, 0, .3, 1);
    }
  }

  getSnakelevColor(i: number, last: number): number {
    const c = this.c;
    let col: number;
    if (c.wall === waTower)
      col = 0xD0D0D0 - i * 0x101010;
    else if (c.land === laSnakeNest)
      return darkena(Math.trunc(nestcolors[pattern_threecolor(c)] * (5 + i) / 4), 0, 0xFF);
    // CAP_COMPLEX2
    else if (c.land === laBrownian)
      col = brownian_get_color(c.landparam % brownian_level + (i + 1) * brownian_level);
    else if (i === last - 1)
      col = this.wcol;
    else {
      col = winf[waRed1 + i].color;
      if (c.land === laEclectic)
        col = eclectic_red(col);
    }
    if (!G.higher_contrast)
      return darkena(col, this.fd, 0xFF);
    else
      return darkena(col, 0, 0xFF);
  }

  draw_wallshadow(): void {
    if (!G.noshadow && qfi.fshape) {
      const p = G.poly_outline;
      G.poly_outline = OUTLINE_TRANS;
      try { draw_shapevec(this.c, this.V, qfi.fshape.shadow, SHADOW_WALL, GDIM() === 3 ? PPR.TRANSPARENT_SHADOW : PPR.WALLSHADOW); }
      finally { G.poly_outline = p; }
    }
  }

  draw_wall(): void {
    const c = this.c, V = this.V;

    if (G.no_wall_rendering) return;

    if (GDIM() === 3 && WDIM() === 2) {
      throw new NotPorted('draw_wall: 2D in 3D'); // STAGE2-STUB (3D)
    }

    this.aura_color = this.wcol;
    const wcol0 = this.wcol;
    let starcol = this.wcol_star;
    if (c.wall === waWarpGate) starcol = 0;
    if (c.wall === waVinePlant) starcol = 0x60C000;

    if (c.wall === waClosedGate) {
      let hdir = 0;
      for (let i = 0; i < c.type; i++) if (c.move(i) && c.move(i).wall === waClosedGate)
        hdir = i;
      const V1 = smv(V, ddspin180(c, hdir));

      if (G.wmspatial) {
        queuepolyat(V1, cgi().shPalaceGate, darkena(this.wcol, 0, 0xFF), G.wmspatial ? PPR.WALL_DECO : PPR.WALL);
        const layers = 2 << G.detaillevel;
        for (let z = 1; z < layers; z++) {
          const zg = zgrad0(0, geom3_actual_wall_height(), z, layers);
          queuepolyat(xyzscale_sm(V1, zg, zg), cgi().shPalaceGate, darkena(this.wcol, 0, 0xFF), G.wmspatial ? PPR.WALL_DECO : PPR.WALL);
        }
      }

      const V2 = omf(V1, G.wmspatial ? cgi().WALL : 1);

      queuepolyat(V2, cgi().shPalaceGate, darkena(this.wcol, 0, 0xFF), G.wmspatial ? PPR.WALL_DECO : PPR.WALL);
      starcol = 0;
      return;
    }

    const shThisWall = isGrave(c.wall) ? cgi().shCross : cgi().shWall[this.ct6];

    let V1 = V;
    if (shThisWall === cgi().shCross) {
      const si = patterns_getpatterninfo(c, patterns_PAT_ZEBRA, patterns_SPF_SYM0123);
      V1 = smv(V, applyPatterndir(c, si));
    }

    if (conegraph(c)) {
      const layers = 2 << G.detaillevel;
      for (let z = 1; z < layers; z++) {
        const zg = zgrad0(0, geom3_actual_wall_height(), z, layers);
        draw_qfi(c, xyzscale_sm(V, zg * (layers - z) / layers, zg),
          darkena(gradient(0, this.wcol_star, -layers, z, layers), 0, 0xFF), PPR.WALL_DECO);
      }
      floorShadow(c, V, SHADOW_WALL);
    }

    else if (true) {
      if (!G.wmspatial) {
        if (starcol) queuepoly(V1, shThisWall, darkena(starcol, 0, 0xFF));
      }
      else {
        const Vdepth = omf(V1, cgi().WALL);
        let alpha = 0xFF;
        if (c.wall === waIcewall)
          alpha = 0xC0;

        if (starcol && !(G.wmescher && c.wall === waPlatform))
          queuepolyat(Vdepth, shThisWall, darkena(starcol, 0, 0xFF), PPR.WALL_DECO);

        draw_qfi(c, Vdepth, darkena(wcol0, this.fd, alpha), PPR.WALL_TOP);
        floorShadow(c, V, SHADOW_WALL);
      }
    }
  }

  draw_boat(): void {
    const c = this.c, V = this.V;
    const footphase = { v: 0 };
    if (WDIM() === 3 && c === G.cwt.at && hide_player()) return;
    const magical = G.items[itOrbWater] && (isPlayerOn(c) || (isFriendly(c) && G.items[itOrbEmpathy]));
    const outcol = magical ? watercolor(0) : 0xC06000FF;
    const incol = magical ? 0x0060C0FF : 0x804000FF;
    let nospin = false;

    if (WDIM() === 3) {
      throw new NotPorted('draw_boat: 3D'); // STAGE2-STUB (3D)
    }

    const Vb = { v: this.Vboat };
    if (G.wmspatial && c.wall === waBoat) {
      nospin = c.wall === waBoat && applyAnimation(c, Vb, footphase, LAYER_BOAT);
      if (!nospin && c.mondir !== NODIR) Vb.v = smv(Vb.v, ddspin180(c, c.mondir));
      queuepolyat(Vb.v, cgi().shBoatOuter, outcol, PPR.BOATLEV);
      Vb.v = V;
    }
    if (c.wall === waBoat) {
      nospin = applyAnimation(c, Vb, footphase, LAYER_BOAT);
    }
    if (!nospin && c.mondir !== NODIR)
      Vb.v = smv(Vb.v, ddspin180(c, c.mondir));
    else {
      const Vx = { v: null! as shiftmatrix };
      if (applyAnimation(c, Vx, footphase, LAYER_SMALL))
        animations[LAYER_SMALL].get(c)!.footphase = 0;
    }
    this.Vboat = Vb.v;
    if (G.wmspatial && GDIM() === 2)
      queuepolyat(omf(this.Vboat, (cgi().WATERLEVEL + cgi().FLOOR) / 2), cgi().shBoatOuter, outcol, PPR.BOATLEV2);
    if (GDIM() === 3) {
      throw new NotPorted('draw_boat: 3D'); // STAGE2-STUB (3D)
    }
    else {
      queuepoly(this.Vboat, cgi().shBoatOuter, outcol);
      queuepoly(this.Vboat, cgi().shBoatInner, incol);
    }
  }

  draw_grid(): void {
    const c = this.c, V = this.V;

    const prec = grid_prec();

    if (G.inmirrorcount) return;

    if (G.vid.grid || (c.land === laAsteroids && !(WDIM() === 2 && GDIM() === 3))) { /* */ } else return;

    const lw = G.vid.linewidth;
    try {
      G.vid.linewidth *= G.vid.multiplier_grid;
      G.vid.linewidth *= cgi().scalefactor;

      const maxt = c.type;
      // if(arb::apeirogon_hide_grid_edges && arb::is_apeirogonal(c)) maxt -= 2; (arbitrary tilings)

      if (isWarped(c) && has_nice_dual()) {
        if (pseudohept(c)) for (let t = 0; t < c.type; t++) if (isWarped(c.move(t)))
          gridline_v(V, get_warp_corner(c, t % c.type), get_warp_corner(c, (t + 1) % c.type), gridcolor(c, c.move(t)), prec);
        return;
      }

      for (let t = 0; t < maxt; t++)
        if (pick_for_grid(c, t))
          this.draw_grid_edge(t, gridcolor(c, c.move(t)), prec);
    } finally { G.vid.linewidth = lw; }
  }

  draw_grid_edge(t: number, col: number, prec: number): void {
    const c = this.c, V = this.V;

    // MAXMDIM == 4
    if (WDIM() === 3) {
      throw new NotPorted('draw_grid_edge: 3D'); // STAGE2-STUB (3D)
    }
    // CAP_BT
    if (bt_in() && WDIM() === 2) {
      throw new NotPorted('draw_grid_edge: binary tiling'); // STAGE2-STUB (other geometries)
    }
    gridline_v(V, get_corner_position(c, t % c.type), get_corner_position(c, (t + 1) % c.type), col, prec);
  }

  draw_halfvine(): void {
    const c = this.c, V = this.V;

    const i = halfvine_direction(c);

    qfi.spin = ddspin(c, i, M_PI / S3());
    const V2 = smv(V, qfi.spin);

    if (G.wmspatial && G.wmescher && GDIM() === 2) {
      set_floor_h(cgi().shSemiFeatherFloor[0]);
      const dk = 1;
      const vcol = winf[waVinePlant].color;
      draw_qfi(c, omf(V2, cgi().WALL), darkena(vcol, dk, 0xFF), PPR.WALL_DECO);
      escherSidewall(c, SIDE_WALL, V2, darkena(gradient(0, vcol, 0, .8, 1), dk, 0xFF));
      queuepoly(V2, cgi().shSemiFeatherFloor[1], darkena(this.fcol, dk, 0xFF));
      set_floor(cgi().shFeatherFloor);
    }

    else if (G.wmspatial || GDIM() === 3) {
      const shar: floorshape = GDIM() === 3 ? cgi().shFullFloor : G.wmplain ? cgi().shFloor : cgi().shFeatherFloor;

      set_floor(shar);

      const vcol = winf[waVinePlant].color;
      const vcol2 = gradient(0, vcol, 0, .8, 1);

      const Vdepth = omf(V2, cgi().WALL);

      queuepolyat(GDIM() === 2 ? Vdepth : V2, cgi().shSemiFloor[0], darkena(vcol, this.fd, 0xFF), PPR.WALL_DECO);
      if (!G.noshadow) {
        const p = G.poly_outline;
        G.poly_outline = OUTLINE_TRANS;
        try { queuepolyat(smv(V2, spin(120 * degree)), cgi().shSemiFloorShadow, SHADOW_WALL, GDIM() === 2 ? PPR.WALLSHADOW : PPR.TRANSPARENT_SHADOW); }
        finally { G.poly_outline = p; }
      }
      if (qfi.fshape) {
        queuepolyat(V2, cgi().shSemiFloorSide[SIDE_WALL], darkena(vcol2, this.fd, 0xFF), PPR.WALL_SIDE);
        if (GDIM() === 3) {
          throw new NotPorted('draw_halfvine: 3D textures'); // STAGE2-STUB (3D)
        }
      }

      if (cgi().validsidepar[SIDE_WALL]) for (let j = 0; j < c.type; j++) {
        const c2 = c.move(j);
        if (!c2) continue;
        const dis = gmod(i - j, 6);
        if (dis !== 1 && dis !== 5) continue;
        if (placeSidewall(c, j, SIDE_WALL, V, darkena(vcol2, this.fd, 0xFF))) break;
      }
    }

    else {
      let shar = cgi().shSemiFeatherFloor;

      if (G.wmblack) shar = cgi().shSemiBFloor;
      if (G.wmplain) shar = cgi().shSemiFloor;

      queuepoly(V2, shar[0], darkena(winf[waVinePlant].color, this.fd, 0xFF));

      set_floor_t(qfi.spin, shar[1]);
    }
  }

  draw_mirrorwall(): void {
    const c = this.c, V = this.V;
    let d = mirror_mirrordir(c);
    let onleft = c.type === 7;
    if (c.type === 7 && c.barleft === laMirror)
      onleft = !onleft;
    if (c.type === 6 && d !== -1 && c.move(d).barleft === laMirror)
      onleft = !onleft;
    if (PURE()) onleft = !onleft;

    if (d === -1) {
      for (d = 0; d < c.type; d++)
        if (c.move(d) && c.modmove(d + 1) && c.move(d).land === laMirrorWall && c.modmove(d + 1).land === laMirrorWall)
          break;
      qfi.spin = ddspin(c, d, 0);
      const V2 = smv(V, qfi.spin);
      if (!G.wmblack) for (let d = 0; d < c.type; d++) {
        G.inmirrorcount += d;
        queuepolyat(smv(V2, spin(d * M_PI / S3())), cgi().shHalfFloor[2], darkena(this.fcol, this.fd, 0xFF), PPR.FLOORa);
        // MAXMDIM >= 4: GDIM == 3 && camera_level > cgi.WALL && pmodel == mdPerspective (3D)
        G.inmirrorcount -= d;
      }
      if (GDIM() === 3) {
        throw new NotPorted('draw_mirrorwall: 3D'); // STAGE2-STUB (3D)
      }
      else if (G.wmspatial) {
        const layers = 2 << G.detaillevel;
        for (let z = 1; z < layers; z++)
          queuepolyat(omf(V2, zgrad0(0, geom3_actual_wall_height(), z, layers)), cgi().shHalfMirror[2], 0xC0C0C080, PPR.WALL_SIDE);
      }
      else
        queuepolyat(V2, cgi().shHalfMirror[2], 0xC0C0C080, PPR.WALL_TOP);
    }
    else {
      qfi.spin = ddspin180(c, d);
      const V2 = smv(V, qfi.spin);
      if (!G.wmblack) {
        G.inmirrorcount++;
        queuepolyat(mirrorif_sm(V2, !onleft), cgi().shHalfFloor[this.ct6], darkena(this.fcol, this.fd, 0xFF), PPR.FLOORa);
        G.inmirrorcount--;
        queuepolyat(mirrorif_sm(V2, onleft), cgi().shHalfFloor[this.ct6], darkena(this.fcol, this.fd, 0xFF), PPR.FLOORa);
      }

      if (GDIM() === 3)
        throw new NotPorted('draw_mirrorwall: 3D'); // STAGE2-STUB (3D)
      else if (G.wmspatial) {
        const layers = 2 << G.detaillevel;
        for (let z = 1; z < layers; z++)
          queuepolyat(omf(V2, zgrad0(0, geom3_actual_wall_height(), z, layers)), cgi().shHalfMirror[this.ct6], 0xC0C0C080, PPR.WALL_DECO);
      }
      else
        queuepolyat(V2, cgi().shHalfMirror[this.ct6], 0xC0C0C080, PPR.WALL_TOP);
    }
  }

  set_land_floor(Vf: shiftmatrix): void {
    const c = this.c, V = this.V, fd = this.fd;
    const g = cgi();
    switch (c.land) {
      case laCanvas:
        switch (G.canvasfloor) {
          case caflM: set_floor(g.shMFloor); break;
          case caflFull: set_floor(g.shFullFloor); break;
          //      case caflWarp is warped floor
          case caflStar: set_floor(g.shStarFloor); break;
          case caflCloud: set_floor(g.shCloudFloor); break;
          case caflCross: set_floor(g.shCrossFloor); break;
          case caflCharged: set_floor(g.shChargedFloor); break;
          case caflSStar: set_floor(g.shSStarFloor); break;
          case caflOver: set_floor(g.shOverFloor); break;
          case caflTri: set_floor(g.shTriFloor); break;
          case caflFeather: set_floor(g.shFeatherFloor); break;
          case caflBarrow: set_floor(g.shBarrowFloor); break;
          case caflNew: set_floor(g.shNewFloor); break;
          case caflTroll: set_floor(g.shTrollFloor); break;
          case caflButterfly: set_floor(g.shButterflyFloor); break;
          case caflLava: set_floor(g.shLavaFloor); break;
          case caflPalace: set_floor(g.shPalaceFloor); break;
          case caflDemon: set_floor(g.shDemonFloor); break;
          case caflCave: set_floor(g.shCaveFloor); break;
          case caflDesert: set_floor(g.shDesertFloor); break;
          case caflPower: set_floor(g.shPowerFloor); break;
          case caflRose: set_floor(g.shRoseFloor); break;
          case caflTurtle: set_floor(g.shTurtleFloor); break;
          case caflDragon: set_floor(g.shDragonFloor); break;
          case caflReptile: this.set_reptile_floor(V, this.fcol); break;
          case caflHive:
            if (c.wall !== waFloorB && c.wall !== waFloorA && c.wall !== waMirror && c.wall !== waCloud && this.sha.top === SIDE_FLOOR) {
              set_floor(g.shFloor);
              if (GDIM() === 2) {
                draw_floorshape(c, V, g.shMFloor, darkena(this.fcol, fd + 1, 0xFF), PPR.FLOORa);
                draw_floorshape(c, V, g.shMFloor2, darkena(this.fcol, this.fcol === (c.landparam >>> 0) ? fd : fd + 1, 0xFF), PPR.FLOORb);
              }
            }
            else
              set_floor(g.shFloor);
            break;
          case caflSwitch:
            set_floor(g.shSwitchFloor);
            if (this.sha.top === SIDE_FLOOR && ctof(c) && STDVAR() && !arcm_in() && !bt_in() && GDIM() === 2) for (let i = 0; i < c.type; i++)
              queuepoly(smv(smv(Vf, ddspin(c, i, M_PI / S7())), xpush(g.rhexf)), g.shSwitchDisk, darkena(this.fcol, fd, 0xFF));
            break;
          case caflTower: this.set_towerfloor(celldist); break;
          default:
            set_floor(g.shFloor); break;
        }
        break;

      case laPrairie:
      case laAlchemist:
        set_floor(g.shCloudFloor);
        break;

      case laJungle:
      case laWineyard:
        set_floor(g.shFeatherFloor);
        break;

      case laFrog:
        if (c.wall === waDeepWater)
          set_floor(g.shFloor);
        else
          set_floor(g.shFeatherFloor);
        break;

      case laZebra:
        this.set_zebrafloor();
        break;

      case laMountain:
        if (G.shmup_on || GDIM() === 3)
          this.shmup_gravity_floor();
        else
          this.set_towerfloor(euclid() ? celldist : c.master.alt ? celldistAltPlus : celldist);
        break;

      case laEmerald:
        this.set_emeraldfloor();
        break;

      case laRlyeh:
      case laTemple:
        set_floor(g.shTriFloor);
        break;

      case laVolcano:
      case laVariant:
      case laEclectic:
        set_floor(g.shLavaFloor);
        break;

      case laRose:
        set_floor(g.shRoseFloor);
        break;

      case laTortoise:
        set_floor(g.shTurtleFloor);
        break;

      case laBurial: case laRuins:
        set_floor(g.shBarrowFloor);
        break;

      case laTrollheim:
        set_floor(g.shTrollFloor);
        break;

      /*case laMountain:
        set_floor(FEATHERFLOOR);
        break; */

      case laGraveyard:
        set_floor(g.shCrossFloor);
        break;

      case laMotion:
        set_floor(g.shMFloor);
        break;

      case laWhirlwind:
      case laEFire: case laEAir: case laEWater: case laEEarth: case laElementalWall:
        set_floor(g.shNewFloor);
        break;

      case laHell:
        set_floor(g.shDemonFloor);
        break;

      case laIce: case laBlizzard:
        set_floor(g.shStarFloor);
        break;

      case laSwitch:
        set_floor(g.shSwitchFloor);
        if (ctof(c) && STDVAR() && !arcm_in() && !bt_in() && GDIM() === 2) for (let i = 0; i < c.type; i++)
          queuepoly(smv(smv(Vf, ddspin(c, i, M_PI / S7())), xpush(g.rhexf)), g.shSwitchDisk, darkena(minf[active_switch()].color, fd, 0xFF));
        break;

      case laStorms:
        set_floor(g.shChargedFloor);
        break;

      case laWildWest:
        set_floor(g.shSStarFloor);
        break;

      case laPower:
        set_floor(g.shPowerFloor);
        break;

      case laCaves:
      case laLivefjord:
      case laDeadCaves:
      case laCursed:
        set_floor(g.shCaveFloor);
        break;

      case laDryForest:
        set_floor(GDIM() === 3 ? g.shFeatherFloor : g.shDesertFloor);
        break;

      case laDesert:
      case laRedRock: case laSnakeNest:
      case laCocytus:
        set_floor(g.shDesertFloor);
        break;

      case laBull:
        set_floor(g.shButterflyFloor);
        break;

      case laCaribbean: case laOcean: case laOceanWall: case laWhirlpool:
        set_floor(g.shCloudFloor);
        break;

      case laKraken:
      case laDocks:
        set_floor(g.shFullFloor);
        break;

      case laPalace: case laTerracotta:
        set_floor(g.shPalaceFloor);
        break;

      case laDragon:
        set_floor(g.shDragonFloor);
        break;

      case laOvergrown: case laClearing: case laHauntedWall: case laHaunted: case laHauntedBorder:
        set_floor(g.shOverFloor);
        break;

      case laMercuryRiver: {
        if (euclid() || !BITRUNCATED() || GDIM() === 3)
          set_floor(g.shFloor);
        else {
          let bridgedir = -1;
          if (c.type === 6) {
            for (let i = 1; i < c.type; i += 2)
              if (pseudohept(c.modmove(i - 1)) && c.modmove(i - 1).land === laMercuryRiver)
                if (pseudohept(c.modmove(i + 1)) && c.modmove(i + 1).land === laMercuryRiver)
                  bridgedir = i;
          }
          if (bridgedir === -1)
            set_floor(g.shPalaceFloor);
          else {
            const bspin = ddspin(c, bridgedir);
            set_floor_t(bspin, g.shMercuryBridge[0]);
            // only needed in one direction
            if (c._id < c.move(bridgedir)._id) { // c < c->move(bridgedir): pointer order (the creation serial)
              const Vbspin = smv(Vf, bspin);
              queuepoly(Vbspin, g.shMercuryBridge[1], darkena(this.fcol, fd + 1, 0xFF));
              if (G.wmspatial) {
                queuepolyat(omf(Vbspin, g.WATERLEVEL), g.shMercuryBridge[1], darkena(gradient(0, winf[waMercury].color, 0, 0.8, 1), 0, 0x80), PPR.WATERLEVEL_TOP);
                queuepolyat(omf(Vbspin, g.DEEP), g.shMercuryBridge[1], darkena(0x202020, 0, 0xFF), PPR.DEEP_TOP);
              }
            }
          }
        }
        break;
      }

      case laHive:
        if (c.wall !== waFloorB && c.wall !== waFloorA && c.wall !== waMirror && c.wall !== waCloud) {
          this.fd = 1;
          set_floor(g.shFloor);
          if (c.wall !== waMirror && c.wall !== waCloud && GDIM() === 2)
            draw_floorshape(c, V, g.shMFloor, darkena(this.fcol, 2, 0xFF), PPR.FLOORa);
          if (c.wall !== waMirror && c.wall !== waCloud && GDIM() === 2)
            draw_floorshape(c, V, g.shMFloor2, darkena(this.fcol, this.fcol === this.wcol ? 1 : 2, 0xFF), PPR.FLOORb);
        }
        else
          set_floor(g.shFloor);
        break;

      case laEndorian:
        if (G.shmup_on || GDIM() === 3)
          this.shmup_gravity_floor();

        else if (c.wall === waTrunk)
          set_floor(g.shFloor);

        else if (c.wall === waCanopy || c.wall === waSolidBranch || c.wall === waWeakBranch)
          set_floor(g.shFeatherFloor);

        else
          this.set_towerfloor();
        break;

      case laIvoryTower: case laDungeon: case laWestWall:
        if (G.shmup_on || GDIM() === 3)
          this.shmup_gravity_floor();
        else
          this.set_towerfloor(ls_hv_structure() ? celldistAltPlus : coastvalEdge);
        break;

      case laBrownian:
        if (among(c.wall, waSea, waBoat))
          set_floor(g.shCloudFloor);
        else
          set_floor(g.shTrollFloor);
        break;

      default:
        set_floor(g.shFloor);
    }
  }

  set_randompattern_floor(): boolean {
    const c = this.c;
    const g = cgi();
    if (isWarpedType(c.land)) return false;
    if (!G.randomPatternsMode) return false;
    if (c.land === laBarrier) return false;
    const j = Math.trunc(G.randompattern[c.land] / 5) % 15;
    const k = G.randompattern[c.land] % RPV_MODULO;
    const k7 = G.randompattern[c.land] % 7;

    if (k === RPV_ZEBRA && k7 < 2) this.set_zebrafloor();
    else if (k === RPV_EMERALD && k7 === 0) this.set_emeraldfloor();
    else if (k === RPV_CYCLE && k7 < 4) this.set_towerfloor(celldist);

    else switch (j) {
      case 0: set_floor(g.shCloudFloor); break;
      case 1: set_floor(g.shFeatherFloor); break;
      case 2: set_floor(g.shStarFloor); break;
      case 3: set_floor(g.shTriFloor); break;
      case 4: set_floor(g.shSStarFloor); break;
      case 5: set_floor(g.shOverFloor); break;
      case 6: set_floor(g.shFeatherFloor); break;
      case 7: set_floor(g.shDemonFloor); break;
      case 8: set_floor(g.shCrossFloor); break;
      case 9: set_floor(g.shMFloor); break;
      case 10: set_floor(g.shCaveFloor); break;
      case 11: set_floor(g.shPowerFloor); break;
      case 12: set_floor(g.shDesertFloor); break;
      case 13: set_floor(g.shChargedFloor); break;
      case 14: set_floor(g.shLavaFloor); break;
    }
    return true;
  }

  draw_features(): void {
    const c = this.c, V = this.V;
    const g = cgi();
    const xch = winf[c.wall].glyph;
    const ch = (s: string): number => s.charCodeAt(0);
    // CAP_SHAPES
    let wa_default = false;
    switch (c.wall) {

      case waBigBush:
        if (G.detaillevel >= 2)
          queuepolyat(at_smart_lof_sm(V, zgrad0(0, g.slev, 1, 2)), g.shHeptaMarker, darkena(this.wcol, 0, 0xFF), PPR.RED1_TOP);
        if (G.detaillevel >= 1)
          queuepolyat(smv(at_smart_lof_sm(V, g.RED[1]), lpispin()), g.shWeakBranch, darkena(this.wcol, 0, 0xFF), PPR.RED1_TOP + 1);
        if (G.detaillevel >= 2)
          queuepolyat(at_smart_lof_sm(V, zgrad0(0, g.slev, 3, 2)), g.shHeptaMarker, darkena(this.wcol, 0, 0xFF), PPR.RED1_TOP + 2);
        queuepolyat(at_smart_lof_sm(V, g.RED[2]), g.shSolidBranch, darkena(this.wcol, 0, 0xFF), PPR.RED1_TOP + 3);
        break;

      case waSmallBush:
        if (G.detaillevel >= 2)
          queuepolyat(at_smart_lof_sm(V, zgrad0(0, g.slev, 1, 2)), g.shHeptaMarker, darkena(this.wcol, 0, 0xFF), PPR.RED1_TOP);
        if (G.detaillevel >= 1)
          queuepolyat(smv(at_smart_lof_sm(V, g.RED[1]), lpispin()), g.shWeakBranch, darkena(this.wcol, 0, 0xFF), PPR.RED1_TOP + 1);
        if (G.detaillevel >= 2)
          queuepolyat(at_smart_lof_sm(V, zgrad0(0, g.slev, 3, 2)), g.shHeptaMarker, darkena(this.wcol, 0, 0xFF), PPR.RED1_TOP + 2);
        queuepolyat(at_smart_lof_sm(V, g.RED[2]), g.shWeakBranch, darkena(this.wcol, 0, 0xFF), PPR.RED1_TOP + 3);
        break;

      case waSolidBranch:
        queuepoly(GDIM() === 3 ? omf(V, g.BODY) : V, g.shSolidBranch, darkena(this.wcol, 0, 0xFF));
        break;

      case waWeakBranch:
        queuepoly(GDIM() === 3 ? omf(V, g.BODY) : V, g.shWeakBranch, darkena(this.wcol, 0, 0xFF));
        break;

      case waLadder:
        if (GDIM() === 3) {
          throw new NotPorted('draw_features: waLadder in 3D'); // STAGE2-STUB (3D)
        }
        else if (euclid()) {
          draw_floorshape(c, V, g.shMFloor, 0x804000FF);
          draw_floorshape(c, V, g.shMFloor2, 0x000000FF);
        }
        else {
          draw_floorshape(c, V, g.shFloor, 0x804000FF, PPR.FLOOR + 1);
          draw_floorshape(c, V, g.shMFloor, 0x000000FF, PPR.FLOOR + 2);
        }
        break;

      case waReptileBridge: {
        this.Vboat = V;
        const qfi2 = qfi_save();
        try {
          const col = reptilecolor(c);
          this.set_reptile_floor(V, col);
          draw_qfi(c, V, col);
        } finally { qfi_restore(qfi2); }
        break;
      }

      case waTerraWarrior:
        // CAP_COMPLEX2
        drawTerraWarrior(V, terracotta_randterra ? (c.wparam & 7) : (5 - (c.wparam & 7)), 7, 0);
        break;

      case waBoat: case waStrandedBoat:
        this.draw_boat();
        break;

      case waBigStatue: {
        const V2 = { v: V };
        const footphase = { v: 0 };
        applyAnimation(c, V2, footphase, LAYER_BOAT);

        queuepolyat(V2.v, g.shStatue,
          darkena(winf[c.wall].color, 0, 0xFF),
          PPR.BIGSTATUE
        );
        break;
      }

      case waSulphurC: {
        if (drawstar(c)) {
          this.aura_color = this.wcol;
          if (G.wmspatial)
            queuepolyat(omf(V, g.HELLSPIKE), g.shGiantStar[this.ct6], darkena(this.wcol, 0, 0x40), PPR.HELLSPIKE);
          else
            queuepoly(V, g.shGiantStar[this.ct6], darkena(this.wcol, 0, 0xFF));
        }
        break;
      }

      case waTrapdoor:
      case waClosePlate: case waOpenPlate: {
        if (c.wall === waTrapdoor && c.land === laZebra) break;
        /* fallthrough */
        let V2 = V;
        if (G.wmescher && geosupport_football() === 2 && pseudohept(c) && c.land === laPalace) V2 = smv(V, spin(M_PI / c.type));
        if (GDIM() === 3) {
          throw new NotPorted('draw_features: plates in 3D'); // STAGE2-STUB (3D)
        }
        else {
          draw_floorshape(c, V2, g.shMFloor, darkena(winf[c.wall].color, 0, 0xFF));
          draw_floorshape(c, V2, g.shMFloor2, (!G.wmblack) ? darkena(this.fcol, 1, 0xFF) : darkena(0, 1, 0xFF));
        }
        break;
      }

      case waCrateCrate: case waCrateTarget: case waCrateOnTarget: {
        const V2 = V;
        if (c.wall !== waCrateCrate) {
          draw_floorshape(c, V2, g.shMFloor, darkena(winf[waCrateTarget].color, 0, 0xFF));
          draw_floorshape(c, V2, g.shMFloor2, c.wall === waCrateOnTarget ? darkena(0xFFFF00, 0, 0xFF) : (!G.wmblack) ? darkena(this.fcol, 1, 0xFF) : darkena(0, 1, 0xFF));
        }
        if (c.wall !== waCrateTarget) {
          if (G.wmspatial) {
            const layers = 2 << G.detaillevel;
            for (let z = 1; z <= layers; z++) {
              const zg = zgrad0(0, geom3_actual_wall_height(), z, layers);
              queuepolyat(xyzscale_sm(V, zg, zg), g.shBarrel, darkena((z & 1) ? 0xFF0000 : 0xC00000, 0, 0xFF), PPR.WALL_DECO);
            }
          }
          else {
            queuepolyat(V, g.shBarrel, darkena(0xC00000, 0, 0xFF), PPR.RED1_TOP);
          }
        }
        break;
      }

      case waFrozenLake: case waLake: case waCamelotMoat:
      case waSea: case waOpenGate: case waBubble: case waDock:
      case waDeepWater: case waShallow:
      case waSulphur: case waMercury:
        break;

      case waNone:
        if (c.land === laBrownian) { wa_default = true; break; }
        break;

      case waRose: {
        this.aura_color = this.wcol;
        this.wcol <<= 1;
        if (c.cpdist > 5)
          this.wcol = 0xC0C0C0;
        else if (G.rosephase === 7)
          this.wcol = 0xFF0000;
        else
          this.wcol = gradient(this.wcol, 0xC00000, 0, G.rosephase, 6);
        queuepoly(V, g.shThorns, 0xC080C0FF);

        for (let u = 0; u < 4; u += 2)
          queuepoly(smv(V, spin(30 * degree * u)), g.shRose, darkena(this.wcol, 0, 0xC0));
        break;
      }

      case waRoundTable:
        if (G.wmspatial) { wa_default = true; break; }
        break;

      case waMirrorWall:
        break;

      case waGlass:
        if (G.wmspatial) {
          const col = winf[waGlass].color;
          const dcol = darkena(col, 0, 0x80);
          const Vdepth = omf(this.Vd, g.WALL);
          if (GDIM() === 3)
            throw new NotPorted('draw_features: waGlass in 3D'); // STAGE2-STUB (3D)
          else
            draw_floorshape(c, Vdepth, g.shMFloor, dcol, PPR.WALL); // GLASS
          const dq = qfi_save();
          try {
            set_floor(g.shMFloor);
            if (g.validsidepar[SIDE_WALL]) for (let i = 0; i < c.type; i++) {
              if (!c.move(i)) continue;
              if (placeSidewall(c, i, SIDE_WALL, this.Vd, dcol)) break;
            }
          } finally { qfi_restore(dq); }
        }
        break;

      case waFan:
        // MAXMDIM >= 4: GDIM == 3 (3D)
        if (GDIM() === 3) throw new NotPorted('draw_features: waFan in 3D'); // STAGE2-STUB (3D)
        queuepoly(smv(V, spintick(PURE() ? -1000 : -500, 1 / 12.)), g.shFan, darkena(this.wcol, 0, 0xFF));
        break;

      case waArrowTrap:
        if (c.wparam >= 1 || hat_in())
          queuepoly(omf(V, g.FLOOR), g.shDisk, darkena(trapcol[c.wparam & 3], 0, 0xFF));
        if (isCentralTrap(c)) G.arrowtraps.push(c);
        break;

      case waFireTrap:

        if (GDIM() === 3) {
          throw new NotPorted('draw_features: waFireTrap in 3D'); // STAGE2-STUB (3D)
        }
        else {
          draw_floorshape(c, V, g.shMFloor, darkena(0xC00000, 0, 0xFF));
          draw_floorshape(c, V, g.shMFloor2, darkena(0x600000, 0, 0xFF));
        }
        if (c.wparam >= 1)
          queuepoly(omf(V, g.FLOOR), g.shDisk, darkena(trapcol[c.wparam & 3], 0, 0xFF));
        break;

      case waGiantRug:
        queuepoly(V, g.shBigCarpet1, darkena(GDIM() === 3 ? 0 : 0xC09F00, 0, 0xFF));
        queuepoly(V, g.shBigCarpet2, darkena(GDIM() === 3 ? 0xC09F00 : 0x600000, 0, 0xFF));
        queuepoly(V, g.shBigCarpet3, darkena(GDIM() === 3 ? 0x600000 : 0xC09F00, 0, 0xFF));
        break;

      case waBarrier:
        if (c.land === laOceanWall && G.wmescher && G.wmspatial) {
          if (GDIM() === 3 && qfi.fshape) {
            throw new NotPorted('draw_features: waBarrier cone in 3D'); // STAGE2-STUB (3D)
          }
          const layers = 2 << G.detaillevel;
          const ds = qfi.shape, dss = qfi.spin;
          qfi.shape = g.shCircleFloor;
          qfi.spin = Id;
          try {
            for (let z = 1; z < layers; z++) {
              const zg = zgrad0(-G.vid.lake_top, geom3_actual_wall_height(), z, layers);
              draw_qfi(c, xyzscale_sm(V, zg * (layers - z) / layers, zg),
                darkena(gradient(0, this.wcol, -layers, z, layers), 0, 0xFF), PPR.WALL_DECO);
            }
          } finally { qfi.shape = ds; qfi.spin = dss; }
        }
        else wa_default = true;
        break;

      case waMineOpen: {
        const mines = countMinesAround(c);
        draw_mine_numbers(mines, V, this.ct6);
        break;
      }

      // CAP_COMPLEX2
      case waMineUnknown: case waMineMine: {
        draw_mine_markers(c, V);
        break;
      }

      case waEditStatue:
        throw new NotPorted('draw_features: waEditStatue (mapeditor::drawUserShape)'); // STAGE2-STUB (map editor)

      default:
        wa_default = true;
    }

    if (wa_default) {
      // wa_default:

      if (this.sha.sl && G.wmspatial) {
        floorShadow(c, V, SHADOW_SL * this.sha.sl);
      }

      else if (highwall(c)) this.draw_wall();

      else if (xch === ch('%')) {
        if (doHighlight())
          G.poly_outline = (c.land === laMirror) ? OUTLINE_TREASURE : OUTLINE_ORB;

        if (G.wmspatial) {
          const col = winf[c.wall].color;
          const dcol = darkena(col, 0, 0xC0);
          const Vdepth = omf(this.Vd, g.WALL);
          if (GDIM() === 3)
            throw new NotPorted('draw_features: mirrors in 3D'); // STAGE2-STUB (3D)
          else
            draw_floorshape(c, Vdepth, g.shMFloor, dcol, PPR.WALL); // GLASS
          const dq = qfi_save();
          try {
            set_floor(g.shMFloor);
            if (g.validsidepar[SIDE_WALL]) for (let i = 0; i < c.type; i++) {
              if (!c.move(i)) continue;
              if (placeSidewall(c, i, SIDE_WALL, this.Vd, dcol)) break;
            }
          } finally { qfi_restore(dq); }
        }
        else {
          queuepoly(V, g.shMirror, darkena(this.wcol, 0, 0xC0));
        }
        G.poly_outline = OUTLINE_DEFAULT();
      }

      // CAP_COMPLEX2
      else if (isDie(c.wall)) {
        throw new NotPorted('draw_features: dice::draw_die'); // STAGE2-STUB (complex2.cpp dice drawing)
      }

      else if (c.wall === waExplosiveBarrel) {
        if (GDIM() === 3 && qfi.fshape) {
          throw new NotPorted('draw_features: waExplosiveBarrel in 3D'); // STAGE2-STUB (3D)
        }
        const layers = 2 << G.detaillevel;
        for (let z = 1; z <= layers; z++) {
          const zg = zgrad0(0, geom3_actual_wall_height(), z, layers);
          queuepolyat(xyzscale_sm(V, zg, zg), g.shBarrel, darkena((z & 1) ? 0xFF0000 : 0xC00000, 0, 0xFF), PPR.WALL_DECO);
        }
      }

      else if (isFire(c) || isThumper(c) || c.wall === waBonfireOff) {
        let V2 = V;
        if (c.wall === waThumperOn) {
          const ds = fractick(160);
          for (let u = 0; u < 5; u++) {
            const rad = g.hexf * (.3 * (u + ds));
            const tcol = darkena(gradient(G.forecolor, G.backcolor, 0, rad, 1.5 * g.hexf), 0, 0xFF);
            // PRING(a): for(int a=0; a<=cgi.S84; a+=SD3)
            for (let a = 0; a <= g.S84; a += g.SD3)
              curvepoint(xspinpush0(a * g.S_step, rad));
            queuecurve(V, tcol, 0, PPR.LINE);
          }
        }
        if (hasTimeout(c)) V2 = smv(V2, spintick(c.land === laPower ? 5000 : 500));
        if (GDIM() === 3 && qfi.fshape) {
          throw new NotPorted('draw_features: fire in 3D'); // STAGE2-STUB (3D)
        }
        else queuepoly(V2, g.shStar, darkena(this.wcol, 0, 0xF0));
        if (isFire(c) && rand() % 300 < G.ticks - G.lastt)
          drawParticle(c, this.wcol, 75);
      }

      else if (xch !== ch('.') && xch !== ch('+') && xch !== ch('>') && xch !== ch(':') && xch !== ch('-') && xch !== ch(';') && xch !== ch(',') && xch !== ch('&'))
        this.error = true;
    }
  }

  check_rotations(): void {
    const c = this.c;
    const ds = G.downseek;
    const cwt = G.cwt;

    // we generally want function(ds.best) but this would fail if ds.best is not known yet,
    // so we use function(old) which will return the same value as function(c) if ds.best is not known yet
    const old = ds.best ? ds.best : c;

    const use_if_less = (a: number, b: number, spd: number, side: number): void => {
      if (a > b) return;
      if (!ds.best || a < b) downseek_reset();
      if (a <= b) {
        ds.best = c;
        ds.speed = spd;
        if (mproduct()) {
          throw new NotPorted('check_rotations: product geometries'); // STAGE2-STUB
        }
        else
          ds.total = hadd(ds.total, unshift(tC0_sm(this.V)));
        ds.qty++;
        ds.point = cgi().emb.normalize_flat(hmul_s(ds.total, 1 / ds.qty));
        if (mproduct()) ds.point = orthogonal_move(ds.point as never, ds.depth / ds.qty) as never;
        if (side === 2) for (let i = 0; i < 3; i++) ds.point[i] = -ds.point[i];
        if (side === 1) ds.point = tmulh(spin(-90 * degree), ds.point);
      }
    };

    // if(0); CAP_BT
    if (bt_in() && G.models_do_rotate >= 2) {
      use_if_less(c.master.distance, old.master.distance, 1, 0);
    }

    else if (isGravityLand(cwt.at.land) && cwt.at.land !== laMountain) {
      let side = 0;
      if (cwt.at.land === laDungeon) side = 2;
      if (cwt.at.land === laWestWall) side = 1;
      if (cwt.at.land === laIvoryTower && ls_hv_structure()) side = 2;
      if (cwt.at.land === laDungeon && ls_hv_structure()) side = 0;
      if (G.models_do_rotate >= 1)
        use_if_less(edgeDepth(c), edgeDepth(old), cwt.at.landparam / 10., side);
    }

    else if (c.master.alt && cwt.at.master.alt &&
      ((cwt.at.land === laMountain && G.models_do_rotate >= 1) ||
        (G.models_do_rotate >= 2 &&
          (cwt.at.land === laTemple || cwt.at.land === laWhirlpool ||
            (G.cheater && (cwt.at.land === laClearing || cwt.at.land === laCaribbean ||
              cwt.at.land === laCamelot || cwt.at.land === laPalace)))
        ))
      && c.land === cwt.at.land && c.master.alt.alt === cwt.at.master.alt.alt) {
      use_if_less(celldistAlt(c), celldistAlt(old), .5, (cwt.at.land === laMountain) ? 2 : 0);
    }

    else if (G.models_do_rotate >= 2 && cwt.at.land === laOcean && cwt.at.landparam < 25) {
      use_if_less(coastval(c, laOcean), coastval(old, laOcean), Math.trunc(cwt.at.landparam / 10), 0);
    }
  }

  bookkeeping(): void {
    const c = this.c, V = this.V;
    let orig = false;
    if (!G.inmirrorcount) {
      const gmatrix = cd().cellmatrices;
      let gm = gmatrix.get(c);
      if (!gm) { gm = { T: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], shift: 0, is_null: true }; gmatrix.set(c, gm); }
      orig = gm.is_null || hdist0_sp(tC0_sm(gm)) >= hdist0_sp(tC0_sm(V));
      if (orig) { gm.T = V.T; gm.shift = V.shift; gm.is_null = false; }
      let copies = cd().all_drawn_copies.get(c);
      if (!copies) { copies = []; cd().all_drawn_copies.set(c, copies); }
      copies.push({ T: V.T, shift: V.shift });
    }
    if (G.just_gmatrix) return;

    set_detail_level(V);

    // save the player's view center
    if (isPlayerOn(c) && !G.shmup_on) {
      G.playerfound = true;

      if (G.multi_players > 1) {
        for (const i of player_indices()) if (playerpos(i) === c) {
          G.playerV = smv(V, ddspin(c, G.multi_player[i].spin, 0));
          if (G.multi_player[i].mirrored) G.playerV = smv(G.playerV, Mirror);
          if (orig)
            G.multi_whereis[i] = G.playerV;
        }
      }
      else {
        G.playerV = smv(V, ddspin(c, G.cwt.spin, 0));
        if (G.cwt.mirrored) G.playerV = smv(G.playerV, Mirror);
        const F = back_to_view(V);
        if ((!confusingGeometry() && !fake_split() && !G.inmirrorcount) || eqmatrix(F, cd().which_copy, 1e-2))
          cd().which_copy = F;
        if (orig) cd().player_matrix = G.playerV;
      }
    }

    const dist = mousedist(V);

    if (G.inmirrorcount) { /* */ }
    else if (WDIM() === 3) { /* */ }
    else if (dist < G.modist) {
      G.modist2 = G.modist; G.mouseover2 = G.mouseover;
      G.modist = dist;
      G.mouseover = c;
      G.mouseoverV = V;
    }
    else if (dist < G.modist2) {
      G.modist2 = dist;
      G.mouseover2 = c;
    }

    const orbrange = (G.items[itRevolver] ? 3 : 2);

    if (c.cpdist <= orbrange) if (G.multi_players > 1 || G.multi_alwaysuse)
      for (let i = 0; i < G.multi_players; i++) if (multi_playerActive(i)) {
        const dfc = hdist_sp(tC0_sm(V), tC0_sm(G.multi_crosscenter[i]));
        if (dfc < G.multi_ccdist[i] && celldistance(playerpos(i), c) <= orbrange) {
          G.multi_ccdist[i] = dfc;
          G.multi_ccat[i] = c;
        }
      }
  }

  /** Display text statistics about the cell (distances in viewdists mode, pattern codes, etc.). may also change
   *  the colors provided in */
  draw_cellstat(): void {
    const c = this.c, V = this.V;
    if (G.viewdists) throw new NotPorted('draw_cellstat: do_viewdist (expansion.cpp)'); // STAGE2-STUB

    for (let i = 0; i < isize(G.buggycells); i++)
      if (c === G.buggycells[i]) {
        queuepoly(V, cgi().shPirateX, 0xC000C080);
        return;
      }

    if (isize(G.buggycells)) throw new NotPorted('draw_cellstat: buggycells (pathTowards)'); // STAGE2-STUB (debug)

    if (c.land === laMirrored || c.land === laMirrorWall2 || c.land === laMirrored2) {
      const label = its(c.landparam);
      queuestr_V(V, G.mapfontscale / 500, label, 0xFFFFFFFF, 1);
    }

    if (G.debug_tiles) throw new NotPorted('draw_cellstat: debug_tiles'); // STAGE2-STUB (debug)

    if (G.debug_voronoi && ls_hv_structure()) throw new NotPorted('draw_cellstat: debug_voronoi'); // STAGE2-STUB (debug)

    if (G.cmode & sm.TORUSCONFIG) throw new NotPorted('draw_cellstat: euc::coord_display'); // STAGE2-STUB (Euclidean)

    // CAP_EDIT
    if (G.patterns_displaycodes) throw new NotPorted('draw_cellstat: patterns::displaycodes'); // STAGE2-STUB (U4)

    if (G.debug_cellnames && G.pointer_indices.has(c)) throw new NotPorted('draw_cellstat: debug_cellnames'); // STAGE2-STUB (debug)
  }

  draw_wall_full(): void {
    const c = this.c, V = this.V;
    const g = cgi();
    const sha = this.sha;

    const Vf = (sha.top !== SIDE_FLOOR) ? omf(V, g.dhi_table[sha.top]) : V;

    // CAP_SHAPES
    const flooralpha = G.default_flooralpha;

    // CAP_EDIT && CAP_TEXTURE: the map editor's floor drawing (stage 3)

    // CAP_SHAPES
    set_floor(g.shFloor);
    if (!G.wmascii) {

      // CAP_EDIT: auto si = patterns::getpatterninfo0(c); drawing_usershape_on (the map editor, stage 3)

      // CAP_SHAPES
      // floor
      if (GDIM() === 2 && (c.land !== laRose || ls_any_chaos())) {
        const rd = rosedist(c);
        if (rd === 1)
          draw_floorshape(c, at_smart_lof_sm(V, g.RED[2]), g.shRoseFloor, 0x80406040, PPR.LIZEYE);
        if (rd === 2)
          draw_floorshape(c, at_smart_lof_sm(V, g.RED[2]), g.shRoseFloor, 0x80406080, PPR.LIZEYE);
      }

      const whichShape = G.patterns_whichShape;
      const ch = (s: string): number => s.charCodeAt(0);

      if (c.wall === waChasm) {
        this.aura_color = 0;
        const rd = rosedist(c);
        if (GDIM() === 2) {
          if (rd === 1)
            draw_floorshape(c, V, g.shRoseFloor, 0x80406020);
          if (rd === 2)
            draw_floorshape(c, V, g.shRoseFloor, 0x80406040);
        }
        if (c.land === laZebra) this.fd++;
        if (c.land === laHalloween && !G.wmblack) {
          const Vdepth = G.wmspatial ? omf(V, g.DEEP) : V;
          if (GDIM() === 3)
            throw new NotPorted('draw_wall_full: laHalloween chasm in 3D'); // STAGE2-STUB (3D)
          else
            draw_floorshape(c, Vdepth, g.shFullFloor, darkena(firecolor(0, 10), 0, 0xDF), PPR.DEEP_TOP);
        }
      }

      // CAP_EDIT: else if(mapeditor::haveUserShape(mapeditor::sgFloor, si.id)) (no user shapes in stage 2)

      else if (whichShape === ch('7'))
        set_floor(g.shBigHepta);

      else if (whichShape === ch('8'))
        set_floor(g.shTriheptaFloor);

      else if (whichShape === ch('6'))
        set_floor(g.shBigTriangle);

      else if (among(whichShape, ch('9'), ch('^')))
        set_floor(g.shFullFloor);

      else if (whichShape === ch('5'))
        set_floor(g.shFloor);

      else if (whichShape === ch('4'))
        set_floor(g.shMFloor);

      else if (whichShape === ch('3'))
        set_floor(g.shMFloor2);

      else if (whichShape === ch('2'))
        set_floor(g.shMFloor3);

      // CAP_TEXTURE: else if(GDIM == 2 && texture::config.apply(c, Vf, darkena(fcol, fd, 0xFF))) ; (textures are stage 3)

      else if (c.land === laMirrorWall)
        this.draw_mirrorwall();

      else if (c.land === laWineyard && cellHalfvine(c))
        this.draw_halfvine();

      else if (c.land === laReptile || c.wall === waReptile)
        this.set_reptile_floor(Vf, this.fcol);

      else if ((G.wmblack ? 1 : 0) === 1 && c.wall === waMineOpen && G.vid.grid) {
        /* */
      }

      else if (G.wmblack) {
        set_floor_h(g.shBFloor[this.ct6]);
        const rd = rosedist(c);
        if (WDIM() === 2 && rd === 1)
          queuepoly(Vf, g.shHeptaMarker, darkena(this.fcol, 0, 0x80));
        else if (WDIM() === 2 && rd === 2)
          queuepoly(Vf, g.shHeptaMarker, darkena(this.fcol, 0, 0x40));
      }

      else if (isWarped(c) || is_nice_dual(c))
        this.set_maywarp_floor();

      else if (G.wmplain) {
        set_floor(g.shFloor);
      }

      else if (this.set_randompattern_floor()) { /* */ }

      else this.set_land_floor(Vf);

      if (embedded_plane() && qfi.fshape === g.shFloor) set_floor(g.shFullFloor);

      // actually draw the floor

      if ((sha.top !== sha.deep) && G.wmspatial && G.detaillevel) {

        const col = c.land === laCocytus ? 0x080808FF : 0x101010FF;

        if (qfi.fshape === g.shCloudFloor)
          set_floor(g.shCloudSeabed);
        else if (qfi.fshape === g.shLavaFloor)
          set_floor(g.shLavaSeabed);
        else if (qfi.fshape === g.shFloor)
          set_floor(g.shFullFloor);
        else if (qfi.fshape === g.shCaveFloor)
          set_floor(g.shCaveSeabed);

        if (WDIM() === 2 && GDIM() === 3 && qfi.fshape)
          throw new NotPorted('draw_wall_full: 2D in 3D'); // STAGE2-STUB (3D)
        else
          draw_qfi(c, omf(V, g.dhi_table[sha.deep]), col, side_to_prio_top[sha.deep]);

        const fd0 = this.fd ? this.fd - 1 : 0;
        if (WDIM() === 2 && GDIM() === 3 && qfi.fshape)
          throw new NotPorted('draw_wall_full: 2D in 3D'); // STAGE2-STUB (3D)
        else
          draw_qfi(c, this.Vd, darkena(this.fcol, fd0, 0x80), PPR.WATERLEVEL_TOP);
      }

      else if (sha.top !== SIDE_INFDEEP) {
        let col = this.fcol;
        if (whichShape === ch('^')) G.poly_outline = darkena(this.fcol, this.fd, flooralpha);
        if (sha.top === SIDE_WALL) col = this.wcol_star;
        else if (sha.top >= SIDE_RED1 && G.wmspatial) col = this.wcol;

        let sf = sha.top; if (!G.wmspatial) sf = SIDE_FLOOR;

        if (WDIM() === 2 && GDIM() === 3 && qfi.fshape && !G.draw_plain_floors)
          throw new NotPorted('draw_wall_full: 2D in 3D'); // STAGE2-STUB (3D)
        else if (sf === SIDE_FLOOR)
          draw_qfi(c, V, darkena3(col, this.fd, flooralpha), PPR.FLOOR);
        else
          draw_qfi(c, omf(V, g.dhi_table[sf]), darkena3(col, this.fd, flooralpha), side_to_prio_top[sha.top]);
      }

      // MAXMDIM >= 4: the ceiling (WDIM == 2 && GDIM == 3)
      if (WDIM() === 2 && GDIM() === 3)
        throw new NotPorted('draw_wall_full: the ceiling (3D)'); // STAGE2-STUB (3D)

      // walls
      if (realred(c.wall) && !G.wmspatial) {
        const s = snakelevel(c);
        if (s >= 1) draw_floorshape(c, V, g.shRedRockFloor[0], this.getSnakelevColor(0, 7));
        if (s >= 2) draw_floorshape(c, V, g.shRedRockFloor[1], this.getSnakelevColor(1, 7));
        if (s >= 3) draw_floorshape(c, V, g.shRedRockFloor[2], this.getSnakelevColor(2, 7));
      }

      if (c.wall === waTower && !G.wmspatial) {
        this.fcol = 0xE8E8E8;
        set_floor(g.shMFloor);
      }

      if (WDIM() === 2 && pseudohept(c) && (
        c.land === laRedRock ||
        G.vid.darkhepta ||
        (c.land === laClearing && !BITRUNCATED()))) {
        // MAXMDIM >= 4: GDIM == 3 && WDIM == 2 (3D)
        queuepoly(this.Vd, g.shHeptaMarker, G.wmblack ? 0x80808080 : 0x00000080);
      }

      if (G.history_includeHistory && G.history_inmovehistory.has(c))
        queuepoly(this.Vd, g.shHeptaMarker, 0x000000C0);

      // MAXMDIM >= 4
      if (WDIM() === 3)
        throw new NotPorted('draw_features_and_walls_3d (3D)'); // STAGE2-STUB (3D)

      else this.draw_features();
    }

    if (G.wmascii || (WDIM() === 2 && GDIM() === 3)) {
      if (c.wall === waNone || isWatery(c)) this.asciicol = this.fcol;
      if (c.wall === waBoat) this.asciicol = 0xC06000;

      if (c.wall === waArrowTrap)
        this.asciicol = trapcol[c.wparam & 3];
      if (c.wall === waFireTrap)
        this.asciicol = trapcol[c.wparam & 3];
      if (c.wall === waTerraWarrior)
        this.asciicol = terracol[c.wparam & 7];

      if (c.wall === waMineOpen) {
        const mines = countMinesAround(c);
        if (this.asciichar === '.'.charCodeAt(0)) {
          if (mines === 0) this.asciichar = ' '.charCodeAt(0);
          else { this.asciichar = '0'.charCodeAt(0) + mines; this.asciicol = minecolors[mines]; }
        }
        else if (this.asciichar === '@'.charCodeAt(0)) {
          this.asciicol = minecolors[mines];
        }
      }
      if (G.wmascii && !((c.item && !itemHiddenFromSight(c)) || c.monst || c.cpdist === 0)) this.error = true;
      this.asciiborder = G.bordcolor;
    }

    // CAP_SHAPES
    if (G.wmspatial && WDIM() === 2) {

      const col = (highwall(c) || c.wall === waTower) ? this.wcol : this.fcol;

      let shab = sha.levels;
      for (let i = 0; i < c.type; i++) {
        const c1 = c.move(i);
        if (!c1) continue;
        const fsha1 = get_spatial_info(c1);
        let sha1 = fsha1.levels;
        let sha0 = shab;

        const w = 1 << SIDE_WALL;
        const r = (1 << SIDE_RED1) | (1 << SIDE_RED2) | (1 << SIDE_RED3);
        const r4 = r | (1 << SIDE_RED4);

        if (fake_split()) sha1 ^= (w | r | r4);

        if ((c.land === laCamelot && c.wall === waCamelot) || ((sha0 & w) && (sha1 & r))) {
          sha0 ^= (w | r | r4);
        }

        let shad = sha0 & ~sha1;

        while (shad) {
          const lev = ctz32(shad);
          shad ^= (1 << lev);
          let col1 = darkena(col, this.fd, 0xFF);

          const D = (v: number): number => darkena(gradient(0, col, 0, v * (sphere() ? spherity_T(tmul_t(V, (G.currentmap as { adj(c: cell, i: number): transmatrix }).adj(c, i))) : 1), 1), this.fd, 0xFF);
          if (lev === SIDE_FLOOR) col1 = D(0.8);
          if (lev === SIDE_WATERLEVEL) col1 = D(0.75);
          if (lev === SIDE_SHALLOW) col1 = D(0.7);
          if (lev === SIDE_DEEP) col1 = 0x101010FF;
          if (lev === SIDE_WALL) {
            col1 = (G.geometry === gEuclidSquare && (i & 1)) ? gradient(0, this.wcol_star, 0, .9, 1) : gradient(0, this.wcol_star, 0, .8, 1);
            col1 = darkena(col1, this.fd, 255);
          }

          if (lev >= SIDE_RED1 && lev <= SIDE_RED3 && sha.sl) {
            col1 = this.getSnakelevColor(lev - SIDE_RED1, sha.sl);
          }

          if (placeSidewall(c, i, lev, V, col1)) shab &= ~(1 << lev);
        }

        if (sha.top === SIDE_WATERLEVEL && fsha1.top === SIDE_INFDEEP) {
          const qfib = qfi_save();
          try {
            set_floor(g.shFullFloor);
            placeSidewall(c, i, SIDE_WATERLEVEL, V, 0x202030FF);
            if (sha.deep === SIDE_DEEP) placeSidewall(c, i, SIDE_SHALLOW, V, 0x181820FF);
          } finally { qfi_restore(qfib); }
        }
      }
    }
  }

  draw_item_full(): void {
    const c = this.c, V = this.V;
    let it: eItem = c.item;

    let hidden = itemHidden(c);
    let hiddens = itemHiddenFromSight(c);

    if (G.history_includeHistory && G.history_infindhistory.has(c)) {
      hidden = true;
      hiddens = false;
    }

    if (hiddens && !(G.cmode & sm.MAP))
      it = itNone;

    let icol = 0;

    if (ls_single() && G.specialland === _laMotion && G.items[itOrbInvis] && c.wall === waChasm) {
      if (c.mondir < c.type) {
        G.vid.linewidth *= 3;
        queueline(smulh(V, C0()), smulh(V, tmulh(( G.currentmap as { adj(c: cell, i: number): transmatrix }).adj(c, c.mondir), C0())), 0xFFD500FF, 4);
        G.vid.linewidth /= 3;
      }
    }

    if (it) {
      this.asciichar = iinf[it].glyph; this.asciicol = icol = iinf[it].color;
      if (doHighlight()) this.asciiborder = kind_outline(it) >>> 8;

      if (it === itCompass && isPlayerOn(c)) {
        const dummy = { v: null! as import('./hyperpoint.ts').shiftpoint };
        mark_compass(c, dummy);
      }
    }

    if (it) {
      if (c.wall !== waBoat) {
        const footphase = { v: 0 };
        const Vb = { v: this.Vboat };
        applyAnimation(c, Vb, footphase, LAYER_BOAT);
        this.Vboat = Vb.v;
      }

      if (cellHalfvine(c)) {
        let i = -1;
        for (let t = 0; t < 6; t++) if (c.move(t) && c.move(t).wall === c.wall)
          i = t;

        this.Vboat = smv(smv(this.Vboat, ddspin(c, i)), xpush(-.13));
      }

      if (drawItemType(it, c, this.Vboat, icol, G.ticks, hidden)) this.onradar = false;
    }
  }

  draw_monster_full(): void {
    const c = this.c, V = this.V;
    let moncol = 0xFF00FF;

    if (c.monst) {
      this.asciichar = minf[c.monst].glyph; moncol = minf[c.monst].color;
      if (c.monst === moMimic) {
        let all = 0, mirr = 0;
        for (const m of G.mirror_mirrors) if (c === m[1].at) {
          all++;
          if (m[1].mirrored) mirr++;
        }
        if (all === 1) moncol = mirrorcolor(mirr !== 0);
      }
      if (c.monst === moMutant) {
        // root coloring
        if (c.stuntime !== G.mutantphase)
          moncol =
            gradient(0xC00030, 0x008000, 0, (c.stuntime - G.mutantphase) & 15, 15);
      }
      if (isMetalBeast(c.monst) && c.stuntime)
        moncol >>>= 1;

      if (c.monst === moSlime) {
        moncol = winf[conditional_flip_slime(det(V.T) < 0, c.wall)].color;
        moncol |= (moncol >> 1);
      }

      this.asciicol = moncol;
      if (doHighlight() && !noHighlight(c.monst))
        this.asciiborder = (isFriendly(c) ? OUTLINE_FRIEND : OUTLINE_ENEMY) >>> 8;

      if (isDragon(c.monst) || isKraken(c.monst)) if (!c.hitpoints)
        this.asciicol = 0x505050;

      if (c.monst === moTortoise)
        this.asciicol = tortoise_getMatchColor(tortoise_getb(c));

      if (c.monst !== moMutant) for (let k = 0; k < c.stuntime; k++)
        this.asciicol = ((this.asciicol & 0xFEFEFE) >>> 1) + 0x101010;
    }

    if (c.cpdist === 0 && G.mapeditor_drawplayer && !G.shmup_on) {
      this.asciichar = '@'.charCodeAt(0);
      if (!G.mmitem) this.asciicol = moncol = G.cheater ? 0xFF3030 : 0xD0D0D0;
      if (doHighlight())
        this.asciiborder = OUTLINE_FRIEND >>> 8;
    }

    // CAP_SHAPES
    const q = { v: isize(G.ptds) };
    const dm = drawMonster(V, c.type, c, moncol, this.asciicol);
    if (dm) this.onradar = false;
    // CAP_SHAPES
    if (isize(G.ptds) !== q.v && !(c === G.lmouseover_distant && isDie(c.monst))) {
      if (WDIM() === 2 && GDIM() === 3 && Math.abs(cgi().RED[this.sha.sl] - cgi().FLOOR) > 1e-6)
        pushdown(c, q, V, cgi().RED[this.sha.sl] - cgi().FLOOR, false, false);
      if (GDIM() === 2 && Math.abs(geom3_factor_to_lev(zlevel(tC0(this.Vboat.T)))) > 1e-6)
        pushdown(c, q, V, -geom3_factor_to_lev(zlevel(tC0(this.Vboat.T))), !isMultitile(c.monst), false);
    }
  }

  add_map_effects(): void {
    const c = this.c, V = this.V;
    const g = cgi();
    const adj = (c: cell, i: number): transmatrix => (G.currentmap as { adj(c: cell, i: number): transmatrix }).adj(c, i);

    if (get_spatial_info(c).top < SIDE_FLOOR) this.draw_fallanims();

    if (!G.shmup_on && sword_at(c)) {
      queuepolyat(V, g.shDisk, 0xC0404040, PPR.SWORDMARK);
    }

    if (c.land === laNone && (G.cmode & sm.MAP)) {
      queuepoly(V, g.shTriangle, 0xFF0000FF);
    }

    /* Air Elemental */
    if (1) {
      const ad = airdist(c);
      if (ad === 1 || ad === 2) {
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i);
          if (airdist(c2) < airdist(c)) {
            const airdir = calcAirdir(c2); // printf("airdir = %d\n", airdir);
            const V0 = ddspin180(c, i);

            const ph = ptick(PURE() ? 150 : 75) + airdir;

            const aircol = (0x8080FF00 | itrunc(32 + 32 * -c_cos(ph))) >>> 0;

            let ph0 = ph / 2;
            ph0 -= Math.floor(ph0 / M_PI) * M_PI;

            G.poly_outline = OUTLINE_TRANS;
            queuepoly(smv(smv(this.Vd, V0), xpush(g.hexf * -c_cos(ph0))), g.shDisk, aircol);
            G.poly_outline = OUTLINE_DEFAULT();
          }
        }
      }
    }

    this.draw_bowpath();

    if (c.land === laBlizzard) {
      if (G.vid.backeffects) {
        if (c.cpdist <= getDistLimit())
          set_blizzard_frame(c, G.frameid);
      }
      else {
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i);
          if (!c2) continue;
          if (againstWind(c, c2))
            queuepoly(smv(smv(V, ddspin(c, i)), xpush(cellgfxdist(c, i) / 2)), g.shWindArrow, 0x8080FF80);
        }
      }
    }

    if (c.ligon) {
      let tim = G.ticks - G.lightat;
      if (tim > 1000) tim = 800;
      if (G.elec_havecharge && tim > 400) tim = 400;
      for (let t = 0; t < c.type; t++) if (c.move(t)) {
        if (c.move(t).ligon) {
          const lcol = darkena(gradient(iinf[itOrbLightning].color, 0, 0, tim, 1100), 0, 0xFF);
          queueline(smulh(chei_sm(smv(V, xspinpush((G.vid.flasheffects ? G.ticks : ptick(8)) * g.S_step, g.hexf / 2)), rand() % 1000, 1000), C0()), smulh(chei_sm(smv(V, adj(c, t)), rand() % 1000, 1000), C0()), lcol, 2 + G.vid.linequality);
        }
        for (const u of [-1, 1]) {
          const cw = new cellwalker(c, t, false).plusStep().plus(u);
          if (u === -1 && valence() === 4) continue;
          const c2 = cw.peek();
          if (c2 && c2.ligon) {
            const lcol = darkena(gradient(iinf[itOrbLightning].color, 0, 0, tim, 1100), 0, 0xFF);
            queueline(smulh(chei_sm(smv(V, xspinpush((G.vid.flasheffects ? G.ticks : ptick(8)) * g.S_step, g.hexf / 2)), rand() % 1000, 1000), C0()), smulh(chei_sm(smv(V, tmul(adj(c, t), adj(cw.at, cw.spin))), rand() % 1000, 1000), C0()), lcol, 2 + G.vid.linequality);
          }
        }
      }
    }

    if (c.land === laWhirlwind) {
      whirlwind_calcdirs(c);

      for (let i = 0; i < G.whirlwind_qdirs; i++) {
        const hdir0 = { v: (G.currentmap as { spin_angle(c: cell, d: number): number }).spin_angle(c, G.whirlwind_dfrom[i]) + M_PI };
        const hdir1 = (G.currentmap as { spin_angle(c: cell, d: number): number }).spin_angle(c, G.whirlwind_dto[i]);
        /* todo what if no spin_angle */

        const ph1 = fractick(PURE() ? 150 : 75);

        const aircol = 0xC0C0FF40;

        const h1 = cyclefix(hdir1, hdir0.v);

        const hdir = (h1 * ph1 + hdir0.v * (1 - ph1));

        const V0 = spin(hdir);

        const ldist =
          cellgfxdist(c, G.whirlwind_dfrom[i]) * (1 - ph1) / 2 +
          cellgfxdist(c, G.whirlwind_dto[i]) * ph1 / 2;
        // PURE ? cgi.crossf : c->type == 6 ? .2840 : 0.3399;

        G.poly_outline = OUTLINE_TRANS;
        queuepoly(smv(smv(this.Vd, V0), xpush(ldist * (2 * ph1 - 1))), g.shDisk, aircol);
        G.poly_outline = OUTLINE_DEFAULT();
      }
    }

    if (G.items[itOrbGravity] && c.cpdist <= 5)
      this.draw_gravity_particles();
  }

  draw_bowpath(): void {
    const c = this.c;
    const v = G.bow_bowpath_map.get(c);
    if (!v) return;
    // (ported by D4)
    for (const m of v) {

      let h0 = C0(), t0 = Hypc, h1 = C0(), t1 = Hypc;
      let birth = (m.flags & bow_bpFIRST) !== 0;

      if (!birth) {
        const d = cellgfxdist(c, m.prev.spin) / 2;
        h0 = tmulh(ddspin(c, m.prev.spin), xpush0(d));
        t0 = tmulh(tmul(ddspin(c, m.prev.spin), xpush(d)), xtangent(-d * 2));
      }
      else birth = true;

      if (!(m.flags & bow_bpLAST)) {
        const d = cellgfxdist(c, m.next.spin) / 2;
        h1 = tmulh(ddspin(c, m.next.spin), xpush0(d));
        t1 = tmulh(tmul(ddspin(c, m.next.spin), xpush(d)), xtangent(-d * 2));
      }

      const t = frac(ptick(PURE() ? 500 : 250));

      let arrow_color = getcs().swordcolor;

      if (m.flags & bow_bpCOPIED) {
        arrow_color &= 0xFF;
        arrow_color = (arrow_color | (mirrorcolor(m.next.mirrored !== G.cwt.mirrored) << 8)) >>> 0;
      }

      const arrow_color_trans = (arrow_color & 0xFFFFFF00) >>> 0;
      if (G.bow_fire_mode) arrow_color = gradient(arrow_color_trans, arrow_color, 0, 0.25, 1);

      // shmup::at_missile_level(V): WDIM == 3 ? V : GDIM == 3 ? orthogonal_move(V, cgi.BODY) : at_smart_lof(V, 1.15)
      if (GDIM() === 3) throw new NotPorted('draw_bowpath: 3D'); // STAGE2-STUB (3D)
      const V1 = at_smart_lof_sm(this.V, 1.15);

      if (birth) {
        if (t > 0.8) {
          const h = hadd(h1, hmul(t1, 1 - t));
          const tg = hneg(t1);

          G.poly_outline = OUTLINE_TRANS;
          queuepoly(smv(smv(V1, rgpushxto0(h)), rspintox(tmulh(gpushxto0(h), tg))), cgi().shTrapArrow, gradient(arrow_color_trans, arrow_color, 0.8, t, 1));
          G.poly_outline = OUTLINE_DEFAULT();
        }
      }
      else {
        // hyperpoint * ld associates left: h0 * (1-t) * (1-t) * (1+2t) multiplies the vector three times
        const hm = (x: hyperpoint, ...k: number[]): hyperpoint => { for (const f of k) x = hmul(x, f); return x; };
        let h = hadd(hadd(hadd(hm(h0, 1 - t, 1 - t, 1 + 2 * t), hm(t0, 1 - t, 1 - t, t)), hm(h1, t, t, 3 - 2 * t)), hm(t1, t, t, 1 - t));
        h = normalize(h);

        const tg = hadd(hadd(hm(hsub(h1, h0), 6, t, 1 - t), hmul(t0, 3 * t * t - 4 * t + 1)), hmul(t1, 2 * t - 3 * t * t));

        G.poly_outline = OUTLINE_TRANS;
        queuepoly(smv(smv(V1, rgpushxto0(h)), rspintox(tmulh(gpushxto0(h), tg))), cgi().shTrapArrow, arrow_color);
        G.poly_outline = OUTLINE_DEFAULT();
      }
    }
  }

  draw_gravity_particles(): void {
    throw new NotPorted('draw_gravity_particles (unsigned)(size_t)(c): the pointer of the cell'); // STAGE2-STUB
  }

  draw_fallanims(): void { celldrawer_draw_fallanims(this); }

  /** bool celldrawer::cell_clipped() (graph.cpp): only 3D sets clip_checked */
  cell_clipped(): boolean {
    if (!G.clip_checked) return false;
    throw new NotPorted('cell_clipped (3D)'); // STAGE2-STUB (3D)
  }

  draw(): void {
    const c = this.c;

    G.cells_drawn++;

    // CAP_TEXTURE: texture::saving (stage 3); CAP_TEXTURE && sm::DRAW: mapeditor::draw_texture_ghosts (stage 3)

    this.bookkeeping();
    if (G.just_gmatrix) return;

    // MAXMDIM >= 4
    if (this.cell_clipped()) return;

    G.ivoryz = isGravityLand(c.land);

    // if(behindsphere(V)) return;

    if (callhandlers(false, G.hooks_drawcell, c, this.V)) return;

    // online lockstep (ONLINE.md): the drawing does not apply the tides to the cells it draws (the rules do it for
    // dcal every turn, advance_tides; only cells beyond dcal show the tide of their last turn in range)
    if (!G.online_isolated) checkTide(c);

    const seen = in_line_of_sight_for_player(c);

    if (seen) {

      const b = G.neon_mode;
      try {
        if (!in_line_of_sight(c)) G.neon_mode = G.neon_magic_vision;

        if (inmirror(c)) {
          if (G.inmirrorcount >= 10) return;
          const cw = new cellwalker(c, 0, false);
          // online lockstep: a reflection that neither builds the Mirror Land's structure nor fills the rules' cache
          const cw2 = G.online_isolated ? mirror_reflect_view(cw) : mirror_reflect(cw);
          const cmc = (cw2.mirrored === cw.mirrored) ? 2 : 1;
          if (G.inmirrorcount === 0) ocwtV = cd().player_matrix;
          G.inmirrorcount += cmc;
          this.draw_grid();
          if (cw2.mirrored !== cw.mirrored) this.V = smv(this.V, Mirror);
          if (cw2.spin) this.V = smv(this.V, spin(TAU * cw2.spin / cw2.at.type));
          cw2.spin = 0;
          const dc = cd().player_matrix;
          try {
            cd().player_matrix = sm_shift(this.V, inverse_shift(ggmatrix(cw2.at), cd().player_matrix));
            drawcell(cw2.at, this.V);
          } finally { cd().player_matrix = dc; }
          G.inmirrorcount -= cmc;
          return;
        }

        if (!G.buggyGeneration && c.mpdist > 8 && !G.cheater && !G.autocheat) return; // not yet generated

        // CAP_SHAPES
        this.ct6 = ctof(c);
        this.fd = getfd(c);
        if (G.neon_mode === eNeon_illustration) this.fd = 0;
        this.error = false;

        this.setcolors();

        this.tune_colors();

        this.draw_cellstat();

        this.asciichar = winf[c.wall].glyph;
        this.asciicol = this.wcol;

        if (c.wall === waNone || isWatery(c)) this.asciicol = this.fcol;

        this.asciichar1 = this.asciichar;
        this.asciicol1 = this.asciicol;

        if (c.wall === waBoat) {
          this.asciicol1 = this.fcol;
          this.asciichar1 = '='.charCodeAt(0);
        }

        this.onradar = true;

        this.sha = get_spatial_info(c);

        if (c.wall === waMagma) this.fd = 0;

        G.poly_outline = OUTLINE_DEFAULT();

        const V = this.V;
        const g = cgi();
        this.Vd =
          WDIM() === 3 ? V :
            !G.wmspatial ? V :
              this.sha.sl ? omf(V, GDIM() === 3 ? g.RED[this.sha.sl] - g.FLOOR : g.RED[this.sha.sl]) :
                (highwall(c) && GDIM() === 2) ? omf(V, (1 + g.WALL) / 2) :
                  // CAP_SHAPES
                  (this.sha.top < SIDE_FLOOR) ? omf(V, GDIM() === 3 ? g.WATERLEVEL - g.FLOOR : g.WATERLEVEL) :
                    V;

        this.Vboat = this.Vd;

        // FOR_LIST(li, c->contents) li->draw(self): shmup's cell contents (stage 3)

        G.poly_outline = OUTLINE_DEFAULT();

        this.draw_wall_full();

        this.draw_item_full();
        this.draw_monster_full();

        if (animations[LAYER_THROW].has(c)) {
          const Vthrow = { v: V };
          const footphase = { v: 0 };
          applyAnimation(c, Vthrow, footphase, LAYER_THROW);
          // animations[LAYER_THROW][c]: applyAnimation may have erased it, then operator[] inserts a zero one
          const it = anim_at(LAYER_THROW, c).thrown_item;
          if (it) drawItemType(it, c, Vthrow.v, iinf[it].color, 0, false);
          const mo = anim_at(LAYER_THROW, c).thrown_monster;
          if (mo) drawMonsterType(mo, c, Vthrow.v, minf[mo].color, 0, minf[mo].color);
        }

        // CAP_TEXTURE: if(!texture::using_aura())
        this.addaura();

        // CAP_SHAPES
        this.add_map_effects();

        // CAP_QUEUE
        if (this.error && this.onradar) {
          let sl: number;
          const s = G.s0 + String.fromCharCode(this.asciichar);
          const p = G.poly_outline;
          G.poly_outline = (this.asciiborder << 8) >>> 0;
          try {
            const mapfontscale = G.mapfontscale;
            const darken = G.darken;
            if (!G.wmascii3)
              queuestrn(V, mapfontscale / 100, s, darkenedby(this.asciicol, darken), 2);
            else if (highwall(c) && conegraph(c)) {
              const layers = 1 << G.detaillevel;
              const s1 = G.s0 + String.fromCharCode(this.asciichar1);
              G.poly_outline = (G.bordcolor << 8) >>> 0;
              for (let z = 0; z < layers; z++)
                queuestrn(omf(V, zgrad0(0, geom3_actual_wall_height(), z, layers)), 1. - z * .5 / layers, s1, darkenedby(gradient(G.bordcolor, this.asciicol1, -layers, z, layers), darken), 1);
              G.poly_outline = (this.asciiborder << 8) >>> 0;
              queuestrn(omf(V, g.WALL), (this.asciicol === this.asciicol1 && this.asciichar === this.asciichar1 ? .5 : 1) * mapfontscale / 100, s, darkenedby(this.asciicol, darken), 2);
            }
            else if (highwall(c)) {
              const layers = 1 << G.detaillevel;
              const s1 = G.s0 + String.fromCharCode(this.asciichar1);
              G.poly_outline = (G.bordcolor << 8) >>> 0;
              for (let z = 0; z < layers; z++)
                queuestrn(omf(V, zgrad0(0, geom3_actual_wall_height(), z, layers)), 1, s1, darkenedby(gradient(G.bordcolor, this.asciicol1, -layers, z, layers), darken), 1);
              G.poly_outline = (this.asciiborder << 8) >>> 0;
              queuestrn(omf(V, g.WALL), mapfontscale / 100, s, darkenedby(this.asciicol, darken), 2);
            }
            else if ((sl = snakelevel(c))) {
              const s1 = G.s0 + String.fromCharCode(this.asciichar1);
              G.poly_outline = (G.bordcolor << 8) >>> 0;
              for (let z = 0; z < sl * 4; z++) if (z % 4 === 0)
                queuestrn(omf(V, zgrad0(0, g.slev * sl, z, sl * 4)), mapfontscale / 100, s1, darkenedby(gradient(G.bordcolor, this.asciicol1, -sl, z, sl * 4), darken), 1);
              G.poly_outline = (this.asciiborder << 8) >>> 0;
              queuestrn(omf(V, g.RED[sl]), mapfontscale / 100, s, darkenedby(this.asciicol, darken), 2);
            }
            else if (this.sha.top < SIDE_FLOOR) {
              const s1 = G.s0 + String.fromCharCode(this.asciichar1);
              G.poly_outline = (G.bordcolor << 8) >>> 0;
              queuestrn(omf(V, g.DEEP), mapfontscale / 100, s1, darkenedby(gradient(G.bordcolor, this.asciicol1, 0, 0.3, 1), darken), 2);
              G.poly_outline = (this.asciiborder << 8) >>> 0;
              queuestrn(V, mapfontscale / 100, s, darkenedby(this.asciicol, darken), 2);
            }
            else
              queuestrn(V, mapfontscale / 100, s, darkenedby(this.asciicol, darken), 2);
          } finally { G.poly_outline = p; }
        }

        if (this.onradar && WDIM() === 2 && GDIM() === 3) throw new NotPorted('addradar (3D)'); // STAGE2-STUB (3D)
      } finally { G.neon_mode = b; }
    }

    this.draw_grid();

    if (WDIM() === 2 && GDIM() === 3) throw new NotPorted('radar_grid (3D)'); // STAGE2-STUB (3D)

    this.check_rotations();

    // CAP_EDIT
    if (!G.inHighQual) mapeditor_drawGhosts(c, this.V, c.type);

    // CAP_MODEL: netgen::buildVertexInfo (the paper model; only when netgen is active)
  }

  set_towerfloor(cf: (c: cell) => number = coastvalEdge): void {
    const c = this.c;
    const g = cgi();
    if (weirdhyperbolic() || sphere() || (euc_in() && S7() === 4 && BITRUNCATED())) {
      set_floor(g.shFloor);
      return;
    }
    let j = -1;

    if (euclid()) j = 10;
    else if (cf(c) > 1) {
      const i = towerval(c, cf);
      if (i === 4) j = 0;
      if (i === 5) j = 1;
      if (i === 6) j = 2;
      if (i === 8) j = 3;
      if (i === 9) j = 4;
      if (i === 10) j = 5;
      if (i === 13) j = 6;
      if (PURE()) {
        if (i === 7) j = 7;
        if (i === 11) j = 8;
        if (i === 15) j = 9;
      }
    }

    if (j >= 0)
      set_floor_t(applyDowndir(c, cf), g.shTower[j]);
    else if (c.wall !== waLadder)
      set_floor(g.shMFloor);
  }

  set_zebrafloor(): void {
    const c = this.c;
    const g = cgi();

    if (hat_in() || kite_in()) { set_floor(g.shFloor); return; }

    if (euclid()) { set_floor_h(g.shTower[10]); return; }
    if (weirdhyperbolic()) {
      set_floor(g.shFloor); return;
    }

    const si = patterns_getpatterninfo(c, patterns_PAT_ZEBRA, patterns_SPF_SYM0123);

    let j: number;
    if (PURE()) j = 4;
    else if (si.id >= 4 && si.id < 16) j = 2;
    else if (si.id >= 16 && si.id < 28) j = 1;
    else if (si.id >= 28 && si.id < 40) j = 3;
    else j = 0;

    set_floor_t(applyPatterndir(c, si), g.shZebra[j]);
  }

  set_maywarp_floor(): void {
    const c = this.c;
    const g = cgi();
    const warp = isWarped(c);
    if (warp && use_warp_graphics()) {
      if (!stdhyperbolic()) {
        set_floor(g.shTriheptaFloor);
        return;
      }
      const si = patterns_getpatterninfo(c, patterns_PAT_TYPES, 0);
      if (si.id === 0 || si.id === 1)
        set_floor(g.shTriheptaFloor);
      else if (si.id >= 14)
        set_floor(g.shFloor);
      else
        set_floor_t(applyPatterndir(c, si), g.shTriheptaSpecial[si.id]);
    }
    else if (is_nice_dual(c)) set_floor(g.shBigTriangle);
    else set_floor(g.shFloor);
  }

  set_reptile_floor(V: shiftmatrix, col: number, nodetails = false): void {
    const c = this.c;
    const g = cgi();

    const si =
      euc_in(2, 6) ?
        patterns_getpatterninfo(c, patterns_PAT_COLORING, patterns_SPF_CHANGEROT)
        :
        patterns_getpatterninfo(c, patterns_PAT_ZEBRA, patterns_SPF_SYM0123);

    let j: number;

    if (!G.wmescher) j = 4;
    else if (!BITRUNCATED()) j = 0;
    else if (si.id < 4) j = 0;
    else if (si.id >= 4 && si.id < 16) j = 1;
    else if (si.id >= 16 && si.id < 28) j = 2;
    else if (si.id >= 28 && si.id < 40) j = 3;
    else j = 4;

    if (euc_in(2, 6)) j = 0;

    let D = applyPatterndir(c, si);
    if (euc_in(2, 6) && GOLDBERG()) D = ddspin(c, si.dir);
    if (G.wmescher && (stdhyperbolic() || euc_in(2, 6)))
      set_floor_t(D, g.shReptile[j][0]);
    else this.set_maywarp_floor();

    if (nodetails) return;

    let dcol = 0;

    let ecol = -1;

    if (isReptile(c.wall)) {
      const wp = c.wparam & 0xFF;
      if (wp === 1)
        ecol = 0xFFFF00;
      else if (wp <= 5)
        ecol = 0xFF0000;
      else
        ecol = 0;
      if (ecol) ecol = gradient(0, ecol, -1, sintick(30), 1);
    }

    if (ecol === -1 || ecol === 0) dcol = darkena(col, 1, 0xFF);
    else dcol = darkena(ecol, 0, 0x80);

    const p = G.poly_outline;
    G.poly_outline = doHighlight() && ecol !== -1 && ecol !== 0 ? OUTLINE_ENEMY : OUTLINE_DEFAULT();
    try {
      if (this.sha.top !== SIDE_INFDEEP) {
        if (G.wmescher)
          queuepoly(smv(V, D), g.shReptile[j][1], dcol);
        else
          draw_floorshape(c, V, g.shMFloor, dcol);
      }

      if (ecol !== -1) {
        queuepoly(smv(V, D), g.shReptile[j][2], ((ecol << 8) + 0xFF) >>> 0);
        queuepoly(smv(V, D), g.shReptile[j][3], ((ecol << 8) + 0xFF) >>> 0);
      }
    } finally { G.poly_outline = p; }
  }

  set_emeraldfloor(): void {
    const c = this.c;
    const g = cgi();
    if (!euclid() && BITRUNCATED() && GDIM() === 2) {
      const si = patterns_getpatterninfo(c, patterns_PAT_EMERALD, patterns_SPF_SYM0123);

      let j = -1;

      if (si.id === 8) j = 0;
      else if (si.id === 12) j = 1;
      else if (si.id === 16) j = 2;
      else if (si.id === 20) j = 3;
      else if (si.id === 28) j = 4;
      else if (si.id === 36) j = 5;

      if (j >= 0) {
        set_floor_t(applyPatterndir(c, si), g.shEmeraldFloor[j]);
        return;
      }
    }

    set_floor(g.shCaveFloor);
  }

  shmup_gravity_floor(): void {
    const c = this.c;
    if (GDIM() === 2 && cellEdgeUnstable(c))
      set_floor(cgi().shMFloor);
    else
      set_floor(cgi().shFullFloor);
  }

  draw_reptile(col: number): void {
    const qfib = qfi_save();
    this.set_reptile_floor(this.V, col, this.sha.top === SIDE_INFDEEP);
    draw_qfi(this.c, this.V, col);
    qfi_restore(qfib);
  }
}

/** inline void drawcell(cell *c, const shiftmatrix& V) { celldrawer dd; dd.c = c; dd.V = V; dd.draw(); } */
export function drawcell(c: cell, V: shiftmatrix): void {
  const dd = new celldrawer();
  dd.c = c;
  dd.V = V;
  dd.draw();
}

// --- helpers ---

/** #define SHADOW_WALL 0x60, SHADOW_SL 0x18 (hyper.h) */
const SHADOW_WALL = 0x60, SHADOW_SL = 0x18;
/** eNeon::illustration (colors.cpp) */
const eNeon_illustration = 4; // eNeon.illustration (colors.ts is not a leaf module)
/** static constexpr bool randterra = false (complex2.cpp terracotta) */
const terracotta_randterra = false;

/** xyzscale(const shiftmatrix& V, ld fac, ld facz) */
function xyzscale_sm(V: shiftmatrix, fac: number, facz: number): shiftmatrix { return { T: xyzscale(V.T, fac, facz), shift: V.shift }; }
/** shiftmatrix V * transmatrix T, as a shiftmatrix with V's shift */
function sm_shift(V: shiftmatrix, T: transmatrix): shiftmatrix { return smul(V, T); }
/** V.T * T */
function tmul_t(V: shiftmatrix, T: transmatrix): transmatrix { return tmul(V.T, T); }
/** h * x for a hyperpoint */
function hmul_s(h: hyperpoint, x: number): hyperpoint { return hmul(h, x); }
/** transmatrix spintick(int period, ld phase IS(0)) (animations.cpp): spin(ptick(period, phase)) */
function spintick(period: number, phase = 0): transmatrix { return spin(ptick(period, phase)); }
/** __builtin_ctz */
function ctz32(x: number): number { return 31 - Math.clz32(x & -x); }
/** get_sightrange_ambush() (basegraph.cpp): max(get_sightrange(), ambush::distance) */
function get_sightrange_ambush(): number { return Math.max(getDistLimit() + G.sightrange_bonus, G.ambush_distance); }
