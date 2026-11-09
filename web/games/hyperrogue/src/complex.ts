// complex.cpp of HyperRogue 13.1o: the gameplay/generation of the more complex lands and mechanics (whirlwind,
// elec, princess, clearing, whirlpool, mirror, hive, heat + livecaves, tortoise, dragon, sword, kraken, prairie,
// ca, windmap, halloween, dungeon). Package P5. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Overloads: mirror::reflect keeps the name; sword::pos(cell*, sworddir, bool) is `sword_pos`, sword::pos(int id,
// bool rev) is `sword_pos_n`; windmap::getId(cell*) is `windmap_getId`, the file-local getId(cellwalker) is
// `getId_cw`; tortoise::update (file-local) is `tortoise_update`. The windcode tables are in windcodes.ts.
// printf debug output is left out (PORTING.md, "Macros").
import { achievement_count, achievement_gain_once, achievement_score, LB_PRINCESS } from './achievement.ts';
import {
  animate_item_throw, animateCorrectAttack, animateHug, animateMovement, commitAnimations, drawFireParticles,
  drawFlash, drawLightning, drawParticles, indAnimateMovement, LAYER_BIG, LAYER_BOAT, LAYER_SMALL,
} from './animations.ts';
import { hat_in } from './aperiodic-hat.ts';
import { arcm_current_faces, arcm_in } from './archimedean.ts';
import {
  attackMonster, canAttack, fallMonster, killMonster, killThePlayer, killThePlayerAt, tkills,
} from './attack.ts';
import { preventbarriers } from './barriers.ts';
import { addMessage } from './basegraph.ts';
import { buildEquidistant, gen_alt, gen_alt_around, have_alt, horo_ok, moreBigStuff } from './bigstuff.ts';
import { bt_in } from './binary-tiling.ts';
import {
  adj_minefield_cells, ALTDIST_ERROR, BARLEV, celldist, celldistAlt, celldistance, createMov, dirdiff, getBits,
  getDistLimit, isNeighbor, neighborId,
} from './cell.ts';
import { exit } from './cfile.ts';
import {
  aperiodic, BITRUNCATED, cgflags, closed_manifold, closed_or_bounded, DUAL, eubinary, euclid, gBinary4,
  gFieldQuotient, gNormal, GOLDBERG, gSphere, hyperbolic, IRREGULAR, mhybrid, PURE, qPORTALSPACE, quotient, S3, S6,
  S7, sol, sphere, WDIM, weirdhyperbolic,
} from './classes.ts';
import { arg_argf, arg_argi, arg_argis, arg_args, arg_shift } from './commandline.ts';
import { princessgender } from './config.ts';
import {
  type eItem, type eMonster, type eWall, itBabyTortoise, itBuggy, itDragon, itFulgurite, itGold, itGreenGrass,
  itGreenStone, itKey, itKraken, itNone, itOrbAether, itOrbBull, itOrbDigging, itOrbEmpathy, itOrbLife, itOrbLuck,
  itOrbSafety, itOrbShell, itOrbShield, itOrbSpeed, itOrbStone, itOrbSword, itOrbSword2, itOrbThorns, itOrbTime,
  itOrbUndeath, itOrbWater, itOrbWinter, itOrbYendor, itPalace, itRoyalJelly, itSavedPrincess, itShard, itSilver,
  itTreat, itWhirlpool, itWindstone, laBarrier, laBlizzard, laCA, laCaves, laClearing, laCocytus, laDeadCaves,
  laDocks, laDragon, laDryForest, laDungeon, laEclectic, laEmerald, laEndorian, laHive, laIce, laIvoryTower,
  laKraken, laLivefjord, laMirror, laMirrored, laMirrorOld, laMirrorWall, laMirrorWall2, laMountain, laNone,
  laOvergrown, laPalace, laPrairie, laRose, laStorms, laTrollheim, laVolcano, laWhirlpool, laWhirlwind, laWildWest,
  laWineyard, minf, moAirElemental, moAngryDie, moArrowTrap, moBomberbird, moBug0, moBug2, moCrystalSage, moCShark,
  moCultist, moCultistLeader, moDarkTroll, moDeadBug, moDesertman, moDragonHead, moDragonTail, moDraugr,
  moEarthElemental, moFatGuard, moFireElemental, moFireFairy, moFlailer, moFriendlyGhost, moGargoyle, moGhost,
  moGreater, moGreaterM, moGreaterShark, moHedge, moHerdBull, moHexSnake, moHexSnakeTail, moIvyDead, moIvyNext,
  moKrakenH, moKrakenT, moLancer, moLesser, moLesserM, moLightningBolt, moMetalBeast2, moMimic, moMonkey, moMutant,
  moNecromancer, moNone, moPirate, moPlayer, moPrincess, moPrincessArmed, moPyroCultist, moRagingBull, moRanger,
  moRatlingAvenger, moShark, moSkeleton, moTentacleGhost, moTentacletail, moTroll, moVampire, moVineBeast,
  moWaterElemental, moWindCrow, moWitch, moWitchFire, moWormtail, moZombie, waArrowTrap, waBarrier, waBigBush,
  waBigStatue, waBigTree, waBoat, waBonfireOff, waCanopy, waCavefloor, waCavewall, waCharged, waChasm, waCIsland,
  waCIsland2, waClosedGate, waClosePlate, waCloud, waDeadfloor, waDeadfloor2, waDeadTroll, waDeadTroll2, waDeadwall,
  waDock, waEternalFire, waExplosiveBarrel, waFire, waFireTrap, waFrozenLake, waGargoyle, waGargoyleBridge,
  waGargoyleFloor, waGiantRug, waGrounded, waIcewall, waLadder, waLake, waMagma, waMetal, waMineMine, waMirror,
  waMirrorWall, waNone, waOpenGate, waOpenPlate, waPartialFire, waPetrified, waPetrifiedBridge, waPlatform, waRed1,
  waRed2, waRed3, waRose, waRubble, waSaloon, waSandstone, waSea, waSmallBush, waSmallTree, waSolidBranch, waStone,
  waStrandedBoat, waTempBridge, waTempBridgeBlocked, waTempFloor, waThumperOn, waTrunk, waVinePlant, waWaxWall,
  waWeakBranch, winf,
} from './content.ts';
import { dynamicval, i16, idiv, sortedKeys, std_sort, u8 } from './cpp.ts';
import { bow_crossbow_mode } from './crossbow.ts';
import { raiseBuggyGeneration } from './debug.ts';
import { bfs, gamerange, looped } from './environment.ts';
import { euc2_coordinates, euc_in } from './euclid.ts';
import {
  type cellfunction, generate_around, get_expansion, ts_add, ts_left_of, ts_left_parent, ts_right_of,
  ts_right_parent, type_in,
} from './expansion.ts';
import { fieldpattern_btspin, fieldpattern_getcurrfp } from './fieldpattern.ts';
import {
  cellHalfvine, checkOrb, do_not_touch_this_wall, hasTimeout, inmirror, is_mirrorland, isActiveEnemy, isAlchAny,
  isBug, isDemon, isDragon, isElectricLand, isFire, isFireOrMagma, isFriendly, isHaunted, isIcyLand, isIvy,
  isMetalBeast, isMultitile, isMutantIvy, isPrincess, isSealand, isStandardTree, isWatery, isWateryOrBoat,
  snakelevel,
} from './flags.ts';
import { activateActiv } from './game.ts';
import { G } from './globals.ts';
import { celldistAltPlus } from './graph.ts';
import { its, pick123 } from './hprint.ts';
import {
  addHook, AF_GETPLAYER, AF_MSG, AF_NORMAL, AF_NOSHIELD, AF_ONLY_FBUG, AF_TOUGH, among, BUGCOLORS, BUGLEV, gcd, gmod,
  INF, INFD, isize, MAXPLAYER, NotPorted, ORBBASE, PRIZEMUL, SAGEMELT, YDIST,
} from './hyper.ts';
import {
  C0, cspin, fixmatrix, gpushxto0, hdist, Id, tC0, tmul, tmulh, type transmatrix, xpush0,
} from './hyperpoint.ts';
import { collectItem, gainItem, gainShard, gold, moveItem, NO_LOVE, pickupMovedItems } from './items.ts';
import { notDippingFor, rebalance_treasure, setdist } from './landgen.ts';
import { inmirror_cw, ls_any_chaos, ls_horodisk_structure, ls_hv_structure, ls_voronoi_structure } from './landlock.ts';
import { spM, spW, XLAT } from './language.ts';
import {
  cell, cellwalker, cw_to_hs, heptagon, hs_to_cw, iteration_limit, jumpdata, manual_celllister, match, movei,
  moveimon, NOBARRIERS, NOBARRIERS2, NODIR, TELEPORT,
} from './locations.ts';
import {
  coastvalEdge, destroyBoats, destroyHalfvine, explodeBarrel, explosion, makeflame, toggleGates, useup,
} from './mapeffects.ts';
import { getGhostcount, hardness_empty, palaceHP } from './monstergen.ts';
import { beastAttack, beastcrash, mountmove, moveMonster } from './monstermove.ts';
import { multi_playerActive } from './multi.ts';
import { placeLocalOrbs, placePrizeOrb } from './orbgen.ts';
import { castLightningBolt, empathyMove, markEmpathy, markOrb } from './orbs.ts';
import {
  againstCurrent, againstRose, againstWind, airdist, checkflags, logical_adjacent, P_AETHER, P_DEADLY, P_FISH,
  P_ISFRIEND, P_ISPLAYER, P_JUMP1, P_MIRROR, P_MIRRORWALL, P_MONSTER, passable, passable_for,
} from './passable.ts';
import {
  ctof, fieldpattern_fieldval, fieldpattern_fieldval_uniq, fieldpattern_fieldval_uniq_rand, getHemisphere, ishept,
  kraken_pseudohept, pseudohept, zebra3, zebra40,
} from './pattern2.ts';
import { changes, isPlayerInBoatOn, isPlayerOn, numplayers, playerpos, produceGhost, sideAttack, swap_data } from './pcmove.ts';
import { showMissionScreen } from './quit.ts';
import { hrand, hrandom_shuffle, pick } from './rand.ts';
import { is_cell_removed } from './savemem.ts';
import { playSeenSound, playSound } from './sound.ts';
import { rg_princess, start_game } from './system.ts';
import { bignum } from './util.ts';
import { windcodes18920, windcodes5676 } from './windcodes.ts';
import { yendor_hardness } from './yendor.ts';

// ---------------------------------------------------------------------------------------------------------------
// namespace whirlwind

export function whirlwind_fzebra3(c: cell): number {
  if (arcm_in()) return 0;
  if (euclid()) {
    if (closed_manifold()) return 0;
    const co = euc2_coordinates(c);
    const y = co[1];
    return 1 + (idiv(i16(y) + 50000, 3) % 3);
  }
  if (S7() === 5) return getHemisphere(c, 0) > 0 ? 1 : 2;
  if (S7() < 5) {
    const d = celldistance(G.currentmap.gamestart(), c);
    if (d === 0) return 0;
    if (S7() === 4 && d === 3) return 0;
    if (S7() === 3 && d === 2 && !ctof(c)) return 0;
    return 1;
  }
  return zebra3(c);
}

export function whirlwind_switchTreasure(c: cell): void {
  c.item = itNone;
  if (G.safety) return;
  if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moAirElemental] + G.kills[moWindCrow]), 200, c.land) && notDippingFor(itWindstone)
    && (!G.shmup_on || getGhostcount() < 2))
    c.item = itWindstone;
  else if (hrand(5000) < 20 * PRIZEMUL)
    placeLocalOrbs(c);
}

export function whirlwind_cat(c: cell): number {
  if (c.land !== laWhirlwind) return 0;
  if (c.wall !== waNone && c.wall !== waChasm &&
    c.wall !== waSea && !isAlchAny(c) &&
    c.wall !== waMineMine && c.wall !== waFire) return 0;
  if (c.item === itKey || c.item === itOrbYendor) return 0;
  if (airdist(c) < 3) return 0;
  if (c.monst === moHexSnake || c.monst === moHexSnakeTail) return 0;
  return whirlwind_fzebra3(c);
}

let whirlwind_where: cell = null!;

/** G.whirlwind_qdirs (read through a function: calcdirs changes it) */
function qdirs(): number { return G.whirlwind_qdirs; }

function whirlwind_gdist(d: number, e: number): number { return dirdiff(d - e, whirlwind_where.type); }

export function whirlwind_calcdirs(c: cell): void {
  whirlwind_where = c;
  const d = whirlwind_cat(c);
  G.whirlwind_qdirs = 0;
  if (d === 0) return;
  let qdf = 0, qdt = 0;
  const cats: number[] = new Array(c.type).fill(0);
  for (let i = 0; i < c.type; i++)
    cats[i] = whirlwind_cat(createMov(c, i));
  const dfrom = G.whirlwind_dfrom, dto = G.whirlwind_dto;
  for (let i = 0; i < c.type; i++)
    if (cats[i] === d) {
      const c1 = (cats[(i + 1) % c.type] !== d);
      const c2 = (cats[(i + c.type - 1) % c.type] !== d);
      if (c1 && !c2) dto[qdt++] = i;
      if (c2 && !c1) dfrom[qdf++] = i;
    }
  G.whirlwind_qdirs = qdf;
  if (qdirs() === 2) {
    const cur = whirlwind_gdist(dfrom[0], dto[0]) + whirlwind_gdist(dfrom[1], dto[1]);
    const alt = whirlwind_gdist(dfrom[0], dto[1]) + whirlwind_gdist(dfrom[1], dto[0]);
    if (alt < cur) { const t = dto[0]; dto[0] = dto[1]; dto[1] = t; }
  }
}

function whirlwind_mindist(d: number, tab: number[]): number {
  if (qdirs() === 0) return NODIR;
  if (qdirs() === 1) return whirlwind_gdist(d, tab[0]);
  return Math.min(whirlwind_gdist(d, tab[0]), whirlwind_gdist(d, tab[1]));
}

export function whirlwind_winddir(d: number): number {
  if (d === -1) return 0;
  const mdf = whirlwind_mindist(d, G.whirlwind_dfrom);
  const mdt = whirlwind_mindist(d, G.whirlwind_dto);
  if (mdf < mdt) return -1;
  if (mdf > mdt) return 1;
  return 0;
}

// (whirlwind::build is unused in 13.1o)

function whirlwind_moveAt(c: cell, cl: manual_celllister): void {
  if (cl.listed(c)) return;
  whirlwind_calcdirs(c);
  if (qdirs() !== 1) return;
  const whirlline: cell[] = [];
  whirlline.push(c);
  let prev = c;
  let c2 = c.move(G.whirlwind_dfrom[0]);
  while (true) {
    if (c === c2) break;
    whirlwind_calcdirs(c2);
    if (qdirs() === 0) break;
    const cc2 = c2;
    if (qdirs() === 1) { whirlline.push(c2); c2 = c2.move(G.whirlwind_dfrom[0]); }
    else if (c2.move(G.whirlwind_dto[0]) === prev)
      c2 = c2.move(G.whirlwind_dfrom[1]);
    else
      c2 = c2.move(G.whirlwind_dfrom[0]);
    prev = cc2;
  }
  const z = isize(whirlline);
  for (let i = 0; i < z; i++) {
    cl.add(whirlline[i]);
    if (whirlline[i].mpdist === BARLEV())
      whirlwind_switchTreasure(whirlline[i]);
  }
  for (let i = 0; i < z - 1; i++) {
    moveItem(whirlline[i], whirlline[i + 1], true);
    if (whirlline[i].item)
      animateMovement(match(whirlline[i + 1], whirlline[i]), LAYER_BOAT);
  }
  for (let i = 0; i < z; i++)
    pickupMovedItems(whirlline[i], i === z - 1 ? whirlline[0] : whirlline[i + 1]);
}

export function whirlwind_move(): void {
  const cl = new manual_celllister();
  try {
    for (let i = 0; i < isize(G.dcal); i++) {
      const c = G.dcal[i];
      whirlwind_moveAt(c, cl);
    }
    // Keys and Orbs of Yendor always move
    const yi = G.yendor_yi;
    for (let i = 0; i < isize(yi); i++) {
      whirlwind_moveAt(yi[i].path[0], cl);
      whirlwind_moveAt(yi[i].key(), cl);
    }
  }
  finally { cl.destroy(); }
}

export function whirlwind_jumpFromWhereTo(c: cell, player: boolean, jdata: jumpdata): cell {
  jdata.uniq = true;
  for (let i = 0; i < 2; i++) {
    whirlwind_calcdirs(c);
    if (qdirs() !== 1) return null!;
    const mi = movei.sd(c, G.whirlwind_dfrom[0]);
    jdata.moves.push(mi.rev());
    const c2 = c.move(G.whirlwind_dfrom[0]);
    if (!passable(c, c2, P_JUMP1 | P_ISPLAYER)) return null!;
    if (player && i === 0 && !passable(c, c2, P_ISPLAYER)) return null!;
    c = c2;
  }
  jdata.moves.reverse();
  whirlwind_calcdirs(c);
  if (qdirs() !== 1) return null!;
  return c;
}

export function whirlwind_jumpDestination(c: cell): cell {
  for (let i = 0; i < 2; i++) {
    whirlwind_calcdirs(c);
    if (qdirs() !== 1) return null!;
    c = c.move(G.whirlwind_dto[0]);
  }
  whirlwind_calcdirs(c);
  if (qdirs() !== 1) return null!;
  return c;
}

// ---------------------------------------------------------------------------------------------------------------
// namespace elec

/** enum eCharge */
export const ecCharged = 0, ecGrounded = 1, ecIsolator = 2, ecConductor = 3;
export type eCharge = number;

function elec_conduct(cf: eCharge, ct: eCharge): boolean {
  if (ct === ecIsolator) return false;
  if (ct === ecConductor) return true;
  return ct !== cf;
}

export function elec_getCharge(c: cell): eCharge {
  const ao = G.elec_afterOrb && !!c.ligon;

  /* not yet generated */
  if (c.land === laNone) return ecIsolator;

  if (c.wall === waCharged) return ecCharged;
  if (c.wall === waSea || c.wall === waGrounded) return ecGrounded;
  if (c.wall === waSandstone || c.wall === waDeadTroll ||
    c.wall === waDeadTroll2 ||
    c.wall === waExplosiveBarrel ||
    c.wall === waVinePlant ||
    c.wall === waMetal || isAlchAny(c))
    return isElectricLand(c) ? ecConductor : ecGrounded;
  if (c.wall === waBigTree || c.wall === waSmallTree)
    return ecGrounded;
  if (among(c.wall, waRed1, waRed2, waRed3, waRubble, waDeadfloor2))
    return ecIsolator;
  if (c.wall === waBarrier)
    return ecIsolator;
  if (c.wall === waChasm)
    return ecIsolator;

  if (G.shmup_on ? isPlayerOn(c) : (isPlayerOn(c) || (G.items[itOrbEmpathy] && isFriendly(c)))) {
    if (G.items[itOrbShield]) return ecIsolator;
    if (G.elec_afterOrb) return ecIsolator;
    if (!G.items[itOrbAether]) return isElectricLand(c) ? ecConductor : ecGrounded;
  }

  else if (c.monst
    && c.monst !== moGhost && c.monst !== moIvyDead && c.monst !== moIvyNext
    && !(isDragon(c.monst) && !c.hitpoints)
  )
    return isElectricLand(c) ? (ao ? ecCharged : ecConductor) : ecGrounded;

  if (!isElectricLand(c))
    return ecGrounded;

  if (ao) return ecCharged;

  return ecIsolator;
}

// To process conductivity, consider the following graph:
// - edges are between conductors and adjacent charged/grounded/conductor cells
// - all charged cells are connected to one special cell '0'
// - all grounded cells are connected to one special cell '1'
// - cells '0' and '1' are connected
// If A and B are in the same biconnected component, then there is a closed circuit,
// consisting of all other cells in that component.
// To find biconnected components, we are using the Hopcroft-Tarjan algorithm.

class chargedata {
  c: cell = null!;
  otmp = 0;
  lowlink = 0;
  instack = false;
  fire = false;
}

const elec_charges: chargedata[] = [];
const elec_xstack: [number, number][] = [];
const elec_chargecells: cell[] = [];

/** charges.resize(n) */
function elec_charges_resize(n: number): void {
  while (elec_charges.length > n) elec_charges.pop();
  while (elec_charges.length < n) elec_charges.push(new chargedata());
}

function elec_hasdata(c: cell): boolean {
  return c.listindex >= 0 && c.listindex < isize(elec_charges) && elec_charges[c.listindex].c === c;
}

function elec_connect(from: number, c: cell): void {
  if (elec_hasdata(c)) {
    // seen again: set the lowlink
    if (!elec_charges[c.listindex].instack) return;
    if (c.listindex < elec_charges[from].lowlink)
      elec_charges[from].lowlink = c.listindex;
  }
  else {
    const id = isize(elec_charges);
    elec_charges.push(new chargedata());

    {
      const ch = elec_charges[id];
      ch.c = c; ch.otmp = c.listindex; ch.lowlink = id; c.listindex = id;
      ch.instack = true; ch.fire = false;
    }

    elec_xstack.push([from, id]);

    const chh = elec_getCharge(c);

    if (chh === ecGrounded) {
      elec_xstack.push([id, 0]);
      elec_charges[id].lowlink = 0;
    }
    else if (chh === ecCharged) {
      elec_xstack.push([id, 1]);
      if (from !== 1) elec_charges[id].lowlink = 1;
    }

    for (const c2 of adj_minefield_cells(c)) {
      if (c2.listindex === from) continue;
      const ct = elec_getCharge(c2);
      if (elec_conduct(chh, ct))
        elec_connect(id, c2);
    }

    if (elec_charges[id].lowlink < elec_charges[from].lowlink)
      elec_charges[from].lowlink = elec_charges[id].lowlink;

    if (elec_charges[id].lowlink >= from) {
      while (elec_xstack[elec_xstack.length - 1][0] !== from || elec_xstack[elec_xstack.length - 1][1] !== id) {
        elec_xstack.pop();
      }
      elec_xstack.pop();
    }

    elec_charges[id].instack = false;
  }
}

function elec_affect(c: cell): void {
  c.ligon = true;
  if (c.monst) {
    if (c.monst === moMetalBeast2 && !c.item)
      c.item = itFulgurite;
    killMonster(c, moLightningBolt);
  }
  if (isPlayerOn(c)) {
    killThePlayerAt(moLightningBolt, c, 0n);
  }
  if (c.wall === waSandstone) {
    c.wall = waNone; drawParticles(c, winf[waSandstone].color, 16);
    if (c.land === laStorms)
      c.item = itFulgurite;
  }
  if (c.wall === waRed1) c.wall = waNone;
  if (c.wall === waRed2) c.wall = waRed1;
  if (c.wall === waRed3) c.wall = waRed2;
  if (c.wall === waDeadTroll) c.wall = waCavefloor;
  if (c.wall === waBigTree || c.wall === waSmallTree)
    makeflame(c, 10, false);
  if (c.wall === waExplosiveBarrel)
    explodeBarrel(c);
  if (c.wall === waDeadTroll2 || isAlchAny(c) || c.wall === waVinePlant) {
    drawParticles(c, winf[c.wall].color, 16);
    c.wall = waNone;
  }

  /* destroy charged walls on the border */
  if (c.wall === waCharged) for (let i = 0; i < c.type; i++) {
    const c1 = c.move(i); if (!c1) continue;
    if (c1.wall === waGrounded) c.wall = waNone;
  }
}

function elec_listChargedCells(c: cell, cl: manual_celllister, last: eCharge = ecConductor): void {
  if (cl.listed(c)) return;
  const here = elec_getCharge(c);
  if (here === ecIsolator) cl.add(c);
  if (!elec_conduct(last, here)) return;
  if (here === ecCharged) elec_chargecells.push(c);
  cl.add(c);
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i);
    if (c2) elec_listChargedCells(c2, cl, here);
  }
}

export function elec_init(): void {
  elec_chargecells.length = 0;
  if (!G.elec_haveelec && !G.elec_afterOrb) return;
  {
    const cl = new manual_celllister();
    try {
      for (let i = 0; i < isize(G.dcal); i++) elec_listChargedCells(G.dcal[i], cl);
    }
    finally { cl.destroy(); }
  }

  elec_charges_resize(2);
  elec_charges[0].lowlink = 0; elec_charges[1].lowlink = 1;
  if (!G.elec_havecharge) return;

  elec_xstack.length = 0;

  for (let i = 0; i < isize(elec_chargecells); i++)
    elec_connect(1, elec_chargecells[i]);

  G.elec_havethunder = elec_charges[1].lowlink === 0;
  if (G.elec_havethunder) {
    for (let i = 0; i < isize(elec_xstack); i++) {
      const k = elec_xstack[i][0];
      const l = elec_xstack[i][1];
      elec_charges[k].fire = true;
      elec_charges[l].fire = true;
    }
  }
}

function elec_fire(): void {
  if (G.elec_havethunder) {
    addMessage(XLAT('There is a flash of thunder!'));
    playSound(null!, 'storm');
    drawLightning();
    for (let i = 2; i < isize(elec_charges); i++) if (elec_charges[i].fire)
      elec_affect(elec_charges[i].c);
    G.recompute_los = true;
  }
}

export function elec_cleanup(): void {
  for (let i = 2; i < isize(elec_charges); i++)
    elec_charges[i].c.listindex = elec_charges[i].otmp;
  elec_charges_resize(0);
}

// (elec::draw and elec::drawcharges are graphics: left out)

export function elec_affected(c: cell): boolean {
  if (c.listindex >= 0 && c.listindex < isize(elec_charges) && elec_charges[c.listindex].c === c)
    return elec_charges[c.listindex].fire;
  return false;
}

/** struct builder { builder() { init(); } ~builder() { cleanup(); } } */
export function elec_builder<T>(f: () => T): T {
  elec_init();
  try { return f(); }
  finally { elec_cleanup(); }
}

export function elec_act(): void {
  const k = tkills();
  for (let i = 0; i < numplayers(); i++)
    if (multi_playerActive(i) && isElectricLand(playerpos(i)) && !G.elec_afterOrb) {
      markOrb(itOrbShield); markOrb(itOrbAether);
    }
  elec_builder(() => { elec_fire(); });
  if (!G.elec_afterOrb)
    achievement_count('ELEC', tkills() - k, 0);
}

// 0 = no close escape, 1 = close escape, 2 = message already shown
export function elec_checklightningfast(): void {
  changes.value_keep(G, 'elec_lightningfast');
  if (G.elec_lightningfast === 1) {
    addMessage(XLAT('Wow! That was close.'));
    G.elec_lightningfast = 2;
  }
  if (G.elec_lightningfast > 1) return;
  elec_builder(() => {
    for (let i = 0; i < numplayers(); i++)
      if (multi_playerActive(i) && elec_affected(playerpos(i)))
        G.elec_lightningfast = 1;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// namespace princess

export const OUT_OF_PRISON = 200;
export const OUT_OF_PALACE = 250;
export const PRADIUS0 = 141;
export const PRADIUS1 = 150;

/** struct princess::info */
export class princess_info {
  /** id of this info */
  id = 0;
  /** where was the Princess locked */
  prison: cell = null!;
  /** alt of the prison */
  alt: heptagon = null!;
  /** best dist achieved */
  bestdist = 0;
  /** best dist achieved, by the player */
  bestnear = 0;
  /** number of Rugs at 120 */
  value = 0;
  /** where is the Princess currently */
  princess: cell = null!;
  /** in which turn have we been together -- for the hug animation */
  together = 0;
  clone(): princess_info { return Object.assign(new princess_info(), this); }
}

/** changes.value_keep(*i) */
function keep_info(i: princess_info): void {
  if (!changes.on) return;
  const old = i.clone();
  changes.at_rollback(() => { Object.assign(i, old); });
}

/** gp::loc coords() (returned as the euc::coord it converts to: z = 0) */
export function princess_coords(): [number, number, number] { return [39, 21, 0]; }

function princess_assign(i: princess_info): void {
  if (i.alt) i.alt.emeraldval = i.id;
}

export function princess_newInfo(c: cell): number {
  const i = new princess_info();
  i.prison = c;
  i.princess = c;
  i.alt = c.master.alt;
  i.id = isize(G.princess_infos);
  i.bestdist = 0;
  i.bestnear = OUT_OF_PRISON;
  i.together = -INF;
  G.princess_infos.push(i);
  princess_assign(i);
  return i.id;
}

export function princess_newFakeInfo(c: cell): void {
  const i = new princess_info();
  i.prison = null!;
  i.princess = c;
  i.alt = null!;
  i.id = isize(G.princess_infos);
  i.bestdist = G.items[itSavedPrincess] ? OUT_OF_PALACE : OUT_OF_PRISON;
  i.bestnear = 0;
  i.together = -INF;
  G.princess_infos.push(i);
  princess_assign(i);
}

export function princess_getPrisonInfo(c: cell): princess_info | null {
  if (euclid() || quotient() || sphere()) return null;
  if (c.land !== laPalace) return null;
  if (!c.master.alt) return null;
  const ev = c.master.alt.alt.emeraldval; // NEWYEARFIX
  if (ev < 0 || ev >= isize(G.princess_infos)) return null;
  if (G.princess_infos[ev].alt !== c.master.alt.alt) return null;
  return G.princess_infos[ev];
}

export function princess_getPrincessInfo(c: cell): princess_info | null {
  const infos = G.princess_infos;
  for (let i = 0; i < isize(infos); i++) if (infos[i].princess === c) {
    while (i) {
      infos[i].id = i - 1; princess_assign(infos[i]);
      infos[i - 1].id = i; princess_assign(infos[i - 1]);
      const t = infos[i]; infos[i] = infos[i - 1]; infos[i - 1] = t;
      i--;
    }
    return infos[i];
  }
  return null;
}

export function princess_dist(c: cell): number {
  if (c.land !== laPalace && c.land !== laDungeon) return OUT_OF_PALACE;
  else if (quotient() || sphere()) return OUT_OF_PRISON;
  else if (euclid()) return celldistAlt(c);
  else if (!c.master.alt) return OUT_OF_PRISON;
  else return celldistAlt(c);
}

function princess_clear(): void {
  G.princess_infos.length = 0;
}

function princess_bringBackAt(c: cell): boolean {
  if (!c) return false;
  if (!passable(c, null!, 0n)) return false;
  c.monst = moPrincessArmed;
  c.stuntime = 0;
  c.hitpoints = palaceHP();
  drawFlash(c);
  playSound(c, princessgender() ? 'heal-princess' : 'heal-prince');

  let inf: princess_info | null = null;
  const infos = G.princess_infos;
  for (let i = 0; i < isize(infos); i++) {
    if (infos[i].princess && infos[i].bestdist === OUT_OF_PALACE && isPrincess(infos[i].princess.monst))
      inf = infos[i];
  }
  if (inf) { inf.princess.monst = moNone; inf.princess = c; }
  else princess_newFakeInfo(c);
  return true;
}

export function princess_bringBack(): void {
  if (princess_bringBackAt(G.cwt.peek())) return;
  for (let i = 1; i < isize(G.dcal); i++)
    if (princess_bringBackAt(G.dcal[i])) return;
}

function princess_setdist(i: princess_info, newdist: number): void {
  keep_info(i);
  if (newdist < ALTDIST_ERROR && newdist > i.bestdist) {
    i.bestdist = newdist;
    if (newdist === OUT_OF_PALACE) {
      if (!G.princess_saved)
        if (!G.inv_on || !G.inv_usedForbidden)
          achievement_gain_once('PRINCESS1');
      changes.value_set(G, 'princess_saved', true);
      changes.value_set(G, 'princess_everSaved', true);
      if (G.inv_on && !G.princess_reviveAt)
        changes.value_set(G, 'princess_reviveAt', gold(NO_LOVE));
      G.items[itSavedPrincess]++;
    }
    if (newdist === OUT_OF_PRISON && G.princess_challenge) {
      addMessage(XLAT('Congratulations! Your score is %1.', its(i.value)));
      achievement_gain_once('PRINCESS2', rg_princess);
      if (!G.cheater) achievement_score(LB_PRINCESS, i.value);
      if (changes.on) changes.at_commit(() => showMissionScreen(true));
      else showMissionScreen(true);
    }
  }
  if (i.princess.land === laDungeon && !G.princess_saved && !G.princess_nodungeon) {
    addMessage(XLAT('%The1 says, "not this place, it looks even worse..."', spM(moPrincess)));
    G.princess_nodungeon = true;
  }
}

export function princess_save(princess: cell): void {
  if (euclid()) return;
  const i = princess_getPrincessInfo(princess);
  if (!i || i.bestdist <= 3) { changes.ccell(princess); princess.monst = moNone; }
  else if (i) princess_setdist(i, OUT_OF_PRISON);
}

export function princess_move(mi: movei): void {
  const cf = mi.s;
  const ct = mi.t;
  if (euclid()) return;
  const i = princess_getPrincessInfo(cf);
  if (!i) {
    // note: OK if mapediting or loading
    // printf("Warning: unknown princess\n");
    if (!G.cheater)
      addMessage("Warning: unknown princess (that's a bug, please report)");
    princess_newFakeInfo(ct);
  }
  else {
    keep_info(i);
    i.princess = ct;
    princess_setdist(i, princess_dist(ct));

    for (let j = 0; j < ct.type; j++) {
      const cp = ct.move(j); if (!cp) continue;
      if (isPlayerOn(cp)) {
        let safe = true;
        for (const test of [ct, cp])
          for (let a = 0; a < test.type; a++) {
            const c1 = test.move(a); if (!c1) continue;
            for (let b = 0; b < test.type; b++) {
              const c2 = test.move(b); if (!c2) continue;
              if (isActiveEnemy(c1, moPlayer) || isActiveEnemy(c2, moPlayer))
                safe = false;
            }
          }
        if (safe) {
          if (G.turncount > i.together + 20) {
            animateHug(movei.sd(ct, j), LAYER_SMALL);
            animateHug(movei.sd(ct, j).rev(), LAYER_SMALL);
          }
          i.together = G.turncount;
        }
      }
    }
  }
}

export function princess_mouseSqueak(c: cell): void {
  const m = c.monst;
  const i = princess_getPrisonInfo(c);
  const d = princess_dist(c);

  playSound(c, 'mousesqueak', 40);
  if (!i)
    addMessage(XLAT('%The1 squeaks in a confused way.', spM(m)));
  else if (i.bestdist >= 6)
    addMessage(XLAT('%The1 squeaks gratefully!', spM(m)));
  else if (!i.princess)
    addMessage(XLAT('%The1 squeaks hopelessly.', spM(m)));
  else if (d > 120)
    addMessage(XLAT('%The1 squeaks in despair.', spM(m)));
  else if (d > 90)
    addMessage(XLAT('%The1 squeaks sadly.', spM(m)));
  else if (d > 60)
    addMessage(XLAT('%The1 squeaks with hope!', spM(m)));
  else if (d > 30)
    addMessage(XLAT('%The1 squeaks happily!', spM(m)));
  else
    addMessage(XLAT('%The1 squeaks excitedly!', spM(m)));
}

/** static int msgid (in princess::line) */
const princess_line_state = { msgid: 0 };

export function princess_line(c: cell): void {
  const d = (euclid() || c.master.alt) ? celldistAlt(c) : 200;
  const m = c.monst;

  changes.value_keep(princess_line_state, 'msgid');

  playSound(c, princessgender() ? 'speak-princess' : 'speak-prince');
  const st = princess_line_state;
  while (true) { // retry:
    if (st.msgid >= 127) st.msgid = 0;

    const inpalace = c.land === laPalace || c.land === laDungeon;

    if (st.msgid === 0 && d < 20 && inpalace) {
      addMessage(XLAT('%The1 kisses you, and begs you to bring %him1 away from here.', spM(m)));
    }
    else if (st.msgid === 1 && d >= 20 && inpalace && !G.peace_on) {
      if (m === moPrincess)
        addMessage(XLAT('"I want my revenge. Stun a guard and leave him for me!"', spM(m)));
      else
        addMessage(XLAT('"I wouldn\'t say killing that guard was not pleasant..."', spM(m)));
    }
    else if (st.msgid === 2 && d >= 70 && inpalace) {
      addMessage(XLAT('"Bring me out of here please!"', spM(m)));
    }
    else if (st.msgid === 3 && !inpalace) {
      addMessage(XLAT('%The1 kisses you, and thanks you for saving %him1.', spM(m)));
    }
    else if (st.msgid === 4 && !inpalace && m === moPrincess && !G.peace_on) {
      addMessage(XLAT('"I have been trained to fight with a Hypersian scimitar, you know?"', spM(m)));
    }
    else if (st.msgid === 16 && !inpalace) {
      addMessage(XLAT('"I would love to come to your world with you!"', spM(m)));
    }
    else if (st.msgid === 20 && !inpalace) {
      addMessage(XLAT('"I do not like butterflies. They are treacherous."', spM(m)));
    }
    else if (st.msgid === 32 && !inpalace) {
      addMessage(XLAT('"Straight lines stay close to each other forever, this is so romantic!"', spM(m)));
    }
    else if (st.msgid === 40 && !inpalace) {
      addMessage(XLAT('"I hate roses."', spM(m)));
    }
    else if (st.msgid === 48 && !inpalace) {
      addMessage(XLAT('"Maps... Just like the world, but smaller... how is that even possible?!"', spM(m)));
    }
    else if (st.msgid === 64) {
      addMessage(XLAT('"In this world there is plenty of space for everyone. We do not need wars."', spM(m)));
    }
    else if (st.msgid === 65) {
      addMessage(XLAT('"Only the stupid hyperbugs do not understand this."', spM(m)));
    }
    else if (st.msgid === 72 && !inpalace) {
      addMessage(XLAT('"I have once talked to a Yendorian researcher... he was only interested in infinite trees."', spM(m)));
    }
    else if (st.msgid === 73 && !inpalace) {
      addMessage(XLAT('"Infinite trees are boring. I prefer other graphs."', spM(m)));
    }
    else if (st.msgid === 74 && !inpalace) {
      addMessage(XLAT('"Did you know that the Cultists are relatives of the Desert Men?"', spM(m)));
    }
    else if (st.msgid === 80) {
      addMessage(XLAT('"Are there Temples of Cthulhu in your world? Why not?"', spM(m)));
    }
    else {
      st.msgid++; continue;
    }
    break;
  }

  st.msgid++;
}

export function princess_playernear(c: cell): void {
  const i = princess_getPrisonInfo(c);
  const d = princess_dist(c);
  if (i && d < i.bestnear) {
    keep_info(i);
    if (i.bestnear > 100 && d <= 100) {
      i.value = G.items[itPalace];
      if (G.princess_challenge)
        addMessage(XLAT('Hardness frozen at %1.', its(i.value)));
    }
    i.bestnear = d;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// namespace clearing

/** struct clearingdata */
export class clearingdata {
  root: cell = null!;
  dist = 0;
  buggy = false;
}

export function clearing_new_root(): void {
  if (!G.clearing_current_root || G.clearing_current_root.monst !== moMutant) {
    const ac = G.currentmap.allcells();
    let iter = 0;
    while (!G.clearing_current_root || pseudohept(G.clearing_current_root) || G.clearing_current_root.cpdist < 3) {
      if (iter++ > 100) return;
      G.clearing_current_root = ac[hrand(isize(ac))];
    }
    G.clearing_current_root.monst = moMutant;
    G.clearing_current_root.mondir = NODIR;
    G.clearing_current_root.stuntime = (G.mutantphase + 1) & 15;
  }
}

function clearing_goes_below(c: cell, d: number, steps: number): boolean {
  if (pseudohept(c)) return false;
  if (celldistAlt(c) < d) return true;
  if (celldistAlt(c) > d) return false;
  if (steps === 0) return false;
  for (let i = 0; i < c.type; i++) { const c2 = createMov(c, i); if (clearing_goes_below(c2, d, steps - 1)) return true; }
  return false;
}

function clearing_plantdir(c: cell): number {
  if (have_alt(c))
    gen_alt_around(c);
  const d = celldistAlt(c);

  if (PURE()) {
    for (let i = 0; i < c.type; i++) {
      const c2 = createMov(c, i);
      if (!pseudohept(c2) && celldistAlt(c2) === d - 1)
        return i;
    }
    for (let i = 0; i < c.type; i++) {
      const c2 = createMov(c, i);
      if (celldistAlt(c2) === d - 1)
        return G.geometry === gBinary4 ? i : (i + 1) % c.type;
    }
  }

  for (let i = 0; i < c.type; i++) {
    const c2 = createMov(c, i);
    if (!pseudohept(c2) && celldistAlt(c2) === d - 1)
      return i;
  }

  let quseful = 0, tuseful = 0, tuseful2 = 0;

  for (let i = 0; i < c.type; i++) {
    const c2 = createMov(c, i);
    if (!pseudohept(c2)) {
      if (celldistAlt(c2) === d) {
        let useful = false;
        for (let j = 1; j < S6(); j++) {
          const c3 = createMov(c2, j);
          if (celldistAlt(c3) === d - 1)
            useful = true;
        }
        if (useful) { quseful++; tuseful += (1 << i); tuseful2 = i; }
      }
    }
  }
  if (quseful === 1) return tuseful2;
  if (quseful === 2 && G.geometry === gNormal) {
    let i = 0; // uninitialized in C++ (every case of the standard tiling sets it)
    if (tuseful === (1 << 3) + (1 << 5)) i = 3;
    if (tuseful === (1 << 5) + (1 << 1)) i = 5;
    if (tuseful === (1 << 1) + (1 << 3)) i = 1;
    if (tuseful === (1 << 5) + (1 << 7)) i = 5;
    if (tuseful === (1 << 7) + (1 << 1)) i = 7;
    if ((d & 7) < 4) i = (i + 2) % c.type;
    return i;
  }
  for (let steps = 0; steps < 60; steps++)
    for (let i2 = 0; i2 < c.type; i2++) {
      const c2 = createMov(c, i2);
      if (clearing_goes_below(c2, d, steps))
        return i2;
    }
  // println(hlog, "error in plantdir, quseful = ", quseful);
  return -1;
}

const clearing_onpath: cell[] = [];
const clearing_pdir: number[] = [];
const clearing_rpath: cell[] = [];

export function clearing_generate(c: cell): void {
  if (euclid()) {
    if (quotient()) return; // fix cylinder
    if (pseudohept(c)) return;
    c.monst = moMutant;

    const co = euc2_coordinates(c);
    const x = co[0], y = co[1];

    const xco = x * 2 + y + 1;
    c.stuntime = (8 - idiv(xco, 2)) & 15;
    // 2, 4, 5, 7

    if (pseudohept(createMov(c, 0)))
      c.mondir = 1 + hrand(2) * 4;
    else
      c.mondir = 0;
    return;
  }

  if (c.land === laClearing && ls_horodisk_structure() && celldistAlt(c) >= -1) return;
  if (c.land === laClearing && ls_voronoi_structure() && celldistAlt(c) >= -20) return;

  if (!eubinary() && !horo_ok()) return;
  gen_alt(c);
  if (pseudohept(c)) return;
  const a: heptagon | null = eubinary() ? null : c.master.alt.alt;
  const bpdata = G.clearing_bpdata;
  if (!bpdata.has(a)) bpdata.set(a, new clearingdata());
  const bd = bpdata.get(a)!;
  if (!bd.root) { bd.root = c; bd.dist = 8; bd.buggy = false; }
  if (bd.buggy) return;

  clearing_onpath.length = 0; clearing_pdir.length = 0; clearing_rpath.length = 0;

  let steps = 0;

  let ds = 0; /* set to 0 to silence warning */

  let stepcount = 0;
  while (true) {
    if (c === bd.root) { ds = bd.dist; break; }

    if (celldistAlt(c) > celldistAlt(bd.root)) {
      stepcount++;
      if (stepcount > iteration_limit) {
        // printf("buggy #1\n");
        bd.buggy = true;
        return;
      }

      if (c.mpdist <= 6) {
        if (c.monst !== moMutant) return; // already cut!
        // ... else simply extend it
        ds = c.stuntime; break;
      }

      const d = clearing_plantdir(c);
      steps++;
      clearing_onpath.push(c); clearing_pdir.push(d);
      if (d === -1) break;
      c = c.move(d);
    }
    else {
      bd.dist--;
      if (bd.dist < -iteration_limit) {
        for (let i = 0; i < steps; i++)
          clearing_onpath[i].item = itBuggy;
        for (let i = 0; i < clearing_rpath.length; i++)
          clearing_rpath[i].item = itBuggy;
        // printf("buggy #2\n");
        bd.buggy = true;
        return;
      }
      clearing_rpath.push(bd.root);
      bd.root = createMov(bd.root, clearing_plantdir(bd.root));
    }
  }

  clearing_onpath.push(c); clearing_pdir.push(clearing_plantdir(c));
  while (steps >= 0) {
    c = clearing_onpath[steps];
    if (steps === 0) {
      c.monst = moMutant;
      c.mondir = clearing_pdir[steps];
      if (clearing_pdir[steps] !== clearing_plantdir(c)) {
        // printf("pdir i/ plantdir\n");
        exit(1);
      }
      c.stuntime = ds & 15;
    }
    if (c.mpdist <= 7 && c.monst !== moMutant)
      break;
    steps--; ds++;
  }
}

/** cells with the same celltype are likely to have the same number of descendant leaves:
 *  typedef tuple<int, int, int, int> celltype (the port keys the map with the joined string) */
type celltype = string;

/** pair<bignum, int> */
class bignum_int {
  first = new bignum();
  second = 0;
  clone(): bignum_int { const r = new bignum_int(); r.first = this.first.clone(); r.second = this.second; return r; }
}

/** stats about the number of descendant leaves for each celltype */
const clearing_stats = new Map<celltype, bignum_int>();

const clearing_score = new Map<cell, bignum_int>();

/** changes.map_value(m, key): the value (a pair) is copied, as C++ does */
function map_value_pair<K>(m: Map<K, bignum_int>, key: K): void {
  if (m.has(key)) {
    const val = m.get(key)!.clone();
    changes.at_rollback(() => { m.set(key, val); });
  }
  else changes.at_rollback(() => { m.delete(key); });
}

/** map[key] (inserts a default value) */
function map_at<K>(m: Map<K, bignum_int>, key: K): bignum_int {
  let v = m.get(key);
  if (!v) { v = new bignum_int(); m.set(key, v); }
  return v;
}

function clearing_get_celltype(c: cell): celltype {
  let c1 = c;
  if (c.mondir < c.type)
    c1 = c.move(c.mondir);
  const expansion = get_expansion();
  return [
    celldistAlt(c), type_in(expansion, c, celldistAlt),
    celldistAlt(c1), type_in(expansion, c1, celldistAlt),
  ].join(',');
}

export function clearing_imput(c: cell): void {
  if (closed_manifold()) return;
  if (clearing_score.has(c)) return;
  map_value_pair(clearing_score, c);
  const is = map_at(clearing_score, c);
  const t = clearing_get_celltype(c);
  map_value_pair(clearing_stats, t);
  const stat = map_at(clearing_stats, t);
  is.second = c.mondir;
  if (c.mpdist <= 6) {
    is.first = new bignum(1);
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i); if (!c2) continue;
      if (clearing_score.has(c2) && c2.move(clearing_score.get(c2)!.second) === c)
        is.first.add(clearing_score.get(c2)!.first);
    }
    stat.first.add(is.first);
    stat.second++;
  }
  else {
    is.first = stat.second ? stat.first.randomized_div(stat.second) : new bignum(1);
    G.clearing_imputed.add(is.first);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// namespace whirlpool

// next == +1 -> next
// next == -1 -> prev
export function whirlpool_get(c: cell, next: number): cell {
  let i = 0;
  if (!eubinary() && !c.master.alt) return null!;
  const d = celldistAlt(c);
  let d2 = 0;
  while (true) {
    if (i === c.type) return null!;
    if (c.move(i) && (d2 = celldistAlt(c.move(i))) !== d)
      break;
    i++;
  }
  if (i === c.type) return null!;
  if (d > d2) next = -next;
  for (let j = 1; j < c.type; j++) {
    const c2 = c.modmove(i + next * j);
    if (celldistAlt(c2) === d) return c2;
  }
  return null!;
}

function whirlpool_build(whirlline: cell[], d: number): void {
  again: while (true) {
    const at = whirlline[isize(whirlline) - 1];
    const prev = whirlline[isize(whirlline) - 2];
    if (looped(whirlline)) return;
    for (let i = 0; i < at.type; i++)
      if (at.move(i) && (eubinary() || at.move(i).master.alt) && celldistAlt(at.move(i)) === d && at.move(i) !== prev) {
        whirlline.push(at.move(i));
        continue again;
      }
    return;
  }
}

export function whirlpool_generate(wto: cell): void {
  if (wto.wall === waBoat || wto.monst)
    return;

  wto.wall = waSea;

  if (hrand(35000) < 40 + G.items[itWhirlpool] + yendor_hardness())
    wto.monst = moCShark;
  else if (hrand(5000) < 500)
    wto.wall = waBoat;

  if (wto.wall === waBoat && (eubinary() || wto.master.alt)) {
    let d = celldistAlt(wto);
    if (G.yendor_on) d -= 200;
    // 250 : hard
    if (hrand(5000) < 60 + 3 * G.items[itWhirlpool] + yendor_hardness())
      wto.monst = moPirate;
    if (hrand(5000) < 20 && d < -20 && !G.tactic_on && !G.inv_on)
      wto.item = itOrbSafety;
    else if (hrand(5000) < 20 && d < -20 && !G.tactic_on && markOrb(itOrbLuck))
      wto.item = itOrbSafety;
    else if (hrand(5000) < 20 * PRIZEMUL && d < -20)
      placePrizeOrb(wto);
    else if (!G.inv_on && G.items[itWhirlpool] >= 10 && hrand(5000) < 20 && d < -15)
      wto.item = itOrbWater;
    else if (d < -10 && hrand(5000) < 1000 - d)
      wto.item = itWhirlpool;
  }
}

function whirlpool_whirlMove(wto: cell, wfrom: cell): void {
  // monsters don't move
  if (wfrom && (isPlayerOn(wfrom) || wfrom.monst))
    return;
  // disappear
  if (!wto) { wfrom.wall = waSea; wfrom.item = itNone; }

  if (wfrom && wto && wfrom.wall === waBoat && wto.wall === waSea && !wto.monst) {
    wfrom.wall = waSea; wto.wall = waBoat;
    wto.mondir = neighborId(wto, wfrom);
    animateMovement(moveimon(wto).rev(), LAYER_BOAT);
  }

  if (wfrom && wto && wfrom.item && !wto.item && wfrom.wall !== waBoat) {
    // Keys and Orbs of Yendor never disappear!
    if (wfrom.item === itKey || wfrom.item === itOrbYendor)
      for (let i = 0; i < wto.type; i++) createMov(wto, i);
    moveItem(wfrom, wto, false);
    pickupMovedItems(wfrom, wto);
    pickupMovedItems(wto, wfrom);
  }

  if (wto && !wfrom)
    whirlpool_generate(wto);
}

function whirlpool_moveAt(c: cell, cl: manual_celllister): void {
  if (c.land !== laWhirlpool) return;
  if (cl.listed(c)) return;
  if (!(eubinary() || c.master.alt)) return;
  const c2 = whirlpool_get(c, 1);
  if (!c2) return;
  const d = celldistAlt(c);
  const whirlline: cell[] = [];
  whirlline.push(c);
  whirlline.push(c2);
  whirlpool_build(whirlline, d);
  whirlline.reverse();
  whirlpool_build(whirlline, d);
  const z = isize(whirlline);

  for (let i = 0; i < z; i++)
    cl.add(whirlline[i]);

  whirlpool_whirlMove(null!, whirlline[0]);

  for (let i = 0; i < z - 1; i++)
    whirlpool_whirlMove(whirlline[i], whirlline[i + 1]);

  whirlpool_whirlMove(whirlline[z - 1], null!);
}

export function whirlpool_move(): void {
  const cl = new manual_celllister();
  try {
    for (let i = 0; i < isize(G.dcal); i++) {
      const c = G.dcal[i];
      whirlpool_moveAt(c, cl);
    }
    // Keys and Orbs of Yendor always move
    const yi = G.yendor_yi;
    for (let i = 0; i < isize(yi); i++) {
      whirlpool_moveAt(yi[i].path[0], cl);
      whirlpool_moveAt(yi[i].path[YDIST - 1], cl);
    }
  }
  finally { cl.destroy(); }
}

// ---------------------------------------------------------------------------------------------------------------
// namespace mirror

export const mirror_SPINSINGLE = 1;
export const mirror_SPINMULTI = 2;
export const mirror_GO = 4;
export const mirror_ATTACK = 8;
/** passed instead of cpid */
export const mirror_LIGHTNING = -1;

/** pair<int, cellwalker> */
export type mirror_pair = [number, cellwalker];

export function mirror_build(c: cell): boolean {
  if (aperiodic() || sol()) return false;
  if (GOLDBERG()) {
    if (c === c.master.c7) {
      c.wall = ((G.gp_param[1] === 0 || G.gp_param[0] === G.gp_param[1]) && hrand(2)) ? waMirror : waCloud;
      return true;
    }
    return false;
  }
  if (arcm_in()) {
    c.wall = hrand(2) ? waMirror : waCloud;
    return true;
  }
  if (bt_in() || IRREGULAR()) {
    // mirrors not supported
    if (is_mirrorland(c)) {
      c.item = itShard;
      return true;
    }
    return false;
  }
  if (PURE() ? pseudohept(c) : !ishept(c)) {
    c.wall = hrand(2) ? waMirror : waCloud;
    return true;
  }
  return false;
}

/** changes.value_keep(mirrors): the vector (with its cellwalkers) is copied */
function keep_mirrors(): void {
  if (!changes.on) return;
  const old: mirror_pair[] = G.mirror_mirrors.map(([a, cw]) => [a, cw.clone()] as mirror_pair);
  changes.at_rollback(() => { G.mirror_mirrors = old.map(([a, cw]) => [a, cw.clone()] as mirror_pair); });
}

function mirror_noMirrorOn(c: cell): boolean {
  return !!c.monst || (!G.shmup_on && isPlayerOn(c)) || (!closed_or_bounded() && c.cpdist > gamerange());
}

function mirror_cellMirrorable(c: cell): boolean {
  if (mirror_noMirrorOn(c)) return false;
  return c.wall === waNone || c.wall === waCavefloor || isAlchAny(c) ||
    c.wall === waFrozenLake || c.wall === waDeadfloor || c.wall === waDeadfloor2 ||
    c.wall === waGiantRug || c.wall === waCIsland || c.wall === waCIsland2 ||
    c.wall === waGargoyleFloor || c.wall === waRubble ||
    c.wall === waGargoyleBridge || c.wall === waTempFloor || c.wall === waTempBridge ||
    c.wall === waMirrorWall || c.wall === waPetrifiedBridge;
}

export function mirror_destroyKilled(): void {
  const mirrors = G.mirror_mirrors;
  let j = 0;
  for (let i = 0; i < isize(mirrors); i++)
    if (mirrors[i][1].at.monst === moMimic)
      mirrors[j++] = mirrors[i];
  mirrors.length = j;
}

function mirror_unlist(): void {
  for (const m of G.mirror_mirrors)
    if (m[1].at.monst === moMimic) {
      changes.ccell(m[1].at);
      m[1].at.monst = moNone;
    }
}

function mirror_list(): void {
  for (const m of G.mirror_mirrors) {
    changes.ccell(m[1].at);
    m[1].at.monst = moMimic;
  }
}

export function mirror_destroyAll(): void {
  keep_mirrors();
  mirror_unlist();
  G.mirror_mirrors.length = 0;
}

export function mirror_createMirror(cw: cellwalker, cpid: number): void {
  cw = cw.clone();
  if (!G.shmup_on && inmirror_cw(cw))
    cw = mirror_reflect(cw);
  changes.ccell(cw.at);
  if (cpid === mirror_LIGHTNING)
    castLightningBolt(cw);
  else if (mirror_cellMirrorable(cw.at)) {
    for (const m of G.mirror_mirrors)
      if (m[0] === cpid && m[1].eq(cw))
        return;
    G.mirror_mirrors.push([cpid, cw]);
  }
}

// (the CAP_ARCM helpers equal / create_archimedean_rec / create_archimedean: other geometries)
function mirror_create_archimedean(_cw: cellwalker, _cpid: number, _mirrored: boolean): void {
  throw new NotPorted('mirror::create_archimedean'); // STAGE1-STUB (Archimedean tilings)
}

export function mirror_createMirrors(cw: cellwalker, cpid: number): void {
  cw = cw.clone();

  if (aperiodic() || sol()) return;

  if (arcm_in()) {
    mirror_create_archimedean(cw, cpid, true);
    return;
  }

  cw.mirrored = !cw.mirrored;
  const c = cw.at;

  if (WDIM() === 3 && !bt_in()) {
    if (G.shmup_on) for (let i = 0; i < cw.at.type; i++)
      mirror_createMirror(cw.plus(i).addStep().add(-i), cpid);
    return;
  }

  if (GOLDBERG()) {
    for (let i = 0; i < cw.at.type; i++) {
      mirror_createMirror(hs_to_cw(cw_to_hs(cw).add(i).addStep().add(i).add(-(G.gp_param[0] === G.gp_param[1] ? 1 : 0))), cpid);
    }
    return;
  }
  for (let i = 0; i < cw.at.type; i++) {
    const cws = cw.plusStep();
    if (cws.at.type === c.type)
      mirror_createMirror(cws.plus(i), cpid);
    cw.add(1);
  }
}

export function mirror_createMirages(cw: cellwalker, cpid: number): void {
  if (arcm_in()) {
    mirror_create_archimedean(cw, cpid, false);
    return;
  }
  if (WDIM() === 3 && !bt_in()) {
    if (G.shmup_on) for (let i = 0; i < cw.at.type; i++)
      mirror_createMirror(cw.plus(i).addStep().add(-i), cpid);
    return;
  }
  const S7v = S7();
  const half = idiv(S7v, 2);
  if (GOLDBERG() && !(S7v & 1)) {
    for (let i = 0; i < cw.at.type; i++) {
      mirror_createMirror(hs_to_cw(cw_to_hs(cw).add(i).addStep().add(1).addStep().add(1).add(half).add(-i)), cpid);
    }
    return;
  }
  if (GOLDBERG() && (S7v & 1)) {
    for (let i = 0; i < cw.at.type; i++) {
      mirror_createMirror(hs_to_cw(cw_to_hs(cw).add(i).addStep().add(half).addStep().add(-2).addStep().add(half).add(-i)), cpid);
    }
    return;
  }
  if (PURE() && !(S7v & 1)) {
    for (let i = 0; i < cw.at.type; i++)
      mirror_createMirror(cw.plus(i).addStep().add(1).addStep().add(1).add(half).add(-i), cpid);
    return;
  }
  if (PURE() && (S7v & 1) && (S3() === 4)) {
    for (let i = 0; i < cw.at.type; i++)
      mirror_createMirror(cw.plus(i).addStep().add(1).addStep().add(-half).addStep().add(-half).add(-i), cpid);
    return;
  }
  if (PURE() && (S7v & 1)) {
    for (let i = 0; i < cw.at.type; i++)
      mirror_createMirror(cw.plus(i).addStep().add(half).addStep().add(-2).addStep().add(half).add(-i), cpid);
    return;
  }
  for (let i = 0; i < S6(); i++) {
    const cw0 = cw.plus(i).addStep();
    if (!ctof(cw0.at)) {
      mirror_createMirror(cw0.plus(2).addStep().add(-(2 + i)), cpid);
      mirror_createMirror(cw0.plus(-2).addStep().add(2 - i), cpid);
    }
  }
}

export function mirror_createHere(cw: cellwalker, cpid: number): void {
  if (!cw.at) return;
  if (cw.at.wall === waCloud)
    mirror_createMirages(cw, cpid);
  if (cw.at.wall === waMirror)
    mirror_createMirrors(cw, cpid);
}

export function mirror_breakMirror(cw: cellwalker, pid: number): void {
  if (!cw.at) return;
  const c = cw.at;
  if (c.wall === waMirror || c.wall === waCloud) {
    drawParticles(c, winf[c.wall].color, 16);
    playSound(c, 'pickup-mirror', 50);
    if (pid >= 0 && (cw.at.land === laMirror || cw.at.land === laMirrorOld)) {
      const d = dynamicval(() => G.multi_cpid, (v) => { G.multi_cpid = v; }, pid);
      try {
        gainShard(cw.at, c.wall === waMirror ? 'The mirror shatters!' : 'The cloud turns into a bunch of images!');
      }
      finally { d.restore(); }
    }
    changes.ccell(c);
    c.wall = waNone;
  }
}

export function mirror_isKilledByMirror(c: cell): boolean {
  for (const m of G.mirror_mirrors) {
    let c1 = m[1].plusStep().at;
    if (inmirror(c1)) c1 = mirror_reflect(new cellwalker(c1, 0, false)).at;
    if (c1 === c && canAttack(m[1].at, moMimic, c, c.monst, 0n))
      return true;
  }
  return false;
}

function mirror_go(fwd: boolean): void {
  keep_mirrors();
  const tk = tkills();
  let nummirage = 0;
  let j = 0;

  const mirrors = G.mirror_mirrors;
  for (let i = 0; i < isize(mirrors); i++) {
    const m = mirrors[i];
    let survive = true;
    if (m[0] === G.multi_cpid) {
      const c = m[1].at;
      changes.ccell(c);
      if (!m[1].mirrored) nummirage++;
      let cw2 = m[1].plusStep();
      const thru = inmirror_cw(cw2);
      if (thru) cw2 = mirror_reflect(cw2);
      const c2 = cw2.at;
      changes.ccell(c2);
      if (c2.monst) {
        c.monst = moMimic;
        const m2 = c2.monst;
        if (!G.peace_on && !bow_crossbow_mode() && canAttack(c, moMimic, c2, m2, 0n)) {
          attackMonster(c2, AF_NORMAL | AF_MSG, moMimic);
          if (!fwd) produceGhost(c2, m2, moMimic);
          sideAttack(c, m[1].spin, m2, 0);
        }
        c.monst = moNone;
      }
      if (!fwd) animateCorrectAttack(movei.cw(cw2.plusStep()), LAYER_SMALL, moMimic);
      if (c2.wall === waBigTree)
        c2.wall = waSmallTree;
      else if (c2.wall === waSmallTree)
        c2.wall = waNone;
      if (fwd) {
        if (thru && c === c2 && isAlchAny(c) && !checkflags(P_ISFRIEND | P_MONSTER | P_MIRROR | P_MIRRORWALL, P_AETHER)) {
          survive = false;
          continue;
        }
        if (mirror_noMirrorOn(c2) || !passable_for(moMimic, c2, c, P_ISFRIEND | P_MONSTER | P_MIRROR | P_MIRRORWALL)) {
          survive = false;
          continue;
        }
        c.monst = moMimic;
        moveMonster(movei.cw(m[1]));
        c2.monst = moNone;
        empathyMove(movei.cw(m[1]));
        m[1] = cw2;
      }
    }
    if (survive) {
      mirrors[j++] = m;
    }
  }
  mirrors.length = j;
  achievement_count('MIRRORKILL', tkills(), tk);
  achievement_count('MIRAGE', nummirage, 0);
}

export function mirror_act(d: number, flags: number): void {
  keep_mirrors();
  mirror_destroyKilled();
  mirror_unlist();
  if (G.multi_players === 1) G.multi_cpid = 0;
  const spinning =
    !!(flags & (G.multi_players > 1 ? mirror_SPINMULTI : mirror_SPINSINGLE));
  if (spinning && d) {
    for (const m of G.mirror_mirrors)
      if (m[0] === G.multi_cpid)
        m[1].add(d);
  }
  if (flags & mirror_ATTACK)
    mirror_go(!!(flags & mirror_GO));
  mirror_list();
}

export function mirror_breakAll(): void {
  keep_mirrors();
  mirror_destroyKilled();
  mirror_unlist();
  if (numplayers() === 1)
    mirror_createHere(G.cwt, 0);
  else for (let i = 0; i < numplayers(); i++)
    mirror_createHere(G.multi_player[i], i);
  const mirrors = G.mirror_mirrors;
  for (let i = 0; i < isize(mirrors); i++)
    mirror_createHere(mirrors[i][1], mirrors[i][0]);
  if (numplayers() === 1)
    mirror_breakMirror(G.cwt, 0);
  else for (let i = 0; i < numplayers(); i++)
    mirror_breakMirror(G.multi_player[i], i);
  for (let i = 0; i < isize(mirrors); i++)
    mirror_breakMirror(mirrors[i][1], -1);
  mirror_list();
}

export function mirror_mirrordir(c: cell): number {
  if (c.type === 7) return c.bardir;

  let icount = 0, isum = 0;
  for (let i = 0; i < 6; i += 2) {
    if (createMov(c, i).bardir === c.c.spin(i)) {
      icount++; isum += i;
    }
  }
  if (icount !== 1) return -1;
  return isum;
}

function mirror_traceback(v: number[], cw: cellwalker): [boolean, cellwalker] {
  cw = cw.clone();
  let goout = false;
  for (let i = isize(v) - 1; i >= 0; i--) {
    if (v[i]) cw.sub(v[i]);
    else {
      cw.addStep();
      if (cw.at.land === laMirrorWall || cw.at.land === laMirror) goout = true;
    }
  }
  return [goout, cw];
}

function mirror_depth(c: cell): number { return c.landparam & 255; }

/** static vector<int> v (in reflect0) */
const reflect0_v: number[] = [];

function mirror_reflect0(cw: cellwalker): cellwalker {
  cw = cw.clone();
  let stepcount = 0;
  const cwcopy = cw.clone();
  const v = reflect0_v;
  v.length = 0;
  while (true) {
    if (!inmirror_cw(cw)) break;
    stepcount++; if (stepcount > 10000) {
      return cw;
    }
    const c0 = cw.plusStep().at;
    let go = 0;
    if (!inmirror(c0)) go = 2;
    else if (mirror_depth(c0) && mirror_depth(c0) < mirror_depth(cw.at)) go = 1;
    if (go) {
      v.push(0);
      cw.addStep();
      if (go === 2) break;
    }
    else {
      v.push(1);
      cw.add(1);
    }
  }
  if (cw.at.land === laMirrorWall || cw.at.land === laMirrorWall2) {
    if (cw.at.type === 7) {
      while (cw.spin !== cw.at.bardir) {
        cw.add(1);
        v.push(1);
        stepcount++; if (stepcount > 10000) { /* printf("failhep\n"); */ return cw; }
      }
      if (PURE() && cw.plusStep().at === cwcopy.at)
        v.pop();
      if (PURE() && cw.plus(3).addStep().at.land === laMirrored && cw.plus(2).addStep().at.land === laMirrorWall) {
        cw.addMirror();
        const p = mirror_traceback(v, cw);
        if (p[0]) return p[1];
        cw.add(2);
        v.push(2);
        cw.addStep();
        v.push(0);
        cw.add(3);
        v.push(3);
      }
    }
    else {
      while (cw.plusStep().at.type !== 7) {
        cw.inc();
        v.push(1);
      }
      let icount = 0;
      for (let i = 0; i < 3; i++) {
        if (cw.plusStep().at.bardir === cw.at.c.spin(cw.spin))
          icount++;
        cw.add(2);
      }
      if (icount >= 2) {
        const cwcopy2 = cw.clone();
        for (let a = 0; a < 3; a++) for (let m = 0; m < 2; m++) {
          const cw3 = cwcopy2.clone();
          if (m) cw3.mirrored = !cw3.mirrored;
          cw3.add(a * 2);
          const p = mirror_traceback(v, cw3);
          if (p[0]) return p[1];
        }
        // printf("icount >= 2 but failed\n");
        return cw;
      }
      while (cw.plusStep().at.bardir !== cw.at.c.spin(cw.spin)) {
        stepcount++; if (stepcount > 10000) { /* printf("fail2\n"); */ return cw; }
        cw.add(2);
        v.push(1);
        v.push(1);
      }
    }
  }
  else v.pop();
  cw.mirrored = !cw.mirrored;
  cw = mirror_traceback(v, cw)[1];
  return cw;
}

/** must be a power of 2 */
const CACHESIZE = 1 << 12;
const CACHEMASK = CACHESIZE - 1;

/** pair<cell*, cellwalker> cache[CACHESIZE] */
const mirror_cache: { first: cell | null; second: cellwalker }[] =
  Array.from({ length: CACHESIZE }, () => ({ first: null, second: new cellwalker() }));
let mirror_nextcache = 0;

function mirror_clearcache(): void {
  for (let i = 0; i < CACHESIZE; i++) mirror_cache[i].first = null;
}

/** Online lockstep (ONLINE.md, not in the original): mirror::reflect for the drawing: no buildEquidistant (which may
 *  generate land), and a cache of the drawing's own instead of the cache index the original keeps in landparam */
const mirror_view_cache = new Map<cell, cellwalker>();
export function mirror_reflect_view(cw: cellwalker): cellwalker {
  if (!cw.at) return cw.clone();
  if ((cw.at.landparam & 255) === 0) return cw.clone();
  let r = mirror_view_cache.get(cw.at);
  if (!r) {
    r = mirror_reflect0(new cellwalker(cw.at, 0, false));
    let tries = 64;
    while (inmirror(r.at) && tries--) r = mirror_reflect0(r);
    mirror_view_cache.set(cw.at, r);
  }
  const res = r.plus(cw.spin);
  if (cw.mirrored) res.mirrored = !res.mirrored;
  return res;
}

export function mirror_reflect(cw: cellwalker): cellwalker {
  if (!cw.at) return cw.clone();
  if ((cw.at.landparam & 255) === 0) {
    let cando = false;
    for (let i = 0; i < cw.at.type; i++) { const c2 = cw.at.move(i); if (!c2) continue; if (c2.landparam & 255) cando = true; }
    if (cando) buildEquidistant(cw.at);
  }
  if ((cw.at.landparam & 255) === 0) return cw.clone();
  let cid = (cw.at.landparam >> 8) & CACHEMASK;
  if (mirror_cache[cid].first !== cw.at) {
    cid = mirror_nextcache++;
    mirror_nextcache &= CACHEMASK;
    cw.at.landparam = cw.at.landparam & ~(CACHEMASK << 8);
    cw.at.landparam = cw.at.landparam | (cid << 8);
    mirror_cache[cid].first = cw.at;
    const cw0 = new cellwalker(cw.at, 0, false);
    mirror_cache[cid].second = mirror_reflect0(cw0);
    let tries = 64;
    while (inmirror(mirror_cache[cid].second.at) && tries--)
      mirror_cache[cid].second = mirror_reflect0(mirror_cache[cid].second);
  }
  const res = mirror_cache[cid].second.plus(cw.spin);
  if (cw.mirrored) res.mirrored = !res.mirrored;
  return res;
}

// ---------------------------------------------------------------------------------------------------------------
// namespace hive

export function hive_hivehard(): number {
  return G.items[itRoyalJelly] + hardness_empty();
  // 0, 5, 40, 135
}

export function hive_randomHyperbug(): eMonster {
  let h = hive_hivehard();
  if (h && markOrb(itOrbLuck)) h = idiv(h, 4);
  if (hrand(200) < h)
    return moBug2;
  return moBug0 + hrand(BUGCOLORS);
  // 50: 25/25/50
  // 100:
}

/** struct buginfo_t */
class buginfo_t {
  where: cell = null!;
  /** short dist[BUGCOLORS] */
  readonly dist: number[] = [0, 0, 0];
}

const hive_buginfo: buginfo_t[] = [];

const hive_bugqueue: number[][] = [[], [], []];
const hive_bugqueue4: number[][] = [[], [], []];

/** struct bugtomove_t */
class bugtomove_t {
  dist: number; moves: number; index: number;
  constructor(d: number, m: number, i: number) { this.dist = d; this.moves = m; this.index = i; }
}

function bugtomove_less(m1: bugtomove_t, m2: bugtomove_t): boolean {
  if (m1.dist !== m2.dist) return m1.dist < m2.dist;
  if (m1.moves !== m2.moves) return m1.moves < m2.moves;
  return false;
}

const hive_bugtomove: bugtomove_t[] = [];
const hive_deadbug: cell[] = [];
const hive_bugcellq: cell[] = [];

function hive_isBugEnemy(c: cell, k: number): boolean {
  if (isPlayerOn(c) && !G.invismove && !G.peace_on) return true;
  if (!c.monst) return false;
  if (c.monst === moBug0 + k) return false;
  if (isIvy(c)) return false;
  return true;
}

// list bugs and targets for each color
const BUGINF = 29999;

function hive_bugQueueInsert(k: number, i: number, d: number): void {
  if (hive_buginfo[i].dist[k] > d) {
    // (printf when it was not BUGINF)
    hive_buginfo[i].dist[k] = i16(d);
    hive_bugqueue[k].push(i);
  }
}

function hive_bugcell(c: cell): void {
  let i = c.listindex;
  if (i >= 0 && i < isize(hive_buginfo) && hive_buginfo[i].where === c)
    return;
  i = c.listindex = isize(hive_buginfo);
  hive_buginfo.push(new buginfo_t());
  const b = hive_buginfo[i];
  b.where = c;
  for (let k = 0; k < BUGCOLORS; k++) {
    b.dist[k] = BUGINF;
    let havebug = false, haveother = false;
    for (let dir = 0; dir < c.type; dir++) {
      const c2 = c.move(dir);
      if (c2 && hive_isBugEnemy(c2, k) && canAttack(c, moBug0 + k, c2, c2.monst, AF_TOUGH | AF_NOSHIELD | AF_GETPLAYER)) {
        if (isBug(c2)) havebug = true;
        else haveother = true;
      }
    }
    if (havebug) hive_bugQueueInsert(k, i, 0);
    else if (haveother) hive_bugqueue4[k].push(i);
  }

  // use pheromones!
  if (c.land === laHive && c.landparam > 1 && c.wall !== waWaxWall) {
    c.landparam--;
    for (let dir = 0; dir < c.type; dir++) {
      const c2 = c.move(dir);
      if (c2) {
        for (let t = 0; t < c2.type; t++)
          if (c2.move(t)) {
            hive_bugcellq.push(c2);
            hive_bugcellq.push(c2.move(t));
          }
      }
    }
  }
}

let hive_last_d = -1;

function hive_handleBugQueue(k: number, t: number): void {
  const i = hive_bugqueue[k][t];
  const b = hive_buginfo[i];
  const c = b.where;
  const d = b.dist[k];
  hive_last_d = d;
  let goodmoves = 0;
  for (let dir = 0; dir < c.type; dir++) {
    const c2 = c.move(dir);
    if (!c2) continue;
    if (c2.listindex < 0 || c2.listindex >= isize(hive_buginfo)) continue;
    if (!passable(c, c2, P_MONSTER)) continue;
    const j = c2.listindex;
    if (hive_buginfo[j].where !== c2) continue;
    if (hive_buginfo[j].dist[k] < d) goodmoves++;
    hive_bugQueueInsert(k, j, d + 1);
  }
  if (isBug(c) && c.monst === moBug0 + k) {
    G.hive_bugcount[c.monst - moBug0]++;
    hive_bugtomove.push(new bugtomove_t(d, goodmoves, i));
  }
}

function hive_fightspam(c: cell): boolean {
  return c.cpdist >= gamerange() ||
    isMetalBeast(c.monst) || c.monst === moSkeleton ||
    isIvy(c.monst) || isMutantIvy(c.monst);
}

export function hive_movebugs(): void {
  hive_buginfo.length = 0;
  for (let k = 0; k < BUGCOLORS; k++) hive_bugqueue[k].length = 0;
  for (let k = 0; k < BUGCOLORS; k++) hive_bugqueue4[k].length = 0;
  for (let k = 0; k < BUGCOLORS; k++) G.hive_bugcount[k] = 0;
  hive_bugtomove.length = 0;
  hive_deadbug.length = 0;

  const xdcs = isize(G.dcal); for (let i = 0; i < xdcs; i++) hive_bugcell(G.dcal[i]);
  for (let i = 0; i < isize(hive_bugcellq); i++) hive_bugcell(hive_bugcellq[i]);
  hive_bugcellq.length = 0;

  for (let k = 0; k < BUGCOLORS; k++) {
    let t = 0;
    hive_last_d = -1;
    let invadist = 4 - idiv(G.items[itRoyalJelly] + 10, 20);
    if (invadist < 0) invadist = 0;
    for (; t < isize(hive_bugqueue[k]) && hive_last_d < invadist - 1; t++) hive_handleBugQueue(k, t);
    for (let u = 0; u < isize(hive_bugqueue4[k]); u++)
      hive_bugQueueInsert(k, hive_bugqueue4[k][u], invadist);
    hive_bugqueue4[k].length = 0;
    for (; t < isize(hive_bugqueue[k]); t++) hive_handleBugQueue(k, t);
  }

  // (the REPETITION check only prints)

  hrandom_shuffle(hive_bugtomove);
  std_sort(hive_bugtomove, bugtomove_less);

  let battlecount = 0;
  for (let t = 0; t < isize(hive_bugtomove); t++) {
    const bm = hive_bugtomove[t];
    const i = bm.index;

    const b = hive_buginfo[i];
    const c = b.where;
    if (!isBug(c)) continue;
    if (c.stuntime) continue;
    const m = c.monst;
    const k = (m - moBug0) % BUGCOLORS;
    const gmoves: number[] = [];
    let q = 0, bqual = -1;

    if (againstRose(c, null!)) bqual = -40;

    const getplayer = G.peace_on ? AF_GETPLAYER : 0n;

    for (let dir = 0; dir < c.type; dir++) {
      const c2 = c.move(dir);
      let qual = -10;
      if (!c2) continue;
      else if (againstRose(c, c2)) qual = -50;
      else if (isPlayerOn(c2) && G.peace_on) qual = -45;
      else if (canAttack(c, m, c2, c2.monst, getplayer))
        qual = c2.monst === moDeadBug ? -60 : hive_isBugEnemy(c2, k) ? 2 : -20;
      else if (!passable(c2, c, 0n))
        qual = passable(c2, c, P_DEADLY) ? -30 : -60;
      else if (c2.listindex < 0 || c2.listindex >= isize(hive_buginfo)) qual = -15;
      else if (hive_buginfo[c2.listindex].where !== c2) qual = -15;
      else if (hive_buginfo[c2.listindex].dist[k] < b.dist[k])
        qual = 1;
      else if (hive_buginfo[c2.listindex].dist[k] === b.dist[k])
        qual = 0;
      if (qual > bqual) { bqual = qual; q = 0; }
      if (qual === bqual) gmoves[q++] = dir;
    }

    if (!q) { if (c.land === laHive) c.landparam += 3; continue; }
    const d = gmoves[hrand(q)];
    const mi = movei.sd(c, d);
    const c2 = mi.t;
    if (c2.monst || (isPlayerOn(c2) && !G.peace_on)) {
      let killed = c2.monst;
      if (isPlayerOn(c2) && !G.peace_on) killed = moPlayer;
      if (isBug(killed)) battlecount++;
      else if (killed !== moPlayer && !hive_fightspam(c2))
        addMessage(XLAT('%The1 fights with %the2!', spM(c.monst), spM(killed)));
      attackMonster(c2, AF_NORMAL | getplayer, c.monst);
      // killMonster(c);
      if (isBug(killed)) {
        c2.monst = moDeadBug; hive_deadbug.push(c2);
        G.hive_bugcount[killed - moBug0]--;
      }
    }
    else {
      moveMonster(mi);
      // pheromones!
      if (c.land === laHive && c.landparam < 90) c.landparam += 5;
      if (c2.land === laHive && c2.landparam < 90) c2.landparam += 5;
    }
  }

  // cleanup
  for (let i = 0; i < isize(hive_deadbug); i++) hive_deadbug[i].monst = moNone;
  if (battlecount)
    addMessage(XLAT('The Hyperbugs are fighting!'));

  let maxbug = 0;
  for (let k = 0; k < BUGCOLORS; k++) if (G.hive_bugcount[k] > maxbug) maxbug = G.hive_bugcount[k];

  achievement_count('BUG', maxbug, 0);
}

function hive_bugcitycell(c: cell, d: number): void {
  const i = c.listindex;
  if (i >= 0 && i < isize(hive_buginfo) && hive_buginfo[i].where === c)
    return;
  c.listindex = isize(hive_buginfo);
  const b = new buginfo_t();
  b.where = c;
  b.dist[0] = d;
  hive_buginfo.push(b);
}

export function hive_createBugArmy(c: cell): void {
  const k = hive_randomHyperbug() - moBug0;
  let minbugs = 50, maxbugs = 50;
  let v = 5 + G.items[itRoyalJelly];
  if (v > 25) v = 25;
  minbugs -= v; maxbugs += v;
  maxbugs += G.items[itRoyalJelly];
  let numbugs = minbugs + hrand(maxbugs - minbugs + 1);

  let gdir = -1;
  for (let i = 0; i < c.type; i++) {
    if (c.move(i) && c.move(i).mpdist < c.mpdist) gdir = i;
  }
  if (gdir === -1) return;
  const bf = new cellwalker(c, gdir);
  let radius = 9;
  if (getDistLimit() <= 6) radius = 6;
  if (ls_any_chaos()) radius = 5;
  if (ls_any_chaos() && getDistLimit() <= 5) radius = 4;
  if (getDistLimit() <= 3) radius = 3;

  for (let i = (ls_any_chaos() ? 0 : 2); i < radius; i++) {
    bf.addRevStep();
    if (ls_hv_structure()) moreBigStuff(bf.at);
  }
  const citycenter = bf.at;
  hive_buginfo.length = 0;

  // mark the area with BFS
  hive_bugcitycell(citycenter, 0);
  for (let i = 0; i < isize(hive_buginfo); i++) {
    const b = hive_buginfo[i];
    const c1 = b.where;
    const d = b.dist[0];
    if (ls_hv_structure()) moreBigStuff(c1);
    // ERRORS!
    if (c1.land !== laHive && c1.land !== laNone) return;
    if (ls_horodisk_structure() ? c1.bardir !== NOBARRIERS : c1.bardir !== NODIR) return;
    if (c1.land === laHive && c1.landparam >= 100) return;
    // bfs
    if (d < radius) for (let t = 0; t < c1.type; t++)
      hive_bugcitycell(createMov(c1, t), d + 1);
  }

  // place everything
  for (let i = 0; i < isize(hive_buginfo); i++) {
    const b = hive_buginfo[i];
    const c1 = b.where;
    const d = b.dist[0];
    if (d <= 1 && c1.wall === waNone)
      c1.item = itRoyalJelly;
    if (ls_horodisk_structure()) c1.bardir = NOBARRIERS2;
    else preventbarriers(c1);
    if (d === 9 || d === 6 || d === 3) {
      c1.barleft = idiv(d, 3);
      c1.barright = k;
    }
    else
      c1.barleft = laNone;
    if (numbugs && c1.wall === waNone) {
      c1.monst = moBug0 + k; numbugs--;
    }
    c1.land = laHive;
    // prevent barriers
    if (c1.mpdist === INFD) c1.mpdist = BUGLEV;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// namespace heat (HEAT(c) is c.LHU.heat, a float)

export function heat_affect(c: cell, delta: number): void {
  if (isIcyLand(c)) c.LHU.heat = c.LHU.heat + delta;
}

export function heat_absheat(c: cell): number {
  if (c.land === laCocytus) return c.LHU.heat - .6;
  if (c.land === laIce || c.land === laBlizzard || c.land === laEclectic) return c.LHU.heat - .4;
  return 0;
}

export function heat_celsius(c: cell): number { return heat_absheat(c) * 60; }

/** adjust to the improved heat transfer algorithm in 9.4 (const float) */
const FIX94 = 1.5;

export const MELTCOLOR = 0xA04040;

export function heat_processheat(rate = 1): void {
  if (markOrb(itOrbSpeed)) rate /= 2;
  if (G.racing_on) return;
  const oldmelt = G.kills[0];

  const offscreen2: cell[] = [];

  const cl = new manual_celllister();
  try {
    const gr = gamerange();
    const doall = closed_or_bounded();

    for (const c of G.heat_offscreen_heat) {
      if (c.cpdist > gr && !doall) {
        if (!cl.add(c)) continue;
        if (isIcyLand(c)) {
          if (c.LHU.heat < .01 && c.LHU.heat > -.01)
            c.LHU.heat = 0;
          else {
            c.LHU.heat = c.LHU.heat * (1 - rate / 10);
            offscreen2.push(c);
          }
        }
      }
    }

    G.heat_offscreen_heat = offscreen2;

    for (let i = 0; i < numplayers(); i++) {
      const c = playerpos(i);
      if (!c) continue;
      let xrate = (c.land === laCocytus && G.shmup_on) ? rate / 3 : rate;
      if (PURE()) xrate *= 1.7; // todo-variation
      if (!G.shmup_on) xrate /= FIX94;
      if (isIcyLand(c))
        c.LHU.heat = c.LHU.heat + (markOrb(itOrbWinter) ? -1.2 : 1.2) * xrate;
    }

    const allcells = G.currentmap.allcells();

    const dcs = isize(allcells);

    const hmods: number[] = new Array(dcs).fill(0);

    let divby = 10;
    if (S7() > 10) divby *= 2;
    if (arcm_in()) divby *= 2;
    if (WDIM() === 3) divby *= 2;

    for (let i = 0; i < dcs; i++) {
      const c = allcells[i];
      let xrate = (c.land === laCocytus && G.shmup_on) ? 1 / 3 : 1;
      if (PURE()) xrate *= 1.7; // todo-variation
      if (!G.shmup_on) xrate /= FIX94;
      if (c.cpdist > gr && !doall) break;

      if (isIcyLand(c)) {
        let hmod = 0;

        if (c.monst === moRanger) hmod += 3 * xrate;
        if (c.monst === moDesertman) hmod += 4 * xrate;
        if (c.monst === moAngryDie) hmod += 4 * xrate;
        if (c.monst === moMonkey) hmod += xrate;
        if (c.wall === waCharged) hmod += xrate * .25;
        if (c.wall === waGrounded) hmod -= xrate * .25;
        if (c.wall === waDeadTroll) hmod -= 2 * xrate;
        if (c.wall === waDeadTroll2) hmod -= 1.5 * xrate;
        if (c.wall === waBigStatue) hmod -= .5 * xrate;
        if (c.monst === moLesser || c.monst === moLesserM || c.monst === moGreater || c.monst === moGreaterM)
          hmod += (c.land === laCocytus ? 1.5 : 10) * xrate;
        if (c.monst === moGreaterShark)
          hmod += 2 * xrate;
        if (c.monst === moCultist) hmod += 3 * xrate;
        if (c.monst === moCultistLeader) hmod += 4 * xrate;
        if (c.monst === moPyroCultist) hmod += 6 * xrate;
        if (c.monst === moFireFairy) hmod += 6 * xrate;
        if (c.monst === moFireElemental) hmod += 8 * xrate;
        if (isDragon(c.monst)) hmod += 2 * xrate;
        if (c.monst === moGhost) hmod -= xrate;
        if (c.monst === moFriendlyGhost) hmod -= xrate;
        if (c.monst === moSkeleton) hmod -= .2 * xrate;
        if (c.monst === moDraugr) hmod -= .75 * xrate;
        if (c.monst === moWaterElemental) hmod -= xrate;
        if (c.monst === moAirElemental) hmod -= .4 * xrate;
        if (isFire(c)) hmod += 4 * xrate;
        if (isPrincess(c.monst)) hmod += (markEmpathy(itOrbWinter) ? -1.2 : 1.2) * xrate;

        const ls = adj_minefield_cells(c);

        for (const ct of ls) {
          if (!isIcyLand(ct) && isFire(ct))
            hmod += xrate * .1;
          if (ct.land === laVolcano)
            hmod += xrate * (ct.wall === waMagma ? .4 : .2);
        }

        for (const ct of ls) {
          if (!isIcyLand(ct)) {
            // make sure that we can still enter Cocytus,
            // it won't heat up right away even without Orb of Winter or Orb of Speed
            if (isPlayerOn(ct) && (c.land !== laCocytus || markOrb(itOrbWinter)))
              hmod += (markOrb(itOrbWinter) ? -1.2 : 1.2) / 4 * xrate;
            continue;
          }
          let hdiff = heat_absheat(ct) - heat_absheat(c);
          hdiff /= divby;

          if (ct.land === laBlizzard && c.land === laBlizzard) {
            let v = (windmap_at(ct) - windmap_at(c)) & 255;
            if (v > 128) v -= 256;
            if (v < windmap_NOWINDFROM && v > -windmap_NOWINDFROM)
              hdiff = hdiff * (1 - idiv(v * 5, windmap_NOWINDFROM));
          }

          if (G.shmup_on && (c.land === laCocytus || ct.land === laCocytus))
            hdiff /= 3;
          hmod += hdiff;
        }

        hmods[i] = hmod;
      }

      if (c.LHU.heat && !doall)
        G.heat_offscreen_heat.push(c);
    }

    for (let i = 0; i < dcs; i++) {
      const c = allcells[i];
      if (!isIcyLand(c)) continue;
      c.LHU.heat = c.LHU.heat + hmods[i] * rate;
      if (c.monst === moCrystalSage && c.LHU.heat >= SAGEMELT) {
        addMessage(XLAT('%The1 melts away!', spM(c.monst)));
        fallMonster(c);
      }
      if (c.wall === waIcewall && c.LHU.heat > .4) {
        drawParticles(c, MELTCOLOR, 4, 60);
        c.wall = waNone; G.kills[0]++;
      }
      if (c.wall === waFrozenLake && c.LHU.heat > (c.land === laCocytus ? .6 : .4)) {
        drawParticles(c, MELTCOLOR, 4, 60);
        playSound(c, 'trapdoor', 50);
        c.wall = waLake; G.kills[0]++;
      }

      if (c.wall === waLake && c.LHU.heat < (c.land === laCocytus ? -.4 : .4) && c.monst !== moGreaterShark) {
        c.wall = waFrozenLake;
        if (c.monst === moShark || c.monst === moCShark) {
          addMessage(XLAT('%The1 is frozen!', spM(c.monst)));
          fallMonster(c);
        }
      }
    }
  }
  finally { cl.destroy(); }

  if (G.kills[0] !== oldmelt) bfs();
}

const heat_newfires: [cell, number][] = [];

export function heat_processfires(): void {
  heat_newfires.length = 0;

  const offscreen2: cell[] = [];

  const cl = new manual_celllister();
  try {
    const allcells = G.currentmap.allcells();
    const siz = isize(G.heat_offscreen_fire);

    for (const x of [0, 1]) {
      const lst = x === 0 ? allcells : G.heat_offscreen_fire;
      const n = lst.length;
      for (let ci = 0; ci < n; ci++) {
        const c = lst[ci];
        if (!cl.add(c)) continue;

        if (isFireOrMagma(c)) {
          if (c.wall === waMagma) c.wparam = 20;

          let last = c.move(c.type - 1);

          const ls = adj_minefield_cells(c);
          for (const c2 of ls) {

            if (c.wall === waPartialFire) {
              // two partial fires adjacent are necessary to spread
              let ok = false;
              for (let i = 0; i < c2.type; i++) {
                const c3 = c2.move(i); if (!c3) continue;
                if (c3 !== c && c3.wall === waPartialFire) ok = true;
              }
              if (!ok) continue;
            }

            if (c2.wall === waNone && c2.land === laRose && c.wparam >= 10)
              heat_newfires.push([c2, c.wparam]);
            if (c2.wall === waFire && c2.land === laRose && c.wparam >= 10 && c2.wparam < idiv(c.wparam, 2))
              heat_newfires.push([c2, c.wparam]);
            if (againstWind(c, c2) && c.wall !== waEternalFire && c.wparam >= 10) {
              if (isFire(c2)) {
                if (c2.wparam < idiv(c.wparam, 2))
                  heat_newfires.push([c2, c.wparam]);
              }
              else {
                heat_newfires.push([c2, c.wparam]);
                useup(c);
              }
            }
            if (c2.land === laDryForest && c2.wall !== waEternalFire) {
              c2.landparam++;
              if (c2.landparam >= (isStandardTree(c2) ? 1 : 10)) heat_newfires.push([c2, 12]);
              else offscreen2.push(c);
            }
            else if (c2.wall === waVinePlant || c2.wall === waRose || c2.wall === waSaloon ||
              c2.wall === waWeakBranch || c2.wall === waCanopy || c2.wall === waTrunk || c2.wall === waSolidBranch ||
              c2.wall === waBigBush || c2.wall === waSmallBush || c2.wall === waBonfireOff || c2.wall === waSmallTree ||
              c2.wall === waDock)
              heat_newfires.push([c2, 12]);
            else if (cellHalfvine(c2) && last && last.wall === c2.wall)
              heat_newfires.push([c2, 12]);
            else if (c2.wall === waExplosiveBarrel)
              heat_newfires.push([c2, 12]);
            else if (c2.wall === waFireTrap)
              heat_newfires.push([c2, 12]);
            // both halfvines have to be near fire at once
            last = c2;
          }

        }

        if (hasTimeout(c)) {
          if (c.mpdist === 8 && (c.land === laWineyard || c.land === laEndorian || c.land === laDocks)) {
            // do not expire, do not store in 'offscreen', do not generate more land
          }
          else {
            useup(c);
            offscreen2.push(c);
          }
        }

        if (c.wall === waArrowTrap && c.wparam && !G.shmup_on) {
          c.wparam++;
          if (c.wparam === 3) {
            if (canAttack(c, moArrowTrap, c, c.monst, AF_GETPLAYER))
              attackMonster(c, AF_NORMAL | AF_MSG | AF_GETPLAYER, moArrowTrap);
          }
          if (c.wparam === 4) c.wparam = 0;
        }

        if (c.wall === waFireTrap && c.wparam && !G.shmup_on) {
          c.wparam++;
          if (c.wparam === 3) {
            c.wall = waNone;
            explosion(c, 5, 10);
          }
        }
      }
    }

    for (let i = 0; i < isize(heat_newfires); i++) {
      const c = heat_newfires[i][0];
      let qty = heat_newfires[i][1];
      qty = idiv(qty, 2);
      if (c.wall === waExplosiveBarrel) explodeBarrel(c);
      else if (c.wall === waFireTrap) {
        if (c.wparam === 0) c.wparam = 1;
        continue;
      }
      else if (c.wall === waBonfireOff) activateActiv(c, false);
      else if (cellHalfvine(c)) destroyHalfvine(c, waPartialFire, 6);
      else makeflame(c, qty, false);
      if (c.wparam < qty) c.wparam = qty;
      if (c.land === laRose || c.land === laWildWest || c.land === laOvergrown || isHaunted(c.land) || c.land === laMountain || c.land === laIce) {
        if (G.randomPatternsMode || siz > 5000) {
          /* do not add to offscreen2 so that the fire will spread later */
          if (c.mpdist === 8) continue;
        }
        else
          for (let j = c.mpdist - 1; j >= 7; j--) setdist(c, j, null!);
      }
      offscreen2.push(c);
    }
  }
  finally { cl.destroy(); }

  G.heat_offscreen_fire = offscreen2;
}

export function livecaves(): void {
  const allcells = G.currentmap.allcells();
  const dcs = isize(allcells);

  const bringlife: cell[] = [];
  const gr = gamerange();
  const doall = closed_or_bounded();

  const heatvals: number[] = new Array(dcs).fill(0);

  for (let i = 0; i < dcs; i++) {
    const c = allcells[i];
    if (!doall && c.cpdist > gr + 1) break;

    if (c.wall === waCavefloor || c.wall === waCavewall || c.wall === waDeadTroll) {
      heatvals[i] = 0;
      if (c.monst === moDarkTroll) c.monst = moTroll;
      if (c.item || c.monst || c.cpdist === 0) continue;
      let hv = 0;
      for (const c2 of adj_minefield_cells(c)) {
        const w = c2.wall;
        if (w === waDeadfloor) { hv++; bringlife.push(c2); }
        else if (w === waDeadwall || (w === waDeadfloor2 && !c2.monst && !isPlayerOn(c2))) {
          hv--; bringlife.push(c2);
        }
        else if (w === waCavefloor) hv++;
        else if (w === waCavewall) hv--;
        else if (w === waRubble) hv--;
        else if (w === waGargoyle) hv--;
        else if (w === waGargoyleFloor) hv--;
        else if (w === waGargoyleBridge) hv--;
        else if (w === waStone) { /* */ }
        else if (w === waDeadTroll) hv -= 5;
        else if (w === waDeadTroll2) hv -= 3;
        else if (w === waPetrified || w === waPetrifiedBridge) hv -= 2;
        else if (w === waVinePlant) hv--;
        else if (ls_any_chaos() && c2.land !== laCaves && c2.land !== laEmerald) { /* */ }
        else if (c2.land === laTrollheim) { /* trollheim floor does not count */ }
        else if (w !== waBarrier) hv += 5;

        if (sword_at(c)) hv += 500;

        if (c2.cpdist === 0 && markOrb(itOrbDigging)) hv += 100;
        if (G.items[itOrbEmpathy] && isFriendly(c2) && markEmpathy(itOrbDigging))
          hv += 100;
        if (w === waThumperOn) hv += 100;
        if (w === waFire) hv += 100;
        if (w === waBigStatue) hv -= 100;
        if (c2.item && !G.peace_on) hv += 2;
        if (c2.monst === moZombie) hv += 10;
        if (c2.monst === moGhost) hv += 10;
        if (c2.monst === moTentacleGhost) hv += 10;
        if (c2.monst === moFriendlyGhost) hv += 10;
        if (c2.monst === moSkeleton) hv++;
        if (c2.monst === moGargoyle) hv--;
        if (c2.monst === moDraugr) hv--;
        if (isDragon(c2.monst)) hv++;
        if (c2.monst === moNecromancer) hv += 10;
        if (c2.monst === moWormtail) hv++;
        if (c2.monst === moTentacletail) hv -= 2;
        if (c2.monst === moAngryDie) hv++;
        if (isIvy(c2)) hv--;
        if (isDemon(c2)) hv -= 3;
      }
      heatvals[i] = hv;
    }
    else if (c.land === laLivefjord) {
      let hv = 0;
      if (c.monst === moWaterElemental)
        hv += 1000;
      if (isPlayerInBoatOn(c) && markOrb(itOrbWater))
        hv += 1000;
      if (c.monst === moEarthElemental)
        hv -= 1000;
      if (isPlayerOn(c) && markOrb(itOrbDigging))
        hv -= 1000;
      for (let j = 0; j < c.type; j++) if (c.move(j)) {
        const c2 = c.move(j);
        if (c2.wall === waNone || c2.wall === waStrandedBoat)
          hv -= (c2.land === laLivefjord ? 1 : 100);
        if (c2.wall === waTempFloor || c2.wall === waTempBridge || c2.wall === waTempBridgeBlocked) { /* */ }
        else if (c2.wall === waDeadTroll || c2.wall === waDeadTroll2 || c2.wall === waThumperOn || isFire(c2) || snakelevel(c2))
          hv -= 10;
        else if (c2.wall === waPetrified || c2.wall === waPetrifiedBridge)
          hv -= 10;
        if (c2.wall === waBigStatue)
          hv -= 10;
        if (c2.wall === waSea || c2.wall === waBoat)
          hv += (c2.land === laLivefjord ? 1 : 100);
        if (c2.monst === moWaterElemental)
          hv += 1000;
        if (isPlayerOn(c2) && c2.wall === waBoat && markOrb(itOrbWater))
          hv += 1000;
        if (c2.monst === moEarthElemental)
          hv -= 1000;
        if (isPlayerOn(c2) && markOrb(itOrbDigging))
          hv -= 1000;
        if (G.items[itOrbEmpathy] && isFriendly(c2) && markEmpathy(itOrbDigging))
          hv -= 1000;

        if (c2.wall === waBarrier) {
          let landbar = false;
          for (let k = 0; k < c2.type; k++)
            if (c2.move(k)) {
              const c3 = c2.move(k);
              if (!isSealand(c3.land))
                landbar = true;
            }
          if (landbar) hv -= 5;
          else hv += 5;
        }
      }
      heatvals[i] = hv;
    }
  }

  for (let i = 0; i < dcs; i++) {
    const c = allcells[i];
    const old = c.wall;
    if (!doall && c.cpdist > gr + 1) break;
    const hv = heatvals[i];

    if (c.wall === waCavefloor || c.wall === waCavewall) {
      if (hv > 0) c.wall = waCavefloor;
      if (hv < 0) {
        c.wall = waCavewall;
        if (c.land !== laCaves && c.land !== laDeadCaves && c.land !== laEmerald)
          achievement_gain_once('GARDENER');
      }
    }
    else if (c.land === laLivefjord) {
      if (hv > 0 && c.wall === waStrandedBoat) c.wall = waBoat;
      if (hv > 0 && c.wall === waNone) {
        if (c.item && c.cpdist === 1 && markOrb(itOrbWater)) {
          const saf = c.item === itOrbSafety;
          const it = c.item;
          collectItem(c, c);
          if (it && !c.item) animate_item_throw(c, G.cwt.at, it);
          if (saf) return;
        }
        c.wall = waSea;
      }
      if (hv < 0 && c.wall === waBoat) c.wall = waStrandedBoat;
      if (hv < 0 && c.wall === waSea) c.wall = waNone;
    }

    if (c.wall !== old) G.recompute_los = true;
  }

  for (let i = 0; i < isize(bringlife); i++) {
    const c = bringlife[i];
    if (c.land === laDeadCaves)
      achievement_gain_once('LIFEBRINGER');
    if (c.wall === waDeadfloor) c.wall = waCavefloor;
    if (c.wall === waDeadfloor2) c.wall = waCavewall;
    if (c.wall === waDeadwall) c.wall = waCavewall;
    if (c.wall === waCavewall && c.item) c.wall = waCavefloor;
    if (c.land === laDeadCaves) c.land = laCaves;
    if (c.item === itSilver) c.item = itGold;
    if (c.item === itGreenStone && !G.inv_on) c.item = itOrbLife;
    if (c.monst === moEarthElemental) {
      addMessage(XLAT('%The1 is destroyed by the forces of Life!', spM(c.monst)));
      fallMonster(c);
      c.item = itOrbDigging;
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// namespace tortoise (evolver)

/** enum tflag */
export const tfShell = 0, tfScute0 = 1, tfScute1 = 2, tfScute2 = 3, tfScute3 = 4,
  tfEdge1 = 5, tfEdge = 6, tfEdge3 = 7,
  tfLongNeck = 8, tfFront = 9, tfRear = 10, tfTail = 11,
  tfEyeHue = 12, tfShellHue = 13, tfScuteHue = 14, tfSkinHue = 15,
  tfShellSat = 16, tfScuteSat = 17, tfSkinSat = 18,
  tfShellDark = 19, tfSkinDark = 20,
  tfCOUNT = 21;

/** EX const int numbits = (int) tfCOUNT */
export const tortoise_numbits = tfCOUNT;
/** EX const int mask = (1<<numbits)-1 */
export const tortoise_mask = (1 << tortoise_numbits) - 1;

export function tortoise_getb(where: cell): number {
  if (G.tortoise_emap.has(where)) return G.tortoise_emap.get(where)!;
  return getBits(where) & ((1 << tortoise_numbits) - 1);
}

export function tortoise_countBits(c: number): number {
  let bi = 0;
  for (let i = 0; i < tortoise_numbits; i++) if ((c >> i) & 1) bi++;
  return bi;
}

export function tortoise_getBit(bits: number, id: number): number { return (bits >> id) & 1; }

export function tortoise_getRandomBits(): number { return hrand(1 << tortoise_numbits); }

export function tortoise_seek(): boolean { return !!(G.items[itBabyTortoise] % 5); }

const tortoise_seekval: number[] = new Array(tortoise_numbits).fill(0);
const tortoise_currval: number[] = new Array(tortoise_numbits).fill(0);

/** update(double& val, double target, int delta): returns the new val */
function tortoise_update(val: number, target: number, delta: number): number {
  let d = delta / 300.;
  if (d > 1) d = 1;
  if (target > val + d) val += d;
  else if (target < val - d) val -= d;
  else val = target;
  return val;
}

export function tortoise_shading_on(): boolean {
  return G.tortoise_shading_enabled && tortoise_seek();
}

export function tortoise_updateVals(delta: number): void {
  const currbits = getBits(G.cwt.at);
  for (let i = 0; i < tortoise_numbits; i++)
    tortoise_seekval[i] = tortoise_update(tortoise_seekval[i], tortoise_shading_on() ? tortoise_getBit(G.tortoise_seekbits, i) : .5, delta);
  for (let i = 0; i < tortoise_numbits; i++)
    tortoise_currval[i] = tortoise_update(tortoise_currval[i], tortoise_getBit(currbits, i), delta);
}

export function tortoise_getScent(bits: number): number {
  let res = 0;
  for (let i = 0; i < tortoise_numbits; i++)
    res += (2 * tortoise_seekval[i] - 1) * (tortoise_getBit(bits, i) - tortoise_currval[i]);
  return res;
}

export function tortoise_diff(bits: number): number { return tortoise_countBits(bits ^ G.tortoise_seekbits); }
function tortoise_progress(bits: number): number { return tortoise_numbits - tortoise_diff(bits); }

export function tortoise_measure(bits: number): string {
  return '(' + its(tortoise_progress(bits)) + '/' + its(tortoise_numbits) + ')';
}

// swap_data: pcmove.ts

export function tortoise_move_baby(c1: cell, c2: cell): void {
  swap_data(G.tortoise_babymap, c1, c2);
}

export function tortoise_move_adult(c1: cell, c2: cell): void {
  swap_data(G.tortoise_emap, c1, c2);
}

// ---------------------------------------------------------------------------------------------------------------
// namespace dragon

function dragon_pullback(c: cell): void {
  let maxlen = iteration_limit;
  while (maxlen-- > 0) {
    const mi = moveimon(c).rev();
    mountmove(mi, true);
    c.monst = mi.s.monst;
    c.hitpoints = mi.s.hitpoints;
    animateMovement(mi, LAYER_BIG);
    c.stuntime = 2;
    if (mi.s.mondir === NODIR) { c.mondir = NODIR; mi.s.monst = moNone; return; }
    c = mi.s;
  }
}

let dragon_dragbugs = false;

/** sm::MAP (graph.cpp) */
const sm_MAP = 8n;

export function dragon_findhead(c: cell): cell {
  let maxlen = iteration_limit;
  findhead: while (true) {
    if (maxlen-- < 0) return c;
    if (c.monst === moDragonHead) return c;
    for (let i = 0; i < c.type; i++)
      if (c.move(i) && isDragon(c.move(i).monst) && c.move(i).mondir === c.c.spin(i)) {
        c = c.move(i); continue findhead;
      }
    break;
  }
  if (G.cmode & sm_MAP) return c;
  if (!G.history_includeHistory) {
    // printf("dragon bug #3 (%p -> %p)\n", cor, c);
    dragon_dragbugs = true;
  }
  c.monst = moDragonHead; return c;
}

/** validate(const char *where): a debugging aid, not called in 13.1o */
export function dragon_validate(_where: string): void {
  dragon_dragbugs = false;
  for (let i = 0; i < isize(G.dcal); i++)
    if (G.dcal[i].monst === moDragonTail)
      dragon_findhead(G.dcal[i]);
  if (dragon_dragbugs) {
    // printf("DRAGON BUG in %s\n", where);
    exit(1);
  }
}

export function dragon_bodypart(c: cell, head: cell): number {
  let i = 0, j = 0;
  let maxlen = iteration_limit;
  while (maxlen-- > 0) {
    if (head === c) i = j;
    j++;
    if (head.mondir === NODIR) break;
    head = head.move(head.mondir);
  }
  if (i === 0) return 'h'.charCodeAt(0);
  if (i === 1) return 'l'.charCodeAt(0);
  if (i === j - 2) return '2'.charCodeAt(0);
  if (i === j - 1) return 't'.charCodeAt(0);
  if (i === 2) return 'w'.charCodeAt(0);
  return 0;
}

export function dragon_kill(c: cell, who: eMonster): void {
  let delay = false;
  G.kills[moDragonHead]++;
  let penalty = 0;
  let maxlen = iteration_limit;
  while (maxlen-- > 0) {
    changes.ccell(c);
    makeflame(c, 5, false);
    const m = c.monst;
    drawFireParticles(c, 16);
    c.monst = moNone;
    if (checkOrb(who, itOrbUndeath))
      c.monst = moFriendlyGhost;
    if (!do_not_touch_this_wall(c) && checkOrb(who, itOrbStone)) {
      c.wparam = m; c.wall = waPetrified;
    }
    else if (c.wall === waFire) {
      if (delay) delay = false;
      else {
        if (c.land !== laDragon) penalty += 3;
        if (penalty) penalty--;
        else {
          c.item = itDragon;
          c.landparam = G.shmup_on ? G.shmup_curtime : G.turncount;
          delay = true;
        }
      }
    }
    if (c.mondir === NODIR) break;
    c = c.move(c.mondir);
  }
}

export function dragon_totalhp(c: cell): number {
  let total = 0;
  let maxlen = iteration_limit;
  while (maxlen-- > 0) {
    if (!isDragon(c.monst)) {
      // if(!history::includeHistory) printf("dragon bug #4\n");
      return total;
    }
    total += c.hitpoints;
    if (c.mondir === NODIR) return total;
    c = c.move(c.mondir);
    if (!c) return total;
  }
  return total;
}

/** static vector<cell*> allcells (in pullfront) */
const pullfront_allcells: cell[] = [];

function dragon_pullfront(c: cell, until: cell): void {
  let maxlen = iteration_limit;
  const allcells = pullfront_allcells;
  allcells.length = 0;
  while (maxlen-- > 0) {
    allcells.push(c);
    c.stuntime = 2;
    if (c === until) {
      for (let i = isize(allcells) - 2; i >= 0; i--) {
        const cmt = allcells[i + 1];
        const cft = allcells[i];
        cmt.hitpoints = cft.hitpoints;
        cmt.monst = cft.monst;
        cft.monst = moNone;
        const mi = moveimon(cft);
        mountmove(mi, true);
        animateMovement(mi, LAYER_BIG);
      }
      while (c.mondir !== NODIR) {
        c = c.move(c.mondir);
        if (!c) return;
        c.stuntime = 2;
      }
      break;
    }
    if (c.mondir === NODIR) { /* printf("dragon bug\n"); */ break; }
    c = c.move(c.mondir);
    if (!c) {
      // if(!history::includeHistory) printf("dragon bug #2\n");
      break;
    }
  }
}

export function dragon_move(mi: movei): boolean {
  const df = mi.s;
  const dt = mi.t;
  if (df.monst === moDragonHead) {
    dt.mondir = neighborId(dt, df);
    dragon_pullback(dt);
    dt.stuntime = 2;
    return true;
  }
  if (df.monst === moDragonTail && df.stuntime === 0) {
    const head = dragon_findhead(df);
    if (df.mondir === NODIR) {
      df.mondir = neighborId(df, dt);
      dt.mondir = NODIR;
      dragon_pullfront(head, dt);
    }
    else {
      const c2 = df.move(df.mondir);
      if (!c2) return false;
      const id = neighborId(dt, c2);
      if (id === -1) return false;
      dt.mondir = id;
      df.mondir = neighborId(df, dt);
      dragon_pullfront(head, dt);
    }
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------------------------
// namespace sword

/** struct sworddir (a value type: copy with clone()) */
export class sworddir {
  angle = 0;
  T: transmatrix = Id;
  clone(): sworddir { const r = new sworddir(); r.angle = this.angle; r.T = this.T; return r; }
}

/** #define SWORDDIM (mhybrid ? 2 : WDIM) */
function SWORDDIM(): number { return mhybrid() ? 2 : WDIM(); }

function sword_possible_divisor(s: number): void { G.sword_sword_angles *= idiv(s, gcd(G.sword_sword_angles, s)); }

export function sword_determine_sword_angles(): void {
  G.sword_sword_angles = 2;
  if (SWORDDIM() === 3) G.sword_sword_angles = 1;
  else if (IRREGULAR()) G.sword_sword_angles = 840;
  else if (bt_in()) G.sword_sword_angles = 42;
  else if (arcm_in()) {
    if (!PURE()) sword_possible_divisor((BITRUNCATED() ? 2 : 1) * isize(arcm_current_faces()));
    if (!DUAL()) for (const f of arcm_current_faces()) sword_possible_divisor(f);
  }
  else {
    sword_possible_divisor(S7());
    if (BITRUNCATED()) sword_possible_divisor(S3());
  }
}

export function sword_pos2(c: cell, s: number): cell {
  const sword_angles = G.sword_sword_angles;
  let t = c.type;
  if (mhybrid()) t -= 2;
  s *= 2;
  s += idiv(sword_angles, t);
  s %= (2 * sword_angles);
  if (s < 0) s += sword_angles * 2;
  s *= t;
  s = idiv(s, sword_angles * 2);
  let c1 = c.move(s);
  if (inmirror(c1)) c1 = mirror_reflect(new cellwalker(c1)).at;
  return c1;
}

export function sword_pos(c: cell, sd: sworddir, rev: boolean): cell {
  if (SWORDDIM() === 2)
    return sword_pos2(c, sd.angle + (rev ? idiv(G.sword_sword_angles, 2) : 0));
  else {
    let best: cell = null!;
    let bdist = Infinity;
    for (let i = 0; i < S7(); i++) {
      const dist = hdist(tmulh(sd.T, xpush0(rev ? -0.1 : 0.1)), tC0(G.currentmap.relative_matrix_h(c.move(i).master, c.master, C0())));
      if (dist < bdist) { bdist = dist; best = c.move(i); }
    }
    return best;
  }
}

function sword_orbof(rev: boolean): eItem { return rev ? itOrbSword2 : itOrbSword; }
export function sword_orbcount(rev: boolean): number { return G.items[sword_orbof(rev)]; }

/** cell *pos(int id, bool rev) */
export function sword_pos_n(id: number, rev: boolean): cell {
  if (!sword_orbcount(rev)) return null!;
  return sword_pos(playerpos(id), G.sword_dir[id], rev);
}

export function sword_at(where: cell, noplayer = false): boolean {
  if (noplayer) return false;
  if (!sword_orbcount(false) && !sword_orbcount(true)) return false;
  for (let i = 0; i < numplayers(); i++) if (multi_playerActive(i)) for (let b = 0; b < 2; b++)
    if (sword_pos_n(i, !!b) === where) return true;
  return false;
}

export function sword_isnear(where: cell): boolean {
  if (sword_at(where, false)) return true;
  for (let i = 0; i < where.type; i++) { const w2 = where.move(i); if (!w2) continue; if (sword_at(w2, false)) return true; }
  return false;
}

/** from c1 to c2 */
export function sword_shift(mi: movei, d: sworddir): sworddir {
  d = d.clone();
  const c1 = mi.s;
  const c2 = mi.t;
  if (!mi.proper()) return d;
  const s1 = mi.d;
  const s2 = mi.rev_dir_force();
  neighborId(c2, c1);
  if (s1 < 0 || s2 < 0) return d;
  const sword_angles = G.sword_sword_angles;
  if (SWORDDIM() === 2) {
    const sub = (mhybrid()) ? 2 : 0;
    const t2 = c2.type - sub;
    const t1 = c1.type - sub;
    if (t1 === 0 || t2 === 0) return d;
    if (c1.c.mirror(s1))
      d.angle = ((idiv(s2 * sword_angles, t2) - d.angle + idiv(s1 * sword_angles, t1)) + idiv(sword_angles, 2)) % sword_angles;
    else
      d.angle = ((idiv(s2 * sword_angles, t2) - idiv(s1 * sword_angles, t1)) + idiv(sword_angles, 2) + d.angle) % sword_angles;
  }
  else {
    let T = G.currentmap.relative_matrix(c1, c2, C0());
    T = tmul(gpushxto0(tC0(T)), T);
    d.T = tmul(T, d.T);
    fixmatrix(d.T);
  }
  return d;
}

function sword_initial_matrix(): transmatrix {
  if (S7() === 6) return Id;
  return tmul(tmul(tmul(cspin(0, 1, 0.1), cspin(0, 2, 0.1)), cspin(1, 2, 0.1)), Id);
}

export function sword_initial(_c: cell): sworddir {
  const res = new sworddir();
  res.angle = idiv(idiv(G.sword_sword_angles, G.cwt.at.type) + 1, 2);
  if (SWORDDIM() === 3) res.T = sword_initial_matrix();
  return res;
}

function sword_shuffle_i(i: number): void {
  changes.value_keep(G.sword_dir[i], 'angle');
  changes.value_keep(G.sword_dir[i], 'T');
  G.sword_dir[i].angle = hrand(G.sword_sword_angles);
  if (SWORDDIM() === 3) G.sword_dir[i].T = sword_initial_matrix();
}

export function sword_reset(): void {
  G.items[itOrbSword] = G.items[itOrbSword2] = 0;
  sword_shuffle_i(G.multi_cpid);
}

/** void shuffle() */
export function sword_shuffle(): void {
  for (let i = 0; i < MAXPLAYER; i++) sword_shuffle_i(i);
}

// ---------------------------------------------------------------------------------------------------------------
// namespace kraken

export function kraken_head(c: cell): cell {
  if (c.monst === moKrakenH) return c;
  if (c.monst === moKrakenT) return c.move(c.mondir);
  return null!;
}

export function kraken_kill(c: cell, who: eMonster): void {
  changes.ccell(c);
  drawParticles(c, minf[moKrakenH].color, 16);
  c.monst = moNone;
  if (checkOrb(who, itOrbUndeath)) c.monst = moFriendlyGhost;
  if (c.land === laKraken && !c.item) c.item = itKraken;
  G.kills[moKrakenH]++;
  if (!do_not_touch_this_wall(c) && checkOrb(who, itOrbStone)) c.wall = waNone;
  for (let i = 0; i < c.type; i++) {
    const c1 = c.move(i); if (!c1) continue;
    if (c1.monst === moKrakenT) {
      changes.ccell(c1);
      drawParticles(c, minf[moKrakenT].color, 16);
      c1.monst = moNone;
      if (!do_not_touch_this_wall(c1) && checkOrb(who, itOrbStone)) {
        if (isWatery(c1))
          c1.wall = waNone;
        else {
          c1.wall = waPetrified; c1.wparam = moKrakenT;
        }
      }
    }
  }
}

export function kraken_totalhp(c: cell): number {
  let total = 0;
  for (let i = 0; i < c.type; i++) {
    const c1 = c.move(i); if (!c1) continue;
    if (c1.monst === moKrakenT)
      total += c1.hitpoints;
  }
  return total;
}

function kraken_sleep(c: cell): void {
  if (c.monst === moKrakenT) c = c.move(c.mondir);
  c.stuntime = 1;
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; c2.stuntime = 1; }
}

export function kraken_attacks(): void {
  const offboat: boolean[] = new Array(MAXPLAYER).fill(false);
  for (let i = 0; i < isize(G.dcal); i++) {
    const c = G.dcal[i];
    if (c.monst === moKrakenT && !c.stuntime) for (let j = 0; j < c.type; j++) {
      const c2 = c.move(j); if (!c2) continue;
      if (!logical_adjacent(c2, moKrakenT, c)) continue;
      let dboat = false;
      if (c2.monst && canAttack(c, moKrakenT, c2, c2.monst, AF_ONLY_FBUG)) {
        attackMonster(c2, AF_NORMAL | AF_MSG, c.monst);
        kraken_sleep(c);
      }
      else for (let p = 0; p < numplayers(); p++) if (playerpos(p) === c2 && !G.peace_on) {
        if (isPlayerInBoatOn(c2, p)) {
          addMessage(XLAT('%The1 destroys your boat!', spM(moKrakenH)));
          dboat = true;
          offboat[p] = true;
        }
        else if (offboat[p]) { /* */ }
        else killThePlayer(moKrakenH, p, 0n);
        kraken_sleep(c);
      }
      if (dboat) destroyBoats(c2, c, true);
    }
  }
  for (let i = 0; i < isize(G.dcal); i++) {
    const c = G.dcal[i];
    if (c.monst === moKrakenH && !c.stuntime && !isWateryOrBoat(c)) {
      const ctab: cell[] = [];
      for (let j = 0; j < c.type; j++) { const c2 = c.move(j); if (!c2) continue; if (isWatery(c2)) ctab.push(c2); }
      hrandom_shuffle(ctab);
      for (const cc of ctab) kraken_trymove(cc);
    }
  }
}

/** c is the tentacle which will be the head after the move */
export function kraken_trymove(c: cell): void {
  if (kraken_pseudohept(c)) return;
  const c2 = c.move(c.mondir);
  if (!isWatery(c)) return;
  if (againstCurrent(c, c2)) return;
  for (let i = 0; i < c.type; i++) {
    const c3 = c.move(i); if (!c3) continue;
    if (c3.monst && c3 !== c2 && !(c3.mondir < c3.type &&
      c3.move(c3.mondir) === c2))
      return;
    if (isPlayerOn(c3)) return;
    if (sword_at(c3)) return;
    if (!passable(c3, c, P_FISH | P_MONSTER)) return;
  }
  if (c2.stuntime) return;
  const hpcount: number[] = new Array(10).fill(0);
  for (let i = 0; i < c2.type; i++) {
    const c3 = c2.move(i); if (!c3) continue;
    hpcount[i] = c3.hitpoints;
    c3.monst = moNone;
  }
  c.monst = moKrakenH;
  const hk = G.kraken_half_killed;
  if (hk.has(c2)) { hk.set(c, hk.get(c2)!); hk.delete(c2); }
  const acells: [cell, cell][] = [];
  acells.push([c2, c]);
  for (let i = 0; i < c.type; i++) {
    const c3 = c.move(i); if (!c3) continue;
    c3.monst = moKrakenT;
    c3.mondir = c.c.spin(i);
    c3.monmirror = c.monmirror ^ (c.c.mirror(i) ? 1 : 0);
    const i0 = (i + c.c.spin(c.mondir) - c.mondir + 96 + idiv(c.type, 2)) % c2.type;
    c3.hitpoints = hpcount[i0];
    acells.push([c2.move(i0), c3]);
    if (c3.wall === waBoat) {
      addMessage(XLAT('%The1 destroys %the2!', spM(moKrakenH), spW(waBoat)));
      c3.wall = waSea;
    }
    if (c3.wall === waStrandedBoat) {
      addMessage(XLAT('%The1 destroys %the2!', spM(moKrakenH), spW(waBoat)));
      c3.wall = waNone;
    }
  }

  while (isize(acells)) {
    for (let i = 0; i < isize(acells); i++) {
      indAnimateMovement(match(acells[i][0], acells[i][1]), LAYER_BIG);
      acells[i] = acells[isize(acells) - 1];
      acells.length = isize(acells) - 1;
      i--;
    }
  }
  commitAnimations(LAYER_BIG);
  kraken_sleep(c);
  return;
}

function barrierhept(c: cell): boolean {
  return c.bardir !== NOBARRIERS && c.bardir !== NODIR;
}

// ---------------------------------------------------------------------------------------------------------------
// namespace prairie (CAP_FIELD)

function prairie_getfval(c3: cell): number {
  if (barrierhept(c3)) return fieldpattern_btspin(fieldpattern_fieldval(c3)[0], c3.bardir) + 1;
  return 0;
}

export function prairie_spread(c: cell, from: cell): void {
  let rd: number;

  c.LHU.fi.flowerdist = 8;
  c.LHU.fi.walldist = 8;
  c.LHU.fi.walldist2 = 8;

  if (ls_any_chaos()) {
    c.LHU.fi.rval = 0;
  }
  else if (quotient() && G.geometry !== gFieldQuotient) { // fix cylinder
    c.LHU.fi.rval = 0;
  }
  else if (euclid()) {
    const co = euc2_coordinates(c);
    const y = co[1];
    c.LHU.fi.rval = (y & 15);
  }
  else if (sphere()) {
    c.LHU.fi.rval = celldistance(c, G.cwt.at) + 8 - (PURE() ? 2 : 3);
  }
  else if (weirdhyperbolic()) {
    c.LHU.fi.rval = Math.max(celldist(c), 15);
  }
  else {
    const currfp = fieldpattern_getcurrfp();
    if (G.geometry === gFieldQuotient || !from) {
      c.fval = currfp.distflower0;
    }
    else if (from && from.land === laPrairie && from.fval)
      c.fval = from.fval;
    else {
      for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.land === laPrairie && c2.fval) c.fval = c2.fval; }
      if (!c.fval) for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (!c.fval) c.fval = prairie_getfval(c2); }
      if (!c.fval) for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i); if (!c2) continue;
        for (let j = 0; j < c2.type; j++) { const c3 = c2.move(j); if (!c3) continue; if (!c.fval) c.fval = prairie_getfval(c3); }
      }
      if (!c.fval) {
        // (barclose: only printed)
        raiseBuggyGeneration(c, 'could not set river fval');
      }
    }
    let fv = fieldpattern_fieldval(c);
    fv = currfp.gmul_p(fv, currfp.inverses[c.fval - 1]);

    rd = currfp.getdist_v(fv, currfp.distriver);
    const rl = currfp.getdist_v(fv, currfp.distriverleft);
    const rr = currfp.getdist_v(fv, currfp.distriverright);

    c.LHU.fi.flowerdist = currfp.getdist_v(fv, currfp.distflower);
    c.LHU.fi.walldist = currfp.getdist_v(fv, currfp.distwall);
    c.LHU.fi.walldist2 = currfp.getdist_v(fv, currfp.distwall2);

    c.LHU.fi.rval = 0;
    if (rd <= 7 && rl < rr)
      c.LHU.fi.rval = 8 + rd;
    if (rd <= 7 && rl > rr)
      c.LHU.fi.rval = 7 - rd;
  }

  if (c.LHU.fi.flowerdist === 0 && c.type !== 6) c.item = itOrbSafety;

  if (c.LHU.fi.walldist === 0) c.wall = waBarrier;

  // (an `if(0)` block placing the field markers is left out)
}

/** #define RLOW (sphere?(PURE?7:6):PURE?4:2) */
function RLOW(): number { return sphere() ? (PURE() ? 7 : 6) : PURE() ? 4 : 2; }
/** #define RHIGH (sphere?(PURE?8:9):PURE?11:13) */
function RHIGH(): number { return sphere() ? (PURE() ? 8 : 9) : PURE() ? 11 : 13; }

export function prairie_get_val(c: cell): number {
  if (ls_hv_structure()) {
    let a = celldistAlt(c);
    if (a >= 2) a = 2;
    a = gmod(18 - a, 20);
    return a;
  }
  return c.LHU.fi.rval;
}

export function prairie_no_worms(c: cell): boolean {
  if (c.land !== laPrairie) return false;
  const rv = prairie_get_val(c);
  return rv > RLOW() + 1 && rv < RHIGH() - 1;
}

export function prairie_isriver(c: cell): boolean {
  const rv = prairie_get_val(c);
  return c.land === laPrairie && rv <= RHIGH() && rv >= RLOW();
}

// (prairie::mainriver is unused)

export function prairie_nearriver(c: cell): boolean {
  const rv = prairie_get_val(c);
  return rv === RHIGH() + 1 || rv === RLOW() - 1;
}

let prairie_enter: cell = null!;

function prairie_opposite(c: cell): boolean {
  return !!((prairie_get_val(c) ^ prairie_get_val(prairie_enter)) & 8);
}

// (isleft, towerleft, towerright: unused)

export function prairie_next(c: cell, pv = 1): cell {
  for (let i = 0; i < c.type; i++) {
    const c1 = createMov(c, i);
    const c2 = createMov(c, (i + pv + c.type) % c.type);
    const rv = prairie_get_val(c);
    if (c1 && prairie_get_val(c1) === rv)
      if (c2 && prairie_get_val(c2) === rv + 1)
        if (isNeighbor(c1, c2))
          return c1;
  }
  return null!;
}

function prairie_prev(c: cell): cell { return prairie_next(c, -1); }

function prairie_beastdist(c: cell, dir: number): number {
  let cx = c; let n = 0;
  while (true) {
    if (cx.monst === moHerdBull) return n;
    cx = prairie_next(cx, dir);
    n++;
    if (!cx || n >= 1000) return 1000;
  }
}

export function prairie_generateBeast(c: cell): void {
  const beastdistance = Math.min(prairie_beastdist(c, 1), prairie_beastdist(c, -1));
  if (hrand(1000) >= 15 * beastdistance + 2 * G.items[itGreenGrass]) return;
  c.monst = moHerdBull;
  const c2 = prairie_prev(c);
  if (c2) c.mondir = neighborId(c, c2);
}

function prairie_moveAt(c: cell, cl: manual_celllister): void {
  if (!cl.add(c)) return;
  const whirlline: cell[] = [];
  whirlline.push(c);
  let c2 = prairie_prev(c);
  while (c2 && cl.add(c2)) {
    whirlline.push(c2);
    c2 = prairie_prev(c2);
    // in sphere/quotient geometries, never break before a bull
    if ((sphere() || quotient()) && !c2.monst) break;
  }
  whirlline.reverse();
  c2 = prairie_next(c);
  while (c2 && cl.add(c2)) { whirlline.push(c2); c2 = prairie_next(c2); }
  const qty = isize(whirlline);
  if (G.shmup_on) {
    for (let i = 0; i < qty; i++) if (whirlline[i].cpdist <= gamerange()) {
      prairie_generateBeast(whirlline[i]);
      break;
    }
  }
  else {
    c2 = whirlline[qty - 1];
    if (c2.monst === moHerdBull) c2.monst = moNone;
    if (!G.shmup_on) for (let q = qty - 2; q >= 0; q--) {
      const cp = whirlline[q];
      const cn = whirlline[q + 1];
      /* just pretend the roadblocks disappear */
      if (cn.monst === moRagingBull && cn.cpdist === INFD && cn.stuntime) {
        cn.stuntime--;
        if (cn.stuntime === 0) cn.monst = moNone;
      }
      if (cp.monst === moHerdBull && !cp.stuntime) {
        cp.mondir = neighborId(cp, cn);
        beastAttack(cp, true, true);

        if (!cn.monst && !isPlayerOn(cn) && passable_for(cp.monst, cn, cp, P_DEADLY))
          moveMonster(new movei(cp, cn, TELEPORT));
        else {
          playSound(null!, 'hit-axe' + pick123());
          beastcrash(cn, cp);
          cp.monst = moRagingBull;
          cp.stuntime = 3;
          cp.mondir = NODIR;
        }
      }
    }
    if (!sphere() && !quotient()) prairie_generateBeast(whirlline[0]);
  }
}

export function prairie_move(): void {
  if (ls_any_chaos()) return;
  const cl = new manual_celllister();
  try {
    for (let i = 0; i < isize(G.dcal); i++) {
      const c = G.dcal[i];
      if (prairie_isriver(c)) prairie_moveAt(c, cl);
    }
  }
  finally { cl.destroy(); }
  for (let i = 0; i < isize(G.prairie_beaststogen); i++)
    prairie_generateBeast(G.prairie_beaststogen[i]);
  G.prairie_beaststogen.length = 0;
}

const prairie_tchoices: cell[] = [];

let prairie_lasttreasure: cell = null!;

function prairie_thisriver(c: cell): boolean {
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.mpdist < c.mpdist && !prairie_isriver(c2)) return false; }
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.mpdist < c.mpdist) return prairie_thisriver(c2); }
  return true;
}

export function prairie_generateTreasure_here(c: cell): void {
  const hr = hrand(100);
  if (hr === 0 && G.items[itGreenGrass] >= 10 && !G.inv_on) {
    c.item = itOrbBull;
  }
  else if (hr < 1 + PRIZEMUL) {
    placePrizeOrb(c);
  }
  else if (!ls_hv_structure())
    prairie_tchoices.push(c);
}

export function prairie_generateTreasure(c: cell): void {
  if (ls_hv_structure()) {
    if (prairie_get_val(c) === RHIGH() + 1) {
      const cd = celldist(c);
      let min_cd = cd;
      let c1: cell;
      c1 = c; for (let a = 0; a < 3; a++) {
        for (let i = 0; i < c1.type; i++) { const c2 = c1.move(i); if (!c2) continue; setdist(c2, 9, null!); }
        c1 = prairie_next(c1); if (!c1) return; min_cd = Math.min(min_cd, celldist(c1));
      }
      c1 = c; for (let a = 0; a < 3; a++) {
        for (let i = 0; i < c1.type; i++) { const c2 = c1.move(i); if (!c2) continue; setdist(c2, 9, null!); }
        c1 = prairie_prev(c1); if (!c1) return; min_cd = Math.min(min_cd, celldist(c1));
      }
      if (min_cd >= cd - 1) for (let i = 0; i < c.type; i++) {
        const c3 = c.move(i); if (!c3) continue;
        if (prairie_isriver(c3) && celldist(c3) < cd)
          c.item = itGreenGrass;
      }
    }
    if (prairie_get_val(c) === 18 && hrand(100) < 50) c.item = itOrbSafety;
    if (prairie_get_val(c) === 17) prairie_generateTreasure_here(c);
    return;
  }
  if (prairie_enter && prairie_nearriver(c) && prairie_opposite(c) && prairie_thisriver(c)) prairie_generateTreasure_here(c);
}

export function prairie_treasures(): void {
  if (prairie_enter && !prairie_isriver(G.cwt.at)) prairie_enter = null!;
  else if (!prairie_enter && prairie_isriver(G.cwt.at)) prairie_enter = G.cwt.at;
  if (isize(prairie_tchoices)) {
    if (prairie_lasttreasure && prairie_lasttreasure.item === itGreenGrass) {
      if (celldistance(prairie_lasttreasure, G.cwt.at) >= (PURE() ? 7 : 10)) {
        prairie_lasttreasure.item = itNone;
        for (let i = 0; i < prairie_lasttreasure.type; i++) {
          const c2 = prairie_lasttreasure.move(i); if (!c2) continue;
          if (c2.item === itGreenGrass) c2.item = itNone;
        }
      }
      else { prairie_tchoices.length = 0; return; }
    }
    if (isize(prairie_tchoices) < 3) { prairie_tchoices.length = 0; return; }
    prairie_lasttreasure = prairie_tchoices[hrand(isize(prairie_tchoices))];
    prairie_lasttreasure.item = itGreenGrass;
    for (let i = 0; i < isize(prairie_tchoices); i++) if (isNeighbor(prairie_tchoices[i], prairie_lasttreasure))
      prairie_tchoices[i].item = itGreenGrass;
    prairie_tchoices.length = 0;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// namespace ca

/** may be larger than MAX_EDGE due to mineadj */
const MAX_NEIGHBOR = 60;
/** string carule[MAX_NEIGHBOR][2] */
const carule: string[][] = Array.from({ length: MAX_NEIGHBOR }, () => ['', '']);

export function ca_list_adj(c: cell): void {
  G.ca_changed.add(c);
  for (const c1 of adj_minefield_cells(c))
    G.ca_changed.add(c1);
}

// you can also do -mineadj

export function ca_fillup(s: string): string {
  while (s.length < MAX_NEIGHBOR) s += '0';
  return s;
}

export function ca_init(): void {
  // hexagonal variant of Game of Life, as suggested by Wikipedia
  for (let i = 0; i < MAX_NEIGHBOR; i++) {
    carule[i][0] = ca_fillup('00100');
    carule[i][1] = ca_fillup('00011');
  }
}

/** C atoi: leading whitespace, sign, digits (0 if none) */
function atoi(s: string): number {
  const m = /^\s*([+-]?\d+)/.exec(s);
  return m ? (parseInt(m[1], 10) | 0) : 0;
}

function ca_readArg(): number {
  if (arg_argis('-caprob')) {
    arg_shift(); G.ca_prob = arg_argf();
    return 0;
  }
  if (arg_argis('-calive')) {
    arg_shift(); G.ca_wlive = arg_argi();
    return 0;
  }
  if (arg_argis('-carun')) {
    arg_shift(); const iter = arg_argi();
    start_game();
    for (let i = 0; i < iter; i++) ca_simulate();
    return 0;
  }
  const a = arg_args();
  /** args()[k] as a char code ('\0' past the end) */
  const ch = (k: number): number => k < a.length ? a.charCodeAt(k) : 0;
  if (ch(0) !== 45 /* '-' */) return 1;
  if (ch(1) !== 99 /* 'c' */) return 1;
  const livedead = ch(2) - 48;
  if (livedead < 0 || livedead > 1) return 1;
  let nei = -1;
  if (ch(3)) {
    nei = atoi(a.substring(3));
    if (nei < 0 || nei >= MAX_NEIGHBOR) return 1;
  }
  arg_shift();
  const s = arg_args();
  if (nei === -1) for (let i = 0; i < MAX_NEIGHBOR; i++)
    carule[i][livedead] = ca_fillup(s);
  else
    carule[nei][livedead] = ca_fillup(s);
  return 0;
}

export function ca_simulate(): void {
  if (G.cwt.at.land !== laCA) return;
  if (G.items[itOrbAether] < 2) G.items[itOrbAether] = 2;
  const allcells: cell[] = [];
  for (const c of sortedKeys(G.ca_changed)) allcells.push(c);
  G.ca_changed.clear();
  const dcs = isize(allcells);
  const willlive: boolean[] = new Array(dcs).fill(false);
  for (let i = 0; i < dcs; i++) {
    const c = allcells[i];
    if (c.land !== laCA) continue;
    let nei = 0, live = 0;
    for (const c2 of adj_minefield_cells(c)) {
      nei++; if (c2.wall === G.ca_wlive) live++;
    }
    let welive = 0; if (c.wall === G.ca_wlive) welive++;
    willlive[i] = carule[nei][welive][live] === '1';
  }
  for (let i = 0; i < dcs; i++) {
    const c = allcells[i];
    if (c.land !== laCA) continue;
    const last = c.wall;
    c.wall = willlive[i] ? G.ca_wlive : waNone;
    if (c.wall !== last) {
      const d = dynamicval(() => G.ca_prob, (v) => { G.ca_prob = v; }, 0);
      try {
        setdist(c, 7, null!);
        ca_list_adj(c);
      }
      finally { d.restore(); }
    }
  }
  // println(hlog, make_tuple(dcs, old, xold, isize(changed)));
}

// ---------------------------------------------------------------------------------------------------------------
// namespace windmap (CAP_FIELD)

export const windmap_NOWINDBELOW = 8;
export const windmap_NOWINDFROM = 120;

const windmap_getid = new Map<number, number>();
const windmap_neighbors: number[][] = [];
const windmap_samples: cellwalker[] = [];

/** getid[i] (inserts 0) */
function windmap_getid_at(i: number): number {
  const v = windmap_getid.get(i);
  if (v === undefined) { windmap_getid.set(i, 0); return 0; }
  return v;
}

export function windmap_getId(c: cell): number {
  const i = fieldpattern_fieldval_uniq(c);
  return windmap_getid_at(i) - 1;
}

/** int getId(cellwalker cw) */
function getId_cw(cw: cellwalker): number {
  const i = fieldpattern_fieldval_uniq(cw.at);
  let id = windmap_getid_at(i);
  if (id === 0) { windmap_samples.push(cw.clone()); id = isize(windmap_samples); windmap_getid.set(i, id); }
  return id - 1;
}

// (wcheck: a debugging aid that only prints)

export function windmap_create(): void {
  if (G.disable_bigstuff) return;
  if (cgflags() & qPORTALSPACE) return;
  if (hat_in()) return;
  windmap_samples.length = 0;
  windmap_neighbors.length = 0;
  windmap_getid.clear();
  getId_cw(new cellwalker(G.currentmap.gamestart(), 0));
  for (let k = 0; k < isize(windmap_samples); k++) {
    const cw = windmap_samples[k];
    const v: number[] = [];
    windmap_neighbors.push(v);
    for (let l = 0; l < cw.at.type; l++) v.push(getId_cw(cw.plus(l).addStep()));
  }

  const N = isize(windmap_samples);

  let precomp: readonly number[] | null = null;

  const windcodes = G.windmap_windcodes;
  while (windcodes.length > N) windcodes.pop();
  while (windcodes.length < N) windcodes.push(0);

  if (N === 18920) precomp = windcodes18920;
  if (N === 5676) precomp = windcodes5676;

  const currfp = fieldpattern_getcurrfp();
  if (precomp && (hyperbolic() || mhybrid()) && isize(currfp.matrices)) {
    const randval = hrand(isize(currfp.matrices));
    for (let i = 0; i < N; i++)
      windcodes[i] = u8(precomp[windmap_getid_at(fieldpattern_fieldval_uniq_rand(windmap_samples[i].at, randval)) - 1]);
    return;
  }

  let tries = 0;
  const maxtries = G.specialland === laVolcano || G.specialland === laBlizzard || ls_any_chaos() ? 20 : 1;
  let tocheck: number[] = [];
  while (true) { // tryagain:

    for (let i = 0; i < N; i++) windcodes[i] = hrand(256);

    const inqueue: boolean[] = new Array(N).fill(true);
    tocheck = [];
    for (let i = 0; i < N; i++) tocheck.push(i);
    hrandom_shuffle(tocheck);

    G.windmap_wind_failed = 0;

    for (let a = 0; a < isize(tocheck); a++) {
      if (a >= 200 * N) {
        // println(hlog, "does not converge");
        G.windmap_wind_failed |= 1;
        break;
      }
      let bestval = 1000000000, best = 0;
      const i = tocheck[a];
      for (let k = 0; k < 256; k++) {
        const j = windcodes[i] + k;
        let cval = 0;
        for (const c2 of windmap_neighbors[i]) {
          let d = (j - windcodes[c2]) & 255;
          if (d > 128) d = 256 - d;
          cval += d * d;
        }
        if (cval < bestval) { bestval = cval; best = j; }
      }
      if (windcodes[i] !== best)
        for (const c2 of windmap_neighbors[i])
          if (!inqueue[c2]) { inqueue[c2] = true; tocheck.push(c2); }
      inqueue[i] = false;
      windcodes[i] = u8(best);
    }

    const ingroup = [0, 0, 0, 0];
    for (let i = 0; i < N; i++) ingroup[windcodes[i] >> 6]++;
    let again = false;
    for (let u = 0; u < 4; u++) if (!ingroup[u]) {
      tries++;
      if (tries < maxtries) { again = true; break; }
    }
    if (again) continue;
    break;
  }
  // if(debug_geometry) println(hlog, "windmap: tries = ", tries, " N = ", N);
  if (tries >= maxtries) {
    if (maxtries >= 20)
      addMessage('Failed to generate an interesting wind/lava pattern.');
    G.windmap_wind_failed |= 2;
  }
}

export function windmap_at(c: cell): number {
  return G.windmap_windcodes[windmap_getId(c)];
}

// ---------------------------------------------------------------------------------------------------------------
// namespace halloween

export function halloween_generate(): void {
  const lst = [...G.currentmap.allcells()];
  for (const c of lst)
    setdist(c, 7, null!);

  const dragoncells = G.halloween_dragoncells;
  dragoncells[0] = null!;

  if (sphere() && G.geometry === gSphere) {
    for (const c of lst) {
      if (GOLDBERG()) {
        const fv = c.master.fiftyval;
        if (fv === 1 || fv === 4 || fv === 10)
          c.wall = waChasm;
        if (c === c.master.c7 && fv === 3)
          c.item = itTreat;
      }
      else if (!BITRUNCATED()) {
        const fv = c.master.fiftyval;
        if (fv === 1 || fv === 4 || fv === 2)
          c.wall = waChasm;
        if (fv === 3) c.item = itTreat;
      }
      else {
        if (c.type === 5) {
          const fv = c.master.fiftyval;
          if (fv === 3 || fv === 4 || fv === 2 || fv === 5)
            c.wall = waChasm;
          if (fv === 2) dragoncells[0] = c;
          if (fv === 5) dragoncells[3] = c;
          if (fv === 1) c.item = itTreat;
        }
        if (c.type === 6) {
          let fvset = 0;
          for (let i = 0; i < 6; i += 2) fvset |= 1 << createMov(c, i).master.fiftyval;
          if (fvset === 35 || fvset === 7) c.wall = waChasm;
          if (fvset === 7) dragoncells[1] = c;
          if (fvset === 35) dragoncells[2] = c;
        }
      }
    }
  }
  else {
    for (let i = 1; i < isize(lst); i += 60) lst[i].item = itTreat;
    for (let i = 2; i < isize(lst); i += 6) lst[i].wall = waChasm;
  }
}

function halloween_farempty(lastresort = false): cell {
  let maxdist = 0;
  const validcells: cell[] = [];
  let firstfar1 = 0;
  const dcal = G.dcal;
  for (let i = 1; i < isize(dcal); i++) {
    let okay =
      dcal[i].item === itNone && dcal[i].monst === moNone && dcal[i].wall === waNone;
    if (lastresort)
      okay = dcal[i].wall !== waChasm && !isMultitile(dcal[i].monst);
    if (okay) {
      if (dcal[i].cpdist > maxdist) {
        firstfar1 = isize(validcells);
        maxdist = dcal[i].cpdist;
      }
      validcells.push(dcal[i]);
    }
  }

  const qvc = isize(validcells);
  if (qvc === firstfar1) return halloween_farempty(true);

  return validcells[firstfar1 + hrand(qvc - firstfar1)];
}

/** int demoncount, swordpower, dragoncount (file-local) */
const halloween_state = { demoncount: 0, swordpower: 0, dragoncount: 0 };

function halloween_reset(): void {
  halloween_state.demoncount = 0;
  halloween_state.swordpower = 0;
  halloween_state.dragoncount = 0;
}

function halloween_nextDemon(): eMonster {
  halloween_state.demoncount++;
  if (halloween_state.demoncount % 9 === 0) return moGreater;
  return moLesser;
}

function halloween_putMonster(m: eMonster): void {
  const c = halloween_farempty();
  changes.ccell(c);
  c.hitpoints = 3;
  c.monst = m;
  playSeenSound(c);
  if (!G.kills[m]) switch (m) {
    case moGhost:
      addMessage(XLAT('Ghosts can move through chasms!'));
      break;
    case moSkeleton:
      addMessage(XLAT('Push Skeletons into the holes!'));
      break;
    case moDraugr:
      addMessage(XLAT("You'll need your magical sword against the Draugar!"));
      break;
    case moLesser:
      addMessage(XLAT("Demons are slow, but you'll need the experience against stronger ones..."));
      break;
    case moGreater:
      addMessage(XLAT('You will need more experience to defeat the Greater Demon!'));
      break;
    case moPyroCultist:
      addMessage(XLAT('Cultists throw fire at you from distance!'));
      break;
    case moFlailer:
      addMessage(XLAT('Defeat Flail Guards by moving away from them.'));
      break;
    case moVampire:
      addMessage(XLAT('Vampire Bats drain your magical powers!'));
      break;
    default: break;
  }
  c.stuntime = 2;
}

export function halloween_getTreat(_where: cell): void {
  if (!G.items[itTreat]) halloween_reset();
  gainItem(itTreat);
  changes.at_commit(halloween_after_treat);
}

export function halloween_after_treat(): void {
  halloween_farempty().item = itTreat;
  const itr = G.items[itTreat];
  G.items[itOrbTime] += 30;
  const hw = halloween_state;
  changes.value_keep(hw, 'dragoncount');
  changes.value_keep(hw, 'demoncount');
  changes.value_keep(hw, 'swordpower');

  let monpower = 19 + itr + hrand(itr);
  let mcount = 0;
  let id = 0;
  /** #define CHANCE(x) (id -= x, id < 0) */
  const CHANCE = (x: number): boolean => { id -= x; return id < 0; };
  const dragoncells = G.halloween_dragoncells;
  while (monpower > 0) {
    id = hrand(10000);

    if (CHANCE(400) && itr >= 5) {
      halloween_putMonster(moGhost);
      monpower -= 30;
      mcount++;
    }
    else if (CHANCE(400)) {
      halloween_putMonster(pick(moWitch, moZombie));
      monpower -= 20;
      mcount++;
    }
    else if (CHANCE(400) && itr >= 5) {
      halloween_putMonster(halloween_nextDemon());
      monpower -= 10;
      mcount++;
    }
    else if (CHANCE(100) && itr >= 12) {
      halloween_putMonster(moVampire);
      monpower -= 10;
      hw.swordpower -= 5;
      if (hw.swordpower < 0) hw.swordpower = 0;
      mcount++;
    }
    else if (CHANCE(400) && hw.swordpower > 0 && !mcount && itr >= 15) {
      halloween_putMonster(moDraugr);
      hw.swordpower -= 3;
      monpower -= 100;
      mcount++;
    }
    else if (CHANCE(400) && itr >= 10 && !mcount && itr >= 10) {
      halloween_putMonster(moSkeleton);
      monpower -= 60;
      mcount++;
    }
    else if (CHANCE(10) && itr >= 15) {
      halloween_putMonster(moWitchFire);
      monpower -= 35;
      mcount++;
    }
    else if (CHANCE(100) && itr >= 5) {
      halloween_putMonster(moFlailer);
      monpower -= 35;
      mcount++;
    }
    else if (CHANCE(100) && itr >= 5) {
      halloween_putMonster(moPyroCultist);
      monpower -= 35;
      mcount++;
    }
    else if (CHANCE(5) && itr >= 20 && G.kills[moSkeleton]) {
      halloween_putMonster(moFatGuard);
      monpower -= 35;
      mcount++;
    }
    else if (CHANCE(5) && itr >= 30 && G.kills[moFlailer]) {
      halloween_putMonster(moHedge);
      monpower -= 35;
      mcount++;
    }
    else if (CHANCE(5) && itr >= 40 && G.kills[moHedge]) {
      halloween_putMonster(moLancer);
      monpower -= 60;
      mcount++;
    }
    else if (CHANCE(1) && itr >= 50 && G.kills[moHedge]) {
      halloween_putMonster(moFireFairy);
      monpower -= 40;
      mcount++;
    }
    else if (CHANCE(5) && itr >= 60) {
      halloween_putMonster(moBomberbird);
      monpower -= 25;
      mcount++;
    }
    else if (CHANCE(5) && itr >= 60) {
      halloween_putMonster(moRatlingAvenger);
      monpower -= 30;
      mcount++;
    }
    else if (CHANCE(5) && itr >= 60) {
      halloween_putMonster(moVineBeast);
      monpower -= 30;
      mcount++;
    }
    else if (CHANCE(5) && itr >= 60) {
      hw.dragoncount++;
    }
    else if (hw.dragoncount && BITRUNCATED() && G.geometry === gSphere && !mcount) {
      let fill = false;
      for (let i = 0; i < 4; i++)
        if (!dragoncells[i] || dragoncells[i].monst)
          fill = true;
      let t = dragoncells[0]; dragoncells[0] = dragoncells[3]; dragoncells[3] = t;
      t = dragoncells[1]; dragoncells[1] = dragoncells[2]; dragoncells[2] = t;
      if (fill) continue;
      for (let i = 0; i < 4; i++) {
        dragoncells[i].monst = i ? moDragonTail : moDragonHead;
        dragoncells[i].mondir = i === 3 ? NODIR : neighborId(dragoncells[i], dragoncells[i + 1]);
        dragoncells[i].hitpoints = 1;
        dragoncells[i].stuntime = 1;
        playSeenSound(dragoncells[i]);
      }
      monpower -= 200;
      mcount++;
      hw.dragoncount--;
    }
  }
  id = hrand(100);
  if (G.items[itTreat] === 1) {
    addMessage(XLAT('Hint: use arrow keys to scroll.'));
  }
  else if (G.items[itTreat] === 2) {
    addMessage(XLAT('Hint: press 1 to change the projection.'));
  }
  else if (G.items[itTreat] === 3) {
    G.items[itOrbShell] += 20;
    addMessage(XLAT('You gain a protective Shell!'));
  }
  else if (G.items[itTreat] === 4) {
    G.items[itOrbShell] += 10;
    addMessage(XLAT('Hint: magical powers from Treats expire after a number of uses.'));
  }
  else if (G.kills[moSkeleton] && CHANCE(10)) {
    addMessage(XLAT("A magical energy sword. Don't waste its power!"));
    G.items[itOrbSword] += 5; // todo facing
    hw.swordpower += 5;
  }
  else if (G.kills[moDraugr] && G.items[itOrbSword] && CHANCE(10)) {
    addMessage(XLAT('Another energy sword!'));
    G.items[itOrbSword2] += 5;
    hw.swordpower += 5;
  }
  else if (G.kills[moFlailer] && CHANCE(10)) {
    G.items[itOrbThorns] += 5;
    addMessage(XLAT('You got Thorns! Stab monsters by moving around them.'));
  }
  else if (G.kills[moGhost] && CHANCE(10)) {
    G.items[itOrbAether] += 5;
    addMessage(XLAT('Aethereal powers let you go through the holes.'));
  }
  else {
    if (G.items[itOrbShell] > ORBBASE)
      addMessage(XLAT('The tasty treat increases your protection.'));
    else
      addMessage(XLAT('You gain your protective Shell back!'));
    G.items[itOrbShell] += 5;
  }
}

/** halloween::start_all(): a menu action (popScreenAll, resetModes, set_geometry(gSphere), the projection) */
export function halloween_start_all(): void { throw new NotPorted('halloween::start_all'); } // STAGE1-STUB (menus, a later stage)

// ---------------------------------------------------------------------------------------------------------------
// namespace dungeon (... also includes the Ivory Tower)

/** use coastvalEdge normally, but celldistAlt in hv_structure */
function dungeon_cvfun(c: cell): number {
  if (ls_hv_structure()) return celldistAltPlus(c);
  return coastvalEdge(c);
}

function dungeon_towerError(c: cell): void {
  // only care in the standard geometry -- weird ones are intentionally left buggy
  if (!weirdhyperbolic() && !sphere() && !quotient() && !ls_hv_structure())
    raiseBuggyGeneration(c, 'ivory tower/dungeon generation error');
}

/** for some reason standard generate_around does not work in hv_structure */
function dungeon_gen_around(c: cell): void {
  if (ls_hv_structure()) {
    for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; setdist(c2, 8, c); }
  }
  else generate_around(c);
}

function dungeon_buildIvoryTower(c: cell): void {
  if (euclid()) {
    if (quotient()) return;
    const co = euc2_coordinates(c);
    let x = co[0];
    const y = co[1];
    const tab6 = [
      '.####...',
      'L...L...',
      '.L..L...',
      'L...L...',
      '........',
      '........',
    ];
    const tab4 = [
      'L####L..',
      'L....L..',
      'L....L..',
      'L....L..',
      '........',
      '........',
    ];
    let y0 = y; if (y > 32768) y0 -= 65536;

    y0 += 5; y0 %= 12; if (y0 < 0) y0 += 12;

    if (y0 >= 6) { y0 -= 6; x += 4; }

    const ch = euc_in(2, 6) ? tab6[y0][(x + idiv(y + 1, 2)) & 7] : tab4[y0][x & 7];

    if (ch === '#')
      c.wall = waPlatform;
    else if (ch === 'L')
      c.wall = waLadder;
  }

  else if (WDIM() === 3) {
    let cnt = 0;
    let below = 0;
    const cl = new manual_celllister();
    try {
      cl.add(c);
      for (let i = 0; i < isize(cl.lst); i++) {
        const c1 = cl.lst[i];
        dungeon_gen_around(c1);
        if (dungeon_cvfun(c1) === dungeon_cvfun(c) - 3) {
          if (c1.landflags === 3) cnt++;
          continue;
        }
        if (c1.landflags === 3) below++;
        for (let j = 0; j < c1.type; j++) { const c2 = c1.move(j); if (!c2) continue; if (dungeon_cvfun(c2) < dungeon_cvfun(c1)) cl.add(c2); }
      }
    }
    finally { cl.destroy(); }
    if (cnt) c.wall = waPlatform;
    else if (below && dungeon_cvfun(c) < 3) c.wall = waPlatform;
  }

  else {

    let c2 = c;
    let c3 = c;

    const rdepths: boolean[] = [false, false, false, false, false];
    for (let i = 0; i < 5; i++) {
      if (dungeon_cvfun(c2) === 0) {
        rdepths[i] = false;
      }
      else {
        let c4 = c2;
        if (c2 !== c3 && !isNeighbor(c2, c3)) {
          for (let k = 0; k < c2.type; k++) if (c2.move(k) && isNeighbor(c2.move(k), c3))
            c4 = c2.move(k);
        }
        rdepths[i] = !!(c2 && c3 && c4 && (c2.landflags === 3 || c3.landflags === 3 || c4.landflags === 3));
        if (c2) dungeon_gen_around(c2);
        if (c3) dungeon_gen_around(c3);

        c2 = ts_left_parent(c2, dungeon_cvfun);
        c3 = ts_right_parent(c3, dungeon_cvfun);
        if (!c2) { dungeon_towerError(c); return; }
        if (!c3) { dungeon_towerError(c); return; }
      }
    }

    if (rdepths[3]) {
      c.wall = waPlatform;
    }
    else if (!rdepths[2] && !rdepths[4] && !rdepths[1]) {
      c2 = c;
      c3 = c;
      dungeon_gen_around(c);
      let c4: cell = ts_left_of(c, dungeon_cvfun);
      let c5: cell = ts_right_of(c, dungeon_cvfun);
      for (let i = 0; i < 3; i++) {
        if (dungeon_cvfun(c2) === 0) break;
        for (const cx of [c2, c3, c4, c5]) if (cx) dungeon_gen_around(cx);

        if (c2 && c4 && c4.landflags === 3 && c2.landflags !== 3 && c4 === ts_left_of(c2, dungeon_cvfun))
          c.wall = waLadder;
        if (c3 && c5 && c5.landflags === 3 && c3.landflags !== 3 && c5 === ts_right_of(c3, dungeon_cvfun))
          c.wall = waLadder;
        if (!ls_hv_structure()) { buildEquidistant(c4); buildEquidistant(c5); }
        if (c2) c2 = ts_left_parent(c2, dungeon_cvfun);
        if (c3) c3 = ts_right_parent(c3, dungeon_cvfun);
        if (c4) c4 = ts_left_parent(c4, dungeon_cvfun);
        if (c5) c5 = ts_right_parent(c5, dungeon_cvfun);
      }
    }
  }
}

function dungeon_dungeonFlags(c: cell): number {
  if (!c) return 0;
  buildEquidistant(c);
  const rdepths: boolean[] = [false, false, false, false, false];
  let switchcount = 0;

  if (WDIM() === 3) {
    for (let i = 0; i < 5; i++) rdepths[i] = false;

    const cl = new manual_celllister();
    try {
      cl.add(c);
      const d = dungeon_cvfun(c);

      for (let i = 0; i < isize(cl.lst); i++) {
        const c1 = cl.lst[i];
        if (ls_hv_structure()) for (let j = 0; j < c1.type; j++) { const c4 = c1.move(j); if (!c4) continue; moreBigStuff(c4); }
        generate_around(c1);
        const d1 = d - dungeon_cvfun(c);
        if (c1.landflags === 3) rdepths[d1] = true;
        if (c1.landflags === 1) switchcount++;
        if (d1 === 4) break;
        for (let j = 0; j < c1.type; j++) { const c2 = c1.move(j); if (!c2) continue; if (dungeon_cvfun(c2) < dungeon_cvfun(c1)) cl.add(c2); }
      }
    }
    finally { cl.destroy(); }
  }

  else {

    let c2 = c;
    let c3 = c;

    for (let i = 0; i < 5; i++) {
      if (dungeon_cvfun(c2) === 0) {
        rdepths[i] = false;
      }
      else {
        let c4 = c2;
        if (c2 !== c3 && !isNeighbor(c2, c3)) {
          for (let k = 0; k < c2.type; k++) if (c2.move(k) && isNeighbor(c2.move(k), c3))
            c4 = c2.move(k);
        }
        rdepths[i] = !!(c2 && c3 && c4 && (c2.landflags === 3 || c3.landflags === 3 || c4.landflags === 3));
        if ((c2 && c2.landflags === 1) || (c3 && c3.landflags === 1) || (c4 && c4.landflags === 1))
          switchcount++;
        if (ls_hv_structure()) {
          for (let k = 0; k < c2.type; k++) { const c5 = c2.move(k); if (!c5) continue; moreBigStuff(c5); }
          for (let k = 0; k < c3.type; k++) { const c5 = c3.move(k); if (!c5) continue; moreBigStuff(c3); }
        }
        generate_around(c2);
        generate_around(c3);
        c2 = ts_left_parent(c2, dungeon_cvfun);
        c3 = ts_right_parent(c3, dungeon_cvfun);
        if (!c2) { dungeon_towerError(c); return 0; }
        if (!c3) { dungeon_towerError(c); return 0; }
      }
    }
  }

  let res = 0;

  if (rdepths[3]) res |= 1;
  if (rdepths[2]) res |= 2;
  if (switchcount & 1) res |= 4;

  return res;
}

function dungeon_placeGate(c: cell, w: eWall): void {
  if (w === waOpenGate) {
    c.wall = waClosedGate;
    toggleGates(c, waOpenPlate, 0);
  }
  if (w === waClosedGate) {
    c.wall = waOpenGate;
    toggleGates(c, waClosePlate, 0);
  }
}

function dungeon_isGate(w: eWall): boolean {
  return w === waOpenGate || w === waClosedGate;
}

function dungeon_placeRandomGate(c: cell): void {
  dungeon_placeGate(c, hrand(2) ? waOpenGate : waClosedGate);
}

function dungeon_random_child(c: cell, cf: cellfunction): cell {
  if (ls_hv_structure()) for (let i = 0; i < c.type; i++) { const c4 = c.move(i); if (!c4) continue; moreBigStuff(c4); }
  generate_around(c);
  const children: cell[] = [];
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (cf(c2) > cf(c)) children.push(c2); }
  if (!isize(children)) return null!;
  return children[hrand(isize(children))];
}

function dungeon_build(c: cell): void {
  if (dungeon_cvfun(c) === 1) for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    if (c2.land !== laBarrier && c2.land !== laDungeon) {
      c.wall = waLadder;
      c.wparam = 3;
    }
  }

  const df = dungeon_dungeonFlags(c);

  if (df & 1) {
    if (ls_hv_structure()) for (let i = 0; i < c.type; i++) { const c4 = c.move(i); if (!c4) continue; moreBigStuff(c4); }
    generate_around(c);
    const df1 = WDIM() === 3 ? 0 : dungeon_dungeonFlags(ts_left_of(c, dungeon_cvfun));
    const df2 = WDIM() === 3 ? 0 : dungeon_dungeonFlags(ts_right_of(c, dungeon_cvfun));

    c.wparam = 0;
    if (hrand(100) < (c.landparam % 5 === 0 ? 80 : 20)) {
      if (!(df1 & 1)) c.wparam = 1;
      if (!(df2 & 1)) c.wparam = 2;
    }

    if (df & 4)
      dungeon_placeRandomGate(c);
    else if (c.wparam === 0 && c.landparam % 5 === 0 && hrand(100) < 10) {
      c.wall = waLadder;
      c.wparam = 3 + hrand(2);
    }
    else
      c.wall = waPlatform;
  }

  if (c.wparam) {
    const c2 =
      WDIM() === 3 ? dungeon_random_child(c, dungeon_cvfun) :
      c.wparam === 1 ? ts_add(c, 1, 2, dungeon_cvfun) :
      c.wparam === 2 ? ts_add(c, -1, -2, dungeon_cvfun) :
      c.wparam === 3 ? ts_add(c, 1, 3, dungeon_cvfun) :
      c.wparam === 4 ? ts_add(c, -1, -3, dungeon_cvfun) :
      null;

    if (c2) {
      c2.wall = c.wall; c2.wparam = c.wparam;
      if (c2.wall === waPlatform && hrand(10) < 2)
        dungeon_placeRandomGate(c2);
      if (dungeon_isGate(c2.wall) && hrand(10) < 2)
        c2.wall = waPlatform;
    }
  }
}

function dungeon_buildPlates(c: cell): void {
  if (c.wall) return;
  let neargate = 0;
  let neargateDown = 0;
  let neargateEq = 0;
  let qup = 0;
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    const d = dungeon_cvfun(c2) - dungeon_cvfun(c);
    if (dungeon_isGate(c2.wall)) {
      neargate++;
      if (d > 0) neargateDown++;
      if (d === 0) neargateEq = 0;
    }
    if (d < 0) qup++;
  }

  if (!neargate) return;

  let hr = 99;

  if (neargate === neargateDown && qup === 1)
    hr = hrand(12);
  else if ((zebra40(c) >= 40) && !(neargateEq && neargateDown))
    hr = hrand(36);
  else if (zebra40(c) >= 40)
    hr = hrand(5000);

  if (hr < 5) c.wall = waClosePlate;
  else if (hr < 10) c.wall = waOpenPlate;
}

function dungeon_is02(i: number): boolean { return i === 0 || i === 2; }

export function dungeon_all(c: cell, d: number): void {
  if (d === 8 && (c.land === laIvoryTower || c.land === laDungeon) && !euclid()) {

    if (hrand(1000) < 75 && (WDIM() === 3 || (c.landparam & 1))) {
      c.landflags = 3;
    }
    else c.landflags = 0;
  }

  if (d === 8 && c.land === laDungeon && !euclid()) {
    if (hrand(1000) < 240 && dungeon_is02(c.landparam % 5)) {
      c.landflags = 3;
    }
    else if (hrand(1000) < 90)
      c.landflags = 1;
    else c.landflags = 0;
  }

  if (d === 7 && c.land === laIvoryTower) dungeon_buildIvoryTower(c);
  if (d === (BARLEV() === 8 ? 7 : 8) && c.land === laDungeon) dungeon_build(c);
  if (d === 7 && c.land === laDungeon) dungeon_buildPlates(c);
}

// ---------------------------------------------------------------------------------------------------------------
// static initializers

/** template<class T, class U> void eliminate_if(vector<T>& data, U pred) (hyper.h) */
function eliminate_if<T>(data: T[], pred: (x: T) => boolean): void {
  for (let i = 0; i < isize(data); i++)
    if (pred(data[i])) {
      data[i] = data[data.length - 1]; data.pop(); i--;
    }
}

/** the static initializers of complex.cpp, in source order: ca's `auto ah = addHook(hooks_args, 0, readArg)`, then
 *  `auto ccm = addHook(hooks_clearmemory, 0, ...) + addHook(hooks_gamedata, 0, ...) + addHook(hooks_removecells, 0, ...)`
 *  (hooks_gamedata only measures memory: left out) */
export function register_complex(): void {
  if (!G.clearing_imputed) G.clearing_imputed = new bignum(); // EX bignum imputed
  while (G.sword_dir.length < MAXPLAYER) G.sword_dir.push(new sworddir()); // EX array<sworddir, MAXPLAYER> dir
  addHook(G.hooks_args, 0, ca_readArg);
  addHook(G.hooks_clearmemory, 0, () => {
    G.heat_offscreen_heat.length = 0;
    G.heat_offscreen_fire.length = 0;
    princess_clear();
    G.mirror_mirrors.length = 0;
    G.clearing_bpdata.clear();
    clearing_stats.clear();
    clearing_score.clear();
    G.tortoise_emap.clear();
    G.kraken_half_killed.clear();
    G.tortoise_babymap.clear();
    G.dragon_target = null!;
    prairie_lasttreasure = null!;
    prairie_enter = null!;
    prairie_tchoices.length = 0;
    G.prairie_beaststogen.length = 0;
    mirror_clearcache();
    G.ca_changed.clear();
  });
  addHook(G.hooks_removecells, 0, () => {
    for (const c of G.removed_cells) clearing_score.delete(c);
    for (const am of G.adj_memo) am.clear();
    for (const c of G.removed_cells) G.kraken_half_killed.delete(c);
    eliminate_if(G.heat_offscreen_heat, is_cell_removed);
    eliminate_if(G.heat_offscreen_fire, is_cell_removed);
    eliminate_if(G.princess_infos, (i) => {
      if (is_cell_removed(i.princess) || is_cell_removed(i.prison)) {
        // DEBB(debug_memory, ("removing a princess"))
        if (i.princess && !is_cell_removed(i.princess)) {
          // DEBB(debug_memory, ("faking a princess"))
          princess_newFakeInfo(i.princess);
        }
        return true;
      }
      return false;
    });
    if (is_cell_removed(G.dragon_target)) G.dragon_target = null!;
    if (is_cell_removed(prairie_lasttreasure)) prairie_lasttreasure = null!;
    if (is_cell_removed(prairie_enter)) prairie_enter = null!;
    eliminate_if(prairie_tchoices, is_cell_removed);
    eliminate_if(G.prairie_beaststogen, is_cell_removed);
    for (const bpd of G.clearing_bpdata.values()) if (is_cell_removed(bpd.root)) bpd.root = null!;
  });
}
