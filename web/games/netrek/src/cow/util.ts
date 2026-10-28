// @ts-nocheck
// COW 3.3.3 util.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { struct_obtype } from './structs.ts';
import { $peq, $sadd, G, hypot } from '../rt/index.ts';
import { ASSAULT, GWIDTH, MAXPLANETS, MAXPLAYER, PALIVE, PFCLOAK, PLANETTYPE, PLAYERTYPE, SCALE, STARBASE, TARG_CLOAK, TARG_ENEMY, TARG_FRIEND, TARG_PLANET, TARG_PLAYER, TARG_SELF, TWINSIDE } from './consts.ts';

let _target: struct_obtype;

export function angdist(x: number, y: number): number {
  let res = 0;
  if (x > y) {
    res = x - y & 0xff;
  } else {
    res = y - x & 0xff;
  }
  if (res > 128) {
    return 256 - res;
  }
  return res;
}

export function gettarget(ww: Ptr | null, x: number, y: number, targtype: number): struct_obtype | null {
  let g_x = 0;
  let g_y = 0;
  let targ = null;
  if ($peq(ww, G.mapw)) {
    g_x = Math.imul(x, GWIDTH) / (G.small_screen ? 400 : 500) | 0;
    g_y = Math.imul(y, GWIDTH) / (G.small_screen ? 400 : 500) | 0;
  } else {
    g_x = G.me.p_x + Math.imul(x - (TWINSIDE / 2 | 0), SCALE);
    g_y = G.me.p_y + Math.imul(y - (TWINSIDE / 2 | 0), SCALE);
  }
  targ = gettarget2(g_x, g_y, targtype);
  return targ;
}

export function gettarget2(x: number, y: number, targtype: number): struct_obtype | null {
  let i = 0;
  let j = null;
  let k = null;
  let dist = 0;
  let closedist = 0;
  let friendly = 0;
  closedist = GWIDTH;
  if (targtype & TARG_PLANET) {
    for (i = 0, k = $sadd(G.planets, i); i < MAXPLANETS; ++i, k = $sadd(k, 1)) {
      dist = hypot(x - k.pl_x, y - k.pl_y);
      if (dist < closedist) {
        _target.o_type = PLANETTYPE;
        _target.o_num = i;
        closedist = dist;
      }
    }
  }
  if (targtype & (TARG_PLAYER | TARG_FRIEND | TARG_ENEMY)) {
    for (i = 0, j = $sadd(G.players, i); i < MAXPLAYER; ++i, j = $sadd(j, 1)) {
      if (j.p_status !== PALIVE) {
        continue;
      }
      if ((j.p_flags & PFCLOAK) >>> 0 && !(targtype & TARG_CLOAK)) {
        continue;
      }
      if (j === G.me && !(targtype & TARG_SELF)) {
        continue;
      }
      friendly = !(G.me.p_team & (j.p_swar | j.p_hostile)) && !(j.p_team & (G.me.p_swar | G.me.p_hostile)) ? 1 : 0;
      if (friendly && targtype & TARG_ENEMY) {
        continue;
      }
      if (!friendly && targtype & TARG_FRIEND) {
        continue;
      }
      dist = hypot(x - j.p_x, y - j.p_y);
      if (dist < closedist) {
        _target.o_type = PLAYERTYPE;
        _target.o_num = i;
        closedist = dist;
      }
    }
  }
  if (closedist === GWIDTH) {
    _target.o_type = PLAYERTYPE;
    _target.o_num = G.me.p_no;
    return _target;
  } else {
    return _target;
  }
}

export function troop_capacity(): number {
  if (G.me.p_ship.s_type === ASSAULT) {
    return G.me.p_kills * 3 > G.me.p_ship.s_maxarmies ? G.me.p_ship.s_maxarmies : Math.trunc(G.me.p_kills * 3) | 0;
  } else if (G.me.p_ship.s_type !== STARBASE) {
    return G.me.p_kills * 2 > G.me.p_ship.s_maxarmies ? G.me.p_ship.s_maxarmies : Math.trunc(G.me.p_kills * 2) | 0;
  } else {
    return G.me.p_ship.s_maxarmies;
  }
}

export function $init(): void {
  _target = new struct_obtype();
}
