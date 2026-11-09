// multi.cpp of HyperRogue 13.1o: the local multiplayer of the turn-based mode (stage 3, step 1 of the online
// part): players, recall, revival queue, scores, the configured input (keys: initConfig, sconfig_savers,
// get_actions, handleInput, notremapped, key_to_scan; no joysticks in the browser), handleMulti (the players'
// moves; multi_alldecided is its `if(alldecided)` part, a function of its own so that the oracle harness and the
// online game run exactly it), mousemovement, and the menus (key configurers, "keyboard & joysticks",
// "multiplayer"). Shmup (the real-time mode) and split screen are later. change_default_key needs
// local_parameter_set (not ported). (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G } from './globals.ts';
import { NotPorted, MAXPLAYER, MD_UNDECIDED, MD_USE_ORB } from './hyper.ts';
import type { cell } from './locations.ts';
import { its } from './hprint.ts';
import { XLAT } from './language.ts';
import { numplayers, player_indices } from './pcmove.ts';
import { makeEmpty } from './mapeffects.ts';
import { passable, P_ISPLAYER } from './passable.ts';
import { checkmove, multimove } from './checkmove.ts';
import { MD_WAIT, MD_DROP } from './hyper.ts';
import { playerpos, movepcto_md } from './pcmove.ts';
import { vectodir, calcMousedest, mouseout } from './control.ts';
import { hpxy } from './hyperpoint.ts';
import { WDIM } from './classes.ts';
import { targetRangedOrb, roMultiCheck } from './orbs.ts';
import { addMessage, flashMessages } from './basegraph.ts';
import { activateSafety } from './game.ts';
import { monstersTurn } from './environment.ts';
import { isNeighbor } from './cell.ts';

/** static constexpr of namespace multi */
export const multi_SCANCODES = 512;
export const multi_MAXJOY = 8;
export const multi_MAXBUTTON = 64;
export const multi_MAXAXE = 16;
export const multi_MAXHAT = 4;
export const SHMUPAXES_BASE = 4;
export const SHMUPAXES_PER_PLAYER = 4;
export const SHMUPAXES = SHMUPAXES_BASE + SHMUPAXES_PER_PLAYER * MAXPLAYER;

// EX config scfg_default; EX charstyle scs[MAXPLAYER]; EX bool split_screen, pvp_mode, friendly_fire = true,
// self_hits, two_focus, multi_autojoy = true; EX int players = 1; EX cellwalker player[MAXPLAYER];
// EX vector<int> revive_queue; EX cell *origpos[MAXPLAYER], *origtarget[MAXPLAYER]; EX bool flipped[MAXPLAYER];
// EX int treasures[MAXPLAYER], kills[MAXPLAYER], deaths[MAXPLAYER], pkills[MAXPLAYER], suicides[MAXPLAYER];
// EX bool alwaysuse: G.multi_*

export function multi_recall(): void {
  for (let i = 0; i < numplayers(); i++) {
    const idir = (3 * i) % G.cwt.at.type;
    let c2 = G.cwt.at.move(idir);
    makeEmpty(c2);
    if (!passable(c2, null!, P_ISPLAYER)) c2 = G.cwt.at;
    G.multi_player[i].at = c2;
    G.multi_player[i].spin = 0;

    G.multi_flipped[i] = true;
    G.multi_whereto[i].d = MD_UNDECIDED;
  }
}

// EX shiftmatrix whereis[MAXPLAYER], crosscenter[MAXPLAYER]; EX double ccdist[MAXPLAYER];
// EX cell *ccat[MAXPLAYER]; EX bool accepted[MAXPLAYER], after_accepted[MAXPLAYER]: G.multi_*

/** bool combo[MAXPLAYER] (file-local) */
const combo: boolean[] = new Array<boolean>(MAXPLAYER).fill(false);

// EX int cpid; EX int cpid_edit; EX movedir whereto[MAXPLAYER]; EX double mdx[MAXPLAYER], mdy[MAXPLAYER]: G

export function multi_resetScores(): void {
  for (let i = 0; i < MAXPLAYER; i++)
    G.multi_treasures[i] = G.multi_kills[i] = G.multi_deaths[i] = G.multi_pkills[i] = G.multi_suicides[i] = 0;
}

export function multi_player_count_name(p: number): string {
  return (
    p === 2 ? XLAT('two players') :
    p === 3 ? XLAT('three players') :
    p === 4 ? XLAT('four players') :
    p === 5 ? XLAT('five players') :
    p === 6 ? XLAT('six players') :
    p === 7 ? XLAT('seven players') :
    XLAT('one player'));
}

/** string dsc(int id): the statistics line of a player (multiplayer menu) */
function multi_dsc(id: number): string {
  let buf = XLAT(' (%1 $$$, %2 kills, %3 deaths)',
    its(G.multi_treasures[id]),
    its(G.multi_kills[id]),
    its(G.multi_deaths[id]),
  );
  if (G.multi_friendly_fire)
    buf += XLAT(' (%1 pkills)', its(G.multi_pkills[id]));
  if (G.multi_self_hits)
    buf += XLAT(' (%1 self)', its(G.multi_suicides[id]));
  return buf;
}

// --- the configured input (keys; joysticks: none in the browser) ---

/** struct config (multi.cpp HDR): G.multi_scfg_default is one */
export type multi_config = typeof G.multi_scfg_default;

const CMDS = 15; void CMDS;
const CMDS_PAN = 11; void CMDS_PAN;

const playercmds_shmup = [
  'forward', 'backward', 'turn left', 'turn right',
  'move up', 'move right', 'move down', 'move left',
  'throw a knife', 'face the pointer', 'throw at the pointer',
  'drop Dead Orb', 'center the map on me', 'Orb power (target: mouse)',
  'Orb power (target: facing)',
];

const playercmds_shmup3 = [
  'rotate up', 'rotate down', 'rotate left', 'rotate right',
  'move forward', 'strafe right', 'move backward', 'strafe left',
  'throw a knife', 'face the pointer', 'throw at the pointer',
  'drop Dead Orb', 'center the map on me', 'Orb power (target: mouse)',
  'Orb power (target: facing)',
];

const playercmds_turn = [
  'move up-right', 'move up-left', 'move down-right', 'move down-left',
  'move up', 'move right', 'move down', 'move left',
  'accept (left + right to stay in place)', 'cancel move', 'leave the game',
  'drop Dead Orb (up + down)', 'center the map on me', '',
  '',
];

const pancmds = [
  'pan up', 'pan right', 'pan down', 'pan left',
  'rotate left', 'rotate right', 'home',
  'world overview', 'review your quest', 'inventory', 'main menu',
];

/** enum pancmds */
const panUp = 0, panRight = 1, panDown = 2, panLeft = 3, panRotateLeft = 4, panRotateRight = 5, panHome = 6,
  panWorldOverview = 7, panReviewQuest = 8, panInventory = 9, panMenu = 10, panScrollForward = 11, panScrollBackward = 12;

const pancmds3 = [
  'look up', 'look right', 'look down', 'look left',
  'rotate left', 'rotate right', 'home',
  'world overview', 'review your quest', 'inventory', 'main menu',
  'scroll forward', 'scroll backward',
];

/** EX const char* axemodes[SHMUPAXES] */
export const multi_axemodes: string[] = ['do nothing', 'rotate view', 'panning X', 'panning Y'];
for (let p = 1; p <= MAXPLAYER; p++) multi_axemodes.push(`player ${p} X`, `player ${p} Y`, `player ${p} go`, `player ${p} spin`);

/** EX const char* axemodes3[4] */
export const multi_axemodes3 = ['do nothing', 'camera forward', 'camera rotate X', 'camera rotate Y'];

// EX int centerplayer = -1: G.multi_centerplayer

/** string listkeys(config& scfg, int id) (CAP_SDL; CAP_SDLJOY: no joysticks in the browser) */
function listkeys(scfg: multi_config, id: number): string {
  let lk = '';
  for (let i = 0; i < multi_SCANCODES; i++)
    if (scfg.keyaction[i] === id)
      lk = lk + ' ' + SDL_GetScancodeName(i);
  return lk;
}

// #define SCJOY 16

// EX int tableid[7] = {1, 2, 4, 5, 6, 7, 8}: G.multi_tableid

export function multi_leaveGame(i: number): void {
  G.multi_player[i].at = null!;
  G.multi_deaths[i]++;
  G.multi_revive_queue.push(i);
  multi_checklastmove();
}

export function multi_playerActive(p: number): boolean {
  if (G.multi_players === 1 || G.shmup_on) return true;
  return !!G.multi_player[p].at;
}

export function multi_activePlayers(): number {
  let q = 0;
  for (let i = 0; i < G.multi_players; i++) if (multi_playerActive(i)) q++;
  return q;
}

export function multi_multiPlayerTarget(i: number): cell {
  let cwti = G.multi_player[i].clone();
  if (!cwti.at) return null!;
  const dir = G.multi_whereto[i].d;
  if (dir === MD_UNDECIDED) return null!;
  if (dir === MD_USE_ORB) return G.multi_whereto[i].tgt;
  if (dir >= 0)
    cwti = cwti.plus(dir).plusStep();
  return cwti.at;
}

export function multi_checklastmove(): void {
  for (const i of player_indices()) {
    G.multi_cpid = i;
    G.cwt.set(G.multi_player[i]); break;
  }
  if (multi_activePlayers() === 1) {
    G.multi_checkonly = true;
    checkmove(false);
    G.multi_checkonly = false;
  }
}

let needinput = true;

export function multi_handleMulti(delta: number): void {
  multi_handleInput(delta);

  const bcwtV = G.current_display.player_matrix;
  const bcwt = G.cwt.clone();

  let alldecided = !needinput;

  if (G.multi_players === 1) {
    G.multi_cpid = 0;
    G.multi_whereis[0] = G.current_display.player_matrix;
    G.multi_player[0].set(G.cwt);
  }

  for (const i of player_indices()) {

    // todo refactor

    G.multi_cpid = i;

    const id = G.multi_tableid[G.multi_cpid];
    const act = action_states(id);

    for (let ik = 0; ik < 8; ik++) if (act[ik].held) G.playermoved = true;
    for (let ik = 0; ik < 16; ik++) if (pressed(act[ik]))
      combo[i] = false;

    let anypressed = false;

    const axes = multi_axes_for(G.multi_cpid);

    for (let ik = 0; ik < 4; ik++)
      if (axes.a[axes.base + ik] && !G.multi_accepted[i]) {
        anypressed = true; G.playermoved = true; combo[i] = false;
      }

    const mdx =
      (act[0].held + act[2].held - act[1].held - act[3].held) * .7 +
      act[pcMoveRight].held - act[pcMoveLeft].held + axes.a[axes.base + 0] / 30000.;
    const mdy =
      (act[3].held + act[2].held - act[1].held - act[0].held) * .7 +
      act[pcMoveDown].held - act[pcMoveUp].held + axes.a[axes.base + 1] / 30000.;

    if ((act[pcMoveRight].held && act[pcMoveLeft].held) ||
      (act[pcMoveUp].held && act[pcMoveDown].held))
      G.multi_mdx[i] = G.multi_mdy[i] = 0;

    G.multi_mdx[i] = G.multi_mdx[i] * (1 - delta / 1000.) + mdx * delta / 2000.;
    G.multi_mdy[i] = G.multi_mdy[i] * (1 - delta / 1000.) + mdy * delta / 2000.;

    if (WDIM() === 2) {
      if (mdx !== 0 || mdy !== 0) if (!combo[i] && !G.multi_accepted[i]) {
        G.current_display.player_matrix = G.multi_whereis[i]; G.cwt.set(G.multi_player[i]);
        if (multi_activePlayers() > 1) G.flipplayer = G.multi_flipped[i];
        G.multi_whereto[i] = vectodir(hpxy(G.multi_mdx[i], G.multi_mdy[i]));
      }
    }

    if (act[pcMoveLeft].held && act[pcMoveRight].held) {
      combo[i] = true; G.multi_whereto[i].d = MD_WAIT;
    }

    if (act[pcFire].held) {
      if (G.multi_whereto[i].d === MD_UNDECIDED || (G.multi_mdx[i] === 0 && G.multi_mdy[i] === 0)) G.multi_whereto[i].d = MD_WAIT;
      G.multi_accepted[i] = true;
    }

    if (act[pcFace].held) {
      G.multi_whereto[i].d = MD_UNDECIDED;
      G.multi_accepted[i] = false;
    }

    G.cwt.at = G.multi_player[i].at;
    if (G.multi_ccat[i] && !combo[i] && targetRangedOrb(G.multi_ccat[i], roMultiCheck)) {
      G.multi_whereto[i].d = MD_USE_ORB;
      G.multi_whereto[i].tgt = G.multi_ccat[i];
    }

    if (act[pcFaceFire].held && multi_activePlayers() > 1) {
      addMessage(XLAT('Left the game.'));
      multi_leaveGame(i);
    }

    if (act[pcDrop].held || (act[pcMoveUp].held && act[pcMoveDown].held)) {
      combo[i] = true; G.multi_whereto[i].d = MD_DROP;
    }

    if (act[pcCenter].held) {
      G.multi_centerplayer = G.multi_cpid; centerpc(100); G.playermoved = true;
    }

    for (let ik = 0; ik < 16; ik++) if (act[ik].held && (!G.multi_accepted[i] || ik >= 8)) anypressed = true;

    if (G.multi_after_accepted[i] && !G.multi_accepted[i] && !anypressed) {
      G.multi_whereto[i].d = MD_UNDECIDED;
      G.multi_after_accepted[i] = false;
    }

    if (G.multi_whereto[i].d === MD_UNDECIDED) alldecided = false;

    if (!G.multi_multi_autojoy && !G.multi_accepted[i]) alldecided = false;

    if (anypressed) { alldecided = false; needinput = false; }
    else G.multi_mdx[i] = G.multi_mdy[i] = 0;
  }

  G.current_display.player_matrix = bcwtV;
  G.cwt.set(bcwt);

  if (alldecided) {
    flashMessages();
    // check for crashes
    needinput = true;
    multi_alldecided();
  }
}

/** The rest of handleMulti's `if(alldecided)` after `needinput = true`: every active player's `whereto` is decided;
 *  check for crashes, then move all players (multimove) and the monsters. A function of its own (the original
 *  has it inline) so that the harness and the online game run exactly this; returns whether the round was played
 *  (false: two players aim at the same cell, or a player's move was refused). */
export function multi_alldecided(): boolean {
  for (const i of player_indices()) {
    G.multi_origpos[i] = G.multi_player[i].at;
    G.multi_origtarget[i] = multi_multiPlayerTarget(i);
    G.multi_after_accepted[i] = G.multi_accepted[i];
    G.multi_accepted[i] = false;
  }

  for (const i of player_indices())
    for (const j of player_indices()) if (i !== j) {
      if (G.multi_origtarget[i] === G.multi_origtarget[j]) {
        addMessage('Two players cannot move/attack the same location!');
        return false;
      }
      /* if(multiPlayerTarget(i) == multi::player[j].at) "Cannot move into the current location of another player!"
         if(celldistance(multiPlayerTarget(i), multiPlayerTarget(j)) > 8) "Players cannot get that far away!" */
    }

  if (G.multi_players === 1) {
    if (movepcto_md(G.multi_whereto[0]))
      G.multi_whereto[0].d = MD_UNDECIDED;
    return true;
  }

  G.multi_cpid = 0;
  if (multimove()) {
    G.multi_aftermove = false;
    if (G.shmup_delayed_safety) {
      activateSafety(G.shmup_delayed_safety_land);
      G.shmup_delayed_safety = false;
      multi_checklastmove();
    }
    else {
      monstersTurn();
      multi_checklastmove();
    }
    return true;
  }
  return false;
}

export function multi_mousemovement(c: cell): void {
  if (!c) return;
  let countplayers = 0;
  let countplayers_undecided = 0;
  for (let i = 0; i < G.multi_players; i++)
    if (multi_playerActive(i) && (playerpos(i) === c || isNeighbor(c, playerpos(i)))) {
      countplayers++;
      if (G.multi_whereto[i].d === MD_UNDECIDED) countplayers_undecided++;
    }

  for (let i = 0; i < G.multi_players; i++)
    if (multi_playerActive(i) && (playerpos(i) === c || isNeighbor(c, playerpos(i)))) {
      const scdir = G.multi_whereto[i].d;
      const isUndecided = G.multi_whereto[i].d === MD_UNDECIDED;
      if (countplayers_undecided > 0 && !isUndecided) continue;
      if (playerpos(i) === c) {
        G.multi_whereto[i].d = MD_WAIT;
        G.multi_accepted[i] = true;
      }
      else if (!mouseout()) {
        for (let d = 0; d < playerpos(i).type; d++) {
          G.multi_whereto[i].d = d;
          if (multi_multiPlayerTarget(i) === c) {
            G.multi_accepted[i] = true;
            G.cwt.set(G.multi_player[i]);
            calcMousedest();
            G.multi_whereto[i].subdir = G.mousedest.subdir;
            if (G.multi_whereto[i].subdir === 0) G.multi_whereto[i].subdir = 1;
            break;
          }
          G.multi_whereto[i].d = scdir;
        }
      }
    }

  needinput =
    ((countplayers === 2 && !countplayers_undecided) || countplayers_undecided >= 2);
}



// --- the menus: shmup_configurer, configure, showConfigureMultiplayer (U4, completed in stage 3). No joysticks in
// the browser (sticks is empty): the old style joystick configuration stays a stub screen. ---

/** EX const char *axmodes[7] */
export const multi_axmodes = ['OFF', 'auto', 'light', 'heavy', 'arrows', 'WASD keys', 'VI keys'];

/** struct key_configurer: a screen (operator()) with its own state (setwhat); the original keeps the functor in
 *  the screen stack, the port a closure */
function key_configurer(sc: number, shmupcmdtable: string[], caption: string, which_config: multi_config): () => void {
  let setwhat = 0;
  const self = (): void => {
    dialog_init_t(caption);

    G.getcstat = ' '.charCodeAt(0);

    for (let i = 0; i < isize(shmupcmdtable); i++) if (shmupcmdtable[i].length)
      dialog_addSelItem(XLAT(shmupcmdtable[i]), listkeys(which_config, 16 * sc + i),
        setwhat ? (setwhat > 1 && i === (setwhat & 15) ? '?'.charCodeAt(0) : 0) : 'a'.charCodeAt(0) + i);
    else dialog_addBreak(100);

    if (setwhat === 1)
      dialog_addItem(XLAT('press a key to unassign'), 0);
    else if (setwhat)
      dialog_addItem(XLAT('press a key for \'%1\'', XLAT(shmupcmdtable[setwhat & 15])), 0);
    else
      dialog_addItem(XLAT('unassign a key'), 'z'.charCodeAt(0));

    dialog_display();

    G.keyhandler = (sym: number, uni: number): void => {
      if (!setwhat) dialog_handleNavigation({ sym, uni });
      if (sym) {
        if (setwhat) {
          const scan = multi_key_to_scan(sym);
          if (scan >= 0 && scan < multi_SCANCODES) which_config.keyaction[scan] = setwhat;
          setwhat = 0;
        }
        else if (uni >= 97 && uni < 97 + isize(shmupcmdtable) && shmupcmdtable[uni - 97].length)
          setwhat = 16 * sc + uni - 97;
        else if (uni === 'z'.charCodeAt(0))
          setwhat = 1;
        else if (doexiton(sym, uni))
          popScreen();
      }
    };
    // CAP_SDLJOY: joyhandler (no joysticks in the browser)
  };
  return self;
}

/** EX reaction_t get_key_configurer(int sc, vector<string>& sct, string caption [, config &cfg]) and
 *  get_key_configurer(int sc, vector<string>& sct) */
export function multi_get_key_configurer(sc: number, sct: string[], caption?: string, cfg: multi_config = G.multi_scfg_default): () => void {
  if (caption === undefined)
    caption = sc === 1 ? XLAT('configure player 1') :
      sc === 2 ? XLAT('configure player 2') :
      sc === 3 ? XLAT('configure panning') :
      sc === 4 ? XLAT('configure player 3') :
      sc === 5 ? XLAT('configure player 4') :
      sc === 6 ? XLAT('configure player 5') :
      sc === 7 ? XLAT('configure player 6') :
      sc === 8 ? XLAT('configure player 7') : '';
  return key_configurer(sc, sct, caption, cfg);
}

/** struct shmup_configurer: operator() */
function shmup_configurer(): void {
  // CAP_SDL
  const K = (c: string): number => c.charCodeAt(0);
  const players = G.multi_players;
  G.cmode = sm.SHMUPCONFIG | sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('keyboard & joysticks'));
  const cmdlist = G.shmup_on ? (WDIM() === 3 ? playercmds_shmup3 : playercmds_shmup) : playercmds_turn;

  const haveconfig = G.shmup_on || players > 1 || G.multi_alwaysuse;

  if (haveconfig) {
    dialog_addItem(XLAT('configure player 1'), K('1'));
    dialog_add_action_push(multi_get_key_configurer(1, cmdlist));
  }
  else
    dialog_addBreak(100);
  if (players > 1) {
    dialog_addItem(XLAT('configure player 2'), K('2'));
    dialog_add_action_push(multi_get_key_configurer(2, cmdlist));
  }
  else if (players === 1 && !G.shmup_on) {
    dialog_addSelItem(XLAT('input'), G.multi_alwaysuse ? XLAT('config') : XLAT('default'), K('a'));
    dialog_add_action(() => { G.multi_alwaysuse = !G.multi_alwaysuse; });
  }
  else
    dialog_addBreak(100);
  if (players > 2) {
    dialog_addItem(XLAT('configure player 3'), K('3'));
    dialog_add_action_push(multi_get_key_configurer(3, cmdlist));
  }
  // CAP_SDLJOY: else if(!haveconfig) "old style joystick configuration" (showJoyConfig; the desktop build has it)
  else if (!haveconfig) {
    dialog_addItem(XLAT('old style joystick configuration'), K('b'));
    dialog_add_action_push(stub_screen_pop); // STAGE3-STUB (showJoyConfig: no joysticks in the browser)
  }
  else dialog_addBreak(100);
  if (players > 3) {
    dialog_addItem(XLAT('configure player 4'), K('4'));
    dialog_add_action_push(multi_get_key_configurer(4, cmdlist));
  }
  else if (!G.shmup_on && !G.multi_alwaysuse) {
    dialog_addBoolItem_action(XLAT('smooth scrolling'), { get v() { return G.smooth_scrolling; }, set v(x: boolean) { G.smooth_scrolling = x; } }, K('c'));
  }
  else if (G.multi_alwaysuse)
    dialog_addInfo(XLAT('note: configured input is designed for'));
  else dialog_addBreak(100);

  if (players > 4) {
    dialog_addItem(XLAT('configure player 5'), K('5'));
    dialog_add_action_push(multi_get_key_configurer(5, cmdlist));
  }
  else if (!G.shmup_on && !G.multi_alwaysuse) {
    if (GDIM() === 2) {
      dialog_addSelItem(XLAT('help for keyboard users'), XLAT(multi_axmodes[G.vid.axes]), K('h'));
      dialog_add_action(() => { G.vid.axes += 70 + (G.shiftmul > 0 ? 1 : -1); G.vid.axes %= 7; });
    }
    else dialog_addBreak(100);
  }
  else if (G.multi_alwaysuse)
    dialog_addInfo(XLAT('multiplayer and shmup mode; some features'));
  else dialog_addBreak(100);

  if (players > 5) {
    dialog_addItem(XLAT('configure player 6'), K('6'));
    dialog_add_action_push(multi_get_key_configurer(6, cmdlist));
  }
  else if (G.multi_alwaysuse)
    dialog_addInfo(XLAT('work worse if you use it.'));
  else dialog_addBreak(100);

  if (players > 6) {
    dialog_addItem(XLAT('configure player 7'), K('7'));
    dialog_add_action_push(multi_get_key_configurer(7, cmdlist));
  }
  else dialog_addBreak(100);

  if (G.shmup_on || G.multi_alwaysuse || players > 1) {
    dialog_addItem(XLAT('configure panning and general keys'), K('p'));
    dialog_add_action_push(multi_get_key_configurer(3, GDIM() === 3 ? pancmds3 : pancmds));
  }
  else dialog_addBreak(100);

  // CAP_SDLJOY: if(sticks.size()) "configure joystick axes" (no joysticks)

  add_edit(P('joy_init'));

  if (haveconfig && !G.shmup_on) add_edit(P('multi_multi_autojoy'));

  dialog_addBreak(50);

  dialog_addBack();
  dialog_display();
}

/** EX void configure() */
export function multi_configure(): void {
  pushScreen(shmup_configurer);
}

/** EX void showConfigureMultiplayer() */
export function multi_showConfigureMultiplayer(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t('multiplayer');

  for (let i = 1; i <= MAXPLAYER; i++) {
    let s = multi_player_count_name(i);
    if (i <= G.multi_players) s += multi_dsc(i - 1);
    dialog_addBoolItem(s, i === G.multi_players, '0'.charCodeAt(0) + i);
    if (!G.dual_state) dialog_add_action(() => {
      dialog_do_if_confirmed(() => {
        stop_game();
        G.multi_players = i;
        if (G.multi_players > 1 && !G.shmup_on) G.bow_weapon = 0; // bow::wBlade
        start_game();
      });
    });
  }

  add_edit(P('multi_self_hits'));
  if (G.multi_players > 1) {
    dialog_addItem(XLAT('reset per-player statistics'), 'r'.charCodeAt(0));
    dialog_add_action(() => {
      for (let i = 0; i < MAXPLAYER; i++)
        G.multi_kills[i] = G.multi_deaths[i] = G.multi_treasures[i] = 0;
    });

    dialog_addSelItem(XLAT('keyboard & joysticks'), '', 'k'.charCodeAt(0));
    dialog_add_action(multi_configure);
    add_edit(P('multi_split_screen'));
    if (G.shmup_on && !G.racing_on) {
      add_edit(P('multi_pvp_mode'));
      add_edit(P('multi_friendly_fire'));
      if (G.multi_pvp_mode)
        dialog_addInfo(XLAT('PvP grants infinite lives -- achievements disabled'));
      else if (G.multi_friendly_fire)
        dialog_addInfo(XLAT('friendly fire off -- achievements disabled'));
      else if (G.multi_split_screen)
        dialog_addInfo(XLAT('achievements disabled in split screen'));
      else
        dialog_addBreak(100);
    }
    else {
      dialog_addInfo(XLAT('PvP available only in shmup'));
      dialog_addBreak(400);
    }
    if (G.multi_players === 2 && !G.multi_split_screen)
      add_edit(P('multi_two_focus'));
    else
      dialog_addBreak(100);
  }
  else dialog_addBreak(600);

  // the online game (port only, ONLINE.md)
  if (G.online_menu) {
    dialog_addItem(XLAT('online multiplayer'), 'n'.charCodeAt(0));
    dialog_add_action_push(online_showMenu);
  }

  dialog_addBack();
  dialog_display();
}
import { stub_screen_pop, pushScreen } from './control.ts';
import { gamescreen, sm } from './graph.ts';
import { GDIM } from './classes.ts';
import { stop_game, start_game } from './system.ts';
import { add_edit, P } from './config.ts';
import { online_showMenu } from './online.ts';
import {
  dialog_init_t, dialog_addItem, dialog_addSelItem, dialog_addBoolItem, dialog_addBoolItem_action, dialog_addInfo,
  dialog_addBreak, dialog_addBack, dialog_display, dialog_add_action, dialog_add_action_push, dialog_do_if_confirmed,
} from './dialogs.ts';

/** enum pcmds (multi.cpp HDR) */
export const pcForward = 0, pcBackward = 1, pcTurnLeft = 2, pcTurnRight = 3,
  pcMoveUp = 4, pcMoveRight = 5, pcMoveDown = 6, pcMoveLeft = 7,
  pcFire = 8, pcFace = 9, pcFaceFire = 10,
  pcDrop = 11, pcCenter = 12, pcOrbPower = 13, pcOrbKey = 14;
/** #define NUMACT 128 */
export const NUMACT = 128;

// EX array<int, SHMUPAXES> axe_states: G.multi_axe_states

/** EX array<int,SHMUPAXES_PER_PLAYER>& axes_for(int pid): the player's 4 entries of axe_states, as (array, offset) */
export function multi_axes_for(pid: number): { a: number[]; base: number } {
  return { a: G.multi_axe_states, base: SHMUPAXES_BASE + pid * SHMUPAXES_PER_PLAYER };
}

/** struct action_state { int held, last; pressed(): held > last; operator bool/int: held } */
type action_state = { held: number; last: number };
const pressed = (a: action_state): boolean => a.held > a.last;

// EX array<action_state, NUMACT> action_states_flat: G.multi_action_states_flat
/** static array<array<action_state, 16>, 8>& action_states: action_states[i][k] is action_states_flat[16 * i + k] */
function action_states(i: number): action_state[] { return G.multi_action_states_flat.slice(16 * i, 16 * i + 16); }

function pressaction(id: number): void {
  if (id >= 0 && id < NUMACT) G.multi_action_states_flat[id].held++;
}

/** EX int key_to_scan(int sym) (SDLVER >= 2: SDL_GetScancodeFromKey) */
export function multi_key_to_scan(sym: number): number {
  return SDL_GetScancodeFromKey(sym);
}

export function multi_notremapped(sym: number): boolean {
  let k: number;
  const scfg = G.multi_scfg_default;
  if (is_joy_any(sym)) {
    const joystick_id = gmod(idiv(gmod(sym, PSEUDOKEY_JOY), JOY_ID), multi_MAXJOY);
    const button_id = gmod(gmod(sym, JOY_ID), multi_MAXBUTTON);
    k = scfg.joyaction[joystick_id][button_id];
  }
  else {
    const sc = multi_key_to_scan(sym);
    if (sc < 0 || sc >= multi_SCANCODES) return true;
    k = scfg.keyaction[sc];
  }
  if (k === 0) return true;
  k = idiv(k, 16);
  if (k > 3) k--; else if (k === 3) k = 0;
  return k > G.multi_players;
}

const elt = (a: number[], i: number): pref<number> => E<number>(a, i);

export function multi_sconfig_savers(scfg: multi_config, prefix: string): void {
  // unfortunately we cannot use key names here because SDL is not yet initialized
  for (let i = 0; i < multi_SCANCODES; i++)
    param_i(elt(scfg.keyaction, i), prefix + 'key:' + its(i));

  for (let i = 0; i < multi_MAXJOY; i++) {
    const pre = prefix + 'joystick ' + String.fromCharCode(65 + i);
    for (let j = 0; j < multi_MAXBUTTON; j++)
      param_i(elt(scfg.joyaction[i], j), pre + '-B' + its(j));
    for (let j = 0; j < multi_MAXAXE; j++) {
      param_i(elt(scfg.axeaction[i], j), pre + ' axis ' + its(j));
      param_i(elt(scfg.deadzoneval[i], j), pre + ' deadzone ' + its(j), 2000);
    }
    for (let j = 0; j < multi_MAXHAT; j++) for (let k = 0; k < 4; k++) {
      param_i(elt(scfg.hataction[i][j], k), pre + ' hat ' + its(j) + ' ' + 'URDL'[k]);
    }
  }
}

export function multi_clear_config(scfg: multi_config): void {
  for (let i = 0; i < multi_SCANCODES; i++) scfg.keyaction[i] = 0;
}

/** change_default_key(local_parameter_set& lps, ...): local parameter sets are not ported (config.ts) */
export function multi_change_default_key(..._a: unknown[]): void { throw new NotPorted('multi::change_default_key (local_parameter_set)'); }

/** SDL2 scancodes (SDL_scancode.h) of initConfig and handleInput */
const SDL_SCANCODE_W = 26, SDL_SCANCODE_D = 7, SDL_SCANCODE_S = 22, SDL_SCANCODE_A = 4, SDL_SCANCODE_KP_8 = 96,
  SDL_SCANCODE_KP_6 = 94, SDL_SCANCODE_KP_2 = 90, SDL_SCANCODE_KP_4 = 92, SDL_SCANCODE_F = 9, SDL_SCANCODE_G = 10,
  SDL_SCANCODE_H = 11, SDL_SCANCODE_R = 21, SDL_SCANCODE_T = 23, SDL_SCANCODE_Y = 28, SDL_SCANCODE_I = 12,
  SDL_SCANCODE_L = 15, SDL_SCANCODE_K = 14, SDL_SCANCODE_J = 13, SDL_SCANCODE_SEMICOLON = 51,
  SDL_SCANCODE_APOSTROPHE = 52, SDL_SCANCODE_P = 19, SDL_SCANCODE_LEFTBRACKET = 47, SDL_SCANCODE_UP = 82,
  SDL_SCANCODE_RIGHT = 79, SDL_SCANCODE_DOWN = 81, SDL_SCANCODE_LEFT = 80, SDL_SCANCODE_PAGEUP = 75,
  SDL_SCANCODE_PAGEDOWN = 78, SDL_SCANCODE_HOME = 74, SDL_SCANCODE_LCTRL = 224, SDL_SCANCODE_RCTRL = 228;

/** EX void initConfig() (called by config.cpp's initConfig, CAP_SHMUP) */
export function multi_initConfig(): void {
  const scfg = G.multi_scfg_default;

  const t = scfg.keyaction;

  // SDLVER >= 2
  t[SDL_SCANCODE_W] = 16 + 4;
  t[SDL_SCANCODE_D] = 16 + 5;
  t[SDL_SCANCODE_S] = 16 + 6;
  t[SDL_SCANCODE_A] = 16 + 7;

  t[SDL_SCANCODE_KP_8] = 16 + 4;
  t[SDL_SCANCODE_KP_6] = 16 + 5;
  t[SDL_SCANCODE_KP_2] = 16 + 6;
  t[SDL_SCANCODE_KP_4] = 16 + 7;

  t[SDL_SCANCODE_F] = 16 + pcFire;
  t[SDL_SCANCODE_G] = 16 + pcFace;
  t[SDL_SCANCODE_H] = 16 + pcFaceFire;
  t[SDL_SCANCODE_R] = 16 + pcDrop;
  t[SDL_SCANCODE_T] = 16 + pcOrbPower;
  t[SDL_SCANCODE_Y] = 16 + pcCenter;

  t[SDL_SCANCODE_I] = 32 + 4;
  t[SDL_SCANCODE_L] = 32 + 5;
  t[SDL_SCANCODE_K] = 32 + 6;
  t[SDL_SCANCODE_J] = 32 + 7;
  t[SDL_SCANCODE_SEMICOLON] = 32 + 8;
  t[SDL_SCANCODE_APOSTROPHE] = 32 + 9;
  t[SDL_SCANCODE_P] = 32 + 10;
  t[SDL_SCANCODE_LEFTBRACKET] = 32 + pcCenter;

  t[SDL_SCANCODE_UP] = 48;
  t[SDL_SCANCODE_RIGHT] = 48 + 1;
  t[SDL_SCANCODE_DOWN] = 48 + 2;
  t[SDL_SCANCODE_LEFT] = 48 + 3;
  t[SDL_SCANCODE_PAGEUP] = 48 + 4;
  t[SDL_SCANCODE_PAGEDOWN] = 48 + 5;
  t[SDL_SCANCODE_HOME] = 48 + 6;

  scfg.joyaction[0][0] = 16 + pcFire;
  scfg.joyaction[0][1] = 16 + pcOrbPower;
  scfg.joyaction[0][2] = 16 + pcDrop;
  scfg.joyaction[0][3] = 16 + pcCenter;
  scfg.joyaction[0][4] = 16 + pcFace;
  scfg.joyaction[0][5] = 16 + pcFaceFire;

  scfg.joyaction[1][0] = 32 + pcFire;
  scfg.joyaction[1][1] = 32 + pcOrbPower;
  scfg.joyaction[1][2] = 32 + pcDrop;
  scfg.joyaction[1][3] = 32 + pcCenter;
  scfg.joyaction[1][4] = 32 + pcFace;
  scfg.joyaction[1][5] = 32 + pcFaceFire;

  scfg.axeaction[0][0] = 4;
  scfg.axeaction[0][1] = 5;
  scfg.axeaction[0][2] = 2;
  scfg.axeaction[0][3] = 3;

  scfg.axeaction[1][0] = 8;
  scfg.axeaction[1][1] = 9;

  // ULRD
  scfg.hataction[0][0][0] = 16 + 0;
  scfg.hataction[0][0][1] = 16 + 3;
  scfg.hataction[0][0][2] = 16 + 1;
  scfg.hataction[0][0][3] = 16 + 2;
  scfg.hataction[0][1][0] = 16 + 4;
  scfg.hataction[0][1][1] = 16 + 7;
  scfg.hataction[0][1][2] = 16 + 5;
  scfg.hataction[0][1][3] = 16 + 6;

  scfg.hataction[1][0][0] = 32 + 0;
  scfg.hataction[1][0][1] = 32 + 3;
  scfg.hataction[1][0][2] = 32 + 1;
  scfg.hataction[1][0][3] = 32 + 2;
  scfg.hataction[1][1][0] = 32 + 4;
  scfg.hataction[1][1][1] = 32 + 7;
  scfg.hataction[1][1][2] = 32 + 5;
  scfg.hataction[1][1][3] = 32 + 6;

  const charidtable = [0, 1, 4, 6, 2, 3, 8];

  G.multi_scs = [];
  for (let i = 0; i < MAXPLAYER; i++) {
    G.multi_scs.push(new_charstyle()); // initcs(multi::scs[i])
    G.multi_scs[i].charid = charidtable[i];
  }

  G.multi_scs[0].uicolor = 0xC00000FF;
  G.multi_scs[1].uicolor = 0x00C000FF;
  G.multi_scs[2].uicolor = 0x0000C0FF;
  G.multi_scs[3].uicolor = 0xC0C000FF;
  G.multi_scs[4].uicolor = 0xC000C0FF;
  G.multi_scs[5].uicolor = 0x00C0C0FF;
  G.multi_scs[6].uicolor = 0xC0C0C0FF;

  set_char_by_name(G.multi_scs[2], 'rudy');
  set_char_by_name(G.multi_scs[5], 'princess');
  set_char_by_name(G.multi_scs[4], 'worker');
  G.multi_scs[4].skincolor = 0x303030FF;
  G.multi_scs[1].haircolor = 0x40FF40FF;

  // CAP_CONFIG
  const K = (c: string): number => c.charCodeAt(0);
  param_i(P('multi_players'), 'mode-number of players').be_non_editable();
  param_b(P('multi_split_screen'), 'splitscreen', false)
    .editable('split screen mode', K('s'));
  param_b(P('multi_pvp_mode'), 'pvp_mode', false)
    .editable('player vs player', K('v'));
  param_b(P('multi_friendly_fire'), 'friendly_fire', true)
    .editable('friendly fire', K('f'));
  param_b(P('multi_self_hits'), 'self_hits', false)
    .editable('self hits', K('h'));
  param_b(P('multi_two_focus'), 'two_focus', false)
    .editable('auto-adjust dual-focus projections', K('f'));
  param_b(P('multi_alwaysuse'), 'use configured keys');
  param_b(P('multi_multi_autojoy'), 'multi_autojoy')
    .editable('auto-accept moves', K('j'));

  for (let i = 0; i < 7; i++) paramset(G.multi_scs[i], 'player' + its(i));

  multi_sconfig_savers(scfg, '');
}

export function multi_get_actions(scfg: multi_config): void {
  // !ISMOBILE
  const keystate = SDL_GetKeyboardState();

  for (const a of G.multi_action_states_flat) { a.last = a.held; a.held = 0; }

  for (let i = 0; i < SHMUPAXES; i++) G.multi_axe_states[i] = 0;

  for (let i = 0; i < SDL_NUM_SCANCODES; i++) if (keystate[i])
    pressaction(scfg.keyaction[i]);

  // CAP_SDLJOY: the joysticks' buttons, hats and axes (no joysticks in the browser: sticks is empty)
}

/** static constexpr int pantable = 3 */
const pantable = 3;

// EX purehookset hooks_handleInput: G.multi_hooks_handleInput

export function multi_handleInput(delta: number, scfg: multi_config = G.multi_scfg_default): void {
  // CAP_SDL
  let d = delta / 500.;

  multi_get_actions(scfg);
  callhooks(G.multi_hooks_handleInput);

  const keystate = SDL_GetKeyboardState();

  if (keystate[SDL_SCANCODE_LCTRL] || keystate[SDL_SCANCODE_RCTRL]) d /= 5;

  const act = action_states(pantable);

  let panx = act[panRight].held - act[panLeft].held + G.multi_axe_states[2] / 32000.0;
  let pany = act[panDown].held - act[panUp].held + G.multi_axe_states[3] / 32000.0;

  let panspin = act[panRotateLeft].held - act[panRotateRight].held;

  let panmove = act[panScrollForward].held - act[panScrollBackward].held;

  if (GDIM() === 3)
    panmove += G.multi_axe_states[1] / 32000.0;
  else
    panspin += G.multi_axe_states[1] / 32000.0;

  if (act[panHome].held) { G.multi_centerplayer = -1; G.playermoved = true; centerpc(100); }

  if (pressed(act[panWorldOverview]))
    get_o_key()[1]();

  if (pressed(act[panReviewQuest]))
    showMissionScreen(true);

  // CAP_INV
  if (pressed(act[panInventory]) && G.inv_on)
    pushScreen(inv_show);

  if (pressed(act[panMenu]))
    pushScreen(showGameMenu);

  panx *= d;
  pany *= d;
  panspin *= d;
  panmove *= d;

  // CAP_MOUSEGRAB
  if (G.lctrlclick) {
    panx += G.mouseaim_x / 2;
    pany += G.mouseaim_y / 2;
    G.mouseaim_x = G.mouseaim_y = 0;
  }

  if (panx || pany || panspin || (GDIM() === 3 && panmove)) {
    if (GDIM() === 2) {
      G.current_display.view_matrix = tmuls(xpush(-panx), ypush(-pany), spin(panspin), G.current_display.view_matrix);
      G.playermoved = false;
    }
    else {
      G.current_display.view_matrix = tmuls(cspin(0, 2, -panx), cspin(1, 2, -pany), spin(panspin), cpush(2, panmove), G.current_display.view_matrix);
      if (panmove) G.playermoved = false;
    }
  }
}
import { SDL_GetKeyboardState, SDL_NUM_SCANCODES, SDL_GetScancodeFromKey, SDL_GetScancodeName, PSEUDOKEY_JOY, JOY_ID } from './sdl.ts';
import { is_joy_any, doexiton } from './control.ts';
import { gmod, callhooks, isize } from './hyper.ts';
import { idiv } from './cpp.ts';
import { param_i, param_b, paramset, new_charstyle, set_char_by_name, E, type pref } from './config.ts';
import { centerpc } from './hypgraph.ts';
import { get_o_key } from './menus.ts';
import { showMissionScreen, showGameMenu } from './quit.ts';
import { inv_show } from './inventory.ts';
import { tmuls, xpush, ypush, cspin, cpush } from './hyperpoint.ts';
import { spin } from './embeddings.ts';
import { popScreen } from './graph.ts';
import { dialog_handleNavigation } from './dialogs.ts';
