// @ts-nocheck
// Brogue CE 1.15.1 Utilities.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { struct_pos, struct_windowpos } from './structs.ts';
import { strcmp, strcpy, strlen } from '../rt/index.ts';
import { COLS, DCOLS, DROWS, MESSAGE_LINES, ROWS, STAT_BAR_WIDTH, false_, true_ } from './consts.ts';


function signum(x: number): number {
  if (x === 0) {
    return 0;
  }
  return x > 0 ? 1 : -1;
}

function posEq(a: struct_pos, b: struct_pos): number {
  return (a.x === b.x && a.y === b.y ? 1 : 0) << 24 >> 24;
}

function coordinatesAreInMap(x: number, y: number): number {
  return (x >= 0 && DCOLS > x && y >= 0 && DROWS > y ? 1 : 0) << 24 >> 24;
}

function isPosInMap(p: struct_pos): number {
  return (p.x >= 0 && DCOLS > p.x && p.y >= 0 && DROWS > p.y ? 1 : 0) << 24 >> 24;
}

function locIsInWindow(w: struct_windowpos): number {
  return (w.window_x >= 0 && COLS > w.window_x && w.window_y >= 0 && ROWS > w.window_y ? 1 : 0) << 24 >> 24;
}

function windowToMap(w: struct_windowpos): struct_pos {
  return struct_pos.$of(w.window_x - STAT_BAR_WIDTH - 1 << 16 >> 16, w.window_y - MESSAGE_LINES << 16 >> 16);
}

function mapToWindow(p: struct_pos): struct_windowpos {
  return struct_windowpos.$of(p.x + STAT_BAR_WIDTH + 1 << 16 >> 16, p.y + MESSAGE_LINES << 16 >> 16);
}

export function endswith(str: Ptr | null, ending: Ptr | null): number {
  let str_len = strlen(str) | 0;
  let ending_len = strlen(ending) | 0;
  if (ending_len > str_len) {
    return false_;
  }
  return (strcmp(str.add(str_len).add(-ending_len), ending) === 0 ? true_ : false_) << 24 >> 24;
}

export function append(str: Ptr | null, ending: Ptr | null, bufsize: number): void {
  let str_len = strlen(str) | 0;
  let ending_len = strlen(ending) | 0;
  if (str_len + ending_len + 1 > bufsize) {
    return;
  }
  strcpy(str.add(str_len), ending);
}

export function $init(): void {
}
