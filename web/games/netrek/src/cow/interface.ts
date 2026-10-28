// @ts-nocheck
// COW 3.3.3 interface.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { sendShortPacket } from './socket.ts';
import { W_WriteText } from './x11window.ts';
import { struct_timeval } from './structs.ts';
import { $u64, G, P, gettimeofday, localtime } from '../rt/index.ts';
import { PFBEAMDOWN, PFBEAMUP, PFBOMB, PFCLOAK, PFREPAIR, PFSHIELD } from './consts.ts';

let ustime$tv_base: struct_timeval;
let run_clock$tt: number;

export function set_speed(speed: number): void {
  sendShortPacket(2, speed << 24 >> 24);
}

export function set_course(dir: number): void {
  sendShortPacket(3, (G.rotate ? dir - G.rotate_deg : dir) << 24 >> 24);
}

export function shield_up(): void {
  if (!((G.me.p_flags & PFSHIELD) >>> 0)) {
    sendShortPacket(12, 1);
  }
}

export function shield_down(): void {
  if ((G.me.p_flags & PFSHIELD) >>> 0) {
    sendShortPacket(12, 0);
  }
}

export function shield_tog(): void {
  if ((G.me.p_flags & PFSHIELD) >>> 0) {
    sendShortPacket(12, 0);
  } else {
    sendShortPacket(12, 1);
  }
}

export function bomb_planet(): void {
  if (!((G.me.p_flags & PFBOMB) >>> 0)) {
    sendShortPacket(17, 1);
  }
}

export function beam_up(): void {
  if (!((G.me.p_flags & PFBEAMUP) >>> 0)) {
    sendShortPacket(18, 1);
  }
}

export function beam_down(): void {
  if (!((G.me.p_flags & PFBEAMDOWN) >>> 0)) {
    sendShortPacket(18, 2);
  }
}

export function repair(): void {
  if (!((G.me.p_flags & PFREPAIR) >>> 0)) {
    sendShortPacket(13, 1);
  }
}

export function repair_off(): void {
  if ((G.me.p_flags & PFREPAIR) >>> 0) {
    sendShortPacket(13, 0);
  }
}

export function cloak(): void {
  if ((G.me.p_flags & PFCLOAK) >>> 0) {
    sendShortPacket(19, 0);
  } else {
    sendShortPacket(19, 1);
  }
}

export function cloak_on(): void {
  if (!((G.me.p_flags & PFCLOAK) >>> 0)) {
    sendShortPacket(19, 1);
  }
}

export function cloak_off(): void {
  if ((G.me.p_flags & PFCLOAK) >>> 0) {
    sendShortPacket(19, 0);
  }
}

export function ustime(): number {
  let tv = new struct_timeval();
  if (!ustime$tv_base.tv_sec) {
    gettimeofday(ustime$tv_base, null);
    return 0;
  }
  gettimeofday(tv, null);
  return $u64((tv.tv_sec - ustime$tv_base.tv_sec) * 1000000 + (tv.tv_usec - ustime$tv_base.tv_usec));
}

export function msetime(): number {
  let tv = new struct_timeval();
  gettimeofday(tv, null);
  return $u64((tv.tv_sec - 732737182) * 1000 + Math.trunc(tv.tv_usec / 1000));
}

export function run_clock(curtime$: number): void {
  const curtime = new Float64Array(1);
  curtime[0] = curtime$;
  let timebuf = new Int8Array(9);
  let tm = null;
  if (curtime[0] - run_clock$tt < 1) {
    return;
  }
  tm = localtime(P(curtime, 0));
  timebuf[0] = (tm.tm_hour / 10 | 0) + 48 << 24 >> 24;
  timebuf[1] = tm.tm_hour % 10 + 48 << 24 >> 24;
  timebuf[2] = 58;
  timebuf[3] = (tm.tm_min / 10 | 0) + 48 << 24 >> 24;
  timebuf[4] = tm.tm_min % 10 + 48 << 24 >> 24;
  timebuf[5] = 58;
  timebuf[6] = (tm.tm_sec / 10 | 0) + 48 << 24 >> 24;
  timebuf[7] = tm.tm_sec % 10 + 48 << 24 >> 24;
  switch (G.newDashboard) {
  case 1:
  case 2:
    W_WriteText(G.tstatw, 2, 30, G.textColor, P(timebuf), 8, G.W_RegularFont);
    break;
  default:
    W_WriteText(G.tstatw, 446, 27, G.textColor, P(timebuf), 8, G.W_RegularFont);
  }
  run_clock$tt = curtime[0];
}

export function $init(): void {
  ustime$tv_base = new struct_timeval();
  run_clock$tt = 0;
}
