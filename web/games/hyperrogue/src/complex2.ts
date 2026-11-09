// complex2.cpp of HyperRogue 13.1o: continuation of complex.cpp -- Brownian, Western Wall (free fall), Variant features, Camelot knights, Minefield, Terracotta, Hunting Ground ambushes, dice.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names (PORTING.md, "Names"/"Overloads"): namespace::name -> namespace_name. terracotta::check(cell*) and
// terracotta::check() are one function terracotta_check(c?) (overloads differing only in arity).
// dice::can_roll(int sides, int cur, movei mi) is dice_can_roll; dice::can_roll(movei mi) is dice_can_roll_mi.
// Static locals: knightFlavorMessage's msgid is kfm.msgid. File-local maps (brownian::futures,
// camelot::knight_id) are module-level Maps (cell keys; their iteration is order-independent).
// CAP_COMPLEX2 = 1: the #if !CAP_COMPLEX2 stubs at the end of the file are dropped.
// Graphics (brownian::get_color's gradient, dice::draw_die) are a later stage: they throw NotPorted.
// The `hooks_gamedata` hooks (dual mode, multigame.cpp, a later stage) are not registered.
import { G } from './globals.ts';
import { NotPorted, among, isize, gcd, PRIZEMUL } from './hyper.ts';
import { idiv } from './cpp.ts';
import {
  type cell, cellwalker, manual_celllister, celllister, movei, match,
} from './locations.ts';
import {
  type eItem, type eMonster,
  laOcean, laNone, laBrownian, laWestWall, laVariant, laCA, laMinefield, laHunting,
  waSea, waNone, waStrandedBoat, waMineOpen, waFire, waRed1, waRed2, waRed3, waDeadfloor2, waRubble, waBoat,
  waCIsland, waCIsland2, waBigBush, waSmallBush, waFrozenLake, waLake, waReptile, waGargoyleFloor, waChasm,
  waDock, waBurningDock, waFloorA, waFloorB, waCavefloor, waDeadfloor, waMineMine, waMineUnknown, waOpenGate,
  waClosePlate, waOpenPlate, waGargoyleBridge, waReptileBridge, waFreshGrave, waTrapdoor, waThumperOff,
  waFireTrap, waExplosiveBarrel, waSmallTree, waBigTree, waTerraWarrior, waRichDie, waHappyDie,
  moAcidBird, moBrownBug, moAlbatross, moAirElemental, moWindCrow, moNecromancer, moLancer, moMonk, moCrusher,
  moSkeleton, moPyroCultist, moFlailer, moHedge, moNone, moRagingBull, moSleepBull, moVariantWarrior, moRatling,
  moBomberbird, moTameBomberbird, moPlayer, moTerraWarrior, moHunterDog, moHunterGuard, moAnimatedDie,
  itBrownian, itWest, itVarTreasure, itSpice, itPirate, itWhirlpool, itOrbAether, itBombEgg, itOrbTeleport,
  itHunting, itCompass, itOrbSide3, itOrbFreedom, itOrbImpact, itOrbPlague, itOrbThorns, itOrb37, itOrbChaos,
  itOrbLava, itOrbBeauty, itOrbShell, itOrbPsi, itOrbDash, itOrbFrog, itOrbAir, itOrbDragon, itOrbStunning,
  itOrbBull, itOrbSpeed, itOrbShield, itOrbInvis, itGreenStone, itOrbSafety, itOrbYendor, itKey, itWarning,
  itOrbLuck, itNone,
} from './content.ts';
import { eubinary, euclid, hyperbolic, sphere, quotient, closed_or_bounded, cryst } from './classes.ts';
import { celldist, celldistance, createMov, getDistLimit, valence, isNeighbor, adj_minefield_cells, BARLEV } from './cell.ts';
import { get_expansion, sizes_known, ts_left_parent, ts_left_of, ts_right_of } from './expansion.ts';
import { hrand, hrand_elt, hrandom_shuffle, rand } from './rand.ts';
import { gmod, bignum_inc, bignum_dec } from './util.ts';
import { its } from './hprint.ts';
import { XLAT, spM } from './language.ts';
import { addMessage } from './basegraph.ts';
import { pseudohept } from './pattern2.ts';
import {
  cellUnstable, cellHalfvine, isFire, isFriendly, slowMover, isMultitile, isDie, isDie_w,
} from './flags.ts';
import { in_full_game, ls_single, ls_hv_structure } from './landlock.ts';
import { setdist, hrand_monster_in, rebalance_treasure, createArrowTrapAt, build_pool } from './landgen.ts';
import { buildIvy } from './monstergen.ts';
import { passable } from './passable.ts';
import { placeLocalOrbs } from './orbgen.ts';
import { moveItem, pickupMovedItems } from './items.ts';
import { animateMovement, LAYER_BOAT, drawFlash } from './animations.ts';
import { yendor_hardness } from './yendor.ts';
import { changes, player_positions, isPlayerOn, chaos_mirror_dir, swap_data } from './pcmove.ts';
import { getgametime, showMissionScreen } from './quit.ts';
import { ca_list_adj } from './complex.ts';
import { markOrb } from './orbs.ts';
import { coastvalEdge, destroyTrapsAround, destroyHalfvine, mayExplodeMine, gsAnti, gsLevitation } from './mapeffects.ts';
import { normal_gravity_at } from './game.ts';
import { looped, gamerange, HF_HUNTER, HF_FAILED_AMBUSH } from './environment.ts';
import { is_cell_removed } from './savemem.ts';
import { buildEquidistant, no_barriers_in_radius, celldistAltRelative, roundTableRadius, newRoundTableRadius, grailWasFound } from './bigstuff.ts';
import { NOBARRIERS, NODIR } from './locations.ts';

const notp = (what: string): never => { throw new NotPorted(what); };

// #if CAP_COMPLEX2
// namespace brownian

/** const int level = 5 */
export const brownian_level = 5;

const futures = new Map<cell, [cell, number][]>();
let centersteps = 0;
let totalsteps = 0;

function brownian_rise(c: cell, val: number): void {
  if (c.wall === waSea) c.wall = waNone;
  if (c.land === laOcean || c.land === laNone) {
    c.land = laBrownian;
    c.landparam = 0;
  }
  c.bardir = NOBARRIERS;
  for (let i = 0; i < c.type; i++) {
    const c1 = createMov(c, i);
    c1.bardir = NOBARRIERS;
    if (c1.mpdist > BARLEV()) {
      setdist(c1, BARLEV(), c);
    }
    if (c1.land === laOcean) {
      c1.land = laBrownian;
      c1.landparam = 0;
      c1.wall = waSea;
    }
  }
  c.landparam += val;
}

const FAT = (-100); // less than 0

function brownian_recurse(c: cell, fatten_from: number): void {
  const dl = getDistLimit();
  while (true) {
    const cd = celldist(c);
    const fat = cd > fatten_from;
    totalsteps++;
    if (cd >= dl * (fat ? 4 : 3) + celldist(G.cwt.at)) {
      let c1 = c;
      while (true) {
        const c2 = ts_left_parent(c1, celldist);
        if (!c2 || c2.mpdist < BARLEV()) break;
        setdist(c2, BARLEV(), c1);
        c1 = c2;
      }
      // futures[c1].emplace_back(c, fatten_from)
      if (!futures.has(c1)) futures.set(c1, []);
      futures.get(c1)!.push([c, fatten_from]);
      return;
    }
    if (c.mpdist <= 7 || !among(c.land, laNone, laOcean, laBrownian) || (c.land !== laBrownian && c.bardir !== NODIR)) {
      centersteps++; return;
    }
    const c2 = c.cmove(hrand(c.type));
    const cd2 = celldist(c2);
    // while(hrand(1000) < 1000 * chance) recurse(c);
    if (!fat && (cd2 > fatten_from || hrand(100000) === 0)) {
      brownian_recurse(c, FAT);
      fatten_from = FAT;
    }
    else if (fat) brownian_recurse(c, cd + dl * 6);
    brownian_rise(c, fat ? 256 : 1);
    c = c2;
  }
}

export function brownian_dissolve_brownian(c: cell, x: number): void {
  if (c.land === laBrownian) {
    if (among(c.wall, waNone, waStrandedBoat, waMineOpen, waFire)) {
      if (c.landparam >= 4 * brownian_level) c.landparam = 4 * brownian_level - 1;
      c.landparam -= brownian_level * x;
      c.wall = waNone;
      if (c.landparam < 0) { c.wall = waSea; c.landparam = 0; }
      if (c.landparam === 0) c.landparam = 1;
    }
  }
}

export function brownian_dissolve(c: cell, x: number): void {
  destroyTrapsAround(c);
  if (c.land === laBrownian)
    brownian_dissolve_brownian(c, x);
  else if (c.wall === waRed2) c.wall = waRed1;
  else if (c.wall === waRed3) c.wall = waRed2;
  else if (among(c.wall, waRed1, waDeadfloor2, waRubble, waBoat, waFire, waCIsland, waCIsland2, waBigBush, waSmallBush)) c.wall = waNone;
  else if (c.wall === waStrandedBoat) c.wall = waNone;
  else if (c.wall === waFrozenLake) c.wall = waLake;
  else if (among(c.wall, waReptile, waGargoyleFloor) || cellUnstable(c)) c.wall = waChasm;
  else if (among(c.wall, waNone, waDock, waBurningDock, waFloorA, waFloorB, waCavefloor, waDeadfloor, waMineMine, waMineUnknown, waMineOpen, waOpenGate, waClosePlate, waOpenPlate, waGargoyleBridge, waReptileBridge))
    c.wall = waSea;
  else if (cellHalfvine(c)) destroyHalfvine(c, waNone, 4);
}

export function brownian_init(c: cell): void {
  if (!hyperbolic()) return;
  brownian_recurse(c, FAT);
  brownian_recurse(c, FAT);
}

export function brownian_init_further(c: cell): void {
  if (!hyperbolic()) return;
  const dl = getDistLimit();
  const be = G.generatingEquidistant; G.generatingEquidistant = true; // dynamicval<bool> be(generatingEquidistant, true)
  try {
    let gdir = -1;
    for (let i = 0; i < c.type; i++) {
      if (c.move(i) && c.move(i).mpdist < c.mpdist) gdir = i;
    }
    if (gdir < 0) return;

    const cw = new cellwalker(c, gdir);
    for (let i = 0; i < 4; i++) {
      cw.addRevStep();
      setdist(cw.at, BARLEV(), cw.peek());
      buildEquidistant(cw.at);
      // println(hlog, "from ", cw.peek(), " to ", cw.at, ", land = ", dnameof(cw.at->land), " lp = ", cw.at->landparam);
    }

    if (c.land !== laOcean || !no_barriers_in_radius(cw.at, 2)) return;

    // println(hlog, "brownian::init ", cw.at, " in distance ", celldistance(cw.at, cwt.at));
    void celldistance;

    brownian_recurse(cw.at, celldist(c) + dl * 3);
    brownian_recurse(cw.at, celldist(c) + dl * 3);

    let c2 = c;
    while (c2.mpdist > 7) {
      let found = false;
      for (let i = 0; i < c2.type; i++) {
        const c3 = c2.move(i); if (!c3) continue;
        if (c3.mpdist < c2.mpdist) { c2 = c3; found = true; break; }
      }
      if (found) continue; // goto next
      break;
    }
    if (!c2.monst && c2.wall !== waBoat) c2.monst = moAcidBird;
  } finally {
    G.generatingEquidistant = be;
  }
}

export function brownian_apply_futures(c: cell): void {
  if (futures.has(c)) {
    const m = futures.get(c)!; // std::move(futures[c])
    futures.delete(c);
    for (const p of m)
      brownian_recurse(p[0], p[1]);
    futures.delete(c);
    // printf("centersteps = %d futures = %d totalsteps = %d\n", centersteps, isize(futures), totalsteps);
  }
}

/** #define ONEMPTY if(d == 7 && passable(c, NULL, 0) && !safety && !reptilecheat) */
function ONEMPTY(c: cell, d: number): boolean {
  return d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat;
}

export function brownian_build(c: cell, d: number): void {

  if (!hyperbolic()) { c.wall = waNone; c.landparam = 256; }

  if (c.landparam === 0 && (ls_single() || ls_hv_structure())) c.land = laOcean;

  if (ONEMPTY(c, d)) {
    if (hrand(10000) < idiv(Math.min(250, 100 + 2 * rebalance_treasure(G.kills[moAcidBird] + G.kills[moBrownBug], 50, c.land)) * (25 + Math.min(G.items[itBrownian], 100)), 25) && c.landparam >= 4 && c.landparam < 24)
      c.item = itBrownian;
    if (hrand_monster_in(laBrownian, 8000) < 15 + G.items[itBrownian])
      c.monst = moAcidBird;
    else if (hrand_monster_in(laBrownian, 8000) < 15)
      c.monst = moAlbatross;
    else if (hrand_monster_in(laBrownian, 8000) < 15 + G.items[itBrownian]) {
      c.monst = moBrownBug;
      c.hitpoints = 3;
    }
  }
}

// EX colortable colors = { 0x603000, 0x804000, 0xA05000, 0xC09050, 0xE0D0A0 }: G.brownian_colors

export function brownian_get_color(_y: number): number {
  return notp('brownian::get_color (colors.cpp gradient: graphics)');
}

/** color_t& get_color_edit(int y): the index into G.brownian_colors */
export function brownian_get_color_edit(y: number): number {
  return (
    y < (brownian_level >> 1) ? 0 :
    y < brownian_level ? 1 :
    y < 2 * brownian_level ? 2 :
    y < 3 * brownian_level ? 3 :
    4);
}

// int hrc = addHook(hooks_removecells, 0, ...) + addHook(hooks_clearmemory, 0, ...) + addHook(hooks_gamedata, ...):
// register_complex2()

// namespace westwall

export function westwall_switchTreasure(c: cell): void {
  c.item = itNone;
  if (G.safety) return;
  if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moAirElemental] + G.kills[moWindCrow]), 200, c.land) && c.landparam >= 5 + G.items[itWest])
    c.item = itWest;
  else if (hrand(5000) < 20 * PRIZEMUL)
    placeLocalOrbs(c);
}


export function westwall_coastvalEdge1(c: cell): number {
  if (c.land === laWestWall && !c.landparam) buildEquidistant(c);
  return coastvalEdge(c);
}

function westwall_build(whirlline: cell[], d: number): void {
  again: while (true) {
    const at = whirlline[isize(whirlline) - 1];
    const prev = isize(whirlline) >= 2 ? whirlline[isize(whirlline) - 2] : null;
    if (looped(whirlline)) return;
    for (let i = 0; i < at.type; i++)
      if (at.move(i) && westwall_coastvalEdge1(at.move(i)) === d && at.move(i) !== prev) {
        whirlline.push(at.move(i));
        continue again;
      }
    return;
  }
}

function westwall_moveAt(c: cell, cl: manual_celllister): void {
  if (cl.listed(c)) return;
  if (c.land !== laWestWall) return;
  const whirlline: cell[] = [];
  const d = coastvalEdge(c);
  whirlline.push(c);
  whirlline.push(G.gravity_state === gsAnti ? ts_right_of(c, westwall_coastvalEdge1) : ts_left_of(c, westwall_coastvalEdge1));
  westwall_build(whirlline, d);
  whirlline.reverse();
  westwall_build(whirlline, d);
  const z = isize(whirlline);
  for (let i = 0; i < z; i++) {
    cl.add(whirlline[i]);
    if (whirlline[i].mpdist === BARLEV())
      westwall_switchTreasure(whirlline[i]);
  }
  for (let i = 0; i < z - 1; i++) {
    moveItem(whirlline[i], whirlline[i + 1], true);
    if (whirlline[i].item)
      animateMovement(match(whirlline[i + 1], whirlline[i]), LAYER_BOAT);
  }
  for (let i = 0; i < z; i++)
    pickupMovedItems(whirlline[i], i < z - 1 ? whirlline[i + 1] : whirlline[0]);
}

export function westwall_move(): void {
  const cl = new manual_celllister();
  try {
    if (G.gravity_state === gsLevitation) return;
    for (const c of G.dcal) westwall_moveAt(c, cl);
    // Keys and Orbs of Yendor always move
    const yi = G.yendor_yi;
    for (let i = 0; i < isize(yi); i++) {
      westwall_moveAt(yi[i].path[0], cl);
      // println(hlog, "coastval of actual key is ", ...);
      westwall_moveAt(yi[i].actual_key(), cl);
      if (yi[i].actualKey) {
        if (G.gravity_state === gsAnti) bignum_dec(yi[i].age);
        else bignum_inc(yi[i].age);
        setdist(yi[i].actual_key(), 8, null!);
      }
    }
  } finally { cl.destroy(); }
}

// namespace variant

/** struct feature */
export class feature {
  color_change: number;
  rate_change: number;
  wanderer: eMonster;
  build: (c: cell) => void;
  constructor(color_change: number, rate_change: number, wanderer: eMonster, build: (c: cell) => void) {
    this.color_change = color_change >>> 0; this.rate_change = rate_change; this.wanderer = wanderer; this.build = build;
  }
}

function hrand_var(i: number): boolean { return hrand_monster_in(laVariant, i) < 25 + G.items[itVarTreasure] + yendor_hardness(); }

/** array<feature, 21> features: G.variant_features (assigned in register_complex2) */
const variant_features_table: feature[] = [
  new feature(-0x202020, 5, moNecromancer, (c) => {
    if (c.wall === waNone && hrand(1500) < 20) c.wall = waFreshGrave;
    if (hrand(20000) < 10 + G.items[itVarTreasure])
      c.monst = moNecromancer;
  }),
  new feature(0x000010, 5, moLancer, (c) => { if (c.wall === waNone && !c.monst && hrand_var(80000)) c.monst = moLancer; }),
  new feature(0x100008, 15, moMonk, (c) => { if (c.wall === waNone && !c.monst && hrand_var(80000)) c.monst = moMonk; }),
  new feature(0x080010, 5, moCrusher, (c) => { if (c.wall === waNone && !c.monst && hrand_var(80000)) c.monst = moCrusher; }),
  new feature(0x181418, 5, moSkeleton, (c) => { if (c.wall === waNone && !c.monst && hrand_var(80000)) { c.monst = moSkeleton; c.hitpoints = 3; } }),
  new feature(0x180000, 5, moPyroCultist, (c) => { if (c.wall === waNone && !c.monst && hrand_var(80000)) c.monst = moPyroCultist; }),
  new feature(0x00000C, 2, moFlailer, (c) => { if (c.wall === waNone && !c.monst && hrand_var(80000)) c.monst = moFlailer; }),
  new feature(0x1C0700, 1, moHedge, (c) => { if (c.wall === waNone && !c.monst && hrand_var(80000) && valence() === 3) c.monst = moHedge; }),
  new feature(0x000c00, -1, moNone, (c) => { if (hrand(1500) < 30) createArrowTrapAt(c, laVariant); }),
  new feature(0x001200, -1, moNone, (c) => { if (hrand(1500) < 50 && c.wall === waNone) c.wall = waTrapdoor; }),
  new feature(0x000c18, -1, moNone, (c) => { if (hrand(1500) < 30) build_pool(c, true); }),
  new feature(0x040A00, -1, moNone, (c) => { if (c.wall === waNone && !c.monst && !c.monst && hrand(1500) < 10) c.wall = waThumperOff; }),
  new feature(0x080A00, -1, moNone, (c) => { if (hrand(1500) < 20 && !c.monst && !c.wall) c.wall = waFireTrap; }),
  new feature(0x0C0A00, 0, moNone, (c) => {
    const inyendor = G.yendor_on && G.specialland === laVariant && celldist(c) < 7;
    const chance = inyendor ? 800 : 100;
    if (c.wall === waNone && !c.monst && hrand(5000) < chance) c.wall = waExplosiveBarrel;
  }),
  new feature(0x060D04, 0, moNone, (c) => {
    if (c.wall === waNone && !c.monst && pseudohept(c) && hrand(30000) < 25 + G.items[itVarTreasure])
      if (buildIvy(c, 0, c.type) && !G.peace_on) c.item = itVarTreasure;
  }),
  new feature(0x000A08, 0, moNone, (c) => { if (c.wall === waNone && !c.monst && hrand(5000) < 100) c.wall = waSmallTree; }),
  new feature(0x100A10, 1, moRagingBull, (c) => { if (c.wall === waNone && !c.monst && hrand(10000) < 10 + G.items[itVarTreasure]) { c.monst = moSleepBull; c.hitpoints = 3; } }),
  new feature(0x00110C, 0, moNone, (c) => { if (c.wall === waNone && !c.monst && hrand(5000) < 100) c.wall = waBigTree; }),
  new feature(0x000A28, 1, moNone, (c) => { if (hrand(500) < 10) build_pool(c, false); }),
  new feature(0x100A00, 2, moVariantWarrior, (c) => { if (c.wall === waNone && !c.monst && hrand_var(40000)) c.monst = moVariantWarrior; }),
  new feature(0x100708, 1, moRatling, (c) => { if (c.wall === waNone && !c.monst && hrand_var(50000)) c.monst = moRatling; }),
];

// namespace camelot

/** number of Grails collected, to show you as a knight: G.camelot_knighted */
/** this value is used when using Orb of Safety in the Camelot in Pure Tactics Mode: G.camelot_anthraxBonus */

const knight_names: string[] = [
  'DivisionByZero', 'Phoenyx', 'tricosahedron', 'BillSYZ0317', 'rjdimo', 'Person', 'Strange Yeah', 'paradoxica', 'godamnsteemsux', 'Allalinor', 'Spuddnik',
  'QETC Crimson', 'aca', 'cannobeens', 'Dylgear', 'Patashu', 'SirLight_XXVII', 'Lord Ignus', 'Lotho', 'hotdogPi', 'vincent', 'pofoss', 'Zekava', 'Chimera245',
  'BreedPineapple', 'TaeK', 'Aliased', 'Vipul', 'jkvw3', 'english5040', 'gregwar69', 'marvincast', 'Panacea108', 'FEDPOL1', 'Jenkar', 'inakilbss', '*****-mail',
  'Wheat Wizard', 'xiqnyl', 'zelda0x181e', 'ad-jones', 'mtomato', 'Fififionek', 'J Pystynen', 'krstefan11', 'green orange', 'ZombieGirl1616', 'z.chlebicki',
  '9427', 'Lokki', 'gabbalis', 'The Horrendous Space Kablooie', 'zeno', 'ETsc2', 'Fulgur14', 'Roger', 'uqblf', 'Grep', 'Abigail', 'Cyberfox VII', 'ballom', 'CtrlAltDestroy',
  'RushSecond', 'ozir', 'Vee Nought', 'archmageomega', 'Wroclaw', 'lunaduskjr', 'LucLucLuc', 'loper', 'RedsToad', 'Sharklilly', 'Dasypus Daimon', 'Mateusz', 'joshua', 'guysige',
  'MrSprucetree', 'Atia', 'nerdyjoe', 'florrat', 'bderoo121', 'Sprite Guard', 'fischpferd', 'Fluffiest Princess', 'no stop', 'Kieroshark', 'elgan65536', 'T-Jski',
  'martinus de monte', 'Inthar', 'mj.titze', 'thelast19digitsofpi', 'abacussssss', 'ann_dec', 'juhdanad', 'lllllllllwith10ls', 'rsstein', 'The Emerald Derp Leader',
  'NattieGilgamesh', 'chocokels', 'oren', 'y', 'Nathanbananas', 'juliuskwan', 'wojtekor9', 'CoderBro', 'RidiculousPyro64', 'pringle', 'Spicy', 'Cheetahs', 'ShiningKatana',
  'xy2', 'starchewer', '2jjy', 'Nibaw', 'Goon in Chief', 'the.goosh222', 'Toras', 'ooshoo', 'TravelDemon', 'The Big Extent', 'droplet739', 'AlliterativeAnchovies',
  'fones4jenke13', 'ekisacik', 'j0eymcgrath', 'EatChangmyeong', 'Strichcoder', 'jwhirpl', 'craus', 'akei_arkay', 'lilypad', 'Ichigo Jam', 'supernewton', 'Neapolitan Sixth',
  'Nemo', 'Westville', 'Huja', 'lapinozz', 'Just A Witch', 'Borador', 'Particles', 'dewhi100', 'nat.mayer', 'ddtizm', 'Tism Jones', 'amagikuser', 'vkozulya', 'gassa',
  'Factitious', 'wonderfullizardofoz', 'woofmao', 'CandorVelexion', 'Toricon', 'Vectis99', 'RobotNerd277', 'jerrypoons', 'MagmaMcFry', 'unczane', 'glass', 'Wegener',
  'JeLomun', 'kip', 'Warmonger', 'Fooruman', 'Zyalin', 'Prezombie', 'ashley89', 'bjobae', 'MFErtre', 'Roaringdragon2', 'howilovepi', 'Yulgash', 'Sir Endipitous', 'Roshlev',
  'BTernaryTau', 'HiGuy', 'coper', 'Tirear', 'qoala _', 'Tyzone', 'Tiegon', 'Airin', 'Metroid26', 'Sklorg', 'Fumblestealth', 'Toph', 'Tzaphqiel', 'jruderman', 'ray',
  'Deathroll', 'Sinquetica', 'mootmoot', 'Noobinator', 'freeofme', 'Helyea', 'Snakebird Priestess', 'brisingre', 'Khashishi', 'Shiny', 'kabado', 'Berenthas', 'Misery', 'Altripp', 'Aldrenean',
  // via itch.io and reports on Discord
  'AntiRogue',
];

const knight_id = new Map<cell, number>();

export function camelot_knight_name(c: cell): string {
  if (!knight_id.has(c)) knight_id.set(c, rand() % isize(knight_names));
  return knight_names[knight_id.get(c)!];
}

export function camelot_move_knight(c1: cell, c2: cell): void {
  if (changes.on) { changes.at_commit(() => camelot_move_knight(c1, c2)); return; } // LATE
  if (knight_id.has(c1)) {
    knight_id.set(c2, knight_id.get(c1)!);
    knight_id.delete(c1);
  }
}

export function camelot_roundTableMessage(c2: cell): void {
  if (!euclid() && !G.cwt.at.master.alt) return;
  if (!euclid() && !c2.master.alt) return;
  const dd = celldistAltRelative(c2) - celldistAltRelative(G.cwt.at);

  const tooeasy = (roundTableRadius(c2) < newRoundTableRadius());

  if (dd > 0) {
    if (grailWasFound(G.cwt.at)) {
      addMessage(XLAT('The Knights congratulate you on your success!'));
      G.camelot_knighted = roundTableRadius(G.cwt.at);
    }
    else if (!tooeasy)
      addMessage(XLAT('The Knights laugh at your failure!'));
  }
  else {
    if (grailWasFound(G.cwt.at))
      addMessage(XLAT('The Knights stare at you!'));
    else if (tooeasy) {
      if (!G.tactic_on)
        addMessage(XLAT('Come on, this is too easy... find a bigger castle!'));
    }
    else
      addMessage(XLAT('The Knights wish you luck!'));
  }
}

/** static int msgid of knightFlavorMessage */
const kfm = { msgid: 0 };

export function camelot_knightFlavorMessage(c2: cell): void {

  if (!eubinary() && !c2.master.alt) {
    addMessage(XLAT('"I am lost..."'));
    return;
  }

  if (G.tactic_on) {
    addMessage(XLAT('"The Knights of the Horocyclic Table salute you!"'));
    return;
  }

  const grailfound = grailWasFound(c2);
  const rad = roundTableRadius(c2);
  const tooeasy = (rad < newRoundTableRadius());

  changes.value_keep(kfm, 'msgid');

  while (true) { // retry:
    if (kfm.msgid >= 32) kfm.msgid = 0;

    if (kfm.msgid === 0 && grailfound) {
      addMessage(XLAT('"I would like to congratulate you again!"'));
    }
    else if (kfm.msgid === 1 && !tooeasy) {
      addMessage(XLAT('"Find the Holy Grail to become one of us!"'));
    }
    else if (kfm.msgid === 2 && !tooeasy) {
      addMessage(XLAT('"The Holy Grail is in the center of the Round Table."'));
    }
    // #if CAP_CRYSTAL
    else if (kfm.msgid === 3 && cryst()) {
      notp('knightFlavorMessage: crystal::pure');
    }
    else if (kfm.msgid === 3 && !G.peace_on && in_full_game()) {
      addMessage(XLAT('"I enjoy watching the hyperbug battles."'));
    }
    else if (kfm.msgid === 4 && in_full_game()) {
      addMessage(XLAT('"Have you visited a temple in R\'Lyeh?"'));
    }
    else if (kfm.msgid === 5 && in_full_game()) {
      addMessage(XLAT('"Nice castle, eh?"'));
    }
    else if (kfm.msgid === 6 && G.items[itSpice] < 10 && !G.peace_on && in_full_game()) {
      addMessage(XLAT('"The Red Rock Valley is dangerous, but beautiful."'));
    }
    else if (kfm.msgid === 7 && G.items[itSpice] < 10 && !G.peace_on && in_full_game()) {
      addMessage(XLAT('"Train in the Desert first!"'));
    }
    else if (kfm.msgid === 8 && sizes_known() && !G.tactic_on) {
      let s = '';
      if (0) { }
      // #if CAP_CRYSTAL
      else if (cryst())
        s = notp('crystal::get_table_boundary');
      else if (!quotient() && rad)
        s = get_expansion().get_descendants(rad).get_str(100);
      if (s === '') { kfm.msgid++; continue; }
      addMessage(XLAT('"Our Table seats %1 Knights!"', s));
    }
    else if (kfm.msgid === 9 && sizes_known() && !G.tactic_on) {
      let s = '';
      if (0) { }
      // #if CAP_CRYSTAL
      else if (cryst())
        s = notp('crystal::get_table_volume');
      else if (!quotient() && rad)
        s = get_expansion().get_descendants(rad - 1, get_expansion().diskid).get_str(100);
      if (s === '') { kfm.msgid++; continue; }
      addMessage(XLAT('"There are %1 floor tiles inside our Table!"', s));
    }
    else if (kfm.msgid === 10 && !G.items[itPirate] && !G.items[itWhirlpool] && !G.peace_on && in_full_game()) {
      addMessage(XLAT('"Have you tried to take a boat and go into the Ocean? Try it!"'));
    }
    else if (kfm.msgid === 11 && !G.princess_saved && in_full_game()) {
      addMessage(XLAT('"When I visited the Palace, a mouse wanted me to go somewhere."'));
    }
    else if (kfm.msgid === 12 && !G.princess_saved && in_full_game()) {
      addMessage(XLAT('"I wonder what was there..."'));
    }
    else if (kfm.msgid === 13 && !G.peace_on && in_full_game()) {
      addMessage(XLAT('"Be careful in the Rose Garden! It is beautiful, but very dangerous!"'));
    }
    else if (kfm.msgid === 14) {
      addMessage(XLAT('"There is no royal road to geometry."'));
    }
    else if (kfm.msgid === 15) {
      addMessage(XLAT('"There is no branch of mathematics, however abstract, '));
      addMessage(XLAT('which may not some day be applied to phenomena of the real world."'));
    }
    else if (kfm.msgid === 16) {
      addMessage(XLAT('"It is not possession but the act of getting there, '));
      addMessage(XLAT('which grants the greatest enjoyment."'));
    }
    else if (kfm.msgid === 17) {
      addMessage(XLAT('"We live in a beautiful and orderly world, '));
      addMessage(XLAT('and not in a chaos without norms."'));
    }
    else if (kfm.msgid === 25) {
      addMessage(XLAT('"Thank you very much for talking, and have a great rest of your day!"'));
    }
    else {
      kfm.msgid++; continue;
    }
    break;
  }

  kfm.msgid++;
}

// namespace mine

// EX int victory_time: G.mine_victory_time

export function mine_count_status(): void {
  const last = G.kills[moBomberbird] !== 0;
  G.kills[moBomberbird] = 0;
  G.kills[moTameBomberbird] = 0;
  for (const c of G.currentmap.allcells()) if (c.wall === waMineUnknown) G.kills[moBomberbird]++;
  for (const c of G.currentmap.allcells()) if (among(c.wall, waMineMine, waMineUnknown) && mine_marked_mine(c)) G.kills[moTameBomberbird]++;
  if (last && !G.kills[moBomberbird]) {
    G.mine_victory_time = getgametime();
    showMissionScreen(true);
  }
}

export function mine_in_minesweeper(): boolean {
  return closed_or_bounded() && G.specialland === laMinefield;
}

export function mine_uncoverMines(c: cell, lev: number, dist: number, just_checking: boolean): boolean {
  let b = false;
  if (c.wall === waMineMine && just_checking) return true;
  if (c.wall === waMineUnknown) {
    if (just_checking)
      return true;
    else {
      changes.ccell(c);
      c.wall = waMineOpen;
      b = true;
    }
  }

  let minesNearby = false;
  let nominesNearby = false;
  let mineopens = false;

  const adj = adj_minefield_cells(c);

  for (const c2 of adj) {
    if (c2.wall === waMineMine) minesNearby = true;
    if (c2.wall === waMineOpen) mineopens = true;
    if (c2.wall === waMineUnknown && !c2.item) nominesNearby = true;
  }

  if (lev && (nominesNearby || mineopens) && !minesNearby) for (const c2 of adj)
    if (c2.wall === waMineUnknown || c2.wall === waMineOpen) {
      b = mine_uncoverMines(c2, lev - 1, dist + 1, just_checking) || b; // b |= ...
      if (b && just_checking) return true;
    }

  if (minesNearby && !nominesNearby && dist === 0) {
    for (const c2 of adj)
      if (c2.wall === waMineMine && c2.land === laMinefield) {
        changes.ccell(c2);
        c2.landparam |= 1;
      }
  }

  return b;
}

export function mine_mightBeMine(c: cell): boolean {
  return c.wall === waMineUnknown || c.wall === waMineMine;
}

// EX hookset<bool(cell*)> hooks_mark: G.mine_hooks_mark; EX bool mark_always = true: G.mine_mark_always

export function mine_performMarkCommand(c: cell): void {
  if (!c) return;
  if (G.mine_hooks_mark.callhandlers(false, c)) return;
  if (c.land === laCA && c.wall === waNone) {
    c.wall = G.ca_wlive;
    ca_list_adj(c);
  }
  else if (c.land === laCA && c.wall === G.ca_wlive) {
    c.wall = waNone;
    ca_list_adj(c);
  }
  if (c.land !== laMinefield) return;
  if (c.item) return;
  if (!mine_mightBeMine(c)) return;
  let adj = false;
  if (G.mine_mark_always) adj = true;
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.wall === waMineOpen) adj = true; }
  if (adj) c.landparam ^= 1;
}

export function mine_marked_mine(c: cell): boolean {
  if (!mine_mightBeMine(c)) return false;
  if (c.item) return false;
  if (c.land !== laMinefield) return true;
  return (c.landparam & 1) !== 0;
}

export function mine_marked_safe(c: cell): boolean {
  if (!mine_mightBeMine(c)) return false;
  if (c.item) return true;
  if (c.land !== laMinefield) return false;
  return (c.landparam & 2) !== 0;
}

export function mine_safe(): boolean {
  return G.items[itOrbAether] !== 0;
}

export function mine_uncover_full(c2: cell): void {
  const mineradius =
    closed_or_bounded() ? 3 :
    (G.items[itBombEgg] < 1 && !G.tactic_on) ? 0 :
    G.items[itBombEgg] < 20 ? 1 :
    G.items[itBombEgg] < 30 ? 2 :
    3;

  let nomine = !normal_gravity_at(c2);
  if (!nomine && mine_uncoverMines(c2, mineradius, 0, true) && markOrb(itOrbAether))
    nomine = true;

  if (!nomine) {
    mine_uncoverMines(c2, mineradius, 0, false);
    mayExplodeMine(c2, moPlayer);
  }
}

export function mine_auto_teleport_charges(): void {
  if (mine_in_minesweeper()) {
    mine_count_status();
    G.items[itOrbTeleport] = isFire(G.cwt.at.wall) ? 0 : 1;
  }
}

// namespace terracotta

/** predictable or not: static constexpr bool randterra = false */
export const terracotta_randterra = false;

/** terracotta::check(cell *c) and terracotta::check() (c undefined) */
export function terracotta_check(c?: cell): void {
  if (c === undefined) {
    for (const pc of player_positions())
      for (let i = 0; i < pc.type; i++) {
        const c = pc.move(i); if (!c) continue;
        if (G.shmup_on) {
          for (let j = 0; j < c.type; j++) { const c2 = c.move(j); if (!c2) continue; terracotta_check(c2); }
        }
        else
          terracotta_check(c);
      }
    return;
  }
  if (c.wall === waTerraWarrior && !c.monst && !G.racing_on) {
    changes.ccell(c);
    let live = false;
    if (terracotta_randterra) {
      c.wparam++;
      if ((c.wparam === 3 && hrand(3) === 0) ||
        (c.wparam === 4 && hrand(2) === 0) ||
        c.wparam === 5)
        live = true;
    }
    else {
      c.wparam--;
      live = !c.wparam;
    }
    if (live) {
      c.monst = moTerraWarrior;
      c.hitpoints = 7;
      c.wall = waNone;
    }
  }
}

export function terracotta_check_around(c: cell): void {
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; terracotta_check(c2); }
}

// namespace ambush

export function ambush_mark(c: cell, cl: manual_celllister): void {
  if (!cl.add(c)) return;
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    if (c2.cpdist < c.cpdist)
      ambush_mark(c2, cl);
  }
}

// EX int distance: G.ambush_distance; EX bool ambushed: G.ambush_ambushed

export function ambush_check_state(): void {
  if ((G.havewhat & HF_HUNTER) !== 0n) {
    const cl = new manual_celllister();
    try {
      for (const c of G.dcal) {
        if (c.monst === moHunterDog) {
          if (c.cpdist > G.ambush_distance)
            G.ambush_distance = c.cpdist;
          ambush_mark(c, cl);
        }
        if (c.monst === moHunterGuard && c.cpdist <= 4)
          ambush_mark(c, cl);
      }
      if (G.items[itHunting] > 5 && G.items[itHunting] <= 22) {
        let q = 0;
        for (const pc of player_positions())
          for (let i = 0; i < pc.type; i++) {
            const c2 = pc.move(i); if (!c2) continue;
            if (cl.listed(c2))
              q++;
          }
        if (q === 1) G.havewhat |= HF_FAILED_AMBUSH;
        if (q === 2) {
          for (const pc of player_positions())
            for (let i = 0; i < pc.type; i++) {
              const c2 = pc.move(i); if (!c2) continue;
              if (cl.listed(c2))
                for (let j = 0; j < pc.type; j++) {
                  const c3 = pc.move(j); if (!c3) continue;
                  if (c3 !== c2 && isNeighbor(c2, c3))
                    if (cl.listed(c3))
                      G.havewhat |= HF_FAILED_AMBUSH;
                }
            }
        }
        if ((G.havewhat & HF_FAILED_AMBUSH) !== 0n && G.ambush_ambushed) {
          addMessage(XLAT('The Hunting Dogs give up.'));
          G.ambush_ambushed = false;
        }
      }
    } finally { cl.destroy(); }
  }

}

// EX int fixed_size: G.ambush_fixed_size

export function ambush_size(_c: cell, what: eItem): number {
  let restricted = false;
  for (const c2 of G.dcal) {
    if (c2.cpdist > 3) break;
    if (c2.monst && !isFriendly(c2) && !slowMover(c2) && !isMultitile(c2)) restricted = true;
  }

  const qty = G.items[itHunting];
  if (G.ambush_fixed_size)
    return G.ambush_fixed_size;
  switch (what) {
    case itCompass:
      return 0;

    case itHunting:
      return Math.min(Math.min(qty, Math.max(33 - qty, 6)), 15);

    case itOrbSide3:
      return restricted ? 10 : 20;

    case itOrbFreedom:
      return restricted ? 10 : 60;

    case itOrbImpact:
    case itOrbPlague:
      return 10;

    case itOrbThorns:
    case itOrb37:
    case itOrbChaos:
      return 20;

    case itOrbLava:
      return 20;

    case itOrbBeauty:
      return 35;

    case itOrbShell:
      return 35;

    case itOrbPsi:
      // return 40; -> no benefits
      return 20;

    case itOrbDash:
    case itOrbFrog:
      return 40;

    case itOrbAir:
    case itOrbDragon:
      return 50;

    case itOrbStunning:
      // return restricted ? 50 : 60; -> no benefits
      return 30;

    case itOrbBull:
    case itOrbSpeed:
    case itOrbShield:
      return 60;

    case itOrbInvis:
      return 80;

    case itOrbTeleport:
      return 300;

    case itGreenStone:
    case itOrbSafety:
    case itOrbYendor:
      return 0;

    case itKey:
      return 16;

    case itWarning:
      return qty;

    default:
      return restricted ? 6 : 10;

    // Flash can survive about 70, but this gives no benefits
  }

}

export function ambush_ambush(c: cell, dogs: number): void {
  if (changes.on) { changes.at_commit(() => ambush_ambush(c, dogs)); return; } // LATE
  const maxdist = gamerange();
  const cl = new celllister(c, maxdist, 1000000, null);
  try {
    let c0 = c;
    let d = 0;
    let dogs0 = 0;
    for (const cx of cl.lst) {
      const dh = cl.getdist(cx);
      if (dh <= 2 && cx.monst === moHunterGuard) {
        cx.monst = moHunterDog; dogs0++;
      }
      if (dh > d) { c0 = cx; d = dh; }
    }
    if (sphere()) {
      for (let i = cl.lst.length - 1; i > 0 && dogs; i--)
        if (!isPlayerOn(cl.lst[i]) && !cl.lst[i].monst) {
          cl.lst[i].monst = moHunterDog; dogs--;
        }
    }
    const around: cell[] = [];
    let clast: cell = null!;
    let ccur = c0;
    const v = valence();
    if (v > 4) {
      for (const c of cl.lst) if (cl.getdist(c) === d) around.push(c);
      hrandom_shuffle(around);
    }
    else {
      for (let tries = 0; tries < 10000; tries++) {
        let c2: cell = null!;
        if (v === 3) {
          for (let i = 0; i < ccur.type; i++) {
            const c1 = ccur.move(i); if (!c1) continue;
            if (c1 !== clast && cl.listed(c1) && cl.getdist(c1) === d)
              c2 = c1;
          }
        }
        if (v === 4) {
          for (let i = 0; i < ccur.type; i++) {
            const c1 = new cellwalker(ccur, i).addStep().add(1).peek();
            if (!c1) continue;
            if (c1 !== clast && cl.listed(c1) && cl.getdist(c1) === d)
              c2 = c1;
          }
        }
        if (!c2) break;
        if (c2.land === laHunting && c2.wall === waNone && c2.monst === moNone)
          around.push(c2);
        clast = ccur; ccur = c2;
        if (c2 === c0) break;
      }
    }
    const N = isize(around);

    let gaps = dogs;
    let result = dogs0;
    if (N) {
      G.ambush_ambushed = true;
      const shift = hrand(N);
      dogs = Math.min(dogs, N);
      gaps = Math.min(gaps, N);
      for (let i = 0; i < dogs; i++) {
        const pos = (shift + idiv(N * i, gaps)) % N;
        const nextdog = around[pos];
        nextdog.monst = moHunterDog;
        nextdog.stuntime = 1;
        drawFlash(nextdog);
      }
      result += dogs;
    }

    if (result)
      addMessage(XLAT('You are ambushed!'));
  } finally { cl.destroy(); }
}

export function ambush_guard_attack(): void {
  addMessage(XLAT('%The1 alarms other dogs as it dies!', spM(moHunterDog)));
  for (const c of G.dcal) if (c.monst === moHunterGuard) c.monst = moHunterDog;
  ambush_ambush(G.cwt.at, 7);
}

// namespace dice

/** struct die_structure */
export class die_structure {
  sides: number[][];
  spins: number[][];
  hardness: number[] = [];
  faces: number;
  facesides: number;
  order: number;
  highest_hardness: number;
  constructor(ord: number, v: number[][]) {
    this.sides = v.map((x) => [...x]);
    this.spins = this.sides.map((x) => [...x]);
    this.faces = isize(this.sides);
    this.facesides = isize(this.sides[0]);
    this.order = ord;
    for (let i = 0; i < this.faces; i++)
      for (let j = 0; j < isize(this.sides[i]); j++) {
        const i1 = this.sides[i][j];
        this.spins[i][j] = -1;
        for (let k = 0; k < isize(this.sides[i1]); k++)
          if (this.sides[i1][k] === i)
            this.spins[i][j] = k;
        // if(spins[i][j] == -1) println(hlog, "asymmetric");
      }
    // hardness.resize(faces, 99); hardness.back() = 0;
    while (this.hardness.length < this.faces) this.hardness.push(99);
    this.hardness[this.hardness.length - 1] = 0;
    for (let it = 0; it < this.faces; it++)
      for (let i = 0; i < this.faces; i++)
        for (const j of this.sides[i])
          this.hardness[i] = Math.min(this.hardness[i], this.hardness[j] + 1);
    this.highest_hardness = 0;
    for (let i = 0; i < this.faces; i++)
      this.highest_hardness = Math.max(this.highest_hardness, this.hardness[i]);
  }
}

export function dice_get_facesides(ds: die_structure): number { return ds.facesides; }

const d20 = new die_structure(5, [
  [13 - 1, 7 - 1, 19 - 1], [20 - 1, 12 - 1, 18 - 1], [19 - 1, 17 - 1, 16 - 1], [14 - 1, 18 - 1, 11 - 1], [13 - 1, 18 - 1, 15 - 1],
  [14 - 1, 9 - 1, 16 - 1], [1 - 1, 15 - 1, 17 - 1], [20 - 1, 16 - 1, 10 - 1], [19 - 1, 6 - 1, 11 - 1], [8 - 1, 17 - 1, 12 - 1],
  [13 - 1, 9 - 1, 4 - 1], [2 - 1, 10 - 1, 15 - 1], [1 - 1, 11 - 1, 5 - 1], [20 - 1, 4 - 1, 6 - 1], [7 - 1, 5 - 1, 12 - 1],
  [8 - 1, 6 - 1, 3 - 1], [7 - 1, 10 - 1, 3 - 1], [2 - 1, 5 - 1, 4 - 1], [1 - 1, 3 - 1, 9 - 1], [8 - 1, 2 - 1, 14 - 1],
]);

const d8 = new die_structure(4, [
  [1, 3, 5], [0, 4, 2], [3, 1, 7], [2, 6, 0], [5, 7, 1], [4, 0, 6], [7, 5, 3], [6, 2, 4],
]);

const d4 = new die_structure(3, [[3, 2, 1], [3, 0, 2], [1, 0, 3], [0, 1, 2]]);

const d6 = new die_structure(3, [[1, 2, 4, 3], [5, 2, 0, 3], [5, 4, 0, 1], [5, 1, 0, 4], [0, 2, 5, 3], [4, 2, 1, 3]]);

const d12 = new die_structure(3, [
  [3, 5, 4, 9, 1], [0, 9, 6, 7, 3], [11, 10, 5, 3, 7], [0, 1, 7, 2, 5], [0, 5, 10, 8, 9], [0, 3, 2, 10, 4],
  [11, 7, 1, 9, 8], [11, 2, 3, 1, 6], [11, 6, 9, 4, 10], [0, 4, 8, 6, 1], [11, 8, 4, 5, 2], [8, 10, 2, 7, 6],
]);

// vector<die_structure*> die_list = {&d4, &d6, &d8, &d12, &d20}: G.dice_die_list (assigned in register_complex2)

/** struct die_data */
export class die_data {
  which: die_structure = null!;
  /** the current face value */
  val = 0;
  /** which direction is the first side (which->sides[val][0]) of the current face, multipled by facesides */
  dir = 0;
  mirrored = false;
  clone(): die_data {
    const d = new die_data();
    d.which = this.which; d.val = this.val; d.dir = this.dir; d.mirrored = this.mirrored;
    return d;
  }
  happy(): number {
    if (this.val === this.which.faces - 1) return 1;
    if (this.val === 0) return -1;
    return 0;
  }
}

export function dice_shape_faces(w: die_structure): number { return w.faces; }

export function dice_die_name(w: die_structure): string { return its(w.faces); }

export function dice_get_by_id(i: number): die_structure { return G.dice_die_list[(i >>> 0) % isize(G.dice_die_list)]; }
export function dice_get_die_id(ds: die_structure): number {
  for (let i = 0; i < isize(G.dice_die_list); i++)
    if (G.dice_die_list[i] === ds)
      return i;
  return -1;
}

// EX map<cell*, die_data> data: G.dice_data

/** data[c]: std::map operator[] inserts a default die_data */
export function dice_data_at(c: cell): die_data {
  let d = G.dice_data.get(c);
  if (!d) { d = new die_data(); G.dice_data.set(c, d); }
  return d;
}

export function dice_generate_specific(c: cell, ds: die_structure, min_hardness: number, max_hardness: number): void {
  const dd = dice_data_at(c);
  dd.which = ds;
  const dirs: number[] = [];
  for (let i = 0; i < c.type; i++) createMov(c, i);
  for (let i = 0; i < c.type * ds.facesides; i++)
    for (let j = 0; j < c.type; j++) if (dice_can_roll(ds.facesides, i, movei.sd(c, j)))
      dirs.push(i);
  if (dirs.length === 0)
    dd.dir = hrand(c.type * ds.facesides);
  else
    dd.dir = hrand_elt(dirs);
  const sides: number[] = [];
  for (let i = 0; i < ds.faces; i++)
    if (ds.hardness[i] >= min_hardness && ds.hardness[i] <= max_hardness)
      sides.push(i);
  dd.val = hrand_elt(sides);
}

export function dice_die_possible(c: cell): number {
  const res: number[] = [];
  for (const i of [3, 4, 5])
    if ((c.type % i) === 0)
      res.push(i);
  if (res.length === 0) return 0;
  return hrand_elt(res);
}

export function dice_can_roll(sides: number, cur: number, mi: movei): boolean {
  if (gcd(mi.t.type, sides) === 1) return false;
  if ((cur - mi.d * sides) % mi.s.type) return false;
  return true;
}

/** bool can_roll(movei mi) */
export function dice_can_roll_mi(mi: movei): boolean {
  const dd = dice_data_at(mi.s);
  const dw = dd.which;
  return dice_can_roll(dw.facesides, dd.dir, mi);
}

export function dice_generate_random(c: cell): boolean {
  const ds: die_structure[] = [];
  for (const pds of [d4, d6, d8, d12, d20])
    if (c.type % pds.facesides === 0)
      ds.push(pds);
  if (ds.length === 0) return false;
  dice_generate_specific(c, hrand_elt(ds), 0, 99);
  return true;
}

export function dice_generate_full(c: cell, hard: number): void {
  const dp = dice_die_possible(c);
  if (!dp) return;
  if (G.safety) return;
  const pct = hrand(100);
  const pct2 = hrand(6000);
  if (dp === 4) {
    if (pct < 20) {
      c.wall = (pct < (G.items[itOrbLuck] ? 9 : 11)) ? waRichDie : waHappyDie;
      dice_generate_specific(c, d6, 1, 2);
    }
    else if (pct2 < 40 + hard) {
      c.monst = moAnimatedDie;
      dice_generate_specific(c, d6, 0, 99);
    }
    return;
  }
  if (dp === 5) {
    if (pct < 20) {
      c.wall = (pct < (G.items[itOrbLuck] ? 9 : 11)) ? waRichDie : waHappyDie;
      dice_generate_specific(c, d12, 2, 3);
    }
    else if (pct2 < 40 + hard) {
      c.monst = moAnimatedDie;
      dice_generate_specific(c, d12, 0, 99);
    }
    return;
  }
  if (pct < 3) {
    c.wall = waHappyDie;
    dice_generate_specific(c, d4, 0, 0);
  }
  else if (pct < 6) {
    c.wall = waHappyDie;
    dice_generate_specific(c, d8, 0, 1);
  }
  else if (pct < (G.items[itOrbLuck] ? 8 : 9)) {
    c.wall = waHappyDie;
    dice_generate_specific(c, d20, 0, 1);
  }
  else if (pct < 14) {
    c.wall = waRichDie;
    if (G.items[itOrbLuck])
      dice_generate_specific(c, d20, 2, 3);
    else
      dice_generate_specific(c, d20, 4, 5);
  }
  else if (pct < 15) {
    c.wall = waRichDie;
    if (G.items[itOrbLuck])
      dice_generate_specific(c, d8, 1, 2);
    else
      dice_generate_specific(c, d8, 2, 3);
  }
  else if (pct2 < (G.items[itOrbLuck] ? 5 : 1)) {
    c.monst = moAnimatedDie;
    dice_generate_specific(c, d4, 0, 99);
  }
  else if (pct2 < 40) {
    c.monst = moAnimatedDie;
    dice_generate_specific(c, d8, 0, 99);
  }
  else if (pct2 < 40 + hard) {
    c.monst = moAnimatedDie;
    dice_generate_specific(c, d20, 0, 99);
  }
}

/** die_data roll_effect(movei mi, die_data dd): dd is a copy */
export function dice_roll_effect(mi: movei, dd: die_data): die_data {
  dd = dd.clone();
  const cto = mi.t;
  const th = mi.s;

  const rdir = mi.dir_force();
  const t = th.type;

  const val = dd.val;
  const dir = dd.dir;

  const dw = dd.which;

  const si = dw.facesides;

  if (gcd(t, si) === 1) { /* println(hlog, "error: bad roll ", tie(t, si)); */ return dd; }

  const sideid = gmod(idiv((rdir * si - dir) * (dd.mirrored ? -1 : 1), t), si);

  const val1 = dw.sides[val][sideid];

  const si1 = isize(dw.sides[val1]);

  const sideid1 = dw.spins[val][sideid];

  const t1 = cto.type;
  if (gcd(t1, si1) === 1) { /* println(hlog, "error: bad roll target"); */ return dd; }

  const rdir1 = mi.rev_dir_force();

  const mirror1 = dd.mirrored !== mi.mirror();

  let dir1 = rdir1 * si1 - (mirror1 ? -1 : 1) * sideid1 * t1;

  dir1 = gmod(dir1, t1 * si1);

  dd.mirrored = mirror1;
  dd.val = val1;
  dd.dir = dir1;
  return dd;
}

export function dice_on(c: cell): boolean {
  return isDie_w(c.wall) || isDie(c.monst);
}

export function dice_describe(c: cell): string {
  if (!G.dice_data.has(c)) return 'BUG: die data missing';
  else if (!G.dice_data.get(c)!.which) return 'BUG: die data default-initialized';
  else return XLAT('d%1 rolled %2', its(G.dice_data.get(c)!.which.faces), its(G.dice_data.get(c)!.val + 1));
}

export function dice_roll(mi: movei): void {
  const cto = mi.t;
  const th = mi.s;

  changes.map_value(G.dice_data, cto);
  changes.map_value(G.dice_data, th);
  const r = dice_roll_effect(mi, dice_data_at(th));
  G.dice_data.set(cto, r); // data[cto] = roll_effect(mi, data[th])
  G.dice_data.delete(th);
}

export function dice_draw_die(_c: cell, _V: unknown, _scale: number, _color: number): void {
  notp('dice::draw_die (graphics)');
}

export function dice_swap_forbidden(ca: cell, cb: cell): boolean {
  if (!dice_on(ca)) return false;
  return (cb.type % dice_data_at(ca).which.facesides) !== 0;
}

// swap_data: pcmove.ts

export function dice_chaos_swap(wa: cellwalker, wb: cellwalker): void {
  swap_data(G.dice_data, wa.at, wb.at);
  if (dice_on(wa.at)) {
    const d = dice_data_at(wa.at);
    d.dir = chaos_mirror_dir(d.dir, wb, wa);
    d.mirrored = !d.mirrored;
  }
  if (dice_on(wb.at)) {
    const d = dice_data_at(wb.at);
    d.dir = chaos_mirror_dir(d.dir, wa, wb);
    d.mirrored = !d.mirrored;
  }
}

/** the static initializers of complex2.cpp, called by register_all() in include order: brownian's
 *  `int hrc = addHook(hooks_removecells, 0, ...) + addHook(hooks_clearmemory, 0, ...)` (+ hooks_gamedata, dual
 *  mode: not registered), variant::features and dice::die_list (tables with functions, kept in G), and dice's
 *  `int hook = addHook(hooks_clearmemory, 0, ...)`. */
export function register_complex2(): void {
  G.hooks_removecells.add(0, () => {
    const to_remove: cell[] = [];
    for (const p of futures.keys()) if (is_cell_removed(p)) to_remove.push(p);
    for (const r of to_remove) futures.delete(r);
  });
  G.hooks_clearmemory.add(0, () => { futures.clear(); });
  G.variant_features = variant_features_table;
  G.dice_die_list = [d4, d6, d8, d12, d20];
  G.hooks_clearmemory.add(0, () => { G.dice_data.clear(); });
}

void centersteps; void totalsteps;
