// inventory.cpp of HyperRogue 13.1o: the Orb Strategy Mode (namespace inv, CAP_INV=1). Package P2.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// inv::show() is the orb screen (package U2); the orb branch of its keyhandler is `inv_keyhandler_orb(uni)`
// (mirroring, activating an orb); `inv_build_orbmap()` is the loop of show() without the drawing (which key
// selects which orb).
import { G } from './globals.ts';
import { isize } from './hyper.ts';
import { itrunc } from './cpp.ts';
import type { cell } from './locations.ts';
import {
  type eItem, ittypes, iinf, IC_ORB, IF_CURSE,
  itPower, itTrollEgg, itFulgurite, itWindstone, itDragon, itSlime, itDodeca, itGreenGrass,
  itOrbFlash, itOrbSpeed, itOrbAether, itOrbWinter, itOrbFish, itOrbStunning, itOrbLuck, itOrbLife, itOrbDigging,
  itOrbSpace, itOrbLightning, itOrbDragon, itOrbShield, itOrbHorns, itOrbThorns, itOrbWater, itOrbSummon,
  itOrbEmpathy, itOrbMatter, itOrbIntensity, itOrbLove, itOrbRecall, itOrbGravity, itOrbImpact, itOrbTime, itOrbAir,
  itOrbUndeath, itOrb37, itOrbDomination, itOrbBull, itOrbInvis, itOrbFire, itOrbIllusion, itOrbDiscord,
  itOrbBeauty, itOrbMirror, itHolyGrail, itHyperstone, itOrbPsi, itOrbFreedom, itOrbSword, itOrbSword2,
  itSavedPrincess, itShard, itDiamond, itGold, itSpice, itRuby, itElixir, itBone, itGreenStone, itHell,
  itOrbYendor, itStatue, itOrbTeleport, itFeather, itOrbSafety, itSapphire, itOrbMorph, itFernFlower, itWine,
  itSilver, itRoyalJelly, itEmerald, itGrimoire, itPirate, itRedGem, itBombEgg,
  itOrbFriend, itCoast, itWhirlpool, itPalace, itFjord, itIvory, itZebra, itOrbFrog, itElemental, itMutant,
  itOrbWoods, itMutant2, itLotus, itRose, itCoral, itBabyTortoise, itOrbShell, itApple, itOrbEnergy, itKraken,
  itBarrow, itOrbStone, itAmethyst, itOrbNature, itOrbDash, itBull, itLavaLily, itOrbLava, itHunting,
  itOrbSide3, itBlizzard, itTerra, itOrbSide1, itGlowCrystal, itOrbSide2, itSwitch, itOrbPhasing, itMagnet,
  itOrbMagnetism, itRuins, itOrbSlaying, itWest, itVarTreasure, itBrownian, itOrbChoice, itFrog, itWet,
  itOrbPlague, itEclectic, itOrbChaos, itCursed, itOrbPurity, itDice, itInventory,
  laPrincessQuest, laDungeon, waMirror, waCloud, waMirrorWall, waCavewall, waNone,
} from './content.ts';
import { mt19937, hrandpos } from './rand.ts';
import { itemclass, classflag, isFriendly, isIvy, isHaunted } from './flags.ts';
import { XLAT, XLAT1, spI, spL } from './language.ts';
import { its } from './hprint.ts';
import { addMessage } from './basegraph.ts';
import { gold, NO_LOVE, gainLife, collectItem } from './items.ts';
import { getOLR, getPrizeLand, olrForbidden } from './orbgen.ts';
import { treasureType, landof, ls_any_chaos } from './landlock.ts';
import { isShmupLifeOrb, orbcharges, checkStunKill, checkFreedom } from './orbs.ts';
import { player_positions, player_indices, playerpos, swordAttackStatic } from './pcmove.ts';
import { earthFloor } from './mapeffects.ts';
import { checkmove } from './checkmove.ts';
import { popScreenAll } from './control.ts';
import { scores_applyBoxNum } from './system.ts';
import { dnameof_i } from './language.ts';
import { createMov } from './cell.ts';
// package U2 (inv::show)
import { idiv, std_sort } from './cpp.ts';
import { itNone } from './content.ts';
import { olrDangerous, olrUseless } from './orbgen.ts';
import { gamescreen, sm, popScreen } from './graph.ts';
import { doexiton } from './control.ts';
import {
  dialog_init_t, dialog_start_list, dialog_addSelItem, dialog_end_list, dialog_addBreak, dialog_addItem,
  dialog_display, dialog_display_bottom_buttons, dialog_handleNavigation, dialog_dialogcolor_over, DB_BACK, DB_HELP,
  DB_PLAIN, DB_EXPLAIN, DB_ACTIVATE,
} from './dialogs.ts';
import { flat_model_enabler, atscreenpos } from './hypgraph.ts';
import { gradient, darkenedby } from './colors.ts';
import { graphglyph } from './hud.ts';
import { initquickqueue, quickqueue, OUTLINE_DEFAULT } from './drawing.ts';
import { drawItemType } from './graph-item.ts';
import { displaystr, displayfr } from './basegraph.ts';
import { gotoHelp, generateHelpForItem } from './help.ts';
import { SDLK_F1 } from './sdl.ts';

// EX bool on; EX array<int, ittypes> usedup, remaining, extra_orbs; EX int rseed; EX bool usedForbidden:
// G.inv_on, G.inv_usedup, G.inv_remaining, G.inv_extra_orbs, G.inv_rseed, G.inv_usedForbidden

/** initialize the OSM data for a new game */
export function inv_init(): void {
  G.inv_rseed = hrandpos();
  G.inv_usedForbidden = false;
  for (let i = 0; i < ittypes; i++) G.inv_usedup[i] = 0;
}

const MIRRORED = 1000;
const TESTMIRRORED = 900;

interface lateextraorb { treasure: eItem; orb: eItem; }

const lateextraorbs: lateextraorb[] = [
  { treasure: itPower, orb: itOrbFlash },
  { treasure: itPower, orb: itOrbSpeed },
  { treasure: itPower, orb: itOrbAether },
  { treasure: itPower, orb: itOrbWinter },

  { treasure: itTrollEgg, orb: itOrbFish },
  { treasure: itTrollEgg, orb: itOrbStunning },
  { treasure: itTrollEgg, orb: itOrbLuck },
  { treasure: itTrollEgg, orb: itOrbLife },
  { treasure: itTrollEgg, orb: itOrbDigging },
  { treasure: itTrollEgg, orb: itOrbSpace },

  { treasure: itFulgurite, orb: itOrbLightning },
  { treasure: itWindstone, orb: itOrbSpeed },
  { treasure: itDragon, orb: itOrbDragon },
  { treasure: itSlime, orb: itOrbFlash },
  { treasure: itDodeca, orb: itOrbShield },

  { treasure: itGreenGrass, orb: itOrbHorns },
  { treasure: itGreenGrass, orb: itOrbShield },
  { treasure: itGreenGrass, orb: itOrbThorns },
];

/** how many orbs can we get from Orb-of-Mirroring orb */
export function inv_mirrorqty0(orb: eItem): number {
  if (G.shmup_on && isShmupLifeOrb(orb))
    return 3;
  if (orb === itOrbWater) return 10;
  if (orb === itOrbSummon) return 9;
  if (orb === itOrbEmpathy) return 9;
  if (orb === itOrbMatter) return 9;
  if (orb === itOrbIntensity) return 8;
  if (orb === itOrbLuck) return 8;
  if (orb === itOrbSpace) return 7;

  if (orb === itOrbWinter) return 6;
  if (orb === itOrbLife) return 6;
  if (orb === itOrbLove) return 6;
  if (orb === itOrbRecall) return 6;
  if (orb === itOrbDigging) return 6;
  if (orb === itOrbGravity) return 6;
  if (orb === itOrbImpact) return 6;

  if (orb === itOrbTime) return 5;
  if (orb === itOrbAir) return 5;
  if (orb === itOrbFish) return 5;
  if (orb === itOrbStunning) return 5;
  if (orb === itOrbUndeath) return 5;
  if (orb === itOrb37) return 5;
  if (orb === itOrbDomination) return 5;
  if (orb === itOrbBull) return 5;
  if (orb === itOrbHorns) return 5;

  if (orb === itOrbAether) return 4;
  if (orb === itOrbInvis) return 4;
  if (orb === itOrbFire) return 4;
  if (orb === itOrbDragon) return 4;
  if (orb === itOrbIllusion) return 4;
  if (orb === itOrbDiscord) return 4;
  if (orb === itOrbBeauty) return 4;

  if (orb === itOrbMirror) return 1;
  return 3;
}

export function inv_mirrorqty(orb: eItem): number {
  if (orb === itOrbMirror) return 1;
  return itrunc(inv_mirrorqty0(orb) * Math.sqrt(1.000001 + G.items[itPower] / 20.));
}

/** PRNG used for calculating how many Orbs you get for your collected treasure */
const invr = new mt19937();

/** initialize hr::inv::invr */
function sirand(i: number): void {
  invr.seed(i);
}

/** get the next random value from hr::inv::invr (invr() is unsigned) */
function irand(i: number): number {
  return (invr.next() >>> 0) % i;
}

// EX eItem whichorbinfo; EX string orbinfoline, extra: G.inv_whichorbinfo, G.inv_orbinfoline, G.inv_extra

function extraline(it: eItem, s: string): string {
  return ' ' + XLAT1(iinf[it].name) + ' (' + s + ')';
}

function gainOrbs(it: eItem, o: eItem): void {
  const qty = G.items[it];
  const remaining = G.inv_remaining;
  if (it === itHolyGrail) {
    remaining[itOrbIllusion] += qty;
    if ((it as number) === itOrbIllusion) { // never true (it == itHolyGrail here): the original's quirk
      G.inv_orbinfoline += XLAT('Unlocked by: %1 in %2', spI(it), spL(landof(it)));
      G.inv_orbinfoline += XLAT(' (next at %1)', its(qty + 1));
    }
  }
  else {
    let nextfound = false;
    const fst = (ls_any_chaos() ? 5 : 10);
    if (qty >= fst) remaining[o]++;
    else {
      if (G.inv_whichorbinfo === o) {
        if (it === itHyperstone) {
          G.inv_extra += extraline(it, its(fst));
        }
        else {
          G.inv_orbinfoline += XLAT('Unlocked by: %1 in %2', spI(it), spL(landof(it)));
          G.inv_orbinfoline += XLAT(' (next at %1)', its(10));
        }
      }
      nextfound = true;
    }
    let last = fst;
    for (let k = 0; k < 30 || !nextfound; k++) {
      let maxstep = ls_any_chaos() ? 10 + 2 * k : 15 + 5 * k;
      if (o === itOrbMirror)
        maxstep += 5 * (k - 1) * (k - 2);
      else
        maxstep += (k - 1) * (k - 2);
      let xnext: number;
      if (k >= 30 || o === itOrbMirror) {
        xnext = last + Math.trunc(maxstep / 2); last = xnext - 1;
        maxstep = 1;
      }
      else
        xnext = last + 1 + irand(maxstep);
      if (xnext > qty && !nextfound) {
        if (G.inv_whichorbinfo === o) {
          if (it === itHyperstone) {
            G.inv_extra += extraline(it, its(last + maxstep));
          }
          else {
            G.inv_orbinfoline += XLAT('Unlocked by: %1 in %2', spI(it), spL(landof(it)));
            if (maxstep === 1)
              G.inv_orbinfoline += XLAT(' (next at %1)', its(last + 1));
            else
              G.inv_orbinfoline += XLAT(' (next at %1 to %2)', its(last + 1), its(last + maxstep));
          }
        }
        nextfound = true;
      }
      if (xnext <= qty) remaining[o]++;
      last = xnext;
    }
  }
}

function nextp2(i: number): number {
  let z = 1;
  while (z <= i) z <<= 1;
  return z;
}

function gainMirrors(forwhich: eItem): void {
  let qtl = G.items[forwhich];
  while (qtl > 0) qtl >>= 1, G.inv_remaining[itOrbMirror]++;
  if (G.inv_whichorbinfo === itOrbMirror)
    G.inv_extra += extraline(forwhich, its(nextp2(G.items[forwhich])));
}

const offensiveOrbs: eItem[] = [
  itOrbFlash, itOrbLightning, itOrbPsi, itOrbThorns,
  itOrbFreedom, itOrbSword, itOrbSword2,
  itOrbHorns, itOrbDragon, itOrbStunning,
];

const elementalOrbs: eItem[] = [itOrbFire, itOrbWater, itOrbDigging, itOrbAir];

const demonicOrbs: eItem[] = [itOrbFire, itOrbHorns, itOrbSummon];

function isIn(o: eItem, l: eItem[]): boolean {
  for (const it of l) if (it === o) return true;
  return false;
}

/** gainRandomOrbs(vector<eItem> orblist, ...): the list is passed by value */
function gainRandomOrbs(orblist0: eItem[], which: eItem, each: number, reduce: number): void {
  const orblist = [...orblist0];
  const qoff = isize(orblist);
  for (let i = 1; i < qoff; i++) {
    const j = irand(1 + i);
    const t = orblist[i]; orblist[i] = orblist[j]; orblist[j] = t;
  }
  for (let i = 0; i < 20; i++) {
    const nextat = (i + 1) * each + reduce;
    if (G.items[which] >= nextat) {
      G.inv_remaining[orblist[i % qoff]]++;
    }
    else {
      if (isIn(G.inv_whichorbinfo, orblist))
        G.inv_extra += extraline(which, its(nextat) + '?');
      break;
    }
  }
}

function gainGuestOrbs(): void {
  for (const oi of G.orbinfos) {
    if (oi.flags & 8 /* orbgenflags::OSM_AT10 */) {
      const it = treasureType(oi.l);
      const fst = ls_any_chaos() ? 5 : 10;
      if (G.items[it] >= fst) {
        G.inv_remaining[oi.orb]++;
      }
      if (G.inv_whichorbinfo === oi.orb) G.inv_extra += extraline(it, its(fst));
    }
  }
}

function gainLove(): void {
  if (G.princess_reviveAt) {
    G.inv_remaining[itOrbLove]++;
    const s = gold(NO_LOVE);
    let last = G.princess_reviveAt;
    for (let k = 0; ; k++) {
      const nextstep = 50 + 20 * k;
      last += nextstep;
      if (last > s) {
        if (G.inv_whichorbinfo === itOrbLove) {
          G.inv_orbinfoline += XLAT('Unlocked by: %1 in %2', spI(itSavedPrincess), spL(laPrincessQuest));
          G.inv_orbinfoline += XLAT(' (next at %1)', its(last));
        }
        break;
      }
      else { last += nextstep; G.inv_remaining[itOrbLove]++; }
    }
  }
}

function gainLate(tr: eItem, orb: eItem): void {
  const at = 10 + irand(41);
  const itr = G.items[tr];
  if (itr >= at) G.inv_remaining[orb]++;
  if (G.inv_whichorbinfo === orb)
    G.inv_extra += extraline(tr, itr >= at ? (its(at) + '!') : '10-50');
}

/** Compute how many orbs you get for your current treasure. This is called after every move, and should give
 *  consistent results */
export function inv_compute(): void {
  const items = G.items, remaining = G.inv_remaining, usedup = G.inv_usedup;
  G.inv_extra = '';
  G.inv_orbinfoline = '';

  for (let i = 0; i < ittypes; i++) remaining[i] = G.inv_extra_orbs[i] - usedup[i];
  for (let i = 0; i < ittypes; i++) if (usedup[i] >= TESTMIRRORED) {
    remaining[i] += MIRRORED;
    remaining[i] -= inv_mirrorqty0(i);
    remaining[i] += inv_mirrorqty(i);
  }

  sirand(G.inv_rseed);

  gainGuestOrbs();

  gainOrbs(itShard, itOrbMirror);
  gainOrbs(itHyperstone, itOrbMirror);
  gainOrbs(itDiamond, itOrbFlash);
  gainOrbs(itGold, itOrbLife);
  gainOrbs(itSpice, itOrbShield);
  gainOrbs(itRuby, itOrbLightning);
  gainOrbs(itElixir, itOrbSpeed);
  gainOrbs(itBone, itGreenStone);
  gainOrbs(itHell, itOrbYendor);
  gainOrbs(itStatue, itOrbTeleport);
  gainOrbs(itFeather, itOrbSafety);
  gainOrbs(itSapphire, itOrbMorph);
  gainOrbs(itFernFlower, itOrbThorns);
  gainOrbs(itWine, itOrbAether);
  gainOrbs(itSilver, itOrbDigging);
  gainOrbs(itRoyalJelly, itOrbInvis);
  gainOrbs(itEmerald, itOrbPsi);
  gainOrbs(itPower, itOrbFire);
  gainOrbs(itHolyGrail, itOrbIllusion);
  gainOrbs(itGrimoire, itOrbDragon);
  gainOrbs(itPirate, itOrbTime);
  gainOrbs(itRedGem, itOrbSpace);
  gainOrbs(itBombEgg, itOrbFriend);
  gainOrbs(itCoast, itOrbEmpathy);
  gainOrbs(itWhirlpool, itOrbWater);
  gainOrbs(itPalace, itOrbDiscord);
  gainOrbs(itFjord, itOrbFish);
  gainOrbs(itSavedPrincess, itOrbLove);
  gainOrbs(itIvory, itOrbMatter);
  gainOrbs(itZebra, itOrbFrog);
  gainOrbs(itElemental, itOrbSummon);
  gainOrbs(itFulgurite, itOrbStunning);
  gainOrbs(itMutant, itOrbWoods);
  gainOrbs(itMutant2, itOrbFreedom);
  gainOrbs(itLotus, itOrbUndeath);
  gainOrbs(itWindstone, itOrbAir);
  gainOrbs(itRose, itOrbBeauty);
  gainOrbs(itCoral, itOrb37);
  gainOrbs(itBabyTortoise, itOrbShell);
  gainOrbs(itApple, itOrbEnergy);
  gainOrbs(itDragon, itOrbDomination);
  gainOrbs(itKraken, itOrbSword);
  gainOrbs(itBarrow, itOrbSword2);
  gainOrbs(itTrollEgg, itOrbStone);
  gainOrbs(itSlime, itOrbRecall);
  gainOrbs(itAmethyst, itOrbNature);
  gainOrbs(itDodeca, itOrbDash);
  gainOrbs(itGreenGrass, itOrbBull);
  gainOrbs(itBull, itOrbHorns);
  if (items[itOrbYendor]) remaining[itOrbMirror]++;
  gainMirrors(itOrbYendor);
  gainMirrors(itHolyGrail);
  gainLove();
  gainRandomOrbs(offensiveOrbs, itBone, 25, 0);
  gainRandomOrbs(elementalOrbs, itElemental, 12, 0);
  gainRandomOrbs(demonicOrbs, itHell, 20, 100);
  gainOrbs(itLavaLily, itOrbLava);
  gainOrbs(itHunting, itOrbSide3);
  gainOrbs(itBlizzard, itOrbWinter);
  gainOrbs(itTerra, itOrbSide1);

  for (const it of lateextraorbs) gainLate(it.treasure, it.orb);

  gainOrbs(itGlowCrystal, itOrbSide2);
  gainOrbs(itSwitch, itOrbPhasing);
  gainOrbs(itMagnet, itOrbMagnetism);
  gainOrbs(itRuins, itOrbSlaying);

  gainOrbs(itWest, itOrbGravity);
  gainOrbs(itVarTreasure, itOrbIntensity);
  gainOrbs(itBrownian, itOrbChoice);

  gainOrbs(itFrog, itOrbImpact);
  gainOrbs(itWet, itOrbPlague);
  gainOrbs(itEclectic, itOrbChaos);

  gainOrbs(itCursed, itOrbPurity);
  gainOrbs(itDice, itOrbLuck);

  // CAP_DAILY=0: daily::gifts();

  if (items[itOrbLove] && !items[itSavedPrincess]) items[itSavedPrincess] = 1;

  // int& r = remaining[itGreenStone];
  if (items[itBone] >= 0) {
    for (let i = 0; i < ittypes; i++) if (i !== itGreenStone) {
      remaining[itGreenStone] += usedup[i];
      if (usedup[i] >= TESTMIRRORED) remaining[itGreenStone] -= (MIRRORED - inv_mirrorqty0(i));
    }
  }

  items[itGreenStone] += remaining[itGreenStone];
  usedup[itGreenStone] += remaining[itGreenStone];
  remaining[itGreenStone] = 0;

  if (G.shmup_on) for (let i = 0; i < ittypes; i++) {
    if (remaining[i] && isShmupLifeOrb(i)) {
      gainLife();
      remaining[i]--;
      usedup[i]++;
    }
  }

  items[itInventory] = 0;
  for (let i = 0; i < ittypes; i++)
    if (i !== itGreenStone && i !== itOrbYendor)
      items[itInventory] += remaining[i];
}

/** map<char, eItem> orbmap */
const orbmap = new Map<number, eItem>();
const orbkeys = 'zfwplSetsTaMIYgCcPOWAFydLGRUkouE.,bVNxDjJZnrvhBm!23456789@#$%()';

let mirroring = false;

/** EX const char* helptext */
export const inv_helptext =
  'You are playing in the Orb Strategy Mode. Collecting treasure ' +
  'gives you access to magical Orb powers. In this mode, ' +
  'unlocking requirements are generally higher, and ' +
  'several quests and lands ' +
  'give you extremely powerful Orbs of the Mirror.\n';

function evokeBeautyAt(c: cell): void {
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    if (c2.monst && !isFriendly(c2.monst) && !isIvy(c2.monst)) {
      c2.stuntime += 3;
      checkStunKill(c2);
    }
  }
}

function evokeOrb(it: eItem): void {
  if (it === itOrbFreedom)
    for (const pc of player_positions())
      checkFreedom(pc);

  if (it === itOrbBeauty) {
    for (const pc of player_positions())
      evokeBeautyAt(pc);
    if (G.items[itOrbEmpathy])
      for (const c of G.dcal) if (isFriendly(c.monst))
        evokeBeautyAt(c);
  }

  if (it === itOrbDigging) {
    const cf = G.cwt.at;
    for (let i = 0; i < cf.type; i++) {
      const c2 = createMov(cf, i);
      earthFloor(c2);
      if (c2.wall === waCavewall && !c2.monst)
        c2.wall = waNone;
    }
  }

  if (it === itOrbSword || it === itOrbSword2) {
    for (const i of player_indices()) {
      G.cwt.at = playerpos(i);
      G.multi_cpid = i;
      swordAttackStatic(it === itOrbSword2 ? 1 : 0);
    }
  }
}

export function inv_osminfo(orb: eItem): string {
  let s = XLAT('Number of uses left: %1', its(G.inv_remaining[orb]));
  let us = G.inv_usedup[orb];
  if (us >= TESTMIRRORED) s += XLAT(' (mirrored)'), us = us - MIRRORED + inv_mirrorqty0(orb);
  if (us) s += XLAT(' (used %1 times)', its(us));
  return s;
}

// EX bool activating, view_help_only: G.inv_activating, G.inv_view_help_only

// typedef pair<int, int> pxy; vector<pxy> orbcoord (package U2: the orb screen)
type pxy = [number, number];
let orbcoord: pxy[] = [];

function sq(p: pxy): number {
  let zz = (2 * p[0] + p[1]) * (2 * p[0] + p[1]) + 3 * p[1] * p[1];
  zz *= 20; zz += Math.abs(p[1]);
  zz *= 20; zz += Math.abs(p[0]);
  zz *= 4; zz += (p[0] > 0 ? 1 : 0) * 2 + (p[1] > 0 ? 1 : 0);
  return zz;
}

let plain = false;

let which: eItem = 0;

/** void show(): the OSM Orb screen (package U2) */
export function inv_show(): void {

  G.multi_cpid = 0; /* just in case */

  const remaining = G.inv_remaining, usedup = G.inv_usedup;
  if (remaining[itOrbSword]) G.items[itOrbSword]++;
  if (remaining[itOrbSword2]) G.items[itOrbSword2]++;
  G.cmode = sm.CENTER | sm.DARKEN;
  gamescreen();
  if (remaining[itOrbSword]) G.items[itOrbSword]--;
  if (remaining[itOrbSword2]) G.items[itOrbSword2]--;

  orbcoord = [];
  for (let y = -3; y <= 3; y++) for (let x = -5; x <= 5; x++) if (x + y <= 6 && x + y >= -6 && (x || y))
    orbcoord.push([x, y]);
  std_sort(orbcoord, (p1, p2) => sq(p1) < sq(p2));

  const rad = idiv(Math.min(G.vid.xres, G.vid.yres), 20);
  const rad3 = Math.trunc(rad * Math.sqrt(3));

  inv_compute();
  orbmap.clear();
  which = itNone;

  if (plain) {
    dialog_init_t(mirroring ? XLAT('mirror what?') : XLAT('inventory'), G.forecolor, 150, 100);
    dialog_start_list(2000, 2000);
  }

  let j = 0, oc = 6;

  {
    const fme = flat_model_enabler();
    try {
      for (let i = 0; i < ittypes; i++) {
        const o = i;
        if (itemclass(o) === IC_ORB && !((classflag(o) & IF_CURSE) !== 0n)) {
          const c = j < orbkeys.length ? orbkeys.charCodeAt(j) : 0; j++;
          // if(c == 0) println(hlog, "missing char for ", dnameof(o));
          if (remaining[i] || usedup[i]) {
            orbmap.set(c, o);
            if (plain)
              dialog_addSelItem(XLAT1(iinf[o].name), its(remaining[i]), c);
            else {
              if (oc >= isize(orbcoord)) {
                // println(hlog, "error: oc=", oc, " with only ", isize(orbcoord), " positions");
                continue;
              }
              const pos = orbcoord[oc++];
              const px = G.current_display.xcenter + 2 * rad * pos[0] + rad * pos[1];
              const py = G.current_display.ycenter + pos[1] * rad3;
              let icol = iinf[o].color;
              if (!remaining[i]) icol = gradient(icol, 0, 0, .5, 1);
              const gg = graphglyph(false);

              const b = Math.hypot(G.mousex - px, G.mousey - py) < rad;

              if (!G.hiliteclick) {
                if (gg) {
                  initquickqueue();
                  G.poly_outline = OUTLINE_DEFAULT();
                  const V = atscreenpos(px, py, rad * 2);
                  drawItemType(o, null, V, icol, idiv(G.ticks, 3) + i * 137, false);
                  quickqueue();
                }

                const s = remaining[i] <= 0 ? 'X' : its(remaining[i]);

                if (G.vid.orbmode < 2) {
                  const tcol = remaining[i] ? darkenedby(icol, 1) : 0;

                  if (remaining[i] !== 1 || !gg)
                    displaystr(Math.trunc(px), Math.trunc(py), 2, gg ? rad : idiv(rad * 3, 2), s, tcol, 8);
                }
                else {
                  if (remaining[i] !== 1 || !gg) {
                    displayfr(Math.trunc(px + rad / 2), Math.trunc(py + rad / 2), 2, gg ? rad : idiv(rad * 3, 2), remaining[i] <= 0 ? 'X' : remaining[i] === 1 ? 'o' : its(remaining[i]), dialog_dialogcolor_over(b), 8);
                  }
                }
              }

              if (b) {
                G.getcstat = c,
                which = o;
              }
            }
          }
        }
      }
    }
    finally { fme.restore(); }
  }

  if (plain) {
    dialog_end_list();
    dialog_addBreak(50);
    dialog_addItem(XLAT('help'), SDLK_F1);
    dialog_addItem(XLAT('return to the game'), 'i'.charCodeAt(0));
    dialog_display();
    if (orbmap.has(G.getcstat)) which = orbmap.get(G.getcstat)!;
  }
  else {
    if (which === itNone) {
      displaystr(idiv(G.vid.xres, 2), G.vid.fsize * 2, 2, G.vid.fsize * 2, XLAT('Which orb to use?'), 0xC0C0C0, 8);
    }
    else {
      const icol = iinf[which].color;
      displaystr(idiv(G.vid.xres, 2), G.vid.fsize * 2, 2, G.vid.fsize * 2, XLAT1(iinf[which].name), icol, 8);

      if (mirroring)
        displaystr(idiv(G.vid.xres, 2), G.vid.fsize * 4, 2, G.vid.fsize, usedup[which] >= TESTMIRRORED ? XLAT('already mirrored') : XLAT('Uses to gain: %1', its(inv_mirrorqty(which))), icol, 8);
      else {
        G.inv_whichorbinfo = which;
        inv_compute();

        displaystr(idiv(G.vid.xres, 2), G.vid.fsize * 4, 2, G.vid.fsize, G.inv_orbinfoline, icol, 8);

        if (G.inv_extra !== '')
          displaystr(idiv(G.vid.xres, 2), G.vid.fsize * 5, 2, G.vid.fsize, XLAT('Extras:') + G.inv_extra, icol, 8);
      }

      if (remaining[which] !== 1 || usedup[which]) {
        displaystr(idiv(G.vid.xres, 2), G.vid.yres - G.vid.fsize * 6, 2, G.vid.fsize, inv_osminfo(which), icol, 8);
      }

      // !ISMOBILE
      let hot = XLAT1('Hotkey: '); hot += String.fromCharCode(G.getcstat & 0xFF);
      displaystr(idiv(G.vid.xres, 2), G.vid.yres - G.vid.fsize * 5, 2, G.vid.fsize, hot, icol, 8);

      const pl = getPrizeLand();
      const olr = getOLR(which, pl);

      let col = 0;
      let fmsg: string | null = null;
      if (olr === olrDangerous)
        col = 0xC00000,
        fmsg = 'Using %the1 in %the2 sounds dangerous...';
      else if (olr === olrUseless)
        col = 0xC00000,
        fmsg = '%The1 is mostly useless in %the2...';
      else if (olr === olrForbidden)
        col = 0x804000,
        fmsg = '%The1 is forbidden in %the2 (disables some achievements)';

      if (fmsg)
        displaystr(idiv(G.vid.xres, 2), G.vid.yres - G.vid.fsize * 4, 2, G.vid.fsize, XLAT(fmsg, spI(which), spL(pl)), col, 8);

    }
  }
  dialog_display_bottom_buttons(0, DB_BACK | DB_HELP | DB_PLAIN | (G.inv_view_help_only ? DB_EXPLAIN : DB_ACTIVATE));
  G.mouseovers = '';
  G.keyhandler = (sym: number, uni: number) => {
    if (plain) { const k = { sym, uni }; dialog_handleNavigation(k); sym = k.sym; uni = k.uni; }

    if (inv_keyhandler_orb(uni)) { /* the orb branch */ }

    else if (uni === '1'.charCodeAt(0)) plain = !plain;
    else if (uni === '2'.charCodeAt(0)) G.inv_view_help_only = !G.inv_view_help_only;
    else if (sym === SDLK_F1)
      gotoHelp(which ? generateHelpForItem(which) : XLAT(inv_helptext));
    else if (doexiton(sym, uni)) {
      if (mirroring) mirroring = false;
      popScreen();
    }
  };
}

/** the part of show() that assigns the keys: compute(), then orbmap */
export function inv_build_orbmap(): void {
  G.multi_cpid = 0; /* just in case */
  inv_compute();
  orbmap.clear();
  let j = 0;
  for (let i = 0; i < ittypes; i++) {
    const o = i;
    if (itemclass(o) === IC_ORB && !((classflag(o) & IF_CURSE) !== 0n)) {
      const c = j < orbkeys.length ? orbkeys.charCodeAt(j) : 0; j++;
      // if(c == 0) println(hlog, "missing char for ", dnameof(o));
      if (G.inv_remaining[i] || G.inv_usedup[i])
        orbmap.set(c, o);
    }
  }
}

/** the orb branch of show()'s keyhandler (`if(orbmap.count(uni)) {...}`); returns false if uni selects no orb */
export function inv_keyhandler_orb(uni: number): boolean {
  if (!orbmap.has(uni)) return false;
  const remaining = G.inv_remaining, usedup = G.inv_usedup;
  const orb = orbmap.get(uni)!;
  if (G.inv_view_help_only) {
    gotoHelp(generateHelpForItem(orb));
  }
  else if (remaining[orb] <= 0) { /* nothing */ }
  else if (orb === itOrbMirror) {
    mirroring = !mirroring;
    // an amusing message
    if (remaining[itOrbMirror] >= 2 && !mirroring)
      addMessage(XLAT('You mirror %the1.', spI(orb)));
    if (mirroring) {
      let next = false;
      const c = G.cwt.at;
      for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i); if (!c2) continue;
        if (c2.wall === waMirror || c2.wall === waCloud || c2.wall === waMirrorWall)
          next = true;
      }
      if (!next) {
        addMessage(XLAT('You need to stand next to a magic mirror or cloud to use %the1.', spI(itOrbMirror)));
        mirroring = false;
      }
    }
  }
  else if (mirroring) {
    if (usedup[orb] >= TESTMIRRORED) {
      addMessage(XLAT('Each orb type can be mirrored only once.'));
      mirroring = false;
    }
    else if (remaining[orb] > 0) {
      usedup[itOrbMirror]++;
      usedup[orb] += MIRRORED;
      usedup[orb] -= inv_mirrorqty0(orb);
      addMessage(XLAT('You mirror %the1.', spI(orb)));
      mirroring = false;
    }
    else mirroring = false;
  }
  else if ((isHaunted(G.cwt.at.land) || G.cwt.at.land === laDungeon) && orb === itOrbSafety) {
    addMessage(XLAT('This would only move you deeper into the trap!'));
  }
  else {
    const it = G.cwt.at.item;
    G.cwt.at.item = orbmap.get(uni)!;
    G.inv_activating = true;
    collectItem(G.cwt.at, G.cwt.at, true);
    G.inv_activating = false;
    addMessage(XLAT('You activate %the1.', spI(orbmap.get(uni)!)));
    if (!G.cwt.at.item) usedup[orbmap.get(uni)!]++;
    if (getOLR(it, getPrizeLand()) === olrForbidden)
      G.inv_usedForbidden = true;
    G.cwt.at.item = it;
    evokeOrb(orbmap.get(uni)!);
    checkmove(false);
    popScreenAll();
  }
  return true;
}

// CAP_SAVE
export function inv_applyBox(it: eItem): void {
  scores_applyBoxNum(G.inv_usedup, it, '@inv-' + dnameof_i(it));
}

// EX int incheck: G.inv_incheck

export function inv_check(delta: number): void {
  G.inv_incheck += delta;
  for (let i = 0; i < ittypes; i++) {
    const it = i;
    if (itemclass(it) === IC_ORB)
      G.items[it] += delta * G.inv_remaining[it] * orbcharges(it);
  }
}
