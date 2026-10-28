// @ts-nocheck
// NetHack 3.6.7 detect.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { spec_ability } from './artifact.ts';
import { acurr, exercise } from './attrib.ts';
import { isok, yn_function } from './cmd.ts';
import { find_drawbridge, is_pool, open_drawbridge } from './dbridge.ts';
import { back_to_glyph, cls, docrt, feel_location, feel_newsym, flush_screen, glyph_at, magic_map_background, map_background, map_invisible, map_object, map_trap, newsym, see_monsters, show_glyph, under_ground, under_water, unmap_invisible, unmap_object, warning_of } from './display.ts';
import { Monnam, a_monnam, getpos, hcolor, x_monnam, y_monnam } from './do_name.ts';
import { def_char_to_monclass, def_char_to_objclass } from './drawing.ts';
import { depth, on_level } from './dungeon.ts';
import { losehp, money_cnt, nomul } from './hack.ts';
import { dist2, eos, s_suffix } from './hacklib.ts';
import { consume_obj_charge, currency, sobj_at, useup } from './invent.ts';
import { mapglyph } from './mapglyph.ts';
import { expels } from './mhitu.ts';
import { seemimic, wake_nearto } from './mon.ts';
import { monsndx, resists_blnd } from './mondata.ts';
import { discover_object } from './o_init.ts';
import { Tobjnam, an, makeplural, the, xname } from './objnam.ts';
import { Norep, You, You_feel, You_see, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part, poly_gender } from './polyself.ts';
import { make_blinded, make_confused, make_hallucinated, strange_feeling } from './potion.ts';
import { rn2, rnd, rnl } from './rnd.ts';
import { findgold } from './steal.ts';
import { activate_statue_trap, b_trapped, openfallingtrap, openholdingtrap, t_at } from './trap.ts';
import { hidden_gold } from './vault.ts';
import { do_clear_area, unblock_point } from './vision.ts';
import { detect_wsegs, worm_known } from './worm.ts';
import { get_obj_location } from './zap.ts';
import { anon_detect_c_1084, struct_d_level, struct_monst, struct_nhcoord, struct_obj, struct_rm, struct_trap } from './structs.ts';
import { $at2, $rd, $sarrOf, $sat, $wr, G, P, S, memset, rn2_on_display_rng, sprintf, strcat, strchr, strcpy } from './rt/index.ts';
import { ALL_CLASSES, ALTAR, ARTICLE_THE, ARTICLE_YOUR, A_INT, A_WIS, BEAR_TRAP, BLINDED, BOLT_LIM, BOULDER, BURIED_TOO, CHEST, CLAIRVOYANT, COIN_CLASS, COLNO, CONFUSION, CONTAINED_TOO, CORR, DEAF, DEF_MIMIC, DEF_MIMIC_DEF, DETECT_MONSTERS, DOOR, D_BROKEN, D_CLOSED, D_ISOPEN, D_LOCKED, D_NODOOR, D_TRAPPED, EXPL_MAX, FALSE, FOOD_CLASS, FOOT, GOLD, GOLD_PIECE, HALF_PHDAM, HALLUC, HALLUC_RES, HOLE, INFRAVISION, IN_SIGHT, I_SPECIAL, KILLED_BY_AN, LARGE_BOX, LAVAPOOL, LENSES, MAXMCLASSES, MAXOCLASSES, MAXPCHARS, M_AP_FURNITURE, M_AP_NOTHING, M_AP_OBJECT, NOSE, OTRAP_HERE, OTRAP_NONE, OTRAP_THERE, PIT, PM_GOLD_GOLEM, PM_LONG_WORM, PM_LONG_WORM_TAIL, PM_TENGU, POTION_CLASS, ROCK_CLASS, ROWNO, SCORR, SCROLL_CLASS, SDOOR, SEE_INVIS, SPBOOK_CLASS, SPFX_SEARCH, STAIRS, STATUE_TRAP, STUNNED, SUPPRESS_SADDLE, SVALL, SYM_BOULDER, SYM_OFF_X, S_EEL, S_GHOST, S_WORM_TAIL, S_arrow_trap, S_darkroom, S_room, S_stone, S_tree, TELEPAT, TER_DETECT, TER_MAP, TER_MON, TER_OBJ, TER_TRP, TIMEOUT, TOE, TRAPNUM, TRUE, WARN_OF_MON, WM_MASK } from './consts.ts';

let level_detects: any;

function unconstrain_map(): number {
  let res = (G.u.uinwater | 0 || G.u.uburied | 0 || G.u.uswallow | 0 ? 1 : 0) << 24 >> 24;
  G.iflags.save_uinwater = (G.u.uinwater) & 1, G.u.uinwater = 0;
  G.iflags.save_uburied = (G.u.uburied) & 1, G.u.uburied = 0;
  G.iflags.save_uswallow = (G.u.uswallow) & 1, G.u.uswallow = 0;
  return res;
}

function reconstrain_map(): void {
  G.u.uinwater = (G.iflags.save_uinwater) & 1, G.iflags.save_uinwater = 0;
  G.u.uburied = (G.iflags.save_uburied) & 1, G.iflags.save_uburied = 0;
  G.u.uswallow = (G.iflags.save_uswallow) & 1, G.iflags.save_uswallow = 0;
}

async function browse_map(ter_typ: number, ter_explain: Ptr | null): Promise<void> {
  let dummy_pos = new struct_nhcoord();
  let save_autodescribe = 0;
  dummy_pos.x = G.u.ux, dummy_pos.y = G.u.uy;
  save_autodescribe = G.iflags.autodescribe;
  G.iflags.autodescribe = TRUE;
  G.iflags.terrainmode = ter_typ;
  await getpos(dummy_pos, FALSE, ter_explain);
  G.iflags.terrainmode = 0;
  G.iflags.autodescribe = save_autodescribe;
}

async function map_monst(mtmp: struct_monst | null, showtail: number): Promise<void> {
  if (G.def_monsyms[mtmp.data.mlet].sym === 32) {
    await show_glyph(mtmp.mx, mtmp.my, (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mtmp.data)) + (1 + (382 + (382 + 0))));
  } else {
    await show_glyph(mtmp.mx, mtmp.my, mtmp.mtame ? (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mtmp.data)) + (382 + 0) : (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mtmp.data)) + 0);
  }
  if (showtail && mtmp.data === $sat(G.mons, PM_LONG_WORM)) {
    await detect_wsegs(mtmp, 0);
  }
}

export function trapped_chest_at(ttyp: number, x: number, y: number): number {
  let mtmp = null;
  let otmp = null;
  if (!(glyph_at(x, y) >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph_at(x, y) < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM)) {
    return FALSE;
  }
  if (ttyp !== BEAR_TRAP || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && rn2(20)) {
    return FALSE;
  }
  if (sobj_at(CHEST, x, y) || sobj_at(LARGE_BOX, x, y)) {
    return TRUE;
  }
  if (x === G.u.ux && y === G.u.uy) {
    for (otmp = G.invent; otmp; otmp = otmp.nobj) {
      if ((otmp.otyp === 189 || otmp.otyp === 190) && otmp.otrapped | 0) {
        return TRUE;
      }
    }
    if (G.u.usteed) {
      for (otmp = G.u.usteed.minvent; otmp; otmp = otmp.nobj) {
        if ((otmp.otyp === 189 || otmp.otyp === 190) && otmp.otrapped | 0) {
          return TRUE;
        }
      }
    }
  }
  if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
    for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
      if ((otmp.otyp === 189 || otmp.otyp === 190) && otmp.otrapped | 0) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

export function trapped_door_at(ttyp: number, x: number, y: number): number {
  let lev = null;
  if (!(glyph_at(x, y) >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph_at(x, y) < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM)) {
    return FALSE;
  }
  if (ttyp !== BEAR_TRAP || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && rn2(20)) {
    return FALSE;
  }
  lev = $sat(G.level.locations[x], y);
  if (!(lev.typ === DOOR)) {
    return FALSE;
  }
  if (((lev.flags | 0) & (D_NODOOR | D_BROKEN | D_ISOPEN)) !== 0 && trapped_chest_at(ttyp, x, y)) {
    return FALSE;
  }
  return TRUE;
}

export function o_in(obj: struct_obj | null, oclass: number): struct_obj | null {
  let otmp = null;
  let temp = null;
  if (obj.oclass === oclass) {
    return obj;
  }
  if (!!obj.cobj && !(obj.otyp === 189 && obj.spe === 1)) {
    for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
      if (otmp.oclass === oclass) {
        return otmp;
      } else if (!!otmp.cobj && !!(temp = o_in(otmp, oclass))) {
        return temp;
      }
    }
  }
  return null;
}

export function o_material(obj: struct_obj | null, material: number): struct_obj | null {
  let otmp = null;
  let temp = null;
  if (G.objects[obj.otyp].oc_material === material) {
    return obj;
  }
  if (!!obj.cobj) {
    for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
      if (G.objects[otmp.otyp].oc_material === material) {
        return otmp;
      } else if (!!otmp.cobj && !!(temp = o_material(otmp, material))) {
        return temp;
      }
    }
  }
  return null;
}

function do_dknown_of(obj: struct_obj | null): void {
  let otmp = null;
  obj.dknown = 1;
  if (!!obj.cobj) {
    for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
      do_dknown_of(otmp);
    }
  }
}

function check_map_spot(x: number, y: number, oclass: number, material: number): number {
  let glyph = 0;
  let otmp = null;
  let mtmp = null;
  glyph = glyph_at(x, y);
  if (glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382) {
    if (oclass === ALL_CLASSES) {
      return (!(G.level.objects[x][y] || !!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && mtmp.minvent) ? 1 : 0) << 24 >> 24;
    } else {
      if (material && G.objects[glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382 ? 240 : glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 ? 449 : glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 ? glyph - (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))].oc_material === material) {
        for (otmp = G.level.objects[x][y]; otmp; otmp = otmp.v.v_nexthere) {
          if (o_material(otmp, GOLD)) {
            return FALSE;
          }
        }
        if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
          for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
            if (o_material(otmp, GOLD)) {
              return FALSE;
            }
          }
        }
        return TRUE;
      }
      if (oclass && G.objects[glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382 ? 240 : glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 ? 449 : glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 ? glyph - (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))].oc_class === oclass) {
        for (otmp = G.level.objects[x][y]; otmp; otmp = otmp.v.v_nexthere) {
          if (o_in(otmp, oclass)) {
            return FALSE;
          }
        }
        if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
          for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
            if (o_in(otmp, oclass)) {
              return FALSE;
            }
          }
        }
        return TRUE;
      }
    }
  }
  return FALSE;
}

async function clear_stale_map(oclass: number, material: number): Promise<number> {
  let zx = 0;
  let zy = 0;
  let change_made = FALSE;
  for (zx = 1; zx < COLNO; ++zx) {
    for (zy = 0; zy < ROWNO; ++zy) {
      if (check_map_spot(zx, zy, oclass, material)) {
        await unmap_object(zx, zy);
        change_made = TRUE;
      }
    }
  }
  return change_made;
}

export async function gold_detect(sobj: struct_obj | null): Promise<number> {
  let $g = 0;
  let obj = null;
  let mtmp = null;
  let gold = new struct_obj();
  let temp = null;
  let stale = 0;
  let ugold = 0;
  let steedgold = 0;
  let ter_typ = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      gold = new struct_obj();
      temp = null;
      ugold = FALSE;
      steedgold = FALSE;
      ter_typ = TER_DETECT | TER_OBJ;
      G.known = stale = await clear_stale_map(COIN_CLASS, (sobj.blessed | 0 ? GOLD : 0) >>> 0);
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        if (mtmp.mhp < 1) {
          continue;
        }
        if (findgold(mtmp.minvent) || await monsndx(mtmp.data) === PM_GOLD_GOLEM) {
          if (mtmp === G.u.usteed) {
            steedgold = TRUE;
          } else {
            G.known = TRUE;
            { $g = 1; continue $L; }
          }
        } else {
          for (obj = mtmp.minvent; obj; obj = obj.nobj) {
            if (sobj.blessed | 0 && o_material(obj, GOLD) || o_in(obj, COIN_CLASS)) {
              if (mtmp === G.u.usteed) {
                steedgold = TRUE;
              } else {
                G.known = TRUE;
                { $g = 1; continue $L; }
              }
            }
          }
        }
      }
      for (obj = G.level.objlist; obj; obj = obj.nobj) {
        if (sobj.blessed | 0 && o_material(obj, GOLD)) {
          G.known = TRUE;
          if (obj.ox !== G.u.ux || obj.oy !== G.u.uy) {
            { $g = 1; continue $L; }
          }
        } else if (o_in(obj, COIN_CLASS)) {
          G.known = TRUE;
          if (obj.ox !== G.u.ux || obj.oy !== G.u.uy) {
            { $g = 1; continue $L; }
          }
        }
      }
      if (!G.known) {
        if (sobj) {
          let buf = new Int8Array(256);
          if (G.youmonst.data === $sat(G.mons, PM_GOLD_GOLEM)) {
            sprintf(P(buf), S("You feel like a million %s!"), await currency(2));
          } else if (money_cnt(G.invent) || hidden_gold()) {
            strcpy(P(buf), S("You feel worried about your future financial situation."));
          } else if (steedgold) {
            sprintf(P(buf), S("You feel interested in %s financial situation."), s_suffix(await x_monnam(G.u.usteed, G.u.usteed.mtame ? ARTICLE_YOUR : ARTICLE_THE, null, SUPPRESS_SADDLE, FALSE)));
          } else {
            strcpy(P(buf), S("You feel materially poor."));
          }
          await strange_feeling(sobj, P(buf));
        }
        return 1;
      }
      if (stale) {
        await docrt();
      }
      await You(S("notice some gold between your %s."), await makeplural(body_part(FOOT)));
      return 0;
    case 1: // outgoldmap
      await cls();
      unconstrain_map();
      for (obj = G.level.objlist; obj; obj = obj.nobj) {
        if (sobj.blessed | 0 && !!(temp = o_material(obj, GOLD))) {
          if (temp !== obj) {
            temp.ox = obj.ox;
            temp.oy = obj.oy;
          }
          await map_object(temp, 1);
        } else if (!!(temp = o_in(obj, COIN_CLASS))) {
          if (temp !== obj) {
            temp.ox = obj.ox;
            temp.oy = obj.oy;
          }
          await map_object(temp, 1);
        }
        if (temp && temp.ox === G.u.ux && temp.oy === G.u.uy) {
          ugold = TRUE;
        }
      }
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        if (mtmp.mhp < 1) {
          continue;
        }
        temp = null;
        if (findgold(mtmp.minvent) || await monsndx(mtmp.data) === PM_GOLD_GOLEM) {
          gold.$cp(G.zeroobj);
          gold.otyp = GOLD_PIECE;
          gold.quan = rnd(10);
          gold.ox = mtmp.mx;
          gold.oy = mtmp.my;
          await map_object(gold, 1);
          temp = gold;
        } else {
          for (obj = mtmp.minvent; obj; obj = obj.nobj) {
            if (sobj.blessed | 0 && !!(temp = o_material(obj, GOLD))) {
              temp.ox = mtmp.mx;
              temp.oy = mtmp.my;
              await map_object(temp, 1);
              break;
            } else if (!!(temp = o_in(obj, COIN_CLASS))) {
              temp.ox = mtmp.mx;
              temp.oy = mtmp.my;
              await map_object(temp, 1);
              break;
            }
          }
        }
        if (temp && temp.ox === G.u.ux && temp.oy === G.u.uy) {
          ugold = TRUE;
        }
      }
      if (!ugold) {
        await newsym(G.u.ux, G.u.uy);
        ter_typ |= TER_MON;
      }
      await You_feel(S("very greedy, and sense gold!"));
      await exercise(A_WIS, TRUE);
      await browse_map(ter_typ, S("gold"));
      reconstrain_map();
      await docrt();
      if (G.u.uinwater) {
        await under_water(2);
      }
      if (G.u.uburied) {
        await under_ground(2);
      }
      return 0;
    }
    break;
  }
}

export async function food_detect(sobj: struct_obj | null): Promise<number> {
  let obj = null;
  let mtmp = null;
  let ct = 0;
  let ctu = 0;
  let confused = (G.u.uprops[CONFUSION].intrinsic || sobj && sobj.cursed | 0 ? 1 : 0) << 24 >> 24;
  let stale = 0;
  let oclass = (confused ? POTION_CLASS : FOOD_CLASS) << 24 >> 24;
  let what = confused ? G.c_common_strings.c_something : S("food");
  stale = await clear_stale_map(oclass, 0);
  if (G.u.usteed) {
    G.u.usteed.mx = G.u.ux, G.u.usteed.my = G.u.uy;
  }
  for (obj = G.level.objlist; obj; obj = obj.nobj) {
    if (o_in(obj, oclass)) {
      if (obj.ox === G.u.ux && obj.oy === G.u.uy) {
        ++ctu;
      } else {
        ++ct;
      }
    }
  }
  for (mtmp = G.level.monlist; mtmp && (!ct || !ctu); mtmp = mtmp.nmon) {
    for (obj = mtmp.minvent; obj; obj = obj.nobj) {
      if (o_in(obj, oclass)) {
        if (mtmp.mx === G.u.ux && mtmp.my === G.u.uy) {
          ++ctu;
        } else {
          ++ct;
        }
        break;
      }
    }
  }
  if (!ct && !ctu) {
    G.known = (stale && !confused ? 1 : 0) << 24 >> 24;
    if (stale) {
      await docrt();
      await You(S("sense a lack of %s nearby."), what);
      if (sobj && sobj.blessed | 0) {
        if (!G.u.uedibility) {
          await Your(S("%s starts to tingle."), body_part(NOSE));
        }
        G.u.uedibility = 1;
      }
    } else if (sobj) {
      let buf = new Int8Array(256);
      sprintf(P(buf), S("Your %s twitches%s."), body_part(NOSE), sobj.blessed | 0 && !G.u.uedibility ? S(" then starts to tingle") : S(""));
      if (sobj.blessed | 0 && !G.u.uedibility) {
        let savebeginner = G.flags.beginner;
        G.flags.beginner = FALSE;
        await strange_feeling(sobj, P(buf));
        G.flags.beginner = savebeginner;
        G.u.uedibility = 1;
      } else {
        await strange_feeling(sobj, P(buf));
      }
    }
    return !stale ? 1 : 0;
  } else if (!ct) {
    G.known = TRUE;
    await You(S("%s %s nearby."), sobj ? S("smell") : S("sense"), what);
    if (sobj && sobj.blessed | 0) {
      if (!G.u.uedibility) {
        await pline(S("Your %s starts to tingle."), body_part(NOSE));
      }
      G.u.uedibility = 1;
    }
  } else {
    let temp = null;
    let ter_typ = TER_DETECT | TER_OBJ;
    G.known = TRUE;
    await cls();
    unconstrain_map();
    for (obj = G.level.objlist; obj; obj = obj.nobj) {
      if (!!(temp = o_in(obj, oclass))) {
        if (temp !== obj) {
          temp.ox = obj.ox;
          temp.oy = obj.oy;
        }
        await map_object(temp, 1);
      }
    }
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      for (obj = mtmp.minvent; obj; obj = obj.nobj) {
        if (!!(temp = o_in(obj, oclass))) {
          temp.ox = mtmp.mx;
          temp.oy = mtmp.my;
          await map_object(temp, 1);
          break;
        }
      }
    }
    if (!ctu) {
      await newsym(G.u.ux, G.u.uy);
      ter_typ |= TER_MON;
    }
    if (sobj) {
      if (sobj.blessed) {
        await Your(S("%s %s to tingle and you smell %s."), body_part(NOSE), G.u.uedibility | 0 ? S("continues") : S("starts"), what);
        G.u.uedibility = 1;
      } else {
        await Your(S("%s tingles and you smell %s."), body_part(NOSE), what);
      }
    } else {
      await You(S("sense %s."), what);
    }
    await exercise(A_WIS, TRUE);
    await browse_map(ter_typ, S("food"));
    reconstrain_map();
    await docrt();
    if (G.u.uinwater) {
      await under_water(2);
    }
    if (G.u.uburied) {
      await under_ground(2);
    }
  }
  return 0;
}

export async function object_detect(detector: struct_obj | null, class_: number): Promise<number> {
  let x = 0;
  let y = 0;
  let stuff = new Int8Array(256);
  let is_cursed = detector && detector.cursed | 0 ? 1 : 0;
  let do_dknown = detector && (detector.oclass === POTION_CLASS || detector.oclass === SPBOOK_CLASS) && detector.blessed | 0 ? 1 : 0;
  let ct = 0;
  let ctu = 0;
  let obj = null;
  let otmp = null;
  let mtmp = null;
  let sym = 0;
  let boulder = 0;
  let ter_typ = TER_DETECT | TER_OBJ;
  if (class_ < 0 || class_ >= MAXOCLASSES) {
    await impossible(S("object_detect:  illegal class %d"), class_);
    class_ = 0;
  }
  sym = class_ ? G.def_oc_syms[class_].sym : 0;
  if (sym && G.showsyms[SYM_BOULDER + SYM_OFF_X] && sym === G.showsyms[SYM_BOULDER + SYM_OFF_X]) {
    boulder = ROCK_CLASS;
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) || G.u.uprops[CONFUSION].intrinsic && class_ === SCROLL_CLASS) {
    strcpy(P(stuff), G.c_common_strings.c_something);
  } else {
    strcpy(P(stuff), class_ ? G.def_oc_syms[class_].name : S("objects"));
  }
  if (boulder && class_ !== ROCK_CLASS) {
    strcat(P(stuff), S(" and/or large stones"));
  }
  if (do_dknown) {
    for (obj = G.invent; obj; obj = obj.nobj) {
      do_dknown_of(obj);
    }
  }
  for (obj = G.level.objlist; obj; obj = obj.nobj) {
    if (!class_ && !boulder || o_in(obj, class_) || o_in(obj, boulder)) {
      if (obj.ox === G.u.ux && obj.oy === G.u.uy) {
        ++ctu;
      } else {
        ++ct;
      }
    }
    if (do_dknown) {
      do_dknown_of(obj);
    }
  }
  for (obj = G.level.buriedobjlist; obj; obj = obj.nobj) {
    if (!class_ || o_in(obj, class_)) {
      if (obj.ox === G.u.ux && obj.oy === G.u.uy) {
        ++ctu;
      } else {
        ++ct;
      }
    }
    if (do_dknown) {
      do_dknown_of(obj);
    }
  }
  if (G.u.usteed) {
    G.u.usteed.mx = G.u.ux, G.u.usteed.my = G.u.uy;
  }
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    for (obj = mtmp.minvent; obj; obj = obj.nobj) {
      if (!class_ && !boulder || o_in(obj, class_) || o_in(obj, boulder)) {
        ++ct;
      }
      if (do_dknown) {
        do_dknown_of(obj);
      }
    }
    if (is_cursed && (mtmp.m_ap_type & 7) === M_AP_OBJECT && (!class_ || class_ === G.objects[mtmp.mappearance].oc_class) || findgold(mtmp.minvent) && (!class_ || class_ === COIN_CLASS)) {
      ++ct;
      break;
    }
  }
  if (!await clear_stale_map(!class_ ? ALL_CLASSES : class_, 0) && !ct) {
    if (!ctu) {
      if (detector) {
        await strange_feeling(detector, S("You feel a lack of something."));
      }
      return 1;
    }
    await You(S("sense %s nearby."), P(stuff));
    return 0;
  }
  await cls();
  unconstrain_map();
  for (obj = G.level.buriedobjlist; obj; obj = obj.nobj) {
    if (!class_ || !!(otmp = o_in(obj, class_))) {
      if (class_) {
        if (otmp !== obj) {
          otmp.ox = obj.ox;
          otmp.oy = obj.oy;
        }
        await map_object(otmp, 1);
      } else {
        await map_object(obj, 1);
      }
    }
  }
  for (x = 1; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      for (obj = G.level.objects[x][y]; obj; obj = obj.v.v_nexthere) {
        if (!class_ && !boulder || !!(otmp = o_in(obj, class_)) || !!(otmp = o_in(obj, boulder))) {
          if (class_ || boulder) {
            if (otmp !== obj) {
              otmp.ox = obj.ox;
              otmp.oy = obj.oy;
            }
            await map_object(otmp, 1);
          } else {
            await map_object(obj, 1);
          }
          break;
        }
      }
    }
  }
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    for (obj = mtmp.minvent; obj; obj = obj.nobj) {
      if (!class_ && !boulder || !!(otmp = o_in(obj, class_)) || !!(otmp = o_in(obj, boulder))) {
        if (!class_ && !boulder) {
          otmp = obj;
        }
        otmp.ox = mtmp.mx;
        otmp.oy = mtmp.my;
        await map_object(otmp, 1);
        break;
      }
    }
    if (is_cursed && (mtmp.m_ap_type & 7) === M_AP_OBJECT && (!class_ || class_ === G.objects[mtmp.mappearance].oc_class)) {
      let temp = new struct_obj();
      temp.$cp(G.zeroobj);
      temp.otyp = mtmp.mappearance << 16 >> 16;
      temp.quan = 1;
      temp.ox = mtmp.mx;
      temp.oy = mtmp.my;
      temp.corpsenm = PM_TENGU;
      await map_object(temp, 1);
    } else if (findgold(mtmp.minvent) && (!class_ || class_ === COIN_CLASS)) {
      let gold = new struct_obj();
      gold.$cp(G.zeroobj);
      gold.otyp = GOLD_PIECE;
      gold.quan = rnd(10);
      gold.ox = mtmp.mx;
      gold.oy = mtmp.my;
      await map_object(gold, 1);
    }
  }
  if (!(glyph_at(G.u.ux, G.u.uy) >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph_at(G.u.ux, G.u.uy) < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph_at(G.u.ux, G.u.uy) >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph_at(G.u.ux, G.u.uy) < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph_at(G.u.ux, G.u.uy) >= 382 + (1 + (382 + (382 + 0))) && glyph_at(G.u.ux, G.u.uy) < 382 + (1 + (382 + (382 + 0))) + 382)) {
    await newsym(G.u.ux, G.u.uy);
    ter_typ |= TER_MON;
  }
  await You(S("detect the %s of %s."), ct ? S("presence") : S("absence"), P(stuff));
  if (!ct) {
    await G.windowprocs.win_display_nhwindow(G.WIN_MAP, TRUE);
  } else {
    await browse_map(ter_typ, S("object"));
  }
  reconstrain_map();
  await docrt();
  if (G.u.uinwater) {
    await under_water(2);
  }
  if (G.u.uburied) {
    await under_ground(2);
  }
  return 0;
}

export async function monster_detect(otmp: struct_obj | null, mclass: number): Promise<number> {
  let $t1: any, $t2: any;
  let mtmp = null;
  let mcnt = 0;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (!(mtmp.mhp < 1)) {
      ++mcnt;
      break;
    }
  }
  if (!mcnt) {
    if (otmp) {
      await strange_feeling(otmp, G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("You get the heebie jeebies.") : S("You feel threatened."));
    }
    return 1;
  } else {
    let unconstrained = 0;
    let woken = FALSE;
    let swallowed = G.u.uswallow;
    await cls();
    unconstrained = unconstrain_map();
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if (!mclass || mtmp.data.mlet === mclass || mtmp.data === $sat(G.mons, PM_LONG_WORM) && mclass === S_WORM_TAIL) {
        await map_monst(mtmp, TRUE);
      }
      if (otmp && otmp.cursed | 0 && (mtmp.msleeping | 0 || !mtmp.mcanmove)) {
        mtmp.msleeping = (mtmp.mfrozen = 0) & 1;
        mtmp.mcanmove = 1;
        woken = TRUE;
      }
    }
    if (!swallowed) {
      await show_glyph(G.u.ux, G.u.uy, G.u.usteed && ((!G.u.usteed.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.usteed.mundetected) ? (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.u.usteed.data)) + (382 + (382 + (1 + (382 + (382 + 0))))) : (G.youmonst.m_ap_type & 7) === M_AP_NOTHING ? (G.u.umonnum !== G.u.umonster || !G.flags.showrace ? G.u.umonnum : G.flags.female && G.urace.femalenum !== -1 ? G.urace.femalenum : G.urace.malenum) + 0 : (G.youmonst.m_ap_type & 7) === M_AP_FURNITURE ? (G.youmonst.mappearance | 0) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : (G.youmonst.m_ap_type & 7) === M_AP_OBJECT ? (G.youmonst.mappearance | 0) + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : (G.youmonst.mappearance | 0) + 0);
    }
    await You(S("sense the presence of monsters."));
    if (woken) {
      await pline(S("Monsters sense the presence of you."));
    }
    if (otmp && otmp.blessed | 0 && !unconstrained) {
      await G.windowprocs.win_display_nhwindow(G.WIN_MAP, TRUE);
    } else {
      ($t1 = G.u.uprops[DETECT_MONSTERS], $t1.extrinsic = $t1.extrinsic | I_SPECIAL);
      await browse_map(TER_DETECT | TER_MON, S("monster of interest"));
      ($t2 = G.u.uprops[DETECT_MONSTERS], $t2.extrinsic = $t2.extrinsic & ~I_SPECIAL);
    }
    reconstrain_map();
    await docrt();
    if (G.u.uinwater) {
      await under_water(2);
    }
    if (G.u.uburied) {
      await under_ground(2);
    }
  }
  return 0;
}

async function sense_trap(trap: struct_trap | null, x: number, y: number, src_cursed: number): Promise<void> {
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) || src_cursed) {
    let obj = new struct_obj();
    obj.$cp(G.zeroobj);
    if (trap) {
      obj.ox = trap.tx;
      obj.oy = trap.ty;
    } else {
      obj.ox = x;
      obj.oy = y;
    }
    obj.otyp = (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? GOLD_PIECE : rn2(454 - 1) + 1) << 16 >> 16;
    obj.quan = obj.otyp === GOLD_PIECE ? rnd(10) : G.objects[obj.otyp].oc_merge | 0 ? rnd(2) : 1;
    obj.corpsenm = rn2(382);
    await map_object(obj, 1);
  } else if (trap) {
    await map_trap(trap, 1);
    trap.tseen = 1;
  } else {
    let temp_trap = new struct_trap();
    memset(temp_trap, 0, 24);
    temp_trap.tx = x;
    temp_trap.ty = y;
    temp_trap.ttyp = (BEAR_TRAP) & 31;
    await map_trap(temp_trap, 1);
  }
}

async function detect_obj_traps(objlist: struct_obj | null, show_them: number, how: number): Promise<number> {
  let otmp = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let result = OTRAP_NONE;
  for (otmp = objlist; otmp; otmp = otmp.nobj) {
    if ((otmp.otyp === 189 || otmp.otyp === 190) && otmp.otrapped | 0 && get_obj_location(otmp, P(x, 0), P(y, 0), BURIED_TOO | CONTAINED_TOO)) {
      result |= x[0] === G.u.ux && y[0] === G.u.uy ? OTRAP_HERE : OTRAP_THERE;
      if (show_them) {
        await sense_trap(null, x[0], y[0], how);
      }
    }
    if (!!otmp.cobj) {
      result |= await detect_obj_traps(otmp.cobj, show_them, how);
    }
  }
  return result;
}

export async function trap_detect(sobj: struct_obj | null): Promise<number> {
  let $g = 0;
  let ttmp = null;
  let mon = null;
  let door = 0;
  let glyph = 0;
  let tr = 0;
  let ter_typ = 0;
  let cursed_src = 0;
  let found = 0;
  let cc = new struct_nhcoord();
  $L: for (;;) {
    switch ($g) {
    case 0:
      ter_typ = TER_DETECT | TER_TRP;
      cursed_src = sobj && sobj.cursed | 0 ? 1 : 0;
      found = FALSE;
      cc = new struct_nhcoord();
      if (G.u.usteed) {
        G.u.usteed.mx = G.u.ux, G.u.usteed.my = G.u.uy;
      }
      for (ttmp = G.ftrap; ttmp; ttmp = ttmp.ntrap) {
        if (ttmp.tx !== G.u.ux || ttmp.ty !== G.u.uy) {
          { $g = 1; continue $L; }
        } else {
          found = TRUE;
        }
      }
      if ((tr = await detect_obj_traps(G.level.objlist, FALSE, 0)) !== OTRAP_NONE) {
        if (tr & OTRAP_THERE) {
          { $g = 1; continue $L; }
        } else {
          found = TRUE;
        }
      }
      if ((tr = await detect_obj_traps(G.level.buriedobjlist, FALSE, 0)) !== OTRAP_NONE) {
        if (tr & OTRAP_THERE) {
          { $g = 1; continue $L; }
        } else {
          found = TRUE;
        }
      }
      for (mon = G.level.monlist; mon; mon = mon.nmon) {
        if (mon.mhp < 1) {
          continue;
        }
        if ((tr = await detect_obj_traps(mon.minvent, FALSE, 0)) !== OTRAP_NONE) {
          if (tr & OTRAP_THERE) {
            { $g = 1; continue $L; }
          } else {
            found = TRUE;
          }
        }
      }
      if (await detect_obj_traps(G.invent, FALSE, 0) !== OTRAP_NONE) {
        found = TRUE;
      }
      for (door = 0; door < G.doorindex; ++door) {
        cc.$cp(G.doors[door]);
        if (($at2(G.level.locations, cc.x, cc.y).flags | 0) & D_TRAPPED) {
          if (cc.x !== G.u.ux || cc.y !== G.u.uy) {
            { $g = 1; continue $L; }
          } else {
            found = TRUE;
          }
        }
      }
      if (!found) {
        let buf = new Int8Array(256);
        sprintf(P(buf), S("Your %s stop itching."), await makeplural(body_part(TOE)));
        await strange_feeling(sobj, P(buf));
        return 1;
      }
      await Your(S("%s itch."), await makeplural(body_part(TOE)));
      return 0;
    case 1: // outtrapmap
      await cls();
      unconstrain_map();
      await detect_obj_traps(G.level.objlist, TRUE, cursed_src);
      await detect_obj_traps(G.level.buriedobjlist, TRUE, cursed_src);
      for (mon = G.level.monlist; mon; mon = mon.nmon) {
        if (mon.mhp < 1) {
          continue;
        }
        await detect_obj_traps(mon.minvent, TRUE, cursed_src);
      }
      await detect_obj_traps(G.invent, TRUE, cursed_src);
      for (ttmp = G.ftrap; ttmp; ttmp = ttmp.ntrap) {
        await sense_trap(ttmp, 0, 0, cursed_src);
      }
      for (door = 0; door < G.doorindex; ++door) {
        cc.$cp(G.doors[door]);
        if (($at2(G.level.locations, cc.x, cc.y).flags | 0) & D_TRAPPED) {
          await sense_trap(null, cc.x, cc.y, cursed_src);
        }
      }
      glyph = glyph_at(G.u.ux, G.u.uy);
      if (!(glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM || (glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382))) {
        await newsym(G.u.ux, G.u.uy);
        ter_typ |= TER_MON;
      }
      await You_feel(S("%s."), cursed_src ? S("very greedy") : S("entrapped"));
      await browse_map(ter_typ, S("trap of interest"));
      reconstrain_map();
      await docrt();
      if (G.u.uinwater) {
        await under_water(2);
      }
      if (G.u.uburied) {
        await under_ground(2);
      }
      return 0;
    }
    break;
  }
}

export function level_distance(where: struct_d_level | null): Ptr | null {
  let ll = depth(G.u.uz) - depth(where) << 24 >> 24;
  let indun = (G.u.uz.dnum === where.dnum ? 1 : 0) << 24 >> 24;
  if (ll < 0) {
    if (ll < -8 - rn2(3)) {
      if (!indun) {
        return S("far away");
      } else {
        return S("far below");
      }
    } else if (ll < -1) {
      if (!indun) {
        return S("away below you");
      } else {
        return S("below you");
      }
    } else if (!indun) {
      return S("in the distance");
    } else {
      return S("just below");
    }
  } else if (ll > 0) {
    if (ll > 8 + rn2(3)) {
      if (!indun) {
        return S("far away");
      } else {
        return S("far above");
      }
    } else if (ll > 1) {
      if (!indun) {
        return S("away above you");
      } else {
        return S("above you");
      }
    } else if (!indun) {
      return S("in the distance");
    } else {
      return S("just above");
    }
  } else if (!indun) {
    return S("in the distance");
  } else {
    return S("near you");
  }
}

export async function use_crystal_ball(optr: Ptr | null): Promise<void> {
  let ch = 0;
  let oops = 0;
  let obj = optr.a[optr.o];
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    await pline(S("Too bad you can't see %s."), await the(await xname(obj)));
    return;
  }
  oops = rnd(20) > acurr(A_INT) || obj.cursed | 0 ? 1 : 0;
  if (oops && obj.spe > 0) {
    switch (rnd(obj.oartifact ? 4 : 5)) {
    case 1:
      await pline(S("%s too much to comprehend!"), await Tobjnam(obj, S("are")));
      break;
    case 2:
      await pline(S("%s you!"), await Tobjnam(obj, S("confuse")));
      await make_confused((G.u.uprops[CONFUSION].intrinsic & TIMEOUT) + rnd(100), FALSE);
      break;
    case 3:
      if (!resists_blnd(G.youmonst)) {
        await pline(S("%s your vision!"), await Tobjnam(obj, S("damage")));
        await make_blinded((G.u.uprops[BLINDED].intrinsic & TIMEOUT) + rnd(100), FALSE);
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await Your(S("%s"), G.c_common_strings.c_vision_clears);
        }
      } else {
        await pline(S("%s your vision."), await Tobjnam(obj, S("assault")));
        await You(S("are unaffected!"));
      }
      break;
    case 4:
      await pline(S("%s your mind!"), await Tobjnam(obj, S("zap")));
      await make_hallucinated((G.u.uprops[HALLUC].intrinsic & TIMEOUT) + rnd(100), FALSE, 0);
      break;
    case 5:
      await pline(S("%s!"), await Tobjnam(obj, S("explode")));
      await useup(obj);
      optr.a[optr.o] = obj = null;
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(30) + 1) / 2 | 0 : rnd(30), S("exploding crystal ball"), KILLED_BY_AN);
      break;
    }
    if (obj) {
      await consume_obj_charge(obj, TRUE);
    }
    return;
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    if (!obj.spe) {
      await pline(S("All you see is funky %s haze."), hcolor(null));
    } else {
      switch (rnd(6)) {
      case 1:
        await You(S("grok some groovy globs of incandescent lava."));
        break;
      case 2:
        await pline(S("Whoa!  Psychedelic colors, %s!"), poly_gender() === 1 ? S("babe") : S("dude"));
        break;
      case 3:
        await pline_The(S("crystal pulses with sinister %s light!"), hcolor(null));
        break;
      case 4:
        await You_see(S("goldfish swimming above fluorescent rocks."));
        break;
      case 5:
        await You_see(S("tiny snowflakes spinning around a miniature farmhouse."));
        break;
      default:
        await pline(S("Oh wow... like a kaleidoscope!"));
        break;
      }
      await consume_obj_charge(obj, TRUE);
    }
    return;
  }
  if (G.flags.verbose) {
    await You(S("may look for an object or monster symbol."));
  }
  ch = await yn_function(S("What do you look for?"), null, 0);
  if (ch !== G.def_monsyms[S_GHOST].sym && strchr(P(G.quitchars), ch)) {
    if (G.flags.verbose) {
      await pline(S("%s"), G.c_common_strings.c_Never_mind);
    }
    return;
  }
  await You(S("peer into %s..."), await the(await xname(obj)));
  nomul(-rnd(10));
  G.multi_reason = S("gazing into a crystal ball");
  G.nomovemsg = S("");
  if (obj.spe <= 0) {
    await pline_The(S("vision is unclear."));
  } else {
    let class_ = 0;
    let i = 0;
    let ret = 0;
    await discover_object(206, 1, 1);
    await consume_obj_charge(obj, TRUE);
    if (ch === DEF_MIMIC_DEF) {
      ch = DEF_MIMIC;
    }
    if ((class_ = def_char_to_objclass(ch)) !== MAXOCLASSES) {
      ret = await object_detect(null, class_);
    } else if ((class_ = def_char_to_monclass(ch)) !== MAXMCLASSES) {
      ret = await monster_detect(null, class_);
    } else if (G.showsyms[SYM_BOULDER + SYM_OFF_X] && ch === G.showsyms[SYM_BOULDER + SYM_OFF_X]) {
      ret = await object_detect(null, ROCK_CLASS);
    } else {
      switch (ch) {
      case 94:
        ret = await trap_detect(null);
        break;
      default:
        i = rn2(Math.trunc(64 / 16) | 0);
        await You_see(S("%s, %s."), level_detects[i].what, level_distance(level_detects[i].where));
        ret = 0;
        break;
      }
    }
    if (ret) {
      if (!rn2(100)) {
        await You_see(S("the Wizard of Yendor gazing out at you."));
      } else {
        await pline_The(S("vision is unclear."));
      }
    }
  }
  return;
}

async function show_map_spot(x: number, y: number): Promise<void> {
  let lev = null;
  let t = null;
  let oldglyph = 0;
  if (G.u.uprops[CONFUSION].intrinsic && rn2(7)) {
    return;
  }
  lev = $sat(G.level.locations[x], y);
  lev.seenv = SVALL;
  if (lev.typ === SCORR) {
    lev.typ = CORR;
    unblock_point(x, y);
  }
  oldglyph = glyph_at(x, y);
  if (G.level.flags.hero_memory) {
    await magic_map_background(x, y, 0);
    await newsym(x, y);
  } else {
    await magic_map_background(x, y, 1);
  }
  if (!(lev.typ >= STAIRS && lev.typ <= ALTAR)) {
    if (!!(t = t_at(x, y)) && t.tseen | 0) {
      await map_trap(t, 1);
    } else if (oldglyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && oldglyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM || (oldglyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && oldglyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || oldglyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && oldglyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || oldglyph >= 382 + (1 + (382 + (382 + 0))) && oldglyph < 382 + (1 + (382 + (382 + 0))) + 382)) {
      await show_glyph(x, y, oldglyph);
      if (G.level.flags.hero_memory) {
        lev.glyph = oldglyph;
      }
    }
  }
}

export async function do_mapping(): Promise<void> {
  let zx = 0;
  let zy = 0;
  let unconstrained = 0;
  unconstrained = unconstrain_map();
  for (zx = 1; zx < COLNO; ++zx) {
    for (zy = 0; zy < ROWNO; ++zy) {
      await show_map_spot(zx, zy);
    }
  }
  if (!G.level.flags.hero_memory || unconstrained) {
    await flush_screen(1);
    await browse_map(TER_DETECT | TER_MAP | TER_TRP | TER_OBJ, S("anything of interest"));
    await docrt();
  }
  reconstrain_map();
  await exercise(A_WIS, TRUE);
}

export async function do_vicinity_map(sobj: struct_obj | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any;
  let zx = 0;
  let zy = 0;
  let mtmp = null;
  let otmp = null;
  let save_EDetect_mons = 0;
  let save_viz_uyux = 0;
  let unconstrained = 0;
  let refresh = FALSE;
  let mdetected = FALSE;
  let odetected = FALSE;
  let extended = (sobj && (sobj.blessed | 0 || (G.u.uprops[CLAIRVOYANT].intrinsic || G.u.uprops[CLAIRVOYANT].extrinsic) && !G.u.uprops[CLAIRVOYANT].blocked) ? 1 : 0) << 24 >> 24;
  let newglyph = 0;
  let oldglyph = 0;
  let lo_y = G.u.uy - 5 < 0 ? 0 : G.u.uy - 5;
  let hi_y = G.u.uy + 6 >= ROWNO ? ROWNO - 1 : G.u.uy + 6;
  let lo_x = G.u.ux - 9 < 1 ? 1 : G.u.ux - 9;
  let hi_x = G.u.ux + 10 >= COLNO ? COLNO - 1 : G.u.ux + 10;
  let ter_typ = TER_DETECT | TER_MAP | TER_TRP | TER_OBJ;
  save_viz_uyux = $rd(G.viz_array.a[G.viz_array.o + G.u.uy], G.u.ux);
  if (G.u.uswallow) {
    ($t1 = G.viz_array.a[G.viz_array.o + G.u.uy], $t2 = G.u.ux, $t1.a[$t1.o + $t2] = ($t1.a[$t1.o + $t2] | IN_SIGHT) << 24 >> 24);
  }
  save_EDetect_mons = G.u.uprops[DETECT_MONSTERS].extrinsic;
  ($t3 = G.u.uprops[DETECT_MONSTERS], $t3.extrinsic = $t3.extrinsic | I_SPECIAL);
  unconstrained = unconstrain_map();
  for (zx = lo_x; zx <= hi_x; ++zx) {
    for (zy = lo_y; zy <= hi_y; ++zy) {
      oldglyph = glyph_at(zx, zy);
      await show_map_spot(zx, zy);
      if (!!G.level.objects[zx][zy]) {
        otmp = G.level.objects[zx][zy];
        if (extended) {
          otmp.dknown = 1;
        }
        await map_object(otmp, TRUE);
        newglyph = glyph_at(zx, zy);
        if (newglyph !== oldglyph && (is_pool(zx, zy) && !G.u.uinwater || $at2(G.level.locations, zx, zy).typ === LAVAPOOL)) {
          odetected = TRUE;
        }
      }
      if (!!(mtmp = !!G.level.monsters[zx][zy] ? G.level.monsters[zx][zy] : null) && mtmp.mx === zx && mtmp.my === zy) {
        if ((unconstrained || !G.level.flags.hero_memory) && !extended && (zx !== G.u.ux || zy !== G.u.uy) && !(oldglyph >= 0 && oldglyph < 0 + 382 || oldglyph >= 382 + 0 && oldglyph < 382 + 0 + 382 || oldglyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && oldglyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || oldglyph >= 1 + (382 + (382 + 0)) && oldglyph < 1 + (382 + (382 + 0)) + 382)) {
          await map_invisible(zx, zy);
        } else {
          await map_monst(mtmp, FALSE);
        }
        newglyph = glyph_at(zx, zy);
        if (extended && newglyph !== oldglyph && !(newglyph === 382 + (382 + 0))) {
          mdetected = TRUE;
        }
      }
    }
  }
  if (!G.level.flags.hero_memory || unconstrained || mdetected || odetected) {
    await flush_screen(1);
    await You(S("sense your surroundings."));
    if (extended || (glyph_at(G.u.ux, G.u.uy) >= 0 && glyph_at(G.u.ux, G.u.uy) < 0 + 382 || glyph_at(G.u.ux, G.u.uy) >= 382 + 0 && glyph_at(G.u.ux, G.u.uy) < 382 + 0 + 382 || glyph_at(G.u.ux, G.u.uy) >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph_at(G.u.ux, G.u.uy) < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph_at(G.u.ux, G.u.uy) >= 1 + (382 + (382 + 0)) && glyph_at(G.u.ux, G.u.uy) < 1 + (382 + (382 + 0)) + 382)) {
      ter_typ |= TER_MON;
    }
    await browse_map(ter_typ, S("anything of interest"));
    refresh = TRUE;
  }
  reconstrain_map();
  G.u.uprops[DETECT_MONSTERS].extrinsic = save_EDetect_mons;
  $wr(G.viz_array.a[G.viz_array.o + G.u.uy], G.u.ux, save_viz_uyux);
  for (zx = lo_x; zx <= hi_x; ++zx) {
    for (zy = lo_y; zy <= hi_y; ++zy) {
      if (zx === G.u.ux && zy === G.u.uy) {
        continue;
      }
      newglyph = glyph_at(zx, zy);
      if ((newglyph >= 0 && newglyph < 0 + 382 || newglyph >= 382 + 0 && newglyph < 382 + 0 + 382 || newglyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && newglyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || newglyph >= 1 + (382 + (382 + 0)) && newglyph < 1 + (382 + (382 + 0)) + 382) && (newglyph >= 0 && newglyph < 0 + 382 ? newglyph - 0 : newglyph >= 382 + 0 && newglyph < 382 + 0 + 382 ? newglyph - (382 + 0) : newglyph >= 1 + (382 + (382 + 0)) && newglyph < 1 + (382 + (382 + 0)) + 382 ? newglyph - (1 + (382 + (382 + 0))) : newglyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && newglyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 ? newglyph - (382 + (382 + (1 + (382 + (382 + 0))))) : newglyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && newglyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 ? newglyph - (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) !== PM_LONG_WORM_TAIL) {
        if (!(mtmp = !!G.level.monsters[zx][zy] ? G.level.monsters[zx][zy] : null) || !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
          await map_invisible(zx, zy);
        }
      }
    }
  }
  await see_monsters();
  if (refresh) {
    await docrt();
  }
}

export function cvt_sdoor_to_door(lev: struct_rm | null): void {
  let newmask = (lev.flags | 0) & ~WM_MASK;
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
    newmask = D_NODOOR;
  } else if (!(newmask & D_LOCKED)) {
    newmask |= D_CLOSED;
  }
  lev.typ = DOOR;
  lev.flags = (newmask >>> 0) & 31;
}

async function findone(zx: number, zy: number, num: any): Promise<void> {
  let ttmp = null;
  let mtmp = null;
  if ($at2(G.level.locations, zx, zy).typ === SDOOR) {
    cvt_sdoor_to_door($sat(G.level.locations[zx], zy));
    await magic_map_background(zx, zy, 0);
    await newsym(zx, zy);
    ++num.a[num.o];
  } else if ($at2(G.level.locations, zx, zy).typ === SCORR) {
    $at2(G.level.locations, zx, zy).typ = CORR;
    unblock_point(zx, zy);
    await magic_map_background(zx, zy, 0);
    await newsym(zx, zy);
    ++num.a[num.o];
  }
  if (!!(ttmp = t_at(zx, zy)) && !ttmp.tseen && (ttmp.ttyp | 0) !== STATUE_TRAP) {
    ttmp.tseen = 1;
    await newsym(zx, zy);
    ++num.a[num.o];
  }
  if (!!(mtmp = !!G.level.monsters[zx][zy] ? G.level.monsters[zx][zy] : null) && (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) || mtmp.mundetected | 0 || mtmp.m_ap_type & 7)) {
    if (mtmp.m_ap_type & 7) {
      await seemimic(mtmp);
      ++num.a[num.o];
    } else if (mtmp.mundetected | 0 && ((mtmp.data.mflags1 & 256) >>> 0 !== 0 || (mtmp.data.mflags1 & 128) >>> 0 !== 0 || mtmp.data.mlet === S_EEL)) {
      mtmp.mundetected = 0;
      await newsym(zx, zy);
      ++num.a[num.o];
    }
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && !($at2(G.level.locations, zx, zy).glyph === 382 + (382 + 0))) {
      await map_invisible(zx, zy);
    }
  } else if (await unmap_invisible(zx, zy)) {
    ++num.a[num.o];
  }
}

async function openone(zx$: number, zy$: number, num: any): Promise<void> {
  const zx = new Int32Array(1);
  zx[0] = zx$;
  const zy = new Int32Array(1);
  zy[0] = zy$;
  let ttmp = null;
  let otmp = null;
  let num_p = num;
  if (!!G.level.objects[zx[0]][zy[0]]) {
    for (otmp = G.level.objects[zx[0]][zy[0]]; otmp; otmp = otmp.v.v_nexthere) {
      if ((otmp.otyp === 189 || otmp.otyp === 190) && otmp.olocked | 0) {
        otmp.olocked = 0;
        ++num_p.a[num_p.o];
      }
    }
  }
  if ($at2(G.level.locations, zx[0], zy[0]).typ === SDOOR || $at2(G.level.locations, zx[0], zy[0]).typ === DOOR && ($at2(G.level.locations, zx[0], zy[0]).flags | 0) & (D_CLOSED | D_LOCKED)) {
    if ($at2(G.level.locations, zx[0], zy[0]).typ === SDOOR) {
      cvt_sdoor_to_door($sat(G.level.locations[zx[0]], zy[0]));
    }
    if (($at2(G.level.locations, zx[0], zy[0]).flags | 0) & D_TRAPPED) {
      if (dist2(zx[0], zy[0], G.u.ux, G.u.uy) < 3) {
        await b_trapped(S("door"), 0);
      } else {
        await Norep(S("You %s an explosion!"), $rd(G.viz_array.a[G.viz_array.o + zy[0]], zx[0]) & 2 ? S("see") : !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("hear") : S("feel the shock of"));
      }
      wake_nearto(zx[0], zy[0], 11 * 11);
      $at2(G.level.locations, zx[0], zy[0]).flags = (D_NODOOR) & 31;
    } else {
      $at2(G.level.locations, zx[0], zy[0]).flags = (D_ISOPEN) & 31;
    }
    unblock_point(zx[0], zy[0]);
    await newsym(zx[0], zy[0]);
    ++num_p.a[num_p.o];
  } else if ($at2(G.level.locations, zx[0], zy[0]).typ === SCORR) {
    $at2(G.level.locations, zx[0], zy[0]).typ = CORR;
    unblock_point(zx[0], zy[0]);
    await newsym(zx[0], zy[0]);
    ++num_p.a[num_p.o];
  } else if (!!(ttmp = t_at(zx[0], zy[0]))) {
    let mon = null;
    const dummy = new Int8Array(1);
    if (!ttmp.tseen && (ttmp.ttyp | 0) !== STATUE_TRAP) {
      ttmp.tseen = 1;
      await newsym(zx[0], zy[0]);
      ++num_p.a[num_p.o];
    }
    mon = zx[0] === G.u.ux && zy[0] === G.u.uy ? G.youmonst : !!G.level.monsters[zx[0]][zy[0]] ? G.level.monsters[zx[0]][zy[0]] : null;
    if (await openholdingtrap(mon, P(dummy, 0)) || await openfallingtrap(mon, TRUE, P(dummy, 0))) {
      ++num_p.a[num_p.o];
    }
  } else if (find_drawbridge(P(zx, 0), P(zy, 0))) {
    await open_drawbridge(zx[0], zy[0]);
    ++num_p.a[num_p.o];
  }
}

export async function findit(): Promise<number> {
  const num = new Int32Array(1);
  num[0] = 0;
  if (G.u.uswallow) {
    return 0;
  }
  await do_clear_area(G.u.ux, G.u.uy, BOLT_LIM, findone, P(num, 0));
  return num[0];
}

export async function openit(): Promise<number> {
  const num = new Int32Array(1);
  num[0] = 0;
  if (G.u.uswallow) {
    if ((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await pline(S("Its mouth opens!"));
      } else {
        await pline(S("%s opens its mouth!"), await Monnam(G.u.ustuck));
      }
    }
    await expels(G.u.ustuck, G.u.ustuck.data, TRUE);
    return -1;
  }
  await do_clear_area(G.u.ux, G.u.uy, BOLT_LIM, openone, P(num, 0));
  return num[0];
}

export function detecting(func: Function | null): number {
  return (func === findone || func === openone ? 1 : 0) << 24 >> 24;
}

export async function find_trap(trap: struct_trap | null): Promise<void> {
  let tt = G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2(TRAPNUM - 1) + 1 : trap.ttyp | 0;
  let cleared = FALSE;
  trap.tseen = 1;
  await exercise(A_WIS, TRUE);
  await feel_newsym(trap.tx, trap.ty);
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) || $at2(G.level.locations, trap.tx, trap.ty).glyph !== S_arrow_trap + (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(TRAPNUM - 1) + 1 : trap.ttyp | 0) - 1 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
    await cls();
    await map_trap(trap, 1);
    await show_glyph(G.u.ux, G.u.uy, G.u.usteed && ((!G.u.usteed.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.usteed.mundetected) ? (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.u.usteed.data)) + (382 + (382 + (1 + (382 + (382 + 0))))) : (G.youmonst.m_ap_type & 7) === M_AP_NOTHING ? (G.u.umonnum !== G.u.umonster || !G.flags.showrace ? G.u.umonnum : G.flags.female && G.urace.femalenum !== -1 ? G.urace.femalenum : G.urace.malenum) + 0 : (G.youmonst.m_ap_type & 7) === M_AP_FURNITURE ? (G.youmonst.mappearance | 0) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : (G.youmonst.m_ap_type & 7) === M_AP_OBJECT ? (G.youmonst.mappearance | 0) + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : (G.youmonst.mappearance | 0) + 0);
    cleared = TRUE;
  }
  await You(S("find %s."), await an(G.defsyms[S_arrow_trap + tt - 1].explanation));
  if (cleared) {
    await G.windowprocs.win_display_nhwindow(G.WIN_MAP, TRUE);
    await docrt();
  }
}

async function mfind0(mtmp: struct_monst | null, via_warning: number): Promise<number> {
  let x = mtmp.mx;
  let y = mtmp.my;
  let found_something = FALSE;
  if (via_warning && !warning_of(mtmp)) {
    return -1;
  }
  if (mtmp.m_ap_type & 7) {
    await seemimic(mtmp);
    found_something = TRUE;
  } else {
    found_something = (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) ? 1 : 0) << 24 >> 24;
    if (mtmp.mundetected | 0 && ((mtmp.data.mflags1 & 256) >>> 0 !== 0 || (mtmp.data.mflags1 & 128) >>> 0 !== 0 || mtmp.data.mlet === S_EEL)) {
      if (via_warning) {
        await Your(S("warning senses cause you to take a second %s."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("to check nearby") : S("look close by"));
        await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
      }
      mtmp.mundetected = 0;
      found_something = TRUE;
    }
    await newsym(x, y);
  }
  if (found_something) {
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && $at2(G.level.locations, x, y).glyph === 382 + (382 + 0)) {
      return -1;
    }
    await exercise(A_WIS, TRUE);
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await map_invisible(x, y);
      await You_feel(S("an unseen monster!"));
    } else if (!(!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
      await You(S("find %s."), mtmp.mtame ? await y_monnam(mtmp) : await a_monnam(mtmp));
    }
    return 1;
  }
  return 0;
}

export async function dosearch0(aflag: number): Promise<number> {
  let x = 0;
  let y = 0;
  let trap = null;
  let mtmp = null;
  if (G.u.uswallow) {
    if (!aflag) {
      await pline(S("What are you looking for?  The exit?"));
    }
  } else {
    let fund = G.uwep && G.uwep.oartifact && spec_ability(G.uwep, SPFX_SEARCH) ? G.uwep.spe : 0;
    if (G.ublindf && G.ublindf.otyp === LENSES && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      fund += 2;
    }
    if (fund > 5) {
      fund = 5;
    }
    for (x = G.u.ux - 1 << 24 >> 24; x < G.u.ux + 2; x = x + 1 << 24 >> 24) {
      for (y = G.u.uy - 1 << 24 >> 24; y < G.u.uy + 2; y = y + 1 << 24 >> 24) {
        if (!isok(x, y)) {
          continue;
        }
        if (x === G.u.ux && y === G.u.uy) {
          continue;
        }
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !aflag) {
          await feel_location(x, y);
        }
        if ($at2(G.level.locations, x, y).typ === SDOOR) {
          if (rnl(7 - fund)) {
            continue;
          }
          cvt_sdoor_to_door($sat(G.level.locations[x], y));
          await exercise(A_WIS, TRUE);
          nomul(0);
          await feel_location(x, y);
          await You(S("find a hidden door."));
        } else if ($at2(G.level.locations, x, y).typ === SCORR) {
          if (rnl(7 - fund)) {
            continue;
          }
          $at2(G.level.locations, x, y).typ = CORR;
          unblock_point(x, y);
          await exercise(A_WIS, TRUE);
          nomul(0);
          await feel_newsym(x, y);
          await You(S("find a hidden passage."));
        } else {
          if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && !aflag) {
            let mfres = await mfind0(mtmp, 0);
            if (mfres === -1) {
              continue;
            } else if (mfres > 0) {
              return mfres;
            }
          }
          if (!aflag && !mtmp && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await unmap_invisible(x, y);
          }
          if ((trap = t_at(x, y)) && !trap.tseen && !rnl(8)) {
            nomul(0);
            if ((trap.ttyp | 0) === STATUE_TRAP) {
              if (await activate_statue_trap(trap, x, y, FALSE)) {
                await exercise(A_WIS, TRUE);
              }
              return 1;
            } else {
              await find_trap(trap);
            }
          }
        }
      }
    }
  }
  return 1;
}

export async function dosearch(): Promise<number> {
  return await dosearch0(0);
}

export async function warnreveal(): Promise<void> {
  let x = 0;
  let y = 0;
  let mtmp = null;
  for (x = G.u.ux - 1; x <= G.u.ux + 1; ++x) {
    for (y = G.u.uy - 1; y <= G.u.uy + 1; ++y) {
      if (!isok(x, y) || x === G.u.ux && y === G.u.uy) {
        continue;
      }
      if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && warning_of(mtmp) && mtmp.mundetected | 0) {
        await mfind0(mtmp, 1);
      }
    }
  }
}

export async function sokoban_detect(): Promise<void> {
  let x = 0;
  let y = 0;
  let ttmp = null;
  let obj = null;
  for (x = 1; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      $at2(G.level.locations, x, y).seenv = SVALL;
      $at2(G.level.locations, x, y).waslit = (TRUE) & 1;
      await map_background(x, y, 1);
      if (!!(obj = sobj_at(BOULDER, x, y))) {
        await map_object(obj, 1);
      }
    }
  }
  for (ttmp = G.ftrap; ttmp; ttmp = ttmp.ntrap) {
    ttmp.tseen = 1;
    await map_trap(ttmp, 1);
    if ((ttmp.ttyp | 0) === PIT || (ttmp.ttyp | 0) === HOLE) {
      G.level.flags.sokoban_rules = 1;
    }
  }
}

async function reveal_terrain_getglyph(x: number, y: number, full: number, swallowed: number, default_glyph: number, which_subset: number): Promise<number> {
  let glyph = 0;
  let levl_glyph = 0;
  let seenv = 0;
  let keep_traps = ((which_subset & TER_TRP) !== 0 ? 1 : 0) << 24 >> 24;
  let keep_objs = ((which_subset & TER_OBJ) !== 0 ? 1 : 0) << 24 >> 24;
  let keep_mons = ((which_subset & TER_MON) !== 0 ? 1 : 0) << 24 >> 24;
  let mtmp = null;
  let t = null;
  seenv = (full || G.level.flags.hero_memory | 0 ? $at2(G.level.locations, x, y).seenv : $rd(G.viz_array.a[G.viz_array.o + y], x) & 2 ? SVALL : 0) & 0xff;
  if (full) {
    $at2(G.level.locations, x, y).seenv = SVALL;
    glyph = await back_to_glyph(x, y);
    $at2(G.level.locations, x, y).seenv = seenv;
  } else {
    levl_glyph = G.level.flags.hero_memory | 0 ? $at2(G.level.locations, x, y).glyph : seenv ? await back_to_glyph(x, y) : default_glyph;
    glyph = !swallowed ? glyph_at(x, y) : levl_glyph;
    if (keep_mons && x === G.u.ux && y === G.u.uy && swallowed) {
      glyph = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.u.ustuck.data)) + 0;
    } else if ((glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382 || glyph >= (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) && glyph < (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) + 6) && !keep_mons || glyph >= (8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))) && glyph < (8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))) + (382 << 3)) {
      glyph = levl_glyph;
    }
    if (((glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382) && !keep_objs || glyph === 382 + (382 + 0)) && keep_traps && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
      if (!!(t = t_at(x, y)) && t.tseen | 0) {
        glyph = S_arrow_trap + (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(TRAPNUM - 1) + 1 : t.ttyp | 0) - 1 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
      }
    }
    if ((glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382) && !keep_objs || glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM && !keep_traps || glyph === 382 + (382 + 0)) {
      if (!seenv) {
        glyph = default_glyph;
      } else if (G.lastseentyp[x][y] === $at2(G.level.locations, x, y).typ) {
        glyph = await back_to_glyph(x, y);
      } else {
        if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && (mtmp.m_ap_type & 7) === M_AP_FURNITURE) {
          glyph = (mtmp.mappearance | 0) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
        } else {
          let save_typ = $at2(G.level.locations, x, y).typ;
          $at2(G.level.locations, x, y).typ = G.lastseentyp[x][y];
          glyph = await back_to_glyph(x, y);
          $at2(G.level.locations, x, y).typ = save_typ;
        }
      }
    }
  }
  if (glyph === S_darkroom + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
    glyph = S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
  }
  return glyph;
}

export async function dump_map(): Promise<void> {
  let x = 0;
  let y = 0;
  let glyph = 0;
  let skippedrows = 0;
  let lastnonblank = 0;
  let subset = TER_MAP | TER_TRP | TER_OBJ | TER_MON;
  let default_glyph = (G.level.flags.arboreal | 0 ? S_tree : S_stone) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
  let buf = new Int8Array(256);
  let blankrow = 0;
  let toprow = 0;
  skippedrows = 0;
  toprow = TRUE;
  for (y = 0; y < ROWNO; ++y) {
    blankrow = TRUE;
    lastnonblank = -1;
    for (x = 1; x < COLNO; ++x) {
      const ch = new Int32Array(1);
      const color = new Int32Array(1);
      const special = new Uint32Array(1);
      glyph = await reveal_terrain_getglyph(x, y, FALSE, G.u.uswallow, default_glyph, subset);
      mapglyph(glyph, P(ch, 0), P(color, 0), P(special, 0), x, y, 0);
      buf[x - 1] = ch[0] << 24 >> 24;
      if (ch[0] !== 32) {
        blankrow = FALSE;
        lastnonblank = x - 1;
      }
    }
    if (!blankrow) {
      buf[lastnonblank + 1] = 0;
      if (toprow) {
        skippedrows = 0;
        toprow = FALSE;
      }
      for (x = 0; x < skippedrows; ++x) {
        await G.windowprocs.win_putstr(0, 0, S(""));
      }
      await G.windowprocs.win_putstr(0, 0, P(buf));
      skippedrows = 0;
    } else {
      ++skippedrows;
    }
  }
  if (skippedrows) {
    await G.windowprocs.win_putstr(0, 0, S(""));
  }
}

export async function reveal_terrain(full: number, which_subset: number): Promise<void> {
  if ((G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) || G.u.uprops[STUNNED].intrinsic || G.u.uprops[CONFUSION].intrinsic) && !full) {
    await You(S("are too disoriented for this."));
  } else {
    let x = 0;
    let y = 0;
    let glyph = 0;
    let default_glyph = 0;
    let buf = new Int8Array(256);
    let keep_traps = ((which_subset & TER_TRP) !== 0 ? 1 : 0) << 24 >> 24;
    let keep_objs = ((which_subset & TER_OBJ) !== 0 ? 1 : 0) << 24 >> 24;
    let keep_mons = ((which_subset & TER_MON) !== 0 ? 1 : 0) << 24 >> 24;
    let swallowed = G.u.uswallow;
    if (unconstrain_map()) {
      await docrt();
    }
    default_glyph = (G.level.flags.arboreal | 0 ? S_tree : S_stone) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
    for (x = 1; x < COLNO; ++x) {
      for (y = 0; y < ROWNO; ++y) {
        glyph = await reveal_terrain_getglyph(x, y, full, swallowed, default_glyph, which_subset);
        await show_glyph(x, y, glyph);
      }
    }
    await flush_screen(1);
    if (full) {
      strcpy(P(buf), S("underlying terrain"));
    } else {
      strcpy(P(buf), S("known terrain"));
      if (keep_traps) {
        sprintf(eos(P(buf)), S("%s traps"), keep_objs || keep_mons ? S(",") : S(" and"));
      }
      if (keep_objs) {
        sprintf(eos(P(buf)), S("%s%s objects"), keep_traps || keep_mons ? S(",") : S(""), keep_mons ? S("") : S(" and"));
      }
      if (keep_mons) {
        sprintf(eos(P(buf)), S("%s and monsters"), keep_traps || keep_objs ? S(",") : S(""));
      }
    }
    await pline(S("Showing %s only..."), P(buf));
    which_subset |= TER_MAP;
    await browse_map(which_subset, S("anything of interest"));
    reconstrain_map();
    await docrt();
    if (G.u.uinwater) {
      await under_water(2);
    }
    if (G.u.uburied) {
      await under_ground(2);
    }
  }
  return;
}

export function $init(): void {
  level_detects = $sarrOf([anon_detect_c_1084.$of(S("Delphi"), G.dungeon_topology.d_oracle_level),
anon_detect_c_1084.$of(S("Medusa's lair"), G.dungeon_topology.d_medusa_level),
anon_detect_c_1084.$of(S("a castle"), G.dungeon_topology.d_stronghold_level),
anon_detect_c_1084.$of(S("the Wizard of Yendor's tower"), G.dungeon_topology.d_wiz1_level)]);
}
