// @ts-nocheck
// NetHack 3.6.7 light.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { fmt_ptr } from './alloc.ts';
import { artifact_light } from './artifact.ts';
import { flush_screen, map_invisible } from './display.ts';
import { panic } from './end.ts';
import { dist2 } from './hacklib.ts';
import { place_object, remove_object } from './mkobj.ts';
import { xname } from './objnam.ts';
import { impossible } from './pline.ts';
import { lookup_id_mapping, mread } from './restore.ts';
import { bwrite } from './save.ts';
import { find_oid } from './shk.ts';
import { end_burn, obj_is_local } from './timeout.ts';
import { clear_path, vision_recalc } from './vision.ts';
import { worm_known } from './worm.ts';
import { get_mon_location, get_obj_location } from './zap.ts';
import { struct_ls_t, struct_monst, struct_obj, union_any } from './structs.ts';
import { $rd, $wr, G, P, S, free, sprintf } from './rt/index.ts';
import { BLINDED, CANDELABRUM_OF_INVOCATION, COLNO, COULD_SEE, FALSE, FM_EVERYWHERE, FM_FMON, FM_MIGRATE, FM_MYDOGS, INFRAVISION, LSF_NEEDS_FIXUP, LSF_SHOW, LS_MONSTER, LS_OBJECT, MAGIC_LAMP, MAX_RADIUS, NHW_MENU, OBJ_FREE, RANGE_LEVEL, ROWNO, SEE_INVIS, TEMP_LIT, TRUE, WIN_ERR } from './consts.ts';

let light_base: any;

export async function new_light_source(x: number, y: number, range: number, type: number, id: union_any | null): Promise<void> {
  let ls = null;
  if (range > MAX_RADIUS || range < 1) {
    await impossible(S("new_light_source:  illegal range %d"), range);
    return;
  }
  ls = new struct_ls_t();
  ls.next = light_base[0];
  ls.x = x;
  ls.y = y;
  ls.range = range << 16 >> 16;
  ls.type = type << 16 >> 16;
  ls.id.$cp(id);
  ls.flags = 0;
  light_base[0] = ls;
  G.vision_full_recalc = 1;
}

export async function del_light_source(type: number, id: union_any | null): Promise<void> {
  let curr = null;
  let prev = null;
  let tmp_id = new union_any();
  tmp_id.$cp(G.zeroany);
  switch (type) {
  case 0:
    tmp_id.a_uint = id.a_obj.o_id;
    break;
  case 1:
    tmp_id.a_uint = id.a_monst.m_id;
    break;
  default:
    tmp_id.a_uint = 0;
    break;
  }
  for (prev = null, curr = light_base[0]; curr; prev = curr, curr = curr.next) {
    if (curr.type !== type) {
      continue;
    }
    if (curr.id.a_obj === (curr.flags & LSF_NEEDS_FIXUP ? tmp_id.a_obj : id.a_obj)) {
      if (prev) {
        prev.next = curr.next;
      } else {
        light_base[0] = curr.next;
      }
      free(curr);
      G.vision_full_recalc = 1;
      return;
    }
  }
  await impossible(S("del_light_source: not found type=%d, id=%s"), type, fmt_ptr(id.a_obj));
}

export function do_light_sources(cs_rows: Ptr | null): void {
  let x = 0;
  let y = 0;
  let min_x = 0;
  let max_x = 0;
  let max_y = 0;
  let offset = 0;
  let limits = null;
  let at_hero_range = 0;
  let ls = null;
  let row = null;
  for (ls = light_base[0]; ls; ls = ls.next) {
    ls.flags = (ls.flags & ~LSF_SHOW) << 16 >> 16;
    if (ls.type === LS_OBJECT) {
      if (get_obj_location(ls.id.a_obj, P(ls, "x"), P(ls, "y"), 0)) {
        ls.flags = (ls.flags | LSF_SHOW) << 16 >> 16;
      }
    } else if (ls.type === LS_MONSTER) {
      if (get_mon_location(ls.id.a_monst, P(ls, "x"), P(ls, "y"), 0)) {
        ls.flags = (ls.flags | LSF_SHOW) << 16 >> 16;
      }
    }
    if (ls.x === G.u.ux && ls.y === G.u.uy) {
      if (at_hero_range >= ls.range) {
        ls.flags = (ls.flags & ~LSF_SHOW) << 16 >> 16;
      } else {
        at_hero_range = ls.range;
      }
    }
    if (ls.flags & LSF_SHOW) {
      limits = P(G.circle_data, G.circle_start[ls.range]);
      if ((max_y = ls.y + ls.range) >= ROWNO) {
        max_y = ROWNO - 1;
      }
      if ((y = ls.y - ls.range) < 0) {
        y = 0;
      }
      for (; y <= max_y; ++y) {
        row = cs_rows.a[cs_rows.o + y];
        offset = limits.a[limits.o + Math.abs(y - ls.y)];
        if ((min_x = ls.x - offset) < 0) {
          min_x = 0;
        }
        if ((max_x = ls.x + offset) >= COLNO) {
          max_x = COLNO - 1;
        }
        if (ls.x === G.u.ux && ls.y === G.u.uy) {
          for (x = min_x; x <= max_x; ++x) {
            if (row.a[row.o + x] & COULD_SEE) {
              row.a[row.o + x] = (row.a[row.o + x] | TEMP_LIT) << 24 >> 24;
            }
          }
        } else {
          for (x = min_x; x <= max_x; ++x) {
            if (ls.x === x && ls.y === y || clear_path(ls.x, ls.y, x, y)) {
              row.a[row.o + x] = (row.a[row.o + x] | TEMP_LIT) << 24 >> 24;
            }
          }
        }
      }
    }
  }
}

export async function show_transient_light(obj: struct_obj | null, x: number, y: number): Promise<void> {
  let ls = null;
  let mon = null;
  let radius_squared = 0;
  for (ls = light_base[0]; ls; ls = ls.next) {
    if (ls.type !== LS_OBJECT) {
      continue;
    }
    if (ls.id.a_obj === obj) {
      break;
    }
  }
  if (!ls || obj.where !== OBJ_FREE) {
    await impossible(S("transient light %s %s is not %s?"), obj.lamplit | 0 ? S("lit") : S("unlit"), await xname(obj), !ls ? S("a light source") : S("free"));
  } else {
    await place_object(obj, G.bhitpos.x, G.bhitpos.y);
    await vision_recalc(0);
    await flush_screen(0);
    await G.windowprocs.win_delay_output();
    await remove_object(obj);
    radius_squared = Math.imul(ls.range, ls.range);
    for (mon = G.level.monlist; mon; mon = mon.nmon) {
      if (mon.mhp < 1) {
        continue;
      }
      if (dist2(mon.mx, mon.my, x, y) <= radius_squared && ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected))) {
        mon.mburied = 1;
      }
    }
  }
}

export async function transient_light_cleanup(): Promise<void> {
  let mon = null;
  let mtempcount = 0;
  for (mon = G.level.monlist; mon; mon = mon.nmon) {
    if (mon.mhp < 1) {
      continue;
    }
    if (mon.mburied) {
      mon.mburied = 0;
      ++mtempcount;
      if (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected))) {
        await map_invisible(mon.mx, mon.my);
      }
    }
  }
  if (mtempcount) {
    await vision_recalc(0);
    await flush_screen(0);
  }
}

export function find_mid(nid: number, fmflags: number): struct_monst | null {
  let mtmp = null;
  if (!nid) {
    return G.youmonst;
  }
  if ((fmflags & FM_FMON) >>> 0) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (!(mtmp.mhp < 1) && mtmp.m_id === nid) {
        return mtmp;
      }
    }
  }
  if ((fmflags & FM_MIGRATE) >>> 0) {
    for (mtmp = G.migrating_mons; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.m_id === nid) {
        return mtmp;
      }
    }
  }
  if ((fmflags & FM_MYDOGS) >>> 0) {
    for (mtmp = G.mydogs; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.m_id === nid) {
        return mtmp;
      }
    }
  }
  return null;
}

export async function save_light_sources(fd: number, mode: number, range: number): Promise<void> {
  const count = new Int32Array(1);
  let actual = 0;
  let is_global = 0;
  let prev = null;
  let curr = null;
  if (mode & (1 | 2)) {
    count[0] = await maybe_write_ls(fd, range, FALSE);
    await bwrite(fd, P(count, 0), 4);
    actual = await maybe_write_ls(fd, range, TRUE);
    if (actual !== count[0]) {
      await panic(S("counted %d light sources, wrote %d! [range=%d]"), count[0], actual, range);
    }
  }
  if (mode & 4) {
    for (prev = P(light_base, 0); !!(curr = prev.a[prev.o]); ) {
      if (!curr.id.a_monst) {
        await impossible(S("save_light_sources: no id! [range=%d]"), range);
        is_global = 0;
      } else {
        switch (curr.type) {
        case 0:
          is_global = !await obj_is_local(curr.id.a_obj) ? 1 : 0;
          break;
        case 1:
          is_global = !(curr.id.a_monst.mx > 0) ? 1 : 0;
          break;
        default:
          is_global = 0;
          await impossible(S("save_light_sources: bad type (%d) [range=%d]"), curr.type, range);
          break;
        }
      }
      if (is_global ^ (range === RANGE_LEVEL ? 1 : 0)) {
        prev.a[prev.o] = curr.next;
        free(curr);
      } else {
        prev = P(prev.a[prev.o], "next");
      }
    }
  }
}

export async function restore_light_sources(fd: number): Promise<void> {
  const count = new Int32Array(1);
  let ls = null;
  await mread(fd, P(count, 0), 4);
  while (count[0]-- > 0) {
    ls = new struct_ls_t();
    await mread(fd, ls, 24);
    ls.next = light_base[0];
    light_base[0] = ls;
  }
}

export function light_stats(hdrfmt: Ptr | null, hdrbuf: Ptr | null, count: Ptr | null, size: Ptr | null): void {
  let ls = null;
  sprintf(hdrbuf, hdrfmt, 24);
  count.a[count.o] = size.a[size.o] = 0;
  for (ls = light_base[0]; ls; ls = ls.next) {
    ++count.a[count.o];
    size.a[size.o] += 24;
  }
}

export async function relink_light_sources(ghostly: number): Promise<void> {
  let which = 0;
  const nid = new Uint32Array(1);
  let ls = null;
  for (ls = light_base[0]; ls; ls = ls.next) {
    if (ls.flags & LSF_NEEDS_FIXUP) {
      if (ls.type === LS_OBJECT || ls.type === LS_MONSTER) {
        if (ghostly) {
          if (!lookup_id_mapping(ls.id.a_uint, P(nid, 0))) {
            await impossible(S("relink_light_sources: no id mapping"));
          }
        } else {
          nid[0] = ls.id.a_uint;
        }
        if (ls.type === LS_OBJECT) {
          which = 111;
          ls.id.a_obj = find_oid(nid[0]);
        } else {
          which = 109;
          ls.id.a_monst = find_mid(nid[0], FM_EVERYWHERE);
        }
        if (!ls.id.a_monst) {
          await impossible(S("relink_light_sources: cant find %c_id %d"), which, nid[0]);
        }
      } else {
        await impossible(S("relink_light_sources: bad type (%d)"), ls.type);
      }
      ls.flags = (ls.flags & ~LSF_NEEDS_FIXUP) << 16 >> 16;
    }
  }
}

async function maybe_write_ls(fd: number, range: number, write_it: number): Promise<number> {
  let count = 0;
  let is_global = 0;
  let ls = null;
  for (ls = light_base[0]; ls; ls = ls.next) {
    if (!ls.id.a_monst) {
      await impossible(S("maybe_write_ls: no id! [range=%d]"), range);
      continue;
    }
    switch (ls.type) {
    case 0:
      is_global = !await obj_is_local(ls.id.a_obj) ? 1 : 0;
      break;
    case 1:
      is_global = !(ls.id.a_monst.mx > 0) ? 1 : 0;
      break;
    default:
      is_global = 0;
      await impossible(S("maybe_write_ls: bad type (%d) [range=%d]"), ls.type, range);
      break;
    }
    if (is_global ^ (range === RANGE_LEVEL ? 1 : 0)) {
      ++count;
      if (write_it) {
        await write_ls(fd, ls);
      }
    }
  }
  return count;
}

export async function light_sources_sanity_check(): Promise<void> {
  let ls = null;
  let mtmp = null;
  let otmp = null;
  let auint = 0;
  for (ls = light_base[0]; ls; ls = ls.next) {
    if (!ls.id.a_monst) {
      await panic(S("insane light source: no id!"));
    }
    if (ls.type === LS_OBJECT) {
      otmp = ls.id.a_obj;
      auint = otmp.o_id;
      if (find_oid(auint) !== otmp) {
        await panic(S("insane light source: can't find obj #%u!"), auint);
      }
    } else if (ls.type === LS_MONSTER) {
      mtmp = ls.id.a_monst;
      auint = mtmp.m_id;
      if (find_mid(auint, FM_EVERYWHERE) !== mtmp) {
        await panic(S("insane light source: can't find mon #%u!"), auint);
      }
    } else {
      await panic(S("insane light source: bad ls type %d"), ls.type);
    }
  }
}

async function write_ls(fd: number, ls: struct_ls_t | null): Promise<void> {
  let arg_save = new union_any();
  let otmp = null;
  let mtmp = null;
  if (ls.type === LS_OBJECT || ls.type === LS_MONSTER) {
    if (ls.flags & LSF_NEEDS_FIXUP) {
      await bwrite(fd, ls, 24);
    } else {
      arg_save.$cp(ls.id);
      if (ls.type === LS_OBJECT) {
        otmp = ls.id.a_obj;
        ls.id.$cp(G.zeroany);
        ls.id.a_uint = otmp.o_id;
        if (find_oid(ls.id.a_uint) !== otmp) {
          await impossible(S("write_ls: can't find obj #%u!"), ls.id.a_uint);
        }
      } else {
        mtmp = ls.id.a_monst;
        ls.id.$cp(G.zeroany);
        ls.id.a_uint = mtmp.m_id;
        if (find_mid(ls.id.a_uint, FM_EVERYWHERE) !== mtmp) {
          await impossible(S("write_ls: can't find mon #%u!"), ls.id.a_uint);
        }
      }
      ls.flags = (ls.flags | LSF_NEEDS_FIXUP) << 16 >> 16;
      await bwrite(fd, ls, 24);
      ls.id.$cp(arg_save);
      ls.flags = (ls.flags & ~LSF_NEEDS_FIXUP) << 16 >> 16;
    }
  } else {
    await impossible(S("write_ls: bad type (%d)"), ls.type);
  }
}

export function obj_move_light_source(src: struct_obj | null, dest: struct_obj | null): void {
  let ls = null;
  for (ls = light_base[0]; ls; ls = ls.next) {
    if (ls.type === LS_OBJECT && ls.id.a_obj === src) {
      ls.id.a_obj = dest;
    }
  }
  src.lamplit = 0;
  dest.lamplit = 1;
}

export function any_light_source(): number {
  return (!!light_base[0] ? 1 : 0) << 24 >> 24;
}

export async function snuff_light_source(x: number, y: number): Promise<void> {
  let ls = null;
  let obj = null;
  for (ls = light_base[0]; ls; ls = ls.next) {
    if (ls.type === LS_OBJECT && ls.x === x && ls.y === y) {
      obj = ls.id.a_obj;
      if (obj_is_burning(obj)) {
        if (artifact_light(obj)) {
          continue;
        }
        await end_burn(obj, obj.otyp !== MAGIC_LAMP ? 1 : 0);
        return;
      }
    }
  }
}

export function obj_sheds_light(obj: struct_obj | null): number {
  return obj_is_burning(obj);
}

export function obj_is_burning(obj: struct_obj | null): number {
  return (obj.lamplit | 0 && (obj.otyp === MAGIC_LAMP || (obj.otyp === 201 || obj.otyp === 202 || obj.otyp === 237 || obj.otyp === 199 || obj.otyp === 200 || obj.otyp === 296) || artifact_light(obj)) ? 1 : 0) << 24 >> 24;
}

export async function obj_split_light_source(src: struct_obj | null, dest: struct_obj | null): Promise<void> {
  let ls = null;
  let new_ls = null;
  for (ls = light_base[0]; ls; ls = ls.next) {
    if (ls.type === LS_OBJECT && ls.id.a_obj === src) {
      new_ls = new struct_ls_t();
      new_ls.$cp(ls);
      if (src.otyp === 199 || src.otyp === 200) {
        ls.range = candle_light_range(src) << 16 >> 16;
        new_ls.range = candle_light_range(dest) << 16 >> 16;
        G.vision_full_recalc = 1;
      }
      new_ls.id.a_obj = dest;
      new_ls.next = light_base[0];
      light_base[0] = new_ls;
      dest.lamplit = 1;
    }
  }
}

export async function obj_merge_light_sources(src: struct_obj | null, dest: struct_obj | null): Promise<void> {
  let ls = null;
  if (src !== dest) {
    await end_burn(src, TRUE);
  }
  for (ls = light_base[0]; ls; ls = ls.next) {
    if (ls.type === LS_OBJECT && ls.id.a_obj === dest) {
      ls.range = candle_light_range(dest) << 16 >> 16;
      G.vision_full_recalc = 1;
      break;
    }
  }
}

export async function obj_adjust_light_radius(obj: struct_obj | null, new_radius: number): Promise<void> {
  let ls = null;
  for (ls = light_base[0]; ls; ls = ls.next) {
    if (ls.type === LS_OBJECT && ls.id.a_obj === obj) {
      if (new_radius !== ls.range) {
        G.vision_full_recalc = 1;
      }
      ls.range = new_radius << 16 >> 16;
      return;
    }
  }
  await impossible(S("obj_adjust_light_radius: can't find %s"), await xname(obj));
}

export function candle_light_range(obj: struct_obj | null): number {
  let radius = 0;
  if (obj.otyp === CANDELABRUM_OF_INVOCATION) {
    radius = obj.spe < 4 ? 2 : obj.spe < 7 ? 3 : 4;
  } else if (obj.otyp === 199 || obj.otyp === 200) {
    let n = obj.quan;
    radius = 1;
    do {
      ++radius;
      n = Math.trunc(n / 7);
    } while (n > 0);
  } else {
    radius = 3;
  }
  return radius;
}

export function arti_light_radius(obj: struct_obj | null): number {
  if (!obj.lamplit || !artifact_light(obj)) {
    return 0;
  }
  return obj.blessed | 0 ? 3 : !obj.cursed ? 2 : 1;
}

export function arti_light_description(obj: struct_obj | null): Ptr | null {
  switch (arti_light_radius(obj)) {
  case 3:
    return S("brilliantly");
  case 2:
    return S("brightly");
  case 1:
    return S("dimly");
  default:
    break;
  }
  return S("strangely");
}

export async function wiz_light_sources(): Promise<number> {
  let win = 0;
  let buf = new Int8Array(256);
  let ls = null;
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  if (win === WIN_ERR) {
    return 0;
  }
  sprintf(P(buf), S("Mobile light sources: hero @ (%2d,%2d)"), G.u.ux, G.u.uy);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  await G.windowprocs.win_putstr(win, 0, S(""));
  if (light_base[0]) {
    await G.windowprocs.win_putstr(win, 0, S("location range flags  type    id"));
    await G.windowprocs.win_putstr(win, 0, S("-------- ----- ------ ----  -------"));
    for (ls = light_base[0]; ls; ls = ls.next) {
      sprintf(P(buf), S("  %2d,%2d   %2d   0x%04x  %s  %s"), ls.x, ls.y, ls.range, ls.flags, ls.type === LS_OBJECT ? S("obj") : ls.type === LS_MONSTER ? ls.id.a_monst.mx > 0 ? S("mon") : ls.id.a_monst === G.youmonst ? S("you") : S("<m>") : S("???"), fmt_ptr(ls.id.a_void));
      await G.windowprocs.win_putstr(win, 0, P(buf));
    }
  } else {
    await G.windowprocs.win_putstr(win, 0, S("<none>"));
  }
  await G.windowprocs.win_display_nhwindow(win, FALSE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return 0;
}

export function $init(): void {
  light_base = [null];
  light_base[0] = null;
}
