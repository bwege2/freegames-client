// @ts-nocheck
// NetHack 3.6.7 rip.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { yyyymmdd } from './hacklib.ts';
import { formatkiller } from './topten.ts';
import { dump_forward_putstr } from './windows.ts';
import { $rd, $shr64, $wr, G, P, S, free, sprintf, strlen } from './rt/index.ts';
import { DEATH_LINE, FALSE, GOLD_LINE, NAME_LINE, STONE_LINE_CENT, STONE_LINE_LEN, TRUE, YEAR_LINE } from './consts.ts';

let rip_txt: any;
let rip: Ptr | null;

function center(line: number, text: Ptr | null): void {
  let $t1: any, $t2: any;
  let ip = null;
  let op = null;
  ip = text;
  op = rip.a[rip.o + line].add(STONE_LINE_CENT - $shr64(strlen(text) + 1, 1));
  while (ip.a[ip.o]) {
    $wr(($t1 = op, op = $t1.add(1), $t1), 0, $rd(($t2 = ip, ip = $t2.add(1), $t2)));
  }
}

export async function genl_outrip(tmpwin: number, how: number, when: number): Promise<void> {
  let dp = null;
  let dpx = null;
  let buf = new Int8Array(256);
  let year = 0;
  let x = 0;
  let line = 0;
  rip = dp = P(new Array(128 / 8).fill(null));
  for (x = 0; rip_txt[x]; ++x) {
    dp.a[dp.o + x] = await dupstr(rip_txt[x]);
  }
  dp.a[dp.o + x] = null;
  sprintf(P(buf), S("%s"), P(G.plname));
  buf[STONE_LINE_LEN] = 0;
  center(NAME_LINE, P(buf));
  sprintf(P(buf), S("%ld Au"), G.done_money);
  buf[STONE_LINE_LEN] = 0;
  center(GOLD_LINE, P(buf));
  await formatkiller(P(buf), 256, how, FALSE);
  for (line = DEATH_LINE, dpx = P(buf); line < YEAR_LINE; ++line) {
    let i = 0;
    let i0 = 0;
    let tmpchar = 0;
    if ((i0 = strlen(dpx) | 0) > STONE_LINE_LEN) {
      for (i = STONE_LINE_LEN; i0 > STONE_LINE_LEN && i; --i) {
        if (dpx.a[dpx.o + i] === 32) {
          i0 = i;
        }
      }
      if (!i) {
        i0 = STONE_LINE_LEN;
      }
    }
    tmpchar = dpx.a[dpx.o + i0];
    dpx.a[dpx.o + i0] = 0;
    center(line, dpx);
    if (tmpchar !== 32) {
      dpx.a[dpx.o + i0] = tmpchar;
      dpx = dpx.add(i0);
    } else {
      dpx = dpx.add(i0 + 1);
    }
  }
  year = Math.trunc(yyyymmdd(when) / 10000);
  sprintf(P(buf), S("%4ld"), year);
  center(YEAR_LINE, P(buf));
  if (tmpwin === 0) {
    await dump_forward_putstr(0, 0, S("Game over:"), TRUE);
  } else {
    await G.windowprocs.win_putstr(tmpwin, 0, S(""));
  }
  for (; dp.a[dp.o]; dp = dp.add(1)) {
    await G.windowprocs.win_putstr(tmpwin, 0, dp.a[dp.o]);
  }
  await G.windowprocs.win_putstr(tmpwin, 0, S(""));
  if (tmpwin !== 0) {
    await G.windowprocs.win_putstr(tmpwin, 0, S(""));
  }
  for (x = 0; rip_txt[x]; ++x) {
    free(rip.a[rip.o + x]);
  }
  free(rip);
  rip = null;
}

export function $init(): void {
  rip_txt = [S("                       ----------"),
S("                      /          \\"),
S("                     /    REST    \\"),
S("                    /      IN      \\"),
S("                   /     PEACE      \\"),
S("                  /                  \\"),
S("                  |                  |"),
S("                  |                  |"),
S("                  |                  |"),
S("                  |                  |"),
S("                  |                  |"),
S("                  |                  |"),
S("                  |       1001       |"),
S("                 *|     *  *  *      | *"),
S("        _________)/\\\\_//(\\/(/\\)/\\//\\/|_)_______"),
null];
  rip = null;
}
