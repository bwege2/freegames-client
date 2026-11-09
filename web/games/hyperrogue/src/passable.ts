// passable.cpp of HyperRogue 13.1o: check whether monster/PC can move in the given direction. Package P6.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// G.airmap is vector<pair<cell*, int>>: [cell, dist][], sorted by (cell._id, dist) (PORTING.md, "Pointer order").
// G.rosemap is map<cell*, int>; `rosemap[c]` inserts a 0 (observable: buildRosemap may turn it into 7), so the
// reads that insert go through rosemap_ref(c). Its iterations go in key order (sortedKeys).
import { animateMovement, LAYER_BOAT } from './animations.ts';
import { celldistAlt, createMov, isNeighbor, neighborId } from './cell.ts';
import { eubinary, nonorientable } from './classes.ts';
import {
  prairie_isriver, sword_at, whirlwind_calcdirs, whirlwind_cat, whirlwind_winddir, windmap_at, windmap_NOWINDBELOW,
  windmap_NOWINDFROM,
} from './complex.ts';
import { dice_can_roll_mi, dice_die_possible } from './complex2.ts';
import {
  type eMonster, type flagtype, itBarrow, itCoral, itCurseWater, itNone, itOrb37, itOrbAether, itOrbBeauty,
  itOrbEmpathy, itOrbFish, itOrbGravity, itOrbNature, itOrbShield, itOrbWater, itOrbWinter, itOrbYendor, laBlizzard,
  laDual, laHalloween, laLivefjord, laMotion, laPower, laReptile, laVolcano, laWhirlpool, laZebra, minf,
  moAirElemental, moAltDemon, moAnimatedDie, moAsteroid, moDragonHead, moEarthElemental, moEvilGolem,
  moFriendlyGhost, moFrog, moGreaterShark, moHerdBull, moHexDemon, moHexSnake, moKrakenH, moMimic, moMonk, moMouse,
  moPair, moPhaser, moReptile, moTameBomberbird, moTentacle, moTentacletail, moTortoise, moVaulter, moVoidBeast,
  moWaterElemental, moWitchGhost, moWitchWinter, moWolf, moWorm, moYeti, waArrowTrap, waBigStatue, waBoat,
  waBonfireOff, waCavefloor, waCIsland, waCIsland2, waCloud, waDeadfloor, waDeadTroll, waDeadTroll2, waDeadwall,
  waDeepWater, waDune, waFire, waFireTrap, waFrozenLake, waLake, waMagma, waMineMine, waMineOpen, waMineUnknown,
  waMirror, waMirrorWall, waNone, waPartialFire, waRose, waRoundTable, waSea, waShallow, waStone,
} from './content.ts';
import { i8, sortedKeys, std_sort } from './cpp.ts';
import { gamerange, HF_AIR, HF_ROSE } from './environment.ts';
import {
  attackNonAdjacent, attackThruVine, cellHalfvine, cellUnstable, cellUnstableOrChasm, checkOrb,
  do_not_touch_this_wall, halfvine_direction, inmirror, isAlchAny, isBird, isBug, isChasmy, isCoastal, isDemon,
  isDie, isDie_w, isDragon, isFire, isFriendly, isGhost, isGhostMover, isGolemOrKnight, isGravityLand, isIcyLand,
  isLeader, isMagneticPole, isNoFlight, isNonblock, isPrincess, isReptile, isSealand, isShark, isSlimeMover,
  isThorny, isWall, isWatery, isWateryOrBoat, isWitch, isWorm, slimegroup, snakelevel,
} from './flags.ts';
import { G } from './globals.ts';
import { among, Flag, isize, MF_IVY } from './hyper.ts';
import { TAU } from './hyperpoint.ts';
import { moveItem, pickable_from_water } from './items.ts';
import { cell, jumpdata, movei, NODIR } from './locations.ts';
import {
  bird_disruption, cellEdgeUnstable, destroyTrapsOn, gravity_zone_diff, gravityLevelDiff, gsAnti, gsLevitation,
  in_gravity_zone, isJWall, nonAdjacent, thruVine,
} from './mapeffects.ts';
import { angledist } from './monstermove.ts';
import { check_jump, check_phase, check_vault, markEmpathy, markOrb, markOrb2 } from './orbs.ts';
import { kraken_pseudohept, pseudohept } from './pattern2.ts';
import { changes, isPlayerOn, player_positions } from './pcmove.ts';


// === MOVEMENT FUNCTIONS ===

// w = from->move(d)
export function againstCurrent(w: cell, from: cell): boolean {
  if (from.land !== laWhirlpool) return false;
  if (againstWind(from, w)) return false; // wind is stronger than current
  if (!eubinary() && (!from.master.alt || !w.master.alt)) return false;
  const dfrom = celldistAlt(from);
  const dw = celldistAlt(w);
  if (dw < dfrom) return false;
  if (dfrom < dw) return true;
  for (let d = 0; d < from.type; d++)
    if (from.move(d) === w) {
      const c3 = from.modmove(d - 1);
      if (!c3) return false;
      return celldistAlt(c3) < dfrom;
    }
  return false;
}

export function boatGoesThrough(c: cell): boolean {
  if (isGravityLand(c.land)) return false;
  return (
    (c.wall === waNone && c.land !== laMotion && c.land !== laZebra && c.land !== laReptile) ||
    isAlchAny(c) ||
    c.wall === waCavefloor || c.wall === waFrozenLake || isReptile(c.wall) ||
    c.wall === waDeadfloor || c.wall === waCIsland || c.wall === waCIsland2 ||
    c.wall === waMineUnknown || c.wall === waMineMine || c.wall === waMineOpen ||
    c.wall === waBonfireOff || c.wall === waFire || c.wall === waPartialFire ||
    c.wall === waArrowTrap || c.wall === waShallow);
}

export function become_water(c: cell): void {
  if (isIcyLand(c))
    c.wall = waLake;
  else if (isCoastal(c) || isSealand(c))
    c.wall = waSea;
  else
    c.wall = waDeepWater;
}

export function placeWater(c: cell, c2: cell): void {
  destroyTrapsOn(c);
  if (isWatery(c)) { /* nothing */ }
  else if (c2 && isAlchAny(c2))
    c.wall = c2.wall;
  else become_water(c);
  // destroy the ancient treasure!
  if (c.item === itBarrow) c.item = itNone;
}

export function incline(cfrom: cell, cto: cell): number {
  return snakelevel(cto) - snakelevel(cfrom);
}

export function checkflags(flags: flagtype, x: flagtype): boolean {
  if (flags & x) return true;
  if (flags & P_ISPLAYER) {
    if ((x & P_WINTER) && (markOrb(itOrbWinter) || markOrb(itCurseWater))) return true;
    if ((x & P_IGNORE37) && markOrb(itOrb37)) return true;
    if ((x & P_FISH) && markOrb(itOrbFish)) return true;
    if ((x & P_MARKWATER) && markOrb(itOrbWater)) return true;
    if ((x & P_AETHER) && markOrb2(itOrbAether) && !(flags & P_NOAETHER)) return true;
    if ((x & P_WATERCURSE) && markOrb2(itCurseWater)) return true;
    if ((x & P_IVY) && markOrb2(itOrbNature)) return true;
  }
  if (flags & P_ISFRIEND) if (G.items[itOrbEmpathy])
    if (checkflags(flags ^ P_ISPLAYER ^ P_ISFRIEND, x) && markOrb(itOrbEmpathy))
      return true;
  return false;
}

export function strictlyAgainstGravity(w: cell, from: cell, revdir: boolean, flags: flagtype): boolean {
  return (
    cellEdgeUnstable(w, flags) && cellEdgeUnstable(from, flags) &&
    !(G.shmup_on && from === w) && gravityLevelDiff(from, w) !== (revdir ? -1 : 1) * gravity_zone_diff(from));
}

export function anti_alchemy(w: cell, from: cell): boolean {
  if (!from) return false;
  if (!isAlchAny(w)) return false;
  if (!isAlchAny(from)) return false;
  if (w.item) return false;
  if (from.item) return false;
  if (!nonorientable()) return w.wall !== from.wall;
  for (let i = 0; i < w.type; i++) {
    const c1 = w.move(i); if (!c1) continue;
    if (c1 === from && (w.c.mirror(i) ? w.wall !== from.wall : w.wall === from.wall))
      return false;
  }
  return true;
}

export const P_MONSTER = Flag(0); // can move through monsters
export const P_MIRROR = Flag(1); // can move through mirrors
// unused
export const P_WIND = Flag(3); // can move against the wind
export const P_GRAVITY = Flag(4); // can move against the gravity
export const P_ISPLAYER = Flag(5); // player-only moves (like the Round Table jump)
export const P_ONPLAYER = Flag(6); // always can step on the player
export const P_FLYING = Flag(7); // is flying
export const P_BULLET = Flag(8); // bullet can fly through more things
export const P_MIRRORWALL = Flag(9); // mirror images go through mirror walls
export const P_JUMP1 = Flag(10); // first part of a jump
export const P_JUMP2 = Flag(11); // second part of a jump
export const P_TELE = Flag(12); // teleport onto
export const P_BLOW = Flag(13); // Orb of Air -- blow, or push
export const P_AETHER = Flag(14); // aethereal
export const P_FISH = Flag(15); // swimming
export const P_WINTER = Flag(16); // fire resistant
export const P_USEBOAT = Flag(17); // can use boat
export const P_NOAETHER = Flag(18); // disable AETHER
export const P_FRIENDSWAP = Flag(19); // can move on friends (to swap with tem)
export const P_ISFRIEND = Flag(20); // is a friend (can use Empathy + Winter/Aether/Fish combo)
export const P_LEADER = Flag(21); // can push statues and use boats
export const P_MARKWATER = Flag(22); // mark Orb of Water as used
export const P_EARTHELEM = Flag(23); // Earth Elemental
export const P_WATERELEM = Flag(24); // Water Elemental
export const P_IGNORE37 = Flag(25); // ignore the triheptagonal board
export const P_CHAIN = Flag(26); // for chaining moves with boats
export const P_DEADLY = Flag(27); // suicide moves allowed
export const P_ROSE = Flag(28); // rose smell
export const P_CLIMBUP = Flag(29); // allow climbing up
export const P_CLIMBDOWN = Flag(30); // allow climbing down
export const P_REPTILE = Flag(31); // is reptile
export const P_VOID = Flag(32); // void beast
export const P_PHASE = Flag(33); // phasing movement
export const P_PULLMAGNET = Flag(34); // pull the other part of the magnet
export const P_WATERCURSE = Flag(35); // Curse of Water
export const P_IVY = Flag(36); // ivy

export function passable(w: cell, from: cell, flags: flagtype): boolean {
  const F = (x: flagtype): boolean => checkflags(flags, x);
  const vrevdir = (flags & P_VOID) !== 0n;

  if (w.land === laDual && pseudohept(w) && !F(P_BULLET)) return false;

  if (from && from !== w && nonAdjacent(from, w) && !F(P_IGNORE37 | P_BULLET)) return false;

  if ((isWateryOrBoat(w) || w.wall === waShallow) && F(P_WATERCURSE))
    return false;

  for (const pp of player_positions()) {
    if (w === pp && F(P_ONPLAYER)) return true;

    if (from && !((flags & P_ISPLAYER) && pp.monst)) {
      let i = vrevdir ? incline(w, from) : incline(from, w);
      if (in_gravity_zone(w)) {
        if (G.gravity_state === gsLevitation) i = 0;
        if (G.gravity_state === gsAnti && i > 1) i = 1;
      }
      if (i < -1 && F(P_ROSE)) return false;
      if ((i > 1) && !F(P_JUMP1 | P_JUMP2 | P_BULLET | P_FLYING | P_BLOW | P_CLIMBUP | P_AETHER | P_REPTILE))
        return false;
      if ((i < -2) && !F(P_DEADLY | P_JUMP1 | P_JUMP2 | P_BULLET | P_FLYING | P_BLOW | P_CLIMBDOWN | P_AETHER | P_REPTILE))
        return false;
    }
  }

  if (F(P_ROSE)) {
    if (airdist(w) < 3) return false;
    if (againstWind(w, from)) return false;
    if (isGravityLand(w)) return false;
  }

  if (from && strictlyAgainstGravity(w, from, vrevdir, flags)
    && !((flags & P_ISPLAYER) && G.shmup_on)
    && !F(P_GRAVITY | P_BLOW | P_JUMP1 | P_JUMP2 | P_FLYING | P_BULLET | P_AETHER)
  ) return false;

  if (from && (vrevdir ? againstWind(from, w) : againstWind(w, from)) && !F(P_WIND | P_BLOW | P_JUMP1 | P_JUMP2 | P_BULLET | P_AETHER)) return false;

  if (!G.shmup_on && sword_at(w, (flags & P_ISPLAYER) !== 0n) && !F(P_DEADLY | P_BULLET | P_ROSE))
    return false;

  const alch1 = anti_alchemy(w, from);

  if (alch1) {
    let alchok = (in_gravity_zone(w) || in_gravity_zone(from));
    alchok = alchok || (F(P_JUMP1 | P_JUMP2 | P_FLYING | P_TELE | P_BLOW | P_AETHER | P_BULLET)
      && !F(P_ROSE));
    if (!alchok) return false;
  }

  if (from && thruVine(from, w) && !F(P_AETHER)) return false;

  if (w.monst === moMouse && F(P_JUMP1)) { /* nothing */ }
  else if (w.monst && isFriendly(w) && F(P_FRIENDSWAP)) { /* nothing */ }
  else if (w.monst && !F(P_MONSTER)) return false;

  if (w.wall === waMirror || w.wall === waCloud)
    return F(P_MIRROR | P_AETHER);

  if (w.wall === waMirrorWall)
    return F(P_MIRRORWALL);

  if (F(P_BULLET)) {
    if (isFire(w) || w.wall === waBonfireOff || cellHalfvine(w) ||
      w.wall === waMagma || isNonblock(w.wall))
      return true;
  }

  if (F(P_LEADER)) {
    if (from && from.wall === waBoat && isWatery(w) && from.item === itOrbYendor)
      return false;

    if (from && from.wall === waBoat && isWateryOrBoat(w) && !againstCurrent(w, from))
      return true;

    if (from && isWatery(from) && w.wall === waBoat && F(P_CHAIN))
      return true;

    if (from && isWatery(from) && isWatery(w) && F(P_CHAIN) && !againstCurrent(w, from))
      return true;

    if (w.wall === waBigStatue && from && canPushStatueOn(from, flags)) return true;
  }

  if (F(P_EARTHELEM)) {
    // cannot go through Living Caves...
    if (w.wall === waCavefloor) return false;
    // but can dig through...
    if (w.wall === waDeadwall || w.wall === waDune || w.wall === waStone)
      return true;
    // and can swim through...
    if (w.wall === waSea && w.land === laLivefjord)
      return true;
  }

  if (F(P_WATERELEM)) {
    if (isWatery(w) || boatGoesThrough(w) ||
      w.wall === waBoat ||
      w.wall === waDeadTroll || w.wall === waDeadTroll2) return true;
    return false;
  }

  if (isThorny(w.wall) && F(P_BLOW | P_DEADLY)) return true;

  if (isFire(w) || w.wall === waMagma) {
    if (w.wall === waMagma && in_gravity_zone(w)) { /* nothing */ }
    else if (!F(P_AETHER | P_WINTER | P_BLOW | P_JUMP1 | P_BULLET | P_DEADLY)) return false;
  }

  if (in_gravity_zone(w) && G.gravity_state === gsAnti && !isGravityLand(w.land) && (!from || !isGravityLand(from.land)))
    if (!F(P_AETHER | P_BLOW | P_JUMP1 | P_BULLET | P_FLYING)) {
      let next_to_wall = false;
      for (let i = 0; i < w.type; i++) { const c2 = w.move(i); if (!c2) continue; if (isJWall(c2)) next_to_wall = true; }
      if (from) for (let i = 0; i < from.type; i++) { const c2 = from.move(i); if (!c2) continue; if (isJWall(c2)) next_to_wall = true; }
      if (!next_to_wall && (!from || incline(from, w) * (vrevdir ? -1 : 1) <= 0)) return false;
    }

  if (isWatery(w)) {
    if ((flags & P_ISPLAYER) && from && isWatery(from) && pickable_from_water(w.item)) { /* nothing */ }
    else if (in_gravity_zone(w)) { /* nothing */ }
    else if (from && from.wall === waBoat && F(P_USEBOAT) &&
      (!againstCurrent(w, from) || F(P_MARKWATER)) && !(from.item === itOrbYendor)) { /* nothing */ }
    else if (from && isWatery(from) && F(P_CHAIN) && F(P_USEBOAT) && !againstCurrent(w, from)) { /* nothing */ }
    else if (!from && F(P_CHAIN) && F(P_USEBOAT)) { /* nothing */ }
    else if (!F(P_AETHER | P_FISH | P_FLYING | P_BLOW | P_JUMP1 | P_BULLET | P_DEADLY | P_REPTILE)) return false;
  }
  if (isChasmy(w)) {
    if (in_gravity_zone(w)) { /* nothing */ }
    else if (!F(P_AETHER | P_FLYING | P_BLOW | P_JUMP1 | P_BULLET | P_DEADLY | P_REPTILE | P_IVY)) return false;
    if (F(P_IVY) && from && isChasmy(from)) return false;
  }

  if (w.wall === waRoundTable && from && from.wall !== waRoundTable && (flags & P_ISPLAYER)) return true;
  if (isNoFlight(w) && F(P_FLYING | P_BLOW | P_JUMP1)) return false;

  if (isWall(w)) {
    // a special case: empathic aethereal beings cannot go through Round Table
    // (but truly aetheral beings can)
    if (w.wall === waRoundTable) {
      if (!(flags & P_AETHER)) return false;
    }
    else if (!F(P_AETHER)) return false;
  }
  return true;
}

/** pair<cell*, int> < pair<cell*, int> (pointer order: creation serial) */
function airmap_less(a: [cell, number], b: [cell, number]): boolean {
  if (a[0]._id !== b[0]._id) return a[0]._id < b[0]._id;
  return a[1] < b[1];
}

export function airdist(c: cell): number {
  if (!(G.havewhat & HF_AIR)) return 3;
  // lower_bound(airmap.begin(), airmap.end(), make_pair(c,0))
  const airmap = G.airmap;
  const key: [cell, number] = [c, 0];
  let lo = 0, hi = airmap.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (airmap_less(airmap[mid], key)) lo = mid + 1; else hi = mid;
  }
  if (lo !== airmap.length && airmap[lo][0] === c) return airmap[lo][1];
  return 3;
}

export function calcAirdir(c: cell): number {
  if (!c || c.monst === moAirElemental || !passable(c, null!, P_BLOW))
    return 0;
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i);
    if (c2 && c2.monst === moAirElemental) {
      return c.c.spin(i) * TAU / c2.type;
    }
  }
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i);
    if (!c2) continue;
    if (!passable(c2, c, P_BLOW | P_MONSTER)) continue;
    if (!passable(c, c2, P_BLOW | P_MONSTER)) continue;
    for (let i = 0; i < c2.type; i++) {
      const c3 = c2.move(i);
      if (c3 && c3.monst === moAirElemental) {
        return c2.c.spin(i) * TAU / c3.type;
      }
    }
  }
  return 0;
}

export function againstWind(cto: cell, cfrom: cell): boolean {
  if (!cfrom || !cto) return false;
  const dcto = airdist(cto), dcfrom = airdist(cfrom);
  if (dcto < dcfrom) return true;
  // CAP_FIELD
  if (cfrom.land === laBlizzard && !G.shmup_on && cto.land === laBlizzard && dcto === 3 && dcfrom === 3) {
    const vfrom = i8(windmap_at(cfrom));
    const vto = i8(windmap_at(cto));
    const z = (vfrom - vto) & 255;
    if (z >= windmap_NOWINDBELOW && z < windmap_NOWINDFROM)
      return true;
  }
  whirlwind_calcdirs(cfrom);
  const d = neighborId(cfrom, cto);
  if (whirlwind_winddir(d) === -1) return true;
  return false;
}

export function ghostmove(m: eMonster, to: cell, from: cell, extra: flagtype): boolean {
  if (!isGhost(m) && nonAdjacent(to, from)) return false;
  if (sword_at(to, false)) return false;
  if (!G.shmup_on && isPlayerOn(to)) return false;
  if (to.monst && !(to.monst === moTentacletail && isGhost(m) && m !== moFriendlyGhost)
    && !(to.monst === moTortoise && isGhost(m) && m !== moFriendlyGhost) && !(extra & P_MONSTER))
    return false;
  if ((m === moWitchGhost || m === moWitchWinter) && to.land !== laPower)
    return false;
  if (isGhost(m))
    for (let i = 0; i < to.type; i++) if (to.move(i)) {
      if (inmirror(to.move(i))) return false;
      if (to.move(i) && to.move(i) !== from && isGhost(to.move(i).monst) &&
        (to.move(i).monst === moFriendlyGhost) === (m === moFriendlyGhost))
        return false;
    }
  if (isGhost(m) || m === moWitchGhost) return true;
  if (m === moGreaterShark) return isWatery(to);
  if (m === moWitchWinter)
    return passable(to, from, P_WINTER | P_ONPLAYER);
  return false;
}

function slimepassable(w: cell, c: cell): boolean {
  if (w === c || !c) return true;
  const u = neighborId(c, w);
  if (nonAdjacent(w, c)) return false;
  if (isPlayerOn(w)) return true;
  const group = slimegroup(c);
  if (!group) return false;
  const ogroup = slimegroup(w);
  if (!ogroup) return false;
  let hv = (group === ogroup);
  if (nonorientable() && isAlchAny(c) && isAlchAny(w))
    hv = !anti_alchemy(c, w);

  if (sword_at(w, false)) return false;

  if (w.item) return false;

  // only travel to halfvines correctly
  if (cellHalfvine(c)) {
    if (angledist(c, halfvine_direction(c), u) > 1) return false;
  }
  // only travel from halfvines correctly
  if (cellHalfvine(w)) {
    if (angledist(w, halfvine_direction(w), c.c.spin(u)) > 1) return false;
  }
  return hv;
}

function sharkpassable(w: cell, c: cell): boolean {
  if (w === c || !c) return true;
  if (nonAdjacent(w, c)) return false;
  if (isPlayerOn(w)) return true;
  if (!isWatery(w) && w.wall !== waShallow) return false;
  if (sword_at(w, false)) return false;

  // don't go against the current
  if (isWateryOrBoat(w) && isWateryOrBoat(c))
    return !againstCurrent(w, c);

  return true;
}

export function canPushStatueOn(c: cell, flags: flagtype): boolean {
  return passable(c, null!, P_MONSTER | flags) && !snakelevel(c) &&
    !isWorm(c.monst) && !isReptile(c.wall) && !G.peace_on &&
    !cellHalfvine(c) && !isDie_w(c.wall) &&
    !among(c.wall, waBoat, waFireTrap, waArrowTrap) &&
    !do_not_touch_this_wall(c);
}

export function moveBoat(mi: movei): void {
  changes.ccell(mi.t);
  changes.ccell(mi.s);
  const x = mi.t.wall; mi.t.wall = mi.s.wall; mi.s.wall = x;
  mi.t.mondir = mi.rev_dir_or(NODIR);
  changes.map_value(G.rosemap, mi.t);
  G.rosemap.delete(mi.t);
  moveItem(mi.s, mi.t, false);
  animateMovement(mi, LAYER_BOAT);
}

export function moveBoatIfUsingOne(mi: movei): void {
  if (mi.s.wall === waBoat && isWatery(mi.t)) moveBoat(mi);
  else if (mi.s.wall === waBoat && boatGoesThrough(mi.t) && isFriendly(mi.t) && markEmpathy(itOrbWater)) {
    placeWater(mi.t, mi.s);
    moveBoat(mi);
  }
}

function againstMagnet(c1: cell, c2: cell, m: eMonster): boolean { // (from, to)
  // if(false) forCellEx(c3, c2) { ... } (dead code)
  if (c1.monst === m && !isNeighbor(c2, c1.move(c1.mondir)))
    return true;
  for (let i = 0; i < c1.type; i++) {
    const c3 = c1.move(i); if (!c3) continue;
    if (c3.monst !== m && isMagneticPole(c3.monst))
      if (!isNeighbor(c3, c2))
        return true;
  }
  return false;
}

export function againstPair(c1: cell, c2: cell, m: eMonster): boolean { // (from, to)
  if (c1.monst === m && !isNeighbor(c2, c1.move(c1.mondir)))
    return true;
  return false;
}

export function notNearItem(c: cell): boolean {
  for (let i = 0; i < c.type; i++) { const c2 = createMov(c, i); if (c2.item) return false; }
  return true;
}

export function isNeighbor1(f: cell, w: cell): boolean {
  return !f || f === w || isNeighbor(f, w);
}

export function ivy_passable(c2: cell, c: cell): boolean {
  if (!passable(c2, c, P_IVY)) return false;
  if (isWatery(c2)) return false;
  if (strictlyAgainstGravity(c2, c, false, MF_IVY)) return false;
  if (cellUnstableOrChasm(c) && cellUnstableOrChasm(c2)) return false;
  return true;
}

export function passable_for(m: eMonster, w: cell, from: cell, extra: flagtype): boolean {
  const jdummy = new jumpdata();
  if (w.monst && !(extra & P_MONSTER) && !isPlayerOn(w))
    return false;
  if (m === moWolf) {
    return (isIcyLand(w) || w.land === laVolcano) && (isPlayerOn(w) || passable(w, from, extra));
  }
  if (isMagneticPole(m))
    return !(w && from && againstMagnet(from, w, m)) && passable(w, from, extra);
  if (m === moPair)
    return !(w && from && againstPair(from, w, m)) && passable(w, from, extra);
  if (m === G.passive_switch) return false;
  if (minf[m].mgroup === moYeti || isBug(m) || isDemon(m) || m === moHerdBull || m === moMimic || m === moAsteroid) {
    if ((isWitch(m) || m === moEvilGolem) && w.land !== laPower && w.land !== laHalloween)
      return false;
    return passable(w, from, extra);
  }
  if (m === moDragonHead && prairie_isriver(w))
    return false;
  if (isShark(m))
    return sharkpassable(w, from);
  if (isSlimeMover(m))
    return slimepassable(w, from);
  if (m === moKrakenH) {
    if (extra & P_ONPLAYER) {
      if (isPlayerOn(w)) return true;
    }
    if ((extra & P_ONPLAYER) && isPlayerOn(w))
      return true;
    if (kraken_pseudohept(w) || kraken_pseudohept(from)) return false;
    if (w.wall !== waBoat && !slimepassable(w, from)) return false;
    for (let i = 0; i < w.type; i++) {
      const w2 = w.move(i); if (!w2) continue;
      if (w2.wall !== waBoat && !passable(w2, w, P_FISH | P_MONSTER)) return false;
    }
    return true;
  }
  if (m === moEarthElemental)
    return passable(w, from, extra | P_EARTHELEM);
  if (m === moWaterElemental)
    return passable(w, from, extra | P_WATERELEM);
  if (m === moGreaterShark)
    return isWatery(w) || w.wall === waBoat || w.wall === waFrozenLake;
  if (isGhostMover(m) || m === moFriendlyGhost)
    return ghostmove(m, w, from, extra);
  // for the purpose of Shmup this is correct
  if (m === moTameBomberbird)
    return passable(w, from, extra | P_FLYING | P_ISFRIEND);
  if (m === moHexSnake)
    return !pseudohept(w) && passable(w, from, extra | P_WIND | P_FISH);
  if (isBird(m)) {
    if (bird_disruption(w) && (!from || bird_disruption(from)) && markOrb(itOrbGravity))
      return passable(w, from, extra);
    else
      return passable(w, from, extra | P_FLYING);
  }
  if (m === moReptile)
    return passable(w, from, extra | P_REPTILE);
  if (isDragon(m))
    return passable(w, from, extra | P_FLYING | P_WINTER);
  if (m === moAirElemental)
    return passable(w, from, extra | P_FLYING | P_WIND);
  if (isLeader(m)) {
    if (from && from.wall === waBoat && from.item === itCoral && !from.monst) return false; // don't move Corals!
    return passable(w, from, extra | P_LEADER);
  }
  if (isPrincess(m))
    return passable(w, from, extra | P_ISFRIEND | P_USEBOAT);
  if (isGolemOrKnight(m))
    return passable(w, from, extra | P_ISFRIEND);
  if (isWorm(m))
    return passable(w, from, extra) && !cellUnstable(w) && ((m !== moWorm && m !== moTentacle) || !cellEdgeUnstable(w));
  if (m === moVoidBeast)
    return passable(w, from, extra | P_VOID);
  if (m === moHexDemon) {
    if (extra & P_ONPLAYER) {
      if (isPlayerOn(w)) return true;
    }
    return !pseudohept(w) && passable(w, from, extra);
  }
  // CAP_COMPLEX2
  if (m === moAnimatedDie) {
    if (extra & P_ONPLAYER) {
      if (isPlayerOn(w)) return true;
    }
    if (from && isDie(from.monst)) {
      let ok = false;
      for (let i = 0; i < from.type; i++) {
        if (from.move(i) !== w) continue;
        if (dice_can_roll_mi(movei.sd(from, i))) ok = true;
      }
      if (!ok) return false;
    }
    if (from && !dice_die_possible(from))
      return false;
    else if (!dice_die_possible(w))
      return false;
    else
      return passable(w, from, extra);
  }
  if (m === moFrog) {
    return isNeighbor1(from, w) ? passable(w, from, extra) : check_jump(from, w, extra, jdummy) === 3;
  }
  if (m === moPhaser)
    return isNeighbor1(from, w) ? passable(w, from, extra) : check_phase(from, w, extra, jdummy) === 3;
  if (m === moVaulter)
    return isNeighbor1(from, w) ? passable(w, from, extra) : check_vault(from, w, extra, jdummy) === 6;
  if (m === moAltDemon) {
    if (extra & P_ONPLAYER) {
      if (isPlayerOn(w)) return true;
    }
    return (!w || !from || w === from || pseudohept(w) || pseudohept(from)) && passable(w, from, extra);
  }
  if (m === moMonk) {
    if (extra & P_ONPLAYER) {
      if (isPlayerOn(w)) return true;
    }
    return notNearItem(w) && passable(w, from, extra);
  }
  return false;
}

export function movegroup(m: eMonster): eMonster { return minf[m].mgroup; }

export function logical_adjacent(c1: cell, m1: eMonster, c2: cell): boolean {
  if (!c1 || !c2) return true; // cannot really check
  const m2 = c2.monst;
  if (!isNeighbor(c1, c2))
    return false;
  if (thruVine(c1, c2) && !attackThruVine(m1) && !attackThruVine(m2) &&
    !checkOrb(m1, itOrbAether) && !checkOrb(m2, itOrbAether))
    return false;
  if (nonAdjacent(c1, c2) && !attackNonAdjacent(m1) && !attackNonAdjacent(m2) &&
    !checkOrb(m1, itOrb37) && !checkOrb(m1, itOrbAether) && !checkOrb(m2, itOrbAether))
    return false;
  return true;
}

export function buildAirmap(): void {
  const airmap = G.airmap;
  for (let k = 0; k < isize(airmap); k++) {
    const d = airmap[k][1];
    if (d === 2) break;
    const c = airmap[k][0];
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i);
      if (!c2) continue;
      if (!passable(c2, c, P_BLOW | P_MONSTER)) continue;
      if (!passable(c, c2, P_BLOW | P_MONSTER)) continue;
      airmap.push([c2, d + 1]);
    }
  }
  std_sort(airmap, airmap_less);
}

/** rosemap[c] as an lvalue read: inserts 0 when c is not there (std::map::operator[]) */
function rosemap_ref(c: cell): number {
  const r = G.rosemap.get(c);
  if (r !== undefined) return r;
  G.rosemap.set(c, 0);
  return 0;
}

export function rosedist(c: cell): number {
  if (!(G.havewhat & HF_ROSE)) return 0;
  const r = rosemap_ref(c);
  if ((r & 7) === 7) return 0;
  if (r & 3) return (r & 3) - 1;
  return 0;
}

export function againstRose(cfrom: cell, cto: cell): boolean {
  if (rosedist(cfrom) !== 1) return false;
  if (cto && rosedist(cto) === 2) return false;
  return true;
}

export function withRose(cfrom: cell, cto: cell): boolean {
  if (rosedist(cfrom) !== 1) return false;
  if (rosedist(cto) !== 2) return false;
  return true;
}

export function buildRosemap(): void {

  G.rosephase++; G.rosephase &= 7;

  if ((G.havewhat & HF_ROSE) && !G.rosephase) {
    G.rosewave++;
    for (let k = 0; k < isize(G.dcal); k++) {
      const c = G.dcal[k];
      if (c.wall === waRose && c.cpdist <= gamerange() - 2)
        G.rosemap.set(c, G.rosewave * 8 + 2);
    }
  }

  // std::map iteration in key order; the keys inserted during the loop (rosemap[c2]) get r-1 with (r-1)&7 == 1,
  // which the loop would skip, so iterating over the keys present at the start is the same
  for (const c of sortedKeys(G.rosemap)) {
    const r = G.rosemap.get(c)!;
    if (r < (G.rosewave) * 8) continue;
    if ((r & 7) === 2) if (c.wall === waRose || !isWall(c)) for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i);
      if (!c2) continue;
      // if(snakelevel(c2) <= snakelevel(c) - 2) continue;
      if (!passable(c2, c, P_BLOW | P_MONSTER | P_ROSE)) continue;
      const r2 = rosemap_ref(c2);
      if (r2 < r) G.rosemap.set(c2, r - 1);
    }
  }

  for (const c of sortedKeys(G.rosemap)) {
    let r = G.rosemap.get(c)!;
    if ((r & 7) === 1 || (r & 7) === 2 || (r & 7) === 3) r++;
    if (airdist(c) < 3 || whirlwind_cat(c)) r |= 7;
    if (c.land === laBlizzard) r |= 7;
    for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (airdist(c2) < 3) r |= 7; }
    G.rosemap.set(c, r);
  }

}

export function scentResistant(): boolean {
  return markOrb(itOrbBeauty) || markOrb(itOrbAether) || markOrb(itOrbShield);
}
