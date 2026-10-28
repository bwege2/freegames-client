// @ts-nocheck
// NetHack 3.6.7 mapglyph.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { on_level } from './dungeon.ts';
import { has_color } from './windows.ts';
import { $cs, $rd, $ta, $wr, G, P, S, sprintf, strchr, strcpy } from './rt/index.ts';
import { BOULDER, CLR_BLACK, CLR_BLUE, CLR_BRIGHT_BLUE, CLR_BROWN, CLR_GRAY, CLR_GREEN, CLR_MAGENTA, CLR_ORANGE, CLR_RED, CLR_WHITE, CLR_YELLOW, COIN_CLASS, CORPSE, FOOD_CLASS, GLYPH_BODY_OFF, GLYPH_CMAP_OFF, GLYPH_DETECT_OFF, GLYPH_EXPLODE_OFF, GLYPH_INVIS_OFF, GLYPH_OBJ_OFF, GLYPH_PET_OFF, GLYPH_RIDDEN_OFF, GLYPH_STATUE_OFF, GLYPH_SWALLOW_OFF, GLYPH_WARNING_OFF, GLYPH_ZAP_OFF, HALLUC, HALLUC_RES, HI_DOMESTIC, MAXEXPCHARS, MG_BW_LAVA, MG_CORPSE, MG_DETECT, MG_FLAG_NOOVERRIDE, MG_INVIS, MG_OBJPILE, MG_PET, MG_RIDDEN, MG_STATUE, NO_COLOR, SYM_BOULDER, SYM_HERO_OVERRIDE, SYM_INVISIBLE, SYM_OFF_M, SYM_OFF_O, SYM_OFF_P, SYM_OFF_W, SYM_OFF_X, SYM_PET_OVERRIDE, S_arrow_trap, S_corr, S_darkroom, S_explode1, S_hcdoor, S_lava, S_litcorr, S_polymorph_trap, S_pool, S_room, S_sw_tl, S_vbeam, S_vwall, S_water } from './consts.ts';

let explcolors: any;
let encglyph$encbuf: any;
let decode_mixed$hex: any;

export function mapglyph(glyph: number, ochar: Ptr | null, ocolor: Ptr | null, ospecial: Ptr | null, x: number, y: number, mgflags: number): number {
  let offset = 0;
  let idx = 0;
  let color = NO_COLOR;
  let ch = 0;
  let special = 0;
  let has_rogue_ibm_graphics = (G.currentgraphics === 1 && G.symset[G.currentgraphics].handling === 1 ? 1 : 0) << 24 >> 24;
  let is_you = (x === G.u.ux && y === G.u.uy ? 1 : 0) << 24 >> 24;
  let has_rogue_color = (has_rogue_ibm_graphics && (G.symset[G.currentgraphics].nocolor | 0) === 0 ? 1 : 0) << 24 >> 24;
  if ((offset = glyph - GLYPH_STATUE_OFF) >= 0) {
    idx = G.mons[offset].mlet + SYM_OFF_M;
    if (has_rogue_color) {
      color = CLR_RED;
    } else {
      color = G.iflags.wc_color ? G.objects[449].oc_color : 8;
    }
    special = (special | MG_STATUE) >>> 0;
    if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && G.level.objects[x][y] && G.level.objects[x][y].v.v_nexthere) {
      special = (special | MG_OBJPILE) >>> 0;
    }
  } else if ((offset = glyph - GLYPH_WARNING_OFF) >= 0) {
    idx = offset + SYM_OFF_W;
    if (has_rogue_color) {
      color = NO_COLOR;
    } else {
      color = G.iflags.wc_color ? G.def_warnsyms[offset].color : 8;
    }
  } else if ((offset = glyph - GLYPH_SWALLOW_OFF) >= 0) {
    idx = S_sw_tl + (offset & 7) + SYM_OFF_P;
    if (has_rogue_color && G.iflags.wc_color) {
      color = NO_COLOR;
    } else {
      color = G.iflags.wc_color ? G.mons[offset >> 3].mcolor : 8;
    }
  } else if ((offset = glyph - GLYPH_ZAP_OFF) >= 0) {
    idx = S_vbeam + (offset & 3) + SYM_OFF_P;
    if (has_rogue_color && G.iflags.wc_color) {
      color = NO_COLOR;
    } else {
      color = G.iflags.wc_color ? G.zapcolors[offset >> 2] : 8;
    }
  } else if ((offset = glyph - GLYPH_EXPLODE_OFF) >= 0) {
    idx = offset % MAXEXPCHARS + S_explode1 + SYM_OFF_P;
    color = G.iflags.wc_color ? explcolors[offset / 9 | 0] : 8;
  } else if ((offset = glyph - GLYPH_CMAP_OFF) >= 0) {
    idx = offset + SYM_OFF_P;
    if (has_rogue_color && G.iflags.wc_color) {
      if (offset >= S_vwall && offset <= S_hcdoor) {
        color = CLR_BROWN;
      } else if (offset >= S_arrow_trap && offset <= S_polymorph_trap) {
        color = CLR_MAGENTA;
      } else if (offset === S_corr || offset === S_litcorr) {
        color = CLR_GRAY;
      } else if (offset >= S_room && offset <= S_water && offset !== S_darkroom) {
        color = CLR_GREEN;
      } else {
        color = NO_COLOR;
      }
    } else if (G.iflags.wc_color && offset === S_litcorr && G.showsyms[idx] === G.showsyms[S_corr + SYM_OFF_P]) {
      color = CLR_WHITE;
    } else if (!G.iflags.wc_color && offset === S_lava && (G.showsyms[idx] === G.showsyms[S_pool + SYM_OFF_P] || G.showsyms[idx] === G.showsyms[S_water + SYM_OFF_P])) {
      special = (special | MG_BW_LAVA) >>> 0;
    } else {
      color = G.iflags.wc_color ? G.defsyms[offset].color : 8;
    }
  } else if ((offset = glyph - GLYPH_OBJ_OFF) >= 0) {
    idx = G.objects[offset].oc_class + SYM_OFF_O;
    if (offset === BOULDER) {
      idx = SYM_BOULDER + SYM_OFF_X;
    }
    if (has_rogue_color && G.iflags.wc_color) {
      switch (G.objects[offset].oc_class) {
      case COIN_CLASS:
        color = CLR_YELLOW;
        break;
      case FOOD_CLASS:
        color = CLR_RED;
        break;
      default:
        color = CLR_BRIGHT_BLUE;
        break;
      }
    } else {
      color = G.iflags.wc_color ? G.objects[offset].oc_color : 8;
    }
    if (offset !== BOULDER && (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && G.level.objects[x][y] && G.level.objects[x][y].v.v_nexthere)) {
      special = (special | MG_OBJPILE) >>> 0;
    }
  } else if ((offset = glyph - GLYPH_RIDDEN_OFF) >= 0) {
    idx = G.mons[offset].mlet + SYM_OFF_M;
    if (has_rogue_color) {
      color = NO_COLOR;
    } else {
      color = G.iflags.wc_color ? G.mons[offset].mcolor : 8;
    }
    special = (special | MG_RIDDEN) >>> 0;
  } else if ((offset = glyph - GLYPH_BODY_OFF) >= 0) {
    idx = G.objects[CORPSE].oc_class + SYM_OFF_O;
    if (has_rogue_color && G.iflags.wc_color) {
      color = CLR_RED;
    } else {
      color = G.iflags.wc_color ? G.mons[offset].mcolor : 8;
    }
    special = (special | MG_CORPSE) >>> 0;
    if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && G.level.objects[x][y] && G.level.objects[x][y].v.v_nexthere) {
      special = (special | MG_OBJPILE) >>> 0;
    }
  } else if ((offset = glyph - GLYPH_DETECT_OFF) >= 0) {
    idx = G.mons[offset].mlet + SYM_OFF_M;
    if (has_rogue_color) {
      color = NO_COLOR;
    } else {
      color = G.iflags.wc_color ? G.mons[offset].mcolor : 8;
    }
    special = (special | MG_DETECT) >>> 0;
  } else if ((offset = glyph - GLYPH_INVIS_OFF) >= 0) {
    idx = SYM_INVISIBLE + SYM_OFF_X;
    if (has_rogue_color) {
      color = NO_COLOR;
    } else {
      color = 8;
    }
    special = (special | MG_INVIS) >>> 0;
  } else if ((offset = glyph - GLYPH_PET_OFF) >= 0) {
    idx = G.mons[offset].mlet + SYM_OFF_M;
    if (has_rogue_color) {
      color = NO_COLOR;
    } else {
      color = G.iflags.wc_color ? G.mons[offset].mcolor : 8;
    }
    special = (special | MG_PET) >>> 0;
  } else {
    idx = G.mons[glyph].mlet + SYM_OFF_M;
    if (has_rogue_color && G.iflags.wc_color) {
      if (is_you) {
        color = CLR_YELLOW;
      } else {
        color = NO_COLOR;
      }
    } else {
      color = G.iflags.wc_color ? G.mons[glyph].mcolor : 8;
      if (G.iflags.wc_color && is_you && G.flags.showrace && !(G.u.umonnum !== G.u.umonster)) {
        color = HI_DOMESTIC;
      }
    }
  }
  if (G.sysopt.accessibility === 1 && !((mgflags & MG_FLAG_NOOVERRIDE) >>> 0)) {
    let ovidx = 0;
    if ((special & MG_PET) >>> 0 !== 0) {
      ovidx = SYM_PET_OVERRIDE + SYM_OFF_X;
      if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? G.ov_rogue_syms[ovidx] : G.ov_primary_syms[ovidx]) {
        idx = ovidx;
      }
    }
    if (is_you) {
      ovidx = SYM_HERO_OVERRIDE + SYM_OFF_X;
      if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? G.ov_rogue_syms[ovidx] : G.ov_primary_syms[ovidx]) {
        idx = ovidx;
      }
    }
  }
  ch = G.showsyms[idx];
  if (!has_color(color) || (G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) && !has_rogue_color) {
    color = NO_COLOR;
  }
  ochar.a[ochar.o] = ch;
  ospecial.a[ospecial.o] = special;
  ocolor.a[ocolor.o] = color;
  return idx;
}

export function encglyph(glyph: number): Ptr | null {
  sprintf(P(encglyph$encbuf), S("\\G%04X%04X"), G.context.rndencode, glyph);
  return P(encglyph$encbuf);
}

export function decode_mixed(buf: Ptr | null, str: Ptr | null): Ptr | null {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let put = buf;
  if (!str) {
    return strcpy(buf, S(""));
  }
  while (str.a[str.o]) {
    if (str.a[str.o] === 92) {
      let rndchk = 0;
      let dcount = 0;
      let so = 0;
      let gv = 0;
      const ch = new Int32Array(1);
      ch[0] = 0;
      const oc = new Int32Array(1);
      oc[0] = 0;
      const os = new Uint32Array(1);
      os[0] = 0;
      let dp = null;
      let save_str = null;
      save_str = ($t1 = str, str = $t1.add(1), $t1);
      switch (str.a[str.o]) {
      case 71:
        rndchk = dcount = 0;
        for (str = str.add(1); str.a[str.o] && ++dcount <= 4; str = str.add(1)) {
          if (!!(dp = strchr(P(decode_mixed$hex), str.a[str.o]))) {
            rndchk = rndchk * 16 + ((dp.o - P(decode_mixed$hex).o | 0) / 2 | 0);
          } else {
            break;
          }
        }
        if (rndchk === G.context.rndencode) {
          gv = dcount = 0;
          for (; str.a[str.o] && ++dcount <= 4; str = str.add(1)) {
            if (!!(dp = strchr(P(decode_mixed$hex), str.a[str.o]))) {
              gv = gv * 16 + ((dp.o - P(decode_mixed$hex).o | 0) / 2 | 0);
            } else {
              break;
            }
          }
          so = mapglyph(gv, P(ch, 0), P(oc, 0), P(os, 0), 0, 0, 0);
          $wr(($t2 = put, put = $t2.add(1), $t2), 0, G.showsyms[so] << 24 >> 24);
          continue;
        } else {
          str = save_str;
        }
        break;
      case 92:
        break;
      case 0:
        str = save_str;
        break;
      }
    }
    $wr(($t3 = put, put = $t3.add(1), $t3), 0, $rd(($t4 = str, str = $t4.add(1), $t4)));
  }
  put.a[put.o] = 0;
  return buf;
}

export async function genl_putmixed(window_: number, attr: number, str: Ptr | null): Promise<void> {
  let buf = new Int8Array(256);
  await G.windowprocs.win_putstr(window_, attr, decode_mixed(P(buf), str));
}

export function $init(): void {
  explcolors = $ta(Int32Array, 7, [CLR_BLACK, CLR_GREEN, CLR_BROWN, CLR_BLUE, CLR_MAGENTA, CLR_ORANGE, CLR_WHITE]);
  encglyph$encbuf = new Int8Array(20);
  decode_mixed$hex = $cs("00112233445566778899aAbBcCdDeEfF", 33);
}
