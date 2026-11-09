// checkmove.cpp of HyperRogue 13.1o: check the validity of moves (the checkmate rule). Package P7 (player).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// The namespace multi's checkonly/aftermove are G.multi_checkonly/G.multi_aftermove. println(hlog, ...) debug
// output is left out.
import { achievement_final } from './achievement.ts';
import { canAttack, flashWouldKill, gun_targets, tkills } from './attack.ts';
import { celldistance, isNeighbor } from './cell.ts';
import { S3 } from './classes.ts';
import { elec_affected, elec_builder, sword_pos_n, sword_shift } from './complex.ts';
import { camelot_knight_name } from './complex2.ts';
import {
  type eMonster, itOrbAether, itOrbDomination, itOrbEmpathy, itOrbFire, itOrbFish, itOrbFreedom, itOrbRecall,
  itOrbSafety, itOrbShell, itOrbShield, itOrbSpeed, itOrbSword, itOrbSword2, itOrbYendor, itWarning, laBrownian,
  laPower, moAirball, moArrowTrap, moCrushball, moCrusher, moEnergySword, moFireball, moHexSnake, moKnight,
  moKrakenT, moLancer, moLightningBolt, moOutlaw, moPlayer, moSwitch1, moSwitch2, moTentacle, moTongue, moWarning,
  moWitchFlash, moWitchSpeed, moWorm, waArrowTrap, waBoat, waNone, waRoundTable, WF_ON, winf,
} from './content.ts';
import { pushScreen } from './control.ts';
import { dynamicval, idiv, time } from './cpp.ts';
import { bow_have_bow_target } from './crossbow.ts';
import { HF_OUTLAW } from './environment.ts';
import { isArmedEnemy, isFriendly } from './flags.ts';
import { activateRecall } from './game.ts';
import { G } from './globals.ts';
import { its } from './hprint.ts';
import { AF_NEXTTURN, among, isize, MD_UNDECIDED } from './hyper.ts';
import { inv_check, inv_compute, inv_show } from './inventory.ts';
import { gold } from './items.ts';
import { dnameof, dnameof_w, spW, XLAT } from './language.ts';
import { cell, movei } from './locations.ts';
import { multi_playerActive } from './multi.ts';
import { haveRangedTarget, markOrb, markOrb2 } from './orbs.ts';
import { logical_adjacent, passable, passable_for } from './passable.ts';
import { changes, isPlayerOn, movepcto, movepcto_md, warningprotection } from './pcmove.ts';
import { showMissionScreen } from './quit.ts';
import { yendor_state, ysUnlocked } from './yendor.ts';

export const PUREHARDCORE_LEVEL = 10;

export function pureHardcore(): boolean { return G.hardcore && G.hardcoreAt < PUREHARDCORE_LEVEL; }

/** struct moveissue */
export class moveissue {
  type = 0;
  subtype = 0;
  monster: eMonster = 0;
  where: cell = null!;
  constructor(type = 0, subtype = 0, monster: eMonster = 0, where: cell = null!) {
    this.type = type; this.subtype = subtype; this.monster = monster; this.where = where;
  }
}

/** a copy of a moveissue (G's moveissues may be plain objects) */
export function moveissue_copy(m: moveissue): moveissue { return new moveissue(m.type, m.subtype, m.monster, m.where); }

export const miVALID = 10000;
export const miENTITY = 11000;
export const miRESTRICTED = 10100;
export const miTHREAT = 10010;
export const miWALL = 10001;

export const siWALL = 1;
export const siMONSTER = 2;
export const siGRAVITY = 3;
export const siROSE = 4;
export const siITEM = 5;
export const siWIND = 6;
export const siCURRENT = 7;
export const siFATIGUE = 8;
export const siWARP = 9;
export const siUNKNOWN = 10;

export function check_if_monster(): void {
  const m = G.cwt.peek().monst;
  if (m && m !== G.passive_switch && !isFriendly(m))
    G.checked_move_issue = new moveissue(miENTITY, siMONSTER, m, G.cwt.peek());
}

export function hasSafeOrb(c: cell): boolean {
  return c.item === itOrbSafety ||
    c.item === itOrbShield ||
    c.item === itOrbShell ||
    (c.item === itOrbYendor && yendor_state(c) === ysUnlocked);
}

/** struct player_move_info */
export class player_move_info {
  mi: movei;
  swordlast: cell[] = [null!, null!];
  swordtransit: cell[] = [null!, null!];
  swordnext: cell[] = [null!, null!];
  constructor(_mi: movei) {
    this.mi = _mi.clone();
    const mi = this.mi;
    for (let b = 0; b < 2; b++) this.swordlast[b] = sword_pos_n(G.multi_cpid, b !== 0);

    const cpid = G.multi_cpid;
    const x7 = dynamicval(() => G.sword_dir[cpid], (v) => { G.sword_dir[cpid] = v; }, sword_shift(mi, G.sword_dir[cpid]));
    try {
      for (let b = 0; b < 2; b++) {
        this.swordnext[b] = sword_pos_n(G.multi_cpid, b !== 0);
        this.swordtransit[b] = null!;
        if (this.swordnext[b] && this.swordnext[b] !== this.swordlast[b] && !isNeighbor(this.swordlast[b], this.swordnext[b])) {
          const sn = this.swordnext[b];
          for (let i = 0; i < sn.type; i++) {
            const c2 = sn.move(i); if (!c2) continue;
            if (c2 !== mi.t && c2 !== mi.s && isNeighbor(c2, S3() === 3 ? this.swordlast[b] : mi.t))
              this.swordtransit[b] = c2;
          }
          if (S3() === 4)
            for (let i = 0; i < mi.s.type; i++) {
              const c2 = mi.s.move(i); if (!c2) continue;
              if (c2 !== mi.s && isNeighbor(c2, this.swordlast[b]))
                this.swordtransit[b] = c2;
            }
        }
      }
    }
    finally { x7.restore(); }
  }
}

export function krakensafe(c: cell): boolean {
  return !!G.items[itOrbFish] || !!G.items[itOrbAether] ||
    (c.item === itOrbFish && c.wall === waBoat) ||
    (c.item === itOrbAether && c.wall === waBoat);
}

export function monstersnear(c: cell, who: eMonster): boolean {

  let eaten = false;

  if (G.hardcore && who === moPlayer) return false;

  let res = 0;
  let fast = false;
  let kraken_will_destroy_boat = false;

  return elec_builder(() => {
    if (elec_affected(c)) { G.who_kills_me = moLightningBolt; G.who_kills_me_cell = null!; res++; }

    if (c.wall === waArrowTrap && c.wparam === 2) {
      G.who_kills_me = moArrowTrap; G.who_kills_me_cell = null!; res++;
    }

    for (const c1 of G.crush_now) if (c === c1) {
      G.who_kills_me = moCrusher; G.who_kills_me_cell = null!; res++;
    }

    if (who === moPlayer || G.items[itOrbEmpathy]) {
      fast = !!(G.items[itOrbSpeed] && (G.items[itOrbSpeed] & 1));
      if (who === moPlayer && !isPlayerOn(c) && c.item === itOrbSpeed && !G.items[itOrbSpeed]) fast = true;
    }

    if (G.havewhat & HF_OUTLAW) {
      for (const c1 of gun_targets(c))
        if (c1.monst === moOutlaw && !c1.stuntime) {
          res++; G.who_kills_me = moOutlaw; G.who_kills_me_cell = c1;
        }
    }

    for (let t = 0; t < c.type; t++) {
      const c2 = c.move(t);

      // consider monsters who attack from distance 2
      if (c2) for (let i = 0; i < c2.type; i++) {
        const c3 = c2.move(i); if (!c3) continue;
        if (c3 === c) continue;
        // only these monsters can attack from two spots...
        if (!among(c3.monst, moLancer, moWitchSpeed, moWitchFlash))
          continue;
        if (c3.monst === moWitchSpeed && G.cwt.at.land !== laPower)
          continue;
        // take logical_adjacent into account
        if (c3.monst !== moWitchFlash)
          if (!logical_adjacent(c3, c3.monst, c2) || !logical_adjacent(c2, c3.monst, c) || (c3.monst === moWitchSpeed && c2.land !== laPower))
            continue;
        if (elec_affected(c3)) continue;
        if (c3.stuntime > (who === moPlayer ? 0 : 1)) continue;
        // speedwitches can only attack not-fastened monsters,
        // others can only attack if the move is not fastened
        if (c3.monst === moWitchSpeed && G.items[itOrbSpeed]) continue;
        if (c3.monst !== moWitchSpeed && fast) continue;
        // cannot attack if the immediate cell is impassable (except flashwitches)
        if (c3.monst !== moWitchFlash) {
          if (!passable(c2, c3, 0n)) continue;
          if (isPlayerOn(c2) && G.items[itOrbFire]) continue;
        }
        // flashwitches cannot attack if it would kill another enemy
        if (c3.monst === moWitchFlash && flashWouldKill(c3, 0n)) continue;
        res++, G.who_kills_me = c3.monst; G.who_kills_me_cell = c3;
      }

      // consider normal monsters
      if (c2 && isArmedEnemy(c2, who)) {
        const m = c2.monst;
        if (elec_affected(c2)) continue;
        if (fast && c2.monst !== moWitchSpeed) continue;
        // Krakens just destroy boats
        if (who === moPlayer && c2.monst === moKrakenT && c.wall === waBoat && !G.peace_on) {
          kraken_will_destroy_boat = true;
          continue;
        }
        // they cannot attack through vines
        if (!canAttack(c2, c2.monst, c, who, AF_NEXTTURN)) continue;
        if (c2.monst === moWorm || c2.monst === moTentacle || c2.monst === moHexSnake) {
          if (passable_for(c2.monst, c, c2, 0n))
            eaten = true;
          else if (c2.monst !== moHexSnake) continue;
        }
        res++, G.who_kills_me = m; G.who_kills_me_cell = c2;
      }
    }

    if (kraken_will_destroy_boat && !krakensafe(c) && warningprotection(XLAT('This move appears dangerous -- are you sure?'))) {
      if (res === 0) G.who_kills_me = moWarning;
      G.who_kills_me_cell = null!;
      res++;
    } else {
      if (who === moPlayer && res && (markOrb2(itOrbShield) || markOrb2(itOrbShell)) && !eaten)
        res = 0;
      if (who === moPlayer && res && markOrb2(itOrbDomination) && c.monst)
        res = 0;
    }

    return !!res;
  });
}

export function monstersnear_aux(): boolean {
  changes.value_set(G, 'passive_switch', (gold() & 1) ? moSwitch1 : moSwitch2);
  G.multi_cpid++;
  let b = false;
  if (G.multi_cpid === G.multi_players || G.multi_players === 1 || G.multi_checkonly) {

    if (G.shmup_delayed_safety) return false;

    const pmi = G.pmi;
    for (let i = 0; i < isize(pmi); i++)
      for (let j = 0; j < isize(pmi); j++) if (i !== j) {
        if (swordConflict(pmi[i], pmi[j])) {
          b = true;
          G.who_kills_me = moEnergySword;
        }
        if (pmi[i].mi.t === pmi[j].mi.t)
        { b = true; G.who_kills_me = moFireball; }
        if (celldistance(pmi[i].mi.t, pmi[j].mi.t) > 8)
        { b = true; G.who_kills_me = moAirball; }
      }

    for (const pushto of G.pushes)
      for (const mi of pmi)
        if (pushto === mi.mi.t) {
          b = true; G.who_kills_me = moTongue;
        }

    for (let i = 0; i < isize(G.pushes); i++)
      for (let j = 0; j < i; j++)
        if (G.pushes[i] === G.pushes[j]) {
          b = true; G.who_kills_me = moCrushball;
        }

    for (let i = 0; !b && i < isize(pmi); i++)
      b = monstersnear(pmi[i].mi.t, moPlayer);
  }
  else b = !multimove();
  G.multi_cpid--;
  return b;
}

/** like monstersnear but add the potential moves of other players into account */
export function monstersnear_add_pmi(pmi0: player_move_info): boolean {
  if (G.suicidal) {
    G.who_kills_me = moPlayer; G.who_kills_me_cell = null!;
    return true;
  }
  G.pmi.push(pmi0);
  const b = monstersnear_aux();
  G.pmi.pop();
  return b;
}

export function multimove(): boolean {
  if (G.multi_cpid === 0) G.lastkills = tkills();
  if (!multi_playerActive(G.multi_cpid)) return !monstersnear_aux();
  const bcwt = G.cwt.clone();
  G.cwt = G.multi_player[G.multi_cpid].clone();
  const b = movepcto_md(G.multi_whereto[G.multi_cpid]);
  if (b) {
    G.multi_aftermove = true;
    G.multi_player[G.multi_cpid] = G.cwt.clone();
    G.multi_whereto[G.multi_cpid].d = MD_UNDECIDED;
    const curkills = tkills();
    G.multi_kills[G.multi_cpid] += (curkills - G.lastkills);
    G.lastkills = curkills;
  }
  G.cwt = bcwt;
  return b;
}

export function swordConflict(sm1: player_move_info, sm2: player_move_info): boolean {
  if (G.items[itOrbSword] || G.items[itOrbSword2])
    for (let b = 0; b < 2; b++)
      if (sm1.mi.s === sm2.swordlast[b] || sm1.mi.s === sm2.swordtransit[b] || sm1.mi.s === sm2.swordnext[b])
        if (sm1.mi.t === sm2.swordlast[b] || sm1.mi.t === sm2.swordtransit[b] || sm1.mi.t === sm2.swordnext[b])
          return true;
  return false;
}

export function blocking_monster_name(mi: moveissue): string {
  // CAP_COMPLEX2
  if (mi.monster === moKnight && mi.where)
    return XLAT('%1 the Knight', camelot_knight_name(mi.where));
  else
    return dnameof(mi.monster);
}

/** std::string operator< (byte order; the names are ASCII) */
function strcmp(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }

export function create_yasc_message(): void {
  // set<pair<cell*, string>> captures: kept sorted by (cell address, string); addresses -> creation serial
  const captures: [cell, string][] = [];
  const capcmp = (x: [cell, string], y: [cell, string]): number =>
    (x[0] ? x[0]._id : -1) - (y[0] ? y[0]._id : -1) || strcmp(x[1], y[1]);
  const capcount = (x: [cell, string]): boolean => captures.some(y => capcmp(x, y) === 0);
  const all = G.move_issues.map(m => moveissue_copy(m));
  all.push(moveissue_copy(G.stay_issue));
  for (const c of all) if (c.type === miTHREAT) {
    const e: [cell, string] = [c.where, blocking_monster_name(c)];
    if (!capcount(e)) { captures.push(e); captures.sort(capcmp); }
  }

  const context: string[] = [];
  if (captures.length) {
    let msg = 'captured by ';
    const qties = new Map<string, number>();
    for (const ca of captures) qties.set(ca[1], (qties.get(ca[1]) ?? 0) + 1);
    let iqties = 0;
    const qkeys = [...qties.keys()].sort(strcmp);
    for (const k of qkeys) {
      if (iqties && iqties === qties.size - 1) msg += ' and ';
      else if (iqties) msg += ', ';
      msg += k;
      if (qties.get(k)! > 1) msg += ' (x' + its(qties.get(k)!) + ')';
      iqties++;
    }
    context.push(msg);
  }

  let idx = 0;
  for (const c of all) if (idx === 0 && c.subtype === siROSE) context.push('rosed'), idx = 1;
  for (const c of all) if (idx < 2 && c.subtype === siWIND) context.push('blown away'), idx = 2;
  for (const c of all) if (idx < 3 && c.subtype === siGRAVITY) context.push('falling'), idx = 3;
  for (const c of all) if (idx < 4 && c.subtype === siFATIGUE) context.push('fatigued'), idx = 4;
  for (const c of all) if (idx < 5 && c.subtype === siCURRENT) context.push('whirled'), idx = 5;

  let in_ctx = true;

  const blocks = new Set<string>();
  for (const c of all) {
    if (c.type === miENTITY && !capcount([c.where, blocking_monster_name(c)])) blocks.add(blocking_monster_name(c));
    else if (c.type === miWALL && c.subtype === siMONSTER && !capcount([c.where, blocking_monster_name(c)])) blocks.add(blocking_monster_name(c));
    else if (c.subtype === siITEM) blocks.add('item');
    else if (c.subtype === siWALL) {
      if (c.where === G.cwt.at) {
        if (in_ctx) {
          if (c.where.wall === waNone && c.where.land === laBrownian)
            context.push('on level 3');
          else if (c.where.wall === waRoundTable)
            context.push('being polite');
          else
            context.push((winf[c.where.wall].flags & WF_ON) ? XLAT('on %the1', spW(c.where.wall)) : XLAT('in %the1', spW(c.where.wall)));
        }
        in_ctx = false;
      }
      else if (c.where && c.where.wall !== G.cwt.at.wall) blocks.add(dnameof_w(c.where.wall));
    }
    else if (c.type === siWARP) blocks.add('warp');
  }

  if (blocks.size) {
    let block = 'blocked by ';
    let iqties = 0;
    for (const q of [...blocks].sort(strcmp)) {
      if (iqties && iqties === blocks.size - 1) block += ' and ';
      else if (iqties) block += ', ';
      block += q;
      iqties++;
    }
    context.push(block);
  }

  G.yasc_message = '';
  let iqties = 0;
  for (const ctx of context) {
    if (iqties === 0) { /* */ }
    else if (iqties === 1) G.yasc_message += ' while ';
    else if (iqties === isize(context) - 1) G.yasc_message += ' and ';
    else G.yasc_message += ', ';
    G.yasc_message += ctx;
    iqties++;
  }

  if (captures.length === 2 && context.length === 1 && G.cwt.at.type === 6) {
    const dirs: number[] = [];
    for (let i = 0; i < G.cwt.at.type; i++) {
      const c1 = G.cwt.at.move(i); if (!c1) continue;
      for (const cap of captures) if (cap[0] === c1) dirs.push(i);
    }
    if (isize(dirs) === 2 && Math.abs(dirs[0] - dirs[1]) === 3) {
      const c1 = captures[1];
      G.yasc_message = XLAT('pinched by %the1 and %the2', captures[0][1], c1[1]);
    }
  }

  // println(hlog, "YASC_MESSAGE: ", yasc_message);
}

function yasc_recode(x: number): number {
  if (G.cwt.at.type < 10 || x === 0) return x;
  return yasc_recode(idiv(x, 10)) * 100 + (x % 10);
}

export function checkmove(complete: boolean): void {
  if (!complete) { G.attempts = 0; G.movehints_ticks = 0; }
  if (G.dual_state === 2) return;
  if (G.shmup_on) return;

  const gs = dynamicval(() => G.gravity_state, (v) => { G.gravity_state = v; }, G.gravity_state);
  try {
    // CAP_INV
    if (G.inv_on) inv_compute();

    if (G.multi_players > 1 && !G.multi_checkonly) return;
    if (G.hardcore) return;

    G.legalmoves.length = 0; for (let i = 0; i < G.cwt.at.type + 1; i++) G.legalmoves.push(false);
    G.move_issues.length = 0; for (let i = 0; i < G.cwt.at.type; i++) G.move_issues.push(new moveissue());

    G.canmove = haveRangedTarget(complete);
    G.items[itWarning] += 2;
    if (movepcto(-1, 0, true))
      G.canmove = G.legalmoves[G.cwt.at.type] = true;
    G.stay_issue = moveissue_copy(G.checked_move_issue);

    if (true) {
      for (let i = 0; i < G.cwt.at.type; i++) {
        const fm = dynamicval(() => G.bow_fire_mode, (v) => { G.bow_fire_mode = v; }, false);
        try {
          if (movepcto(1, -1, true)) {
            G.canmove = G.legalmoves[G.cwt.spin] = true;
          }
          check_if_monster();
          G.move_issues[G.cwt.spin] = moveissue_copy(G.checked_move_issue);
          if (!G.legalmoves[G.cwt.spin]) {
            if (movepcto(0, 1, true)) {
              G.canmove = G.legalmoves[G.cwt.spin] = true;
            }
            check_if_monster();
            G.move_issues[G.cwt.spin] = moveissue_copy(G.checked_move_issue);
          }
        }
        finally { fm.restore(); }
      }
    }
    if (G.kills[moPlayer]) G.canmove = false;

    G.yasc_code = 0;
    for (let i = 0; i < G.cwt.at.type; i++)
      G.yasc_code += yasc_recode(G.move_issues[i].type);

    G.bowtarget = (!G.canmove || complete) ? bow_have_bow_target() : null!;

    if (G.bowtarget) G.canmove = true;

    // CAP_INV
    if (G.inv_on && !G.canmove && !G.inv_incheck) {
      if (G.inv_remaining[itOrbSafety] || G.inv_remaining[itOrbFreedom])
        G.canmove = true;
      else {
        inv_check(1);
        checkmove(complete);
        inv_check(-1);
      }
      if (G.canmove)
        pushScreen(inv_show);
    }

    if (!G.canmove) {
      create_yasc_message();
      achievement_final(true);
      if ((G.cmode & sm_NORMAL) !== 0n) showMissionScreen(true);
    }
    else G.yasc_message = '';

    if (G.canmove && G.timerstopped) {
      G.timerstart = time();
      G.timerstopped = false;
    }
    G.items[itWarning] -= 2;

    if (G.recallCell.at && !markOrb(itOrbRecall)) activateRecall();
  }
  finally { gs.restore(); }
}

/** sm::NORMAL (graph.cpp) */
const sm_NORMAL = 1n;
