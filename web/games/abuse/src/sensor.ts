// sensor.cpp: the sensor's AI (switches on while a player is inside its area)
import { true_symbol, type LObj } from './lisp/lisp.ts';
import { S_blocking } from './compiled.ts';
import { stopped } from './chars.ts';
import type { game_object } from './objects.ts';
import { G } from './globals.ts';
import { L } from './lglobals.ts';

// vars
const un_offable = 0;

const iabs = (x: number): number => Math.abs(x | 0) | 0;

export function sensor_ai(): LObj {
  const o = L.current_object;
  let b: game_object;
  if (o.aistate() === 0) { // turned off, what for player to enter
    if (L.player_list!.next) // find closest player
      b = G.current_level.attacker(L.current_object);
    else b = L.player_list!.focus!;
    if (iabs(b.x - o.x) < o.xvel() && iabs(b.y - o.y) < o.yvel()) { // inside area?
      if (!o.hp()) o.set_aistate(1);
      else o.set_aistate(o.hp());
      o.set_state(S_blocking);
    } else if (o.state !== stopped) o.set_state(stopped);
  } else if (!o.lvars![un_offable]) {
    if (!o.hp()) {
      if (L.player_list!.next) b = G.current_level.attacker(L.current_object);
      else b = L.player_list!.focus!;
      if (iabs(o.x - b.x) > o.xacel() || iabs(o.y - b.y) > o.yacel()) o.set_aistate(0);
    } else o.set_aistate(o.aistate() - 1);
  }
  return true_symbol;
}
