// game.cpp of HyperRogue 13.1o: basic game routines. Package P7 (player). The random functions of game.cpp
// (hrngen, shrand, hrand, hrandpos, hrandf, chance, hrandstate, hrandom_permutation, pick, hrand_elt...) are in
// rand.ts. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// recallDisplay (display_data: the view at the time the Orb of Recall was saved) is graphics: activateRecall
// does not restore the view (a later stage).
import { animateMovement, drawBubble, LAYER_BOAT, LAYER_SMALL } from './animations.ts';
import { fallMonster, killFriendlyIvy, killMonster } from './attack.ts';
import { addMessage } from './basegraph.ts';
import { clear_euland } from './bigstuff.ts';
import { initcells, neighborId } from './cell.ts';
import { printf } from './cfile.ts';
import { checkmove } from './checkmove.ts';
import {
  kraken_head, mirror_destroyAll, princess_newFakeInfo, princess_save, sword_reset, tortoise_getb, tortoise_mask,
} from './complex.ts';
import { dice_can_roll_mi, dice_data_at, dice_on, dice_roll } from './complex2.ts';
import {
  type eLand, type eMonster, type flagtype, iinf, itBabyTortoise, itBuggy, itCurseWater, itDice, itOrbAether,
  itOrbChoice, itOrbFish, itOrbRecall, itOrbSafety, itOrbWinter, laAlchemist, laCamelot, laClearing, laCrossroads,
  laCrossroads2, laCrossroads5, laDice, laMotion, laOcean, laOvergrown, laRlyeh, laTemple, laWhirlpool, moAngryDie,
  moDragonHead, moFriendlyIvy, moGolem, moHexSnake, moHexSnakeTail, moMutant, moNone, moNorthPole, moPlayer,
  moPrincess, moPrincessArmed, moSouthPole, moSwitch1, moSwitch2, moTameBomberbird, moTentacle, moTentacleEscaping,
  moTentacleGhost, moTentacletail, moTentaclewait, moTortoise, moWorm, moWormtail, moWormwait, waArrowTrap, waBoat,
  waBonfireOff, waChasm, waClosePlate, waCrateCrate, waCrateOnTarget, waCrateTarget, waExplosiveBarrel, waFire,
  waFireTrap, waHappyDie, waMineMine, waNone, waOpenPlate, waRichDie, waShallow, waStrandedBoat, waTempBridge,
  waTempFloor, waThumperOff, waThumperOn,
} from './content.ts';
import { idiv } from './cpp.ts';
import { bfs } from './environment.ts';
import {
  cellUnstable, cellUnstableOrChasm, isAlch, isAnyIvy, isDie, isFire, isKraken, isNonliving, isPrincess, isReptile,
  isWall, isWatery, isWorm,
} from './flags.ts';
import { G } from './globals.ts';
import { drawSafety, restartGraph } from './graph.ts';
import { format, its, pick12 } from './hprint.ts';
import { AF_CRUSH, AF_FALL, among, isize, MD_UNDECIDED } from './hyper.ts';
import { gainItem, gold, threshold_met } from './items.ts';
import { ls_single } from './landlock.ts';
import { spM, spW, XLAT } from './language.ts';
import { cell, type cellwalker, iteration_limit, movei, NODIR, TELEPORT } from './locations.ts';
import { destroyTrapsOn, doesFallSound, in_gravity_zone, makeEmpty, toggleGates_w } from './mapeffects.ts';
import { multi_recall } from './multi.ts';
import { P_AETHER, P_FISH, P_FLYING, P_ISFRIEND, P_MIRROR, P_WATERCURSE, P_WINTER, passable } from './passable.ts';
import { changes, movecost, player_positions, playerMoveEffects } from './pcmove.ts';
import { hrandpos } from './rand.ts';
import { shmup_recall } from './shmup.ts';
import { playSound } from './sound.ts';
import { clearMemory, initgame, saveStats } from './system.ts';

/** Is `w` killed if the part of an ivy `killed` is killed? */
export function isChild(w: cell, killed: cell): boolean {
  if (isAnyIvy(w.monst)) {
    let lim = 0;
    while (w !== killed && w.mondir !== NODIR) {
      lim++; if (lim === 100000) {
        G.childbug = true;
        printf('childbug!\n');
        w.item = itBuggy; break;
      }
      if (!isAnyIvy(w.monst)) {
        return false;
      }
      w = w.move(w.mondir);
    }
  }
  return w === killed;
}

export function active_switch(): eMonster {
  return G.passive_switch ^ moSwitch1 ^ moSwitch2;
}

export function saved_tortoise_on(c: cell): boolean {
  return (c.monst === moTortoise && c.item === itBabyTortoise &&
    !((tortoise_getb(c) ^ map_index(G.tortoise_babymap, c, 0)) & tortoise_mask));
}

/** std::map operator[] for a read: inserts the default value when the key is missing */
export function map_index<K, V>(m: Map<K, V>, k: K, dflt: V): V {
  if (!m.has(k)) { m.set(k, dflt); return dflt; }
  return m.get(k)!;
}

export function normal_gravity_at(c: cell): boolean {
  return !in_gravity_zone(c);
}

export function countMyGolems(m: eMonster): number {
  let g = 0;
  const dcs = isize(G.dcal);
  for (let i = 0; i < dcs; i++) {
    const c = G.dcal[i];
    if (c.monst === m) g++;
  }
  return g;
}

export function savePrincesses(): number {
  const g = 0, dcs = isize(G.dcal);
  for (let i = 0; i < dcs; i++) {
    const c = G.dcal[i];
    if (isPrincess(c.monst)) princess_save(c);
  }
  return g;
}

export function countMyGolemsHP(m: eMonster): number {
  let g = 0;
  const dcs = isize(G.dcal);
  for (let i = 0; i < dcs; i++) {
    const c = G.dcal[i];
    if (c.monst === m) g += c.hitpoints;
  }
  return g;
}

/** restoreGolems(int qty, eMonster m, int hp IS(0)) */
export function restoreGolems(qty: number, m: eMonster, hp = 0): void {
  const dcs = isize(G.dcal);
  for (let i = 1; qty && i < dcs; i++) {
    const c = G.dcal[i];
    if (m === moTameBomberbird ?
      (c.mpdist >= 3 && passable(c, null!, P_FLYING)) :
      passable(c, null!, 0n)) {
      c.hitpoints = idiv(hp, qty);
      c.monst = m, qty--, hp -= c.hitpoints;
      if (m === moPrincess || m === moPrincessArmed)
        princess_newFakeInfo(c);
    }
  }
}

export function activateRecall(): boolean {
  if (!G.recallCell.at) {
    addMessage('Error: no recall');
    return false;
  }
  G.items[itOrbRecall] = 0; G.items[itOrbSafety] = 0;
  if (!makeEmpty(G.recallCell.at)) {
    addMessage(XLAT('Your Orb of Recall is blocked by something big!'));
    G.recallCell.at = null!;
    return false;
  }

  killFriendlyIvy();
  movecost(G.cwt.at, G.recallCell.at, 3);
  playerMoveEffects(new movei(G.cwt.at, G.recallCell.at, TELEPORT));
  mirror_destroyAll();

  sword_reset();

  G.cwt = G.recallCell.clone();
  G.recallCell.at = null!;
  G.flipplayer = true;

  // centerover, View, gmatrix, gmatrix0, which_copy = recallDisplay...: the view (graphics, a later stage)

  makeEmpty(G.cwt.at);
  for (let i = 0; i < G.cwt.at.type; i++) {
    const c2 = G.cwt.at.move(i); if (!c2) continue;
    if (c2.monst !== moMutant)
      c2.stuntime = 4;
  }
  if (G.shmup_on) shmup_recall();
  if (G.multi_players > 1) multi_recall();
  bfs();
  checkmove(false);
  drawSafety();
  addMessage(XLAT('You are recalled!'));
  return true;
}

export function saveRecall(cw2: cellwalker): void {
  if (!G.recallCell.at) {
    changes.value_set(G, 'recallCell', cw2.clone());
    // changes.value_keep(recallDisplay); recallDisplay = *current_display;  (graphics)
  }
}

export function teleportToLand(l: eLand, make_it_safe: boolean): void {
  if (G.recallCell.at && activateRecall())
    return;
  savePrincesses();
  const gg = countMyGolems(moGolem);
  const gb = countMyGolems(moTameBomberbird);
  const gp1 = countMyGolems(moPrincess);
  const gp2 = countMyGolems(moPrincessArmed);
  const gph1 = countMyGolemsHP(moPrincess);
  const gph2 = countMyGolemsHP(moPrincessArmed);
  drawSafety();
  addMessage(XLAT('You fall into a wormhole!'));

  const f = G.firstland;
  if (l === laTemple) l = laRlyeh;
  if (l === laClearing) l = laOvergrown;
  if (l === laWhirlpool) l = laOcean;
  if (l === laCrossroads5) l = laCrossroads2; // could not fit!
  if (l === laCamelot && !ls_single())
    l = laCrossroads;
  G.firstland = l;
  G.safetyland = l;
  G.safetyseed = hrandpos();
  clear_euland(G.firstland);
  G.safety = make_it_safe; G.avengers = 0;
  clearMemory();
  initcells();
  initgame();
  G.firstland = f;
  G.safety = false;
  restoreGolems(gg, moGolem);
  restoreGolems(gb, moTameBomberbird);
  restoreGolems(gp1, moPrincess, gph1);
  restoreGolems(gp2, moPrincessArmed, gph2);
  restartGraph();
}

export function activateSafety(l: eLand): void {
  teleportToLand(l, true);
  // CAP_SAVE
  if (G.casual) {
    saveStats();
    G.savecount++;
    G.save_turns = G.turncount;
  }
  if (G.items[itOrbChoice]) {
    G.items[itOrbChoice] = 0;
    G.cwt.at.item = itOrbSafety;
  }
}

export function placeGolem(on: cell, moveto: cell, m: eMonster): void {
  if (on.monst === moFriendlyIvy)
    killMonster(on, moPlayer);
  if (on.monst) {
    addMessage(XLAT('There is no room for %the1!', spM(m)));
    return;
  }
  if (passable(on, moveto, P_ISFRIEND | (m === moTameBomberbird ? P_FLYING : 0n)))
    on.monst = m;
  else {
    on.monst = m;
    let f: flagtype = AF_CRUSH;
    if (isFire(on))
      addMessage(XLAT('%The1 burns!', spM(m)));
    else if (on.wall === waChasm)
      addMessage(XLAT('%The1 falls!', spM(m))), f = AF_FALL;
    else if (isWatery(on) && isNonliving(m))
      addMessage(XLAT('%The1 sinks!', spM(m))), f = AF_FALL;
    else if (isWatery(on))
      addMessage(XLAT('%The1 drowns!', spM(m))), f = AF_FALL;
    else if (isWall(on))
      addMessage(XLAT('%The1 is crushed!', spM(m)));
    else if (m === moTameBomberbird && G.cwt.at.wall === waBoat)
      return;
    else
      addMessage(XLAT('%The1 is destroyed!', spM(m)));

    printf(format('mondir = %d\n', on.mondir));
    fallMonster(G.cwt.at, f);
  }
}

export function multiRevival(on: cell, moveto: cell): boolean {
  let fl = 0n;
  if (G.items[itOrbAether]) fl |= P_AETHER;
  if (G.items[itCurseWater]) fl |= P_WATERCURSE;
  if (G.items[itOrbFish]) fl |= P_FISH;
  if (G.items[itOrbWinter]) fl |= P_WINTER;
  if (passable(on, moveto, fl)) {
    const id = G.multi_revive_queue[0];
    for (let i = 1; i < isize(G.multi_revive_queue); i++)
      G.multi_revive_queue[i - 1] = G.multi_revive_queue[i];
    G.multi_revive_queue.pop();
    G.multi_player[id].at = on;
    G.multi_player[id].spin = neighborId(moveto, on);
    if (G.multi_player[id].spin < 0) G.multi_player[id].spin = 0;
    G.multi_flipped[id] = true;
    G.multi_whereto[id].d = MD_UNDECIDED;
    sword_reset();
    return true;
  }
  return false;
}

export function checkSwitch(): void {
  G.passive_switch = (gold() & 1) ? moSwitch1 : moSwitch2;
}

export function pushThumper(mi: movei): void {
  const cto = mi.t;
  const th = mi.s;
  const w = th.wall;
  if (th.land === laAlchemist)
    th.wall = isAlch(G.cwt.at) ? G.cwt.at.wall : cto.wall;
  else th.wall = waNone;
  let explode = 0;
  if (cto.wall === waArrowTrap && w === waExplosiveBarrel) explode = Math.max(cto.wparam, 1);
  if (cto.wall === waFireTrap) {
    if (w === waExplosiveBarrel)
      explode = Math.max(cto.wparam, 1);
    if (w === waThumperOn)
      explode = 2;
  }
  if (w === waExplosiveBarrel && cto.wall === waMineMine)
    explode = 2;
  destroyTrapsOn(cto);
  if (cto.wall === waOpenPlate || cto.wall === waClosePlate) {
    toggleGates_w(cto, cto.wall);
    addMessage(XLAT('%The1 destroys %the2!', spW(w), spW(cto.wall)));
  }
  if (cellUnstable(cto) && cto.land === laMotion) {
    addMessage(XLAT('%The1 falls!', spW(w)));
    doesFallSound(cto);
  }
  else if (cellUnstableOrChasm(cto)) {
    addMessage(XLAT('%The1 fills the hole!', spW(w)));
    cto.wall = w === waThumperOn ? waTempFloor : waNone;
    cto.wparam = th.wparam;
    playSound(cto, 'click');
  }
  else if (isWatery(cto)) {
    addMessage(XLAT('%The1 fills the hole!', spW(w)));
    cto.wall = w === waThumperOn ? waTempBridge : waShallow;
    cto.wparam = th.wparam;
    playSound(cto, 'splash' + pick12());
  }
  else if (cto.wall === waShallow) {
    addMessage(XLAT('%The1 fills the hole!', spW(w)));
    cto.wall = waNone;
    playSound(cto, 'splash' + pick12());
  }
  else if (w === waCrateCrate && cto.wall === waCrateTarget) {
    cto.wall = waCrateOnTarget;
    th.wall = waNone;
  }
  else if (w === waCrateOnTarget && cto.wall === waNone) {
    cto.wall = waCrateCrate;
    th.wall = waCrateTarget;
  }
  else if (w === waCrateOnTarget && cto.wall === waCrateTarget) {
    cto.wall = waCrateOnTarget;
    th.wall = waCrateTarget;
  }
  // CAP_COMPLEX2
  else if (isDie(w)) {
    th.wall = waNone;
    cto.wall = w;
    dice_roll(mi);
    if (w === waRichDie && dice_data_at(cto).happy() > 0) {
      cto.wall = waHappyDie;
      if (cto.land === laDice && th.land === laDice) {
        const q = G.items[itDice];
        gainItem(itDice);
        if (G.vid.bubbles_all || (threshold_met(G.items[itDice]) > threshold_met(q) && G.vid.bubbles_threshold)) {
          drawBubble(cto, iinf[itDice].color, its(G.items[itDice]), 0.5);
        }
        addMessage(XLAT('The die is now happy, and you are rewarded!'));
      }
      else {
        addMessage(XLAT("The die is now happy, but won't reward you outside of the Dice Reserve!"));
      }
    }
    if (w === waHappyDie && dice_data_at(cto).happy() <= 0) {
      cto.monst = moAngryDie;
      cto.wall = waNone;
      cto.stuntime = 5;
      addMessage(XLAT('You have made a Happy Die angry!'));
      animateMovement(mi, LAYER_SMALL);
    }
    else
      animateMovement(mi, LAYER_BOAT);
  }
  else
    cto.wall = w;
  if (explode) cto.wall = waFireTrap, cto.wparam = explode;
  if (cto.wall === waThumperOn)
    cto.wparam = th.wparam;
}

export function canPushThumperOn(mi: movei, player: cell): boolean {
  const thumper = mi.s;
  const tgt = mi.t;
  // CAP_COMPLEX2
  if (dice_on(thumper) && !dice_can_roll_mi(mi))
    return false;
  if (tgt.wall === waBoat || tgt.wall === waStrandedBoat) return false;
  if (isReptile(tgt.wall)) return false;
  if (isWatery(tgt) && !tgt.monst)
    return true;
  if (tgt.wall === waChasm && !tgt.monst)
    return true;
  return passable(tgt, thumper, P_MIRROR) &&
    passable(tgt, player, P_MIRROR) &&
    (!tgt.item || dice_on(thumper));
}

export function activateActiv(c: cell, msg: boolean): void {
  if (msg) addMessage(XLAT('You activate %the1.', spW(c.wall)));
  if (c.wall === waThumperOff) {
    playSound(c, 'click');
    c.wall = waThumperOn;
  }
  if (c.wall === waBonfireOff) {
    playSound(c, 'fire');
    c.wall = waFire;
  }
  c.wparam = 100;
}

export function fixWormBug(c: cell): void {
  if (G.history_includeHistory) return;
  printf('worm bug!\n');
  if (c.monst === moWormtail) c.monst = moWormwait;
  if (c.monst === moTentacletail || c.monst === moTentacleGhost) c.monst = moTentacle;
  if (c.monst === moHexSnakeTail) c.monst = moHexSnake;
}

export function isWormhead(m: eMonster): boolean {
  return among(m,
    moTentacle, moWorm, moHexSnake, moWormwait, moTentacleEscaping,
    moTentaclewait, moDragonHead);
}

export function worm_tohead(c: cell): cell {
  for (let i = 0; i < c.type; i++)
    if (c.move(i) && isWorm(c.move(i).monst) && c.move(i).mondir === c.c.spin(i))
      return c.move(i);
  return null!;
}

export function wormhead(c: cell): cell {
  let cnt = 0;
  while (cnt < iteration_limit) {
    if (isWormhead(c.monst))
      return c;
    const c1 = worm_tohead(c);
    if (!c1) break;
    c = c1;
    cnt++;
  }
  fixWormBug(c);
  return c;
}

/** currently works for worms only */
export function sameMonster(c1: cell, c2: cell): boolean {
  if (!c1 || !c2) return false;
  if (c1 === c2) return true;
  if (isWorm(c1.monst) && isWorm(c2.monst))
    return wormhead(c1) === wormhead(c2);
  if (isKraken(c1.monst) && isKraken(c2.monst))
    return kraken_head(c1) === kraken_head(c2);
  return false;
}

export function haveMount(): eMonster {
  for (const pc of player_positions()) {
    const m = pc.monst;
    if (isWorm(m)) return m;
  }
  return moNone;
}

export function otherpole(m: eMonster): eMonster {
  return m ^ moNorthPole ^ moSouthPole;
}
