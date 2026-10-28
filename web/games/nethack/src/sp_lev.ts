// @ts-nocheck
// NetHack 3.6.7 sp_lev.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { isok } from './cmd.ts';
import { create_drawbridge, is_lava, is_pool } from './dbridge.ts';
import { sokoban_detect } from './detect.ts';
import { bury_an_obj } from './dig.ts';
import { dlb_fclose, dlb_fopen, dlb_fread } from './dlb.ts';
import { christen_monst, oname } from './do_name.ts';
import { def_char_to_monclass, def_char_to_objclass } from './drawing.ts';
import { Can_dig_down, Can_fall_thru, In_mines, depth, induced_align, on_level } from './dungeon.ts';
import { panic } from './end.ts';
import { del_engr_at, make_engr_at, make_grave } from './engrave.ts';
import { makeroguerooms } from './extralev.ts';
import { debugcore } from './files.ts';
import { in_rooms } from './hack.ts';
import { dist2, isqrt, strncmpi } from './hacklib.ts';
import { sobj_at, stackobj } from './invent.ts';
import { del_light_source, new_light_source } from './light.ts';
import { makemon, mkclass, propagate, rndmonst, set_malign, set_mimic_sym } from './makemon.ts';
import { add_door, add_room, add_subroom, makecorridors, mineralize, mkstairs, mktrap, okdoor, topologize } from './mklev.ts';
import { flood_fill_rm, mkmap, remove_rooms } from './mkmap.ts';
import { fixup_special, walkfrom, wallification } from './mkmaze.ts';
import { add_to_container, bless, curse, discard_minvent, mkgold, mkobj_at, mksobj_at, obj_extract_self, remove_object, rndmonnum, set_corpsenm, unbless, uncurse, weight } from './mkobj.ts';
import { fill_zoo, inside_room, somexy } from './mkroom.ts';
import { mgender_from_permonst, mongone, select_newcham_form, validvamp } from './mon.ts';
import { monsndx, name_to_mon, set_mon_data } from './mondata.ts';
import { mk_mplayer } from './mplayer.ts';
import { nh_getenv } from './options.ts';
import { impossible, pline } from './pline.ts';
import { mk_roamer, priestini } from './priest.ts';
import { get_rect, rnd_rect, split_rects } from './rect.ts';
import { d, rn2, rnd } from './rnd.ts';
import { delete_contents, obfree } from './shk.ts';
import { stock_room } from './shknam.ts';
import { mpickobj } from './steal.ts';
import { place_monster } from './steed.ts';
import { enexto } from './teleport.ts';
import { begin_burn } from './timeout.ts';
import { deltrap, maketrap, t_at } from './trap.ts';
import { check_version } from './version.ts';
import { block_point, does_block } from './vision.ts';
import { m_dowear } from './worn.ts';
import { struct__opcode, struct__room, struct_altar, struct_corridor, struct_dlb_handle, struct_lev_init, struct_lev_region, struct_mazepart, struct_mkroom, struct_monst, struct_monster, struct_nhcoord, struct_nhrect, struct_object, struct_opvar, struct_permonst, struct_region, struct_replaceterrain, struct_room_door, struct_sp_coder, struct_sp_frame, struct_sp_lev, struct_splev_var, struct_splevstack, struct_spltrap, struct_terrain, struct_unpacked_coord, struct_version_info } from './structs.ts';
import { $arr, $at2, $cs, $rd, $sadd, $sarr, $sat, $shr64, $ta, $u64, $wr, G, P, S, free, memcpy, memset, sprintf, strcmp, strlen } from './rt/index.ts';
import { AIR, ALTAR, AM_CHAOTIC, AM_LAWFUL, AM_NEUTRAL, AM_SHRINE, AM_SPLEV_CO, AM_SPLEV_NONCO, ANTHOLE, ANY_LOC, ARBOREAL, BARRACKS, BEEHIVE, BOULDER, CHECK_INACCESSIBLES, CLOUD, COCKNEST, COIN_CLASS, COLNO, CORR, CORRMAZE, COURT, CROSSWALL, DBWALL, DOOR, DOORMAX, DRY, DWARVISH_MATTOCK, D_CLOSED, D_ISOPEN, D_LOCKED, D_NODOOR, D_SECRET, D_TRAPPED, FALSE, FOUNTAIN, GEM_CLASS, GRAVE, GRAVEYARD, G_EXTINCT, G_GONE, G_NOGEN, G_UNIQ, HARDFLOOR, HOLE, HOT, HWALL, ICE, ICEDPOOLS, ICED_MOAT, ICED_POOL, IRONBARS, LADDER, LAVAPOOL, LA_DOWN, LA_UP, LEPREHALL, LEVEL_TELEP, LOW_PM, LS_MONSTER, LVLINIT_MAZEGRID, LVLINIT_MINES, LVLINIT_NONE, LVLINIT_ROGUE, LVLINIT_SOLIDFILL, MAGIC_PORTAL, MAXMCLASSES, MAXNROFROOMS, MAXOCLASSES, MAXPCHARS, MAXRTYPE, MAX_CONTAINMENT, MAX_NESTED_ROOMS, MAX_REGISTERS, MAX_SP_OPCODES, MAX_TYPE, MAZELEVEL, MINES_PRIZE, MM_NOCOUNTBIRTH, MORGUE, M_AP_FURNITURE, M_AP_MONSTER, M_AP_NOTHING, M_AP_OBJECT, NOMMAP, NON_PM, NOTELEPORT, NO_LOC_WARN, NO_MM_FLAGS, NO_TRAP, NUMMONS, NUM_OBJECTS, OROOM, PICK_AXE, PIT, PM_ARCHEOLOGIST, PM_MINOTAUR, PM_WIZARD, PM_WIZARD_OF_YENDOR, POOL, PREMAPPED, PROT_FROM_SHAPE_CHANGERS, RANDOM_CLASS, RIN_TELEPORTATION, ROCKTRAP, ROLLING_BOULDER_TRAP, ROOM, ROOMOFFSET, ROWNO, SCORR, SCR_TELEPORTATION, SDOOR, SHOPBASE, SHORTSIGHTED, SHROUD, SINK, SOKO_PRIZE1, SOKO_PRIZE2, SOLID, SOLIDIFY, SPACELOC, SPCODER_MAX_RUNTIME, SPIKED_PIT, SPLEV_STACK_RESERVE, SPOVAR_ARRAY, SPOVAR_COORD, SPOVAR_INT, SPOVAR_MONST, SPOVAR_SEL, SPOVAR_STRING, SPOVAR_VARIABLE, SPO_ALTAR, SPO_CALL, SPO_CMP, SPO_COPY, SPO_CORRIDOR, SPO_DEC, SPO_DICE, SPO_DOOR, SPO_DRAWBRIDGE, SPO_ENDROOM, SPO_END_MONINVENT, SPO_ENGRAVING, SPO_EXIT, SPO_FOUNTAIN, SPO_FRAME_POP, SPO_FRAME_PUSH, SPO_GOLD, SPO_GRAVE, SPO_INC, SPO_INITLEVEL, SPO_JE, SPO_JG, SPO_JGE, SPO_JL, SPO_JLE, SPO_JMP, SPO_JNE, SPO_LADDER, SPO_LEVEL_FLAGS, SPO_LEVREGION, SPO_MAP, SPO_MATH_ADD, SPO_MATH_DIV, SPO_MATH_MOD, SPO_MATH_MUL, SPO_MATH_SIGN, SPO_MATH_SUB, SPO_MAZEWALK, SPO_MESSAGE, SPO_MINERALIZE, SPO_MONSTER, SPO_NON_DIGGABLE, SPO_NON_PASSWALL, SPO_NULL, SPO_OBJECT, SPO_POOL, SPO_POP, SPO_POP_CONTAINER, SPO_PUSH, SPO_REGION, SPO_REPLACETERRAIN, SPO_RETURN, SPO_RN2, SPO_ROOM, SPO_ROOM_DOOR, SPO_SEL_ADD, SPO_SEL_COMPLEMENT, SPO_SEL_ELLIPSE, SPO_SEL_FILLRECT, SPO_SEL_FILTER, SPO_SEL_FLOOD, SPO_SEL_GRADIENT, SPO_SEL_GROW, SPO_SEL_LINE, SPO_SEL_POINT, SPO_SEL_RECT, SPO_SEL_RNDCOORD, SPO_SEL_RNDLINE, SPO_SHUFFLE_ARRAY, SPO_SINK, SPO_STAIR, SPO_SUBROOM, SPO_TERRAIN, SPO_TRAP, SPO_VAR_INIT, SPO_WALLIFY, SP_COORD_IS_RANDOM, SP_CPUFLAG_EQ, SP_CPUFLAG_GT, SP_CPUFLAG_LT, SP_M_V_ALIGN, SP_M_V_APPEAR, SP_M_V_ASLEEP, SP_M_V_AVENGE, SP_M_V_BLINDED, SP_M_V_CANCELLED, SP_M_V_CONFUSED, SP_M_V_END, SP_M_V_FEMALE, SP_M_V_FLEEING, SP_M_V_INVIS, SP_M_V_NAME, SP_M_V_PARALYZED, SP_M_V_PEACEFUL, SP_M_V_REVIVED, SP_M_V_SEENTRAPS, SP_M_V_STUNNED, SP_OBJ_CONTAINER, SP_OBJ_CONTENT, SP_O_V_BROKEN, SP_O_V_BURIED, SP_O_V_COORD, SP_O_V_CORPSENM, SP_O_V_CURSE, SP_O_V_END, SP_O_V_ERODED, SP_O_V_GREASED, SP_O_V_INVIS, SP_O_V_LIT, SP_O_V_LOCKED, SP_O_V_NAME, SP_O_V_QUAN, SP_O_V_RECHARGED, SP_O_V_SPE, SP_O_V_TRAPPED, STAIRS, STATUE, STONE, STRANGE_OBJECT, SWAMP, S_EEL, S_EYE, S_GHOST, S_HUMAN, S_LIGHT, S_MIMIC, TELEP_TRAP, TEMPLE, TRAPDOOR, TRAPNUM, TREE, TRUE, VAULT, VIBRATING_SQUARE, VWALL, WAN_DIGGING, WAN_TELEPORTATION, WET, W_EAST, W_NONDIGGABLE, W_NONPASSWALL, W_NORTH, W_SOUTH, W_WEST, XLIM, YLIM, ZOO } from './consts.ts';

let SpLev_Map: any;
let ralign: any;
let xstart: number;
let ystart: number;
let xsize: number;
let ysize: number;
let splev_init_present: number;
let icedpools: number;
let mines_prize_count: number;
let soko_prize_count: number;
let container_obj: any;
let container_idx: number;
let invent_carrying_monster: struct_monst | null;
let selection_flood_check_func: Function | null;
let floodfillchk_match_under_typ: number;
let opvar_var_conversion$nhFunc: any;
let splev_stack_getdat$nhFunc: any;
let splev_stack_getdat_any$nhFunc: any;
let variable_list_del$nhFunc: any;
let get_unpacked_coord$c: struct_unpacked_coord;
let create_object$prize_warning: any;
let sp_level_free$nhFunc: any;
let spo_call$nhFunc: any;
let spo_return$nhFunc: any;
let spo_message$nhFunc: any;
let spo_monster$nhFunc: any;
let spo_object$nhFunc: any;
let spo_level_flags$nhFunc: any;
let spo_initlevel$nhFunc: any;
let spo_engraving$nhFunc: any;
let spo_mineralize$nhFunc: any;
let spo_room$nhFunc: any;
let spo_stair$nhFunc: any;
let spo_ladder$nhFunc: any;
let spo_grave$nhFunc: any;
let spo_altar$nhFunc: any;
let spo_trap$nhFunc: any;
let spo_gold$nhFunc: any;
let spo_corridor$nhFunc: any;
let selection_floodfill$nhFunc: any;
let selection_floodfill$floodfill_stack_overrun: any;
let spo_door$nhFunc: any;
let spo_feature$nhFunc: any;
let spo_terrain$nhFunc: any;
let spo_replace_terrain$nhFunc: any;
let generate_way_out_method$nhFunc: any;
let ensure_way_out$nhFunc: any;
let spo_levregion$nhFunc: any;
let spo_region$nhFunc: any;
let spo_drawbridge$nhFunc: any;
let spo_mazewalk$nhFunc: any;
let spo_wall_property$nhFunc: any;
let spo_room_door$nhFunc: any;
let spo_wallify$nhFunc: any;
let spo_map$nhFunc: any;
let spo_jmp$nhFunc: any;
let spo_conditional_jump$nhFunc: any;
let spo_var_init$nhFunc: any;
let spo_shuffle_array$nhFunc: any;
let sp_level_coder$nhFunc: any;

export function solidify_map(): void {
  let $t1: any;
  let x = 0;
  let y = 0;
  for (x = 0; x < COLNO; x = x + 1 << 24 >> 24) {
    for (y = 0; y < ROWNO; y = y + 1 << 24 >> 24) {
      if ($at2(G.level.locations, x, y).typ <= DBWALL && !SpLev_Map[x][y]) {
        ($t1 = $at2(G.level.locations, x, y), $t1.flags = (($t1.flags | 0 | (W_NONDIGGABLE | W_NONPASSWALL)) >>> 0) & 31);
      }
    }
  }
}

export async function splev_stack_init(st: struct_splevstack | null): Promise<void> {
  if (st) {
    st.depth = 0;
    st.depth_alloc = SPLEV_STACK_RESERVE;
    st.stackdata = P(new Array(($u64(st.depth_alloc) * 8 >>> 0) / 8).fill(null));
  }
}

export function splev_stack_done(st: struct_splevstack | null): void {
  if (st) {
    let i = 0;
    if (st.stackdata && st.depth) {
      for (i = 0; i < st.depth; ++i) {
        switch (st.stackdata.a[st.stackdata.o + i].spovartyp) {
        default:
        case 0:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 1:
          break;
        case 3:
        case 2:
        case 9:
          if (st.stackdata.a[st.stackdata.o + i].vardata.str) {
            free(st.stackdata.a[st.stackdata.o + i].vardata.str);
          }
          st.stackdata.a[st.stackdata.o + i].vardata.str = null;
          break;
        }
        if (st.stackdata.a[st.stackdata.o + i]) {
          free(st.stackdata.a[st.stackdata.o + i]);
        }
        st.stackdata.a[st.stackdata.o + i] = null;
      }
    }
    if (st.stackdata) {
      free(st.stackdata);
    }
    st.stackdata = null;
    st.depth = st.depth_alloc = 0;
    if (st) {
      free(st);
    }
  }
}

export async function splev_stack_push(st: struct_splevstack | null, v: struct_opvar | null): Promise<void> {
  if (!st || !v) {
    return;
  }
  if (!st.stackdata) {
    await panic(S("splev_stack_push: no stackdata allocated?"));
  }
  if (st.depth >= st.depth_alloc) {
    let tmp = P(new Array(($u64(st.depth_alloc + SPLEV_STACK_RESERVE) * 8 >>> 0) / 8).fill(null));
    memcpy(tmp, st.stackdata, $u64(st.depth_alloc) * 8);
    if (st.stackdata) {
      free(st.stackdata);
    }
    st.stackdata = tmp;
    st.depth_alloc += SPLEV_STACK_RESERVE;
  }
  st.stackdata.a[st.stackdata.o + st.depth] = v;
  ++st.depth;
}

export async function splev_stack_pop(st: struct_splevstack | null): Promise<struct_opvar | null> {
  let ret = null;
  if (!st) {
    return ret;
  }
  if (!st.stackdata) {
    await panic(S("splev_stack_pop: no stackdata allocated?"));
  }
  if (st.depth) {
    --st.depth;
    ret = st.stackdata.a[st.stackdata.o + st.depth];
    st.stackdata.a[st.stackdata.o + st.depth] = null;
    return ret;
  } else {
    await impossible(S("splev_stack_pop: empty stack?"));
  }
  return ret;
}

export async function splev_stack_reverse(st: struct_splevstack | null): Promise<struct_splevstack | null> {
  let i = 0;
  let tmp = null;
  if (!st) {
    return null;
  }
  if (!st.stackdata) {
    await panic(S("splev_stack_reverse: no stackdata allocated?"));
  }
  for (i = 0; i < Math.trunc(st.depth / 2); ++i) {
    tmp = st.stackdata.a[st.stackdata.o + i];
    st.stackdata.a[st.stackdata.o + i] = st.stackdata.a[st.stackdata.o + (st.depth - i - 1)];
    st.stackdata.a[st.stackdata.o + (st.depth - i - 1)] = tmp;
  }
  return st;
}

export async function opvar_new_str(s: Ptr | null): Promise<struct_opvar | null> {
  let tmpov = new struct_opvar();
  tmpov.spovartyp = SPOVAR_STRING;
  if (s) {
    let len = strlen(s) | 0;
    tmpov.vardata.str = P(new Int8Array((len + 1 >>> 0)));
    memcpy(tmpov.vardata.str, s, $u64(len));
    tmpov.vardata.str.a[tmpov.vardata.str.o + len] = 0;
  } else {
    tmpov.vardata.str = null;
  }
  return tmpov;
}

export async function opvar_new_int(i: number): Promise<struct_opvar | null> {
  let tmpov = new struct_opvar();
  tmpov.spovartyp = SPOVAR_INT;
  tmpov.vardata.l = i;
  return tmpov;
}

export async function opvar_new_coord(x: number, y: number): Promise<struct_opvar | null> {
  let tmpov = new struct_opvar();
  tmpov.spovartyp = SPOVAR_COORD;
  tmpov.vardata.l = (x & 255) + ((y & 255) << 16);
  return tmpov;
}

export async function opvar_free_x(ov: struct_opvar | null): Promise<void> {
  if (!ov) {
    return;
  }
  switch (ov.spovartyp) {
  case 4:
  case 5:
  case 6:
  case 7:
  case 8:
  case 1:
    break;
  case 3:
  case 2:
  case 9:
    if (ov.vardata.str) {
      free(ov.vardata.str);
    }
    break;
  default:
    await impossible(S("Unknown opvar value type (%i)!"), ov.spovartyp);
  }
  if (ov) {
    free(ov);
  }
}

export async function opvar_clone(ov: struct_opvar | null): Promise<struct_opvar | null> {
  let tmpov = null;
  if (!ov) {
    await panic(S("no opvar to clone"));
  }
  tmpov = new struct_opvar();
  tmpov.spovartyp = ov.spovartyp;
  switch (ov.spovartyp) {
  case 4:
  case 5:
  case 6:
  case 7:
  case 8:
  case 1:
    tmpov.vardata.l = ov.vardata.l;
    break;
  case 3:
  case 2:
  case 9:
    tmpov.vardata.str = await dupstr(ov.vardata.str);
    break;
  default:
    await impossible(S("Unknown push value type (%i)!"), ov.spovartyp);
  }
  return tmpov;
}

export async function opvar_var_conversion(coder: struct_sp_coder | null, ov: struct_opvar | null): Promise<struct_opvar | null> {
  let tmp = null;
  let tmpov = null;
  let array_idx = null;
  if (!coder || !ov) {
    return null;
  }
  if (ov.spovartyp !== SPOVAR_VARIABLE) {
    return ov;
  }
  tmp = coder.frame.variables;
  while (tmp) {
    if (!strcmp(tmp.name, ov.vardata.str)) {
      if (tmp.svtyp & SPOVAR_ARRAY) {
        array_idx = await opvar_var_conversion(coder, await splev_stack_pop(coder.stack));
        if (!array_idx || array_idx.spovartyp !== SPOVAR_INT) {
          await panic(S("array idx not an int"));
        }
        if (tmp.array_len < 1) {
          await panic(S("array len < 1"));
        }
        array_idx.vardata.l = array_idx.vardata.l % tmp.array_len;
        tmpov = await opvar_clone(tmp.data.arrayvalues.a[tmp.data.arrayvalues.o + array_idx.vardata.l]);
        do {
          if (array_idx) {
            await opvar_free_x(array_idx);
            array_idx = null;
          } else {
            await impossible(S("opvar_free(), %s"), P(opvar_var_conversion$nhFunc));
          }
        } while (0);
        return tmpov;
      } else {
        tmpov = await opvar_clone(tmp.data.value);
        return tmpov;
      }
    }
    tmp = tmp.next;
  }
  return null;
}

export function opvar_var_defined(coder: struct_sp_coder | null, name: Ptr | null): struct_splev_var | null {
  let tmp = null;
  if (!coder) {
    return null;
  }
  tmp = coder.frame.variables;
  while (tmp) {
    if (!strcmp(tmp.name, name)) {
      return tmp;
    }
    tmp = tmp.next;
  }
  return null;
}

export async function splev_stack_getdat(coder: struct_sp_coder | null, typ: number): Promise<struct_opvar | null> {
  if (coder && coder.stack) {
    let tmp = await splev_stack_pop(coder.stack);
    let ret = null;
    if (!tmp) {
      await panic(S("no value type %i in stack."), typ);
    }
    if (tmp.spovartyp === SPOVAR_VARIABLE) {
      ret = await opvar_var_conversion(coder, tmp);
      do {
        if (tmp) {
          await opvar_free_x(tmp);
          tmp = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(splev_stack_getdat$nhFunc));
        }
      } while (0);
      tmp = ret;
    }
    if (tmp.spovartyp === typ) {
      return tmp;
    } else {
      do {
        if (tmp) {
          await opvar_free_x(tmp);
          tmp = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(splev_stack_getdat$nhFunc));
        }
      } while (0);
    }
  }
  return null;
}

export async function splev_stack_getdat_any(coder: struct_sp_coder | null): Promise<struct_opvar | null> {
  if (coder && coder.stack) {
    let tmp = await splev_stack_pop(coder.stack);
    if (tmp && tmp.spovartyp === SPOVAR_VARIABLE) {
      let ret = await opvar_var_conversion(coder, tmp);
      do {
        if (tmp) {
          await opvar_free_x(tmp);
          tmp = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(splev_stack_getdat_any$nhFunc));
        }
      } while (0);
      return ret;
    }
    return tmp;
  }
  return null;
}

export async function variable_list_del(varlist: struct_splev_var | null): Promise<void> {
  let tmp = varlist;
  if (!tmp) {
    return;
  }
  while (tmp) {
    if (tmp.name) {
      free(tmp.name);
    }
    if (tmp.svtyp & SPOVAR_ARRAY) {
      let idx = tmp.array_len;
      while (idx-- > 0) {
        do {
          if (tmp.data.arrayvalues.a[tmp.data.arrayvalues.o + idx]) {
            await opvar_free_x(tmp.data.arrayvalues.a[tmp.data.arrayvalues.o + idx]);
            tmp.data.arrayvalues.a[tmp.data.arrayvalues.o + idx] = null;
          } else {
            await impossible(S("opvar_free(), %s"), P(variable_list_del$nhFunc));
          }
        } while (0);
      }
      ;
      if (tmp.data.arrayvalues) {
        free(tmp.data.arrayvalues);
      }
    } else {
      do {
        if (tmp.data.value) {
          await opvar_free_x(tmp.data.value);
          tmp.data.value = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(variable_list_del$nhFunc));
        }
      } while (0);
    }
    tmp = varlist.next;
    if (varlist) {
      free(varlist);
    }
    varlist = tmp;
  }
}

export function lvlfill_maze_grid(x1: number, y1: number, x2: number, y2: number, filling: number): void {
  let x = 0;
  let y = 0;
  for (x = x1; x <= x2; ++x) {
    for (y = y1; y <= y2; ++y) {
      if (G.level.flags.corrmaze) {
        $at2(G.level.locations, x, y).typ = STONE;
      } else {
        $at2(G.level.locations, x, y).typ = (y < 2 || x % 2 && y % 2 ? STONE : filling) << 24 >> 24;
      }
    }
  }
}

export function lvlfill_solid(filling: number, lit: number): void {
  let x = 0;
  let y = 0;
  for (x = 2; x <= G.x_maze_max; ++x) {
    for (y = 0; y <= G.y_maze_max; ++y) {
      {
        if (x >= 0 && y >= 0 && x < 80 && y < 21) {
          if (filling < MAX_TYPE) {
            $at2(G.level.locations, x, y).typ = filling;
          }
          if (filling === LAVAPOOL) {
            $at2(G.level.locations, x, y).lit = 1;
          } else if (lit !== -2) {
            if (lit === -1) {
              $at2(G.level.locations, x, y).lit = (rn2(2) >>> 0) & 1;
            } else {
              $at2(G.level.locations, x, y).lit = (lit >>> 0) & 1;
            }
          }
        }
      }
      ;
    }
  }
}

function set_wall_property(x1: number, y1: number, x2: number, y2: number, prop: number): void {
  let x = 0;
  let y = 0;
  let lev = null;
  x1 = (x1 > 1 ? x1 : 1) << 24 >> 24;
  x2 = (x2 < 80 - 1 ? x2 : 80 - 1) << 24 >> 24;
  y1 = (y1 > 0 ? y1 : 0) << 24 >> 24;
  y2 = (y2 < 21 - 1 ? y2 : 21 - 1) << 24 >> 24;
  for (y = y1; y <= y2; y = y + 1 << 24 >> 24) {
    for (x = x1; x <= x2; x = x + 1 << 24 >> 24) {
      lev = $sat(G.level.locations[x], y);
      if (lev.typ <= DBWALL || (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE) || lev.typ === IRONBARS) {
        lev.flags = ((lev.flags | 0 | prop) >>> 0) & 31;
      }
    }
  }
}

function shuffle_alignments(): void {
  let i = 0;
  let atmp = 0;
  i = rn2(3);
  atmp = ralign[2];
  ralign[2] = ralign[i];
  ralign[i] = atmp;
  if (rn2(2)) {
    atmp = ralign[1];
    ralign[1] = ralign[0];
    ralign[0] = atmp;
  }
}

function count_features(): void {
  let x = 0;
  let y = 0;
  G.level.flags.nfountains = G.level.flags.nsinks = 0;
  for (y = 0; y < ROWNO; y = y + 1 << 24 >> 24) {
    for (x = 0; x < COLNO; x = x + 1 << 24 >> 24) {
      let typ = $at2(G.level.locations, x, y).typ;
      if (typ === FOUNTAIN) {
        G.level.flags.nfountains = G.level.flags.nfountains + 1 & 0xff;
      } else if (typ === SINK) {
        G.level.flags.nsinks = G.level.flags.nsinks + 1 & 0xff;
      }
    }
  }
}

export function remove_boundary_syms(): void {
  let x = 0;
  let y = 0;
  let has_bounds = FALSE;
  for (x = 0; x < COLNO - 1; x = x + 1 << 24 >> 24) {
    for (y = 0; y < ROWNO - 1; y = y + 1 << 24 >> 24) {
      if ($at2(G.level.locations, x, y).typ === CROSSWALL) {
        has_bounds = TRUE;
        break;
      }
    }
  }
  if (has_bounds) {
    for (x = 0; x < G.x_maze_max; x = x + 1 << 24 >> 24) {
      for (y = 0; y < G.y_maze_max; y = y + 1 << 24 >> 24) {
        if ($at2(G.level.locations, x, y).typ === CROSSWALL && SpLev_Map[x][y]) {
          $at2(G.level.locations, x, y).typ = ROOM;
        }
      }
    }
  }
}

function set_door_orientation(x: number, y: number): void {
  let wleft = 0;
  let wright = 0;
  let wup = 0;
  let wdown = 0;
  wleft = (isok(x - 1, y) && ($at2(G.level.locations, x - 1, y).typ && $at2(G.level.locations, x - 1, y).typ <= DBWALL || $at2(G.level.locations, x - 1, y).typ === DOOR || $at2(G.level.locations, x - 1, y).typ === SDOOR) ? 1 : 0) << 24 >> 24;
  wright = (isok(x + 1, y) && ($at2(G.level.locations, x + 1, y).typ && $at2(G.level.locations, x + 1, y).typ <= DBWALL || $at2(G.level.locations, x + 1, y).typ === DOOR || $at2(G.level.locations, x + 1, y).typ === SDOOR) ? 1 : 0) << 24 >> 24;
  wup = (isok(x, y - 1) && ($at2(G.level.locations, x, y - 1).typ && $at2(G.level.locations, x, y - 1).typ <= DBWALL || $at2(G.level.locations, x, y - 1).typ === DOOR || $at2(G.level.locations, x, y - 1).typ === SDOOR) ? 1 : 0) << 24 >> 24;
  wdown = (isok(x, y + 1) && ($at2(G.level.locations, x, y + 1).typ && $at2(G.level.locations, x, y + 1).typ <= DBWALL || $at2(G.level.locations, x, y + 1).typ === DOOR || $at2(G.level.locations, x, y + 1).typ === SDOOR) ? 1 : 0) << 24 >> 24;
  if (!wleft && !wright && !wup && !wdown) {
    wleft = (!isok(x - 1, y) || ($at2(G.level.locations, x - 1, y).typ < POOL || $at2(G.level.locations, x - 1, y).typ === IRONBARS) ? 1 : 0) << 24 >> 24;
    wright = (!isok(x + 1, y) || ($at2(G.level.locations, x + 1, y).typ < POOL || $at2(G.level.locations, x + 1, y).typ === IRONBARS) ? 1 : 0) << 24 >> 24;
    wup = (!isok(x, y - 1) || ($at2(G.level.locations, x, y - 1).typ < POOL || $at2(G.level.locations, x, y - 1).typ === IRONBARS) ? 1 : 0) << 24 >> 24;
    wdown = (!isok(x, y + 1) || ($at2(G.level.locations, x, y + 1).typ < POOL || $at2(G.level.locations, x, y + 1).typ === IRONBARS) ? 1 : 0) << 24 >> 24;
  }
  $at2(G.level.locations, x, y).horizontal = (((wleft || wright) && !(wup && wdown) ? 1 : 0) >>> 0) & 1;
}

function maybe_add_door(x: number, y: number, droom: struct_mkroom | null): void {
  if (droom.hx >= 0 && G.doorindex < DOORMAX && inside_room(droom, x, y)) {
    add_door(x, y, droom);
  }
}

function link_doors_rooms(): void {
  let x = 0;
  let y = 0;
  let tmpi = 0;
  let m = 0;
  for (y = 0; y < ROWNO; ++y) {
    for (x = 0; x < COLNO; ++x) {
      if ($at2(G.level.locations, x, y).typ === DOOR || $at2(G.level.locations, x, y).typ === SDOOR) {
        set_door_orientation(x, y);
        for (tmpi = 0; tmpi < G.nroom; ++tmpi) {
          maybe_add_door(x, y, $sat(G.rooms, tmpi));
          for (m = 0; m < G.rooms[tmpi].nsubrooms; ++m) {
            maybe_add_door(x, y, G.rooms[tmpi].sbrooms[m]);
          }
        }
      }
    }
  }
}

export async function fill_rooms(): Promise<void> {
  let tmpi = 0;
  let m = 0;
  for (tmpi = 0; tmpi < G.nroom; ++tmpi) {
    if (G.rooms[tmpi].needfill) {
      await fill_room($sat(G.rooms, tmpi), G.rooms[tmpi].needfill === 2 ? 1 : 0);
    }
    for (m = 0; m < G.rooms[tmpi].nsubrooms; ++m) {
      if (G.rooms[tmpi].sbrooms[m].needfill) {
        await fill_room(G.rooms[tmpi].sbrooms[m], FALSE);
      }
    }
  }
}

function rnddoor(): number {
  let i = 1 << rn2(5);
  i = i >> 1;
  return i;
}

function rndtrap(): number {
  let rtrap = 0;
  do {
    rtrap = rnd(TRAPNUM - 1);
    switch (rtrap) {
    case HOLE:
    case VIBRATING_SQUARE:
    case MAGIC_PORTAL:
      rtrap = NO_TRAP;
      break;
    case TRAPDOOR:
      if (!Can_dig_down(G.u.uz)) {
        rtrap = NO_TRAP;
      }
      break;
    case LEVEL_TELEP:
    case TELEP_TRAP:
      if (G.level.flags.noteleport) {
        rtrap = NO_TRAP;
      }
      break;
    case ROLLING_BOULDER_TRAP:
    case ROCKTRAP:
      if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
        rtrap = NO_TRAP;
      }
      break;
    }
  } while (rtrap === NO_TRAP);
  return rtrap;
}

async function get_location(x: Ptr | null, y: Ptr | null, humidity: number, croom: struct_mkroom | null): Promise<void> {
  let $g = 0;
  let cpt = 0;
  let mx = 0;
  let my = 0;
  let sx = 0;
  let sy = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      cpt = 0;
      if (croom) {
        mx = croom.lx;
        my = croom.ly;
        sx = croom.hx - mx + 1;
        sy = croom.hy - my + 1;
      } else {
        mx = xstart;
        my = ystart;
        sx = xsize;
        sy = ysize;
      }
      if (x.a[x.o] >= 0) {
        x.a[x.o] = x.a[x.o] + mx << 24 >> 24;
        y.a[y.o] = y.a[y.o] + my << 24 >> 24;
      } else {
        do {
          if (croom) {
            let tmpc = new struct_nhcoord();
            somexy(croom, tmpc);
            x.a[x.o] = tmpc.x;
            y.a[y.o] = tmpc.y;
          } else {
            x.a[x.o] = mx + rn2(sx) << 24 >> 24;
            y.a[y.o] = my + rn2(sy) << 24 >> 24;
          }
          if (is_ok_location(x.a[x.o], y.a[y.o], humidity)) {
            break;
          }
        } while (++cpt < 100);
        if (cpt >= 100) {
          let xx = 0;
          let yy = 0;
          for (xx = 0; xx < sx; ++xx) {
            for (yy = 0; yy < sy; ++yy) {
              x.a[x.o] = mx + xx << 24 >> 24;
              y.a[y.o] = my + yy << 24 >> 24;
              if (is_ok_location(x.a[x.o], y.a[y.o], humidity)) {
                { $g = 1; continue $L; }
              }
            }
          }
          if (!(humidity & NO_LOC_WARN)) {
            await impossible(S("get_location:  can't find a place!"));
          } else {
            x.a[x.o] = y.a[y.o] = -1;
          }
        }
      }
    case 1: // found_it
      ;
      if (!(humidity & ANY_LOC) && !isok(x.a[x.o], y.a[y.o])) {
        if (!(humidity & NO_LOC_WARN)) {
          x.a[x.o] = G.x_maze_max << 24 >> 24;
          y.a[y.o] = G.y_maze_max << 24 >> 24;
        } else {
          x.a[x.o] = y.a[y.o] = -1;
        }
      }
    }
    break;
  }
}

function is_ok_location(x: number, y: number, humidity: number): number {
  let typ = 0;
  if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    return TRUE;
  }
  if (humidity & ANY_LOC) {
    return TRUE;
  }
  if (humidity & SOLID && $at2(G.level.locations, x, y).typ < POOL) {
    return TRUE;
  }
  if (humidity & DRY) {
    typ = $at2(G.level.locations, x, y).typ;
    if (typ === ROOM || typ === AIR || typ === CLOUD || typ === ICE || typ === CORR) {
      return TRUE;
    }
  }
  if (humidity & SPACELOC && $at2(G.level.locations, x, y).typ > DOOR) {
    return TRUE;
  }
  if (humidity & WET && is_pool(x, y)) {
    return TRUE;
  }
  if (humidity & HOT && is_lava(x, y)) {
    return TRUE;
  }
  return FALSE;
}

export function get_unpacked_coord(loc: number, defhumidity: number): struct_unpacked_coord {
  if (loc & SP_COORD_IS_RANDOM) {
    get_unpacked_coord$c.x = get_unpacked_coord$c.y = -1;
    get_unpacked_coord$c.is_random = 1;
    get_unpacked_coord$c.getloc_flags = loc & ~SP_COORD_IS_RANDOM;
    if (!get_unpacked_coord$c.getloc_flags) {
      get_unpacked_coord$c.getloc_flags = defhumidity;
    }
  } else {
    get_unpacked_coord$c.is_random = 0;
    get_unpacked_coord$c.getloc_flags = defhumidity;
    get_unpacked_coord$c.x = loc & 255 | 0;
    get_unpacked_coord$c.y = $shr64(loc, 16) & 255 | 0;
  }
  return get_unpacked_coord$c.$clone();
}

async function get_location_coord(x: Ptr | null, y: Ptr | null, humidity: number, croom: struct_mkroom | null, crd: number): Promise<void> {
  let c = new struct_unpacked_coord();
  c.$cp(get_unpacked_coord(crd, humidity));
  x.a[x.o] = c.x << 24 >> 24;
  y.a[y.o] = c.y << 24 >> 24;
  await get_location(x, y, (c.getloc_flags | (c.is_random ? NO_LOC_WARN : 0)) | 0, croom);
  if (x.a[x.o] === -1 && y.a[y.o] === -1 && c.is_random) {
    await get_location(x, y, humidity, croom);
  }
}

async function get_room_loc(x: Ptr | null, y: Ptr | null, croom: struct_mkroom | null): Promise<void> {
  let c = new struct_nhcoord();
  if (x.a[x.o] < 0 && y.a[y.o] < 0) {
    if (somexy(croom, c)) {
      x.a[x.o] = c.x;
      y.a[y.o] = c.y;
    } else {
      await panic(S("get_room_loc : can't find a place!"));
    }
  } else {
    if (x.a[x.o] < 0) {
      x.a[x.o] = rn2(croom.hx - croom.lx + 1) << 24 >> 24;
    }
    if (y.a[y.o] < 0) {
      y.a[y.o] = rn2(croom.hy - croom.ly + 1) << 24 >> 24;
    }
    x.a[x.o] = x.a[x.o] + croom.lx << 24 >> 24;
    y.a[y.o] = y.a[y.o] + croom.ly << 24 >> 24;
  }
}

async function get_free_room_loc(x: Ptr | null, y: Ptr | null, croom: struct_mkroom | null, pos: number): Promise<void> {
  const try_x = new Int8Array(1);
  const try_y = new Int8Array(1);
  let trycnt = 0;
  await get_location_coord(P(try_x, 0), P(try_y, 0), DRY, croom, pos);
  if ($at2(G.level.locations, try_x[0], try_y[0]).typ !== ROOM) {
    do {
      try_x[0] = x.a[x.o], try_y[0] = y.a[y.o];
      await get_room_loc(P(try_x, 0), P(try_y, 0), croom);
    } while ($at2(G.level.locations, try_x[0], try_y[0]).typ !== ROOM && ++trycnt <= 100);
    if (trycnt > 100) {
      await panic(S("get_free_room_loc:  can't find a place!"));
    }
  }
  x.a[x.o] = try_x[0], y.a[y.o] = try_y[0];
}

export async function check_room(lowx: Ptr | null, ddx: Ptr | null, lowy: Ptr | null, ddy: Ptr | null, vault: number): Promise<number> {
  let $t1: any;
  let $g = 0;
  let x = 0;
  let y = 0;
  let hix = 0;
  let hiy = 0;
  let lev = null;
  let xlim = 0;
  let ylim = 0;
  let ymax = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      hix = lowx.a[lowx.o] + ddx.a[ddx.o];
      hiy = lowy.a[lowy.o] + ddy.a[ddy.o];
      xlim = XLIM + (vault ? 1 : 0);
      ylim = YLIM + (vault ? 1 : 0);
      if (lowx.a[lowx.o] < 3) {
        lowx.a[lowx.o] = 3;
      }
      if (lowy.a[lowy.o] < 2) {
        lowy.a[lowy.o] = 2;
      }
      if (hix > COLNO - 3) {
        hix = COLNO - 3;
      }
      if (hiy > ROWNO - 3) {
        hiy = ROWNO - 3;
      }
    case 1: // chk
      if (hix <= lowx.a[lowx.o] || hiy <= lowy.a[lowy.o]) {
        return FALSE;
      }
      for (x = lowx.a[lowx.o] - xlim; x <= hix + xlim; ++x) {
        if (x <= 0 || x >= COLNO) {
          continue;
        }
        y = lowy.a[lowy.o] - ylim;
        ymax = hiy + ylim;
        if (y < 0) {
          y = 0;
        }
        if (ymax >= ROWNO) {
          ymax = ROWNO - 1;
        }
        lev = $sat(G.level.locations[x], y);
        for (; y <= ymax; ++y) {
          if (($t1 = lev, lev = $sadd($t1, 1), $t1).typ) {
            if (!vault) {
              do {
                if (await debugcore(S("sp_lev.c"), 1)) {
                  await pline(S("strange area [%d,%d] in check_room."), x, y);
                }
              } while (0);
            }
            if (!rn2(3)) {
              return FALSE;
            }
            if (x < lowx.a[lowx.o]) {
              lowx.a[lowx.o] = x + xlim + 1 << 24 >> 24;
            } else {
              hix = x - xlim - 1;
            }
            if (y < lowy.a[lowy.o]) {
              lowy.a[lowy.o] = y + ylim + 1 << 24 >> 24;
            } else {
              hiy = y - ylim - 1;
            }
            { $g = 1; continue $L; }
          }
        }
      }
      ddx.a[ddx.o] = hix - lowx.a[lowx.o] << 24 >> 24;
      ddy.a[ddy.o] = hiy - lowy.a[lowy.o] << 24 >> 24;
      return TRUE;
    }
    break;
  }
}

export async function create_room(x: number, y: number, w: number, h: number, xal: number, yal: number, rtype: number, rlit: number): Promise<number> {
  const xabs = new Int8Array(1);
  xabs[0] = 0;
  const yabs = new Int8Array(1);
  yabs[0] = 0;
  let wtmp = 0;
  let htmp = 0;
  let xaltmp = 0;
  let yaltmp = 0;
  let xtmp = 0;
  let ytmp = 0;
  let r1 = null;
  let r2 = new struct_nhrect();
  let trycnt = 0;
  let vault = FALSE;
  let xlim = XLIM;
  let ylim = YLIM;
  if (rtype === -1) {
    rtype = OROOM;
  }
  if (rtype === VAULT) {
    vault = TRUE;
    ++xlim;
    ++ylim;
  }
  if (rlit === -1) {
    rlit = (rnd(1 + Math.abs(depth(G.u.uz))) < 11 && rn2(77) ? TRUE : FALSE) << 24 >> 24;
  }
  do {
    let xborder = 0;
    let yborder = 0;
    wtmp = w;
    htmp = h;
    xtmp = x;
    ytmp = y;
    xaltmp = xal;
    yaltmp = yal;
    if (xtmp < 0 && ytmp < 0 && wtmp < 0 && xaltmp < 0 && yaltmp < 0 || vault) {
      let hx = 0;
      let hy = 0;
      let lx = 0;
      let ly = 0;
      const dx = new Int8Array(1);
      const dy = new Int8Array(1);
      r1 = rnd_rect();
      if (!r1) {
        do {
          if (await debugcore(S("sp_lev.c"), 1)) {
            await pline(S("No more rects..."));
          }
        } while (0);
        return FALSE;
      }
      hx = r1.hx;
      hy = r1.hy;
      lx = r1.lx;
      ly = r1.ly;
      if (vault) {
        dx[0] = dy[0] = 1;
      } else {
        dx[0] = 2 + rn2(hx - lx > 28 ? 12 : 8) << 24 >> 24;
        dy[0] = 2 + rn2(4) << 24 >> 24;
        if (Math.imul(dx[0], dy[0]) > 50) {
          dy[0] = (50 / dx[0] | 0) << 24 >> 24;
        }
      }
      xborder = (lx > 0 && hx < COLNO - 1 ? 2 * xlim : xlim + 1) << 24 >> 24;
      yborder = (ly > 0 && hy < ROWNO - 1 ? 2 * ylim : ylim + 1) << 24 >> 24;
      if (hx - lx < dx[0] + 3 + xborder || hy - ly < dy[0] + 3 + yborder) {
        r1 = null;
        continue;
      }
      xabs[0] = lx + (lx > 0 ? xlim : 3) + rn2(hx - (lx > 0 ? lx : 3) - dx[0] - xborder + 1) << 24 >> 24;
      yabs[0] = ly + (ly > 0 ? ylim : 2) + rn2(hy - (ly > 0 ? ly : 2) - dy[0] - yborder + 1) << 24 >> 24;
      if (ly === 0 && hy >= ROWNO - 1 && (!G.nroom || !rn2(G.nroom)) && yabs[0] + dy[0] > (ROWNO / 2 | 0)) {
        yabs[0] = rn2(3) + 2 << 24 >> 24;
        if (G.nroom < 4 && dy[0] > 1) {
          dy[0] = dy[0] - 1 << 24 >> 24;
        }
      }
      if (!await check_room(P(xabs, 0), P(dx, 0), P(yabs, 0), P(dy, 0), vault)) {
        r1 = null;
        continue;
      }
      wtmp = dx[0] + 1;
      htmp = dy[0] + 1;
      r2.lx = xabs[0] - 1 << 24 >> 24;
      r2.ly = yabs[0] - 1 << 24 >> 24;
      r2.hx = xabs[0] + wtmp << 24 >> 24;
      r2.hy = yabs[0] + htmp << 24 >> 24;
    } else {
      let rndpos = 0;
      if (xtmp < 0 && ytmp < 0) {
        xtmp = rnd(5);
        ytmp = rnd(5);
        rndpos = 1;
      }
      if (wtmp < 0 || htmp < 0) {
        wtmp = rn2(15) + 3;
        htmp = rn2(8) + 2;
      }
      if (xaltmp === -1) {
        xaltmp = rnd(3);
      }
      if (yaltmp === -1) {
        yaltmp = rnd(3);
      }
      xabs[0] = (Math.imul(xtmp - 1, COLNO) / 5 | 0) + 1 << 24 >> 24;
      yabs[0] = (Math.imul(ytmp - 1, ROWNO) / 5 | 0) + 1 << 24 >> 24;
      switch (xaltmp) {
      case 1:
        break;
      case 5:
        xabs[0] = xabs[0] + ((COLNO / 5 | 0) - wtmp) << 24 >> 24;
        break;
      case 3:
        xabs[0] = xabs[0] + (((COLNO / 5 | 0) - wtmp) / 2 | 0) << 24 >> 24;
        break;
      }
      switch (yaltmp) {
      case 1:
        break;
      case 5:
        yabs[0] = yabs[0] + ((ROWNO / 5 | 0) - htmp) << 24 >> 24;
        break;
      case 3:
        yabs[0] = yabs[0] + (((ROWNO / 5 | 0) - htmp) / 2 | 0) << 24 >> 24;
        break;
      }
      if (xabs[0] + wtmp - 1 > COLNO - 2) {
        xabs[0] = COLNO - wtmp - 3 << 24 >> 24;
      }
      if (xabs[0] < 2) {
        xabs[0] = 2;
      }
      if (yabs[0] + htmp - 1 > ROWNO - 2) {
        yabs[0] = ROWNO - htmp - 3 << 24 >> 24;
      }
      if (yabs[0] < 2) {
        yabs[0] = 2;
      }
      r2.lx = xabs[0] - 1 << 24 >> 24;
      r2.ly = yabs[0] - 1 << 24 >> 24;
      r2.hx = xabs[0] + wtmp + rndpos << 24 >> 24;
      r2.hy = yabs[0] + htmp + rndpos << 24 >> 24;
      r1 = get_rect(r2);
    }
  } while (++trycnt <= 100 && !r1);
  if (!r1) {
    return FALSE;
  }
  await split_rects(r1, r2);
  if (!vault) {
    G.smeq[G.nroom] = G.nroom;
    await add_room(xabs[0], yabs[0], xabs[0] + wtmp - 1, yabs[0] + htmp - 1, rlit, rtype, FALSE);
  } else {
    G.rooms[G.nroom].lx = xabs[0];
    G.rooms[G.nroom].ly = yabs[0];
  }
  return TRUE;
}

async function create_subroom(proom: struct_mkroom | null, x: number, y: number, w: number, h: number, rtype: number, rlit: number): Promise<number> {
  let width = 0;
  let height = 0;
  width = proom.hx - proom.lx + 1 << 24 >> 24;
  height = proom.hy - proom.ly + 1 << 24 >> 24;
  if (width < 4 || height < 4) {
    return FALSE;
  }
  if (w === -1) {
    w = rnd(width - 3) << 24 >> 24;
  }
  if (h === -1) {
    h = rnd(height - 3) << 24 >> 24;
  }
  if (x === -1) {
    x = rnd(width - w - 1) - 1 << 24 >> 24;
  }
  if (y === -1) {
    y = rnd(height - h - 1) - 1 << 24 >> 24;
  }
  if (x === 1) {
    x = 0;
  }
  if (y === 1) {
    y = 0;
  }
  if (x + w + 1 === width) {
    x = x + 1 << 24 >> 24;
  }
  if (y + h + 1 === height) {
    y = y + 1 << 24 >> 24;
  }
  if (rtype === -1) {
    rtype = OROOM;
  }
  if (rlit === -1) {
    rlit = (rnd(1 + Math.abs(depth(G.u.uz))) < 11 && rn2(77) ? TRUE : FALSE) << 24 >> 24;
  }
  await add_subroom(proom, proom.lx + x, proom.ly + y, proom.lx + x + w - 1, proom.ly + y + h - 1, rlit, rtype, FALSE);
  return TRUE;
}

async function create_door(dd: struct_room_door | null, broom: struct_mkroom | null): Promise<void> {
  let $g = 0;
  let x = 0;
  let y = 0;
  let trycnt = 0;
  let wtry = 0;
  let dwall = 0;
  let dpos = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      x = 0;
      y = 0;
      trycnt = 0;
      wtry = 0;
      if (dd.secret === -1) {
        dd.secret = rn2(2) << 24 >> 24;
      }
      if (dd.mask === -1) {
        if (!dd.secret) {
          if (!rn2(3)) {
            if (!rn2(5)) {
              dd.mask = D_ISOPEN;
            } else if (!rn2(6)) {
              dd.mask = D_LOCKED;
            } else {
              dd.mask = D_CLOSED;
            }
            if (dd.mask !== D_ISOPEN && !rn2(25)) {
              dd.mask = (dd.mask | D_TRAPPED) << 24 >> 24;
            }
          } else {
            dd.mask = D_NODOOR;
          }
        } else {
          if (!rn2(5)) {
            dd.mask = D_LOCKED;
          } else {
            dd.mask = D_CLOSED;
          }
          if (!rn2(20)) {
            dd.mask = (dd.mask | D_TRAPPED) << 24 >> 24;
          }
        }
      }
    case 3:
      dwall = dd.wall;
      if (dwall === -1) {
        dwall = 1 << rn2(4);
      }
      dpos = dd.pos;
      wtry = rn2(4);
      switch (wtry) {
      case 0:
        if (!(dwall & W_NORTH)) {
          { $g = 1; continue $L; }
        }
        y = broom.ly - 1;
        x = broom.lx + (dpos === -1 ? rn2(1 + (broom.hx - broom.lx)) : dpos);
        if ($at2(G.level.locations, x, y - 1).typ < POOL) {
          { $g = 1; continue $L; }
        }
        { $g = 2; continue $L; }
      case 1:
        if (!(dwall & W_SOUTH)) {
          { $g = 1; continue $L; }
        }
        y = broom.hy + 1;
        x = broom.lx + (dpos === -1 ? rn2(1 + (broom.hx - broom.lx)) : dpos);
        if ($at2(G.level.locations, x, y + 1).typ < POOL) {
          { $g = 1; continue $L; }
        }
        { $g = 2; continue $L; }
      case 2:
        if (!(dwall & W_WEST)) {
          { $g = 1; continue $L; }
        }
        x = broom.lx - 1;
        y = broom.ly + (dpos === -1 ? rn2(1 + (broom.hy - broom.ly)) : dpos);
        if ($at2(G.level.locations, x - 1, y).typ < POOL) {
          { $g = 1; continue $L; }
        }
        { $g = 2; continue $L; }
      case 3:
        if (!(dwall & W_EAST)) {
          { $g = 1; continue $L; }
        }
        x = broom.hx + 1;
        y = broom.ly + (dpos === -1 ? rn2(1 + (broom.hy - broom.ly)) : dpos);
        if ($at2(G.level.locations, x + 1, y).typ < POOL) {
          { $g = 1; continue $L; }
        }
        { $g = 2; continue $L; }
      default:
        x = y = 0;
        await panic(S("create_door: No wall for door!"));
        { $g = 2; continue $L; }
      }
    case 2: // outdirloop
      if (okdoor(x, y)) {
        { $g = 5; continue $L; };
      }
    case 1: // redoloop
      ;
    case 4:
      if (++trycnt <= 100) { $g = 3; continue $L; }
    case 5:
      if (trycnt > 100) {
        await impossible(S("create_door: Can't find a proper place!"));
        return;
      }
      $at2(G.level.locations, x, y).typ = (dd.secret ? SDOOR : DOOR) << 24 >> 24;
      $at2(G.level.locations, x, y).flags = (dd.mask >>> 0) & 31;
    }
    break;
  }
}

export async function create_secret_door(croom: struct_mkroom | null, walls: number): Promise<void> {
  let sx = 0;
  let sy = 0;
  let count = 0;
  for (count = 0; count < 100; ++count) {
    sx = rn2(croom.hx - croom.lx + 1) + croom.lx << 24 >> 24;
    sy = rn2(croom.hy - croom.ly + 1) + croom.ly << 24 >> 24;
    switch (rn2(4)) {
    case 0:
      if (!(walls & W_NORTH)) {
        continue;
      }
      sy = croom.ly - 1 << 24 >> 24;
      break;
    case 1:
      if (!(walls & W_SOUTH)) {
        continue;
      }
      sy = croom.hy + 1 << 24 >> 24;
      break;
    case 2:
      if (!(walls & W_EAST)) {
        continue;
      }
      sx = croom.lx - 1 << 24 >> 24;
      break;
    case 3:
      if (!(walls & W_WEST)) {
        continue;
      }
      sx = croom.hx + 1 << 24 >> 24;
      break;
    }
    if (okdoor(sx, sy)) {
      $at2(G.level.locations, sx, sy).typ = SDOOR;
      $at2(G.level.locations, sx, sy).flags = (D_CLOSED) & 31;
      return;
    }
  }
  await impossible(S("couldn't create secret door on any walls 0x%x"), walls);
}

async function create_trap(t: struct_spltrap | null, croom: struct_mkroom | null): Promise<void> {
  const x = new Int8Array(1);
  x[0] = -1;
  const y = new Int8Array(1);
  y[0] = -1;
  let tm = new struct_nhcoord();
  if (croom) {
    await get_free_room_loc(P(x, 0), P(y, 0), croom, t.coord);
  } else {
    let trycnt = 0;
    do {
      await get_location_coord(P(x, 0), P(y, 0), DRY, croom, t.coord);
    } while (($at2(G.level.locations, x[0], y[0]).typ === STAIRS || $at2(G.level.locations, x[0], y[0]).typ === LADDER) && ++trycnt <= 100);
    if (trycnt > 100) {
      return;
    }
  }
  tm.x = x[0];
  tm.y = y[0];
  await mktrap(t.type, 1, null, tm);
}

function noncoalignment(alignment: number): number {
  let k = 0;
  k = rn2(2);
  if (!alignment) {
    return k ? -1 : 1;
  }
  return k ? -alignment : 0;
}

function m_bad_boulder_spot(x: number, y: number): number {
  let lev = null;
  if (t_at(x, y)) {
    return TRUE;
  }
  if (sobj_at(BOULDER, x, y)) {
    return TRUE;
  }
  lev = $sat(G.level.locations[x], y);
  if (lev.typ === DOOR && ((lev.flags | 0) & (D_CLOSED | D_LOCKED)) !== 0) {
    return TRUE;
  }
  return FALSE;
}

function pm_to_humidity(pm: struct_permonst | null): number {
  let loc = DRY;
  if (!pm) {
    return loc;
  }
  if (pm.mlet === S_EEL || (pm.mflags1 & (512 | 1024)) >>> 0 !== 0 || (pm.mflags1 & 2) >>> 0 !== 0) {
    loc = WET;
  }
  if ((pm.mflags1 & 1) >>> 0 !== 0 || (pm.mlet === S_EYE || pm.mlet === S_LIGHT)) {
    loc |= HOT | WET;
  }
  if ((pm.mflags1 & 8) >>> 0 !== 0 || pm.mlet === S_GHOST) {
    loc |= SOLID;
  }
  if (pm === $sat(G.mons, 110) || pm === $sat(G.mons, 30) || pm === $sat(G.mons, 152) || pm === $sat(G.mons, 326)) {
    loc |= HOT;
  }
  return loc;
}

async function create_monster(m: struct_monster | null, croom: struct_mkroom | null): Promise<void> {
  let mtmp = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let class_ = 0;
  let amask = 0;
  let cc = new struct_nhcoord();
  let pm = null;
  let g_mvflags = 0;
  if (m.class >= 0) {
    class_ = def_char_to_monclass(m.class) << 24 >> 24;
  } else {
    class_ = 0;
  }
  if (class_ === MAXMCLASSES) {
    await panic(S("create_monster: unknown monster class '%c'"), m.class);
  }
  amask = (m.align === AM_SPLEV_CO ? G.u.ualignbase[1] === -128 ? 0 : G.u.ualignbase[1] === 1 ? 4 : G.u.ualignbase[1] + 2 : m.align === AM_SPLEV_NONCO ? noncoalignment(G.u.ualignbase[1]) === -128 ? 0 : noncoalignment(G.u.ualignbase[1]) === 1 ? 4 : noncoalignment(G.u.ualignbase[1]) + 2 : m.align <= -(MAX_REGISTERS + 1) ? induced_align(80) : m.align < 0 ? ralign[-m.align - 1] : m.align) << 24 >> 24;
  if (!class_) {
    pm = null;
  } else if (m.id !== NON_PM) {
    pm = $sat(G.mons, m.id);
    g_mvflags = G.mvitals[await monsndx(pm)].mvflags;
    if (pm.geno & G_UNIQ && (g_mvflags & G_EXTINCT) >>> 0) {
      return;
    } else if ((g_mvflags & G_GONE) >>> 0) {
      pm = null;
    }
  } else {
    pm = await mkclass(class_, G_NOGEN);
  }
  if (In_mines(G.u.uz) && pm && (pm.mflags2 & $u64(G.urace.selfmask)) >>> 0 !== 0 && (G.urace.malenum === 43 || G.urace.malenum === 162) && rn2(3)) {
    pm = null;
  }
  if (pm) {
    let loc = pm_to_humidity(pm);
    await get_location_coord(P(x, 0), P(y, 0), loc | NO_LOC_WARN, croom, m.coord);
    if (x[0] === -1 && y[0] === -1) {
      loc |= DRY;
      await get_location_coord(P(x, 0), P(y, 0), loc, croom, m.coord);
    }
  } else {
    await get_location_coord(P(x, 0), P(y, 0), DRY, croom, m.coord);
  }
  if (!!G.level.monsters[x[0]][y[0]] && await enexto(cc, x[0], y[0], pm)) {
    x[0] = cc.x, y[0] = cc.y;
  }
  if (m.align !== -(MAX_REGISTERS + 2)) {
    mtmp = await mk_roamer(pm, (!amask ? -128 : amask === 4 ? 1 : amask - 2) << 24 >> 24, x[0], y[0], m.peaceful);
  } else if (PM_ARCHEOLOGIST <= m.id && m.id <= PM_WIZARD) {
    mtmp = await mk_mplayer(pm, x[0], y[0], FALSE);
  } else {
    mtmp = await makemon(pm, x[0], y[0], NO_MM_FLAGS);
  }
  if (mtmp) {
    x[0] = mtmp.mx, y[0] = mtmp.my;
    m.x = x[0], m.y = y[0];
    if (m.name.str) {
      mtmp = await christen_monst(mtmp, m.name.str);
    }
    if (m.appear_as.str && (mtmp.data.mlet === S_MIMIC || mtmp.cham >= LOW_PM && m.appear === M_AP_MONSTER) && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic)) {
      let i = 0;
      switch (m.appear) {
      case M_AP_NOTHING:
        await impossible(S("create_monster: mon has an appearance, \"%s\", but no type"), m.appear_as.str);
        break;
      case M_AP_FURNITURE:
        for (i = 0; i < MAXPCHARS; ++i) {
          if (!strcmp(G.defsyms[i].explanation, m.appear_as.str)) {
            break;
          }
        }
        if (i === MAXPCHARS) {
          await impossible(S("create_monster: can't find feature \"%s\""), m.appear_as.str);
        } else {
          mtmp.m_ap_type = M_AP_FURNITURE;
          mtmp.mappearance = i >>> 0;
        }
        break;
      case M_AP_OBJECT:
        for (i = 0; i < NUM_OBJECTS; ++i) {
          if (G.obj_descr[G.objects[i].oc_name_idx].oc_name && !strcmp(G.obj_descr[G.objects[i].oc_name_idx].oc_name, m.appear_as.str)) {
            break;
          }
        }
        if (i === NUM_OBJECTS) {
          await impossible(S("create_monster: can't find object \"%s\""), m.appear_as.str);
        } else {
          mtmp.m_ap_type = M_AP_OBJECT;
          mtmp.mappearance = i >>> 0;
          if (i === BOULDER && m.x < 0 && m_bad_boulder_spot(x[0], y[0])) {
            let retrylimit = 10;
            G.level.monsters[x[0]][y[0]] = null;
            do {
              x[0] = m.x;
              y[0] = m.y;
              await get_location(P(x, 0), P(y, 0), DRY, croom);
              if (!!G.level.monsters[x[0]][y[0]] && await enexto(cc, x[0], y[0], pm)) {
                x[0] = cc.x, y[0] = cc.y;
              }
            } while (m_bad_boulder_spot(x[0], y[0]) && --retrylimit > 0);
            await place_monster(mtmp, x[0], y[0]);
            if (!retrylimit) {
              await set_mimic_sym(mtmp);
            }
          }
        }
        break;
      case M_AP_MONSTER:
        {
          const mndx = new Int32Array(1);
          if (!strncmpi(m.appear_as.str, S("random"), -1)) {
            mndx[0] = await select_newcham_form(mtmp);
          } else {
            mndx[0] = name_to_mon(m.appear_as.str);
          }
          if (mndx[0] === NON_PM || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) && !validvamp(mtmp, P(mndx, 0), S_HUMAN)) {
            await impossible(S("create_monster: invalid %s (\"%s\")"), mtmp.data.mlet === S_MIMIC ? S("mimic appearance") : mtmp.data === $sat(G.mons, PM_WIZARD_OF_YENDOR) ? S("Wizard appearance") : mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224 ? S("vampire shape") : S("chameleon shape"), m.appear_as.str);
          } else if ($sat(G.mons, mndx[0]) === mtmp.data) {
            mtmp.m_ap_type = M_AP_NOTHING;
            mtmp.mappearance = 0;
          } else if (mtmp.data.mlet === S_MIMIC || mtmp.data === $sat(G.mons, PM_WIZARD_OF_YENDOR)) {
            mtmp.m_ap_type = M_AP_MONSTER;
            mtmp.mappearance = mndx[0] >>> 0;
          } else {
            let mdat = $sat(G.mons, mndx[0]);
            let olddata = mtmp.data;
            mgender_from_permonst(mtmp, mdat);
            await set_mon_data(mtmp, mdat);
            if ((olddata.mlet === S_LIGHT || olddata === $sat(G.mons, 30) || olddata === $sat(G.mons, 31) || olddata === $sat(G.mons, 110) ? 1 : olddata === $sat(G.mons, 152) ? 1 : 0) !== (mtmp.data.mlet === S_LIGHT || mtmp.data === $sat(G.mons, 30) || mtmp.data === $sat(G.mons, 31) || mtmp.data === $sat(G.mons, 110) ? 1 : mtmp.data === $sat(G.mons, 152) ? 1 : 0)) {
              if (olddata.mlet === S_LIGHT || olddata === $sat(G.mons, 30) || olddata === $sat(G.mons, 31) || olddata === $sat(G.mons, 110) ? 1 : olddata === $sat(G.mons, 152) ? 1 : 0) {
                await del_light_source(LS_MONSTER, mtmp);
              }
              if (mtmp.data.mlet === S_LIGHT || mtmp.data === $sat(G.mons, 30) || mtmp.data === $sat(G.mons, 31) || mtmp.data === $sat(G.mons, 110) ? 1 : mtmp.data === $sat(G.mons, 152) ? 1 : 0) {
                await new_light_source(mtmp.mx, mtmp.my, mtmp.data.mlet === S_LIGHT || mtmp.data === $sat(G.mons, 30) || mtmp.data === $sat(G.mons, 31) || mtmp.data === $sat(G.mons, 110) ? 1 : mtmp.data === $sat(G.mons, 152) ? 1 : 0, LS_MONSTER, mtmp);
              }
            }
            if (!mtmp.perminvis || (olddata === $sat(G.mons, 150) || olddata === $sat(G.mons, 118))) {
              mtmp.perminvis = ((mdat === $sat(G.mons, 150) || mdat === $sat(G.mons, 118) ? 1 : 0) >>> 0) & 1;
            }
          }
          break;
        }
      default:
        await impossible(S("create_monster: unimplemented mon appear type [%d,\"%s\"]"), m.appear, m.appear_as.str);
        break;
      }
      if (does_block(x[0], y[0], $sat(G.level.locations[x[0]], y[0]))) {
        block_point(x[0], y[0]);
      }
    }
    if (m.peaceful >= 0) {
      mtmp.mpeaceful = (m.peaceful >>> 0) & 1;
      set_malign(mtmp);
    }
    if (m.asleep >= 0) {
      mtmp.msleeping = (m.asleep >>> 0) & 1;
    }
    if (m.seentraps) {
      mtmp.mtrapseen = m.seentraps;
    }
    if (m.female) {
      mtmp.female = 1;
    }
    if (m.cancelled) {
      mtmp.mcan = 1;
    }
    if (m.revived) {
      mtmp.mrevived = 1;
    }
    if (m.avenge) {
      mtmp.mavenge = 1;
    }
    if (m.stunned) {
      mtmp.mstun = 1;
    }
    if (m.confused) {
      mtmp.mconf = 1;
    }
    if (m.invis) {
      mtmp.minvis = (mtmp.perminvis = 1) & 1;
    }
    if (m.blinded) {
      mtmp.mcansee = 0;
      mtmp.mblinded = (m.blinded % 127 >>> 0) & 127;
    }
    if (m.paralyzed) {
      mtmp.mcanmove = 0;
      mtmp.mfrozen = (m.paralyzed % 127 >>> 0) & 127;
    }
    if (m.fleeing) {
      mtmp.mflee = 1;
      mtmp.mfleetim = (m.fleeing % 127 >>> 0) & 127;
    }
    if (m.has_invent) {
      await discard_minvent(mtmp);
      invent_carrying_monster = mtmp;
    }
  }
}

async function create_object(o: struct_object | null, croom: struct_mkroom | null): Promise<void> {
  let otmp = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let c = 0;
  let named = 0;
  named = (o.name.str ? TRUE : FALSE) << 24 >> 24;
  await get_location_coord(P(x, 0), P(y, 0), DRY, croom, o.coord);
  if (o.class >= 0) {
    c = o.class;
  } else {
    c = 0;
  }
  if (!c) {
    otmp = await mkobj_at(RANDOM_CLASS, x[0], y[0], !named ? 1 : 0);
  } else if (o.id !== -1) {
    otmp = await mksobj_at(o.id, x[0], y[0], TRUE, !named ? 1 : 0);
  } else {
    let oclass = def_char_to_objclass(c) << 24 >> 24;
    if (oclass === MAXOCLASSES) {
      await panic(S("create_object:  unexpected object class '%c'"), c);
    }
    if (oclass === COIN_CLASS) {
      otmp = await mkgold(0, x[0], y[0]);
    } else {
      otmp = await mkobj_at(oclass, x[0], y[0], !named ? 1 : 0);
    }
  }
  if (o.spe !== -127) {
    otmp.spe = o.spe << 24 >> 24;
  }
  switch (o.curse_state) {
  case 1:
    await bless(otmp);
    break;
  case 2:
    await unbless(otmp);
    await uncurse(otmp);
    break;
  case 3:
    await curse(otmp);
    break;
  default:
    break;
  }
  if (o.corpsenm !== NON_PM) {
    if (o.corpsenm === NON_PM - 1) {
      await set_corpsenm(otmp, await rndmonnum());
    } else {
      await set_corpsenm(otmp, o.corpsenm);
    }
  }
  if (named) {
    otmp = await oname(otmp, o.name.str);
  }
  if (o.eroded) {
    if (o.eroded < 0) {
      otmp.oerodeproof = 1;
    } else {
      otmp.oeroded = (o.eroded % 4 >>> 0) & 3;
      otmp.oeroded2 = ((o.eroded >> 2) % 4 >>> 0) & 3;
    }
  }
  if (o.recharged) {
    otmp.recharged = (o.recharged % 8 >>> 0) & 7;
  }
  if (o.locked) {
    otmp.olocked = 1;
  } else if (o.broken) {
    otmp.obroken = 1;
    otmp.olocked = 0;
  }
  if (o.trapped === 0 || o.trapped === 1) {
    otmp.otrapped = (o.trapped >>> 0) & 1;
  }
  if (o.greased) {
    otmp.greased = 1;
  }
  if (o.quan > 0 && G.objects[otmp.otyp].oc_merge | 0) {
    otmp.quan = o.quan;
    otmp.owt = await weight(otmp) >>> 0;
  }
  if (o.containment & SP_OBJ_CONTENT) {
    if (!container_idx) {
      if (!invent_carrying_monster) {
        ;
      } else {
        await remove_object(otmp);
        await mpickobj(invent_carrying_monster, otmp);
      }
    } else {
      let cobj = container_obj[container_idx - 1];
      await remove_object(otmp);
      if (cobj) {
        await add_to_container(cobj, otmp);
        cobj.owt = await weight(cobj) >>> 0;
      } else {
        await obj_extract_self(otmp);
        await obfree(otmp, null);
        return;
      }
    }
  }
  if (o.containment & SP_OBJ_CONTAINER) {
    await delete_contents(otmp);
    if (container_idx < MAX_CONTAINMENT) {
      container_obj[container_idx] = otmp;
      ++container_idx;
    } else {
      await impossible(S("create_object: too deeply nested containers."));
    }
  }
  if (o.id === STATUE && ((G.dungeon_topology.d_medusa_level.dlevel || G.dungeon_topology.d_medusa_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_medusa_level)) && o.corpsenm === NON_PM) {
    let was = null;
    let obj = null;
    let wastyp = 0;
    let i = 0;
    for (wastyp = otmp.corpsenm; i < 1000; ++i, wastyp = await rndmonnum()) {
      was = await makemon($sat(G.mons, wastyp), 0, 0, MM_NOCOUNTBIRTH);
      if (was) {
        if (!(((was.data.mresists | was.mextrinsics) & 128) !== 0)) {
          await propagate(wastyp, TRUE, FALSE);
          break;
        }
        await mongone(was);
        was = null;
      }
    }
    if (was) {
      await set_corpsenm(otmp, wastyp);
      while (was.minvent) {
        obj = was.minvent;
        obj.owornmask = 0;
        await obj_extract_self(obj);
        await add_to_container(otmp, obj);
      }
      otmp.owt = await weight(otmp) >>> 0;
      await mongone(was);
    }
  }
  if (o.id !== -1) {
    if ((G.dungeon_topology.d_mineend_level.dlevel || G.dungeon_topology.d_mineend_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_mineend_level)) {
      if (otmp.otyp === G.iflags.mines_prize_type) {
        if (!mines_prize_count++) {
          otmp.corpsenm = MINES_PRIZE;
          otmp.nomerge = 1;
        }
      }
    } else if ((G.dungeon_topology.d_sokoend_level.dlevel || G.dungeon_topology.d_sokoend_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sokoend_level)) {
      if (otmp.otyp === G.iflags.soko_prize_type1) {
        otmp.corpsenm = SOKO_PRIZE1;
        otmp.nomerge = 1;
        if (++soko_prize_count > 1) {
          await impossible(P(create_object$prize_warning), S("sokoban end"));
        }
      } else if (otmp.otyp === G.iflags.soko_prize_type2) {
        otmp.corpsenm = SOKO_PRIZE2;
        otmp.nomerge = 1;
        if (++soko_prize_count > 1) {
          await impossible(P(create_object$prize_warning), S("sokoban end"));
        }
      }
    }
  }
  await stackobj(otmp);
  if (o.lit) {
    await begin_burn(otmp, FALSE);
  }
  if (o.buried) {
    const dealloced = new Int8Array(1);
    await bury_an_obj(otmp, P(dealloced, 0));
    if (dealloced[0] && container_idx) {
      container_obj[container_idx - 1] = null;
    }
  }
}

async function create_altar(a: struct_altar | null, croom: struct_mkroom | null): Promise<void> {
  let $t1: any;
  let sproom = 0;
  const x = new Int8Array(1);
  x[0] = -1;
  const y = new Int8Array(1);
  y[0] = -1;
  let amask = 0;
  let croom_is_temple = TRUE;
  let oldtyp = 0;
  if (croom) {
    await get_free_room_loc(P(x, 0), P(y, 0), croom, a.coord);
    if (croom.rtype !== TEMPLE) {
      croom_is_temple = FALSE;
    }
  } else {
    await get_location_coord(P(x, 0), P(y, 0), DRY, croom, a.coord);
    if ((sproom = $rd(in_rooms(x[0], y[0], TEMPLE))) !== 0) {
      croom = $sat(G.rooms, sproom - ROOMOFFSET);
    } else {
      croom_is_temple = FALSE;
    }
  }
  oldtyp = $at2(G.level.locations, x[0], y[0]).typ;
  if (oldtyp === STAIRS || oldtyp === LADDER) {
    return;
  }
  amask = (a.align === AM_SPLEV_CO ? G.u.ualignbase[1] === -128 ? 0 : G.u.ualignbase[1] === 1 ? 4 : G.u.ualignbase[1] + 2 : a.align === AM_SPLEV_NONCO ? noncoalignment(G.u.ualignbase[1]) === -128 ? 0 : noncoalignment(G.u.ualignbase[1]) === 1 ? 4 : noncoalignment(G.u.ualignbase[1]) + 2 : a.align === -(MAX_REGISTERS + 1) ? induced_align(80) : a.align < 0 ? ralign[-a.align - 1] : a.align) << 24 >> 24;
  $at2(G.level.locations, x[0], y[0]).typ = ALTAR;
  $at2(G.level.locations, x[0], y[0]).flags = (amask >>> 0) & 31;
  if (a.shrine < 0) {
    a.shrine = rn2(2) << 24 >> 24;
  }
  if (!croom_is_temple || !a.shrine) {
    return;
  }
  if (a.shrine) {
    await priestini(G.u.uz, croom, x[0], y[0], a.shrine > 1 ? 1 : 0);
    ($t1 = $at2(G.level.locations, x[0], y[0]), $t1.flags = (($t1.flags | 0 | AM_SHRINE) >>> 0) & 31);
    G.level.flags.has_temple = (TRUE) & 1;
  }
}

export async function replace_terrain(terr: struct_replaceterrain | null, croom: struct_mkroom | null): Promise<void> {
  let x = 0;
  let y = 0;
  const x1 = new Int8Array(1);
  const y1 = new Int8Array(1);
  const x2 = new Int8Array(1);
  const y2 = new Int8Array(1);
  if (terr.toter >= MAX_TYPE) {
    return;
  }
  x1[0] = terr.x1;
  y1[0] = terr.y1;
  await get_location(P(x1, 0), P(y1, 0), ANY_LOC, croom);
  x2[0] = terr.x2;
  y2[0] = terr.y2;
  await get_location(P(x2, 0), P(y2, 0), ANY_LOC, croom);
  for (x = (x1[0] > 0 ? x1[0] : 0) << 24 >> 24; x <= (x2[0] < 80 - 1 ? x2[0] : 80 - 1); x = x + 1 << 24 >> 24) {
    for (y = (y1[0] > 0 ? y1[0] : 0) << 24 >> 24; y <= (y2[0] < 21 - 1 ? y2[0] : 21 - 1); y = y + 1 << 24 >> 24) {
      if ($at2(G.level.locations, x, y).typ === terr.fromter && rn2(100) < terr.chance) {
        {
          if (x >= 0 && y >= 0 && x < 80 && y < 21) {
            if (terr.toter < MAX_TYPE) {
              $at2(G.level.locations, x, y).typ = terr.toter;
            }
            if (terr.toter === LAVAPOOL) {
              $at2(G.level.locations, x, y).lit = 1;
            } else if (terr.tolit !== -2) {
              if (terr.tolit === -1) {
                $at2(G.level.locations, x, y).lit = (rn2(2) >>> 0) & 1;
              } else {
                $at2(G.level.locations, x, y).lit = (terr.tolit >>> 0) & 1;
              }
            }
          }
        }
        ;
      }
    }
  }
}

async function search_door(croom: struct_mkroom | null, x: Ptr | null, y: Ptr | null, wall: number, cnt: number): Promise<number> {
  let dx = 0;
  let dy = 0;
  let xx = 0;
  let yy = 0;
  switch (wall) {
  case 1:
    dy = 0;
    dx = 1;
    xx = croom.lx;
    yy = croom.hy + 1;
    break;
  case 2:
    dy = 0;
    dx = 1;
    xx = croom.lx;
    yy = croom.ly - 1;
    break;
  case 4:
    dy = 1;
    dx = 0;
    xx = croom.hx + 1;
    yy = croom.ly;
    break;
  case 8:
    dy = 1;
    dx = 0;
    xx = croom.lx - 1;
    yy = croom.ly;
    break;
  default:
    dx = dy = xx = yy = 0;
    await panic(S("search_door: Bad wall!"));
    break;
  }
  while (xx <= croom.hx + 1 && yy <= croom.hy + 1) {
    if ($at2(G.level.locations, xx, yy).typ === DOOR || $at2(G.level.locations, xx, yy).typ === SDOOR) {
      x.a[x.o] = xx << 24 >> 24;
      y.a[y.o] = yy << 24 >> 24;
      if (cnt-- <= 0) {
        return TRUE;
      }
    }
    xx += dx;
    yy += dy;
  }
  return FALSE;
}

export async function dig_corridor(org: struct_nhcoord | null, dest: struct_nhcoord | null, nxcor: number, ftyp: number, btyp: number): Promise<number> {
  let dx = 0;
  let dy = 0;
  let dix = 0;
  let diy = 0;
  let cct = 0;
  let crm = null;
  let tx = 0;
  let ty = 0;
  let xx = 0;
  let yy = 0;
  xx = org.x;
  yy = org.y;
  tx = dest.x;
  ty = dest.y;
  if (xx <= 0 || yy <= 0 || tx <= 0 || ty <= 0 || xx > COLNO - 1 || tx > COLNO - 1 || yy > ROWNO - 1 || ty > ROWNO - 1) {
    do {
      if (await debugcore(S("sp_lev.c"), 1)) {
        await pline(S("dig_corridor: bad coords <%d,%d> <%d,%d>."), xx, yy, tx, ty);
      }
    } while (0);
    return FALSE;
  }
  if (tx > xx) {
    dx = 1;
  } else if (ty > yy) {
    dy = 1;
  } else if (tx < xx) {
    dx = -1;
  } else {
    dy = -1;
  }
  xx -= dx;
  yy -= dy;
  cct = 0;
  while (xx !== tx || yy !== ty) {
    if (cct++ > 500 || nxcor && !rn2(35)) {
      return FALSE;
    }
    xx += dx;
    yy += dy;
    if (xx >= COLNO - 1 || xx <= 0 || yy <= 0 || yy >= ROWNO - 1) {
      return FALSE;
    }
    crm = $sat(G.level.locations[xx], yy);
    if (crm.typ === btyp) {
      if (ftyp !== CORR || rn2(100)) {
        crm.typ = ftyp;
        if (nxcor && !rn2(50)) {
          await mksobj_at(BOULDER, xx, yy, TRUE, FALSE);
        }
      } else {
        crm.typ = SCORR;
      }
    } else if (crm.typ !== ftyp && crm.typ !== SCORR) {
      return FALSE;
    }
    dix = Math.abs(xx - tx);
    diy = Math.abs(yy - ty);
    if (dix > diy && diy && !rn2(dix - diy + 1)) {
      dix = 0;
    } else if (diy > dix && dix && !rn2(diy - dix + 1)) {
      diy = 0;
    }
    if (dy && dix > diy) {
      let ddx = xx > tx ? -1 : 1;
      crm = $sat(G.level.locations[xx + ddx], yy);
      if (crm.typ === btyp || crm.typ === ftyp || crm.typ === SCORR) {
        dx = ddx;
        dy = 0;
        continue;
      }
    } else if (dx && diy > dix) {
      let ddy = yy > ty ? -1 : 1;
      crm = $sat(G.level.locations[xx], yy + ddy);
      if (crm.typ === btyp || crm.typ === ftyp || crm.typ === SCORR) {
        dy = ddy;
        dx = 0;
        continue;
      }
    }
    crm = $sat(G.level.locations[xx + dx], yy + dy);
    if (crm.typ === btyp || crm.typ === ftyp || crm.typ === SCORR) {
      continue;
    }
    if (dx) {
      dx = 0;
      dy = ty < yy ? -1 : 1;
    } else {
      dy = 0;
      dx = tx < xx ? -1 : 1;
    }
    crm = $sat(G.level.locations[xx + dx], yy + dy);
    if (crm.typ === btyp || crm.typ === ftyp || crm.typ === SCORR) {
      continue;
    }
    dy = -dy;
    dx = -dx;
  }
  return TRUE;
}

async function fix_stair_rooms(): Promise<void> {
  let i = 0;
  let croom = null;
  if (G.dnstair.sx && !(G.dnstairs_room.lx <= G.dnstair.sx && G.dnstair.sx <= G.dnstairs_room.hx && (G.dnstairs_room.ly <= G.dnstair.sy && G.dnstair.sy <= G.dnstairs_room.hy))) {
    for (i = 0; i < G.nroom; ++i) {
      croom = $sat(G.rooms, i);
      if (croom.lx <= G.dnstair.sx && G.dnstair.sx <= croom.hx && (croom.ly <= G.dnstair.sy && G.dnstair.sy <= croom.hy)) {
        G.dnstairs_room = croom;
        break;
      }
    }
    if (i === G.nroom) {
      await panic(S("Couldn't find dnstair room in fix_stair_rooms!"));
    }
  }
  if (G.upstair.sx && !(G.upstairs_room.lx <= G.upstair.sx && G.upstair.sx <= G.upstairs_room.hx && (G.upstairs_room.ly <= G.upstair.sy && G.upstair.sy <= G.upstairs_room.hy))) {
    for (i = 0; i < G.nroom; ++i) {
      croom = $sat(G.rooms, i);
      if (croom.lx <= G.upstair.sx && G.upstair.sx <= croom.hx && (croom.ly <= G.upstair.sy && G.upstair.sy <= croom.hy)) {
        G.upstairs_room = croom;
        break;
      }
    }
    if (i === G.nroom) {
      await panic(S("Couldn't find upstair room in fix_stair_rooms!"));
    }
  }
}

async function create_corridor(c: struct_corridor | null): Promise<void> {
  let org = new struct_nhcoord();
  let dest = new struct_nhcoord();
  if (c.src.room === -1) {
    await fix_stair_rooms();
    await makecorridors();
    return;
  }
  if (!await search_door($sat(G.rooms, c.src.room), P(org, "x"), P(org, "y"), c.src.wall, c.src.door)) {
    return;
  }
  if (c.dest.room !== -1) {
    if (!await search_door($sat(G.rooms, c.dest.room), P(dest, "x"), P(dest, "y"), c.dest.wall, c.dest.door)) {
      return;
    }
    switch (c.src.wall) {
    case 1:
      org.y = org.y - 1 << 24 >> 24;
      break;
    case 2:
      org.y = org.y + 1 << 24 >> 24;
      break;
    case 8:
      org.x = org.x - 1 << 24 >> 24;
      break;
    case 4:
      org.x = org.x + 1 << 24 >> 24;
      break;
    }
    switch (c.dest.wall) {
    case 1:
      dest.y = dest.y - 1 << 24 >> 24;
      break;
    case 2:
      dest.y = dest.y + 1 << 24 >> 24;
      break;
    case 8:
      dest.x = dest.x - 1 << 24 >> 24;
      break;
    case 4:
      dest.x = dest.x + 1 << 24 >> 24;
      break;
    }
    await dig_corridor(org, dest, FALSE, CORR, STONE);
  }
}

export async function fill_room(croom: struct_mkroom | null, prefilled: number): Promise<void> {
  if (!croom || croom.rtype === OROOM) {
    return;
  }
  if (!prefilled) {
    let x = 0;
    let y = 0;
    if (croom.rtype >= SHOPBASE) {
      await stock_room(croom.rtype - SHOPBASE, croom);
      G.level.flags.has_shop = (TRUE) & 1;
      return;
    }
    switch (croom.rtype) {
    case VAULT:
      for (x = croom.lx; x <= croom.hx; ++x) {
        for (y = croom.ly; y <= croom.hy; ++y) {
          await mkgold(rn2(Math.abs(depth(G.u.uz)) * 100) + 51, x, y);
        }
      }
      break;
    case COURT:
    case ZOO:
    case BEEHIVE:
    case ANTHOLE:
    case COCKNEST:
    case LEPREHALL:
    case MORGUE:
    case BARRACKS:
      await fill_zoo(croom);
      break;
    }
  }
  switch (croom.rtype) {
  case VAULT:
    G.level.flags.has_vault = (TRUE) & 1;
    break;
  case ZOO:
    G.level.flags.has_zoo = (TRUE) & 1;
    break;
  case COURT:
    G.level.flags.has_court = (TRUE) & 1;
    break;
  case MORGUE:
    G.level.flags.has_morgue = (TRUE) & 1;
    break;
  case BEEHIVE:
    G.level.flags.has_beehive = (TRUE) & 1;
    break;
  case BARRACKS:
    G.level.flags.has_barracks = (TRUE) & 1;
    break;
  case TEMPLE:
    G.level.flags.has_temple = (TRUE) & 1;
    break;
  case SWAMP:
    G.level.flags.has_swamp = (TRUE) & 1;
    break;
  }
}

export async function build_room(r: struct__room | null, mkr: struct_mkroom | null): Promise<struct_mkroom | null> {
  let okroom = 0;
  let aroom = null;
  let rtype = (!r.chance || rn2(100) < r.chance ? r.rtype : OROOM) << 24 >> 24;
  if (mkr) {
    aroom = $sadd(G.subrooms, G.nsubroom);
    okroom = await create_subroom(mkr, r.x, r.y, r.w, r.h, rtype, r.rlit);
  } else {
    aroom = $sat(G.rooms, G.nroom);
    okroom = await create_room(r.x, r.y, r.w, r.h, r.xalign, r.yalign, rtype, r.rlit);
  }
  if (okroom) {
    topologize(aroom);
    aroom.needfill = r.filled;
    aroom.needjoining = r.joined;
    return aroom;
  }
  return null;
}

function light_region(tmpregion: struct_region | null): void {
  let litstate = (tmpregion.rlit ? 1 : 0) << 24 >> 24;
  let hiy = tmpregion.y2;
  let x = 0;
  let y = 0;
  let lev = null;
  let lowy = tmpregion.y1;
  let lowx = tmpregion.x1;
  let hix = tmpregion.x2;
  if (litstate) {
    lowx = lowx - 1 > 1 ? lowx - 1 : 1;
    hix = hix + 1 < 80 - 1 ? hix + 1 : 80 - 1;
    lowy = lowy - 1 > 0 ? lowy - 1 : 0;
    hiy = hiy + 1 < 21 - 1 ? hiy + 1 : 21 - 1;
  }
  for (x = lowx; x <= hix; ++x) {
    lev = $sat(G.level.locations[x], lowy);
    for (y = lowy; y <= hiy; ++y) {
      if (lev.typ !== LAVAPOOL) {
        lev.lit = (litstate >>> 0) & 1;
      }
      lev = $sadd(lev, 1);
    }
  }
}

function wallify_map(x1: number, y1: number, x2: number, y2: number): void {
  let x = 0;
  let y = 0;
  let xx = 0;
  let yy = 0;
  let lo_xx = 0;
  let lo_yy = 0;
  let hi_xx = 0;
  let hi_yy = 0;
  y1 = y1 > 0 ? y1 : 0;
  x1 = x1 > 1 ? x1 : 1;
  y2 = y2 < 21 - 1 ? y2 : 21 - 1;
  x2 = x2 < 80 - 1 ? x2 : 80 - 1;
  for (y = y1; y <= y2; ++y) {
    lo_yy = y > 0 ? y - 1 : 0;
    hi_yy = y < y2 ? y + 1 : y2;
    for (x = x1; x <= x2; ++x) {
      if ($at2(G.level.locations, x, y).typ !== STONE) {
        continue;
      }
      lo_xx = x > 1 ? x - 1 : 1;
      hi_xx = x < x2 ? x + 1 : x2;
      for (yy = lo_yy; yy <= hi_yy; ++yy) {
        for (xx = lo_xx; xx <= hi_xx; ++xx) {
          if ($at2(G.level.locations, xx, yy).typ >= ROOM || $at2(G.level.locations, xx, yy).typ === CROSSWALL) {
            $at2(G.level.locations, x, y).typ = (yy !== y ? HWALL : VWALL) << 24 >> 24;
            yy = hi_yy;
            break;
          }
        }
      }
    }
  }
}

function maze1xy(m: struct_nhcoord | null, humidity: number): void {
  let x = 0;
  let y = 0;
  let tryct = 2000;
  do {
    x = rn2(G.x_maze_max - 3) + 3;
    y = rn2(G.y_maze_max - 3) + 3;
    if (--tryct < 0) {
      break;
    }
  } while (!(x % 2) || !(y % 2) || SpLev_Map[x][y] || !is_ok_location(x << 24 >> 24, y << 24 >> 24, humidity));
  m.x = x << 24 >> 24, m.y = y << 24 >> 24;
}

async function fill_empty_maze(): Promise<void> {
  let mapcountmax = 0;
  let mapcount = 0;
  let mapfact = 0;
  let x = 0;
  let y = 0;
  let mm = new struct_nhcoord();
  mapcountmax = mapcount = Math.imul(G.x_maze_max - 2, G.y_maze_max - 2);
  mapcountmax = mapcountmax / 2 | 0;
  for (x = 2; x < G.x_maze_max; x = x + 1 << 24 >> 24) {
    for (y = 0; y < G.y_maze_max; y = y + 1 << 24 >> 24) {
      if (SpLev_Map[x][y]) {
        --mapcount;
      }
    }
  }
  if (mapcount > (mapcountmax / 10 | 0)) {
    mapfact = Math.trunc(mapcount * 100 / mapcountmax) | 0;
    for (x = rnd(20 * mapfact / 100 | 0) << 24 >> 24; x; x = x - 1 << 24 >> 24) {
      maze1xy(mm, DRY);
      await mkobj_at(rn2(2) ? GEM_CLASS : RANDOM_CLASS, mm.x, mm.y, TRUE);
    }
    for (x = rnd(12 * mapfact / 100 | 0) << 24 >> 24; x; x = x - 1 << 24 >> 24) {
      maze1xy(mm, DRY);
      await mksobj_at(BOULDER, mm.x, mm.y, TRUE, FALSE);
    }
    for (x = rn2(2) << 24 >> 24; x; x = x - 1 << 24 >> 24) {
      maze1xy(mm, DRY);
      await makemon($sat(G.mons, PM_MINOTAUR), mm.x, mm.y, NO_MM_FLAGS);
    }
    for (x = rnd(12 * mapfact / 100 | 0) << 24 >> 24; x; x = x - 1 << 24 >> 24) {
      maze1xy(mm, DRY);
      await makemon(null, mm.x, mm.y, NO_MM_FLAGS);
    }
    for (x = rn2(15 * mapfact / 100 | 0) << 24 >> 24; x; x = x - 1 << 24 >> 24) {
      maze1xy(mm, DRY);
      await mkgold(0, mm.x, mm.y);
    }
    for (x = rn2(15 * mapfact / 100 | 0) << 24 >> 24; x; x = x - 1 << 24 >> 24) {
      let trytrap = 0;
      maze1xy(mm, DRY);
      trytrap = rndtrap();
      if (sobj_at(BOULDER, mm.x, mm.y)) {
        while (trytrap === PIT || trytrap === SPIKED_PIT || (trytrap === HOLE || trytrap === TRAPDOOR)) {
          trytrap = rndtrap();
        }
      }
      await maketrap(mm.x, mm.y, trytrap);
    }
  }
}

async function sp_level_loader(fd: struct_dlb_handle | null, lvl: struct_sp_lev | null): Promise<number> {
  let n_opcode = 0;
  let opdat = null;
  let opcode = 0;
  dlb_fread(P(lvl, "n_opcodes"), 1, 8, fd);
  lvl.opcodes = $sarr(struct__opcode, (16 * $u64(lvl.n_opcodes) >>> 0) / 16)[0];
  while (n_opcode < lvl.n_opcodes) {
    dlb_fread(P($sadd(lvl.opcodes, n_opcode), "opcode"), 1, 4, fd);
    opcode = $sadd(lvl.opcodes, n_opcode).opcode;
    opdat = null;
    if (opcode < SPO_NULL || opcode >= MAX_SP_OPCODES) {
      await panic(S("sp_level_loader: impossible opcode %i."), opcode);
    }
    if (opcode === SPO_PUSH) {
      const nsize = new Int32Array(1);
      let ov = new struct_opvar();
      opdat = ov;
      ov.spovartyp = SPO_NULL;
      ov.vardata.l = 0;
      dlb_fread(P(ov, "spovartyp"), 1, 1, fd);
      switch (ov.spovartyp) {
      case 0:
        break;
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 1:
        dlb_fread(P(ov.vardata, "l"), 1, 8, fd);
        break;
      case 3:
      case 2:
      case 9:
        {
          let opd = null;
          dlb_fread(P(nsize, 0), 1, 4, fd);
          opd = P(new Int8Array((nsize[0] + 1 >>> 0)));
          if (nsize[0]) {
            dlb_fread(opd, 1, nsize[0], fd);
          }
          opd.a[opd.o + nsize[0]] = 0;
          ov.vardata.str = opd;
          break;
        }
      default:
        await panic(S("sp_level_loader: unknown opvar type %i"), ov.spovartyp);
      }
    }
    $sadd(lvl.opcodes, n_opcode).opdat = opdat;
    ++n_opcode;
  }
  return TRUE;
}

async function sp_level_free(lvl: struct_sp_lev | null): Promise<number> {
  let n_opcode = 0;
  while (n_opcode < lvl.n_opcodes) {
    let opcode = $sadd(lvl.opcodes, n_opcode).opcode;
    let opdat = $sadd(lvl.opcodes, n_opcode).opdat;
    if (opcode < SPO_NULL || opcode >= MAX_SP_OPCODES) {
      await panic(S("sp_level_free: unknown opcode %i"), opcode);
    }
    if (opdat) {
      do {
        if (opdat) {
          await opvar_free_x(opdat);
          opdat = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(sp_level_free$nhFunc));
        }
      } while (0);
    }
    ++n_opcode;
  }
  if (lvl.opcodes) {
    free(lvl.opcodes);
  }
  lvl.opcodes = null;
  return TRUE;
}

export async function splev_initlev(linit: struct_lev_init | null): Promise<void> {
  switch (linit.init_style) {
  default:
    await impossible(S("Unrecognized level init style."));
    break;
  case LVLINIT_NONE:
    break;
  case LVLINIT_SOLIDFILL:
    if (linit.lit === -1) {
      linit.lit = rn2(2) << 24 >> 24;
    }
    lvlfill_solid(linit.filling, linit.lit);
    break;
  case LVLINIT_MAZEGRID:
    lvlfill_maze_grid(2, 0, G.x_maze_max, G.y_maze_max, linit.filling);
    break;
  case LVLINIT_ROGUE:
    await makeroguerooms();
    break;
  case LVLINIT_MINES:
    if (linit.lit === -1) {
      linit.lit = rn2(2) << 24 >> 24;
    }
    if (linit.filling > -1) {
      lvlfill_solid(linit.filling, 0);
    }
    linit.icedpools = icedpools;
    await mkmap(linit);
    break;
  }
}

export async function frame_new(execptr: number): Promise<struct_sp_frame | null> {
  let frame = new struct_sp_frame();
  frame.next = null;
  frame.variables = null;
  frame.n_opcode = execptr;
  frame.stack = new struct_splevstack();
  await splev_stack_init(frame.stack);
  return frame;
}

export async function frame_del(frame: struct_sp_frame | null): Promise<void> {
  if (!frame) {
    return;
  }
  if (frame.stack) {
    splev_stack_done(frame.stack);
    frame.stack = null;
  }
  if (frame.variables) {
    await variable_list_del(frame.variables);
    frame.variables = null;
  }
  if (frame) {
    free(frame);
  }
}

export async function spo_frame_push(coder: struct_sp_coder | null): Promise<void> {
  let tmpframe = await frame_new(coder.frame.n_opcode);
  tmpframe.next = coder.frame;
  coder.frame = tmpframe;
}

export async function spo_frame_pop(coder: struct_sp_coder | null): Promise<void> {
  if (coder.frame && coder.frame.next) {
    let tmpframe = coder.frame.next;
    await frame_del(coder.frame);
    coder.frame = tmpframe;
    coder.stack = coder.frame.stack;
  }
}

export function sp_code_jmpaddr(curpos: number, jmpaddr: number): number {
  return curpos + jmpaddr;
}

export async function spo_call(coder: struct_sp_coder | null): Promise<void> {
  let addr = null;
  let params = null;
  let tmpframe = null;
  if (!(addr = await splev_stack_getdat(coder, 1)) || !(params = await splev_stack_getdat(coder, 1))) {
    return;
  }
  if (params.vardata.l < 0) {
    return;
  }
  tmpframe = await frame_new(sp_code_jmpaddr(coder.frame.n_opcode, addr.vardata.l - 1));
  while (params.vardata.l-- > 0) {
    await splev_stack_push(tmpframe.stack, await splev_stack_getdat_any(coder));
  }
  await splev_stack_reverse(tmpframe.stack);
  tmpframe.next = coder.frame;
  coder.frame = tmpframe;
  do {
    if (addr) {
      await opvar_free_x(addr);
      addr = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_call$nhFunc));
    }
  } while (0);
  do {
    if (params) {
      await opvar_free_x(params);
      params = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_call$nhFunc));
    }
  } while (0);
}

export async function spo_return(coder: struct_sp_coder | null): Promise<void> {
  let params = null;
  if (!coder.frame || !coder.frame.next) {
    await panic(S("return: no frame."));
  }
  if (!(params = await splev_stack_getdat(coder, 1))) {
    return;
  }
  if (params.vardata.l < 0) {
    return;
  }
  while (params.vardata.l-- > 0) {
    await splev_stack_push(coder.frame.next.stack, await splev_stack_pop(coder.stack));
  }
  if (coder.frame.next) {
    let tmpframe = coder.frame.next;
    await frame_del(coder.frame);
    coder.frame = tmpframe;
    coder.stack = coder.frame.stack;
  }
  do {
    if (params) {
      await opvar_free_x(params);
      params = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_return$nhFunc));
    }
  } while (0);
}

export async function spo_end_moninvent(coder: struct_sp_coder | null): Promise<void> {
  if (invent_carrying_monster) {
    await m_dowear(invent_carrying_monster, TRUE);
  }
  invent_carrying_monster = null;
}

export function spo_pop_container(coder: struct_sp_coder | null): void {
  if (container_idx > 0) {
    --container_idx;
    container_obj[container_idx] = null;
  }
}

export async function spo_message(coder: struct_sp_coder | null): Promise<void> {
  let op = null;
  let msg = null;
  let levmsg = null;
  let old_n = 0;
  let n = 0;
  if (!(op = await splev_stack_getdat(coder, 2))) {
    return;
  }
  msg = op.vardata.str;
  if (!msg) {
    return;
  }
  old_n = (G.lev_message ? strlen(G.lev_message) + 1 : 0) | 0;
  n = strlen(msg) | 0;
  levmsg = P(new Int8Array((old_n + n + 1 >>> 0)));
  if (old_n) {
    levmsg.a[levmsg.o + (old_n - 1)] = 10;
  }
  if (G.lev_message) {
    memcpy(levmsg, G.lev_message, $u64(old_n - 1));
  }
  memcpy(levmsg.add(old_n), msg, $u64(n));
  levmsg.a[levmsg.o + (old_n + n)] = 0;
  if (G.lev_message) {
    free(G.lev_message);
  }
  G.lev_message = levmsg;
  do {
    if (op) {
      await opvar_free_x(op);
      op = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_message$nhFunc));
    }
  } while (0);
}

export async function spo_monster(coder: struct_sp_coder | null): Promise<void> {
  let nparams = 0;
  let varparam = null;
  let id = null;
  let mcoord = null;
  let has_inv = null;
  let tmpmons = new struct_monster();
  tmpmons.peaceful = -1;
  tmpmons.asleep = -1;
  tmpmons.name.str = null;
  tmpmons.appear = 0;
  tmpmons.appear_as.str = null;
  tmpmons.align = -MAX_REGISTERS - 2;
  tmpmons.female = 0;
  tmpmons.invis = 0;
  tmpmons.cancelled = 0;
  tmpmons.revived = 0;
  tmpmons.avenge = 0;
  tmpmons.fleeing = 0;
  tmpmons.blinded = 0;
  tmpmons.paralyzed = 0;
  tmpmons.stunned = 0;
  tmpmons.confused = 0;
  tmpmons.seentraps = 0;
  tmpmons.has_invent = 0;
  if (!(has_inv = await splev_stack_getdat(coder, 1))) {
    return;
  }
  if (!(varparam = await splev_stack_getdat(coder, 1))) {
    return;
  }
  while (nparams++ < SP_M_V_END + 1 && varparam.spovartyp === SPOVAR_INT && varparam.vardata.l >= 0 && varparam.vardata.l < SP_M_V_END) {
    let parm = null;
    parm = await splev_stack_getdat_any(coder);
    switch (varparam.vardata.l) {
    case SP_M_V_NAME:
      if (parm.spovartyp === SPOVAR_STRING && !tmpmons.name.str) {
        tmpmons.name.str = await dupstr(parm.vardata.str);
      }
      break;
    case SP_M_V_APPEAR:
      if (parm.spovartyp === SPOVAR_INT && !tmpmons.appear_as.str) {
        tmpmons.appear = parm.vardata.l << 24 >> 24;
        do {
          if (parm) {
            await opvar_free_x(parm);
            parm = null;
          } else {
            await impossible(S("opvar_free(), %s"), P(spo_monster$nhFunc));
          }
        } while (0);
        parm = await splev_stack_getdat_any(coder);
        tmpmons.appear_as.str = await dupstr(parm.vardata.str);
      }
      break;
    case SP_M_V_ASLEEP:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.asleep = parm.vardata.l << 24 >> 24;
      }
      break;
    case SP_M_V_ALIGN:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.align = parm.vardata.l << 24 >> 24;
      }
      break;
    case SP_M_V_PEACEFUL:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.peaceful = parm.vardata.l << 24 >> 24;
      }
      break;
    case SP_M_V_FEMALE:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.female = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_INVIS:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.invis = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_CANCELLED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.cancelled = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_REVIVED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.revived = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_AVENGE:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.avenge = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_FLEEING:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.fleeing = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_BLINDED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.blinded = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_PARALYZED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.paralyzed = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_STUNNED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.stunned = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_CONFUSED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.confused = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_M_V_SEENTRAPS:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpmons.seentraps = parm.vardata.l;
      }
      break;
    case SP_M_V_END:
      nparams = SP_M_V_END + 1;
      break;
    default:
      await impossible(S("MONSTER with unknown variable param type!"));
      break;
    }
    do {
      if (parm) {
        await opvar_free_x(parm);
        parm = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_monster$nhFunc));
      }
    } while (0);
    if (varparam.vardata.l !== SP_M_V_END) {
      do {
        if (varparam) {
          await opvar_free_x(varparam);
          varparam = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(spo_monster$nhFunc));
        }
      } while (0);
      varparam = await splev_stack_getdat_any(coder);
    }
  }
  if (!(mcoord = await splev_stack_getdat(coder, 4))) {
    await panic(S("no monster coord?"));
  }
  if (!(id = await splev_stack_getdat(coder, 7))) {
    await panic(S("no mon type"));
  }
  tmpmons.id = ($shr64(id.vardata.l, 8) & 65535) - 10 << 16 >> 16;
  tmpmons.class = (id.vardata.l & 255) << 24 >> 24;
  tmpmons.coord = mcoord.vardata.l;
  tmpmons.has_invent = has_inv.vardata.l << 16 >> 16;
  await create_monster(tmpmons, coder.croom);
  if (tmpmons.name.str) {
    free(tmpmons.name.str);
  }
  if (tmpmons.appear_as.str) {
    free(tmpmons.appear_as.str);
  }
  do {
    if (id) {
      await opvar_free_x(id);
      id = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_monster$nhFunc));
    }
  } while (0);
  do {
    if (mcoord) {
      await opvar_free_x(mcoord);
      mcoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_monster$nhFunc));
    }
  } while (0);
  do {
    if (has_inv) {
      await opvar_free_x(has_inv);
      has_inv = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_monster$nhFunc));
    }
  } while (0);
  do {
    if (varparam) {
      await opvar_free_x(varparam);
      varparam = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_monster$nhFunc));
    }
  } while (0);
}

export async function spo_object(coder: struct_sp_coder | null): Promise<void> {
  let nparams = 0;
  let quancnt = 0;
  let varparam = null;
  let id = null;
  let containment = null;
  let tmpobj = new struct_object();
  tmpobj.spe = -127;
  tmpobj.curse_state = -1;
  tmpobj.corpsenm = NON_PM;
  tmpobj.name.str = null;
  tmpobj.quan = -1;
  tmpobj.buried = 0;
  tmpobj.lit = 0;
  tmpobj.eroded = 0;
  tmpobj.locked = 0;
  tmpobj.trapped = -1;
  tmpobj.recharged = 0;
  tmpobj.invis = 0;
  tmpobj.greased = 0;
  tmpobj.broken = 0;
  tmpobj.coord = 16777216 | 0;
  if (!(containment = await splev_stack_getdat(coder, 1))) {
    return;
  }
  if (!(varparam = await splev_stack_getdat(coder, 1))) {
    return;
  }
  while (nparams++ < SP_O_V_END + 1 && varparam.spovartyp === SPOVAR_INT && varparam.vardata.l >= 0 && varparam.vardata.l < SP_O_V_END) {
    let parm = null;
    parm = await splev_stack_getdat_any(coder);
    switch (varparam.vardata.l) {
    case SP_O_V_NAME:
      if (parm.spovartyp === SPOVAR_STRING && !tmpobj.name.str) {
        tmpobj.name.str = await dupstr(parm.vardata.str);
      }
      break;
    case SP_O_V_CORPSENM:
      if (parm.spovartyp === SPOVAR_MONST) {
        let monclass = (parm.vardata.l & 255) << 24 >> 24;
        let monid = ($shr64(parm.vardata.l, 8) & 65535) - 10 | 0;
        if (monid >= LOW_PM && monid < NUMMONS) {
          tmpobj.corpsenm = monid;
          break;
        } else {
          let pm = null;
          if (def_char_to_monclass(monclass) !== MAXMCLASSES) {
            pm = await mkclass(def_char_to_monclass(monclass), G_NOGEN);
          } else {
            pm = await rndmonst();
          }
          if (pm) {
            tmpobj.corpsenm = await monsndx(pm);
          }
        }
      }
      break;
    case SP_O_V_CURSE:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.curse_state = parm.vardata.l << 24 >> 24;
      }
      break;
    case SP_O_V_SPE:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.spe = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_QUAN:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.quan = parm.vardata.l | 0;
      }
      break;
    case SP_O_V_BURIED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.buried = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_LIT:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.lit = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_ERODED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.eroded = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_LOCKED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.locked = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_TRAPPED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.trapped = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_RECHARGED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.recharged = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_INVIS:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.invis = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_GREASED:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.greased = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_BROKEN:
      if (parm.spovartyp === SPOVAR_INT) {
        tmpobj.broken = parm.vardata.l << 16 >> 16;
      }
      break;
    case SP_O_V_COORD:
      if (parm.spovartyp !== SPOVAR_COORD) {
        await panic(S("no coord for obj?"));
      }
      tmpobj.coord = parm.vardata.l;
      break;
    case SP_O_V_END:
      nparams = SP_O_V_END + 1;
      break;
    default:
      await impossible(S("OBJECT with unknown variable param type!"));
      break;
    }
    do {
      if (parm) {
        await opvar_free_x(parm);
        parm = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_object$nhFunc));
      }
    } while (0);
    if (varparam.vardata.l !== SP_O_V_END) {
      do {
        if (varparam) {
          await opvar_free_x(varparam);
          varparam = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(spo_object$nhFunc));
        }
      } while (0);
      varparam = await splev_stack_getdat_any(coder);
    }
  }
  if (!(id = await splev_stack_getdat(coder, 8))) {
    await panic(S("no obj type"));
  }
  tmpobj.id = ($shr64(id.vardata.l, 8) & 65535) - 10 << 16 >> 16;
  tmpobj.class = (id.vardata.l & 255) << 24 >> 24;
  tmpobj.containment = containment.vardata.l << 24 >> 24;
  quancnt = tmpobj.id > STRANGE_OBJECT ? tmpobj.quan : 0;
  do {
    await create_object(tmpobj, coder.croom);
    --quancnt;
  } while (quancnt > 0 && (tmpobj.id > STRANGE_OBJECT && !G.objects[tmpobj.id].oc_merge));
  if (tmpobj.name.str) {
    free(tmpobj.name.str);
  }
  do {
    if (varparam) {
      await opvar_free_x(varparam);
      varparam = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_object$nhFunc));
    }
  } while (0);
  do {
    if (id) {
      await opvar_free_x(id);
      id = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_object$nhFunc));
    }
  } while (0);
  do {
    if (containment) {
      await opvar_free_x(containment);
      containment = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_object$nhFunc));
    }
  } while (0);
}

export async function spo_level_flags(coder: struct_sp_coder | null): Promise<void> {
  let flagdata = null;
  let lflags = 0;
  if (!(flagdata = await splev_stack_getdat(coder, 1))) {
    return;
  }
  lflags = flagdata.vardata.l;
  if (lflags & NOTELEPORT) {
    G.level.flags.noteleport = 1;
  }
  if (lflags & HARDFLOOR) {
    G.level.flags.hardfloor = 1;
  }
  if (lflags & NOMMAP) {
    G.level.flags.nommap = 1;
  }
  if (lflags & SHORTSIGHTED) {
    G.level.flags.shortsighted = 1;
  }
  if (lflags & ARBOREAL) {
    G.level.flags.arboreal = 1;
  }
  if (lflags & MAZELEVEL) {
    G.level.flags.is_maze_lev = 1;
  }
  if (lflags & PREMAPPED) {
    coder.premapped = TRUE;
  }
  if (lflags & SHROUD) {
    G.level.flags.hero_memory = 0;
  }
  if (lflags & GRAVEYARD) {
    G.level.flags.graveyard = 1;
  }
  if (lflags & ICEDPOOLS) {
    icedpools = TRUE;
  }
  if (lflags & SOLIDIFY) {
    coder.solidify = TRUE;
  }
  if (lflags & CORRMAZE) {
    G.level.flags.corrmaze = (TRUE) & 1;
  }
  if (lflags & CHECK_INACCESSIBLES) {
    coder.check_inaccessibles = TRUE;
  }
  do {
    if (flagdata) {
      await opvar_free_x(flagdata);
      flagdata = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_level_flags$nhFunc));
    }
  } while (0);
}

export async function spo_initlevel(coder: struct_sp_coder | null): Promise<void> {
  let init_lev = new struct_lev_init();
  let init_style = null;
  let fg = null;
  let bg = null;
  let smoothed = null;
  let joined = null;
  let lit = null;
  let walled = null;
  let filling = null;
  if (!(fg = await splev_stack_getdat(coder, 1)) || !(bg = await splev_stack_getdat(coder, 1)) || !(smoothed = await splev_stack_getdat(coder, 1)) || !(joined = await splev_stack_getdat(coder, 1)) || !(lit = await splev_stack_getdat(coder, 1)) || !(walled = await splev_stack_getdat(coder, 1)) || !(filling = await splev_stack_getdat(coder, 1)) || !(init_style = await splev_stack_getdat(coder, 1))) {
    return;
  }
  splev_init_present = TRUE;
  init_lev.init_style = init_style.vardata.l << 24 >> 24;
  init_lev.fg = fg.vardata.l << 24 >> 24;
  init_lev.bg = bg.vardata.l << 24 >> 24;
  init_lev.smoothed = smoothed.vardata.l << 24 >> 24;
  init_lev.joined = joined.vardata.l << 24 >> 24;
  init_lev.lit = lit.vardata.l << 24 >> 24;
  init_lev.walled = walled.vardata.l << 24 >> 24;
  init_lev.filling = filling.vardata.l << 24 >> 24;
  coder.lvl_is_joined = joined.vardata.l | 0;
  await splev_initlev(init_lev);
  do {
    if (init_style) {
      await opvar_free_x(init_style);
      init_style = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_initlevel$nhFunc));
    }
  } while (0);
  do {
    if (fg) {
      await opvar_free_x(fg);
      fg = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_initlevel$nhFunc));
    }
  } while (0);
  do {
    if (bg) {
      await opvar_free_x(bg);
      bg = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_initlevel$nhFunc));
    }
  } while (0);
  do {
    if (smoothed) {
      await opvar_free_x(smoothed);
      smoothed = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_initlevel$nhFunc));
    }
  } while (0);
  do {
    if (joined) {
      await opvar_free_x(joined);
      joined = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_initlevel$nhFunc));
    }
  } while (0);
  do {
    if (lit) {
      await opvar_free_x(lit);
      lit = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_initlevel$nhFunc));
    }
  } while (0);
  do {
    if (walled) {
      await opvar_free_x(walled);
      walled = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_initlevel$nhFunc));
    }
  } while (0);
  do {
    if (filling) {
      await opvar_free_x(filling);
      filling = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_initlevel$nhFunc));
    }
  } while (0);
}

export async function spo_engraving(coder: struct_sp_coder | null): Promise<void> {
  let etyp = null;
  let txt = null;
  let ecoord = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  if (!(etyp = await splev_stack_getdat(coder, 1)) || !(txt = await splev_stack_getdat(coder, 2)) || !(ecoord = await splev_stack_getdat(coder, 4))) {
    return;
  }
  await get_location_coord(P(x, 0), P(y, 0), DRY, coder.croom, ecoord.vardata.l);
  await make_engr_at(x[0], y[0], txt.vardata.str, 0, etyp.vardata.l | 0);
  do {
    if (etyp) {
      await opvar_free_x(etyp);
      etyp = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_engraving$nhFunc));
    }
  } while (0);
  do {
    if (txt) {
      await opvar_free_x(txt);
      txt = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_engraving$nhFunc));
    }
  } while (0);
  do {
    if (ecoord) {
      await opvar_free_x(ecoord);
      ecoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_engraving$nhFunc));
    }
  } while (0);
}

export async function spo_mineralize(coder: struct_sp_coder | null): Promise<void> {
  let kelp_pool = null;
  let kelp_moat = null;
  let gold_prob = null;
  let gem_prob = null;
  if (!(gem_prob = await splev_stack_getdat(coder, 1)) || !(gold_prob = await splev_stack_getdat(coder, 1)) || !(kelp_moat = await splev_stack_getdat(coder, 1)) || !(kelp_pool = await splev_stack_getdat(coder, 1))) {
    return;
  }
  await mineralize(kelp_pool.vardata.l | 0, kelp_moat.vardata.l | 0, gold_prob.vardata.l | 0, gem_prob.vardata.l | 0, TRUE);
  do {
    if (gem_prob) {
      await opvar_free_x(gem_prob);
      gem_prob = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_mineralize$nhFunc));
    }
  } while (0);
  do {
    if (gold_prob) {
      await opvar_free_x(gold_prob);
      gold_prob = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_mineralize$nhFunc));
    }
  } while (0);
  do {
    if (kelp_moat) {
      await opvar_free_x(kelp_moat);
      kelp_moat = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_mineralize$nhFunc));
    }
  } while (0);
  do {
    if (kelp_pool) {
      await opvar_free_x(kelp_pool);
      kelp_pool = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_mineralize$nhFunc));
    }
  } while (0);
}

export async function spo_room(coder: struct_sp_coder | null): Promise<void> {
  if (coder.n_subroom > MAX_NESTED_ROOMS) {
    await panic(S("Too deeply nested rooms?!"));
  } else {
    let rflags = null;
    let h = null;
    let w = null;
    let yalign = null;
    let xalign = null;
    let y = null;
    let x = null;
    let rlit = null;
    let chance = null;
    let rtype = null;
    let tmproom = new struct__room();
    let tmpcr = null;
    if (!(h = await splev_stack_getdat(coder, 1)) || !(w = await splev_stack_getdat(coder, 1)) || !(y = await splev_stack_getdat(coder, 1)) || !(x = await splev_stack_getdat(coder, 1)) || !(yalign = await splev_stack_getdat(coder, 1)) || !(xalign = await splev_stack_getdat(coder, 1)) || !(rflags = await splev_stack_getdat(coder, 1)) || !(rlit = await splev_stack_getdat(coder, 1)) || !(chance = await splev_stack_getdat(coder, 1)) || !(rtype = await splev_stack_getdat(coder, 1))) {
      return;
    }
    tmproom.x = x.vardata.l << 24 >> 24;
    tmproom.y = y.vardata.l << 24 >> 24;
    tmproom.w = w.vardata.l << 24 >> 24;
    tmproom.h = h.vardata.l << 24 >> 24;
    tmproom.xalign = xalign.vardata.l << 24 >> 24;
    tmproom.yalign = yalign.vardata.l << 24 >> 24;
    tmproom.rtype = rtype.vardata.l << 24 >> 24;
    tmproom.chance = chance.vardata.l << 24 >> 24;
    tmproom.rlit = rlit.vardata.l << 24 >> 24;
    tmproom.filled = (rflags.vardata.l & 1 << 0) << 24 >> 24;
    tmproom.joined = (!(rflags.vardata.l & 1 << 2) ? 1 : 0) << 24 >> 24;
    do {
      if (x) {
        await opvar_free_x(x);
        x = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    do {
      if (y) {
        await opvar_free_x(y);
        y = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    do {
      if (w) {
        await opvar_free_x(w);
        w = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    do {
      if (h) {
        await opvar_free_x(h);
        h = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    do {
      if (xalign) {
        await opvar_free_x(xalign);
        xalign = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    do {
      if (yalign) {
        await opvar_free_x(yalign);
        yalign = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    do {
      if (rtype) {
        await opvar_free_x(rtype);
        rtype = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    do {
      if (chance) {
        await opvar_free_x(chance);
        chance = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    do {
      if (rlit) {
        await opvar_free_x(rlit);
        rlit = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    do {
      if (rflags) {
        await opvar_free_x(rflags);
        rflags = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_room$nhFunc));
      }
    } while (0);
    if (!coder.failed_room[coder.n_subroom - 1]) {
      tmpcr = await build_room(tmproom, coder.croom);
      if (tmpcr) {
        coder.tmproomlist[coder.n_subroom] = tmpcr;
        coder.failed_room[coder.n_subroom] = FALSE;
        ++coder.n_subroom;
        return;
      }
    }
  }
  coder.tmproomlist[coder.n_subroom] = null;
  coder.failed_room[coder.n_subroom] = TRUE;
  ++coder.n_subroom;
}

export function spo_endroom(coder: struct_sp_coder | null): void {
  if (coder.n_subroom > 1) {
    --coder.n_subroom;
    coder.tmproomlist[coder.n_subroom] = null;
    coder.failed_room[coder.n_subroom] = TRUE;
  } else {
    if (xsize <= 1 && ysize <= 1) {
      xstart = 1;
      ystart = 0;
      xsize = COLNO - 1;
      ysize = ROWNO;
    }
  }
}

export async function spo_stair(coder: struct_sp_coder | null): Promise<void> {
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let up = null;
  let scoord = null;
  let badtrap = null;
  if (!(up = await splev_stack_getdat(coder, 1)) || !(scoord = await splev_stack_getdat(coder, 4))) {
    return;
  }
  await get_location_coord(P(x, 0), P(y, 0), DRY, coder.croom, scoord.vardata.l);
  if (!!(badtrap = t_at(x[0], y[0]))) {
    await deltrap(badtrap);
  }
  await mkstairs(x[0], y[0], up.vardata.l << 24 >> 24, coder.croom);
  SpLev_Map[x[0]][y[0]] = 1;
  do {
    if (scoord) {
      await opvar_free_x(scoord);
      scoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_stair$nhFunc));
    }
  } while (0);
  do {
    if (up) {
      await opvar_free_x(up);
      up = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_stair$nhFunc));
    }
  } while (0);
}

export async function spo_ladder(coder: struct_sp_coder | null): Promise<void> {
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let up = null;
  let lcoord = null;
  if (!(up = await splev_stack_getdat(coder, 1)) || !(lcoord = await splev_stack_getdat(coder, 4))) {
    return;
  }
  await get_location_coord(P(x, 0), P(y, 0), DRY, coder.croom, lcoord.vardata.l);
  $at2(G.level.locations, x[0], y[0]).typ = LADDER;
  SpLev_Map[x[0]][y[0]] = 1;
  if (up.vardata.l) {
    G.upladder.sx = x[0];
    G.upladder.sy = y[0];
    $at2(G.level.locations, x[0], y[0]).flags = (LA_UP) & 31;
  } else {
    G.dnladder.sx = x[0];
    G.dnladder.sy = y[0];
    $at2(G.level.locations, x[0], y[0]).flags = (LA_DOWN) & 31;
  }
  do {
    if (lcoord) {
      await opvar_free_x(lcoord);
      lcoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_ladder$nhFunc));
    }
  } while (0);
  do {
    if (up) {
      await opvar_free_x(up);
      up = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_ladder$nhFunc));
    }
  } while (0);
}

export async function spo_grave(coder: struct_sp_coder | null): Promise<void> {
  let gcoord = null;
  let typ = null;
  let txt = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  if (!(typ = await splev_stack_getdat(coder, 1)) || !(txt = await splev_stack_getdat(coder, 2)) || !(gcoord = await splev_stack_getdat(coder, 4))) {
    return;
  }
  await get_location_coord(P(x, 0), P(y, 0), DRY, coder.croom, gcoord.vardata.l);
  if (isok(x[0], y[0]) && !t_at(x[0], y[0])) {
    $at2(G.level.locations, x[0], y[0]).typ = GRAVE;
    switch (typ.vardata.l) {
    case 2:
      await make_grave(x[0], y[0], txt.vardata.str);
      break;
    case 1:
      await make_grave(x[0], y[0], null);
      break;
    default:
      await del_engr_at(x[0], y[0]);
      break;
    }
  }
  do {
    if (gcoord) {
      await opvar_free_x(gcoord);
      gcoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_grave$nhFunc));
    }
  } while (0);
  do {
    if (typ) {
      await opvar_free_x(typ);
      typ = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_grave$nhFunc));
    }
  } while (0);
  do {
    if (txt) {
      await opvar_free_x(txt);
      txt = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_grave$nhFunc));
    }
  } while (0);
}

export async function spo_altar(coder: struct_sp_coder | null): Promise<void> {
  let al = null;
  let shrine = null;
  let acoord = null;
  let tmpaltar = new struct_altar();
  if (!(al = await splev_stack_getdat(coder, 1)) || !(shrine = await splev_stack_getdat(coder, 1)) || !(acoord = await splev_stack_getdat(coder, 4))) {
    return;
  }
  tmpaltar.coord = acoord.vardata.l;
  tmpaltar.align = al.vardata.l << 24 >> 24;
  tmpaltar.shrine = shrine.vardata.l << 24 >> 24;
  await create_altar(tmpaltar, coder.croom);
  do {
    if (acoord) {
      await opvar_free_x(acoord);
      acoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_altar$nhFunc));
    }
  } while (0);
  do {
    if (shrine) {
      await opvar_free_x(shrine);
      shrine = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_altar$nhFunc));
    }
  } while (0);
  do {
    if (al) {
      await opvar_free_x(al);
      al = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_altar$nhFunc));
    }
  } while (0);
}

export async function spo_trap(coder: struct_sp_coder | null): Promise<void> {
  let type = null;
  let tcoord = null;
  let tmptrap = new struct_spltrap();
  if (!(type = await splev_stack_getdat(coder, 1)) || !(tcoord = await splev_stack_getdat(coder, 4))) {
    return;
  }
  tmptrap.coord = tcoord.vardata.l;
  tmptrap.type = type.vardata.l << 24 >> 24;
  await create_trap(tmptrap, coder.croom);
  do {
    if (tcoord) {
      await opvar_free_x(tcoord);
      tcoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_trap$nhFunc));
    }
  } while (0);
  do {
    if (type) {
      await opvar_free_x(type);
      type = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_trap$nhFunc));
    }
  } while (0);
}

export async function spo_gold(coder: struct_sp_coder | null): Promise<void> {
  let gcoord = null;
  let amt = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let amount = 0;
  if (!(gcoord = await splev_stack_getdat(coder, 4)) || !(amt = await splev_stack_getdat(coder, 1))) {
    return;
  }
  amount = amt.vardata.l;
  await get_location_coord(P(x, 0), P(y, 0), DRY, coder.croom, gcoord.vardata.l);
  if (amount === -1) {
    amount = rnd(200);
  }
  await mkgold(amount, x[0], y[0]);
  do {
    if (gcoord) {
      await opvar_free_x(gcoord);
      gcoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_gold$nhFunc));
    }
  } while (0);
  do {
    if (amt) {
      await opvar_free_x(amt);
      amt = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_gold$nhFunc));
    }
  } while (0);
}

export async function spo_corridor(coder: struct_sp_coder | null): Promise<void> {
  let deswall = null;
  let desdoor = null;
  let desroom = null;
  let srcwall = null;
  let srcdoor = null;
  let srcroom = null;
  let tc = new struct_corridor();
  if (!(deswall = await splev_stack_getdat(coder, 1)) || !(desdoor = await splev_stack_getdat(coder, 1)) || !(desroom = await splev_stack_getdat(coder, 1)) || !(srcwall = await splev_stack_getdat(coder, 1)) || !(srcdoor = await splev_stack_getdat(coder, 1)) || !(srcroom = await splev_stack_getdat(coder, 1))) {
    return;
  }
  tc.src.room = srcroom.vardata.l << 24 >> 24;
  tc.src.door = srcdoor.vardata.l << 24 >> 24;
  tc.src.wall = srcwall.vardata.l << 24 >> 24;
  tc.dest.room = desroom.vardata.l << 24 >> 24;
  tc.dest.door = desdoor.vardata.l << 24 >> 24;
  tc.dest.wall = deswall.vardata.l << 24 >> 24;
  await create_corridor(tc);
  do {
    if (deswall) {
      await opvar_free_x(deswall);
      deswall = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_corridor$nhFunc));
    }
  } while (0);
  do {
    if (desdoor) {
      await opvar_free_x(desdoor);
      desdoor = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_corridor$nhFunc));
    }
  } while (0);
  do {
    if (desroom) {
      await opvar_free_x(desroom);
      desroom = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_corridor$nhFunc));
    }
  } while (0);
  do {
    if (srcwall) {
      await opvar_free_x(srcwall);
      srcwall = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_corridor$nhFunc));
    }
  } while (0);
  do {
    if (srcdoor) {
      await opvar_free_x(srcdoor);
      srcdoor = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_corridor$nhFunc));
    }
  } while (0);
  do {
    if (srcroom) {
      await opvar_free_x(srcroom);
      srcroom = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_corridor$nhFunc));
    }
  } while (0);
}

export async function selection_opvar(nbuf: Ptr | null): Promise<struct_opvar | null> {
  let ov = null;
  let buf = new Int8Array(1681);
  if (!nbuf) {
    memset(P(buf), 1, 1681);
    buf[Math.imul(COLNO, ROWNO)] = 0;
    ov = await opvar_new_str(P(buf));
  } else {
    ov = await opvar_new_str(nbuf);
  }
  ov.spovartyp = SPOVAR_SEL;
  return ov;
}

export function selection_getpoint(x: number, y: number, ov: struct_opvar | null): number {
  if (!ov || ov.spovartyp !== SPOVAR_SEL) {
    return 0;
  }
  if (x < 0 || y < 0 || x >= COLNO || y >= ROWNO) {
    return 0;
  }
  return ov.vardata.str.a[ov.vardata.str.o + (Math.imul(COLNO, y) + x)] - 1 << 24 >> 24;
}

export function selection_setpoint(x: number, y: number, ov: struct_opvar | null, c: number): void {
  if (!ov || ov.spovartyp !== SPOVAR_SEL) {
    return;
  }
  if (x < 0 || y < 0 || x >= COLNO || y >= ROWNO) {
    return;
  }
  ov.vardata.str.a[ov.vardata.str.o + (Math.imul(COLNO, y) + x)] = c + 1 << 24 >> 24;
}

export async function selection_not(s: struct_opvar | null): Promise<struct_opvar | null> {
  let ov = null;
  let x = 0;
  let y = 0;
  ov = await selection_opvar(null);
  if (!ov) {
    return null;
  }
  for (x = 0; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if (!selection_getpoint(x, y, s)) {
        selection_setpoint(x, y, ov, 1);
      }
    }
  }
  return ov;
}

export async function selection_logical_oper(s1: struct_opvar | null, s2: struct_opvar | null, oper: number): Promise<struct_opvar | null> {
  let ov = null;
  let x = 0;
  let y = 0;
  ov = await selection_opvar(null);
  if (!ov) {
    return null;
  }
  for (x = 0; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      switch (oper) {
      default:
      case 124:
        if (selection_getpoint(x, y, s1) || selection_getpoint(x, y, s2)) {
          selection_setpoint(x, y, ov, 1);
        }
        break;
      case 38:
        if (selection_getpoint(x, y, s1) && selection_getpoint(x, y, s2)) {
          selection_setpoint(x, y, ov, 1);
        }
        break;
      }
    }
  }
  return ov;
}

export async function selection_filter_mapchar(ov: struct_opvar | null, mc: struct_opvar | null): Promise<struct_opvar | null> {
  let x = 0;
  let y = 0;
  let mapc = 0;
  let lit = 0;
  let ret = await selection_opvar(null);
  if (!ov || !mc || !ret) {
    return null;
  }
  mapc = (mc.vardata.l & 255) << 24 >> 24;
  lit = ($shr64(mc.vardata.l, 8) & 65535) - 10 << 24 >> 24;
  for (x = 0; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if (selection_getpoint(x, y, ov) && $at2(G.level.locations, x, y).typ === mapc) {
        switch (lit) {
        default:
        case -2:
          selection_setpoint(x, y, ret, 1);
          break;
        case -1:
          selection_setpoint(x, y, ret, rn2(2));
          break;
        case 0:
        case 1:
          if (($at2(G.level.locations, x, y).lit | 0) === lit) {
            selection_setpoint(x, y, ret, 1);
          }
          break;
        }
      }
    }
  }
  return ret;
}

export function selection_filter_percent(ov: struct_opvar | null, percent: number): void {
  let x = 0;
  let y = 0;
  if (!ov) {
    return;
  }
  for (x = 0; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if (selection_getpoint(x, y, ov) && rn2(100) >= percent) {
        selection_setpoint(x, y, ov, 0);
      }
    }
  }
}

function selection_rndcoord(ov: struct_opvar | null, x: Ptr | null, y: Ptr | null, removeit: number): number {
  let idx = 0;
  let c = 0;
  let dx = 0;
  let dy = 0;
  for (dx = 0; dx < COLNO; ++dx) {
    for (dy = 0; dy < ROWNO; ++dy) {
      if (isok(dx, dy) && selection_getpoint(dx, dy, ov)) {
        ++idx;
      }
    }
  }
  if (idx) {
    c = rn2(idx);
    for (dx = 0; dx < COLNO; ++dx) {
      for (dy = 0; dy < ROWNO; ++dy) {
        if (isok(dx, dy) && selection_getpoint(dx, dy, ov)) {
          if (!c) {
            x.a[x.o] = dx << 24 >> 24;
            y.a[y.o] = dy << 24 >> 24;
            if (removeit) {
              selection_setpoint(dx, dy, ov, 0);
            }
            return 1;
          }
          --c;
        }
      }
    }
  }
  x.a[x.o] = y.a[y.o] = -1;
  return 0;
}

export function selection_do_grow(ov: struct_opvar | null, dir: number): void {
  let x = 0;
  let y = 0;
  let tmp = $arr(80, () => new Int8Array(21));
  if (ov.spovartyp !== SPOVAR_SEL) {
    return;
  }
  if (!ov) {
    return;
  }
  memset(P(tmp), 0, 1680);
  for (x = 1; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if (dir & W_WEST && selection_getpoint(x + 1, y, ov) || (dir & (W_WEST | W_NORTH)) === (W_WEST | W_NORTH) && selection_getpoint(x + 1, y + 1, ov) || dir & W_NORTH && selection_getpoint(x, y + 1, ov) || (dir & (W_NORTH | W_EAST)) === (W_NORTH | W_EAST) && selection_getpoint(x - 1, y + 1, ov) || dir & W_EAST && selection_getpoint(x - 1, y, ov) || (dir & (W_EAST | W_SOUTH)) === (W_EAST | W_SOUTH) && selection_getpoint(x - 1, y - 1, ov) || dir & W_SOUTH && selection_getpoint(x, y - 1, ov) || (dir & (W_SOUTH | W_WEST)) === (W_SOUTH | W_WEST) && selection_getpoint(x + 1, y - 1, ov)) {
        tmp[x][y] = 1;
      }
    }
  }
  for (x = 1; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if (tmp[x][y]) {
        selection_setpoint(x, y, ov, 1);
      }
    }
  }
}

export function set_selection_floodfillchk(f: Function | null): void {
  selection_flood_check_func = f;
}

function floodfillchk_match_under(x: number, y: number): number {
  return floodfillchk_match_under_typ === $at2(G.level.locations, x, y).typ ? 1 : 0;
}

function floodfillchk_match_accessible(x: number, y: number): number {
  return $at2(G.level.locations, x, y).typ >= DOOR || $at2(G.level.locations, x, y).typ === SDOOR || $at2(G.level.locations, x, y).typ === SCORR ? 1 : 0;
}

function sel_flood_havepoint(x: number, y: number, xs: Ptr | null, ys: Ptr | null, n: number): number {
  let xx = x << 24 >> 24;
  let yy = y << 24 >> 24;
  while (n > 0) {
    --n;
    if (xs.a[xs.o + n] === xx && ys.a[ys.o + n] === yy) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function selection_floodfill(ov: struct_opvar | null, x: number, y: number, diagonals: number): Promise<void> {
  let tmp = await selection_opvar(null);
  let idx = 0;
  let dx = new Int8Array(1680);
  let dy = new Int8Array(1680);
  if (!selection_flood_check_func) {
    do {
      if (tmp) {
        await opvar_free_x(tmp);
        tmp = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(selection_floodfill$nhFunc));
      }
    } while (0);
    return;
  }
  do {
    if (idx < 80 * 21) {
      dx[idx] = x << 24 >> 24;
      dy[idx] = y << 24 >> 24;
      ++idx;
    } else {
      await panic(P(selection_floodfill$floodfill_stack_overrun));
    }
  } while (0);
  do {
    --idx;
    x = dx[idx];
    y = dy[idx];
    if (isok(x, y)) {
      selection_setpoint(x, y, ov, 1);
      selection_setpoint(x, y, tmp, 1);
    }
    do {
      if (isok(x + 1, y) && await selection_flood_check_func(x + 1, y) && !selection_getpoint(x + 1, y, tmp) && !sel_flood_havepoint(x + 1, y, P(dx), P(dy), idx)) {
        do {
          if (idx < 80 * 21) {
            dx[idx] = x + 1 << 24 >> 24;
            dy[idx] = y << 24 >> 24;
            ++idx;
          } else {
            await panic(P(selection_floodfill$floodfill_stack_overrun));
          }
        } while (0);
      }
    } while (0);
    do {
      if (isok(x - 1, y) && await selection_flood_check_func(x - 1, y) && !selection_getpoint(x - 1, y, tmp) && !sel_flood_havepoint(x - 1, y, P(dx), P(dy), idx)) {
        do {
          if (idx < 80 * 21) {
            dx[idx] = x - 1 << 24 >> 24;
            dy[idx] = y << 24 >> 24;
            ++idx;
          } else {
            await panic(P(selection_floodfill$floodfill_stack_overrun));
          }
        } while (0);
      }
    } while (0);
    do {
      if (isok(x, y + 1) && await selection_flood_check_func(x, y + 1) && !selection_getpoint(x, y + 1, tmp) && !sel_flood_havepoint(x, y + 1, P(dx), P(dy), idx)) {
        do {
          if (idx < 80 * 21) {
            dx[idx] = x << 24 >> 24;
            dy[idx] = y + 1 << 24 >> 24;
            ++idx;
          } else {
            await panic(P(selection_floodfill$floodfill_stack_overrun));
          }
        } while (0);
      }
    } while (0);
    do {
      if (isok(x, y - 1) && await selection_flood_check_func(x, y - 1) && !selection_getpoint(x, y - 1, tmp) && !sel_flood_havepoint(x, y - 1, P(dx), P(dy), idx)) {
        do {
          if (idx < 80 * 21) {
            dx[idx] = x << 24 >> 24;
            dy[idx] = y - 1 << 24 >> 24;
            ++idx;
          } else {
            await panic(P(selection_floodfill$floodfill_stack_overrun));
          }
        } while (0);
      }
    } while (0);
    if (diagonals) {
      do {
        if (isok(x + 1, y + 1) && await selection_flood_check_func(x + 1, y + 1) && !selection_getpoint(x + 1, y + 1, tmp) && !sel_flood_havepoint(x + 1, y + 1, P(dx), P(dy), idx)) {
          do {
            if (idx < 80 * 21) {
              dx[idx] = x + 1 << 24 >> 24;
              dy[idx] = y + 1 << 24 >> 24;
              ++idx;
            } else {
              await panic(P(selection_floodfill$floodfill_stack_overrun));
            }
          } while (0);
        }
      } while (0);
      do {
        if (isok(x - 1, y - 1) && await selection_flood_check_func(x - 1, y - 1) && !selection_getpoint(x - 1, y - 1, tmp) && !sel_flood_havepoint(x - 1, y - 1, P(dx), P(dy), idx)) {
          do {
            if (idx < 80 * 21) {
              dx[idx] = x - 1 << 24 >> 24;
              dy[idx] = y - 1 << 24 >> 24;
              ++idx;
            } else {
              await panic(P(selection_floodfill$floodfill_stack_overrun));
            }
          } while (0);
        }
      } while (0);
      do {
        if (isok(x - 1, y + 1) && await selection_flood_check_func(x - 1, y + 1) && !selection_getpoint(x - 1, y + 1, tmp) && !sel_flood_havepoint(x - 1, y + 1, P(dx), P(dy), idx)) {
          do {
            if (idx < 80 * 21) {
              dx[idx] = x - 1 << 24 >> 24;
              dy[idx] = y + 1 << 24 >> 24;
              ++idx;
            } else {
              await panic(P(selection_floodfill$floodfill_stack_overrun));
            }
          } while (0);
        }
      } while (0);
      do {
        if (isok(x + 1, y - 1) && await selection_flood_check_func(x + 1, y - 1) && !selection_getpoint(x + 1, y - 1, tmp) && !sel_flood_havepoint(x + 1, y - 1, P(dx), P(dy), idx)) {
          do {
            if (idx < 80 * 21) {
              dx[idx] = x + 1 << 24 >> 24;
              dy[idx] = y - 1 << 24 >> 24;
              ++idx;
            } else {
              await panic(P(selection_floodfill$floodfill_stack_overrun));
            }
          } while (0);
        }
      } while (0);
    }
  } while (idx > 0);
  do {
    if (tmp) {
      await opvar_free_x(tmp);
      tmp = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(selection_floodfill$nhFunc));
    }
  } while (0);
}

export function selection_do_ellipse(ov: struct_opvar | null, xc: number, yc: number, a: number, b: number, filled: number): void {
  let x = 0;
  let y = b;
  let a2 = a * a;
  let b2 = b * b;
  let crit1 = -(Math.trunc(a2 / 4) + a % 2 + b2);
  let crit2 = -(Math.trunc(b2 / 4) + b % 2 + a2);
  let crit3 = -(Math.trunc(b2 / 4) + b % 2);
  let t = -a2 * y;
  let dxt = 2 * b2 * x;
  let dyt = -2 * a2 * y;
  let d2xt = 2 * b2;
  let d2yt = 2 * a2;
  let width = 1;
  let i = 0;
  if (!ov) {
    return;
  }
  filled = !filled ? 1 : 0;
  if (!filled) {
    while (y >= 0 && x <= a) {
      selection_setpoint(xc + x, yc + y, ov, 1);
      if (x !== 0 || y !== 0) {
        selection_setpoint(xc - x, yc - y, ov, 1);
      }
      if (x !== 0 && y !== 0) {
        selection_setpoint(xc + x, yc - y, ov, 1);
        selection_setpoint(xc - x, yc + y, ov, 1);
      }
      if (t + b2 * x <= crit1 || t + a2 * y <= crit3) {
        ++x;
        dxt += d2xt;
        t += dxt;
      } else if (t - a2 * y > crit2) {
        --y;
        dyt += d2yt;
        t += dyt;
      } else {
        ++x;
        dxt += d2xt;
        t += dxt;
        --y;
        dyt += d2yt;
        t += dyt;
      }
    }
  } else {
    while (y >= 0 && x <= a) {
      if (t + b2 * x <= crit1 || t + a2 * y <= crit3) {
        ++x;
        dxt += d2xt;
        t += dxt;
        width += 2;
      } else if (t - a2 * y > crit2) {
        for (i = 0; i < width; ++i) {
          selection_setpoint(xc - x + i | 0, yc - y, ov, 1);
        }
        if (y !== 0) {
          for (i = 0; i < width; ++i) {
            selection_setpoint(xc - x + i | 0, yc + y, ov, 1);
          }
        }
        --y;
        dyt += d2yt;
        t += dyt;
      } else {
        for (i = 0; i < width; ++i) {
          selection_setpoint(xc - x + i | 0, yc - y, ov, 1);
        }
        if (y !== 0) {
          for (i = 0; i < width; ++i) {
            selection_setpoint(xc - x + i | 0, yc + y, ov, 1);
          }
        }
        ++x;
        dxt += d2xt;
        t += dxt;
        --y;
        dyt += d2yt;
        t += dyt;
        width += 2;
      }
    }
  }
}

export function line_dist_coord(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
  let px = x2 - x1;
  let py = y2 - y1;
  let s = px * px + py * py;
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = 0;
  let dist = 0;
  let lu = 0;
  if (x1 === x2 && y1 === y2) {
    return isqrt(dist2(x1 | 0, y1 | 0, x3 | 0, y3 | 0));
  }
  lu = ((x3 - x1) * px + (y3 - y1) * py) / s;
  if (lu > 1) {
    lu = 1;
  } else if (lu < 0) {
    lu = 0;
  }
  x = Math.trunc(x1 + lu * px);
  y = Math.trunc(y1 + lu * py);
  dx = x - x3;
  dy = y - y3;
  dist = isqrt(dx * dx + dy * dy | 0);
  return dist;
}

export function selection_do_gradient(ov: struct_opvar | null, x: number, y: number, x2: number, y2: number, gtyp: number, mind: number, maxd: number, limit: number): void {
  let dx = 0;
  let dy = 0;
  let dofs = 0;
  if (mind > maxd) {
    let tmp = mind;
    mind = maxd;
    maxd = tmp;
  }
  dofs = maxd - mind;
  if (dofs < 1) {
    dofs = 1;
  }
  switch (gtyp) {
  default:
  case 0:
    {
      for (dx = 0; dx < COLNO; ++dx) {
        for (dy = 0; dy < ROWNO; ++dy) {
          let d0 = line_dist_coord(x, y, x2, y2, dx, dy);
          if (d0 >= mind && (!limit || d0 <= maxd)) {
            if (d0 - mind > rn2(dofs | 0)) {
              selection_setpoint(dx | 0, dy | 0, ov, 1);
            }
          }
        }
      }
      break;
    }
  case 1:
    {
      for (dx = 0; dx < COLNO; ++dx) {
        for (dy = 0; dy < ROWNO; ++dy) {
          let d1 = line_dist_coord(x, y, x2, y2, x, dy);
          let d2 = line_dist_coord(x, y, x2, y2, dx, y);
          let d3 = line_dist_coord(x, y, x2, y2, x2, dy);
          let d4 = line_dist_coord(x, y, x2, y2, dx, y2);
          let d5 = line_dist_coord(x, y, x2, y2, dx, dy);
          let d0 = d5 < ((d1 > d2 ? d1 : d2) < (d3 > d4 ? d3 : d4) ? d1 > d2 ? d1 : d2 : d3 > d4 ? d3 : d4) ? d5 : (d1 > d2 ? d1 : d2) < (d3 > d4 ? d3 : d4) ? d1 > d2 ? d1 : d2 : d3 > d4 ? d3 : d4;
          if (d0 >= mind && (!limit || d0 <= maxd)) {
            if (d0 - mind > rn2(dofs | 0)) {
              selection_setpoint(dx | 0, dy | 0, ov, 1);
            }
          }
        }
      }
      break;
    }
  }
}

export function selection_do_line(x1: number, y1: number, x2: number, y2: number, ov: struct_opvar | null): void {
  let d0 = 0;
  let dx = 0;
  let dy = 0;
  let ai = 0;
  let bi = 0;
  let xi = 0;
  let yi = 0;
  if (x1 < x2) {
    xi = 1;
    dx = x2 - x1;
  } else {
    xi = -1;
    dx = x1 - x2;
  }
  if (y1 < y2) {
    yi = 1;
    dy = y2 - y1;
  } else {
    yi = -1;
    dy = y1 - y2;
  }
  selection_setpoint(x1, y1, ov, 1);
  if (dx > dy) {
    ai = (dy - dx) * 2;
    bi = dy * 2;
    d0 = bi - dx;
    do {
      if (d0 >= 0) {
        y1 = y1 + yi << 24 >> 24;
        d0 += ai;
      } else {
        d0 += bi;
      }
      x1 = x1 + xi << 24 >> 24;
      selection_setpoint(x1, y1, ov, 1);
    } while (x1 !== x2);
  } else {
    ai = (dx - dy) * 2;
    bi = dx * 2;
    d0 = bi - dy;
    do {
      if (d0 >= 0) {
        x1 = x1 + xi << 24 >> 24;
        d0 += ai;
      } else {
        d0 += bi;
      }
      y1 = y1 + yi << 24 >> 24;
      selection_setpoint(x1, y1, ov, 1);
    } while (y1 !== y2);
  }
}

export function selection_do_randline(x1: number, y1: number, x2: number, y2: number, rough: number, rec: number, ov: struct_opvar | null): void {
  let mx = 0;
  let my = 0;
  let dx = 0;
  let dy = 0;
  if (rec < 1) {
    return;
  }
  if (x2 === x1 && y2 === y1) {
    selection_setpoint(x1, y1, ov, 1);
    return;
  }
  if (rough > (Math.abs(x2 - x1) > Math.abs(y2 - y1) ? Math.abs(x2 - x1) : Math.abs(y2 - y1))) {
    rough = (Math.abs(x2 - x1) > Math.abs(y2 - y1) ? Math.abs(x2 - x1) : Math.abs(y2 - y1)) << 24 >> 24;
  }
  if (rough < 2) {
    mx = (x1 + x2) / 2 | 0;
    my = (y1 + y2) / 2 | 0;
  } else {
    do {
      dx = rn2(rough) - (rough / 2 | 0);
      dy = rn2(rough) - (rough / 2 | 0);
      mx = ((x1 + x2) / 2 | 0) + dx;
      my = ((y1 + y2) / 2 | 0) + dy;
    } while (mx > COLNO - 1 || mx < 0 || my < 0 || my > ROWNO - 1);
  }
  selection_setpoint(mx, my, ov, 1);
  rough = (rough * 2 / 3 | 0) << 24 >> 24;
  rec = rec - 1 << 24 >> 24;
  selection_do_randline(x1, y1, mx, my, rough, rec, ov);
  selection_do_randline(mx, my, x2, y2, rough, rec, ov);
}

export async function selection_iterate(ov: struct_opvar | null, func: Function | null, arg: any): Promise<void> {
  let x = 0;
  let y = 0;
  for (x = 0; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if (selection_getpoint(x, y, ov)) {
        await func(x, y, arg);
      }
    }
  }
}

export function sel_set_ter(x: number, y: number, arg: any): void {
  let terr = new struct_terrain();
  terr.$cp(arg);
  {
    if (x >= 0 && y >= 0 && x < 80 && y < 21) {
      if (terr.ter < MAX_TYPE) {
        $at2(G.level.locations, x, y).typ = terr.ter;
      }
      if (terr.ter === LAVAPOOL) {
        $at2(G.level.locations, x, y).lit = 1;
      } else if (terr.tlit !== -2) {
        if (terr.tlit === -1) {
          $at2(G.level.locations, x, y).lit = (rn2(2) >>> 0) & 1;
        } else {
          $at2(G.level.locations, x, y).lit = (terr.tlit >>> 0) & 1;
        }
      }
    }
  }
  ;
  if ($at2(G.level.locations, x, y).typ === SDOOR || $at2(G.level.locations, x, y).typ === DOOR) {
    if ($at2(G.level.locations, x, y).typ === SDOOR) {
      $at2(G.level.locations, x, y).flags = (D_CLOSED) & 31;
    }
    if (x && ($at2(G.level.locations, x - 1, y).typ && $at2(G.level.locations, x - 1, y).typ <= DBWALL || $at2(G.level.locations, x - 1, y).horizontal | 0)) {
      $at2(G.level.locations, x, y).horizontal = 1;
    }
  }
}

export function sel_set_feature(x: number, y: number, arg: any): void {
  if ($at2(G.level.locations, x, y).typ >= STAIRS && $at2(G.level.locations, x, y).typ <= ALTAR) {
    return;
  }
  $at2(G.level.locations, x, y).typ = arg.a[arg.o] << 24 >> 24;
}

export function sel_set_door(dx: number, dy: number, arg: any): void {
  let typ = arg.a[arg.o];
  let x = dx << 24 >> 24;
  let y = dy << 24 >> 24;
  if (!($at2(G.level.locations, x, y).typ === DOOR) && $at2(G.level.locations, x, y).typ !== SDOOR) {
    $at2(G.level.locations, x, y).typ = (typ & D_SECRET ? SDOOR : DOOR) << 24 >> 24;
  }
  if (typ & D_SECRET) {
    typ = (typ & ~D_SECRET) << 24 >> 24;
    if (typ < D_CLOSED) {
      typ = D_CLOSED;
    }
  }
  set_door_orientation(x, y);
  $at2(G.level.locations, x, y).flags = (typ >>> 0) & 31;
  SpLev_Map[x][y] = 1;
}

export async function spo_door(coder: struct_sp_coder | null): Promise<void> {
  let msk = null;
  let sel = null;
  const typ = new Int8Array(1);
  if (!(msk = await splev_stack_getdat(coder, 1)) || !(sel = await splev_stack_getdat(coder, 9))) {
    return;
  }
  typ[0] = (msk.vardata.l === -1 ? rnddoor() : msk.vardata.l << 24 >> 24) << 24 >> 24;
  await selection_iterate(sel, sel_set_door, P(typ, 0));
  do {
    if (sel) {
      await opvar_free_x(sel);
      sel = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_door$nhFunc));
    }
  } while (0);
  do {
    if (msk) {
      await opvar_free_x(msk);
      msk = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_door$nhFunc));
    }
  } while (0);
}

export async function spo_feature(coder: struct_sp_coder | null): Promise<void> {
  let sel = null;
  const typ = new Int32Array(1);
  if (!(sel = await splev_stack_getdat(coder, 9))) {
    return;
  }
  switch (coder.opcode) {
  default:
    await impossible(S("spo_feature called with wrong opcode %i."), coder.opcode);
    break;
  case SPO_FOUNTAIN:
    typ[0] = FOUNTAIN;
    break;
  case SPO_SINK:
    typ[0] = SINK;
    break;
  case SPO_POOL:
    typ[0] = POOL;
    break;
  }
  await selection_iterate(sel, sel_set_feature, P(typ, 0));
  do {
    if (sel) {
      await opvar_free_x(sel);
      sel = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_feature$nhFunc));
    }
  } while (0);
}

export async function spo_terrain(coder: struct_sp_coder | null): Promise<void> {
  let tmpterrain = new struct_terrain();
  let ter = null;
  let sel = null;
  if (!(ter = await splev_stack_getdat(coder, 6)) || !(sel = await splev_stack_getdat(coder, 9))) {
    return;
  }
  tmpterrain.ter = (ter.vardata.l & 255) << 24 >> 24;
  tmpterrain.tlit = ($shr64(ter.vardata.l, 8) & 65535) - 10 << 24 >> 24;
  await selection_iterate(sel, sel_set_ter, tmpterrain);
  do {
    if (ter) {
      await opvar_free_x(ter);
      ter = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_terrain$nhFunc));
    }
  } while (0);
  do {
    if (sel) {
      await opvar_free_x(sel);
      sel = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_terrain$nhFunc));
    }
  } while (0);
}

export async function spo_replace_terrain(coder: struct_sp_coder | null): Promise<void> {
  let rt = new struct_replaceterrain();
  let reg = null;
  let from_ter = null;
  let to_ter = null;
  let chance = null;
  if (!(chance = await splev_stack_getdat(coder, 1)) || !(to_ter = await splev_stack_getdat(coder, 6)) || !(from_ter = await splev_stack_getdat(coder, 6)) || !(reg = await splev_stack_getdat(coder, 5))) {
    return;
  }
  rt.chance = chance.vardata.l << 24 >> 24;
  rt.tolit = ($shr64(to_ter.vardata.l, 8) & 65535) - 10 << 24 >> 24;
  rt.toter = (to_ter.vardata.l & 255) << 24 >> 24;
  rt.fromter = (from_ter.vardata.l & 255) << 24 >> 24;
  rt.x1 = (reg.vardata.l & 255) << 24 >> 24;
  rt.y1 = ($shr64(reg.vardata.l, 8) & 255) << 24 >> 24;
  rt.x2 = ($shr64(reg.vardata.l, 16) & 255) << 24 >> 24;
  rt.y2 = ($shr64(reg.vardata.l, 24) & 255) << 24 >> 24;
  await replace_terrain(rt, coder.croom);
  do {
    if (reg) {
      await opvar_free_x(reg);
      reg = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_replace_terrain$nhFunc));
    }
  } while (0);
  do {
    if (from_ter) {
      await opvar_free_x(from_ter);
      from_ter = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_replace_terrain$nhFunc));
    }
  } while (0);
  do {
    if (to_ter) {
      await opvar_free_x(to_ter);
      to_ter = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_replace_terrain$nhFunc));
    }
  } while (0);
  do {
    if (chance) {
      await opvar_free_x(chance);
      chance = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_replace_terrain$nhFunc));
    }
  } while (0);
}

async function generate_way_out_method(nx: number, ny: number, ov: struct_opvar | null): Promise<number> {
  let $g = 0;
  let escapeitems = new Int32Array(6);
  let ov2 = null;
  let ov3 = null;
  let x = new Int8Array(1);
  let y = new Int8Array(1);
  let res = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      escapeitems = $ta(Int32Array, 6, [PICK_AXE, DWARVISH_MATTOCK, WAN_DIGGING, WAN_TELEPORTATION, SCR_TELEPORTATION, RIN_TELEPORTATION]);
      ov2 = await selection_opvar(null);
      res = TRUE;
      await selection_floodfill(ov2, nx, ny, TRUE);
      ov3 = await opvar_clone(ov2);
      while (selection_rndcoord(ov3, P(x, 0), P(y, 0), TRUE)) {
        if (isok(x[0] + 1, y[0]) && !selection_getpoint(x[0] + 1, y[0], ov) && ($at2(G.level.locations, x[0] + 1, y[0]).typ && $at2(G.level.locations, x[0] + 1, y[0]).typ <= DBWALL) && isok(x[0] + 2, y[0]) && selection_getpoint(x[0] + 2, y[0], ov) && $at2(G.level.locations, x[0] + 2, y[0]).typ >= DOOR) {
          $at2(G.level.locations, x[0] + 1, y[0]).typ = SDOOR;
          { $g = 1; continue $L; }
        }
        if (isok(x[0] - 1, y[0]) && !selection_getpoint(x[0] - 1, y[0], ov) && ($at2(G.level.locations, x[0] - 1, y[0]).typ && $at2(G.level.locations, x[0] - 1, y[0]).typ <= DBWALL) && isok(x[0] - 2, y[0]) && selection_getpoint(x[0] - 2, y[0], ov) && $at2(G.level.locations, x[0] - 2, y[0]).typ >= DOOR) {
          $at2(G.level.locations, x[0] - 1, y[0]).typ = SDOOR;
          { $g = 1; continue $L; }
        }
        if (isok(x[0], y[0] + 1) && !selection_getpoint(x[0], y[0] + 1, ov) && ($at2(G.level.locations, x[0], y[0] + 1).typ && $at2(G.level.locations, x[0], y[0] + 1).typ <= DBWALL) && isok(x[0], y[0] + 2) && selection_getpoint(x[0], y[0] + 2, ov) && $at2(G.level.locations, x[0], y[0] + 2).typ >= DOOR) {
          $at2(G.level.locations, x[0], y[0] + 1).typ = SDOOR;
          { $g = 1; continue $L; }
        }
        if (isok(x[0], y[0] - 1) && !selection_getpoint(x[0], y[0] - 1, ov) && ($at2(G.level.locations, x[0], y[0] - 1).typ && $at2(G.level.locations, x[0], y[0] - 1).typ <= DBWALL) && isok(x[0], y[0] - 2) && selection_getpoint(x[0], y[0] - 2, ov) && $at2(G.level.locations, x[0], y[0] - 2).typ >= DOOR) {
          $at2(G.level.locations, x[0], y[0] - 1).typ = SDOOR;
          { $g = 1; continue $L; }
        }
      }
      if (Can_fall_thru(G.u.uz)) {
        do {
          if (ov3) {
            await opvar_free_x(ov3);
            ov3 = null;
          } else {
            await impossible(S("opvar_free(), %s"), P(generate_way_out_method$nhFunc));
          }
        } while (0);
        ov3 = await opvar_clone(ov2);
        while (selection_rndcoord(ov3, P(x, 0), P(y, 0), TRUE)) {
          if (await maketrap(x[0], y[0], rn2(2) ? HOLE : TRAPDOOR)) {
            { $g = 1; continue $L; }
          }
        }
      }
      if (selection_rndcoord(ov2, P(x, 0), P(y, 0), FALSE)) {
        await mksobj_at(escapeitems[rn2(Math.trunc(24 / 4) | 0)], x[0], y[0], TRUE, FALSE);
        { $g = 1; continue $L; }
      }
      res = FALSE;
    case 1: // gotitdone
      do {
        if (ov2) {
          await opvar_free_x(ov2);
          ov2 = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(generate_way_out_method$nhFunc));
        }
      } while (0);
      do {
        if (ov3) {
          await opvar_free_x(ov3);
          ov3 = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(generate_way_out_method$nhFunc));
        }
      } while (0);
      return res;
    }
    break;
  }
}

async function ensure_way_out(): Promise<void> {
  let $g = 0;
  let ov = null;
  let ttmp = null;
  let x = 0;
  let y = 0;
  let ret = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      ov = await selection_opvar(null);
      ttmp = G.ftrap;
      ret = TRUE;
      set_selection_floodfillchk(floodfillchk_match_accessible);
      if (G.upstair.sx && !selection_getpoint(G.upstair.sx, G.upstair.sy, ov)) {
        await selection_floodfill(ov, G.upstair.sx, G.upstair.sy, TRUE);
      }
      if (G.dnstair.sx && !selection_getpoint(G.dnstair.sx, G.dnstair.sy, ov)) {
        await selection_floodfill(ov, G.dnstair.sx, G.dnstair.sy, TRUE);
      }
      if (G.upladder.sx && !selection_getpoint(G.upladder.sx, G.upladder.sy, ov)) {
        await selection_floodfill(ov, G.upladder.sx, G.upladder.sy, TRUE);
      }
      if (G.dnladder.sx && !selection_getpoint(G.dnladder.sx, G.dnladder.sy, ov)) {
        await selection_floodfill(ov, G.dnladder.sx, G.dnladder.sy, TRUE);
      }
      while (ttmp) {
        if (((ttmp.ttyp | 0) === MAGIC_PORTAL || (ttmp.ttyp | 0) === VIBRATING_SQUARE || ((ttmp.ttyp | 0) === HOLE || (ttmp.ttyp | 0) === TRAPDOOR)) && !selection_getpoint(ttmp.tx, ttmp.ty, ov)) {
          await selection_floodfill(ov, ttmp.tx, ttmp.ty, TRUE);
        }
        ttmp = ttmp.ntrap;
      }
    case 2:
      ret = TRUE;
      for (x = 0; x < COLNO; ++x) {
        for (y = 0; y < ROWNO; ++y) {
          if ($at2(G.level.locations, x, y).typ >= DOOR && !selection_getpoint(x, y, ov)) {
            if (await generate_way_out_method(x, y, ov)) {
              await selection_floodfill(ov, x, y, TRUE);
            }
            ret = FALSE;
            { $g = 1; continue $L; }
          }
        }
      }
    case 1: // outhere
      ;
    case 3:
      if (!ret) { $g = 2; continue $L; }
    case 4:
      do {
        if (ov) {
          await opvar_free_x(ov);
          ov = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(ensure_way_out$nhFunc));
        }
      } while (0);
    }
    break;
  }
}

export async function spo_levregion(coder: struct_sp_coder | null): Promise<void> {
  let rname = null;
  let padding = null;
  let rtype = null;
  let del_islev = null;
  let dy2 = null;
  let dx2 = null;
  let dy1 = null;
  let dx1 = null;
  let in_islev = null;
  let iy2 = null;
  let ix2 = null;
  let iy1 = null;
  let ix1 = null;
  let tmplregion = null;
  if (!(rname = await splev_stack_getdat(coder, 2)) || !(padding = await splev_stack_getdat(coder, 1)) || !(rtype = await splev_stack_getdat(coder, 1)) || !(del_islev = await splev_stack_getdat(coder, 1)) || !(dy2 = await splev_stack_getdat(coder, 1)) || !(dx2 = await splev_stack_getdat(coder, 1)) || !(dy1 = await splev_stack_getdat(coder, 1)) || !(dx1 = await splev_stack_getdat(coder, 1)) || !(in_islev = await splev_stack_getdat(coder, 1)) || !(iy2 = await splev_stack_getdat(coder, 1)) || !(ix2 = await splev_stack_getdat(coder, 1)) || !(iy1 = await splev_stack_getdat(coder, 1)) || !(ix1 = await splev_stack_getdat(coder, 1))) {
    return;
  }
  tmplregion = new struct_lev_region();
  tmplregion.inarea.x1 = ix1.vardata.l << 24 >> 24;
  tmplregion.inarea.y1 = iy1.vardata.l << 24 >> 24;
  tmplregion.inarea.x2 = ix2.vardata.l << 24 >> 24;
  tmplregion.inarea.y2 = iy2.vardata.l << 24 >> 24;
  tmplregion.delarea.x1 = dx1.vardata.l << 24 >> 24;
  tmplregion.delarea.y1 = dy1.vardata.l << 24 >> 24;
  tmplregion.delarea.x2 = dx2.vardata.l << 24 >> 24;
  tmplregion.delarea.y2 = dy2.vardata.l << 24 >> 24;
  tmplregion.in_islev = in_islev.vardata.l << 24 >> 24;
  tmplregion.del_islev = del_islev.vardata.l << 24 >> 24;
  tmplregion.rtype = rtype.vardata.l << 24 >> 24;
  tmplregion.padding = padding.vardata.l << 24 >> 24;
  tmplregion.rname.str = await dupstr(rname.vardata.str);
  if (!tmplregion.in_islev) {
    await get_location(P(tmplregion.inarea, "x1"), P(tmplregion.inarea, "y1"), ANY_LOC, null);
    await get_location(P(tmplregion.inarea, "x2"), P(tmplregion.inarea, "y2"), ANY_LOC, null);
  }
  if (!tmplregion.del_islev) {
    await get_location(P(tmplregion.delarea, "x1"), P(tmplregion.delarea, "y1"), ANY_LOC, null);
    await get_location(P(tmplregion.delarea, "x2"), P(tmplregion.delarea, "y2"), ANY_LOC, null);
  }
  if (G.num_lregions) {
    let newl = $sarr(struct_lev_region, (24 * (1 + G.num_lregions >>> 0) >>> 0) / 24)[0];
    memcpy(newl, G.lregions, 24 * $u64(G.num_lregions));
    if (G.lregions) {
      free(G.lregions);
    }
    ++G.num_lregions;
    G.lregions = newl;
  } else {
    G.num_lregions = 1;
    G.lregions = new struct_lev_region();
  }
  memcpy($sadd(G.lregions, (G.num_lregions - 1)), tmplregion, 24);
  free(tmplregion);
  do {
    if (dx1) {
      await opvar_free_x(dx1);
      dx1 = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (dy1) {
      await opvar_free_x(dy1);
      dy1 = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (dx2) {
      await opvar_free_x(dx2);
      dx2 = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (dy2) {
      await opvar_free_x(dy2);
      dy2 = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (ix1) {
      await opvar_free_x(ix1);
      ix1 = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (iy1) {
      await opvar_free_x(iy1);
      iy1 = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (ix2) {
      await opvar_free_x(ix2);
      ix2 = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (iy2) {
      await opvar_free_x(iy2);
      iy2 = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (del_islev) {
      await opvar_free_x(del_islev);
      del_islev = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (in_islev) {
      await opvar_free_x(in_islev);
      in_islev = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (rname) {
      await opvar_free_x(rname);
      rname = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (rtype) {
      await opvar_free_x(rtype);
      rtype = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
  do {
    if (padding) {
      await opvar_free_x(padding);
      padding = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_levregion$nhFunc));
    }
  } while (0);
}

export async function spo_region(coder: struct_sp_coder | null): Promise<void> {
  let rtype = null;
  let rlit = null;
  let rflags = null;
  let area = null;
  const dx1 = new Int8Array(1);
  const dy1 = new Int8Array(1);
  const dx2 = new Int8Array(1);
  const dy2 = new Int8Array(1);
  let troom = null;
  let prefilled = 0;
  let room_not_needed = 0;
  let irregular = 0;
  let joined = 0;
  if (!(rflags = await splev_stack_getdat(coder, 1)) || !(rtype = await splev_stack_getdat(coder, 1)) || !(rlit = await splev_stack_getdat(coder, 1)) || !(area = await splev_stack_getdat(coder, 5))) {
    return;
  }
  prefilled = (!(rflags.vardata.l & 1 << 0) ? 1 : 0) << 24 >> 24;
  irregular = (rflags.vardata.l & 1 << 1) << 24 >> 24;
  joined = (!(rflags.vardata.l & 1 << 2) ? 1 : 0) << 24 >> 24;
  if (rtype.vardata.l > MAXRTYPE) {
    rtype.vardata.l -= MAXRTYPE + 1;
    prefilled = TRUE;
  } else {
    prefilled = FALSE;
  }
  if (rlit.vardata.l < 0) {
    rlit.vardata.l = rnd(1 + Math.abs(depth(G.u.uz))) < 11 && rn2(77) ? TRUE : FALSE;
  }
  dx1[0] = (area.vardata.l & 255) << 24 >> 24;
  dy1[0] = ($shr64(area.vardata.l, 8) & 255) << 24 >> 24;
  dx2[0] = ($shr64(area.vardata.l, 16) & 255) << 24 >> 24;
  dy2[0] = ($shr64(area.vardata.l, 24) & 255) << 24 >> 24;
  await get_location(P(dx1, 0), P(dy1, 0), ANY_LOC, null);
  await get_location(P(dx2, 0), P(dy2, 0), ANY_LOC, null);
  room_not_needed = (rtype.vardata.l === OROOM && !irregular && !prefilled ? 1 : 0) << 24 >> 24;
  if (room_not_needed || G.nroom >= MAXNROFROOMS) {
    let tmpregion = new struct_region();
    if (!room_not_needed) {
      await impossible(S("Too many rooms on new level!"));
    }
    tmpregion.rlit = rlit.vardata.l << 24 >> 24;
    tmpregion.x1 = dx1[0];
    tmpregion.y1 = dy1[0];
    tmpregion.x2 = dx2[0];
    tmpregion.y2 = dy2[0];
    light_region(tmpregion);
    do {
      if (area) {
        await opvar_free_x(area);
        area = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_region$nhFunc));
      }
    } while (0);
    do {
      if (rflags) {
        await opvar_free_x(rflags);
        rflags = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_region$nhFunc));
      }
    } while (0);
    do {
      if (rlit) {
        await opvar_free_x(rlit);
        rlit = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_region$nhFunc));
      }
    } while (0);
    do {
      if (rtype) {
        await opvar_free_x(rtype);
        rtype = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_region$nhFunc));
      }
    } while (0);
    return;
  }
  troom = $sat(G.rooms, G.nroom);
  if (rtype.vardata.l !== OROOM) {
    troom.needfill = (prefilled ? 2 : 1) << 24 >> 24;
  }
  troom.needjoining = joined;
  if (irregular) {
    G.min_rx = G.max_rx = dx1[0];
    G.min_ry = G.max_ry = dy1[0];
    G.smeq[G.nroom] = G.nroom;
    flood_fill_rm(dx1[0], dy1[0], G.nroom + ROOMOFFSET, rlit.vardata.l | 0, TRUE);
    await add_room(G.min_rx, G.min_ry, G.max_rx, G.max_ry, FALSE, rtype.vardata.l | 0, TRUE);
    troom.rlit = rlit.vardata.l << 24 >> 24;
    troom.irregular = TRUE;
  } else {
    await add_room(dx1[0], dy1[0], dx2[0], dy2[0], rlit.vardata.l | 0, rtype.vardata.l | 0, TRUE);
    topologize(troom);
  }
  if (!room_not_needed) {
    if (coder.n_subroom > 1) {
      await impossible(S("region as subroom"));
    } else {
      coder.tmproomlist[coder.n_subroom] = troom;
      coder.failed_room[coder.n_subroom] = FALSE;
      ++coder.n_subroom;
    }
  }
  do {
    if (area) {
      await opvar_free_x(area);
      area = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_region$nhFunc));
    }
  } while (0);
  do {
    if (rflags) {
      await opvar_free_x(rflags);
      rflags = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_region$nhFunc));
    }
  } while (0);
  do {
    if (rlit) {
      await opvar_free_x(rlit);
      rlit = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_region$nhFunc));
    }
  } while (0);
  do {
    if (rtype) {
      await opvar_free_x(rtype);
      rtype = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_region$nhFunc));
    }
  } while (0);
}

export async function spo_drawbridge(coder: struct_sp_coder | null): Promise<void> {
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let dopen = 0;
  let dir = null;
  let db_open = null;
  let dcoord = null;
  if (!(dir = await splev_stack_getdat(coder, 1)) || !(db_open = await splev_stack_getdat(coder, 1)) || !(dcoord = await splev_stack_getdat(coder, 4))) {
    return;
  }
  await get_location_coord(P(x, 0), P(y, 0), DRY | WET | HOT, coder.croom, dcoord.vardata.l);
  if ((dopen = db_open.vardata.l | 0) === -1) {
    dopen = !rn2(2) ? 1 : 0;
  }
  if (!await create_drawbridge(x[0], y[0], dir.vardata.l | 0, dopen ? TRUE : FALSE)) {
    await impossible(S("Cannot create drawbridge."));
  }
  SpLev_Map[x[0]][y[0]] = 1;
  do {
    if (dcoord) {
      await opvar_free_x(dcoord);
      dcoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_drawbridge$nhFunc));
    }
  } while (0);
  do {
    if (db_open) {
      await opvar_free_x(db_open);
      db_open = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_drawbridge$nhFunc));
    }
  } while (0);
  do {
    if (dir) {
      await opvar_free_x(dir);
      dir = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_drawbridge$nhFunc));
    }
  } while (0);
}

export async function spo_mazewalk(coder: struct_sp_coder | null): Promise<void> {
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let ftyp = null;
  let fstocked = null;
  let fdir = null;
  let mcoord = null;
  let dir = 0;
  if (!(ftyp = await splev_stack_getdat(coder, 1)) || !(fstocked = await splev_stack_getdat(coder, 1)) || !(fdir = await splev_stack_getdat(coder, 1)) || !(mcoord = await splev_stack_getdat(coder, 4))) {
    return;
  }
  dir = fdir.vardata.l | 0;
  await get_location_coord(P(x, 0), P(y, 0), ANY_LOC, coder.croom, mcoord.vardata.l);
  if (!isok(x[0], y[0])) {
    return;
  }
  if (ftyp.vardata.l < 1) {
    ftyp.vardata.l = G.level.flags.corrmaze | 0 ? CORR : ROOM;
  }
  switch (dir) {
  case 1:
    y[0] = y[0] - 1 << 24 >> 24;
    break;
  case 2:
    y[0] = y[0] + 1 << 24 >> 24;
    break;
  case 4:
    x[0] = x[0] + 1 << 24 >> 24;
    break;
  case 8:
    x[0] = x[0] - 1 << 24 >> 24;
    break;
  default:
    await impossible(S("spo_mazewalk: Bad MAZEWALK direction"));
  }
  if (!($at2(G.level.locations, x[0], y[0]).typ === DOOR)) {
    $at2(G.level.locations, x[0], y[0]).typ = ftyp.vardata.l << 24 >> 24;
    $at2(G.level.locations, x[0], y[0]).flags = 0;
  }
  if (!(x[0] % 2)) {
    if (dir === W_EAST) {
      x[0] = x[0] + 1 << 24 >> 24;
    } else {
      x[0] = x[0] - 1 << 24 >> 24;
    }
    $at2(G.level.locations, x[0], y[0]).typ = ftyp.vardata.l << 24 >> 24;
    $at2(G.level.locations, x[0], y[0]).flags = 0;
  }
  if (!(y[0] % 2)) {
    if (dir === W_SOUTH) {
      y[0] = y[0] + 1 << 24 >> 24;
    } else {
      y[0] = y[0] - 1 << 24 >> 24;
    }
  }
  await walkfrom(x[0], y[0], ftyp.vardata.l | 0);
  if (fstocked.vardata.l) {
    await fill_empty_maze();
  }
  do {
    if (mcoord) {
      await opvar_free_x(mcoord);
      mcoord = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_mazewalk$nhFunc));
    }
  } while (0);
  do {
    if (fdir) {
      await opvar_free_x(fdir);
      fdir = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_mazewalk$nhFunc));
    }
  } while (0);
  do {
    if (fstocked) {
      await opvar_free_x(fstocked);
      fstocked = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_mazewalk$nhFunc));
    }
  } while (0);
  do {
    if (ftyp) {
      await opvar_free_x(ftyp);
      ftyp = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_mazewalk$nhFunc));
    }
  } while (0);
}

export async function spo_wall_property(coder: struct_sp_coder | null): Promise<void> {
  let r = null;
  const dx1 = new Int8Array(1);
  const dy1 = new Int8Array(1);
  const dx2 = new Int8Array(1);
  const dy2 = new Int8Array(1);
  let wprop = coder.opcode === SPO_NON_DIGGABLE ? W_NONDIGGABLE : W_NONPASSWALL;
  if (!(r = await splev_stack_getdat(coder, 5))) {
    return;
  }
  dx1[0] = (r.vardata.l & 255) << 24 >> 24;
  dy1[0] = ($shr64(r.vardata.l, 8) & 255) << 24 >> 24;
  dx2[0] = ($shr64(r.vardata.l, 16) & 255) << 24 >> 24;
  dy2[0] = ($shr64(r.vardata.l, 24) & 255) << 24 >> 24;
  await get_location(P(dx1, 0), P(dy1, 0), ANY_LOC, null);
  await get_location(P(dx2, 0), P(dy2, 0), ANY_LOC, null);
  set_wall_property(dx1[0], dy1[0], dx2[0], dy2[0], wprop);
  do {
    if (r) {
      await opvar_free_x(r);
      r = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_wall_property$nhFunc));
    }
  } while (0);
}

export async function spo_room_door(coder: struct_sp_coder | null): Promise<void> {
  let wall = null;
  let secret = null;
  let mask = null;
  let pos = null;
  let tmpd = new struct_room_door();
  if (!(wall = await splev_stack_getdat(coder, 1)) || !(secret = await splev_stack_getdat(coder, 1)) || !(mask = await splev_stack_getdat(coder, 1)) || !(pos = await splev_stack_getdat(coder, 1)) || !coder.croom) {
    return;
  }
  tmpd.secret = secret.vardata.l << 24 >> 24;
  tmpd.mask = mask.vardata.l << 24 >> 24;
  tmpd.pos = pos.vardata.l << 24 >> 24;
  tmpd.wall = wall.vardata.l << 24 >> 24;
  await create_door(tmpd, coder.croom);
  do {
    if (wall) {
      await opvar_free_x(wall);
      wall = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_room_door$nhFunc));
    }
  } while (0);
  do {
    if (secret) {
      await opvar_free_x(secret);
      secret = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_room_door$nhFunc));
    }
  } while (0);
  do {
    if (mask) {
      await opvar_free_x(mask);
      mask = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_room_door$nhFunc));
    }
  } while (0);
  do {
    if (pos) {
      await opvar_free_x(pos);
      pos = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_room_door$nhFunc));
    }
  } while (0);
}

export function sel_set_wallify(x: number, y: number, arg: any): void {
  wallify_map(x, y, x, y);
}

export async function spo_wallify(coder: struct_sp_coder | null): Promise<void> {
  let typ = null;
  let r = null;
  let dx1 = 0;
  let dy1 = 0;
  let dx2 = 0;
  let dy2 = 0;
  if (!(typ = await splev_stack_getdat(coder, 1))) {
    return;
  }
  switch (typ.vardata.l) {
  default:
  case 0:
    if (!(r = await splev_stack_getdat(coder, 5))) {
      return;
    }
    dx1 = (r.vardata.l & 255) << 24 >> 24;
    dy1 = ($shr64(r.vardata.l, 8) & 255) << 24 >> 24;
    dx2 = ($shr64(r.vardata.l, 16) & 255) << 24 >> 24;
    dy2 = ($shr64(r.vardata.l, 24) & 255) << 24 >> 24;
    wallify_map(dx1 < 0 ? xstart - 1 : dx1, dy1 < 0 ? ystart - 1 : dy1, dx2 < 0 ? xstart + xsize + 1 : dx2, dy2 < 0 ? ystart + ysize + 1 : dy2);
    break;
  case 1:
    if (!(r = await splev_stack_getdat(coder, 9))) {
      return;
    }
    await selection_iterate(r, sel_set_wallify, null);
    break;
  }
  do {
    if (r) {
      await opvar_free_x(r);
      r = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_wallify$nhFunc));
    }
  } while (0);
  do {
    if (typ) {
      await opvar_free_x(typ);
      typ = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_wallify$nhFunc));
    }
  } while (0);
}

export async function spo_map(coder: struct_sp_coder | null): Promise<void> {
  let tmpmazepart = new struct_mazepart();
  let mpxs = null;
  let mpys = null;
  let mpmap = null;
  let mpa = null;
  let mpkeepr = null;
  let mpzalign = null;
  const halign = new Int8Array(1);
  const valign = new Int8Array(1);
  let tmpxstart = 0;
  let tmpystart = 0;
  let tmpxsize = 0;
  let tmpysize = 0;
  let upc = new struct_unpacked_coord();
  if (!(mpxs = await splev_stack_getdat(coder, 1)) || !(mpys = await splev_stack_getdat(coder, 1)) || !(mpmap = await splev_stack_getdat(coder, 2)) || !(mpkeepr = await splev_stack_getdat(coder, 1)) || !(mpzalign = await splev_stack_getdat(coder, 1)) || !(mpa = await splev_stack_getdat(coder, 4))) {
    return;
  }
  tmpmazepart.xsize = mpxs.vardata.l << 24 >> 24;
  tmpmazepart.ysize = mpys.vardata.l << 24 >> 24;
  tmpmazepart.zaligntyp = mpzalign.vardata.l << 24 >> 24;
  upc.$cp(get_unpacked_coord(mpa.vardata.l, ANY_LOC));
  tmpmazepart.halign = upc.x << 24 >> 24;
  tmpmazepart.valign = upc.y << 24 >> 24;
  tmpxsize = xsize;
  tmpysize = ysize;
  tmpxstart = xstart;
  tmpystart = ystart;
  halign[0] = tmpmazepart.halign;
  valign[0] = tmpmazepart.valign;
  xsize = tmpmazepart.xsize;
  ysize = tmpmazepart.ysize;
  switch (tmpmazepart.zaligntyp) {
  default:
  case 0:
    break;
  case 1:
    switch (halign[0]) {
    case 1:
      xstart = (splev_init_present ? 1 : 3) << 24 >> 24;
      break;
    case 2:
      xstart = 2 + ((G.x_maze_max - 2 - xsize) / 4 | 0) << 24 >> 24;
      break;
    case 3:
      xstart = 2 + ((G.x_maze_max - 2 - xsize) / 2 | 0) << 24 >> 24;
      break;
    case 4:
      xstart = 2 + ((G.x_maze_max - 2 - xsize) * 3 / 4 | 0) << 24 >> 24;
      break;
    case 5:
      xstart = G.x_maze_max - xsize - 1 << 24 >> 24;
      break;
    }
    switch (valign[0]) {
    case 1:
      ystart = 3;
      break;
    case 3:
      ystart = 2 + ((G.y_maze_max - 2 - ysize) / 2 | 0) << 24 >> 24;
      break;
    case 5:
      ystart = G.y_maze_max - ysize - 1 << 24 >> 24;
      break;
    }
    if (!(xstart % 2)) {
      xstart = xstart + 1 << 24 >> 24;
    }
    if (!(ystart % 2)) {
      ystart = ystart + 1 << 24 >> 24;
    }
    break;
  case 2:
    if (!coder.croom) {
      xstart = 1;
      ystart = 0;
      xsize = COLNO - 1 - tmpmazepart.xsize << 24 >> 24;
      ysize = ROWNO - tmpmazepart.ysize << 24 >> 24;
    }
    await get_location_coord(P(halign, 0), P(valign, 0), ANY_LOC, coder.croom, mpa.vardata.l);
    xsize = tmpmazepart.xsize;
    ysize = tmpmazepart.ysize;
    xstart = halign[0];
    ystart = valign[0];
    break;
  }
  if (ystart < 0 || ystart + ysize > ROWNO) {
    ystart = ystart + (ystart > 0 ? -2 : 2) << 24 >> 24;
    if (ysize === ROWNO) {
      ystart = 0;
    }
    if (ystart < 0 || ystart + ysize > ROWNO) {
      await panic(S("reading special level with ysize too large"));
    }
  }
  if (xsize <= 1 && ysize <= 1) {
    xstart = 1;
    ystart = 0;
    xsize = COLNO - 1;
    ysize = ROWNO;
  } else {
    let x = 0;
    let y = 0;
    let mptyp = 0;
    for (y = ystart; y < ystart + ysize; y = y + 1 << 24 >> 24) {
      for (x = xstart; x < xstart + xsize; x = x + 1 << 24 >> 24) {
        mptyp = mpmap.vardata.str.a[mpmap.vardata.str.o + (Math.imul(y - ystart, xsize) + (x - xstart))] - 1 << 24 >> 24;
        if (mptyp >= MAX_TYPE) {
          continue;
        }
        $at2(G.level.locations, x, y).typ = mptyp;
        $at2(G.level.locations, x, y).lit = (FALSE) & 1;
        $at2(G.level.locations, x, y).flags = 0;
        $at2(G.level.locations, x, y).horizontal = 0;
        $at2(G.level.locations, x, y).roomno = 0;
        $at2(G.level.locations, x, y).edge = 0;
        SpLev_Map[x][y] = 1;
        if ($at2(G.level.locations, x, y).typ === SDOOR || $at2(G.level.locations, x, y).typ === DOOR) {
          if ($at2(G.level.locations, x, y).typ === SDOOR) {
            $at2(G.level.locations, x, y).flags = (D_CLOSED) & 31;
          }
          if (x !== xstart && ($at2(G.level.locations, x - 1, y).typ && $at2(G.level.locations, x - 1, y).typ <= DBWALL || $at2(G.level.locations, x - 1, y).horizontal | 0)) {
            $at2(G.level.locations, x, y).horizontal = 1;
          }
        } else if ($at2(G.level.locations, x, y).typ === HWALL || $at2(G.level.locations, x, y).typ === IRONBARS) {
          $at2(G.level.locations, x, y).horizontal = 1;
        } else if ($at2(G.level.locations, x, y).typ === LAVAPOOL) {
          $at2(G.level.locations, x, y).lit = 1;
        } else if (splev_init_present && $at2(G.level.locations, x, y).typ === ICE) {
          $at2(G.level.locations, x, y).flags = ((icedpools ? ICED_POOL : ICED_MOAT) >>> 0) & 31;
        }
      }
    }
    if (coder.lvl_is_joined) {
      await remove_rooms(xstart, ystart, xstart + xsize, ystart + ysize);
    }
  }
  if (!mpkeepr.vardata.l) {
    xstart = tmpxstart;
    ystart = tmpystart;
    xsize = tmpxsize;
    ysize = tmpysize;
  }
  do {
    if (mpxs) {
      await opvar_free_x(mpxs);
      mpxs = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_map$nhFunc));
    }
  } while (0);
  do {
    if (mpys) {
      await opvar_free_x(mpys);
      mpys = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_map$nhFunc));
    }
  } while (0);
  do {
    if (mpmap) {
      await opvar_free_x(mpmap);
      mpmap = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_map$nhFunc));
    }
  } while (0);
  do {
    if (mpa) {
      await opvar_free_x(mpa);
      mpa = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_map$nhFunc));
    }
  } while (0);
  do {
    if (mpkeepr) {
      await opvar_free_x(mpkeepr);
      mpkeepr = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_map$nhFunc));
    }
  } while (0);
  do {
    if (mpzalign) {
      await opvar_free_x(mpzalign);
      mpzalign = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_map$nhFunc));
    }
  } while (0);
}

export async function spo_jmp(coder: struct_sp_coder | null, lvl: struct_sp_lev | null): Promise<void> {
  let tmpa = null;
  let a = 0;
  if (!(tmpa = await splev_stack_getdat(coder, 1))) {
    return;
  }
  a = sp_code_jmpaddr(coder.frame.n_opcode, tmpa.vardata.l - 1);
  if (a >= 0 && a < lvl.n_opcodes && a !== coder.frame.n_opcode) {
    coder.frame.n_opcode = a;
  }
  do {
    if (tmpa) {
      await opvar_free_x(tmpa);
      tmpa = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_jmp$nhFunc));
    }
  } while (0);
}

export async function spo_conditional_jump(coder: struct_sp_coder | null, lvl: struct_sp_lev | null): Promise<void> {
  let oa = null;
  let oc = null;
  let a = 0;
  let c = 0;
  let test = 0;
  if (!(oa = await splev_stack_getdat(coder, 1)) || !(oc = await splev_stack_getdat(coder, 1))) {
    return;
  }
  a = sp_code_jmpaddr(coder.frame.n_opcode, oa.vardata.l - 1);
  c = oc.vardata.l;
  switch (coder.opcode) {
  default:
    await impossible(S("spo_conditional_jump: illegal opcode"));
    break;
  case SPO_JL:
    test = c & SP_CPUFLAG_LT | 0;
    break;
  case SPO_JLE:
    test = c & (SP_CPUFLAG_LT | SP_CPUFLAG_EQ) | 0;
    break;
  case SPO_JG:
    test = c & SP_CPUFLAG_GT | 0;
    break;
  case SPO_JGE:
    test = c & (SP_CPUFLAG_GT | SP_CPUFLAG_EQ) | 0;
    break;
  case SPO_JE:
    test = c & SP_CPUFLAG_EQ | 0;
    break;
  case SPO_JNE:
    test = c & ~SP_CPUFLAG_EQ | 0;
    break;
  }
  if (test && a >= 0 && a < lvl.n_opcodes && a !== coder.frame.n_opcode) {
    coder.frame.n_opcode = a;
  }
  do {
    if (oa) {
      await opvar_free_x(oa);
      oa = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_conditional_jump$nhFunc));
    }
  } while (0);
  do {
    if (oc) {
      await opvar_free_x(oc);
      oc = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_conditional_jump$nhFunc));
    }
  } while (0);
}

export async function spo_var_init(coder: struct_sp_coder | null): Promise<void> {
  let $g = 0;
  let vname = null;
  let arraylen = null;
  let vvalue = null;
  let tmpvar = null;
  let tmp2 = null;
  let idx = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      vname = await splev_stack_getdat(coder, 2);
      arraylen = await splev_stack_getdat(coder, 1);
      if (!vname || !arraylen) {
        await panic(S("no values for SPO_VAR_INIT"));
      }
      tmpvar = opvar_var_defined(coder, vname.vardata.str);
      if (!tmpvar) { $g = 4; continue $L; }
      {
        if (arraylen.vardata.l < 0) {
          if (tmpvar.array_len) {
            idx = tmpvar.array_len;
            while (idx-- > 0) {
              do {
                if (tmpvar.data.arrayvalues.a[tmpvar.data.arrayvalues.o + idx]) {
                  await opvar_free_x(tmpvar.data.arrayvalues.a[tmpvar.data.arrayvalues.o + idx]);
                  tmpvar.data.arrayvalues.a[tmpvar.data.arrayvalues.o + idx] = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(spo_var_init$nhFunc));
                }
              } while (0);
            }
            if (tmpvar.data.arrayvalues) {
              free(tmpvar.data.arrayvalues);
            }
          } else {
            do {
              if (tmpvar.data.value) {
                await opvar_free_x(tmpvar.data.value);
                tmpvar.data.value = null;
              } else {
                await impossible(S("opvar_free(), %s"), P(spo_var_init$nhFunc));
              }
            } while (0);
          }
          tmpvar.data.arrayvalues = null;
          { $g = 1; continue $L; }
        } else if (arraylen.vardata.l) {
          idx = tmpvar.array_len;
          while (idx-- > 0) {
            do {
              if (tmpvar.data.arrayvalues.a[tmpvar.data.arrayvalues.o + idx]) {
                await opvar_free_x(tmpvar.data.arrayvalues.a[tmpvar.data.arrayvalues.o + idx]);
                tmpvar.data.arrayvalues.a[tmpvar.data.arrayvalues.o + idx] = null;
              } else {
                await impossible(S("opvar_free(), %s"), P(spo_var_init$nhFunc));
              }
            } while (0);
          }
          if (tmpvar.data.arrayvalues) {
            free(tmpvar.data.arrayvalues);
          }
          tmpvar.data.arrayvalues = null;
          { $g = 2; continue $L; }
        } else {
          vvalue = await splev_stack_getdat_any(coder);
          if (tmpvar.svtyp !== vvalue.spovartyp) {
            await panic(S("redefining variable as different type"));
          }
          do {
            if (tmpvar.data.value) {
              await opvar_free_x(tmpvar.data.value);
              tmpvar.data.value = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(spo_var_init$nhFunc));
            }
          } while (0);
          tmpvar.data.value = vvalue;
          tmpvar.array_len = 0;
        }
      }
      { $g = 3; continue $L; }
    case 4:
      tmpvar = new struct_splev_var();
      tmpvar.next = coder.frame.variables;
      tmpvar.name = await dupstr(vname.vardata.str);
      coder.frame.variables = tmpvar;
      if (!(arraylen.vardata.l < 0)) { $g = 6; continue $L; }
    case 1: // copy_variable
      vvalue = await splev_stack_getdat_any(coder);
      tmp2 = opvar_var_defined(coder, vvalue.vardata.str);
      if (!tmp2) {
        await panic(S("no copyable var"));
      }
      tmpvar.svtyp = tmp2.svtyp;
      tmpvar.array_len = tmp2.array_len;
      if (tmpvar.array_len) {
        idx = tmpvar.array_len;
        tmpvar.data.arrayvalues = P(new Array((8 * $u64(idx) >>> 0) / 8).fill(null));
        while (idx-- > 0) {
          tmpvar.data.arrayvalues.a[tmpvar.data.arrayvalues.o + idx] = await opvar_clone(tmp2.data.arrayvalues.a[tmp2.data.arrayvalues.o + idx]);
        }
      } else {
        tmpvar.data.value = await opvar_clone(tmp2.data.value);
      }
      do {
        if (vvalue) {
          await opvar_free_x(vvalue);
          vvalue = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(spo_var_init$nhFunc));
        }
      } while (0);
      { $g = 5; continue $L; }
    case 6:
      if (!arraylen.vardata.l) { $g = 8; continue $L; }
    case 2: // create_new_array
      idx = arraylen.vardata.l;
      tmpvar.array_len = idx;
      tmpvar.data.arrayvalues = P(new Array((8 * $u64(idx) >>> 0) / 8).fill(null));
      while (idx-- > 0) {
        vvalue = await splev_stack_getdat_any(coder);
        if (!vvalue) {
          await panic(S("no value for arrayvariable"));
        }
        tmpvar.data.arrayvalues.a[tmpvar.data.arrayvalues.o + idx] = vvalue;
      }
      tmpvar.svtyp = SPOVAR_ARRAY;
      { $g = 7; continue $L; }
    case 8:
      {
        vvalue = await splev_stack_getdat_any(coder);
        if (!vvalue) {
          await panic(S("no value for variable"));
        }
        tmpvar.svtyp = vvalue.spovartyp;
        tmpvar.data.value = vvalue;
        tmpvar.array_len = 0;
      }
    case 7:
    case 5:
    case 3:
      do {
        if (vname) {
          await opvar_free_x(vname);
          vname = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(spo_var_init$nhFunc));
        }
      } while (0);
      do {
        if (arraylen) {
          await opvar_free_x(arraylen);
          arraylen = null;
        } else {
          await impossible(S("opvar_free(), %s"), P(spo_var_init$nhFunc));
        }
      } while (0);
    }
    break;
  }
}

export async function spo_shuffle_array(coder: struct_sp_coder | null): Promise<void> {
  let vname = null;
  let tmp = null;
  let tmp2 = null;
  let i = 0;
  let j = 0;
  if (!(vname = await splev_stack_getdat(coder, 2))) {
    return;
  }
  tmp = opvar_var_defined(coder, vname.vardata.str);
  if (!tmp || tmp.array_len < 1) {
    do {
      if (vname) {
        await opvar_free_x(vname);
        vname = null;
      } else {
        await impossible(S("opvar_free(), %s"), P(spo_shuffle_array$nhFunc));
      }
    } while (0);
    return;
  }
  for (i = tmp.array_len - 1; i > 0; --i) {
    if ((j = rn2(i + 1 | 0)) === i) {
      continue;
    }
    tmp2 = tmp.data.arrayvalues.a[tmp.data.arrayvalues.o + j];
    tmp.data.arrayvalues.a[tmp.data.arrayvalues.o + j] = tmp.data.arrayvalues.a[tmp.data.arrayvalues.o + i];
    tmp.data.arrayvalues.a[tmp.data.arrayvalues.o + i] = tmp2;
  }
  do {
    if (vname) {
      await opvar_free_x(vname);
      vname = null;
    } else {
      await impossible(S("opvar_free(), %s"), P(spo_shuffle_array$nhFunc));
    }
  } while (0);
}

async function sp_level_coder(lvl: struct_sp_lev | null): Promise<number> {
  let $t1: any;
  let $g = 0;
  let exec_opcodes = 0;
  let tmpi = 0;
  let room_stack = 0;
  let max_execution = 0;
  let coder = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      exec_opcodes = 0;
      room_stack = 0;
      max_execution = SPCODER_MAX_RUNTIME;
      coder = new struct_sp_coder();
      coder.frame = await frame_new(0);
      coder.stack = null;
      coder.premapped = FALSE;
      coder.solidify = FALSE;
      coder.check_inaccessibles = FALSE;
      coder.croom = null;
      coder.n_subroom = 1;
      coder.exit_script = FALSE;
      coder.lvl_is_joined = 0;
      splev_init_present = FALSE;
      icedpools = FALSE;
      mines_prize_count = soko_prize_count = 0;
      if (G.flags.debug) {
        let met = nh_getenv(S("SPCODER_MAX_RUNTIME"));
        if (met && met.a[met.o] === 49) {
          max_execution = (1 << 30) - 1;
        }
      }
      for (tmpi = 0; tmpi <= MAX_NESTED_ROOMS; ++tmpi) {
        coder.tmproomlist[tmpi] = null;
        coder.failed_room[tmpi] = FALSE;
      }
      shuffle_alignments();
      for (tmpi = 0; tmpi < MAX_CONTAINMENT; ++tmpi) {
        container_obj[tmpi] = null;
      }
      container_idx = 0;
      invent_carrying_monster = null;
      memset(P(SpLev_Map[0], 0), 0, 1680);
      G.level.flags.is_maze_lev = 0;
      xstart = 1;
      ystart = 0;
      xsize = COLNO - 1;
      ysize = ROWNO;
    case 2:
      if (!(coder.frame.n_opcode < lvl.n_opcodes && !coder.exit_script)) { $g = 3; continue $L; }
      coder.opcode = $sadd(lvl.opcodes, coder.frame.n_opcode).opcode;
      coder.opdat = $sadd(lvl.opcodes, coder.frame.n_opcode).opdat;
      coder.stack = coder.frame.stack;
      if (($t1 = exec_opcodes, exec_opcodes = $u64($t1 + 1), $t1) > max_execution) {
        await impossible(S("Level script is taking too much time, stopping."));
        coder.exit_script = TRUE;
      }
      if (coder.failed_room[coder.n_subroom - 1] && coder.opcode !== SPO_ENDROOM && coder.opcode !== SPO_ROOM && coder.opcode !== SPO_SUBROOM) {
        { $g = 1; continue $L; }
      }
      coder.croom = coder.tmproomlist[coder.n_subroom - 1];
      switch (coder.opcode) {
      case SPO_NULL:
        break;
      case SPO_EXIT:
        coder.exit_script = TRUE;
        break;
      case SPO_FRAME_PUSH:
        await spo_frame_push(coder);
        break;
      case SPO_FRAME_POP:
        await spo_frame_pop(coder);
        break;
      case SPO_CALL:
        await spo_call(coder);
        break;
      case SPO_RETURN:
        await spo_return(coder);
        break;
      case SPO_END_MONINVENT:
        await spo_end_moninvent(coder);
        break;
      case SPO_POP_CONTAINER:
        spo_pop_container(coder);
        break;
      case SPO_POP:
        {
          let ov = await splev_stack_pop(coder.stack);
          do {
            if (ov) {
              await opvar_free_x(ov);
              ov = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_PUSH:
        await splev_stack_push(coder.stack, await opvar_clone(coder.opdat));
        break;
      case SPO_MESSAGE:
        await spo_message(coder);
        break;
      case SPO_MONSTER:
        await spo_monster(coder);
        break;
      case SPO_OBJECT:
        await spo_object(coder);
        break;
      case SPO_LEVEL_FLAGS:
        await spo_level_flags(coder);
        break;
      case SPO_INITLEVEL:
        await spo_initlevel(coder);
        break;
      case SPO_ENGRAVING:
        await spo_engraving(coder);
        break;
      case SPO_MINERALIZE:
        await spo_mineralize(coder);
        break;
      case SPO_SUBROOM:
      case SPO_ROOM:
        if (!coder.failed_room[coder.n_subroom - 1]) {
          await spo_room(coder);
        } else {
          ++room_stack;
        }
        break;
      case SPO_ENDROOM:
        if (coder.failed_room[coder.n_subroom - 1]) {
          if (!room_stack) {
            spo_endroom(coder);
          } else {
            --room_stack;
          }
        } else {
          spo_endroom(coder);
        }
        break;
      case SPO_DOOR:
        await spo_door(coder);
        break;
      case SPO_STAIR:
        await spo_stair(coder);
        break;
      case SPO_LADDER:
        await spo_ladder(coder);
        break;
      case SPO_GRAVE:
        await spo_grave(coder);
        break;
      case SPO_ALTAR:
        await spo_altar(coder);
        break;
      case SPO_SINK:
      case SPO_POOL:
      case SPO_FOUNTAIN:
        await spo_feature(coder);
        break;
      case SPO_TRAP:
        await spo_trap(coder);
        break;
      case SPO_GOLD:
        await spo_gold(coder);
        break;
      case SPO_CORRIDOR:
        await spo_corridor(coder);
        break;
      case SPO_TERRAIN:
        await spo_terrain(coder);
        break;
      case SPO_REPLACETERRAIN:
        await spo_replace_terrain(coder);
        break;
      case SPO_LEVREGION:
        await spo_levregion(coder);
        break;
      case SPO_REGION:
        await spo_region(coder);
        break;
      case SPO_DRAWBRIDGE:
        await spo_drawbridge(coder);
        break;
      case SPO_MAZEWALK:
        await spo_mazewalk(coder);
        break;
      case SPO_NON_PASSWALL:
      case SPO_NON_DIGGABLE:
        await spo_wall_property(coder);
        break;
      case SPO_ROOM_DOOR:
        await spo_room_door(coder);
        break;
      case SPO_WALLIFY:
        await spo_wallify(coder);
        break;
      case SPO_COPY:
        {
          let a = await splev_stack_pop(coder.stack);
          await splev_stack_push(coder.stack, await opvar_clone(a));
          await splev_stack_push(coder.stack, await opvar_clone(a));
          do {
            if (a) {
              await opvar_free_x(a);
              a = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_DEC:
        {
          let a = null;
          if (!(a = await splev_stack_getdat(coder, 1))) {
            break;
          }
          --a.vardata.l;
          await splev_stack_push(coder.stack, a);
          break;
        }
      case SPO_INC:
        {
          let a = null;
          if (!(a = await splev_stack_getdat(coder, 1))) {
            break;
          }
          ++a.vardata.l;
          await splev_stack_push(coder.stack, a);
          break;
        }
      case SPO_MATH_SIGN:
        {
          let a = null;
          if (!(a = await splev_stack_getdat(coder, 1))) {
            break;
          }
          a.vardata.l = a.vardata.l < 0 ? -1 : a.vardata.l > 0 ? 1 : 0;
          await splev_stack_push(coder.stack, a);
          break;
        }
      case SPO_MATH_ADD:
        {
          let a = null;
          let b = null;
          if (!(b = await splev_stack_getdat_any(coder)) || !(a = await splev_stack_getdat_any(coder))) {
            break;
          }
          if (b.spovartyp === a.spovartyp) {
            if (a.spovartyp === SPOVAR_INT) {
              a.vardata.l = a.vardata.l + b.vardata.l;
              await splev_stack_push(coder.stack, a);
              do {
                if (b) {
                  await opvar_free_x(b);
                  b = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
                }
              } while (0);
            } else if (a.spovartyp === SPOVAR_STRING) {
              let c = null;
              let tmpbuf = P(new Int8Array((strlen(a.vardata.str) + strlen(b.vardata.str) + 1 >>> 0)));
              sprintf(tmpbuf, S("%s%s"), a.vardata.str, b.vardata.str);
              c = await opvar_new_str(tmpbuf);
              await splev_stack_push(coder.stack, c);
              do {
                if (a) {
                  await opvar_free_x(a);
                  a = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
                }
              } while (0);
              do {
                if (b) {
                  await opvar_free_x(b);
                  b = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
                }
              } while (0);
              if (tmpbuf) {
                free(tmpbuf);
              }
            } else {
              await splev_stack_push(coder.stack, a);
              do {
                if (b) {
                  await opvar_free_x(b);
                  b = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
                }
              } while (0);
              await impossible(S("adding weird types"));
            }
          } else {
            await splev_stack_push(coder.stack, a);
            do {
              if (b) {
                await opvar_free_x(b);
                b = null;
              } else {
                await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
              }
            } while (0);
            await impossible(S("adding different types"));
          }
          break;
        }
      case SPO_MATH_SUB:
        {
          let a = null;
          let b = null;
          if (!(b = await splev_stack_getdat(coder, 1)) || !(a = await splev_stack_getdat(coder, 1))) {
            break;
          }
          a.vardata.l = a.vardata.l - b.vardata.l;
          await splev_stack_push(coder.stack, a);
          do {
            if (b) {
              await opvar_free_x(b);
              b = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_MATH_MUL:
        {
          let a = null;
          let b = null;
          if (!(b = await splev_stack_getdat(coder, 1)) || !(a = await splev_stack_getdat(coder, 1))) {
            break;
          }
          a.vardata.l = a.vardata.l * b.vardata.l;
          await splev_stack_push(coder.stack, a);
          do {
            if (b) {
              await opvar_free_x(b);
              b = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_MATH_DIV:
        {
          let a = null;
          let b = null;
          if (!(b = await splev_stack_getdat(coder, 1)) || !(a = await splev_stack_getdat(coder, 1))) {
            break;
          }
          if (b.vardata.l >= 1) {
            a.vardata.l = Math.trunc(a.vardata.l / b.vardata.l);
          } else {
            a.vardata.l = 0;
          }
          await splev_stack_push(coder.stack, a);
          do {
            if (b) {
              await opvar_free_x(b);
              b = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_MATH_MOD:
        {
          let a = null;
          let b = null;
          if (!(b = await splev_stack_getdat(coder, 1)) || !(a = await splev_stack_getdat(coder, 1))) {
            break;
          }
          if (b.vardata.l > 0) {
            a.vardata.l = a.vardata.l % b.vardata.l;
          } else {
            a.vardata.l = 0;
          }
          await splev_stack_push(coder.stack, a);
          do {
            if (b) {
              await opvar_free_x(b);
              b = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_CMP:
        {
          let a = null;
          let b = null;
          let c = null;
          let val = 0;
          b = await splev_stack_getdat_any(coder);
          a = await splev_stack_getdat_any(coder);
          if (!a || !b) {
            await impossible(S("spo_cmp: no values in stack"));
            break;
          }
          if (a.spovartyp !== b.spovartyp) {
            await impossible(S("spo_cmp: trying to compare differing datatypes"));
            break;
          }
          switch (a.spovartyp) {
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
          case 1:
            if (b.vardata.l > a.vardata.l) {
              val = val | SP_CPUFLAG_LT;
            }
            if (b.vardata.l < a.vardata.l) {
              val = val | SP_CPUFLAG_GT;
            }
            if (b.vardata.l === a.vardata.l) {
              val = val | SP_CPUFLAG_EQ;
            }
            c = await opvar_new_int(val);
            break;
          case 2:
            c = await opvar_new_int(!strcmp(b.vardata.str, a.vardata.str) ? SP_CPUFLAG_EQ : 0);
            break;
          default:
            c = await opvar_new_int(0);
            break;
          }
          await splev_stack_push(coder.stack, c);
          do {
            if (a) {
              await opvar_free_x(a);
              a = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (b) {
              await opvar_free_x(b);
              b = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_JMP:
        await spo_jmp(coder, lvl);
        break;
      case SPO_JL:
      case SPO_JLE:
      case SPO_JG:
      case SPO_JGE:
      case SPO_JE:
      case SPO_JNE:
        await spo_conditional_jump(coder, lvl);
        break;
      case SPO_RN2:
        {
          let tmpv = null;
          let t = null;
          if (!(tmpv = await splev_stack_getdat(coder, 1))) {
            break;
          }
          t = await opvar_new_int(tmpv.vardata.l > 1 ? rn2(tmpv.vardata.l | 0) : 0);
          await splev_stack_push(coder.stack, t);
          do {
            if (tmpv) {
              await opvar_free_x(tmpv);
              tmpv = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_DICE:
        {
          let a = null;
          let b = null;
          let t = null;
          if (!(b = await splev_stack_getdat(coder, 1)) || !(a = await splev_stack_getdat(coder, 1))) {
            break;
          }
          if (b.vardata.l < 1) {
            b.vardata.l = 1;
          }
          if (a.vardata.l < 1) {
            a.vardata.l = 1;
          }
          t = await opvar_new_int(d(a.vardata.l | 0, b.vardata.l | 0));
          await splev_stack_push(coder.stack, t);
          do {
            if (a) {
              await opvar_free_x(a);
              a = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (b) {
              await opvar_free_x(b);
              b = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_MAP:
        await spo_map(coder);
        break;
      case SPO_VAR_INIT:
        await spo_var_init(coder);
        break;
      case SPO_SHUFFLE_ARRAY:
        await spo_shuffle_array(coder);
        break;
      case SPO_SEL_ADD:
        {
          let sel1 = null;
          let sel2 = null;
          let pt = null;
          if (!(sel1 = await splev_stack_getdat(coder, 9))) {
            await panic(S("no sel1 for add"));
          }
          if (!(sel2 = await splev_stack_getdat(coder, 9))) {
            await panic(S("no sel2 for add"));
          }
          pt = await selection_logical_oper(sel1, sel2, 124);
          do {
            if (sel1) {
              await opvar_free_x(sel1);
              sel1 = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (sel2) {
              await opvar_free_x(sel2);
              sel2 = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          await splev_stack_push(coder.stack, pt);
          break;
        }
      case SPO_SEL_COMPLEMENT:
        {
          let sel = null;
          let pt = null;
          if (!(sel = await splev_stack_getdat(coder, 9))) {
            await panic(S("no sel for not"));
          }
          pt = await selection_not(sel);
          do {
            if (sel) {
              await opvar_free_x(sel);
              sel = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          await splev_stack_push(coder.stack, pt);
          break;
        }
      case SPO_SEL_FILTER:
        {
          let filtertype = null;
          if (!(filtertype = await splev_stack_getdat(coder, 1))) {
            await panic(S("no sel filter type"));
          }
          switch (filtertype.vardata.l) {
          case 0:
            {
              let tmp1 = null;
              let sel = null;
              if (!(tmp1 = await splev_stack_getdat(coder, 1))) {
                await panic(S("no sel filter percent"));
              }
              if (!(sel = await splev_stack_getdat(coder, 9))) {
                await panic(S("no sel filter"));
              }
              selection_filter_percent(sel, tmp1.vardata.l | 0);
              await splev_stack_push(coder.stack, sel);
              do {
                if (tmp1) {
                  await opvar_free_x(tmp1);
                  tmp1 = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
                }
              } while (0);
              break;
            }
          case 1:
            {
              let pt = null;
              let sel1 = null;
              let sel2 = null;
              if (!(sel1 = await splev_stack_getdat(coder, 9))) {
                await panic(S("no sel filter sel1"));
              }
              if (!(sel2 = await splev_stack_getdat(coder, 9))) {
                await panic(S("no sel filter sel2"));
              }
              pt = await selection_logical_oper(sel1, sel2, 38);
              await splev_stack_push(coder.stack, pt);
              do {
                if (sel1) {
                  await opvar_free_x(sel1);
                  sel1 = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
                }
              } while (0);
              do {
                if (sel2) {
                  await opvar_free_x(sel2);
                  sel2 = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
                }
              } while (0);
              break;
            }
          case 2:
            {
              let pt = null;
              let tmp1 = null;
              let sel = null;
              if (!(sel = await splev_stack_getdat(coder, 9))) {
                await panic(S("no sel filter"));
              }
              if (!(tmp1 = await splev_stack_getdat(coder, 6))) {
                await panic(S("no sel filter mapchar"));
              }
              pt = await selection_filter_mapchar(sel, tmp1);
              await splev_stack_push(coder.stack, pt);
              do {
                if (tmp1) {
                  await opvar_free_x(tmp1);
                  tmp1 = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
                }
              } while (0);
              do {
                if (sel) {
                  await opvar_free_x(sel);
                  sel = null;
                } else {
                  await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
                }
              } while (0);
              break;
            }
          default:
            await panic(S("unknown sel filter type"));
          }
          do {
            if (filtertype) {
              await opvar_free_x(filtertype);
              filtertype = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_SEL_POINT:
        {
          let tmp = null;
          let pt = await selection_opvar(null);
          const x = new Int8Array(1);
          const y = new Int8Array(1);
          if (!(tmp = await splev_stack_getdat(coder, 4))) {
            await panic(S("no ter sel coord"));
          }
          await get_location_coord(P(x, 0), P(y, 0), ANY_LOC, coder.croom, tmp.vardata.l);
          selection_setpoint(x[0], y[0], pt, 1);
          await splev_stack_push(coder.stack, pt);
          do {
            if (tmp) {
              await opvar_free_x(tmp);
              tmp = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_SEL_RECT:
      case SPO_SEL_FILLRECT:
        {
          let tmp = null;
          let pt = await selection_opvar(null);
          let x = 0;
          let y = 0;
          const x1 = new Int8Array(1);
          const y1 = new Int8Array(1);
          const x2 = new Int8Array(1);
          const y2 = new Int8Array(1);
          if (!(tmp = await splev_stack_getdat(coder, 5))) {
            await panic(S("no ter sel region"));
          }
          x1[0] = ((tmp.vardata.l & 255) < ($shr64(tmp.vardata.l, 16) & 255) ? tmp.vardata.l & 255 : $shr64(tmp.vardata.l, 16) & 255) << 24 >> 24;
          y1[0] = (($shr64(tmp.vardata.l, 8) & 255) < ($shr64(tmp.vardata.l, 24) & 255) ? $shr64(tmp.vardata.l, 8) & 255 : $shr64(tmp.vardata.l, 24) & 255) << 24 >> 24;
          x2[0] = ((tmp.vardata.l & 255) > ($shr64(tmp.vardata.l, 16) & 255) ? tmp.vardata.l & 255 : $shr64(tmp.vardata.l, 16) & 255) << 24 >> 24;
          y2[0] = (($shr64(tmp.vardata.l, 8) & 255) > ($shr64(tmp.vardata.l, 24) & 255) ? $shr64(tmp.vardata.l, 8) & 255 : $shr64(tmp.vardata.l, 24) & 255) << 24 >> 24;
          await get_location(P(x1, 0), P(y1, 0), ANY_LOC, coder.croom);
          await get_location(P(x2, 0), P(y2, 0), ANY_LOC, coder.croom);
          x1[0] = (x1[0] < 0 ? 0 : x1[0]) << 24 >> 24;
          y1[0] = (y1[0] < 0 ? 0 : y1[0]) << 24 >> 24;
          x2[0] = (x2[0] >= COLNO ? COLNO - 1 : x2[0]) << 24 >> 24;
          y2[0] = (y2[0] >= ROWNO ? ROWNO - 1 : y2[0]) << 24 >> 24;
          if (coder.opcode === SPO_SEL_RECT) {
            for (x = x1[0]; x <= x2[0]; x = x + 1 << 24 >> 24) {
              selection_setpoint(x, y1[0], pt, 1);
              selection_setpoint(x, y2[0], pt, 1);
            }
            for (y = y1[0]; y <= y2[0]; y = y + 1 << 24 >> 24) {
              selection_setpoint(x1[0], y, pt, 1);
              selection_setpoint(x2[0], y, pt, 1);
            }
          } else {
            for (x = x1[0]; x <= x2[0]; x = x + 1 << 24 >> 24) {
              for (y = y1[0]; y <= y2[0]; y = y + 1 << 24 >> 24) {
                selection_setpoint(x, y, pt, 1);
              }
            }
          }
          await splev_stack_push(coder.stack, pt);
          do {
            if (tmp) {
              await opvar_free_x(tmp);
              tmp = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_SEL_LINE:
        {
          let tmp = null;
          let tmp2 = null;
          let pt = await selection_opvar(null);
          const x1 = new Int8Array(1);
          const y1 = new Int8Array(1);
          const x2 = new Int8Array(1);
          const y2 = new Int8Array(1);
          if (!(tmp = await splev_stack_getdat(coder, 4))) {
            await panic(S("no ter sel linecoord1"));
          }
          if (!(tmp2 = await splev_stack_getdat(coder, 4))) {
            await panic(S("no ter sel linecoord2"));
          }
          await get_location_coord(P(x1, 0), P(y1, 0), ANY_LOC, coder.croom, tmp.vardata.l);
          await get_location_coord(P(x2, 0), P(y2, 0), ANY_LOC, coder.croom, tmp2.vardata.l);
          x1[0] = (x1[0] < 0 ? 0 : x1[0]) << 24 >> 24;
          y1[0] = (y1[0] < 0 ? 0 : y1[0]) << 24 >> 24;
          x2[0] = (x2[0] >= COLNO ? COLNO - 1 : x2[0]) << 24 >> 24;
          y2[0] = (y2[0] >= ROWNO ? ROWNO - 1 : y2[0]) << 24 >> 24;
          selection_do_line(x1[0], y1[0], x2[0], y2[0], pt);
          await splev_stack_push(coder.stack, pt);
          do {
            if (tmp) {
              await opvar_free_x(tmp);
              tmp = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (tmp2) {
              await opvar_free_x(tmp2);
              tmp2 = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_SEL_RNDLINE:
        {
          let tmp = null;
          let tmp2 = null;
          let tmp3 = null;
          let pt = await selection_opvar(null);
          const x1 = new Int8Array(1);
          const y1 = new Int8Array(1);
          const x2 = new Int8Array(1);
          const y2 = new Int8Array(1);
          if (!(tmp3 = await splev_stack_getdat(coder, 1))) {
            await panic(S("no ter sel randline1"));
          }
          if (!(tmp = await splev_stack_getdat(coder, 4))) {
            await panic(S("no ter sel randline2"));
          }
          if (!(tmp2 = await splev_stack_getdat(coder, 4))) {
            await panic(S("no ter sel randline3"));
          }
          await get_location_coord(P(x1, 0), P(y1, 0), ANY_LOC, coder.croom, tmp.vardata.l);
          await get_location_coord(P(x2, 0), P(y2, 0), ANY_LOC, coder.croom, tmp2.vardata.l);
          x1[0] = (x1[0] < 0 ? 0 : x1[0]) << 24 >> 24;
          y1[0] = (y1[0] < 0 ? 0 : y1[0]) << 24 >> 24;
          x2[0] = (x2[0] >= COLNO ? COLNO - 1 : x2[0]) << 24 >> 24;
          y2[0] = (y2[0] >= ROWNO ? ROWNO - 1 : y2[0]) << 24 >> 24;
          selection_do_randline(x1[0], y1[0], x2[0], y2[0], tmp3.vardata.l | 0, 12, pt);
          await splev_stack_push(coder.stack, pt);
          do {
            if (tmp) {
              await opvar_free_x(tmp);
              tmp = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (tmp2) {
              await opvar_free_x(tmp2);
              tmp2 = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (tmp3) {
              await opvar_free_x(tmp3);
              tmp3 = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_SEL_GROW:
        {
          let dirs = null;
          let pt = null;
          if (!(dirs = await splev_stack_getdat(coder, 1))) {
            await panic(S("no dirs for grow"));
          }
          if (!(pt = await splev_stack_getdat(coder, 9))) {
            await panic(S("no selection for grow"));
          }
          selection_do_grow(pt, dirs.vardata.l | 0);
          await splev_stack_push(coder.stack, pt);
          do {
            if (dirs) {
              await opvar_free_x(dirs);
              dirs = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_SEL_FLOOD:
        {
          let tmp = null;
          const x = new Int8Array(1);
          const y = new Int8Array(1);
          if (!(tmp = await splev_stack_getdat(coder, 4))) {
            await panic(S("no ter sel flood coord"));
          }
          await get_location_coord(P(x, 0), P(y, 0), ANY_LOC, coder.croom, tmp.vardata.l);
          if (isok(x[0], y[0])) {
            let pt = await selection_opvar(null);
            set_selection_floodfillchk(floodfillchk_match_under);
            floodfillchk_match_under_typ = $at2(G.level.locations, x[0], y[0]).typ;
            await selection_floodfill(pt, x[0], y[0], FALSE);
            await splev_stack_push(coder.stack, pt);
          }
          do {
            if (tmp) {
              await opvar_free_x(tmp);
              tmp = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_SEL_RNDCOORD:
        {
          let pt = null;
          const x = new Int8Array(1);
          const y = new Int8Array(1);
          if (!(pt = await splev_stack_getdat(coder, 9))) {
            await panic(S("no selection for rndcoord"));
          }
          if (selection_rndcoord(pt, P(x, 0), P(y, 0), FALSE)) {
            x[0] = x[0] - xstart << 24 >> 24;
            y[0] = y[0] - ystart << 24 >> 24;
          }
          await splev_stack_push(coder.stack, await opvar_new_coord(x[0], y[0]));
          do {
            if (pt) {
              await opvar_free_x(pt);
              pt = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_SEL_ELLIPSE:
        {
          let filled = null;
          let xaxis = null;
          let yaxis = null;
          let pt = null;
          let sel = await selection_opvar(null);
          const x = new Int8Array(1);
          const y = new Int8Array(1);
          if (!(filled = await splev_stack_getdat(coder, 1))) {
            await panic(S("no filled for ellipse"));
          }
          if (!(yaxis = await splev_stack_getdat(coder, 1))) {
            await panic(S("no yaxis for ellipse"));
          }
          if (!(xaxis = await splev_stack_getdat(coder, 1))) {
            await panic(S("no xaxis for ellipse"));
          }
          if (!(pt = await splev_stack_getdat(coder, 4))) {
            await panic(S("no pt for ellipse"));
          }
          await get_location_coord(P(x, 0), P(y, 0), ANY_LOC, coder.croom, pt.vardata.l);
          selection_do_ellipse(sel, x[0], y[0], xaxis.vardata.l | 0, yaxis.vardata.l | 0, filled.vardata.l | 0);
          await splev_stack_push(coder.stack, sel);
          do {
            if (filled) {
              await opvar_free_x(filled);
              filled = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (yaxis) {
              await opvar_free_x(yaxis);
              yaxis = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (xaxis) {
              await opvar_free_x(xaxis);
              xaxis = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (pt) {
              await opvar_free_x(pt);
              pt = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      case SPO_SEL_GRADIENT:
        {
          let gtyp = null;
          let glim = null;
          let mind = null;
          let maxd = null;
          let gcoord = null;
          let coord2 = null;
          let sel = null;
          const x = new Int8Array(1);
          const y = new Int8Array(1);
          const x2 = new Int8Array(1);
          const y2 = new Int8Array(1);
          if (!(gtyp = await splev_stack_getdat(coder, 1))) {
            await panic(S("no gtyp for grad"));
          }
          if (!(glim = await splev_stack_getdat(coder, 1))) {
            await panic(S("no glim for grad"));
          }
          if (!(coord2 = await splev_stack_getdat(coder, 4))) {
            await panic(S("no coord2 for grad"));
          }
          if (!(gcoord = await splev_stack_getdat(coder, 4))) {
            await panic(S("no coord for grad"));
          }
          if (!(maxd = await splev_stack_getdat(coder, 1))) {
            await panic(S("no maxd for grad"));
          }
          if (!(mind = await splev_stack_getdat(coder, 1))) {
            await panic(S("no mind for grad"));
          }
          await get_location_coord(P(x, 0), P(y, 0), ANY_LOC, coder.croom, gcoord.vardata.l);
          await get_location_coord(P(x2, 0), P(y2, 0), ANY_LOC, coder.croom, coord2.vardata.l);
          sel = await selection_opvar(null);
          selection_do_gradient(sel, x[0], y[0], x2[0], y2[0], gtyp.vardata.l, mind.vardata.l, maxd.vardata.l, glim.vardata.l);
          await splev_stack_push(coder.stack, sel);
          do {
            if (gtyp) {
              await opvar_free_x(gtyp);
              gtyp = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (glim) {
              await opvar_free_x(glim);
              glim = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (gcoord) {
              await opvar_free_x(gcoord);
              gcoord = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (coord2) {
              await opvar_free_x(coord2);
              coord2 = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (maxd) {
              await opvar_free_x(maxd);
              maxd = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          do {
            if (mind) {
              await opvar_free_x(mind);
              mind = null;
            } else {
              await impossible(S("opvar_free(), %s"), P(sp_level_coder$nhFunc));
            }
          } while (0);
          break;
        }
      default:
        await panic(S("sp_level_coder: Unknown opcode %i"), coder.opcode);
      }
    case 1: // next_opcode
      ++coder.frame.n_opcode;
      { $g = 2; continue $L; }
    case 3:
      link_doors_rooms();
      await fill_rooms();
      remove_boundary_syms();
      if (coder.check_inaccessibles) {
        await ensure_way_out();
      }
      if (!G.level.flags.corrmaze) {
        await wallification(1, 0, COLNO - 1, ROWNO - 1);
      }
      count_features();
      if (coder.solidify) {
        solidify_map();
      }
      await fixup_special();
      if (coder.premapped) {
        await sokoban_detect();
      }
      if (coder.frame) {
        let tmpframe = null;
        do {
          tmpframe = coder.frame.next;
          await frame_del(coder.frame);
          coder.frame = tmpframe;
        } while (coder.frame);
      }
      if (coder) {
        free(coder);
      }
      return TRUE;
    }
    break;
  }
}

export async function load_special(name: Ptr | null): Promise<number> {
  let $g = 0;
  let fd = null;
  let lvl = null;
  let result = 0;
  let vers_info = new struct_version_info();
  $L: for (;;) {
    switch ($g) {
    case 0:
      lvl = null;
      result = FALSE;
      vers_info = new struct_version_info();
      fd = await dlb_fopen(name, S("r"));
      if (!fd) {
        return FALSE;
      }
      dlb_fread(vers_info, 40, 1, fd);
      if (!await check_version(vers_info, name, TRUE)) {
        dlb_fclose(fd);
        { $g = 1; continue $L; }
      }
      lvl = new struct_sp_lev();
      result = await sp_level_loader(fd, lvl);
      dlb_fclose(fd);
      if (result) {
        result = await sp_level_coder(lvl);
      }
      await sp_level_free(lvl);
      if (lvl) {
        free(lvl);
      }
    case 1: // give_up
      return result;
    }
    break;
  }
}

export function $init(): void {
  SpLev_Map = $arr(80, () => new Int8Array(21));
  ralign = $ta(Int8Array, 3, [AM_CHAOTIC, AM_NEUTRAL, AM_LAWFUL]);
  xstart = 0;
  ystart = 0;
  xsize = 0;
  ysize = 0;
  G.lev_message = null;
  G.lregions = null;
  G.num_lregions = 0;
  splev_init_present = 0;
  icedpools = 0;
  mines_prize_count = 0;
  soko_prize_count = 0;
  container_obj = new Array(10).fill(null);
  container_idx = 0;
  invent_carrying_monster = null;
  selection_flood_check_func = null;
  floodfillchk_match_under_typ = 0;
  opvar_var_conversion$nhFunc = $cs("opvar_var_conversion", 21);
  splev_stack_getdat$nhFunc = $cs("splev_stack_getdat", 19);
  splev_stack_getdat_any$nhFunc = $cs("splev_stack_getdat_any", 23);
  variable_list_del$nhFunc = $cs("variable_list_del", 18);
  get_unpacked_coord$c = new struct_unpacked_coord();
  create_object$prize_warning = $cs("multiple prizes on %s level", 28);
  sp_level_free$nhFunc = $cs("sp_level_free", 14);
  spo_call$nhFunc = $cs("spo_call", 9);
  spo_return$nhFunc = $cs("spo_return", 11);
  spo_message$nhFunc = $cs("spo_message", 12);
  spo_monster$nhFunc = $cs("spo_monster", 12);
  spo_object$nhFunc = $cs("spo_object", 11);
  spo_level_flags$nhFunc = $cs("spo_level_flags", 16);
  spo_initlevel$nhFunc = $cs("spo_initlevel", 14);
  spo_engraving$nhFunc = $cs("spo_engraving", 14);
  spo_mineralize$nhFunc = $cs("spo_mineralize", 15);
  spo_room$nhFunc = $cs("spo_room", 9);
  spo_stair$nhFunc = $cs("spo_stair", 10);
  spo_ladder$nhFunc = $cs("spo_ladder", 11);
  spo_grave$nhFunc = $cs("spo_grave", 10);
  spo_altar$nhFunc = $cs("spo_altar", 10);
  spo_trap$nhFunc = $cs("spo_trap", 9);
  spo_gold$nhFunc = $cs("spo_gold", 9);
  spo_corridor$nhFunc = $cs("spo_corridor", 13);
  selection_floodfill$nhFunc = $cs("selection_floodfill", 20);
  selection_floodfill$floodfill_stack_overrun = $cs("floodfill stack overrun", 24);
  spo_door$nhFunc = $cs("spo_door", 9);
  spo_feature$nhFunc = $cs("spo_feature", 12);
  spo_terrain$nhFunc = $cs("spo_terrain", 12);
  spo_replace_terrain$nhFunc = $cs("spo_replace_terrain", 20);
  generate_way_out_method$nhFunc = $cs("generate_way_out_method", 24);
  ensure_way_out$nhFunc = $cs("ensure_way_out", 15);
  spo_levregion$nhFunc = $cs("spo_levregion", 14);
  spo_region$nhFunc = $cs("spo_region", 11);
  spo_drawbridge$nhFunc = $cs("spo_drawbridge", 15);
  spo_mazewalk$nhFunc = $cs("spo_mazewalk", 13);
  spo_wall_property$nhFunc = $cs("spo_wall_property", 18);
  spo_room_door$nhFunc = $cs("spo_room_door", 14);
  spo_wallify$nhFunc = $cs("spo_wallify", 12);
  spo_map$nhFunc = $cs("spo_map", 8);
  spo_jmp$nhFunc = $cs("spo_jmp", 8);
  spo_conditional_jump$nhFunc = $cs("spo_conditional_jump", 21);
  spo_var_init$nhFunc = $cs("spo_var_init", 13);
  spo_shuffle_array$nhFunc = $cs("spo_shuffle_array", 18);
  sp_level_coder$nhFunc = $cs("sp_level_coder", 15);
}
