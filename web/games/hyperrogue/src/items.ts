// items.cpp of HyperRogue 13.1o: routines related to items. Package P2.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// hiitems (map<modecode_t, array<int, ittypes>>) is a Map in G; `hiitems[xc]` (operator[], which inserts a zero
// array) is `hiitems_at(xc)`.
import { G } from './globals.ts';
import { among, isize, YDIST } from './hyper.ts';
import { cell, cellwalker, movei, match, NODIR } from './locations.ts';
import {
  type eItem, ittypes, iinf, IC_ORB, IC_TREASURE, ZERO,
  itNone, itOrbFish, itOrbAether, itOrbYendor, itCompass, itCurseRepulsion, itOrbMagnetism, itOrbSafety, itBuggy,
  itBuggy2, itCurseGluttony, itPalace, itDodeca, itOrbRecall, itOrbFire, itOrbWinter, itOrbSpeed, itRevolver,
  itOrbChoice, itOrbPurity, itOrbSlaying, itOrbTime, itOrbTeleport, itOrbFrog, itOrbPhasing, itOrbDash,
  itOrbIntensity, itOrbLife, itOrbFriend, itBabyTortoise, itHolyGrail, itKey, itTreat, itBarrow, itElemental,
  itApple, itBombEgg, itSavedPrincess, itGreenStone, itLotus, itFireShard, itAirShard, itWaterShard,
  itEarthShard, itBounty, itHyperstone, itShard, itGrimoire, itOrbLove, itHunting, itSpice, itKraken, itElixir,
  itRuby, itFeather, itHell, itBone, itIvory, itStatue, itDiamond, itFernFlower, itEmerald, itOrbInvis,
  laHunting, laAsteroids, laCrossroads, laMinefield, laMotion, laHell, laRedRock, laMountain, laDungeon, laTemple,
  laEmerald, laCamelot, laCursed,
  moDeadBird, moGolem, moTameBomberbird, waFloorA, waFloorB, waNone,
} from './content.ts';
import { U5, U10, R10, R30, R60 } from './content-req.ts';
import {
  isWatery, isWall, itemclass, isRevivalOrb, isElementalShard, is_mirrorland, isHaunted,
} from './flags.ts';
import { changes, isPlayerOn, singlepos, fail_survivalist, playerInWater } from './pcmove.ts';
import { addMessage } from './basegraph.ts';
import { XLAT, spI, spL } from './language.ts';
import { its } from './hprint.ts';
import { playSound } from './sound.ts';
import { animateMovement, animate_item_throw, drawBubble, LAYER_BOAT } from './animations.ts';
import { isNeighbor, celldistAlt } from './cell.ts';
import { passable, P_MONSTER } from './passable.ts';
import { moveEffect } from './monstermove.ts';
import { saved_tortoise_on, multiRevival, saveRecall, placeGolem, activateSafety } from './game.ts';
import { isShmupLifeOrb, orbcharges, markOrb, intensify } from './orbs.ts';
import { newRoundTableRadius, temple_layer_size } from './bigstuff.ts';
import { halloween_getTreat, tortoise_seek, tortoise_move_baby } from './complex.ts';
import { ambush_ambush, ambush_size } from './complex2.ts';
import { spill } from './attack.ts';
import {
  treasureType, landUnlocked, rlyehComplete, in_full_game, lands_for_hell, isLandIngame, ls_any_chaos, ls_single,
} from './landlock.ts';
import { achievement_collection, achievement_count, achievement_victory, achievement_gain_once } from './achievement.ts';
import { yendor_state, ysUnlocked, yendor_collected, yendor_check, peace_simon_extend, peace_simon_restore, modecode } from './yendor.ts';
import { shmup_visibleFor, shmup_boatAt } from './shmup.ts';
import { playergender } from './config.ts';
import { closed_or_bounded, eubinary, WDIM } from './classes.ts';
import { rg_chaos } from './system.ts';

// G.currentLocalTreasure, G.items, G.cheat_items, G.cheat_items_enabled, G.hiitems (globals.ts)

/** hiitems[xcode] (std::map::operator[]: inserts a zero array) */
export function hiitems_at(xcode: number): number[] {
  let a = G.hiitems.get(xcode);
  if (!a) { a = new Array<number>(ittypes).fill(0); G.hiitems.set(xcode, a); }
  return a;
}

export function pickable_from_water(it: eItem): boolean {
  return among(it, itOrbFish, itOrbAether);
}

export function cannotPickupItem(c: cell, telekinesis: boolean): boolean {
  if (pickable_from_water(c.item) && isWatery(c)) return false;
  return itemHidden(c) && !telekinesis && !(isWatery(c) && (markOrb(itOrbFish) || markOrb(itOrbAether)));
}

export function canPickupItemWithMagnetism(c: cell, from: cell): boolean {
  if (!c.item || c.item === itOrbYendor || isWall(c) || cannotPickupItem(c, false))
    return false;
  if (c.item === itCompass && from.item)
    return false;
  if (saved_tortoise_on(c))
    return false;
  return true;
}

export function doPickupItemsWithMagnetism(c: cell): boolean {
  /* repulsion works first -- Magnetism will collect the item if not repulsed */
  if (G.items[itCurseRepulsion])
    for (let i = 0; i < c.type; i++) {
      const c3 = c.move(i); if (!c3) continue;
      if (c3.item) {
        const cw = new cellwalker(c, i);
        cw.addStep();
        for (let j = 1; j < c3.type; j++) {
          const c4 = cw.plus(j).peek();
          if (!isNeighbor(c, c4) && c3.item && !c4.item && !saved_tortoise_on(c3) && passable(c4, c3, ZERO)) {
            changes.ccell(c3);
            changes.ccell(c4);
            moveItem(c3, c4, false);
            animateMovement(match(c3, c4), LAYER_BOAT);
            moveEffect(new movei(c4, c4, NODIR), moDeadBird);
            markOrb(itCurseRepulsion);
          }
        }
      }
    }
  let csaf: cell = null!;
  if (G.items[itOrbMagnetism])
    for (let i = 0; i < c.type; i++) {
      const c3 = c.move(i); if (!c3) continue;
      if (canPickupItemWithMagnetism(c3, c)) {
        changes.ccell(c3);
        changes.ccell(c);
        if (c3.item === itCompass) {
          if (!c.item)
            moveItem(c3, c, false);
        }
        else if (c3.item === itOrbSafety || c3.item === itBuggy || c3.item === itBuggy2)
          csaf = c3;
        else if (markOrb(itOrbMagnetism)) {
          const it = c3.item;
          collectItem(c3, c3, false);
          if (!c3.item)
            animate_item_throw(c3, c, it);
        }
      }
    }
  if (csaf)
    return collectItem(csaf, csaf, false);
  return false;
}

export function pickupMovedItems(c: cell, from: cell): void {
  if (!c.item) return;
  if (c.item === itOrbSafety) return;
  if (isPlayerOn(c)) collectItem(c, from, true);
  if (G.items[itOrbMagnetism])
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i); if (!c2) continue;
      if (isPlayerOn(c2) && canPickupItemWithMagnetism(c, c2)) {
        changes.ccell(c2);
        changes.ccell(c);
        collectItem(c, c2, true);
      }
    }
}

export function in_lovasz(): boolean {
  return G.specialland === laMotion && closed_or_bounded() && ls_single() /* && !daily::on (CAP_DAILY=0) */;
}

export function threshold_met(i: number): number {
  for (const a of [500, 250, 100, 50, 25, 10, 5])
    if (i >= a) return a;
  return 0;
}

export function collectItem(c2: cell, last: cell, telekinesis = false): boolean {
  const items = G.items;
  let dopickup = true;
  let had_choice = false;

  if (G.shmup_on && !G.canmove) return false;

  if (cannotPickupItem(c2, telekinesis))
    return false;

  if (items[itCurseGluttony] && c2.item) {
    addMessage(XLAT('%The1 is consumed!', spI(c2.item)));
    playSound(c2, 'apple');
    items[itCurseGluttony] = 0;
    c2.item = itNone;
    return false;
  }

  /* if(c2->item == itHolyGrail && telekinesis)
    return false; */

  if (c2.item) {
    G.invismove = false;
    if (G.shmup_on) shmup_visibleFor(2000);
    // string s0 = "";

    if (c2.item === itPalace && items[c2.item] === 12)
      changes.value_set(G, 'princess_forceVizier', true);

    if (!cantGetGrimoire(c2, false)) collectMessage(c2, c2.item);
    if (c2.item === itDodeca && G.peace_on) peace_simon_extend();
  }

  // CAP_COMPLEX2
  if (c2.land === laHunting && c2.item && !G.inv_activating) {
    ambush_ambush(c2, ambush_size(c2, c2.item));
  }

  if (isRevivalOrb(c2.item) && G.multi_revive_queue.length) {
    multiRevival(last, c2);
  }
  else if (isShmupLifeOrb(c2.item) && G.shmup_on) {
    playSound(c2, 'pickup-orb'); // TODO summon
    gainLife();
  }
  else if (orbcharges(c2.item)) {
    let it = c2.item;
    if (it === itOrbRecall && !G.dual_state) {
      const cw2 = G.cwt.clone();
      cw2.inc();
      cw2.at = c2;
      saveRecall(cw2);
    }
    if (it === itOrbFire) playSound(c2, 'fire');
    else if (it === itOrbFire) playSound(c2, 'fire');
    else if (it === itOrbWinter) playSound(c2, 'pickup-winter');
    else if (it === itOrbSpeed) playSound(c2, 'pickup-speed');
    else if (it === itRevolver) playSound(c2, 'pickup-key');
    else playSound(c2, 'pickup-orb');
    had_choice = !!items[itOrbChoice];

    if (it === itOrbPurity) {
      let no_curses = true;
      for (const c of G.dcal) if (c.land === laCursed) no_curses = false;
      if (no_curses) {
        items[itOrbSpeed] += 5;
        items[itOrbWinter] += 5;
        items[itOrbSlaying] += 5;
        items[itOrbTime] += 5;
        items[itOrbMagnetism] += 5;
        items[itOrbChoice] += 5;
      }
    }

    if (had_choice) items[itOrbChoice] = 0;

    let oc = orbcharges(it);
    if (G.dual_state && among(it, itOrbTeleport, itOrbFrog, itOrbPhasing, itOrbDash, itOrbRecall)) {
      oc = 10;
      it = itOrbSpeed;
    }
    if (c2.land === laAsteroids) oc = 10;
    if (markOrb(itOrbIntensity)) oc = intensify(oc);
    if (!items[it]) items[it]++;
    items[it] += oc;
  }
  else if (c2.item === itOrbLife) {
    playSound(c2, 'pickup-orb'); // TODO summon
    placeGolem(last, c2, moGolem);
    if (G.cwt.at.monst === moGolem) G.cwt.at.stuntime = 0;
  }
  else if (c2.item === itOrbFriend) {
    playSound(c2, 'pickup-orb'); // TODO summon
    placeGolem(last, c2, moTameBomberbird);
    if (G.cwt.at.monst === moTameBomberbird) G.cwt.at.stuntime = 0;
  }
  // CAP_TOUR
  else if (G.tour_on && (c2.item === itOrbSafety || c2.item === itOrbRecall)) {
    addMessage(XLAT('This Orb is not compatible with the Tutorial.'));
    if (changes.on) changes.rollback();
    return true;
  }
  else if (c2.item === itOrbSafety) {

    if (changes.on) {
      if (changes.checking) {
        changes.rollback();
        return true;
      }
      changes.commit();
    }

    playSound(c2, 'pickup-orb'); // TODO safety
    if (!G.dual_state) items[c2.item] = 7;
    if (G.shmup_on || G.multi_players > 1) {
      G.shmup_delayed_safety = true;
      G.shmup_delayed_safety_land = c2.land;
      c2.item = itNone;
    }
    else
      activateSafety(c2.land);
    return true;
  }
  else if (c2.item === itBabyTortoise) {
    const babymap = G.tortoise_babymap;
    if (!babymap.has(c2)) babymap.set(c2, 0); // operator[]
    const bnew = babymap.get(c2)!;
    changes.map_value(babymap, c2);
    babymap.delete(c2);
    const bold = G.tortoise_seekbits;
    changes.value_set(G, 'tortoise_seekbits', bnew);
    changes.value_set(G, 'tortoise_last', G.tortoise_seekbits);
    if (tortoise_seek()) {
      const c = passable(last, null!, 0n) ? last : c2;
      changes.ccell(c);
      c.item = itBabyTortoise;
      if (c === c2) dopickup = false;
      changes.map_value(babymap, c);
      babymap.set(c, bold);
    }
    else items[itBabyTortoise]++;
  }
  else if (c2.item === itOrbYendor && G.peace_on) {
    if (!items[itDodeca]) {
      addMessage(XLAT('Collect as many Dodecahedra as you can, then return here!'));
    }
    else {
      addMessage(XLAT('Your score: %1', its(items[itDodeca])));
      peace_simon_restore();
    }
    dopickup = false;
  }
  else if (c2.item === itOrbYendor && yendor_state(c2) !== ysUnlocked) {
    dopickup = false;
  }
  else if (c2.item === itOrbYendor)
    yendor_collected(c2);
  else if (c2.item === itHolyGrail) {
    playSound(c2, 'tada');
    const v = newRoundTableRadius() + 12;
    items[itOrbTeleport] += v;
    items[itOrbSpeed] += v;
    items[itHolyGrail]++;
    addMessage(XLAT('Congratulations! You have found the Holy Grail!'));
    if (!eubinary() && c2.master.alt) {
      changes.value_keep(c2.master.alt, 'emeraldval');
      c2.master.alt.emeraldval |= GRAIL_FOUND;
    }
    achievement_collection(c2.item);
  }
  else if (c2.item === itKey) {
    playSound(c2, 'pickup-key');
    for (let i = 0; i < isize(G.yendor_yi); i++) if (G.yendor_yi[i].actual_key() === c2)
      changes.value_set(G.yendor_yi[i], 'found', true);
    items[itKey]++;
  }
  else if (!telekinesis && cantGetGrimoire(c2)) {
    // telekinesis checks the condition earlier
    dopickup = false;
  }
  else if (c2.item === itCompass) {
    dopickup = false;
  }
  else if (c2.item === itBuggy || c2.item === itBuggy2) {

    if (changes.on) {
      if (changes.checking) {
        changes.rollback();
        return true;
      }
      changes.commit();
    }

    items[itOrbSafety] += 7;
    if (G.shmup_on)
      G.shmup_delayed_safety = true;
    else {
      G.buggyGeneration = false;
      activateSafety(laCrossroads);
    }
    return true;
  }
  else if (c2.item === itTreat) {
    playSound(c2, 'pickup-scroll');
    halloween_getTreat(c2);
  }
  else {
    const q = items[c2.item];
    const q_el = items[itElemental];

    if (c2.item === itBarrow)
      for (let i = 0; i < barrowCount(c2); i++) gainItem(c2.item);
    else if (c2.item) gainItem(c2.item);

    if (c2.item && items[c2.item] > q && (G.vid.bubbles_all || (threshold_met(items[c2.item]) > threshold_met(q) && G.vid.bubbles_threshold))) {
      drawBubble(c2, iinf[c2.item].color, its(items[c2.item]), 0.5);
    }

    if (c2.item && items[itElemental] > q_el && (G.vid.bubbles_all || (threshold_met(items[itElemental]) > threshold_met(q_el) && G.vid.bubbles_threshold))) {
      drawBubble(c2, iinf[itElemental].color, its(items[itElemental]), 0.5);
    }

    if (c2.item) {
      const ch = String.fromCharCode(iinf[c2.item].glyph);
      if (ch === '*') playSound(c2, 'pickup-gem');
      else if (ch === '$' || ch === 'x') playSound(c2, 'pickup-gold');
      else if (ch === '%' || ch === ';') playSound(c2, 'pickup-potion');
      else if (c2.item === itApple) playSound(c2, 'apple');
      else playSound(c2, 'pickup-scroll');
    }
  }

  if (dopickup && c2.item) {
    // CAP_HISTORY
    const dummy = c2.item;
    G.history_findhistory.push([c2, dummy]);

    if (c2.item === itBombEgg && c2.land === laMinefield) {
      c2.landparam |= 2;
      c2.landparam &= ~1;
    }

    if (!had_choice)
      c2.item = itNone;
  }
  //    if(c2->land == laHive)
  //      c2->heat = 1;

  let numOrb = 0;
  for (let i = 0; i < ittypes; i++)
    if (itemclass(i) === IC_ORB && items[i])
      numOrb++;
  if (numOrb) achievement_count('ORB', numOrb, 0);

  if (G.princess_reviveAt && gold(NO_LOVE) >= G.princess_reviveAt && !G.inv_on) {
    changes.value_set(G, 'princess_reviveAt', 0);
    items[itSavedPrincess] = 1;
    addMessage('You have enough treasure now to revive the Princess!');
  }

  return false;
}

/** hyper.h GRAIL_FOUND */
export const GRAIL_FOUND = 0x4000;

export function glance_message(): void {
  if (gold() >= 300)
    addMessage(XLAT('You feel great, like a true treasure hunter.'));
  else if (gold() >= 200)
    addMessage(XLAT('Your eyes shine like gems.'));
  else if (gold() >= 100)
    addMessage(XLAT('Your eyes shine as you glance at your precious treasures.'));
  else if (gold() >= 50)
    addMessage(XLAT('You glance at your great treasures.'));
  else if (gold() >= 10)
    addMessage(XLAT('You glance at your precious treasures.'));
  else if (gold() > 0)
    addMessage(XLAT('You glance at your precious treasure.'));
  else
    addMessage(XLAT('Your inventory is empty.'));
}

export function dropGreenStone(c: cell): void {
  const items = G.items;
  if (items[itGreenStone] && !passable(c, null!, P_MONSTER)) {
    // NOTE: PL/CZ translations assume that itGreenStone is dropped to avoid extra forms!
    addMessage(XLAT('Cannot drop %the1 here!', spI(itGreenStone)));
    return;
  }
  if (items[itGreenStone] && c.item === itNone) {
    changes.ccell(c);
    changes.value_keep(items, itGreenStone);
    items[itGreenStone]--;
    // eslint-disable-next-line no-constant-condition
    if (false as boolean) {
      c.item = itNone;
      spill(c, c.wall ^ waFloorA ^ waFloorB, 3);
      addMessage(XLAT('The slime reacts with %the1!', spI(itGreenStone)));
    }
    else {
      c.item = itGreenStone;
      addMessage(XLAT('You drop %the1.', spI(itGreenStone)));
      if (isHaunted(G.cwt.at.land))
        fail_survivalist();
    }
  }
  else {
    if (items[itGreenStone] && c.item === itGreenStone)
      addMessage(XLAT('You juggle the Dead Orbs.'));
    else if (items[itGreenStone] && c.item)
      addMessage(XLAT('You give %the1 a grim look.', spI(c.item)));
    else if (items[itGreenStone]) {
      addMessage(XLAT('Cannot drop %the1 here!', spI(itGreenStone)));
      return;
    }
    else glance_message();
  }
}

export function moveItem1(from: cell, to: cell, activateYendor: boolean): void {
  const yi = G.yendor_yi;
  if (from.item === itOrbYendor) {
    let xnew = true;
    for (let i = 0; i < isize(yi); i++)
      if (yi[i].path[0] === from) xnew = false;
    if (xnew && activateYendor) yendor_check(from);
    for (let i = 0; i < isize(yi); i++)
      if (yi[i].path[0] === from)
        changes.value_set(yi[i].path, 0, to);
  }

  if (from.item === itKey) {
    for (let i = 0; i < isize(yi); i++) if (yi[i].path[YDIST - 1] === from) {
      changes.value_set(yi[i].path, YDIST - 1, to);
    }
    for (let i = 0; i < isize(yi); i++) if (yi[i].actualKey === from)
      changes.value_set(yi[i], 'actualKey', to);
  }

  if (from.item === itBabyTortoise || to.item === itBabyTortoise) {
    tortoise_move_baby(from, to);
  }

  const i = to.item;
  to.item = from.item;
  from.item = i;
}

/** static cell dummy (created on first use: it takes a creation serial, see PORTING.md "Pointer order") */
let moveItem_dummy: cell | null = null;

export function moveItem(from: cell, to: cell, activateYendor: boolean): void {
  if (!moveItem_dummy) moveItem_dummy = new cell(0, null!);
  const dummy = moveItem_dummy;
  dummy.item = itNone;
  moveItem1(from, dummy, activateYendor);
  moveItem1(to, from, activateYendor);
  moveItem1(dummy, to, activateYendor);
}

export function itemHidden(c: cell): boolean {
  return isWatery(c) && !(G.shmup_on && shmup_boatAt(c));
}

export function localTreasureType(): eItem {
  G.lastland = singlepos().land;
  return treasureType(G.lastland);
}

export function countLocalTreasure(): void {
  const i = localTreasureType();
  G.currentLocalTreasure = i ? G.items[i] : 0;
  if (i !== itHyperstone) for (let i = 0; i < isize(G.dcal); i++) {
    const c2 = G.dcal[i];
    if (c2.cpdist > (WDIM() === 3 ? 1 : 3)) break;
    const i2 = treasureType(c2.land);
    if (i2 && G.items[i2] < G.currentLocalTreasure)
      G.currentLocalTreasure = G.items[i2];
  }
}

export const NO_TREASURE = 1;
export const NO_YENDOR = 2;
export const NO_GRAIL = 4;
export const NO_LOVE = 8;

export function gold(no = 0): number {
  const items = G.items;
  let i = 0;
  if (!(no & NO_YENDOR)) i += items[itOrbYendor] * 50;
  if (!(no & NO_GRAIL)) i += items[itHolyGrail] * 10;
  if (!(no & NO_LOVE)) {
    let love = !!items[itOrbLove];
    // CAP_INV
    if (G.inv_on && G.inv_remaining[itOrbLove])
      love = true;
    // CAP_DAILY=0: daily::on dropped
    if (love) i += 30;
  }

  if (!(no & NO_TREASURE))
    for (let t = 0; t < ittypes; t++)
      if (itemclass(t) === IC_TREASURE)
        i += items[t];
  return i;
}

export function maxgold(): number {
  let mg = 0;
  for (let i = 0; i < ittypes; i++)
    if (itemclass(i) === IC_TREASURE && G.items[i] > mg)
      mg = G.items[i];
  return mg;
}

export function updateHi_for_code(it: eItem, v: number, xcode: number): void {
  if (!G.yendor_on)
    if (v > hiitems_at(xcode)[it])
      changes.value_set(hiitems_at(xcode), it, v);
}

export function updateHi(it: eItem, v: number): void {
  if (changes.on) { changes.at_commit(() => updateHi(it, v)); return; }
  updateHi_for_code(it, v, modecode());
}

export function gainItem(it: eItem): void {
  const items = G.items;
  const g = gold();
  const lhu = landUnlocked(laHell);
  const rc = rlyehComplete();
  items[it]++; if (it !== itLotus) updateHi(it, items[it]);
  if (it === itRevolver && items[it] > 6) items[it] = 6;
  achievement_collection(it);
  G.multi_treasures[G.multi_cpid]++;
  // CAP_DAILY=0

  const g2 = gold();
  if (items[itFireShard] && items[itAirShard] && items[itWaterShard] && items[itEarthShard]) {
    items[itFireShard]--;
    items[itAirShard]--;
    items[itWaterShard]--;
    items[itEarthShard]--;
    gainItem(itElemental);
    gainItem(itElemental);
    gainItem(itElemental);
    gainItem(itElemental);
    addMessage(XLAT('You construct some Elemental Gems!', spI(it)) + itemcounter(items[itElemental]));
    playSound(G.cwt.at, 'elementalgem');
  }

  if (it === itBounty)
    items[itRevolver] = 6;

  if (it === itHyperstone && items[itHyperstone] === 10)
    achievement_victory(true);

  if (ls_any_chaos() && gold() >= 300)
    achievement_gain_once('CHAOS', rg_chaos);

  // #if ISMOBILE: the Orb of Safety hint (dropped)

  // #define IF(x) if(g < (x) && g2 >= x && !peace::on)
  const IF = (x: number): boolean => g < x && g2 >= x && !G.peace_on;

  if (in_full_game()) {
    if (IF(Math.trunc(R60() / 4)))
      addMessage(XLAT('Collect treasure to access more different lands...'));
    if (IF(R30()))
      addMessage(XLAT('You feel that you have enough treasure to access new lands!'));
    if (IF(Math.trunc(R30() * 3 / 2)))
      addMessage(XLAT('Collect more treasures, there are still more lands waiting...'));
    if (IF(R60()))
      addMessage(XLAT('You feel that the stars are right, and you can access R\'Lyeh!'));
    if (IF(Math.trunc(R30() * 5 / 2)))
      addMessage(XLAT('Kill monsters and collect treasures, and you may get access to Hell...'));
    if (IF(R10() * 9))
      addMessage(XLAT('To access Hell, collect %1 treasures each of %2 kinds...', its(R10()), its(lands_for_hell())));
    if (landUnlocked(laHell) && !lhu) {
      addMessage(XLAT('Abandon all hope, the gates of Hell are opened!'));
      addMessage(XLAT('And the Orbs of Yendor await!'));
    }
    if (rlyehComplete() && !rc)
      addMessage(XLAT('Cthulhu\'s tentacles reach out upon the world...'));
  }
}

export function itemcounter(qty: number): string {
  let s = ''; s += ' ('; s += its(qty); s += ')'; return s;
}

export function gainShard(c2: cell, msg: string): void {
  G.invismove = false;
  let s = XLAT(msg);
  if (is_mirrorland(c2) && !G.peace_on) {
    collectMessage(c2, itShard);
    gainItem(itShard);
    if (G.vid.bubbles_all || (threshold_met(G.items[itShard]) === G.items[itShard] && G.vid.bubbles_threshold)) {
      drawBubble(c2, iinf[itShard].color, its(G.items[itShard]), 0.5);
    }
    s += itemcounter(G.items[itShard]);
  }
  addMessage(s);
  c2.wall = waNone;
  G.invismove = false;
}

export function placeItems(qty: number, it: eItem): void {
  const dcs = isize(G.dcal);
  for (let i = 1; qty && i < dcs; i++) {
    const c = G.dcal[i];
    if (!c.monst && !c.item && passable(c, null!, 0n))
      c.item = it, qty--;
  }
}

export function cantGetGrimoire(c2: cell, verbose = true): boolean {
  if (ls_any_chaos()) return false;
  if (!eubinary() && !c2.master.alt) return false;
  if (c2.item === itGrimoire && G.items[itGrimoire] > Math.trunc(celldistAlt(c2) / -temple_layer_size())) {
    if (verbose)
      addMessage(XLAT('You already have this Grimoire! Seek new tomes in the inner circles.'));
    return true;
  }
  return false;
}

export function gainLife(): void {
  G.items[itOrbLife]++;
  if (G.items[itOrbLife] > 5 && !G.inv_on) G.items[itOrbLife] = 5;
}

export function collectMessage(c2: cell, which: eItem): void {
  const items = G.items;
  const specialmode = G.yendor_on || G.princess_challenge || !!G.cheater || !in_full_game();
  const ISMOBILE = false, ISMOBWEB = false;

  if (which === itDodeca && G.peace_on) return;
  if (which === itTreat) { /* nothing */ }
  else if (isElementalShard(which)) {
    const tsh =
      items[itFireShard] + items[itAirShard] + items[itWaterShard] + items[itEarthShard] +
      items[itElemental];
    if (tsh === 0) {
      addMessage(XLAT('Collect four different Elemental Shards!'));
      addMessage(XLAT('Unbalanced shards in your inventory are dangerous.'));
    }
    else {
      const t = XLAT('You collect %the1. (%2)', spI(which), its(items[which] + 1));
      addMessage(t);
    }
  }
  else if (which === itKey) {
    addMessage(XLAT('You have found the Key! Now unlock this Orb of Yendor!'));
  }
  else if (which === itGreenStone && !items[itGreenStone])
    addMessage(XLAT('This orb is dead...'));
  else if (which === itGreenStone)
    addMessage(XLAT('Another Dead Orb.'));
  else if (itemclass(which) !== IC_TREASURE) {
    if (!G.inv_activating)
      addMessage(XLAT('You have found %the1!', spI(which)));
  }
  else if (which === itBabyTortoise) {
    playSound(c2, playergender() ? 'speak-princess' : 'speak-prince');
    addMessage(XLAT('Aww, poor %1... where is your family?', spI(which)));
  }
  else if (gold() === 0 && !specialmode)
    addMessage(XLAT('Wow! %1! This trip should be worth it!', spI(which)));
  else if (gold() === 1 && !specialmode)
    addMessage(XLAT('For now, collect as much treasure as possible...'));
  else if (gold() === 2 && !specialmode)
    addMessage(XLAT('Prove yourself here, then find new lands, with new quests...'));
  else if (!items[which] && itemclass(which) === IC_TREASURE)
    addMessage(XLAT('You collect your first %1!', spI(which)));
  else if (items[which] === 4 && maxgold() === U5() - 1 && !specialmode) {
    addMessage(XLAT('You feel that %the2 become%s2 more dangerous.', spI(which), spL(c2.land)));
    addMessage(XLAT('With each %1 you collect...', spI(which), spL(c2.land)));
  }
  else if (items[which] === 9 && maxgold() === 9 && !specialmode) {
    if (G.inv_on) {
      addMessage(XLAT('The treasure gives your magical powers!', spL(c2.land)));
      if (!ISMOBILE)
        addMessage(XLAT('Press \'i\' to access your magical powers.', spL(c2.land)));
    }
    else
      addMessage(XLAT('Are there any magical orbs in %the1?...', spL(c2.land)));
  }
  else if (items[which] === R10() && maxgold() === R10() && !specialmode && !G.inv_on) {
    addMessage(XLAT('You feel that %the1 slowly become%s1 dangerous...', spL(c2.land)));
    addMessage(XLAT('Better find some other place.'));
  }
  else if (which === itHunting && items[itHunting] === 4 && !specialmode && !ISMOBWEB)
    addMessage(XLAT('Hint: hold Alt to highlight enemies and other important features.'));
  else if (which === itSpice && items[itSpice] === Math.trunc(U10() * 7 / 10) && !specialmode && isLandIngame(laHell))
    addMessage(XLAT('You have a vision of the future, fighting demons in Hell...'));
  else if (which === itSpice && items[itSpice] === U10() - 1 && !specialmode && isLandIngame(laRedRock))
    addMessage(XLAT('You will be fighting red rock snakes, too...'));
  else if (which === itKraken && items[itKraken] === U10() - 1 && !specialmode)
    addMessage(XLAT('You feel that a magical weapon is waiting for you...'));
  //  else if(which == itFeather && items[itFeather] == 10)
  //    addMessage(XLAT("There should be a Palace somewhere nearby..."));
  else if (which === itElixir && items[itElixir] === U5() - 1 && !specialmode)
    addMessage(XLAT('With this Elixir, your life should be long and prosperous...'));
  else if (which === itRuby && items[itRuby] === U5() - 1 && !specialmode && isLandIngame(laMountain)) {
    addMessage(XLAT('You feel something strange about gravity here...'));
  }
  else if (which === itPalace && items[itPalace] === U5() - 1 && !specialmode && isLandIngame(laDungeon)) {
    addMessage(XLAT('The rug depicts a man in a deep dungeon, unable to leave.'));
  }
  else if (which === itFeather && items[itFeather] === 25 - 1 && !specialmode && G.inv_on && !ls_any_chaos())
    addMessage(XLAT('You feel the presence of free saves on the Crossroads.'));
  else if (which === itHell && items[itHell] === 25 - 1 && !specialmode && G.inv_on && !ls_any_chaos())
    addMessage(XLAT('You feel the Orbs of Yendor nearby...'));
  else if (which === itHell && items[itHell] === 50 - 1 && !specialmode && G.inv_on && !ls_any_chaos())
    addMessage(XLAT('You feel the Orbs of Yendor in the Crossroads...'));
  else if (which === itHell && items[itHell] === 100 - 1 && !specialmode && G.inv_on && !ls_any_chaos())
    addMessage(XLAT('You feel the Orbs of Yendor everywhere...'));
  else if (which === itBone && items[itBone] % 25 === 24 && !specialmode && G.inv_on)
    addMessage(XLAT('You have gained an offensive power!'));
  else if (which === itHell && items[itHell] >= 100 && items[itHell] % 25 === 24 && !specialmode && G.inv_on)
    addMessage(XLAT('A small reward for braving the Hell.'));
  else if (which === itIvory && items[itIvory] === U5() - 1 && !specialmode && (isLandIngame(laMountain) || isLandIngame(laDungeon))) {
    addMessage(XLAT('You feel attuned to gravity, ready to face mountains and dungeons.'));
  }
  else if (which === itBone && items[itBone] === U5() + 1 && !specialmode && isLandIngame(laHell))
    addMessage(XLAT('The Necromancer\'s Totem contains hellish incantations...'));
  else if (which === itStatue && items[itStatue] === U5() + 1 && !specialmode)
    addMessage(XLAT('The inscriptions on the Statue of Cthulhu point you toward your destiny...'));
  else if (which === itStatue && items[itStatue] === U5() - 1 && isLandIngame(laTemple))
    addMessage(XLAT('There must be some temples of Cthulhu in R\'Lyeh...'));
  else if (which === itDiamond && items[itDiamond] === U10() - 2 && !specialmode)
    addMessage(XLAT('Still, even greater treasures lie ahead...'));
  else if (which === itFernFlower && items[itFernFlower] === U5() - 1 && isLandIngame(laEmerald))
    addMessage(XLAT('You overheard Hedgehog Warriors talking about emeralds...'));
  else if (which === itEmerald && items[itEmerald] === U5() - 1 && !specialmode && isLandIngame(laCamelot))
    addMessage(XLAT('You overhear miners talking about a castle...'));
  else if (which === itEmerald && items[itEmerald] === U5() && !specialmode && isLandIngame(laCamelot))
    addMessage(XLAT('A castle in the Crossroads...'));
  else if (which === itShard) { /* nothing */ }
  else {
    const qty = (which === itBarrow) ? barrowCount(c2) : 1;
    let t: string;
    if (which === itBarrow && items[which] < 25 && items[which] + qty >= 25)
      t = XLAT('Your energy swords get stronger!');
    else if (maxgold() < 25 && items[which] + qty >= 25)
      t = XLAT('You feel even more attuned to the magic of this land!');
    else t = XLAT('You collect %the1. (%2)', spI(which), its(items[which] + qty));
    addMessage(t);
  }
}

export function itemHiddenFromSight(c: cell): boolean {
  return isWatery(c) && !G.items[itOrbInvis] && !(G.items[itOrbFish] && playerInWater())
    && !(G.shmup_on && shmup_boatAt(c)) && !(c.cpdist <= 1 && playerInWater());
}

export function barrowCount(c: cell): number {
  // This should always be 2 or 3.
  // Clamping to exactly that would make bugs go unnoticed.
  // Not clamping at all would lead to freezes when it's absurdly large.
  // Clamping to [1,4] means any incorrect values will be apparent but not game-breaking.
  return Math.min(Math.max(c.landparam, 1), 4);
}

