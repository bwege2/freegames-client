// monstergen.cpp of HyperRogue 13.1o: monster generation (ivy, chasms, Crossroads monsters, wandering monsters,
// rock snakes). Package P3. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// The EX variables (avengers, mirrorspirits, wandering_jiangshi, jiangshi_on_screen, splitrocks, timerghost,
// gen_wandering, dont_gen_asteroids) are in G. wchance_in, wanderingZebra and getSeepcount are file-local (exported
// for tests only where noted).
import { G } from './globals.ts';
import { among, isize, NUMWITCH, PINFD, ROCKSNAKELENGTH } from './hyper.ts';
import { idiv } from './cpp.ts';
import { type cell, manual_celllister, NODIR, FULL_EDGE } from './locations.ts';
import {
  type eItem, type eLand, type eMonster, ittypes, IC_TREASURE, IC_ORB,
  moNone, moIvyRoot, moIvyWait, moIvyHead, moIvyDead, moYeti, moGoblin, moRanger, moOrangeDog, moRunDog, moMonkey,
  moZombie, moDesertman, moCultist, moWorm, moTentacle, moTroll, moEagle, moLesser, moGreater, moPyroCultist, moGhost,
  moFireFairy, moHedge, moLancer, moFlailer, moVineBeast, moBomberbird, moAlbatross, moRedTroll, moWaterElemental,
  moAirElemental, moFireElemental, moFatGuard, moMiner, moPalace, moVizier, moDarkTroll, moForestTroll, moStormTroll,
  moFjordTroll, moSlime, moKrakenH, moKrakenT, moVineSpirit, moSeep, moPirate, moParrot, moSparrowhawk, moAcidBird,
  moFrog, moPhaser, moVaulter, moShark, moRusalka, moPike, moCShark, moRatlingAvenger, moRatling, moViking,
  moWitch, moAsteroid, moRedFox, moCultistLeader, moWolf, moHunterDog, moHexSnake, moHexSnakeTail, moGadfly,
  moEarthElemental, moHexer, moMirrorSpirit, moNarciss, moDraugr, moVoidBeast, moIceGolem, moLavaWolf, moSalamander,
  moFalsePrincess, moMetalBeast, moWindCrow, moOutlaw, moResearcher, moJiangshi, moNecromancer, moCrystalSage,
  moGargoyle, moFamiliar, moSkeleton,
  itNone, itPalace, itDodeca, itHyperstone, itFireShard, itWaterShard, itAirShard, itEarthShard, itOrbSword,
  itOrbFish, itOrbSafety, itZebra, itShard, itFulgurite, itBarrow, itPirate, itApple, itBrownian, itVarTreasure,
  itFrog, itWet, itCoral, itCoast, itDock, itFjord, itKraken, itPower, itAsteroid, itOrbThorns, itOrbSide1,
  itOrbSide2, itOrbSide3, itOrbShield, itOrbLife, itMutant2, itGlowCrystal, itDiamond, itHunting, itSpice, itDragon,
  itOrbYendor, itRedGem, itGold, itBull, itGreenGrass, itSilver, itRuby, itCursed, itBlizzard, itLavaLily,
  itTrollEgg, itRose, itHell, itWindstone, itBounty, itMutant, itTerra, itSwitch, itRuins, itEclectic, itStatue,
  itBone, itLotus, itFernFlower, itSapphire, itElixir, itElemental, itIvory, itBombEgg, itEmerald, itWine,
  laEFire, laEWater, laEAir, laEEarth, laElementalWall, laAsteroids, laMirror, laMirrorOld, laEmerald, laMinefield,
  laBurial, laKraken, laCA, laClearing, laZebra, laStorms, laHalloween, laGraveyard, laHell, laWet, laOcean,
  laEndorian, laBrownian, laVariant, laFrog, laCaribbean, laWarpSea, laDocks, laLivefjord, laPower, laDual, laIce,
  laHunting, laDesert, laDragon, laRedRock, laCaves, laBull, laPrairie, laHive, laDeadCaves, laJungle, laCursed,
  laWarpCoast, laBlizzard, laVolcano, laTrollheim, laRose, laWhirlwind, laWildWest, laOvergrown, laTerracotta,
  laSwitch, laRuins, laEclectic, laRlyeh, laDryForest, laCocytus, laAlchemist, laIvoryTower, laWineyard, laPalace,
  laCamelot,
  waChasm, waChasmD, waDeadfloor, waDeadwall, waDeadfloor2, waEarthD, waElementalD, waBarrier, waDeadTroll,
  waRed1, waDeadTroll2, waNone, waVinePlant, waCavewall, waSandstone, waBarrowDig, waBoat, waCTree, waDeepWater,
  waShallow, waSea, waMineMine, waTrunk,
} from './content.ts';
import { createMov, getDistLimit, is_in_disk, getBits } from './cell.ts';
import { passable, passable_for, P_MONSTER, P_ONPLAYER, P_CHAIN } from './passable.ts';
import { killIvy } from './attack.ts';
import {
  cellUnstable, isMultitile, isIvy, itemclass, frog_power, inmirror, isHaunted, isElemental, elementalOf,
} from './flags.ts';
import { earthFloor, earthWall, cellEdgeUnstable } from './mapeffects.ts';
import { getElementalWall, preventbarriers } from './barriers.ts';
import { yendor_hardness } from './yendor.ts';
import { isCrossroads, treasureType } from './landlock.ts';
import { R10 } from './content-req.ts';
import { isPlayerOn } from './pcmove.ts';
import { spherecells, getDodecahedron } from './sphere.ts';
import {
  nonorientable, quotient, sphere_narcm, WDIM, INVERSE, smallbounded, closed_or_bounded, closed_manifold, sphere,
  euclid, BITRUNCATED, mhybrid,
} from './classes.ts';
import { mine_in_minesweeper, mine_count_status } from './complex2.ts';
import {
  clearing_new_root, mirror_build, prairie_isriver, hive_hivehard, hive_randomHyperbug, princess_dist, OUT_OF_PRISON,
} from './complex.ts';
import { pathdata, gamerange } from './environment.ts';
import { in_lovasz } from './items.ts';
import { placeLocalOrbs } from './orbgen.ts';
import { playSeenSound } from './sound.ts';
import { addMessage } from './basegraph.ts';
import { kraken_pseudohept, pseudohept, pattern_threecolor } from './pattern2.ts';
import { active_switch } from './game.ts';
import { genRuinMonster, gen_eclectic_monster, emerald_monster } from './landgen.ts';
import { celldistAltRelative, camelot_monster } from './bigstuff.ts';
import { inpair } from './monstermove.ts';
import { hrand, pick } from './rand.ts';

export function buildIvy(c: cell, children: number, minleaf: number): number {
  if (c.monst) return 0;
  c.mondir = NODIR;
  c.monst = moIvyRoot;
  c.monmirror = nonorientable() && hrand(2) !== 0;

  let child: cell = null!;

  let leaf = 0;
  let leafchild = 0;
  for (let i = 0; i < c.type; i++) {
    createMov(c, i);
    if (passable(c.move(i), c, 0n) && c.move(i).land === c.land) {
      if (children && !child) {
        child = c.move(i); leafchild = buildIvy(c.move(i), children - 1, 5);
      }
      else {
        c.move(i).monst = (leaf++ || G.peace_on) ? moIvyWait : moIvyHead;
        c.move(i).mondir = c.c.spin(i);
        c.move(i).monmirror = c.monmirror;
      }
    }
  }

  leaf += leafchild;
  if (leaf < minleaf) {
    if (child) killIvy(child, moNone);
    const k = G.kills[moIvyDead]; // dynamicval<int> k(kills[moIvyDead]);
    try {
      killIvy(c, moNone);
    } finally { G.kills[moIvyDead] = k; }
    return 0;
  }
  else return leaf;
}

/** the 'chasmify' functions create a simulation of the path the monster came by */
export function chasmify(c: cell): void {
  c.wall = waChasm; c.item = itNone;
  let q = 0;
  const c2: cell[] = [];
  for (let i = 0; i < c.type; i++) if (c.move(i) && c.move(i).mpdist > c.mpdist && cellUnstable(c.move(i)))
    c2[q++] = c.move(i);
  if (q) {
    const c3 = c2[hrand(q)];
    c3.wall = waChasmD;
  }
}

export function chasmifyEarth(c: cell): void {
  let q = 0;
  const d2: number[] = [];
  for (let i = 2; i <= c.type - 2; i++) {
    const j = (i + c.mondir) % c.type;
    const c2 = c.move(j);
    if (c2 && c2.mpdist > c.mpdist && (
      c2.wall === waDeadfloor || c2.wall === waDeadwall ||
      c2.wall === waDeadfloor2))
      d2[q++] = j;
  }
  // if(!q) printf("no further move!\n");
  if (q) {
    const d = d2[hrand(q)];
    const c3 = c.move(d);
    c3.wall = waEarthD;
    for (let i = 0; i < c3.type; i++) {
      const c4 = createMov(c3, i);
      earthFloor(c4);
    }
    c3.mondir = c.c.spin(d);
  }
  earthWall(c); c.item = itNone;
}

export function chasmifyElemental(c: cell): void {
  let q = 0;
  const d2: number[] = [];
  for (let i = 2; i <= c.type - 2; i++) {
    const j = (i + c.mondir) % c.type;
    const c2 = c.move(j);
    if (c2 && c2.mpdist > c.mpdist && c2.land === c.land)
      d2[q++] = j;
  }
  if (q) {
    const d = d2[hrand(q)];
    const c3 = c.move(d);
    if (!c3.monst) {
      c3.wall = waElementalD;
      for (let i = 0; i < c3.type; i++) {
        const c4 = createMov(c3, i);
        if (c4.wall !== waBarrier) c4.wall = waNone;
      }
      c3.mondir = c.c.spin(d);
    }
  }
  c.wall = getElementalWall(c.land);
  c.wparam = 100; c.item = itNone;
}

const crossroadsMonster_weak: eMonster[] = [
  moYeti, moGoblin, moRanger, moOrangeDog, moRunDog, moMonkey, moZombie,
  moDesertman, moCultist,
];

const crossroadsMonster_m: eMonster[] = [
  moWorm, moTentacle,
  moTroll, moEagle,
  moLesser, moGreater, moPyroCultist, moGhost,
  moFireFairy, moIvyRoot, moHedge,
  moLancer, moFlailer, moVineBeast,
  moBomberbird, moAlbatross, moRedTroll,
  moWaterElemental, moAirElemental, moFireElemental,
  moFatGuard, moMiner, moPalace, moVizier,
];

/** generate a monster appropriate for the Crossroads */
export function crossroadsMonster(): eMonster {
  if (hrand(10) === 0) return crossroadsMonster_weak[hrand(9)];

  const mo = crossroadsMonster_m[hrand(24)];
  if (G.peace_on && mo === moWaterElemental) return crossroadsMonster();
  if (G.peace_on && mo === moFireFairy) return crossroadsMonster();
  if (G.peace_on && isMultitile(mo)) return crossroadsMonster();
  return mo;
}

export function wanderingCrossroadsMonster(): eMonster {
  while (true) {
    const m = crossroadsMonster();
    if (!isIvy(m) && m !== moTentacle) return m;
  }
}

export function palaceHP(): number {
  if (G.tactic_on && isCrossroads(G.firstland))
    return 4;
  if (G.items[itPalace] < 3) // 1+2
    return 2;
  else if (G.items[itPalace] < 10) // 1+2+3+4
    return 3;
  else if (G.items[itPalace] < 21) // 1+2+3+4+5+6
    return 4;
  else if (G.items[itPalace] < 35)
    return 5;
  else if (G.items[itPalace] < 50)
    return 6;
  else return 7;
}

export function hardness_empty(): number {
  return yendor_hardness() * (idiv(yendor_hardness() * 3, 5) - 2);
}

export function redtrolls(_c: cell): boolean {
  return false; /*
  int cd = getCdata(c, 2);
  cd &= 63;
  return cd < 32; */
}

export function pickTroll(c: cell): eMonster {
  if (redtrolls(c))
    return pick(moTroll, moDarkTroll, moRedTroll);
  else
    return pick(moForestTroll, moStormTroll, moFjordTroll);
}

export function dieTroll(c: cell, m: eMonster): void {
  if (m === moTroll) c.wall = waDeadTroll;
  else if (m === moDarkTroll) c.wall = waDeadfloor2;
  else if (m === moRedTroll) c.wall = waRed1;
  else { c.wall = waDeadTroll2; c.wparam = m; }
}

export function reptilemax(): number {
  const i = G.items[itDodeca] + yendor_hardness();
  if (i >= 245) return 5;
  let r = (250 - i);
  if (G.shmup_on) r = idiv(r + 2, 3);
  return r;
}

function wchance_in(l: eLand, a: number, of: number, reduction = 0): boolean {
  of *= 10;
  a += yendor_hardness() + 1;
  if (isCrossroads(G.cwt.at.land))
    a += G.items[itHyperstone] * 10;

  //if(cwt.at->land == laWhirlwind && !nowhirl) a += items[itWindstone] * 3;

  for (let i = 0; i < ittypes; i++) if (itemclass(i) === IC_TREASURE)
    a = Math.max(a, idiv(G.items[i] - R10(), 10));

  a -= reduction;
  if (a < 0) return false;

  if (G.use_custom_land_list) {
    of *= 100;
    a = Math.imul(a, G.custom_land_wandering[l]);
  }

  return hrand(a + of) < a;
}

function wanderingZebra(start: cell): void {
  let c = start, c2 = start;
  for (let it = 0; it < 100; it++) {
    if (c.cpdist === getDistLimit()) {
      c.monst = moOrangeDog;
      c.stuntime = 0;
      return;
    }
    let q = 0;
    const ctab: cell[] = new Array<cell>(FULL_EDGE);
    for (let i = 0; i < c.type; i++) {
      const c3 = c.move(i);
      if (c3 && c3 !== c2 && c3.land === laZebra && c3.wall === waNone)
        ctab[q++] = c3;
    }
    if (!q) break;
    c2 = c; c = ctab[hrand(q)];
  }
}

export function getGhostTimer(): number {
  return G.shmup_on ? idiv(G.shmup_curtime - G.lastexplore, 350) : G.turncount - G.lastexplore;
}

export function getGhostcount(): number {
  if (G.peace_on) return 0;
  const t = getGhostTimer();
  let ghostcount = 0;
  if (t > 80) ghostcount = idiv(t - 80 + hrand(20), 20);
  return ghostcount;
}

function getSeepcount(): number {
  const t = getGhostTimer();
  let seepcount = 0;
  if (t > 40) seepcount = idiv(t - 40 + hrand(20), 20);
  return seepcount;
}

export function canReachPlayer(cf: cell, m: eMonster): boolean {
  const cl = new manual_celllister();
  try {
    cl.add(cf);
    for (let i = 0; i < isize(cl.lst) && i < 10000; i++) {
      const c = cl.lst[i];
      let found = false;

      const test = (c2: cell): void => {
        if (cl.listed(c2)) return;
        if (!passable_for(m, c2, c, P_MONSTER | P_ONPLAYER | P_CHAIN)) return;
        if (isPlayerOn(c2)) found = true;
        cl.add(c2);
      };

      for (let j = 0; j < c.type; j++) {
        const c2 = c.move(j); if (!c2) continue;
        if (frog_power(m)) for (let k = 0; k < c2.type; k++) { const c3 = c2.move(k); if (!c3) continue; test(c3); }
        test(c2);
      }

      if (found) return true;
    }
    return false;
  } finally { cl.destroy(); }
}

export function haveOrbPower(): boolean {
  for (let i = 0; i < ittypes; i++) if (itemclass(i) === IC_ORB && G.items[i]) return true;
  if (quotient()) {
    for (let i = 0; i < isize(G.dcal); i++) {
      const c = G.dcal[i];
      if (itemclass(c.item) === IC_ORB) return true;
    }
  }
  else if (sphere_narcm() && WDIM() === 2 && !INVERSE()) for (let i = 0; i < spherecells(); i++) {
    const c = getDodecahedron(i).c7;
    if (itemclass(c.item) === IC_ORB) return true;
    for (let j = 0; j < c.type; j++) { const c2 = c.move(j); if (!c2) continue; if (itemclass(c2.item) === IC_ORB) return true; }
  }
  return false;
}

export function haveKraken(): boolean {
  for (let i = 0; i < spherecells(); i++) {
    const c = getDodecahedron(i).c7;
    if (c.monst === moKrakenH || c.monst === moKrakenT) return true;
  }
  return false;
}

export function wanderingTreasure(c: cell): eItem {
  const l = c.land;
  // CAP_DAILY=0: daily::prevent_spawn_treasure_on dropped
  if (l === laEFire) return itFireShard;
  if (l === laEWater) return itWaterShard;
  if (l === laEAir) return itAirShard;
  if (l === laEEarth) return itEarthShard;
  if (l === laElementalWall) return itNone;
  if (l === laAsteroids) return itNone;
  if (l === laMirror && c.type !== 6) return itNone;
  if (l === laMirrorOld && c.type !== 6) return itNone;
  if (l === laEmerald) {
    for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.wall === waCavewall) return itNone; }
  }
  if (l === laMinefield && c.wall === waMineMine) return itNone;
  if (l === laBurial && hrand(2)) return itOrbSword;
  if (l === laKraken) return itOrbFish;
  return treasureType(l);
}

/** static bool angry (in wandering) */
let wandering_angry = false;

/** generate the wandering monsters */
export function wandering(): void {
  if (mine_in_minesweeper()) {
    mine_count_status();
    return;
  }
  if (!G.canmove) return;
  if (!G.gen_wandering) return;
  if (G.racing_on) return;
  if (G.items[itOrbSafety]) return;
  const pd = new pathdata(moYeti);
  try {
    let seepcount = getSeepcount();
    let ghostcount = getGhostcount();
    if (G.cwt.at.land === laCA) ghostcount = 0;
    const genturn = hrand(100) < 30;

    if (closed_or_bounded() && G.specialland === laClearing)
      clearing_new_root();

    if (G.cwt.at.land === laZebra && G.cwt.at.wall === waNone && wchance_in(laZebra, G.items[itZebra], 20))
      wanderingZebra(G.cwt.at);

    const smallbounded_generation = smallbounded() || (closed_manifold() && G.specialland === laClearing);

    const valid = (c: cell): boolean => { if (G.disksize && !is_in_disk(c)) return false; if (inmirror(c)) return false; return true; };

    if (smallbounded_generation) {
      let maxdist = 0;
      for (let i = 0; i < isize(G.dcal); i++) if (valid(G.dcal[i])) if (G.dcal[i].cpdist > maxdist) maxdist = G.dcal[i].cpdist;
      for (let i = 0; i < isize(G.dcal); i++) if (valid(G.dcal[i])) if (G.dcal[i].cpdist >= maxdist - 1) { G.first7 = i; break; }

      if (hrand(5) === 0) {
        // spawn treasure
      }

      if (smallbounded() && hrand(100) < 2) {
        const ac = G.currentmap.allcells();
        const c1 = ac[hrand(isize(ac))];
        if (c1.wall === waVinePlant && !c1.monst) {
          c1.monst = moVineSpirit;
          c1.stuntime = 3;
        }
      }
    }

    let iter = 0;
    while (G.first7 < isize(G.dcal)) {
      iter++; if (iter > 1000) break;
      const i = G.first7 + hrand(isize(G.dcal) - G.first7);
      let c = G.dcal[i];
      if (!valid(c)) continue;
      if (isPlayerOn(c)) break;

      // [c] captures c by value here: after the Storms reassignment below, wchance still uses this cell's land
      const cw = c;
      const wchance = (a: number, of: number, reduction = 0): boolean => wchance_in(cw.land, a, of, reduction);

      if (G.specialland === laStorms) {
        // place the sandstone wall completely randomly (but not on the player)
        const ac = G.currentmap.allcells();
        c = ac[hrand(isize(ac))];
        if (isPlayerOn(c)) continue;
      }

      if (smallbounded_generation && !c.item && hrand(5) === 0 && c.land !== laHalloween) {
        if (passable(c, null!, 0n) || G.specialland === laKraken) {
          if (c.land !== laGraveyard && !in_lovasz() && !haveOrbPower() && G.specialland !== laHell) for (let it = 0; it < 1000 && !c.item; it++)
            placeLocalOrbs(c);
          if (!c.item) c.item = wanderingTreasure(c);
          if (c.item === itShard) {
            c.item = itNone;
            mirror_build(c);
          }
          if (c.item === itFulgurite) {
            c.item = itNone; c.wall = waSandstone;
          }
          if (c.item === itBarrow) {
            c.landparam = 2 + hrand(2);
            c.wall = waBarrowDig;
          }
        }
      }

      if (!c.monst) c.stuntime = 0;

      if (G.timerghost && !smallbounded()) {
        // wandering seeps & ghosts
        if (seepcount && c.wall === waCavewall && !c.monst && canReachPlayer(c, moSlime)) {
          c.monst = moSeep;
          playSeenSound(c);
          seepcount--;
          continue;
        }

        if (ghostcount && !c.monst && !inmirror(c)) {
          c.monst = moGhost;
          playSeenSound(c);
          ghostcount--;
          continue;
        }
      }

      if (c.land === laWet && !smallbounded() && G.wetslime >= 25 && !c.monst && hrand(100) <= G.wetslime - 25) {
        if (!wandering_angry) { wandering_angry = true; addMessage('You seem to have really pissed off the water spirits!'); }
        c.monst = moGhost;
        playSeenSound(c);
        continue;
      }

      else if ((c.wall === waCavewall || c.wall === waDeadwall) && !c.monst &&
        wchance(G.items[treasureType(c.land)], 10) && canReachPlayer(c, moSlime)) {
        c.monst = moSeep;
        playSeenSound(c);
        continue;
      }

      else if (smallbounded() && c.wall === waVinePlant && !c.monst && wchance(G.items[treasureType(c.land)], 10) && canReachPlayer(c, moSlime)) {
        c.monst = moVineSpirit;
        playSeenSound(c);
        continue;
      }

      else if (c.land === laOcean && G.cwt.at.land === laOcean && G.cwt.at.landparam > 25 && c.landparam > 25 && !G.tactic_on && !G.yendor_on && hrand(100) < 2) {
        c.monst = moPirate; c.wall = waBoat; c.item = itOrbSafety;
        continue;
      }

      else if (c.wall === waCTree && !c.monst && wchance(G.items[itPirate], 15) && canReachPlayer(c, moSlime)) {
        c.monst = moParrot;
        playSeenSound(c);
        continue;
      }

      else if (c.land === laEndorian && c.wall === waNone && wchance(G.items[itApple], 50)) {
        c.monst = moSparrowhawk;
        playSeenSound(c);
        continue;
      }

      else if (c.land === laBrownian && wchance(G.items[itBrownian], 75)) {
        c.monst = moAcidBird;
        continue;
      }

      else if (c.land === laVariant && wchance(G.items[itVarTreasure], 50)) {
        const i = hrand(21);
        if (getBits(c) & (1 >> i)) {
          const m: eMonster = G.variant_features[i].wanderer;
          if (m) { c.monst = m; c.hitpoints = 3; }
        }
        continue;
      }

      else if (c.land === laFrog && !c.monst && wchance(G.items[itFrog], 25)) {
        const m = pick(moFrog, moPhaser, moVaulter);
        if (canReachPlayer(c, m)) {
          c.monst = m;
          playSeenSound(c);
          continue;
        }
      }

      else if (c.land === laWet && among(c.wall, waDeepWater, waShallow) && !c.monst && wchance(G.items[itWet], 15) && canReachPlayer(c, moShark)) {
        c.monst = hrand(100) < 10 ? moRusalka : moPike;
        playSeenSound(c);
        continue;
      }

      else if (c.wall === waSea && !c.monst) {
        if (c.land === laCaribbean && wchance(G.items[itPirate], 15) && canReachPlayer(c, moPirate)) {
          c.monst = moCShark;
          playSeenSound(c);
          continue;
        }
        if (c.land === laWarpSea && G.avengers && canReachPlayer(c, moPirate)) {
          c.monst = moRatlingAvenger;
          c.wall = waBoat;
          G.avengers--;
          // if(cheater) printf("avenger comes\n");
          playSeenSound(c);
          continue;
        }
        if (c.land === laWarpSea && wchance(G.items[itCoral], 25) && canReachPlayer(c, moPirate)) {
          c.monst = moRatling;
          c.wall = waBoat;
          playSeenSound(c);
          continue;
        }
        if (c.land === laOcean && (G.items[itCoast] > 50 || ((G.cwt.at.land !== laOcean || G.cwt.at.landparam < 25) && c.landparam < 25)) && wchance(G.items[itCoast], 25) && canReachPlayer(c, moEagle)) {
          c.monst = moAlbatross;
          playSeenSound(c);
          continue;
        }
        if (c.land === laDocks && wchance(G.items[itDock], 25) && canReachPlayer(c, moEagle)) {
          c.monst = moAlbatross;
          playSeenSound(c);
          continue;
        }
        if (!G.peace_on && c.land === laLivefjord && wchance(G.items[itFjord], 80) && G.items[itFjord] >= 10 && canReachPlayer(c, moWaterElemental)) {
          c.monst = moWaterElemental;
          playSeenSound(c);
          continue;
        }
        if (!G.peace_on && c.land === laKraken && ((sphere() && !hrand(15)) || wchance(G.items[itKraken], 240)) && !kraken_pseudohept(c)) {
          const b = sphere() || canReachPlayer(c, moKrakenH);
          if (sphere_narcm() && WDIM() === 2 && (haveKraken() || !G.items[itOrbFish])) {
            c.monst = moViking; c.wall = waBoat; c.item = itOrbFish;
            playSeenSound(c);
            continue;
          }
          let found = false;
          if (b) for (let k = 0; k < c.type; k++) {
            const c2 = c.move(k); if (!c2) continue;
            if ((sphere() || c2.cpdist > gamerange()) && !kraken_pseudohept(c2)) {
              let notfound = false;
              for (let j = 0; j < c2.type; j++) {
                const c3 = createMov(c2, j);
                if (c3.monst || c3.wall !== waSea) { notfound = true; break; } // goto notfound
              }
              if (notfound) break;
              c2.monst = moKrakenH;
              c2.stuntime = 0;
              playSeenSound(c2);
              for (let j = 0; j < c2.type; j++) {
                c2.move(j).monst = moKrakenT;
                c2.move(j).hitpoints = 1;
                c2.move(j).stuntime = 0;
                c2.move(j).mondir = c2.c.spin(j);
              }
              found = true; // goto found
              break;
            }
          }
          if (found) continue; // found: continue;
        }
        // notfound:
        break;
      }

      else if (smallbounded() && c.land === laPower && !c.monst) {
        if (wchance(G.items[itPower], 10))
          c.monst = moWitch + hrand(NUMWITCH);
      }

      else if (c.monst || c.pathdist === PINFD) break;

      else if (c.land === laAsteroids && G.splitrocks && canReachPlayer(c, moYeti)) {
        c.monst = moAsteroid;
        G.splitrocks--;
        continue;
      }

      else if (c.land === laAsteroids && !G.dont_gen_asteroids) {
        let gen = 0;
        if (G.asteroids_generated * 12 <= G.items[itAsteroid]) gen = 2;
        if (gen === 0) {
          let qty = 0;
          for (const c of G.currentmap.allcells()) if (c.monst === moAsteroid) qty++;
          if (!qty) gen = 1;
        }
        if (gen) { c.monst = moAsteroid; c.hitpoints = 4; }
        if (gen === 2)
          G.asteroids_generated++;

        if (G.items[itAsteroid] > (G.asteroid_orbs_generated + 2) * (G.asteroid_orbs_generated + 3) && !c.item) {
          c.item = pick(itOrbThorns, itOrbSide1, itOrbSide2, itOrbSide3, itOrbShield, itOrbLife);
          G.asteroid_orbs_generated++;
        }

        break;
      }

      else if (c.land === laClearing && wchance(G.items[itMutant2], 150) && G.items[itMutant2] >= 15 && !c.monst && c.type === 7)
        c.monst = moRedFox;

      else if (c.land === laDual && wchance(G.items[itGlowCrystal], 40)) {
        c.monst = moRatling;
        playSeenSound(c);
      }

      else if (hrand(50) < G.statuecount * G.statuecount)
        c.monst = moCultistLeader;

      else if (c.land === laIce && wchance(G.items[itDiamond], 10))
        c.monst = hrand(2) ? moWolf : moYeti;

      else if (c.land === laHunting && wchance(G.items[itHunting], 50, 26))
        c.monst = moHunterDog;

      else if (c.land === laDesert && wchance(G.items[itSpice], 10))
        c.monst = (hrand(10) || G.peace_on) ? moDesertman : moWorm;

      else if (c.land === laDragon && (G.items[itDragon] >= 8 || G.items[itOrbYendor]) && wchance(G.items[itDragon], 20))
        c.monst = moFireElemental;

      else if (c.land === laRedRock && wchance(G.items[itRedGem], 10)) {
        if (hrand(10) || G.peace_on)
          c.monst = moRedTroll;
        else if (!pseudohept(c)) {
          c.monst = moHexSnake; c.hitpoints = 1;
        }
      }

      else if (c.land === laCaves && wchance(G.items[itGold], 5))
        c.monst = hrand(3) ? moTroll : moGoblin;

      else if (c.land === laBull && wchance(G.items[itBull], 40))
        c.monst = moGadfly;

      else if (G.items[itBull] >= 50 && isize(G.butterflies) && wchance(G.items[itBull] - 49, 25))
        c.monst = moGadfly;

      else if (c.land === laPrairie && G.cwt.at.LHU.fi.flowerdist > 3 && wchance(G.items[itGreenGrass], prairie_isriver(G.cwt.at) ? 150 : 40))
        c.monst = moGadfly;

      else if (c.land === laHive && wchance(hive_hivehard(), 25))
        c.monst = hive_randomHyperbug();

      else if (c.land === laDeadCaves && wchance(G.items[itSilver], 5))
        c.monst = hrand(20) ? (hrand(3) ? moDarkTroll : moGoblin) : moEarthElemental;

      else if (c.land === laJungle && wchance(G.items[itRuby], 40))
        c.monst = hrand(10) ? moMonkey : moEagle;

      else if (c.land === laCursed && wchance(G.items[itCursed], 40))
        c.monst = moHexer;

      else if (c.land === laMirrorOld && wchance(G.items[itShard], 15))
        c.monst = hrand(10) ? moRanger : moEagle;

      else if (c.land === laMirror && G.mirrorspirits) {
        G.mirrorspirits--;
        c.monst = moMirrorSpirit;
      }

      else if (c.land === laMirror && wchance(G.items[itShard], 120))
        c.monst = moNarciss;

      else if (c.land === laWarpCoast && wchance(G.items[itCoral], 40))
        c.monst = moRatling;

      else if (c.land === laBurial && wchance(G.items[itBarrow], 250))
        c.monst = moDraugr;

      else if (c.land === laBlizzard && wchance(G.items[itBlizzard], 120))
        c.monst = hrand(5) ? moVoidBeast : moIceGolem;

      else if (c.land === laVolcano && wchance(G.items[itLavaLily], 120)) {
        c.monst = hrand(5) ? moLavaWolf : moSalamander;
        c.hitpoints = 3;
      }

      else if (c.land === laTrollheim && wchance(G.items[itTrollEgg], 150))
        c.monst = pickTroll(c);

      else if (c.land === laRose && wchance(G.items[itRose], 25))
        c.monst = moFalsePrincess;

      else if (c.land === laHell && wchance(G.items[itHell], 20))
        c.monst = hrand(3) ? moLesser : moGreater;

      else if (c.land === laStorms && wchance(G.items[itFulgurite], 30)) {
        c.monst = hrand(3) ? moMetalBeast : moStormTroll;
        c.hitpoints = 3;
      }

      else if (c.land === laWhirlwind && wchance(G.items[itWindstone], 30))
        c.monst = hrand(5) ? moWindCrow : moAirElemental;

      else if (c.land === laWildWest && wchance(G.items[itBounty], 30))
        c.monst = moOutlaw;

      else if (c.land === laEndorian && c.wall === waTrunk && wchance(G.items[itApple], 30))
        c.monst = moResearcher;

      else if (c.land === laOvergrown && wchance(G.items[itMutant], 50))
        c.monst = moForestTroll;

      else if (c.land === laTerracotta && wchance(G.items[itTerra], 40))
        c.monst = moJiangshi;

      else if (c.land === laTerracotta && G.wandering_jiangshi && genturn) {
        G.wandering_jiangshi--; c.monst = moJiangshi;
      }

      else if (c.land === laSwitch && wchance(G.items[itSwitch], 80))
        c.monst = active_switch();

      else if (c.land === laRuins && wchance(G.items[itRuins], 80)) {
        c.monst = genRuinMonster(c);
        c.hitpoints = 3;
      }

      else if (c.land === laEclectic && wchance(G.items[itEclectic], 20)) {
        gen_eclectic_monster(c);
      }

      else if (c.land === laCaribbean && wchance(G.items[itPirate], 30))
        c.monst = moPirate;

      else if (c.land === laRlyeh && wchance(G.items[itStatue], 15))
        c.monst = hrand(3) ? moPyroCultist :
          (hrand(40) < G.items[itStatue] - 25) ? moCultistLeader : moCultist;

      else if (c.land === laGraveyard && wchance(G.items[itBone], 15))
        c.monst = hrand(5) ? moGhost : moNecromancer;

      else if (isHaunted(c.land) && wchance(G.items[itLotus], 15))
        c.monst = moGhost;

      else if (c.land === laDryForest && wchance(G.items[itFernFlower], 5))
        c.monst = hrand(5) ? moHedge : moFireFairy;

      else if (c.land === laCocytus && wchance(G.items[itSapphire], 45))
        c.monst = moCrystalSage;

      else if (c.land === laAlchemist && wchance(G.items[itElixir], 3) && canReachPlayer(c, moSlime) && c.item === itNone)
        c.monst = moSlime; // ?

      else if (isElemental(c.land) && wchance(G.items[itElemental], 20) && !G.peace_on)
        c.monst = elementalOf(c.land);

      else if (c.land === laIvoryTower && wchance(G.items[itIvory], 20))
        c.monst = cellEdgeUnstable(c) ? moGargoyle : moFamiliar;

      else if (c.land === laMinefield && wchance(G.items[itBombEgg] - 20, 400))
        c.monst = moBomberbird;

      else if (c.land === laEmerald && wchance(G.items[itEmerald], 5))
        c.monst = emerald_monster();

      else if (c.land === laWineyard && wchance(G.items[itWine], 10)) {
        c.monst = moVineBeast;
      }

      else if (c.land === laPalace && wchance(G.items[itPalace], 50)) {
        const dist = princess_dist(c);
        if (dist < 7) break;
        if (dist < OUT_OF_PRISON && !G.princess_challenge) break;

        if (G.items[itPalace] >= 15 && hrand(100) < 10)
          c.monst = moVizier;
        else if (G.items[itPalace] >= 5 && hrand(100) < 50)
          c.monst = hrand(2) ? moFatGuard : moSkeleton;
        else c.monst = moPalace;
        c.hitpoints = palaceHP();
      }

      else if (c.land === laLivefjord && wchance(G.items[itFjord], 10)) {
        c.monst = sphere() ? pick(moViking, moWaterElemental, moFjordTroll) : moViking;
      }

      else if (c.land === laOcean && wchance(G.items[itCoast], 100)) {
        c.monst = moAlbatross;
      }

      else if (c.land === laPower && wchance(G.items[itPower], 10)) {
        c.monst = moWitch + hrand(NUMWITCH);
      }

      else if (c.land === laCamelot && hrand(30) === 0 && (euclid() || c.master.alt) && celldistAltRelative(c) < 0)
        c.monst = camelot_monster();

      else if (isCrossroads(c.land) && G.items[itHyperstone] && wchance(G.items[itHyperstone], 20)) {
        c.monst = wanderingCrossroadsMonster();
        c.hitpoints = palaceHP();
      }

      else break;

      playSeenSound(c);
      if (c.monst === moWorm || c.monst === moHexSnake) c.mondir = NODIR;

      // laMotion -> no respawn!
    }
  } finally { pd.destroy(); }
}

export function generateSnake(c: cell, i: number, snakecolor: number): void {
  c.monst = moHexSnake;
  c.hitpoints = snakecolor;
  const cpair = (1 << pattern_threecolor(c)) | (1 << pattern_threecolor(c.move(i)));
  preventbarriers(c);
  let len = BITRUNCATED() ? ROCKSNAKELENGTH : 2;
  let c2 = c;
  const rocksnake: cell[] = [];
  while (--len) {
    rocksnake.push(c2);
    preventbarriers(c2);
    c2.mondir = i;
    createMov(c2, i);
    const j = c2.c.spin(i);
    const c3 = c2.move(i);
    if (c3.monst || c3.bardir !== NODIR || c3.wall) break;
    c2 = c3;
    c2.monst = moHexSnakeTail; c2.hitpoints = snakecolor;
    let t = c2.type;
    if (mhybrid()) t -= 2;
    i = (j + (t % 4 === 0 ? idiv(t, 2) : (len % 2 ? 2 : t - 2))) % t;
    createMov(c2, i);
    if (!inpair(c2.move(i), cpair)) {
      const goodsteps: number[] = [];
      for (let k = 0; k < t; k++)
        if (inpair(c2.cmove(k), cpair))
          goodsteps.push(k);
      if (!isize(goodsteps)) break;
      i = goodsteps[hrand(isize(goodsteps))];
    }
  }
  if (isize(rocksnake) < ROCKSNAKELENGTH / 2 && BITRUNCATED()) {
    for (let k = 0; k < isize(rocksnake); k++)
      rocksnake[k].monst = moNone;
  }
  else c2.mondir = NODIR;
}
