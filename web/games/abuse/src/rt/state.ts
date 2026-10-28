// The game state the tests compare with the original (the oracle's hook.cpp write_state writes the
// same): the state, the level's tick, the random position, every player, a hash over every object.
import { G } from '../globals.ts';
import { L } from '../lglobals.ts';
import { R } from '../imlib/jrand.ts';

export function fnv(p: Uint8Array, h = 2166136261): number {
  for (let i = 0; i < p.length; i++) h = Math.imul(h ^ p[i], 16777619) >>> 0;
  return h >>> 0;
}
export const hex = (v: number): string => (v >>> 0).toString(16).padStart(8, '0');

export function state_line(): string {
  let s = '';
  const g = G.the_game;
  if (!g) return s;
  s += ` st=${g.state}`;
  const lv = G.current_level;
  if (!lv) return s;
  s += ` tick=${lv.tick_counter() >>> 0} rand=${R.rand_on & 1023}`;
  for (let v = L.player_list; v; v = v.next) {
    const o = v.focus;
    if (!o) continue;
    s += ` p${v.player_number}=${o.x},${o.y},${o.hp()},${o.state},${o.current_frame},${o.xvel()},${o.yvel()},${v.current_weapon}`;
  }
  let h = 2166136261, n = 0;
  const mix = (v: number): void => { h = fnv(Uint8Array.of(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff), h); };
  for (let o = lv.first_object(); o; o = o.next) {
    mix(o.otype); mix(o.x); mix(o.y); mix(o.state); mix(o.current_frame); mix(o.hp()); mix(o.aistate());
    n++;
  }
  return `${s} objs=${n},${hex(h)}`;
}

