// debug.cpp of HyperRogue 13.1o (package P8): debugging and cheating -- the cheat keys (applyCheat), the cheat
// teleport (cheatMoveTo), the cheat options of the command line (read_cheat_args: -fixx, -W, -I, ...), and the
// procedural-generation error report. The debug screen and the cheat menu are UI (a later stage): they throw
// NotPorted. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G } from './globals.ts';
import { pref } from './config.ts';
import { NotPorted, isize, addHook, YDIST } from './hyper.ts';
import { printf, exit } from './cfile.ts';
import { type cell, cellwalker, celllister } from './locations.ts';
import {
  type eLand, type eItem, type eMonster, ittypes, motypes, IC_TREASURE, IC_ORB,
  laNone, laCrossroads, laCrossroads5, laJungle, laPalace,
  itDiamond, itEmerald, itElixir, itIvory, itPalace, itOrbFlash, itOrbTeleport, itOrbLightning, itOrbSpeed,
  itOrbShield, itKey, itNone, itSavedPrincess, itOrbSafety, itBarrow, itBuggy, itElemental,
  moYeti, moDesertman, moRunDog, moZombie, moMonkey, moCultist, moTroll, moPlayer,
} from './content.ts';
import { hrand, shrand } from './rand.ts';
import { its } from './hprint.ts';
import { XLAT, dnameof } from './language.ts';
import { addMessage } from './basegraph.ts';
import { celldist, celldistance, isNeighbor } from './cell.ts';
import { itemclass, isMultitile } from './flags.ts';
import { gold, localTreasureType, placeItems, NO_LOVE } from './items.ts';
import { yendor_collected } from './yendor.ts';
import { generateLandList, isLandIngame, treasureType, required_for_hyperstones, bearsCamelot, isCrossroads, landUnlocked } from './landlock.ts';
import { activateSafety, teleportToLand, restoreGolems } from './game.ts';
import { passable, passable_for, buildRosemap } from './passable.ts';
import { update_lastexplore, setdist } from './landgen.ts';
import { mirror_act, mirror_SPINSINGLE } from './complex.ts';
import { isPlayerOn } from './pcmove.ts';
import { inv_compute } from './inventory.ts';
import { WDIM } from './classes.ts';
import { geometry_supports_cdata, getCdata } from './cell.ts';
import { start_game, stop_game, stop_game_and_switch_mode, rg_nothing } from './system.ts';
import {
  arg_argis, arg_shift, arg_args, arg_argi, arg_cheat, arg_readland, arg_readItem, arg_readMonster,
  arg_shift_arg_formula, PHASE, PHASEFROM,
} from './commandline.ts';
import { pushScreen, mainloop } from './control.ts';
import { monsterclass } from './hud.ts';
import { history_save_end } from './history.ts';

// EX int steplimit = 0; EX int cstep; EX bool buggyGeneration = false; EX bool debug_cellnames = false;
// EX vector<cell*> buggycells: G
// (debugflag debug_errors, debug_warnings, ...: the debug log is left out, PORTING.md "Macros")

/** limitgen(args...): the generation step limit of -steplimit */
export function limitgen(s: string): void {
  if (G.steplimit) {
    G.cstep++;
    printf(String(G.cstep).padStart(6, ' ') + ' ');
    printf(s);
    if (G.cstep === G.steplimit) G.buggyGeneration = true;
  }
}

export function pathTowards(pf: cell, pt: cell): cell {

  while (celldist(pt) > celldist(pf)) {
    if (isNeighbor(pf, pt)) return pt;
    let pn: cell = null!;
    for (let i = 0; i < pt.type; i++) { const pn2 = pt.move(i); if (!pn2) continue; if (celldist(pn2) < celldist(pt)) pn = pn2; }
    pt = pn;
  }

  if (isNeighbor(pf, pt)) return pt;
  for (let i = 0; i < pt.type; i++) { const pn2 = pt.move(i); if (!pn2) continue; if (celldist(pn2) < celldist(pt)) return pn2; }
  return null!;
}

let errorReported = false;

/** describeCell: prints to the debug log (left out) */
export function describeCell(c: cell): void {
  if (!c) { printf('NULL\n'); return; }
  // print(hlog, "describe ", lalign(6, c), ": "); println(hlog, ">> ", nei);
}

let orbid = 0;

function nextOrb(): eItem {
  orbid++;
  const i = orbid % ittypes;
  if (itemclass(i) === IC_ORB) return i;
  else return nextOrb();
}

export function randomTreasure(): eItem {
  const i = hrand(ittypes);
  if (itemclass(i) === IC_TREASURE) return i;
  else return randomTreasure();
}

function randomTreasure2(cv: number): eItem {
  let bq = 60000, cq = 0;
  let best: eItem = itDiamond;
  const lt = localTreasureType();
  for (let a = 1; a < ittypes; a++) {
    const i = a;
    if (itemclass(i) !== IC_TREASURE) continue;
    let q = 2 * G.items[i];
    if (a === lt) q -= (2 * cv - 1);
    if (a === itEmerald && bearsCamelot(G.cwt.at.land)) q -= 8;
    if (a === itElixir && isCrossroads(G.cwt.at.land)) q -= 7;
    if (a === itIvory && isCrossroads(G.cwt.at.land)) q -= 6;
    if (a === itPalace && isCrossroads(G.cwt.at.land)) q -= 5;
    if (a === itIvory && G.cwt.at.land === laJungle) q -= 5;
    if (a === itIvory && G.cwt.at.land === laPalace) q -= 5;
    if (q < bq) { bq = q; cq = 0; }
    if (q === bq) { cq++; if (hrand(cq) === 0) best = i; }
  }
  return best;
}

// EX eLand cheatdest: G

export function cheatMoveTo(l: eLand): void {
  G.cheatdest = l;
  if (l === laCrossroads5) l = laCrossroads;
  activateSafety(l);
  G.cheatdest = laNone;
}

interface cheatkey {
  key: number;
  desc: string;
  action: () => void;
}

const ch = (c: string): number => c.charCodeAt(0);

/** linepatterns::showMenu (pattern2.cpp; UI, a later stage) */
function linepatterns_showMenu(): void { throw new NotPorted('linepatterns::showMenu'); }
function mapeditor_showMapEditor(): void { throw new NotPorted('mapeditor::showMapEditor'); }
function mapeditor_showDrawEditor(): void { throw new NotPorted('mapeditor::showDrawEditor'); }

const cheats: cheatkey[] = [
  { key: ch('C'), desc: 'Hyperstone Quest', action: () => {
    G.cheater++;
    cheatMoveTo(laCrossroads);
    addMessage(XLAT('Activated the Hyperstone Quest!'));

    generateLandList(isLandIngame);
    for (const l of G.landlist) {
      const t = treasureType(l);
      if (required_for_hyperstones(t) && itemclass(t) === IC_TREASURE)
        G.items[t] = G.inv_on ? 50 : 10;
    }
    const qkills = G.inv_on ? 1000 : 200;
    G.kills[moYeti] = qkills;
    G.kills[moDesertman] = qkills;
    G.kills[moRunDog] = qkills;
    G.kills[moZombie] = qkills;
    G.kills[moMonkey] = qkills;
    G.kills[moCultist] = qkills;
    G.kills[moTroll] = qkills;
  } },
  { key: ch('H'), desc: 'toggle hold of orb powers', action: () => {
    if (G.cheat_items_enabled) {
      G.cheat_items_enabled = false;
      addMessage(XLAT('Hold of orb powers disabled!'));
    }
    else {
      G.cheat_items = [...G.items];
      G.cheat_items_enabled = true;
      G.cheater++;
      addMessage(XLAT('Hold of orb powers enabled!'));
    }
  } },
  { key: ch('M'), desc: 'deplete orb powers', action: () => {
    for (let i = 0; i < ittypes; i++)
      if (itemclass(i) === IC_ORB)
        G.items[i] = 0;
    G.cheater++; addMessage(XLAT('Orb power depleted!'));
  } },
  { key: ch('O'), desc: 'summon orbs', action: () => {
    G.cheater++; addMessage(XLAT('Orbs summoned!'));
    for (let i = 0; i < G.cwt.at.type; i++)
      if (passable(G.cwt.at.move(i), null!, 0n)) {
        const it = nextOrb();
        G.cwt.at.move(i).item = it;
      }
  } },
  { key: ch('F'), desc: 'gain orb powers', action: () => {
    if (G.hardcore && !G.canmove) {
      G.canmove = true;
      addMessage(XLAT('Revived!'));
    }
    else {
      G.items[itOrbFlash] += 1;
      G.items[itOrbTeleport] += 1;
      G.items[itOrbLightning] += 1;
      G.items[itOrbSpeed] += 1;
      G.items[itOrbShield] += 1;
      G.kills[moPlayer] = 0;
      G.cheater++; addMessage(XLAT('Orb power gained!'));
      G.canmove = true;
    }
  } },
  { key: ch('R') - 64, desc: 'advance the rose wave', action: buildRosemap },
  // CAP_EDIT
  { key: ch('A'), desc: 'start the Map Editor', action: () => {
    update_lastexplore();
    pushScreen(mapeditor_showMapEditor);
  } },
  { key: ch('A') - 64, desc: 'start the Vector Graphics Editor', action: () => {
    // mapeditor::drawcell = mouseover ? mouseover : cwt.at;
    pushScreen(mapeditor_showDrawEditor);
  } },
  { key: ch('T'), desc: 'summon treasure', action: () => {
    G.items[randomTreasure2(10)] += 10;
    G.cheater++; addMessage(XLAT('Treasure gained!'));
  } },
  { key: ch('T') - 64, desc: 'summon lots of treasure', action: () => {
    G.items[randomTreasure2(100)] += 100;
    G.cheater++; addMessage(XLAT('Lots of treasure gained!'));
  } },
  { key: ch('Z'), desc: 'rotate the character', action: () => {
    if (G.flipplayer) {
      G.cwt.add(idiv2(G.cwt.at.type));
      G.flipplayer = false;
    }
    G.cwt.add(1);
    mirror_act(1, mirror_SPINSINGLE);
    G.cwt.at.mondir++;
    G.cwt.at.mondir %= G.cwt.at.type;

    if (G.shmup_on) throw new NotPorted('shmup::pc[0]->at = Id');
  } },
  { key: ch('J'), desc: 'lose all treasure', action: () => {
    if (G.items[localTreasureType()] > 0)
      G.items[localTreasureType()] = 0;
    else for (let i = 1; i < ittypes; i++)
      if (itemclass(i) === IC_TREASURE)
        G.items[i] = 0;
    G.cheater++; addMessage(XLAT('Treasure lost!'));
  } },
  { key: ch('K'), desc: 'gain kills', action: () => {
    for (let i = 0; i < motypes; i++) G.kills[i] += 10;
    G.kills[moPlayer] = 0;
    G.cheater++; addMessage(XLAT('Kills gained!'));
  } },
  { key: ch('Y'), desc: 'unlock Orbs of Yendor', action: () => {
    for (const y of G.yendor_yi) {
      if (y.path[YDIST - 1].item === itKey)
        y.path[YDIST - 1].item = itNone;
      if (!y.found) G.items[itKey]++;
      y.found = true;
    }
    G.cheater++; addMessage(XLAT('Collected the keys!'));
  } },
  { key: ch('Y') - 64, desc: 'gain Orb of Yendor', action: () => {
    yendor_collected(G.cwt.at);
    G.cheater++;
  } },
  { key: ch('P'), desc: 'save a Princess', action: () => {
    G.items[itSavedPrincess]++;
    G.princess_saved = true;
    G.princess_everSaved = true;
    if (G.inv_on && !G.princess_reviveAt)
      G.princess_reviveAt = gold(NO_LOVE);
    G.cheater++; addMessage(XLAT('Saved the Princess!'));
  } },
  { key: ch('S'), desc: 'Safety (quick save)', action: () => {
    G.canmove = true;
    cheatMoveTo(G.cwt.at.land);
    G.items[itOrbSafety] += 3;
    G.cheater++; addMessage(XLAT('Activated Orb of Safety!'));
  } },
  { key: ch('W') - 64, desc: 'switch web display', action: () => {
    pushScreen(linepatterns_showMenu);
  } },
  { key: ch('G') - 64, desc: 'switch ghost timer', action: () => {
    G.timerghost = !G.timerghost;
    G.cheater++;
    if (G.shmup_on) {
      throw new NotPorted('shmup::curtime');
    }
    else {
      addMessage(XLAT('turn count = %1 last exploration = %2 ghost timer = %3',
        its(G.turncount), its(G.lastexplore), G.timerghost ? XLAT('ON') : XLAT('OFF')));
    }
  } },
  { key: ch('G'), desc: 'edit cell values', action: push_debug_screen },
  { key: ch('L') - 64, desc: 'cell info', action: () => {
    G.debug_cellnames = !G.debug_cellnames;
    const c = G.mouseover;
    if (!c) return;
    describeCell(c);
  } },
  { key: ch('P') - 64, desc: 'peaceful mode', action: () => {
    G.peace_on = !G.peace_on;
  } },
  // CHEAT_DISABLE_ALLOWED is not defined
];

function idiv2(t: number): number { return (t / 2) | 0; }

/** applyCheat(char u): u is a char (signed) */
export function applyCheat(u: number): boolean {
  u = (u << 24) >> 24;
  for (const c of cheats) if (u === c.key) {
    c.action();
    return true;
  }
  return false;
}

// EX vector<pair<cellwalker,int> > drawbugs: G

let debugmode = false;

export function push_debug_screen(): void {
  throw new NotPorted('push_debug_screen (UI)');
}

/** show the cheat menu (package U2) */
export function showCheatMenu(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t('cheat menu');
  for (const c of cheats) {
    dialog_addItem(XLAT(c.desc), c.key);
    dialog_add_action(() => { c.action(); popScreen(); });
  }
  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();
}
// package U2 (showCheatMenu)
import { gamescreen, sm, popScreen } from './graph.ts';
import { dialog_init_t, dialog_addItem, dialog_add_action, dialog_addBreak, dialog_addBack, dialog_display } from './dialogs.ts';

/** view all the monsters and items */
export function viewall(): void {
  const cl = new celllister(G.cwt.at, 20, 2000, null);
  try {
    const all_monsters: eMonster[] = [];
    for (let i = 0; i < motypes; i++) {
      const m = i;
      if (!isMultitile(m)) all_monsters.push(m);
    }

    for (const c of cl.lst) {
      if (isPlayerOn(c)) continue;
      let can_put_monster = true;
      for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.monst || isPlayerOn(c2)) can_put_monster = false; }
      if (can_put_monster) {
        for (let k = 0; k < isize(all_monsters); k++)
          if (passable_for(all_monsters[k], c, null!, 0n)) {
            c.monst = all_monsters[k];
            all_monsters[k] = all_monsters[all_monsters.length - 1];
            all_monsters.pop();
          }
      }
    }

    const itemcells: cell[] = [];
    for (const c of cl.lst) {
      if (isPlayerOn(c) || c.monst || c.item) continue;
      itemcells.push(c);
    }
    let id = 0;
    for (let it = 1; it < ittypes; it++) if (it !== itBarrow) {
      if (id >= isize(itemcells)) break;
      itemcells[id++].item = it;
    }
  }
  finally { cl.destroy(); }
}

// CAP_COMMANDLINE: perform a move for the -cmove command

let cheat_move_gen = 7;

function cheat_move(c: string): void {
  const cheat = arg_cheat;
  if (c >= '0' && c <= '9' && cheat_move_gen === -1) cheat_move_gen = (c.charCodeAt(0) - 48);
  else if (c >= '0' && c <= '9') { cheat(); G.cwt.add(c.charCodeAt(0) - 48); }
  else if (c === 's') {
    cheat();
    G.cwt.addStep();
    G.playermoved = false;
    setdist(G.cwt.at, cheat_move_gen, G.cwt.peek());
    if (geometry_supports_cdata()) getCdata(G.cwt.at, 0);
  }
  else if (c === 'r') { cheat(); G.cwt.addRev(); }
  else if (c === 'm') { cheat(); G.cwt.addMirror(); }
  else if (c === 'z') { cheat(); G.cwt.spin = 0; G.cwt.mirrored = false; }
  else if (c === 'F' || c === 'E' || c === 'V') throw new NotPorted('-cmove ' + c + ' (centering: graphics)');
  else if (c === 'a') { cheat(); history_save_end(); }
  else if (c === 'g') cheat_move_gen = -1;
  else { /* println(hlog, "unknown move command: ", c); */ }
}

/** launch a debugging screen, and continue normal working only after this screen is closed */
export function modalDebug(_c: cell): void {
  // centerover = c; View = Id;
  if (G.noGUI) {
    // fprintf(stderr, "fatal: modalDebug called on %p without GUI\n", hr::voidp(c));
    exit(1);
  }
  push_debug_screen();
  debugmode = true;
  mainloop();
  debugmode = false;
  G.quitmainloop = false;
}

function test_distances(max: number): void {
  let ok = 0, bad = 0;
  const cl = new celllister(G.cwt.at, max, 100000, null);
  for (const c of cl.lst) {
    const is_ok = cl.getdist(c) === celldistance(c, G.cwt.at);
    if (is_ok) ok++; else bad++;
  }
  cl.destroy();
  void ok; void bad; // println(hlog, "ok=", ok, " bad=", bad);
}

export function raiseBuggyGeneration(c: cell, s: string): void {

  printf(`procgen error (${c ? 'cell' : '(nil)'}): ${s}\n`);

  if (!errorReported) {
    addMessage('something strange happened in: ' + s);
    errorReported = true;
  }

  // BACKTRACE is not defined

  // return;

  if (G.cheater || G.autocheat) {
    G.drawbugs.push([new cellwalker(c, 0), 0xFF000080]);
    modalDebug(c);
    G.drawbugs.pop();
  }
  else
    c.item = itBuggy;
}

// CAP_COMMANDLINE

function read_cheat_args(): number {
  if (arg_argis('-ch')) { arg_cheat(); }
  else if (arg_argis('-rch')) {
    if (PHASEFROM(2)) return 2; arg_cheat(); G.reptilecheat = true;
  }
// cheats
  else if (arg_argis('-g')) {
    /* debugging mode */
    if (G.arg_curphase === 1) {
      /* use no score file */
      G.scorefile = '';
      /* set seed for reproducible results */
      if (!G.fixseed) {
        G.fixseed = true; G.autocheat = true;
        G.startseed = 1;
      }
    }
    if (PHASE(2)) return 2;
    /* causes problems in gdb */
    // mouseaim_sensitivity = 0;
    /* do not any play sounds while debugging */
    // effvolume = 0; musicvolume = 0; (sound and control: a later stage)
  }
  else if (arg_argis('-WS')) {
    if (PHASE(3)) return 2;
    arg_shift();
    activateSafety(arg_readland(arg_args()));
    arg_cheat();
  }
  else if (arg_argis('-WT')) {
    if (PHASE(3)) return 2;
    arg_shift();
    teleportToLand(arg_readland(arg_args()), false);
    arg_cheat();
  }
  else if (arg_argis('-W2')) {
    arg_shift(); G.cheatdest = arg_readland(arg_args()); arg_cheat();
    G.showstartmenu = false;
    G.cheatdest_list.length = 0;
  }
  else if (arg_argis('-W3')) {
    arg_shift(); G.cheatdest_list.push(arg_readland(arg_args())); arg_cheat();
    G.showstartmenu = false;
  }
  else if (arg_argis('-I')) {
    if (PHASE(3)) return 2; arg_cheat();
    arg_shift(); const i = arg_readItem(arg_args());
    arg_shift(); G.items[i] = arg_argi();
  }
  else if (arg_argis('-IP')) {
    if (PHASE(3)) return 2; arg_cheat();
    arg_shift(); const i = arg_readItem(arg_args());
    arg_shift(); const q = arg_argi();
    placeItems(q, i);
  }
  else if (arg_argis('-SM')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); throw new NotPorted('-SM (vid.stereo_mode)');
  }
  else if (arg_argis('-save-cheats')) {
    G.save_cheats = true;
  }
  else if (arg_argis('-cmove')) {
    if (PHASE(3)) return 2; arg_shift();
    for (const c of arg_args()) cheat_move(c);
  }
  else if (arg_argis('-ipd')) {
    if (PHASEFROM(2)) return 2;
    arg_shift_arg_formula(new pref(G.vid, 'ipd'));
  }
  // CAP_INV
  else if (arg_argis('-IU')) {
    if (PHASE(3)) return 2; arg_cheat();
    arg_shift(); const i = arg_readItem(arg_args());
    arg_shift(); G.inv_usedup[i] += arg_argi();
    inv_compute();
  }
  else if (arg_argis('-IX')) {
    if (PHASE(3)) return 2; arg_cheat();
    arg_shift(); const i = arg_readItem(arg_args());
    arg_shift(); G.inv_extra_orbs[i] += arg_argi();
    inv_compute();
  }
  // CAP_COMPLEX2
  else if (arg_argis('-ambush')) {
    // make all ambushes use the given number of dogs
    // example: hyper -W Hunt -IP Shield 1 -ambush 60
    if (PHASE(3)) return 2; arg_cheat();
    arg_shift(); G.ambush_fixed_size = arg_argi();
  }
  else if (arg_argis('-testdistances')) {
    if (PHASE(3)) return 2; arg_shift(); test_distances(arg_argi());
  }
  else if (arg_argis('-M')) {
    if (PHASE(3)) return 2; arg_cheat(); start_game(); if (WDIM() === 3) { throw new NotPorted('-M in 3D (drawthemap)'); }
    arg_shift(); const m = arg_readMonster(arg_args());
    arg_shift(); const q = arg_argi();
    printf(`m = ${dnameof(m)} q = ${q}\n`);
    restoreGolems(q, m, 7);
  }
  else if (arg_argis('-MK')) {
    if (PHASE(3)) return 2; arg_cheat();
    arg_shift(); const m = arg_readMonster(arg_args());
    arg_shift(); G.kills[m] += arg_argi();
  }
  else if (arg_argis('-killeach')) {
    if (PHASEFROM(2)) return 2; start_game();
    arg_shift(); const q = arg_argi(); arg_cheat();
    for (let m = 0; m < motypes; m++)
      if (monsterclass(m) === 0)
        G.kills[m] = q;
  }
  else if (arg_argis('-each')) {
    if (PHASEFROM(2)) return 2; start_game();
    arg_shift(); const q = arg_argi(); arg_cheat();
    for (let i = 0; i < ittypes; i++)
      if (itemclass(i) === IC_TREASURE)
        G.items[i] = q;
  }
  else if (arg_argis('-each-random')) {
    if (PHASEFROM(2)) return 2; start_game(); arg_cheat();
    for (let i = 0; i < ittypes; i++)
      if (itemclass(i) === IC_TREASURE) {
        G.items[i] = 10 + hrand(21);
        if (i === itElemental) G.items[i] = 12;
      }
      else
        G.items[i] = 0;
  }
  else if (arg_argis('-viewall')) {
    if (PHASE(3)) return 2; start_game();
    viewall();
  }
  else if (arg_argis('-unlock-all')) {
    arg_cheat(); G.all_unlocked = true;
  }
  else if (arg_argis('-wef') || arg_argis('-wei')) {
    if (PHASEFROM(2)) return 2;
    throw new NotPorted(arg_args() + ' (whatever[]: menus.cpp)');
  }
  else if (arg_argis('-W4')) {
    arg_shift(); G.top_land = arg_readland(arg_args()); arg_cheat();
    G.showstartmenu = false;
  }
  else if (arg_argis('-top') || arg_argis('-idv')) {
    if (PHASE(3)) return 2; throw new NotPorted(arg_args() + ' (View: graphics)');
  }
  else if (arg_argis('-gencells')) {
    if (PHASEFROM(2)) return 2; arg_shift(); start_game();
    printf(`Generating ${arg_argi()} cells...\n`);
    const cl = new celllister(G.cwt.at, 50, arg_argi(), null);
    printf(`Cells generated: ${isize(cl.lst)}\n`);
    for (let i = 0; i < isize(cl.lst); i++)
      setdist(cl.lst[i], 7, null!);
    cl.destroy();
  }
  else if (arg_argis('-sr')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); G.sightrange_bonus = arg_argi(); G.vid.use_smart_range = 0;
  }
  else if (arg_argis('-srx')) {
    if (PHASEFROM(2)) return 2; arg_cheat();
    arg_shift(); G.sightrange_bonus = G.genrange_bonus = G.gamerange_bonus = arg_argi(); G.vid.use_smart_range = 0;
  }
  else if (arg_argis('-smart') || arg_argis('-smartarea') || arg_argis('-smartn') || arg_argis('-smartlimit') ||
    arg_argis('-genlimit') || arg_argis('-sight3') || arg_argis('-sloppy') || arg_argis('-gen3')) {
    if (PHASEFROM(2)) return 2;
    throw new NotPorted(arg_args() + ' (vid: config.cpp)');
  }
  else if (arg_argis('-quantum')) {
    arg_cheat();
    G.quantum = true;
  }
  else if (arg_argis('-lands')) {
    if (PHASEFROM(2)) return 2;
    stop_game();
    arg_shift(); G.land_structure = arg_argi();
  }
  else if (arg_argis('-fix')) {
    if (PHASE(1)) return 2;
    G.fixseed = true; G.autocheat = true;
  }
  else if (arg_argis('-cellnames')) {
    arg_cheat(); G.debug_cellnames = true;
  }
  else if (arg_argis('-fixx')) {
    if (PHASE(1)) return 2;
    G.fixseed = true; G.autocheat = true;
    arg_shift(); G.startseed = arg_argi();
  }
  else if (arg_argis('-reseed')) {
    if (PHASEFROM(2)) return 2;
    arg_shift(); shrand(arg_argi());
  }
  else if (arg_argis('-steplimit')) {
    G.fixseed = true; G.autocheat = true;
    arg_shift(); G.steplimit = arg_argi();
  }
  else if (arg_argis('-dgl')) {
    // CAP_GL: glhr::debug_gl = true (graphics)
  }
  else if (arg_argis('-dsgl')) {
    // CAP_GL: detailed_shader = true (graphics)
  }
  else if (arg_argis('-mgen-off')) {
    if (PHASEFROM(3)) return 2;
    arg_cheat();
    G.gen_wandering = false;
  }
  else if (arg_argis('-log') || arg_argis('-no-log') || arg_argis('-log-to') || arg_argis('-log-append')) {
    // the debug log is left out (PORTING.md, "Macros")
    arg_shift();
  }
  else if (arg_argis('-log-all') || arg_argis('-log-none')) {
    // the debug log is left out
  }
  else if (arg_argis('-canvasfloor')) {
    arg_shift(); throw new NotPorted('-canvasfloor (celldrawer.cpp)');
  }
  else if (arg_argis('-keys')) {
    arg_shift(); throw new NotPorted('-keys (dialog::queue_key)');
  }
  else if (arg_argis('-hroll')) {
    arg_shift();
    let i = arg_argi();
    while (i > 0) { i--; hrand(10); }
  }
  else if (arg_argis('-W')) {
    if (PHASEFROM(2)) return 2;
    arg_shift();
    G.firstland0 = G.firstland = G.specialland = arg_readland(arg_args());
    if (!landUnlocked(G.firstland))
      arg_cheat();
    stop_game_and_switch_mode(rg_nothing);
    G.showstartmenu = false;
  }
  else return 1;
  return 0;
}

// EX bool ldebug = false: G

export function breakhere(): void {
  exit(1);
}

/** the static initializer: auto ah_cheat = addHook(hooks_args, 0, read_cheat_args) */
export function register_debug(): void {
  addHook(G.hooks_args, 0, read_cheat_args);
}

void debugmode;
