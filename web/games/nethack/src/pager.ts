// @ts-nocheck
// NetHack 3.6.7 pager.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { doextlist, dokeylist, getdir, key2extcmddesc, key2txt, yn_function } from './cmd.ts';
import { is_drawbridge_wall, is_lava, is_pool } from './dbridge.ts';
import { trapped_chest_at, trapped_door_at } from './detect.ts';
import { glyph_at } from './display.ts';
import { dlb_fclose, dlb_fgets, dlb_fopen, dlb_fseek } from './dlb.ts';
import { a_monnam, coord_desc, coyotename, distant_monnam, getpos, rndmonnam, y_monnam } from './do_name.ts';
import { In_hell, on_level } from './dungeon.ts';
import { surface } from './engrave.ts';
import { copynchars, digit, dist2, eos, lcase, mungspaces, pmatch, strip_newline, strncmpi, strstri, tabexpand, upstart, visctrl } from './hacklib.ts';
import { display_inventory, sobj_at } from './invent.ts';
import { decode_mixed, encglyph, mapglyph } from './mapglyph.ts';
import { dealloc_obj, mksobj } from './mkobj.ts';
import { monsndx, sticks } from './mondata.ts';
import { closed_door } from './monmove.ts';
import { an, ansimpleoname, distant_name, doname_vague_quan, doname_with_price, makeplural, makesingular, singular, the, xname } from './objnam.ts';
import { option_help, show_menu_controls } from './options.ts';
import { dumplogmsg, impossible, pline } from './pline.ts';
import { align_str } from './priest.ts';
import { costly_spot } from './shk.ts';
import { t_at } from './trap.ts';
import { introff, intron } from './unixtty.ts';
import { doextversion } from './version.ts';
import { howmonseen } from './vision.ts';
import { anon_pager_c_2018, struct_monst, struct_nhcoord, struct_permonst, union_any } from './structs.ts';
import { $at2, $cs, $peq, $rd, $sarrOf, $sat, $wr, G, P, S, free, rn2_on_display_rng, sprintf, sscanf, strcat, strchr, strcmp, strcpy, strlen, strncat, strncmp, strncpy } from './rt/index.ts';
import { AM_SHRINE, ARTICLE_NONE, ATR_NONE, BEAR_TRAP, BLINDED, BOULDER, BUFSZ, COIN_CLASS, COLNO, CORPSE, DBWALL, DEF_INVISIBLE, DETECT_MONSTERS, D_BROKEN, D_TRAPPED, EXPL_MAX, FALSE, GLYPH_BODY_OFF, GLYPH_STATUE_OFF, GPCOORDS_COMPASS, GPCOORDS_MAP, GPCOORDS_NONE, GPCOORDS_SCREEN, HALLUC, HALLUC_RES, HOLE, INFRAVISION, INVIS, I_SPECIAL, LEASH, LOOK_ONCE, LOOK_QUICK, LOOK_VERBOSE, M2_DEMON, M2_ELF, M2_HUMAN, M2_ORC, MAXMCLASSES, MAXOCLASSES, MAXPCHARS, MENU_UNSELECTED, MG_FLAG_NOOVERRIDE, MONSEEN_DETECT, MONSEEN_INFRAVIS, MONSEEN_NORMAL, MONSEEN_SEEINVIS, MONSEEN_TELEPAT, MONSEEN_WARNMON, MONSEEN_XRAYVIS, M_AP_FURNITURE, M_AP_F_DKNOWN, M_AP_MONSTER, M_AP_OBJECT, NHW_MENU, NHW_TEXT, NO_GLYPH, NO_TRAP, OBJ_BURIED, OBJ_FLOOR, OBJ_FREE, PICK_ONE, PIT, PM_COYOTE, PM_WIZARD, ROCKTRAP, ROCK_CLASS, ROWNO, SCORR, SDOOR, SEEK_SET, SEE_INVIS, SLIME_MOLD, SPIKED_PIT, STATUE, STONE, STRANGE_OBJECT, SYM_BOULDER, SYM_HERO_OVERRIDE, SYM_INVISIBLE, SYM_MAX, SYM_OFF_M, SYM_OFF_O, SYM_OFF_X, SYM_PET_OVERRIDE, S_EEL, S_HUMAN, S_PIERCER, S_altar, S_arrow_trap, S_cloud, S_hcdbridge, S_ndoor, S_polymorph_trap, S_stone, S_sw_br, S_sw_tl, S_vibrating_square, S_vodbridge, TELEPAT, TER_DETECT, TER_MAP, TER_MON, TER_OBJ, TRAPDOOR, TRAPNUM, TRUE, VENOM_CLASS, VIBRATING_SQUARE, WARNCOUNT, WEB, WIN_ERR } from './consts.ts';

let suptext1: any;
let suptext2: any;
let help_menu_items: any;
let append_str$sep: any;
let do_screen_description$mon_interior: any;
let do_screen_description$unreconnoitered: any;
let do_screen_description$look_buf: any;
let dowhatdoes$once: number;

function is_swallow_sym(c: number): number {
  let i = 0;
  for (i = S_sw_tl; i <= S_sw_br; ++i) {
    if (G.showsyms[i] === c) {
      return TRUE;
    }
  }
  return FALSE;
}

async function append_str(buf: Ptr | null, new_str: Ptr | null): Promise<number> {
  let oldlen = 0;
  let space_left = 0;
  if (strstri(buf, new_str)) {
    return 0;
  }
  oldlen = strlen(buf);
  if (oldlen >= BUFSZ - 1) {
    if (oldlen > BUFSZ - 1) {
      await impossible(S("append_str: 'buf' contains %lu characters."), oldlen);
    }
    return 0;
  }
  space_left = BUFSZ - 1 - oldlen;
  strncat(buf, P(append_str$sep), space_left);
  if (space_left > 5 - 1) {
    strncat(buf, new_str, space_left - (5 - 1));
  }
  return 1;
}

export async function self_lookat(outbuf: Ptr | null): Promise<Ptr | null> {
  let race = new Int8Array(128);
  race[0] = 0;
  if (!(G.u.umonnum !== G.u.umonster)) {
    sprintf(P(race), S("%s "), G.urace.adj);
  }
  sprintf(outbuf, S("%s%s%s called %s"), (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && (G.u.uprops[TELEPAT].extrinsic || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) ? S("invisible ") : S(""), P(race), G.mons[G.u.umonnum].mname, P(G.plname));
  if (G.u.usteed) {
    sprintf(eos(outbuf), S(", mounted on %s"), await y_monnam(G.u.usteed));
  }
  if (G.u.uundetected | 0 || G.u.umonnum !== G.u.umonster && G.youmonst.m_ap_type & 7) {
    await mhidden_description(G.youmonst, FALSE, eos(outbuf));
  }
  return outbuf;
}

export async function mhidden_description(mon: struct_monst | null, altmon: number, outbuf: Ptr | null): Promise<void> {
  let $g = 0;
  let otmp = [null];
  let fakeobj = 0;
  let isyou = 0;
  let x = 0;
  let y = 0;
  let glyph = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      isyou = (mon === G.youmonst ? 1 : 0) << 24 >> 24;
      x = isyou ? G.u.ux : mon.mx;
      y = isyou ? G.u.uy : mon.my;
      glyph = G.level.flags.hero_memory | 0 && !isyou ? $at2(G.level.locations, x, y).glyph : glyph_at(x, y);
      outbuf.a[outbuf.o] = 0;
      if (!((mon.m_ap_type & 7) === M_AP_FURNITURE || (mon.m_ap_type & 7) === M_AP_OBJECT)) { $g = 3; continue $L; }
      strcpy(outbuf, S(", mimicking "));
      if (!((mon.m_ap_type & 7) === M_AP_FURNITURE)) { $g = 5; continue $L; }
      {
        strcat(outbuf, await an(G.defsyms[mon.mappearance].explanation));
      }
      { $g = 4; continue $L; }
    case 5:
      if (!((mon.m_ap_type & 7) === M_AP_OBJECT && (glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382))) { $g = 7; continue $L; }
    case 1: // objfrommap
      otmp[0] = null;
      fakeobj = await object_from_map(glyph, x, y, P(otmp, 0));
      strcat(outbuf, otmp[0] && otmp[0].otyp !== STRANGE_OBJECT ? await ansimpleoname(otmp[0]) : await an(G.obj_descr[STRANGE_OBJECT].oc_name));
      if (fakeobj) {
        otmp[0].where = OBJ_FREE;
        await dealloc_obj(otmp[0]);
      }
      { $g = 6; continue $L; }
    case 7:
      {
        strcat(outbuf, G.c_common_strings.c_something);
      }
    case 6:
    case 4:
      { $g = 2; continue $L; }
    case 3:
      if ((mon.m_ap_type & 7) === M_AP_MONSTER) {
        if (altmon) {
          sprintf(outbuf, S(", masquerading as %s"), await an(G.mons[mon.mappearance].mname));
        }
      } else if (isyou ? G.u.uundetected | 0 : mon.mundetected | 0) {
        strcpy(outbuf, S(", hiding"));
        if ((mon.data.mflags1 & 128) >>> 0 !== 0) {
          strcat(outbuf, S(" under "));
          if (glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382) {
            { $g = 1; continue $L; }
          }
          strcat(outbuf, G.c_common_strings.c_something);
        } else if ((mon.data.mflags1 & 256) >>> 0 !== 0) {
          sprintf(eos(outbuf), S(" on the %s"), (mon.data.mflags1 & 1) >>> 0 !== 0 || mon.data.mlet === S_PIERCER ? S("ceiling") : surface(x, y));
        } else {
          if (mon.data.mlet === S_EEL && is_pool(x, y)) {
            strcat(outbuf, S(" in murky water"));
          }
        }
      }
    case 2:
    }
    break;
  }
}

export async function object_from_map(glyph: number, x: number, y: number, obj_p: Ptr | null): Promise<number> {
  let fakeobj = FALSE;
  let mimic_obj = FALSE;
  let mtmp = null;
  let otmp = null;
  let glyphotyp = glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382 ? 240 : glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 ? 449 : glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 ? glyph - (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))));
  obj_p.a[obj_p.o] = null;
  if (!(otmp = sobj_at(glyphotyp, x, y))) {
    for (otmp = G.level.buriedobjlist; otmp; otmp = otmp.nobj) {
      if (otmp.ox === x && otmp.oy === y && otmp.otyp === glyphotyp) {
        break;
      }
    }
  }
  mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
  if (mtmp && ((mtmp.m_ap_type & 7) === M_AP_OBJECT && mtmp.mappearance === glyphotyp >>> 0)) {
    otmp = null;
    mimic_obj = TRUE;
  } else {
    mtmp = null;
  }
  if (!otmp || otmp.otyp !== glyphotyp) {
    otmp = await mksobj(glyphotyp, FALSE, FALSE);
    if (!otmp) {
      return FALSE;
    }
    fakeobj = TRUE;
    if (otmp.oclass === COIN_CLASS) {
      otmp.quan = 2;
    } else if (otmp.otyp === SLIME_MOLD) {
      otmp.spe = G.context.current_fruit << 24 >> 24;
    }
    if (mtmp && (mtmp.mextra && mtmp.mextra.mcorpsenm !== -1)) {
      if (otmp.otyp === SLIME_MOLD) {
        otmp.spe = mtmp.mextra.mcorpsenm << 24 >> 24;
      } else {
        otmp.corpsenm = mtmp.mextra.mcorpsenm;
      }
    } else if (otmp.otyp === CORPSE && (glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382)) {
      otmp.corpsenm = glyph - GLYPH_BODY_OFF;
    } else if (otmp.otyp === STATUE && (glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382)) {
      otmp.corpsenm = glyph - GLYPH_STATUE_OFF;
    }
    if (otmp.otyp === LEASH) {
      otmp.corpsenm = 0;
    }
    otmp.where = OBJ_FLOOR;
    otmp.ox = x << 24 >> 24, otmp.oy = y << 24 >> 24;
    otmp.no_charge = ((otmp.otyp === STRANGE_OBJECT && await costly_spot(x, y) ? 1 : 0) >>> 0) & 1;
  }
  if (otmp && dist2(x, y, G.u.ux, G.u.uy) <= 2 && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && (fakeobj || otmp.where === OBJ_FLOOR) && !G.iflags.terrainmode) {
    otmp.dknown = 1;
  }
  if (fakeobj && mtmp && mimic_obj && (otmp.dknown | 0 || mtmp.m_ap_type & ~7 & M_AP_F_DKNOWN)) {
    mtmp.m_ap_type = (mtmp.m_ap_type | M_AP_F_DKNOWN) & 0xff;
    otmp.dknown = 1;
  }
  obj_p.a[obj_p.o] = otmp;
  return fakeobj;
}

async function look_at_object(buf: Ptr | null, x: number, y: number, glyph: number): Promise<void> {
  const otmp = [null];
  otmp[0] = null;
  let fakeobj = await object_from_map(glyph, x, y, P(otmp, 0));
  if (otmp[0]) {
    strcpy(buf, otmp[0].otyp !== STRANGE_OBJECT ? await distant_name(otmp[0], otmp[0].dknown | 0 ? doname_with_price : doname_vague_quan) : G.obj_descr[STRANGE_OBJECT].oc_name);
    if (fakeobj) {
      otmp[0].where = OBJ_FREE;
      await dealloc_obj(otmp[0]), otmp[0] = null;
    }
  } else {
    strcpy(buf, G.c_common_strings.c_something);
  }
  if (otmp[0] && otmp[0].where === OBJ_BURIED) {
    strcat(buf, S(" (buried)"));
  } else if ($at2(G.level.locations, x, y).typ === STONE || $at2(G.level.locations, x, y).typ === SCORR) {
    strcat(buf, S(" embedded in stone"));
  } else if ($at2(G.level.locations, x, y).typ && $at2(G.level.locations, x, y).typ <= DBWALL || $at2(G.level.locations, x, y).typ === SDOOR) {
    strcat(buf, S(" embedded in a wall"));
  } else if (closed_door(x, y)) {
    strcat(buf, S(" embedded in a door"));
  } else if (is_pool(x, y)) {
    strcat(buf, S(" in water"));
  } else if (is_lava(x, y)) {
    strcat(buf, S(" in molten lava"));
  }
  return;
}

async function look_at_monster(buf: Ptr | null, monbuf: Ptr | null, mtmp: struct_monst | null, x: number, y: number): Promise<void> {
  let name = null;
  let monnambuf = new Int8Array(256);
  let accurate = (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? 1 : 0) << 24 >> 24;
  name = mtmp.data === $sat(G.mons, PM_COYOTE) && accurate ? await coyotename(mtmp, P(monnambuf)) : await distant_monnam(mtmp, ARTICLE_NONE, P(monnambuf));
  sprintf(buf, S("%s%s%s"), mtmp.mx !== x || mtmp.my !== y ? mtmp.isshk | 0 && accurate ? S("tail of ") : S("tail of a ") : S(""), mtmp.mtame && accurate ? S("tame ") : mtmp.mpeaceful | 0 && accurate ? S("peaceful ") : S(""), name);
  if (G.u.ustuck === mtmp) {
    if (G.u.uswallow | 0 || G.iflags.save_uswallow | 0) {
      strcat(buf, (mtmp.data.mflags1 & 262144) >>> 0 !== 0 ? S(", swallowing you") : S(", engulfing you"));
    } else {
      strcat(buf, G.u.umonnum !== G.u.umonster && sticks(G.youmonst.data) ? S(", being held") : S(", holding you"));
    }
  }
  if (mtmp.mleashed) {
    strcat(buf, S(", leashed to you"));
  }
  if (mtmp.mtrapped | 0 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
    let t = t_at(mtmp.mx, mtmp.my);
    let tt = t ? t.ttyp | 0 : NO_TRAP;
    if (tt === BEAR_TRAP || (tt === PIT || tt === SPIKED_PIT) || tt === WEB) {
      sprintf(eos(buf), S(", trapped in %s"), await an(G.defsyms[S_arrow_trap + tt - 1].explanation));
      t.tseen = 1;
    }
  }
  if (mtmp.mundetected | 0 || mtmp.m_ap_type & 7) {
    await mhidden_description(mtmp, FALSE, eos(buf));
  }
  if (monbuf) {
    let how_seen = howmonseen(mtmp);
    monbuf.a[monbuf.o] = 0;
    if (how_seen !== 0 && how_seen !== MONSEEN_NORMAL) {
      if ((how_seen & MONSEEN_NORMAL) >>> 0) {
        strcat(monbuf, S("normal vision"));
        how_seen = (how_seen & 4294967294) >>> 0;
        if (how_seen) {
          strcat(monbuf, S(", "));
        }
      }
      if ((how_seen & MONSEEN_SEEINVIS) >>> 0) {
        strcat(monbuf, S("see invisible"));
        how_seen = (how_seen & 4294967293) >>> 0;
        if (how_seen) {
          strcat(monbuf, S(", "));
        }
      }
      if ((how_seen & MONSEEN_INFRAVIS) >>> 0) {
        strcat(monbuf, S("infravision"));
        how_seen = (how_seen & 4294967291) >>> 0;
        if (how_seen) {
          strcat(monbuf, S(", "));
        }
      }
      if ((how_seen & MONSEEN_TELEPAT) >>> 0) {
        strcat(monbuf, S("telepathy"));
        how_seen = (how_seen & 4294967287) >>> 0;
        if (how_seen) {
          strcat(monbuf, S(", "));
        }
      }
      if ((how_seen & MONSEEN_XRAYVIS) >>> 0) {
        strcat(monbuf, S("astral vision"));
        how_seen = (how_seen & 4294967279) >>> 0;
        if (how_seen) {
          strcat(monbuf, S(", "));
        }
      }
      if ((how_seen & MONSEEN_DETECT) >>> 0) {
        strcat(monbuf, S("monster detection"));
        how_seen = (how_seen & 4294967263) >>> 0;
        if (how_seen) {
          strcat(monbuf, S(", "));
        }
      }
      if ((how_seen & MONSEEN_WARNMON) >>> 0) {
        if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
          strcat(monbuf, S("paranoid delusion"));
        } else {
          let mW = (G.context.warntype.obj | G.context.warntype.polyd) >>> 0;
          let m2 = mtmp.data.mflags2;
          let whom = ((mW & M2_HUMAN) >>> 0 & m2) >>> 0 ? S("human") : ((mW & M2_ELF) >>> 0 & m2) >>> 0 ? S("elf") : ((mW & M2_ORC) >>> 0 & m2) >>> 0 ? S("orc") : ((mW & M2_DEMON) >>> 0 & m2) >>> 0 ? S("demon") : mtmp.data.mname;
          sprintf(eos(monbuf), S("warned of %s"), await makeplural(whom));
        }
        how_seen = (how_seen & 4294967231) >>> 0;
        if (how_seen) {
          strcat(monbuf, S(", "));
        }
      }
      if (how_seen) {
        await impossible(S("lookat: unknown method of seeing monster"));
        sprintf(eos(monbuf), S("(%u)"), how_seen);
      }
    }
  }
}

async function lookat(x: number, y: number, buf: Ptr | null, monbuf: Ptr | null): Promise<struct_permonst | null> {
  let mtmp = null;
  let pm = null;
  let glyph = 0;
  buf.a[buf.o] = monbuf.a[monbuf.o] = 0;
  glyph = glyph_at(x, y);
  if (G.u.ux === x && G.u.uy === y && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uswallow | 0 || !((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.uundetected || (G.u.uprops[TELEPAT].extrinsic || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic))) && !(G.iflags.save_uswallow | 0 && glyph === (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.u.ustuck.data)) + 0) && (!G.iflags.terrainmode || (G.iflags.terrainmode & TER_MON) !== 0)) {
    await self_lookat(buf);
    if (G.urole.malenum === 342 && G.urace.malenum === 162 && !(G.u.umonnum !== G.u.umonster)) {
      pm = $sat(G.mons, PM_WIZARD);
    }
    if (((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) || G.u.uundetected | 0) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !(G.u.uswallow | 0 || G.iflags.save_uswallow | 0)) {
      let how = 0;
      if (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) {
        how = (how | 1) >>> 0;
      }
      if (G.u.uprops[TELEPAT].extrinsic) {
        how = (how | 2) >>> 0;
      }
      if (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) {
        how = (how | 4) >>> 0;
      }
      if (how) {
        sprintf(eos(buf), S(" [seen: %s%s%s%s%s]"), (how & 1) >>> 0 ? S("infravision") : S(""), (how & 3) >>> 0 > 2 ? S(", ") : S(""), (how & 2) >>> 0 ? S("telepathy") : S(""), (how & 7) >>> 0 > 4 ? S(", ") : S(""), (how & 4) >>> 0 ? S("monster detection") : S(""));
      }
    }
  } else if (G.u.uswallow) {
    sprintf(buf, S("interior of %s"), await a_monnam(G.u.ustuck));
    pm = G.u.ustuck.data;
  } else if (glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382) {
    G.bhitpos.x = x << 24 >> 24;
    G.bhitpos.y = y << 24 >> 24;
    if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
      await look_at_monster(buf, monbuf, mtmp, x, y);
      pm = mtmp.data;
    } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      strcpy(buf, await rndmonnam(null));
    }
  } else if (glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382) {
    await look_at_object(buf, x, y, glyph);
  } else if (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM) {
    let tnum = G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(TRAPNUM - 1) + 1 : glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) - S_arrow_trap + 1 : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))));
    if (trapped_chest_at(tnum, x, y)) {
      strcpy(buf, S("trapped chest"));
    } else if (trapped_door_at(tnum, x, y)) {
      strcpy(buf, S("trapped door"));
    } else {
      strcpy(buf, G.defsyms[S_arrow_trap + tnum - 1].explanation);
    }
  } else if (glyph >= (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) && glyph < (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) + 6) {
    let warnindx = glyph >= (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) && glyph < (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) + 6 ? glyph - ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))));
    ;
    strcpy(buf, G.def_warnsyms[warnindx].explanation);
  } else if (!(glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS)) {
    strcpy(buf, S("unexplored area"));
  } else {
    let amsk = 0;
    let algn = 0;
    switch (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) {
    case S_altar:
      amsk = !!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && (mtmp.mextra && mtmp.mextra.mcorpsenm !== -1) && (mtmp.m_ap_type & 7) === M_AP_FURNITURE && mtmp.mappearance === S_altar ? mtmp.mextra.mcorpsenm : $at2(G.level.locations, x, y).flags | 0;
      algn = (!(amsk & ~8) ? -128 : (amsk & ~8) === 4 ? 1 : (amsk & ~8) - 2) << 24 >> 24;
      sprintf(buf, S("%s %saltar"), (G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) && dist2(x, y, G.u.ux, G.u.uy) > 2 ? S("aligned") : align_str(algn), (amsk & AM_SHRINE) !== 0 && ((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) || (G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level)) ? S("high ") : S(""));
      break;
    case S_ndoor:
      if (is_drawbridge_wall(x, y) >= 0) {
        strcpy(buf, S("open drawbridge portcullis"));
      } else if ((($at2(G.level.locations, x, y).flags | 0) & ~D_TRAPPED) === D_BROKEN) {
        strcpy(buf, S("broken door"));
      } else {
        strcpy(buf, S("doorway"));
      }
      break;
    case S_cloud:
      strcpy(buf, (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) ? S("cloudy area") : S("fog/vapor cloud"));
      break;
    case S_stone:
      if (!$at2(G.level.locations, x, y).seenv) {
        strcpy(buf, S("unexplored"));
        break;
      } else if (G.u.uinwater | 0 && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
        strcpy(buf, dist2(x, y, G.u.ux, G.u.uy) <= 2 ? S("land") : S("unknown"));
        break;
      } else if ($at2(G.level.locations, x, y).typ === STONE || $at2(G.level.locations, x, y).typ === SCORR) {
        strcpy(buf, S("stone"));
        break;
      }
    default:
      strcpy(buf, G.defsyms[glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))].explanation);
      break;
    }
  }
  return pm && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? pm : null;
}

async function checkfile(inp: Ptr | null, pm: struct_permonst | null, user_typed_name: number, without_asking: number, supplemental_name: Ptr | null): Promise<void> {
  let $g = 0;
  let fp = null;
  let buf = new Int8Array(256);
  let newstr = new Int8Array(256);
  let givenname = new Int8Array(256);
  let ep = null;
  let dbase_str = null;
  let txt_offset = new Float64Array(1);
  let datawin = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      buf = new Int8Array(256);
      newstr = new Int8Array(256);
      givenname = new Int8Array(256);
      txt_offset[0] = 0;
      datawin = WIN_ERR;
      fp = await dlb_fopen(S("data"), S("r"));
      if (!fp) {
        await pline(S("Cannot open 'data' file!"));
        return;
      }
      if (!inp || strlen(inp) > BUFSZ - 1) {
        await impossible(S("bad do_look buffer passed (%s)!"), !inp ? S("null") : S("too long"));
        { $g = 1; continue $L; }
      }
      if (!!pm && !user_typed_name) {
        dbase_str = strcpy(P(newstr), pm.mname);
      } else {
        dbase_str = strcpy(P(newstr), inp);
      }
      lcase(dbase_str);
      if (!strncmp(dbase_str, S("interior of "), 12)) {
        dbase_str = dbase_str.add(12);
      }
      if (!strncmp(dbase_str, S("a "), 2)) {
        dbase_str = dbase_str.add(2);
      } else if (!strncmp(dbase_str, S("an "), 3)) {
        dbase_str = dbase_str.add(3);
      } else if (!strncmp(dbase_str, S("the "), 4)) {
        dbase_str = dbase_str.add(4);
      } else if (!strncmp(dbase_str, S("some "), 5)) {
        dbase_str = dbase_str.add(5);
      } else if (digit(dbase_str.a[dbase_str.o])) {
        while (digit(dbase_str.a[dbase_str.o])) {
          dbase_str = dbase_str.add(1);
        }
        if (dbase_str.a[dbase_str.o] === 32) {
          dbase_str = dbase_str.add(1);
        }
      }
      if (!strncmp(dbase_str, S("pair of "), 8)) {
        dbase_str = dbase_str.add(8);
      }
      if (!strncmp(dbase_str, S("tame "), 5)) {
        dbase_str = dbase_str.add(5);
      } else if (!strncmp(dbase_str, S("peaceful "), 9)) {
        dbase_str = dbase_str.add(9);
      }
      if (!strncmp(dbase_str, S("invisible "), 10)) {
        dbase_str = dbase_str.add(10);
      }
      if (!strncmp(dbase_str, S("saddled "), 8)) {
        dbase_str = dbase_str.add(8);
      }
      if (!strncmp(dbase_str, S("blessed "), 8)) {
        dbase_str = dbase_str.add(8);
      } else if (!strncmp(dbase_str, S("uncursed "), 9)) {
        dbase_str = dbase_str.add(9);
      } else if (!strncmp(dbase_str, S("cursed "), 7)) {
        dbase_str = dbase_str.add(7);
      }
      if (!strncmp(dbase_str, S("empty "), 6)) {
        dbase_str = dbase_str.add(6);
      }
      if (!strncmp(dbase_str, S("partly used "), 12)) {
        dbase_str = dbase_str.add(12);
      } else if (!strncmp(dbase_str, S("partly eaten "), 13)) {
        dbase_str = dbase_str.add(13);
      }
      if (!strncmp(dbase_str, S("statue of "), 10)) {
        dbase_str.a[dbase_str.o + 6] = 0;
      } else if (!strncmp(dbase_str, S("figurine of "), 12)) {
        dbase_str.a[dbase_str.o + 8] = 0;
      }
      if (dbase_str.a[dbase_str.o] && strchr(S("+-"), dbase_str.a[dbase_str.o]) && digit(dbase_str.a[dbase_str.o + 1])) {
        dbase_str = dbase_str.add(1);
        while (digit(dbase_str.a[dbase_str.o])) {
          dbase_str = dbase_str.add(1);
        }
        if (dbase_str.a[dbase_str.o] === 32) {
          dbase_str = dbase_str.add(1);
        }
      }
      if (!strncmp(dbase_str, S("moist towel"), 11)) {
        strncpy(dbase_str = dbase_str.add(2), S("wet"), 3);
      }
      if (dbase_str.a[dbase_str.o]) {
        let pass1offset = -1;
        let chk_skip = 0;
        let pass = 1;
        let yes_to_moreinfo = 0;
        let found_in_file = 0;
        let pass1found_in_file = 0;
        let skipping_entry = 0;
        let sp = null;
        let ap = null;
        let alt = null;
        if (!!(ep = strstri(dbase_str, S(" named ")))) {
          alt = ep.add(7);
          if (!!(ap = strstri(dbase_str, S(" called "))) && ap.o < ep.o) {
            ep = ap;
          }
        } else if (!!(ep = strstri(dbase_str, S(" called ")))) {
          copynchars(P(givenname), ep.add(8), BUFSZ - 1);
          alt = P(givenname);
          if (supplemental_name && !!(sp = strstri(inp, S(" called ")))) {
            copynchars(supplemental_name, sp.add(8), BUFSZ - 1);
          }
        } else {
          ep = strstri(dbase_str, S(", "));
        }
        if (ep && ep.o > dbase_str.o) {
          ep.a[ep.o] = 0;
        }
        if (alt && (!strncmpi(alt, S("a "), 2) || !strncmpi(alt, S("an "), 3) || !strncmpi(alt, S("the "), 4))) {
          alt = strchr(alt, 32).add(1);
        }
        if (!!(ep = strstri(dbase_str, S(" ("))) && ep.o > dbase_str.o) {
          ep.a[ep.o] = 0;
        }
        if (alt && !!(ap = strstri(alt, S(" ("))) && ap.o > alt.o) {
          ap.a[ap.o] = 0;
        }
        if (!alt) {
          alt = await makesingular(dbase_str);
        }
        pass1found_in_file = FALSE;
        for (pass = !strcmp(alt, dbase_str) ? 0 : 1; pass >= 0; --pass) {
          found_in_file = skipping_entry = FALSE;
          txt_offset[0] = 0;
          if (dlb_fseek(fp, txt_offset[0], SEEK_SET) < 0) {
            await impossible(S("can't get to start of 'data' file"));
            { $g = 1; continue $L; }
          }
          if (!dlb_fgets(P(buf), BUFSZ, fp) || !dlb_fgets(P(buf), BUFSZ, fp)) {
            await impossible(S("can't read 'data' file"));
            { $g = 1; continue $L; }
          } else if (sscanf(P(buf), S("%8lx\n"), P(txt_offset, 0)) < 1 || txt_offset[0] === 0) {
            { $g = 2; continue $L; }
          }
          while (dlb_fgets(P(buf), BUFSZ, fp)) {
            if ($rd(P(buf)) === 46) {
              break;
            }
            if (digit($rd(P(buf)))) {
              skipping_entry = FALSE;
            } else if (!skipping_entry) {
              if (!(ep = strchr(P(buf), 10))) {
                { $g = 2; continue $L; }
              }
              strip_newline(ep.o > P(buf).o ? ep.add(-1) : ep);
              chk_skip = $rd(P(buf)) === 126 ? 1 : 0;
              if (pass === 0 && pmatch(P(buf, chk_skip), dbase_str) || pass === 1 && alt && pmatch(P(buf, chk_skip), alt)) {
                if (chk_skip) {
                  skipping_entry = TRUE;
                  continue;
                } else {
                  found_in_file = TRUE;
                  if (pass === 1) {
                    pass1found_in_file = TRUE;
                  }
                  break;
                }
              }
            }
          }
          if (found_in_file) {
            const entry_offset = new Float64Array(1);
            let fseekoffset = 0;
            const entry_count = new Int32Array(1);
            let i = 0;
            do {
              if (!dlb_fgets(P(buf), BUFSZ, fp)) {
                { $g = 2; continue $L; }
              }
            } while (!digit($rd(P(buf))));
            if (sscanf(P(buf), S("%ld,%d\n"), P(entry_offset, 0), P(entry_count, 0)) < 2) {
              { $g = 2; continue $L; }
            }
            fseekoffset = txt_offset[0] + entry_offset[0];
            if (pass === 1) {
              pass1offset = fseekoffset;
            } else if (fseekoffset === pass1offset) {
              { $g = 1; continue $L; }
            }
            yes_to_moreinfo = FALSE;
            if (!user_typed_name && !without_asking) {
              let entrytext = pass ? alt : dbase_str;
              let question = new Int8Array(128);
              strcpy(P(question), S("More info about \""));
              copynchars(eos(P(question)), entrytext, 128 - 1 - (strlen(P(question)) + 2) | 0);
              strcat(P(question), S("\"?"));
              if (await yn_function(P(question), P(G.ynchars), 110) === 121) {
                yes_to_moreinfo = TRUE;
              }
            }
            if (user_typed_name || without_asking || yes_to_moreinfo) {
              if (dlb_fseek(fp, fseekoffset, SEEK_SET) < 0) {
                await pline(S("? Seek error on 'data' file!"));
                { $g = 1; continue $L; }
              }
              datawin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
              for (i = 0; i < entry_count[0]; ++i) {
                if (!dlb_fgets(P(buf), BUFSZ, fp)) {
                  { $g = 2; continue $L; }
                }
                strip_newline(P(buf));
                if (!!strchr(P(buf).add(1), 9)) {
                  tabexpand(P(buf).add(1));
                }
                await G.windowprocs.win_putstr(datawin, 0, P(buf).add(1));
              }
              await G.windowprocs.win_display_nhwindow(datawin, FALSE);
              await G.windowprocs.win_destroy_nhwindow(datawin), datawin = WIN_ERR;
            }
          } else if (user_typed_name && pass === 0 && !pass1found_in_file) {
            await pline(S("I don't have any information on those things."));
          }
        }
      }
      { $g = 1; continue $L; }
    case 2: // bad_data_file
      await impossible(S("'data' file in wrong format or corrupted"));
    case 1: // checkfile_done
      if (datawin !== WIN_ERR) {
        await G.windowprocs.win_destroy_nhwindow(datawin);
      }
      dlb_fclose(fp);
      return;
    }
    break;
  }
}

export async function do_screen_description(cc: struct_nhcoord, looked: number, sym$: number, out_str: Ptr | null, firstmatch: Ptr | null, for_supplement: Ptr | null): Promise<number> {
  const sym = new Int32Array(1);
  sym[0] = sym$;
  let $g = 0;
  let prefix = new Int8Array(256);
  let i = 0;
  let alt_i = 0;
  let j = 0;
  let glyph = 0;
  let skipped_venom = 0;
  let found = 0;
  let hit_trap = 0;
  let need_to_look = 0;
  let submerged = 0;
  let x_str = null;
  let tmpsym = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      prefix = new Int8Array(256);
      glyph = NO_GLYPH;
      skipped_venom = 0;
      found = 0;
      need_to_look = FALSE;
      submerged = (G.u.uinwater | 0 && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) ? 1 : 0) << 24 >> 24;
      if (looked) {
        const oc = new Int32Array(1);
        const os = new Uint32Array(1);
        glyph = glyph_at(cc.x, cc.y);
        mapglyph(glyph, P(sym, 0), P(oc, 0), P(os, 0), cc.x, cc.y, 0);
        sprintf(P(prefix), S("%s        "), encglyph(glyph));
      } else {
        sprintf(P(prefix), S("%c        "), sym[0]);
      }
      x_str = null;
      if (!looked) {
        ;
      } else if ((G.u.uswallow | 0 || submerged) && dist2(cc.x, cc.y, G.u.ux, G.u.uy) > 2 || (G.iflags.terrainmode & (TER_DETECT | TER_MAP)) === TER_DETECT && glyph === S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
        x_str = P(do_screen_description$unreconnoitered);
        need_to_look = FALSE;
      } else if (is_swallow_sym(sym[0])) {
        x_str = P(do_screen_description$mon_interior);
        need_to_look = TRUE;
      }
      if (x_str) {
        if (!found) {
          sprintf(out_str, S("%s%s"), P(prefix), x_str);
          firstmatch.a[firstmatch.o] = x_str;
          ++found;
        } else {
          found += await append_str(out_str, x_str);
        }
        if ($peq(x_str, P(do_screen_description$unreconnoitered))) {
          { $g = 1; continue $L; }
        }
      }
    case 2: // check_monsters
      if (!G.iflags.terrainmode || (G.iflags.terrainmode & TER_MON) !== 0) {
        for (i = 1; i < MAXMCLASSES; ++i) {
          if (sym[0] === (looked ? G.showsyms[i + SYM_OFF_M] : G.def_monsyms[i].sym) && G.def_monsyms[i].explain && $rd(G.def_monsyms[i].explain)) {
            need_to_look = TRUE;
            if (!found) {
              sprintf(out_str, S("%s%s"), P(prefix), await an(G.def_monsyms[i].explain));
              firstmatch.a[firstmatch.o] = G.def_monsyms[i].explain;
              ++found;
            } else {
              found += await append_str(out_str, await an(G.def_monsyms[i].explain));
            }
          }
        }
        if ((looked ? sym[0] === G.showsyms[S_HUMAN + SYM_OFF_M] && cc.x === G.u.ux && cc.y === G.u.uy ? 1 : 0 : sym[0] === G.def_monsyms[S_HUMAN].sym && !G.flags.showrace ? 1 : 0) && !(G.urace.malenum === 256 || G.urace.malenum === 260) && !(G.u.umonnum !== G.u.umonster)) {
          found += await append_str(out_str, S("you"));
        }
      }
      if (!G.iflags.terrainmode || (G.iflags.terrainmode & TER_OBJ) !== 0) {
        for (i = 1; i < MAXOCLASSES; ++i) {
          if (sym[0] === (looked ? G.showsyms[i + SYM_OFF_O] : G.def_oc_syms[i].sym) || looked && i === ROCK_CLASS && (glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382)) {
            need_to_look = TRUE;
            if (looked && i === VENOM_CLASS) {
              ++skipped_venom;
              continue;
            }
            if (!found) {
              sprintf(out_str, S("%s%s"), P(prefix), await an(G.def_oc_syms[i].explain));
              firstmatch.a[firstmatch.o] = G.def_oc_syms[i].explain;
              ++found;
            } else {
              found += await append_str(out_str, await an(G.def_oc_syms[i].explain));
            }
          }
        }
      }
      if (sym[0] === DEF_INVISIBLE) {
        let usealt = ((G.u.uprops[DETECT_MONSTERS].extrinsic & I_SPECIAL) !== 0 ? 1 : 0) << 24 >> 24;
        let unseen_explain = !usealt ? P(G.invisexplain) : P(G.altinvisexplain);
        if (!found) {
          sprintf(out_str, S("%s%s"), P(prefix), await an(unseen_explain));
          firstmatch.a[firstmatch.o] = unseen_explain;
          ++found;
        } else {
          found += await append_str(out_str, await an(unseen_explain));
        }
      }
      alt_i = sym[0] === (looked ? G.showsyms[0] : G.defsyms[0].sym) ? 0 : 2 + 1;
      for (hit_trap = FALSE, i = 0; i < MAXPCHARS; ++i) {
        if (alt_i < 2) {
          x_str = !alt_i++ ? S("unexplored") : submerged ? S("unknown") : S("stone");
          i = 0;
        } else {
          if (alt_i++ === 2) {
            i = 0;
          }
          x_str = G.defsyms[i].explanation;
          if (submerged && !strcmp(x_str, G.defsyms[0].explanation)) {
            x_str = S("land");
          }
        }
        if (sym[0] === (looked ? G.showsyms[i] : G.defsyms[i].sym) && x_str.a[x_str.o]) {
          let article = strstri(x_str, S(" of a room")) ? 2 : !(alt_i <= 2 || strcmp(x_str, S("air")) === 0 || strcmp(x_str, S("land")) === 0 || strcmp(x_str, S("water")) === 0) ? 1 : 0;
          if (!found) {
            if (i >= S_arrow_trap && i <= S_polymorph_trap) {
              sprintf(out_str, S("%sa trap"), P(prefix));
              hit_trap = TRUE;
            } else {
              sprintf(out_str, S("%s%s"), P(prefix), article === 2 ? await the(x_str) : article === 1 ? await an(x_str) : x_str);
            }
            firstmatch.a[firstmatch.o] = x_str;
            ++found;
          } else if (!(hit_trap && (i >= S_arrow_trap && i <= S_polymorph_trap)) && !(found >= 3 && (i >= S_vodbridge && i <= S_hcdbridge)) && (i !== S_vibrating_square || In_hell(G.u.uz) || looked && (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM) && (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) - S_arrow_trap + 1 : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === VIBRATING_SQUARE)) {
            found += await append_str(out_str, article === 2 ? await the(x_str) : article === 1 ? await an(x_str) : x_str);
            if (i >= S_arrow_trap && i <= S_polymorph_trap) {
              hit_trap = TRUE;
            }
          }
          if (i === S_altar || i >= S_arrow_trap && i <= S_polymorph_trap) {
            need_to_look = TRUE;
          }
        }
      }
      for (i = 1; i < WARNCOUNT; ++i) {
        x_str = G.def_warnsyms[i].explanation;
        if (sym[0] === (looked ? G.warnsyms[i] : G.def_warnsyms[i].sym)) {
          if (!found) {
            sprintf(out_str, S("%s%s"), P(prefix), G.def_warnsyms[i].explanation);
            firstmatch.a[firstmatch.o] = G.def_warnsyms[i].explanation;
            ++found;
          } else {
            found += await append_str(out_str, G.def_warnsyms[i].explanation);
          }
          if (looked && sobj_at(BOULDER, cc.x, cc.y)) {
            strcat(out_str, S(" co-located with a boulder"));
          }
          break;
        }
      }
      if (skipped_venom && found < 2) {
        x_str = G.def_oc_syms[VENOM_CLASS].explain;
        if (!found) {
          sprintf(out_str, S("%s%s"), P(prefix), await an(x_str));
          firstmatch.a[firstmatch.o] = x_str;
          ++found;
        } else {
          found += await append_str(out_str, await an(x_str));
        }
      }
      for (j = SYM_OFF_X; j < SYM_MAX; ++j) {
        if (j === SYM_INVISIBLE + SYM_OFF_X) {
          continue;
        }
        tmpsym = ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? G.ov_rogue_syms[j] : G.ov_primary_syms[j]) & 0xff;
        if (tmpsym && sym[0] === tmpsym) {
          switch (j) {
          case SYM_BOULDER + SYM_OFF_X:
            if (!found) {
              firstmatch.a[firstmatch.o] = S("boulder");
              sprintf(out_str, S("%s%s"), P(prefix), await an(firstmatch.a[firstmatch.o]));
              ++found;
            } else {
              found += await append_str(out_str, S("boulder"));
            }
            break;
          case SYM_PET_OVERRIDE + SYM_OFF_X:
            if (looked) {
              const oc = new Int32Array(1);
              oc[0] = 0;
              const os = new Uint32Array(1);
              os[0] = 0;
              mapglyph(glyph, P(sym, 0), P(oc, 0), P(os, 0), cc.x, cc.y, MG_FLAG_NOOVERRIDE);
              { $g = 2; continue $L; }
            }
            break;
          case SYM_HERO_OVERRIDE + SYM_OFF_X:
            sym[0] = G.showsyms[S_HUMAN + SYM_OFF_M];
            { $g = 2; continue $L; }
          }
        }
      }
      if (found > 4) {
        sprintf(out_str, S("%scan be many things"), P(prefix));
      }
    case 1: // didlook
      if (looked) {
        let pm = null;
        if (found > 1 || need_to_look) {
          let monbuf = new Int8Array(256);
          let temp_buf = new Int8Array(256);
          pm = await lookat(cc.x, cc.y, P(do_screen_description$look_buf), P(monbuf));
          if (pm && for_supplement) {
            for_supplement.a[for_supplement.o] = pm;
          }
          firstmatch.a[firstmatch.o] = P(do_screen_description$look_buf);
          if ($rd(firstmatch.a[firstmatch.o])) {
            sprintf(P(temp_buf), S(" (%s)"), firstmatch.a[firstmatch.o]);
            strncat(out_str, P(temp_buf), BUFSZ - strlen(out_str) - 1);
            found = 1;
          }
          if (monbuf[0]) {
            sprintf(P(temp_buf), S(" [seen: %s]"), P(monbuf));
            strncat(out_str, P(temp_buf), BUFSZ - strlen(out_str) - 1);
          }
        }
      }
      return found;
    }
    break;
  }
}

export async function do_look(mode: number, click_cc: struct_nhcoord | null): Promise<number> {
  let quick = (mode === 1 ? 1 : 0) << 24 >> 24;
  let clicklook = (mode === 2 ? 1 : 0) << 24 >> 24;
  let out_str = new Int8Array(256);
  const firstmatch = [null];
  firstmatch[0] = null;
  let pm = null;
  const supplemental_pm = [null];
  supplemental_pm[0] = null;
  let i = 0;
  let ans = 0;
  let sym = 0;
  let found = 0;
  let cc = new struct_nhcoord();
  let save_verbose = 0;
  let from_screen = 0;
  cc.x = 0;
  cc.y = 0;
  if (!clicklook) {
    if (quick) {
      from_screen = TRUE;
      i = 121;
    } else {
      const pick_list = [null];
      pick_list[0] = null;
      let win = 0;
      let any = new union_any();
      any.$cp(G.zeroany);
      win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      await G.windowprocs.win_start_menu(win);
      any.a_char = 47;
      await G.windowprocs.win_add_menu(win, NO_GLYPH, any, G.flags.lootabc ? 0 : any.a_char, 121, ATR_NONE, S("something on the map"), MENU_UNSELECTED);
      any.a_char = 105;
      await G.windowprocs.win_add_menu(win, NO_GLYPH, any, G.flags.lootabc ? 0 : any.a_char, 0, ATR_NONE, S("something you're carrying"), MENU_UNSELECTED);
      any.a_char = 63;
      await G.windowprocs.win_add_menu(win, NO_GLYPH, any, G.flags.lootabc ? 0 : any.a_char, 110, ATR_NONE, S("something else (by symbol or name)"), MENU_UNSELECTED);
      if (!G.u.uswallow && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
        any.$cp(G.zeroany);
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
        any.a_char = 109;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, G.flags.lootabc ? 0 : any.a_char, 0, ATR_NONE, S("nearby monsters"), MENU_UNSELECTED);
        any.a_char = 77;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, G.flags.lootabc ? 0 : any.a_char, 0, ATR_NONE, S("all monsters shown on map"), MENU_UNSELECTED);
        any.a_char = 111;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, G.flags.lootabc ? 0 : any.a_char, 0, ATR_NONE, S("nearby objects"), MENU_UNSELECTED);
        any.a_char = 79;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, G.flags.lootabc ? 0 : any.a_char, 0, ATR_NONE, S("all objects shown on map"), MENU_UNSELECTED);
      }
      await G.windowprocs.win_end_menu(win, S("What do you want to look at:"));
      if (await G.windowprocs.win_select_menu(win, PICK_ONE, P(pick_list, 0)) > 0) {
        i = pick_list[0].item.a_char;
        free(pick_list[0]);
      }
      await G.windowprocs.win_destroy_nhwindow(win);
    }
    switch (i) {
    default:
    case 113:
      return 0;
    case 121:
    case 47:
      from_screen = TRUE;
      sym = 0;
      cc.x = G.u.ux;
      cc.y = G.u.uy;
      break;
    case 105:
      {
        let invlet = 0;
        let invobj = null;
        invlet = await display_inventory(null, TRUE);
        if (!invlet || invlet === 27) {
          return 0;
        }
        $wr(P(out_str), 0, 0);
        for (invobj = G.invent; invobj; invobj = invobj.nobj) {
          if (invobj.invlet === invlet) {
            strcpy(P(out_str), await singular(invobj, xname));
            break;
          }
        }
        if ($rd(P(out_str))) {
          await checkfile(P(out_str), pm, TRUE, TRUE, null);
        }
        return 0;
      }
    case 63:
      from_screen = FALSE;
      await G.windowprocs.win_getlin(S("Specify what? (type the word)"), P(out_str));
      if (strcmp(P(out_str), S(" "))) {
        mungspaces(P(out_str));
      }
      if (out_str[0] === 0 || out_str[0] === 27) {
        return 0;
      }
      if (out_str[1]) {
        await checkfile(P(out_str), pm, TRUE, TRUE, null);
        return 0;
      }
      sym = out_str[0];
      break;
    case 109:
      await look_all(TRUE, TRUE);
      return 0;
    case 77:
      await look_all(FALSE, TRUE);
      return 0;
    case 111:
      await look_all(TRUE, FALSE);
      return 0;
    case 79:
      await look_all(FALSE, FALSE);
      return 0;
    }
  } else {
    cc.x = click_cc.x;
    cc.y = click_cc.y;
    sym = 0;
    from_screen = FALSE;
  }
  save_verbose = G.flags.verbose;
  G.flags.verbose = (G.flags.verbose && !quick ? 1 : 0) << 24 >> 24;
  do {
    pm = null;
    found = 0;
    out_str[0] = 0;
    if (from_screen || clicklook) {
      if (from_screen) {
        if (G.flags.verbose) {
          await pline(S("Please move the cursor to %s."), P(G.what_is_an_unknown_object));
        } else {
          await pline(S("Pick an object."));
        }
        ans = await getpos(cc, quick, P(G.what_is_an_unknown_object));
        if (ans < 0 || cc.x < 0) {
          break;
        }
        G.flags.verbose = FALSE;
      }
    }
    found = await do_screen_description(cc.$clone(), from_screen || clicklook ? 1 : 0, sym, P(out_str), P(firstmatch, 0), P(supplemental_pm, 0));
    if (found) {
      await G.windowprocs.win_putmixed(G.WIN_MESSAGE, 0, P(out_str));
      {
        let dmpbuf = new Int8Array(256);
        decode_mixed(P(dmpbuf), P(out_str));
        if (dmpbuf[0] < 32 || dmpbuf[0] >= 127) {
          dmpbuf[0] = 32;
        }
        await dumplogmsg(P(dmpbuf));
      }
      if (found === 1 && ans !== LOOK_QUICK && ans !== LOOK_ONCE && (ans === LOOK_VERBOSE || G.flags.help && !quick) && !clicklook) {
        let temp_buf = new Int8Array(256);
        let supplemental_name = new Int8Array(256);
        supplemental_name[0] = 0;
        strcpy(P(temp_buf), firstmatch[0]);
        await checkfile(P(temp_buf), pm, FALSE, (ans === LOOK_VERBOSE ? 1 : 0) << 24 >> 24, P(supplemental_name));
        if (supplemental_pm[0]) {
          await do_supplemental_info(P(supplemental_name), supplemental_pm[0], (ans === LOOK_VERBOSE ? 1 : 0) << 24 >> 24);
        }
      }
    } else {
      await pline(S("I've never heard of such things."));
    }
  } while (from_screen && !quick && ans !== LOOK_ONCE && !clicklook);
  G.flags.verbose = save_verbose;
  return 0;
}

async function look_all(nearby: number, do_mons: number): Promise<void> {
  let win = 0;
  let x = 0;
  let y = 0;
  let lo_x = 0;
  let lo_y = 0;
  let hi_x = 0;
  let hi_y = 0;
  let glyph = 0;
  let count = 0;
  let lookbuf = new Int8Array(256);
  let outbuf = new Int8Array(256);
  win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  lo_y = nearby ? G.u.uy - 8 > 0 ? G.u.uy - 8 : 0 : 0;
  lo_x = nearby ? G.u.ux - 8 > 1 ? G.u.ux - 8 : 1 : 1;
  hi_y = nearby ? G.u.uy + 8 < 21 - 1 ? G.u.uy + 8 : 21 - 1 : ROWNO - 1;
  hi_x = nearby ? G.u.ux + 8 < 80 - 1 ? G.u.ux + 8 : 80 - 1 : COLNO - 1;
  for (y = lo_y; y <= hi_y; ++y) {
    for (x = lo_x; x <= hi_x; ++x) {
      lookbuf[0] = 0;
      glyph = glyph_at(x, y);
      if (do_mons) {
        if (glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382) {
          let mtmp = null;
          G.bhitpos.x = x << 24 >> 24;
          G.bhitpos.y = y << 24 >> 24;
          if (x === G.u.ux && y === G.u.uy && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uswallow | 0 || !((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.uundetected || (G.u.uprops[TELEPAT].extrinsic || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic)))) {
            await self_lookat(P(lookbuf));
            ++count;
          } else if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
            await look_at_monster(P(lookbuf), null, mtmp, x, y);
            ++count;
          }
        } else if (glyph === 382 + (382 + 0)) {
          strcpy(P(lookbuf), P(G.invisexplain));
          ++count;
        } else if (glyph >= (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) && glyph < (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) + 6) {
          let warnindx = glyph >= (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) && glyph < (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) + 6 ? glyph - ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))));
          ;
          strcpy(P(lookbuf), G.def_warnsyms[warnindx].explanation);
          ++count;
        }
      } else {
        if (glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382) {
          await look_at_object(P(lookbuf), x, y, glyph);
          ++count;
        }
      }
      if ($rd(P(lookbuf))) {
        let coordbuf = new Int8Array(20);
        let which = new Int8Array(12);
        let cmode = 0;
        cmode = (G.iflags.getpos_coords !== GPCOORDS_NONE ? G.iflags.getpos_coords : GPCOORDS_MAP) << 24 >> 24;
        if (count === 1) {
          strcpy(P(which), do_mons ? S("monsters") : S("objects"));
          if (nearby) {
            sprintf(P(outbuf), S("%s currently shown near %s:"), upstart(P(which)), cmode !== GPCOORDS_COMPASS ? coord_desc(G.u.ux, G.u.uy, P(coordbuf), cmode) : !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uswallow | 0 || !((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.uundetected || (G.u.uprops[TELEPAT].extrinsic || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic))) ? S("your position") : S("you"));
          } else {
            sprintf(P(outbuf), S("All %s currently shown on the map:"), P(which));
          }
          await G.windowprocs.win_putstr(win, 0, P(outbuf));
          await G.windowprocs.win_putstr(win, 0, S(""));
        }
        sprintf(P(outbuf), cmode === GPCOORDS_SCREEN ? S("%s  ") : cmode === GPCOORDS_MAP ? S("%8s  ") : S("%12s  "), coord_desc(x, y, P(coordbuf), cmode));
        sprintf(eos(P(outbuf)), S("%s  "), encglyph(glyph));
        lookbuf[256 - 1 - strlen(P(outbuf))] = 0;
        strcat(P(outbuf), P(lookbuf));
        await G.windowprocs.win_putmixed(win, 0, P(outbuf));
      }
    }
  }
  if (count) {
    await G.windowprocs.win_display_nhwindow(win, TRUE);
  } else {
    await pline(S("No %s are currently shown %s."), do_mons ? S("monsters") : S("objects"), nearby ? S("nearby") : S("on the map"));
  }
  await G.windowprocs.win_destroy_nhwindow(win);
}

async function do_supplemental_info(name: Ptr | null, pm: struct_permonst | null, without_asking: number): Promise<void> {
  let textp = null;
  let datawin = WIN_ERR;
  let entrytext = name;
  let bp = null;
  let bp2 = null;
  let question = new Int8Array(128);
  let yes_to_moreinfo = FALSE;
  let is_marauder = (name && pm && (pm.mflags2 & 128) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  if (is_marauder && strlen(name) < BUFSZ - 1) {
    let fullname = new Int8Array(256);
    bp = strstri(name, S(" of "));
    bp2 = strstri(name, S(" the Fence"));
    if (bp || bp2) {
      strcpy(P(fullname), name);
      if (!without_asking) {
        strcpy(P(question), S("More info about \""));
        copynchars(eos(P(question)), entrytext, 128 - 1 - (strlen(P(question)) + 2) | 0);
        strcat(P(question), S("\"?"));
        if (await yn_function(P(question), P(G.ynchars), 110) === 121) {
          yes_to_moreinfo = TRUE;
        }
      }
      if (yes_to_moreinfo) {
        let i = 0;
        let subs = 0;
        let gang = null;
        if (bp) {
          textp = P(suptext1);
          gang = bp.add(4);
          bp.a[bp.o] = 0;
        } else {
          textp = P(suptext2);
          gang = S("");
        }
        datawin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        for (i = 0; textp.a[textp.o + i]; ++i) {
          let buf = new Int8Array(256);
          let txt = null;
          if (!!strstri(textp.a[textp.o + i], S("%s"))) {
            sprintf(P(buf), textp.a[textp.o + i], subs++ ? gang : P(fullname));
            txt = P(buf);
          } else {
            txt = textp.a[textp.o + i];
          }
          await G.windowprocs.win_putstr(datawin, 0, txt);
        }
        await G.windowprocs.win_display_nhwindow(datawin, FALSE);
        await G.windowprocs.win_destroy_nhwindow(datawin), datawin = WIN_ERR;
      }
    }
  }
}

export async function dowhatis(): Promise<number> {
  return await do_look(0, null);
}

export async function doquickwhatis(): Promise<number> {
  return await do_look(1, null);
}

export async function doidtrap(): Promise<number> {
  let trap = null;
  let x = 0;
  let y = 0;
  let tt = 0;
  let glyph = 0;
  if (!await getdir(S("^"))) {
    return 0;
  }
  x = G.u.ux + G.u.dx;
  y = G.u.uy + G.u.dy;
  glyph = glyph_at(x, y);
  if (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM && (tt = glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) - S_arrow_trap + 1 : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === BEAR_TRAP) {
    let chesttrap = trapped_chest_at(tt, x, y);
    if (chesttrap || trapped_door_at(tt, x, y)) {
      await pline(S("That is a trapped %s."), chesttrap ? S("chest") : S("door"));
      return 0;
    }
  }
  for (trap = G.ftrap; trap; trap = trap.ntrap) {
    if (trap.tx === x && trap.ty === y) {
      if (!trap.tseen) {
        break;
      }
      tt = trap.ttyp | 0;
      if (G.u.dz) {
        if (G.u.dz < 0 ? tt === HOLE || tt === TRAPDOOR ? 1 : 0 : tt === ROCKTRAP ? 1 : 0) {
          break;
        }
      }
      tt = G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(TRAPNUM - 1) + 1 : tt;
      await pline(S("That is %s%s%s."), await an(G.defsyms[S_arrow_trap + tt - 1].explanation), !trap.madeby_u ? S("") : tt === WEB ? S(" woven") : tt === HOLE || tt === PIT ? S(" dug") : S(" set"), !trap.madeby_u ? S("") : S(" by you"));
      return 0;
    }
  }
  await pline(S("I can't see a trap there."));
  return 0;
}

async function whatdoes_help(): Promise<void> {
  let fp = null;
  let p = null;
  let buf = new Int8Array(256);
  let tmpwin = 0;
  fp = await dlb_fopen(S("keyhelp"), S("r"));
  if (!fp) {
    await pline(S("Cannot open \"%s\" data file!"), S("keyhelp"));
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, TRUE);
    return;
  }
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  while (dlb_fgets(P(buf), 256, fp)) {
    if ($rd(P(buf)) === 35) {
      continue;
    }
    for (p = P(buf); p.a[p.o]; p = p.add(1)) {
      if (p.a[p.o] !== 32 && p.a[p.o] !== 9) {
        break;
      }
    }
    await G.windowprocs.win_putstr(tmpwin, 0, p);
  }
  dlb_fclose(fp);
  await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
}

export function dowhatdoes_core(q: number, cbuf: Ptr | null): Ptr | null {
  let buf = new Int8Array(256);
  let ec_desc = null;
  if (!!(ec_desc = key2extcmddesc(q))) {
    let keybuf = new Int8Array(128);
    sprintf(P(buf), S("%-8s%s."), key2txt(q, P(keybuf)), ec_desc);
    strcpy(cbuf, P(buf));
    return cbuf;
  }
  return null;
}

export async function dowhatdoes(): Promise<number> {
  let bufr = new Int8Array(256);
  let q = 0;
  let reslt = null;
  if (!dowhatdoes$once) {
    await pline(S("Ask about '&' or '?' to get more info.%s"), G.iflags.altmeta ? S("  (For ESC, type it twice.)") : S(""));
    dowhatdoes$once = TRUE;
  }
  introff();
  q = await yn_function(S("What command?"), null, 0);
  if (q === 27 && G.iflags.altmeta) {
    q = await yn_function(S("]"), null, 0);
    if (q !== 27) {
      q = (q & 0xff | 128) << 24 >> 24;
    }
  }
  intron();
  reslt = dowhatdoes_core(q, P(bufr));
  if (reslt) {
    if (q === 38 || q === 63) {
      await whatdoes_help();
    }
    await pline(S("%s"), reslt);
  } else {
    await pline(S("No such command '%s', char code %d (0%03o or 0x%02x)."), visctrl(q), q & 0xff, q & 0xff, q & 0xff);
  }
  return 0;
}

async function docontact(): Promise<void> {
  let cwin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  let buf = new Int8Array(256);
  if (G.sysopt.support) {
    sprintf(P(buf), S("To contact local support, %s"), G.sysopt.support);
    await G.windowprocs.win_putstr(cwin, 0, P(buf));
    await G.windowprocs.win_putstr(cwin, 0, S(""));
  } else if (G.sysopt.fmtd_wizard_list) {
    sprintf(P(buf), S("To contact local support, contact %s."), G.sysopt.fmtd_wizard_list);
    await G.windowprocs.win_putstr(cwin, 0, P(buf));
    await G.windowprocs.win_putstr(cwin, 0, S(""));
  }
  await G.windowprocs.win_putstr(cwin, 0, S("To contact the NetHack development team directly,"));
  sprintf(P(buf), S("see the 'Contact' form on our website or email <%s>."), S("devteam@nethack.org"));
  await G.windowprocs.win_putstr(cwin, 0, P(buf));
  await G.windowprocs.win_putstr(cwin, 0, S(""));
  await G.windowprocs.win_putstr(cwin, 0, S("For more information on NetHack, or to report a bug,"));
  sprintf(P(buf), S("visit our website \"%s\"."), S("https://www.nethack.org/"));
  await G.windowprocs.win_putstr(cwin, 0, P(buf));
  await G.windowprocs.win_display_nhwindow(cwin, FALSE);
  await G.windowprocs.win_destroy_nhwindow(cwin);
}

async function dispfile_help(): Promise<void> {
  await G.windowprocs.win_display_file(S("help"), TRUE);
}

async function dispfile_shelp(): Promise<void> {
  await G.windowprocs.win_display_file(S("hh"), TRUE);
}

async function dispfile_optionfile(): Promise<void> {
  await G.windowprocs.win_display_file(S("opthelp"), TRUE);
}

async function dispfile_license(): Promise<void> {
  await G.windowprocs.win_display_file(S("license"), TRUE);
}

async function dispfile_debughelp(): Promise<void> {
  await G.windowprocs.win_display_file(S("wizhelp"), TRUE);
}

async function hmenu_doextversion(): Promise<void> {
  await doextversion();
}

async function hmenu_dohistory(): Promise<void> {
  await dohistory();
}

async function hmenu_dowhatis(): Promise<void> {
  await dowhatis();
}

async function hmenu_dowhatdoes(): Promise<void> {
  await dowhatdoes();
}

async function hmenu_doextlist(): Promise<void> {
  await doextlist();
}

export async function domenucontrols(): Promise<void> {
  let cwin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  await show_menu_controls(cwin, FALSE);
  await G.windowprocs.win_display_nhwindow(cwin, FALSE);
  await G.windowprocs.win_destroy_nhwindow(cwin);
}

export async function dohelp(): Promise<number> {
  let tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  let helpbuf = new Int8Array(128);
  let i = 0;
  let n = 0;
  const selected = [null];
  let any = new union_any();
  let sel = 0;
  any.$cp(G.zeroany);
  await G.windowprocs.win_start_menu(tmpwin);
  for (i = 0; help_menu_items[i].text; ++i) {
    if (!G.flags.debug && help_menu_items[i].f === dispfile_debughelp) {
      continue;
    }
    if ($rd(help_menu_items[i].text) === 37) {
      sprintf(P(helpbuf), help_menu_items[i].text, S("Unix"));
    } else {
      strcpy(P(helpbuf), help_menu_items[i].text);
    }
    any.a_int = i + 1;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(helpbuf), MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(tmpwin, S("Select one item:"));
  n = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(selected, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (n > 0) {
    sel = selected[0].item.a_int - 1;
    free(selected[0]);
    await help_menu_items[sel].f();
  }
  return 0;
}

export async function dohistory(): Promise<number> {
  await G.windowprocs.win_display_file(S("history"), TRUE);
  return 0;
}

export function $init(): void {
  G.what_is_an_unknown_object = $cs("an unknown object", 18);
  suptext1 = [S("%s is a member of a marauding horde of orcs"),
S("rumored to have brutally attacked and plundered"),
S("the ordinarily sheltered town that is located "),
S("deep within The Gnomish Mines."),
S(""),
S("The members of that vicious horde proudly and "),
S("defiantly acclaim their allegiance to their"),
S("leader %s in their names."),
null];
  suptext2 = [S("\"%s\" is the common dungeon name of"),
S("a nefarious orc who is known to acquire property"),
S("from thieves and sell it off for profit."),
S(""),
S("The perpetrator was last seen hanging around the"),
S("stairs leading to the Gnomish Mines."),
null];
  help_menu_items = $sarrOf([anon_pager_c_2018.$of(hmenu_doextversion, S("About NetHack (version information).")),
anon_pager_c_2018.$of(dispfile_help, S("Long description of the game and commands.")),
anon_pager_c_2018.$of(dispfile_shelp, S("List of game commands.")),
anon_pager_c_2018.$of(hmenu_dohistory, S("Concise history of NetHack.")),
anon_pager_c_2018.$of(hmenu_dowhatis, S("Info on a character in the game display.")),
anon_pager_c_2018.$of(hmenu_dowhatdoes, S("Info on what a given key does.")),
anon_pager_c_2018.$of(option_help, S("List of game options.")),
anon_pager_c_2018.$of(dispfile_optionfile, S("Longer explanation of game options.")),
anon_pager_c_2018.$of(dokeylist, S("Full list of keyboard commands")),
anon_pager_c_2018.$of(hmenu_doextlist, S("List of extended commands.")),
anon_pager_c_2018.$of(domenucontrols, S("List menu control keys")),
anon_pager_c_2018.$of(dispfile_license, S("The NetHack license.")),
anon_pager_c_2018.$of(docontact, S("Support information.")),
anon_pager_c_2018.$of(dispfile_debughelp, S("List of wizard-mode commands.")),
anon_pager_c_2018.$of()]);
  append_str$sep = $cs(" or ", 5);
  do_screen_description$mon_interior = $cs("the interior of a monster", 26);
  do_screen_description$unreconnoitered = $cs("unreconnoitered", 16);
  do_screen_description$look_buf = new Int8Array(256);
  dowhatdoes$once = 0;
}
