// crossbow.cpp of HyperRogue 13.1o: the crossbow mode (namespace bow). Package P7 (player).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// bowpoint.flags and the bp* flags are plain numbers here (flagtype in C++, only bits 0..2 are used).
// std::map operator[] (which inserts a default) is map_index of game.ts where the insertion is observable
// (target_at: its emptiness and its last key are read). println(hlog, ...) is left out. showMenu is UI (later).
import { achievement_count, achievement_gain_once } from './achievement.ts';
import { attackMonster, canAttack, monsterPushable, pushMonster } from './attack.ts';
import { addMessage } from './basegraph.ts';
import { miVALID } from './checkmove.ts';
import { GDIM } from './classes.ts';
import { kraken_head, mirror_breakMirror, mirror_createHere, mirror_reflect } from './complex.ts';
import {
  type eMonster, itCrossbow, itCurseWeakness, itOrbAether, itOrbSlaying, itOrbSpeed, moDragonHead, moHerdBull,
  moKrakenH, moKrakenT, moMimic, moPlayer, moRagingBull, moRusalka, moSleepBull, waCloud, waMirror, waMirrorWall,
} from './content.ts';
import { idiv, sortedKeys } from './cpp.ts';
import { inmirror, isAnyIvy, isDragon, isFriendly, isMimic, isNonblock, isStunnable, isWall } from './flags.ts';
import { map_index } from './game.ts';
import { G } from './globals.ts';
import { its } from './hprint.ts';
import {
  AF_BOW, AF_CRUSH, AF_FAST, AF_MSG, AF_STAB, AF_WEAK, among, hr_exception, isize, NotPorted, szgmod,
} from './hyper.ts';
import { C0, spintox, tC0, tmul } from './hyperpoint.ts';
import { spM, XLAT } from './language.ts';
import { cell, cellwalker, iteration_limit, movei, NODIR } from './locations.ts';
import { nonAdjacent, thruVine } from './mapeffects.ts';
import { logical_adjacent, P_BLOW, passable } from './passable.ts';
import { changes, pcmove, produceGhost, spread_plague } from './pcmove.ts';

/** enum eWeapon { wBlade, wCrossbow } */
export const bow_wBlade = 0, bow_wCrossbow = 1;
/** enum eCrossbowStyle { cbBull, cbGeodesic, cbGeometric } */
export const bow_cbBull = 0, bow_cbGeodesic = 1, bow_cbGeometric = 2;
export const bow_bowName = ['bull', 'geod', 'geom'];

export function bow_crossbow_mode(): boolean { return G.bow_weapon === bow_wCrossbow; }

/** struct bowpoint */
export class bowpoint {
  prev: cellwalker = new cellwalker();
  next: cellwalker = new cellwalker();
  flags = 0;
  clone(): bowpoint {
    const b = new bowpoint(); b.prev = this.prev.clone(); b.next = this.next.clone(); b.flags = this.flags; return b;
  }
}

/** struct bowscore */
export class bowscore {
  total = 0;
  last: cellwalker = new cellwalker();
  turns = 0;
  clone(): bowscore { const b = new bowscore(); b.total = this.total; b.last = this.last.clone(); b.turns = this.turns; return b; }
}

export const bow_bpFIRST = 1;
export const bow_bpLAST = 2;
export const bow_bpCOPIED = 4;

export function bow_loading_time(): number {
  return G.bow_style === bow_cbBull ? 3 : 4;
}

export function bow_blocks(c: cell): boolean {
  if (G.items[itOrbAether]) return false;
  if (isWall(c) && !among(c.wall, waMirrorWall, waMirror, waCloud) && !isNonblock(c.wall)) return true;
  // if(c->monst && isMultitile(c->monst)) return true;
  return false;
}

export function bow_qadd(a: cellwalker, b: cellwalker): number {
  if (!(a.at === b.at)) throw new hr_exception('hassert: a.at == b.at');
  for (let i = 0; i < a.at.type; i++) if (a.plus(i).eq(b)) return i;
  return NODIR;
}

let best_score_res = 0;

const BOLT_INVALID = -999999;

export function bow_bolt_score(cw2: cellwalker): number {
  cw2 = cw2.clone();
  const d = cw2.at.cpdist;
  let ntotal = 2;
  if (inmirror(cw2.at)) cw2 = mirror_reflect(cw2);
  if (bow_blocks(cw2.cpeek())) return BOLT_INVALID;
  if (thruVine(cw2.at, cw2.cpeek())) return BOLT_INVALID;
  if (nonAdjacent(cw2.at, cw2.cpeek())) return BOLT_INVALID;

  if (cw2.at.monst) {
    let attackflags = AF_BOW;
    if (G.items[itOrbSpeed] & 1) attackflags |= AF_FAST;
    if (G.items[itOrbSlaying]) attackflags |= AF_CRUSH;
    if (G.items[itCurseWeakness]) attackflags |= AF_WEAK;
    if (canAttack(cw2.cpeek(), moPlayer, cw2.at, cw2.at.monst, attackflags)) {
      let sco = 10;
      if (isFriendly(cw2.at)) sco = -50;
      ntotal += 1000 * sco; ntotal += (128 * sco) >> d;
    }
  }

  for (let t = 0; t < cw2.at.type; t++) {
    const c1 = cw2.at.cmove(t);
    if (!logical_adjacent(cw2.cpeek(), moPlayer, c1)) continue;
    if (canAttack(cw2.cpeek(), moPlayer, c1, c1.monst, AF_STAB)) {
      let sco = 10;
      if (isFriendly(c1)) sco = -50;
      ntotal += 1000 * sco; ntotal += (128 * sco) >> d;
    }
  }

  return ntotal;
}

export function bow_create_dirseq(): number[] {
  const scores = new Map<cell, bowscore>();
  map_index(scores, G.cwt.at, new bowscore()).total = 0;

  let best_score = BOLT_INVALID; let best_score_at = G.cwt.at;

  for (const c of G.dcal) {
    const c1 = map_index(G.bow_target_at, c.cpdist, null! as cell);
    if (c1 && c !== c1) continue;
    if (c === c1) { best_score = BOLT_INVALID; }
    const best = new bowscore();
    best.total = BOLT_INVALID;
    for (let i = 0; i < c.type; i++) {
      const c1 = c.move(i); if (!c1) continue;
      if (c1.cpdist < c.cpdist && scores.has(c1)) {
        const last = scores.get(c1)!;
        const ocw2 = new cellwalker(c, i);
        const bonus = bow_bolt_score(ocw2);
        // println(hlog, "at ", ocw2, " bonus is ", bonus);
        if (bonus === BOLT_INVALID) continue;
        let ntotal = last.total + bonus;

        let dir = 0;
        if (c.cpdist > 1) {
          dir = bow_qadd(last.last, ocw2.plusStep());
          const d = Math.abs(szgmod(dir, c1.type));
          if (d !== idiv(c1.type, 2)) {
            if (G.bow_style === bow_cbGeodesic) ntotal--;
            if (G.bow_style === bow_cbBull) continue;
          }
        }
        else {
          dir = bow_qadd(G.cwt, ocw2.plusStep());
        }
        if (ntotal > best.total) {
          best.total = ntotal;
          best.last = ocw2.clone();
          best.turns = dir;
        }
        best.total = Math.max(best.total, ntotal);
      }
    }
    if (best.total > best_score) { best_score = best.total; best_score_at = c; }
    if (best.total > BOLT_INVALID) scores.set(c, best.clone());
  }

  if (best_score === BOLT_INVALID) return [];

  const dirseq = [NODIR];
  while (best_score_at !== G.cwt.at) {
    const at = map_index(scores, best_score_at, new bowscore());
    dirseq.push(at.turns);
    best_score_at = at.last.cpeek();
  }
  dirseq.reverse();

  best_score_res = best_score;
  return dirseq;
}

export function bow_create_dirseq_geometric(): number[] {
  let tgt: cell = null!;
  for (const k of sortedKeys(G.bow_target_at)) tgt = G.bow_target_at.get(k)!;
  if (!tgt) return [];
  const h = tC0(G.currentmap.relative_matrix(tgt, G.cwt.at, C0()));
  let T = spintox(h);

  best_score_res = 0;
  let at = G.cwt.clone();
  const dirseq: number[] = [];
  while (true) {
    let best_i = -1;
    let best_y = Infinity;
    for (let i = 0; i < at.at.type; i++) {
      const at1 = at.plus(i);
      if (at1.cpeek().cpdist !== at.at.cpdist + 1) continue;
      const U = tmul(T, G.currentmap.adj(at.at, at1.spin));
      const U0 = tC0(U);
      const T0 = tC0(T);
      if (U0[0] < T0[0] + 1e-6) continue;
      let y: number;
      if (GDIM() === 3) y = Math.hypot(U0[1], U0[2]); else y = Math.abs(U0[1]) + (U0[1] > 0 ? 1e-6 : 0);
      if (y < best_y) { best_y = y; best_i = i; }
    }
    if (best_i < 0) {
      dirseq.push(NODIR);
      break;
    }
    at = at.plus(best_i);
    const bonus = bow_bolt_score(at.plusStep());
    if (bonus !== BOLT_INVALID) best_score_res += bonus;
    dirseq.push(best_i);
    if (bonus === BOLT_INVALID) break;
    T = tmul(T, G.currentmap.adj(at.at, at.spin));
    at = at.plusStep();
  }

  return dirseq;
}

/** struct bolt (local to create_path) */
class bolt {
  at: cellwalker;
  flags: number;
  constructor(cw: cellwalker, f: number) { this.at = cw.clone(); this.flags = f; }
  clone(): bolt { return new bolt(this.at, this.flags); }
}

export function bow_create_path(): number {
  const dirseq = G.bow_style === bow_cbGeometric ? bow_create_dirseq_geometric() : bow_create_dirseq();
  if (!dirseq.length) return -1;

  G.bow_bowpath.length = 0;
  let bolts: bolt[] = [new bolt(G.cwt, 0)];
  for (const m of G.mirror_mirrors) bolts.push(new bolt(m[1], bow_bpCOPIED));

  let broken_mirrors = new Set<cell>();

  for (const d of dirseq) {
    const first = !G.bow_bowpath.length;
    const nbolts: bolt[] = [];
    const next_broken_mirrors = new Set(broken_mirrors);
    for (const bolt0 of bolts) {
      const blt = bolt0.clone();
      const p = new bowpoint();
      G.bow_bowpath.push(p);
      p.prev = blt.at.clone();
      p.flags = blt.flags;
      if (first) p.flags |= bow_bpFIRST;
      if (d === NODIR || bow_blocks(blt.at.at)) { p.next = blt.at.clone(); p.flags |= bow_bpLAST; }
      else {
        if (inmirror(blt.at.at) || (blt.at.at.wall === waMirrorWall && inmirror(blt.at.plus(d).cpeek())))
          blt.at = mirror_reflect(blt.at);
        blt.at.add(d);
        p.next = blt.at.clone();
        blt.at.addStep();
        if (among(blt.at.at.wall, waCloud, waMirror) && !broken_mirrors.has(blt.at.at)) {
          const saved = G.mirror_mirrors;
          G.mirror_mirrors = [];
          mirror_createHere(blt.at, 0);
          const bmir = G.mirror_mirrors;
          G.mirror_mirrors = saved;
          for (const b of bmir) nbolts.push(new bolt(b[1], blt.flags));
          next_broken_mirrors.add(blt.at.at);
        }
        nbolts.push(blt.clone());
      }
    }
    bolts = nbolts;
    broken_mirrors = next_broken_mirrors;
  }

  return best_score_res;
}

export function bow_clear_bowpath(): void {
  G.bow_bowpath_map.clear();
}

export function bow_gen_bowpath_map(): void {
  G.bow_bowpath_map = new Map();
  for (const b of G.bow_bowpath) map_index(G.bow_bowpath_map, b.next.at, [] as bowpoint[]).push(b.clone());
}

export function bow_auto_path(): boolean {
  G.bow_target_at = new Map();
  G.bow_target_at.set(1, G.cwt.cpeek());
  return bow_create_path() >= 10000;
}

export function bow_switch_fire_mode(): void {
  if (!bow_crossbow_mode()) { addMessage(XLAT('You fire an angry glance at your enemies.')); return; }
  if (!G.bow_fire_mode) {
    addMessage(G.items[itCrossbow] ? XLAT('Note: cannot fire again yet. Turns to reload: %1.', its(G.items[itCrossbow])) : XLAT('Fire crossbow! Click to aim, click again to confirm.'));
    G.bow_fire_mode = true;
    bow_clear_bowpath();
    G.bow_target_at = new Map();
  }
  else if (G.bow_fire_mode) {
    addMessage(G.items[itCrossbow] ? XLAT('Fire mode disabled.') : XLAT('Firing cancelled.'));
    G.bow_fire_mode = false;
    bow_clear_bowpath();
  }
}

export function bow_add_fire(c: cell): void {
  const emp = G.bow_target_at.size === 0;
  const t = map_index(G.bow_target_at, c.cpdist, null! as cell);
  if (t === c && G.bow_bowpath.length) {
    if (G.items[itCrossbow]) {
      bow_clear_bowpath();
      addMessage(XLAT('Cannot fire again yet. Turns to reload: %1.', its(G.items[itCrossbow])));
      G.bow_fire_mode = false;
      return;
    }
    bow_clear_bowpath();
    G.checked_move_issue.type = miVALID;
    const pcm = new pcmove();
    pcm.checkonly = false;
    changes.init(false);
    addMessage(XLAT('Fire!'));
    const b = pcm.try_shooting(false);
    if (!b) changes.rollback();
    G.bow_fire_mode = false;
  }
  else {
    G.bow_target_at.set(c.cpdist, c);
    if (G.bow_style === bow_cbGeometric) { G.bow_target_at = new Map(); G.bow_target_at.set(c.cpdist, c); }
    const res = bow_create_path();
    if (res === -1) {
      if (!emp) {
        G.bow_target_at = new Map();
        bow_add_fire(c);
      }
      else {
        addMessage(XLAT('No way to hit this place.'));
        G.bow_bowpath = [];
      }
    }
    bow_gen_bowpath_map();
  }
}

/** enum eMouseFireMode { mfmNone, mfmPriority, mfmAlways } */
export const bow_mfmNone = 0, bow_mfmPriority = 1, bow_mfmAlways = 2;

export function bow_fire_on_mouse(_c: cell): boolean {
  if (!bow_crossbow_mode()) return false;
  if (G.bow_mouse_fire_mode === bow_mfmNone) return false;
  if (!G.mouseover) return false;
  if (!G.mouseover.monst) return false;
  if (isFriendly(G.mouseover)) return false;
  if (G.shmup_on) return false;
  if (G.items[itCrossbow]) {
    if (G.bow_mouse_fire_mode === bow_mfmAlways) {
      addMessage(XLAT('Cannot fire again yet. Turns to reload: %1.', its(G.items[itCrossbow])));
      return true;
    }
    return false;
  }
  G.bow_target_at = new Map();
  G.bow_target_at.set(G.mouseover.cpdist, G.mouseover);
  const res = bow_create_path();
  if (res <= 0) {
    if (G.bow_mouse_fire_mode === bow_mfmAlways) {
      addMessage(XLAT('Shooting impossible.'));
      return true;
    }
    return false;
  }
  bow_gen_bowpath_map();
  G.checked_move_issue.type = miVALID;
  const pcm = new pcmove();
  pcm.checkonly = false;
  changes.init(false);
  addMessage(XLAT('Fire!'));
  const b = pcm.try_shooting(false);
  if (!b) changes.rollback();
  if (G.bow_mouse_fire_mode === bow_mfmAlways) return true;
  return b;
}

export function bow_shoot(): void {
  let attackflags = AF_BOW;
  if (G.items[itOrbSpeed] & 1) attackflags |= AF_FAST;
  if (G.items[itOrbSlaying]) attackflags |= AF_CRUSH;
  if (G.items[itCurseWeakness]) attackflags |= AF_WEAK;

  const pushes: bowpoint[] = [];

  // for achievements
  const kills = new Set<eMonster>();
  const healthy_dragons: [cell, number][] = [];
  const kraken_hits = new Map<cell, [number, number]>();
  let dragon_hits = 0;
  G.bow_rusalka_curses = 0;

  // for achievements
  for (const mov of G.bow_bowpath) {
    const c = mov.prev.at;
    if (c.monst === moDragonHead) {
      let healthy = true;
      let c1 = c;
      let qty = 0;
      for (let i = 0; i < iteration_limit; i++) {
        if (!isDragon(c1)) break;
        if (!c1.hitpoints) { healthy = false; break; }
        if (c1.mondir === NODIR) break;
        c1 = c1.move(c1.mondir);
        qty++;
      }
      if (healthy) healthy_dragons.push([c, qty]);
    }
    if (c.monst === moKrakenT && c.hitpoints) {
      map_index(kraken_hits, kraken_head(c), [0, 0] as [number, number])[0]++;
    }
  }

  for (const mov of G.bow_bowpath) {
    const c = mov.prev.at;
    const cf = mov.prev.cpeek();
    if (!c) continue;
    const who = (mov.flags & bow_bpCOPIED) ? moMimic : moPlayer;

    if (c !== cf) for (let t = 0; t < cf.type; t++) {
      const c1 = cf.cmove(t);
      if (!c) continue;

      let stabthere = false;
      if (logical_adjacent(c, moPlayer, c1)) stabthere = true;

      if (stabthere && canAttack(cf, who, c1, c1.monst, AF_STAB)) {
        G.hit_anything = true;
        changes.ccell(c1);
        const m = c.monst;
        if (attackMonster(c1, AF_STAB | AF_MSG, who)) {
          achievement_count('STAB', 1, 0);
          spread_plague(c1, cf, t, moPlayer);
          produceGhost(c, m, moPlayer);
        }
      }
    }

    mirror_breakMirror(mov.next, -1);
    const m = c.monst;
    if (!m || isMimic(m)) continue;
    if (m === moKrakenH) continue;

    if (!canAttack(cf, who, c, m, attackflags)) {
      if (among(m, moSleepBull, moHerdBull)) {
        changes.ccell(c);
        addMessage(XLAT('%The1 is enraged!', spM(m)));
        c.monst = moRagingBull;
        G.hit_anything = true;
        continue;
      }
      else {
        const pcm = new pcmove(); pcm.mi = movei.cw(mov.prev).rev();
        pcm.tell_why_cannot_attack();
        continue;
      }
    }
    changes.ccell(c);

    let push = (!!G.items[itCurseWeakness] || (isStunnable(c.monst) && c.hitpoints > 1));
    push = push && (!(mov.flags & bow_bpLAST) && monsterPushable(c));

    // for achievements
    if (isDragon(m)) dragon_hits++;
    if (m === moKrakenT && c.hitpoints) map_index(kraken_hits, kraken_head(c), [0, 0] as [number, number])[1]++;

    if (m && attackMonster(c, attackflags | AF_MSG, who)) G.hit_anything = true;

    if (m === moRusalka) G.bow_rusalka_curses++;

    if (!c.monst || isAnyIvy(m)) {
      spread_plague(cf, c, movei.cw(mov.prev).rev().d, moPlayer);
      produceGhost(c, m, moPlayer);
      kills.add(m);
    }

    if (push) pushes.push(mov);
  }

  while (pushes.length) {
    const mov = pushes[pushes.length - 1];
    const c = mov.prev.at;
    const ct = mov.next.cpeek();
    const can_push = passable(ct, c, P_BLOW);
    if (can_push) {
      G.hit_anything = true;
      changes.ccell(c);
      changes.ccell(ct);
      pushMonster(movei.cw(mov.next));
    }
    pushes.pop();
  }

  G.bow_bowpath.reverse();

  // three achievements:
  achievement_count('BOWVARIETY', kills.size, 0);

  for (const p of healthy_dragons) {
    const c = p[0];
    if (c.monst !== moDragonHead && dragon_hits >= p[1])
      achievement_gain_once('BOWDRAGON');
  }

  for (const k of sortedKeys(kraken_hits)) {
    const kh = kraken_hits.get(k)!;
    if (kh[0] === 3 && kh[1] === 3) {
      if (map_index(G.kraken_half_killed, k, false)) achievement_gain_once('BOWKRAKEN');
      else G.kraken_half_killed.set(k, true);
    }
  }

  bow_gen_bowpath_map();
}

export function bow_have_bow_target(): cell {
  if (!bow_crossbow_mode()) return null!;
  if (G.items[itCrossbow]) return null!;

  const bp = G.bow_bowpath.map(b => b.clone());
  const bpm = new Map(G.bow_bowpath_map);
  try {
    for (let i = 0; i < isize(G.dcal); i++) {
      const c = G.dcal[i];
      G.bow_target_at = new Map();
      G.bow_target_at.set(c.cpdist, c);

      const res = bow_create_path();
      if (res === -1) continue;

      G.checked_move_issue.type = miVALID;
      const pcm = new pcmove();
      pcm.checkonly = true;
      changes.init(true);
      const b = pcm.try_shooting(false);
      changes.rollback();

      if (b) return c;
    }
    return null!;
  }
  finally {
    G.bow_bowpath = bp;
    G.bow_bowpath_map = bpm;
  }
}

/** showMenu(): the weapon selection dialog (UI, a later stage) */
export function bow_showMenu(): void { throw new NotPorted('bow::showMenu (UI)'); } // STAGE1-STUB
