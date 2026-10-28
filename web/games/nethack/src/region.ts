// @ts-nocheck
// NetHack 3.6.7 region.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { isok } from './cmd.ts';
import { is_pool } from './dbridge.ts';
import { newsym, show_glyph } from './display.ts';
import { Monnam } from './do_name.ts';
import { on_level } from './dungeon.ts';
import { losehp } from './hack.ts';
import { find_mid } from './light.ts';
import { killed, monkilled, setmangry } from './mon.ts';
import { attacktype_fordmg } from './mondata.ts';
import { makeplural } from './objnam.ts';
import { You, Your, pline, pline_The } from './pline.ts';
import { body_part } from './polyself.ts';
import { make_blinded } from './potion.ts';
import { lookup_id_mapping, mread } from './restore.ts';
import { rn2, rnd } from './rnd.ts';
import { bwrite } from './save.ts';
import { safe_teleds } from './teleport.ts';
import { struct_NhRegion, struct_monst, struct_nhrect } from './structs.ts';
import { $rd, $sadd, $sarr, $sat, $u64, $wr, G, P, S, free, memcpy, memset, sprintf, strlen } from './rt/index.ts';
import { AD_DRST, AD_RBRE, AT_BREA, BLINDED, COLNO, EXPIRE_GAS_CLOUD, EYE, FALSE, FM_FMON, HALF_PHDAM, INSIDE_GAS_CLOUD, KILLED_BY_AN, LUNG, MAGICAL_BREATHING, MONST_INC, NO_CALLBACK, POISON_RES, ROWNO, S_EEL, S_GOLEM, S_VORTEX, S_cloud, S_poisoncloud, TIMEOUT, TRUE } from './consts.ts';

let regions: Ptr | null;
let n_regions: any;
let max_regions: number;
let callbacks: any;

export function inside_rect(r: struct_nhrect | null, x: number, y: number): number {
  return (x >= r.lx && x <= r.hx && y >= r.ly && y <= r.hy ? 1 : 0) << 24 >> 24;
}

export function inside_region(reg: struct_NhRegion | null, x: number, y: number): number {
  let i = 0;
  if (!reg || !inside_rect(reg.bounding_box, x, y)) {
    return FALSE;
  }
  for (i = 0; i < reg.nrects; ++i) {
    if (inside_rect($sadd(reg.rects, i), x, y)) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function create_region(rects: struct_nhrect | null, nrect: number): Promise<struct_NhRegion | null> {
  let i = 0;
  let reg = null;
  reg = new struct_NhRegion();
  memset(reg, 0, 96);
  if (nrect > 0) {
    reg.bounding_box.$cp(rects);
  } else {
    reg.bounding_box.lx = COLNO;
    reg.bounding_box.ly = ROWNO;
    reg.bounding_box.hx = 0;
    reg.bounding_box.hy = 0;
  }
  reg.nrects = nrect << 16 >> 16;
  reg.rects = nrect > 0 ? $sarr(struct_nhrect, ($u64(nrect) * 4 >>> 0) / 4)[0] : null;
  for (i = 0; i < nrect; ++i) {
    if ($sadd(rects, i).lx < reg.bounding_box.lx) {
      reg.bounding_box.lx = $sadd(rects, i).lx;
    }
    if ($sadd(rects, i).ly < reg.bounding_box.ly) {
      reg.bounding_box.ly = $sadd(rects, i).ly;
    }
    if ($sadd(rects, i).hx > reg.bounding_box.hx) {
      reg.bounding_box.hx = $sadd(rects, i).hx;
    }
    if ($sadd(rects, i).hy > reg.bounding_box.hy) {
      reg.bounding_box.hy = $sadd(rects, i).hy;
    }
    $sadd(reg.rects, i).$cp($sadd(rects, i));
  }
  reg.ttl = -1;
  reg.attach_2_u = FALSE;
  reg.attach_2_m = 0;
  reg.enter_msg = null;
  reg.leave_msg = null;
  reg.expire_f = NO_CALLBACK;
  reg.enter_f = NO_CALLBACK;
  reg.can_enter_f = NO_CALLBACK;
  reg.leave_f = NO_CALLBACK;
  reg.can_leave_f = NO_CALLBACK;
  reg.inside_f = NO_CALLBACK;
  reg.player_flags = (reg.player_flags & 4294967294) >>> 0;
  reg.player_flags = (reg.player_flags | 2) >>> 0;
  reg.n_monst = 0;
  reg.max_monst = 0;
  reg.monsters = null;
  reg.arg.$cp(G.zeroany);
  return reg;
}

export async function add_rect_to_reg(reg: struct_NhRegion | null, rect: struct_nhrect | null): Promise<void> {
  let tmp_rect = null;
  tmp_rect = $sarr(struct_nhrect, ($u64(reg.nrects + 1) * 4 >>> 0) / 4)[0];
  if (reg.nrects > 0) {
    memcpy(tmp_rect, reg.rects, $u64(reg.nrects) * 4);
    free(reg.rects);
  }
  $sadd(tmp_rect, reg.nrects).$cp(rect);
  reg.nrects = reg.nrects + 1 << 16 >> 16;
  reg.rects = tmp_rect;
  if (reg.bounding_box.lx > rect.lx) {
    reg.bounding_box.lx = rect.lx;
  }
  if (reg.bounding_box.ly > rect.ly) {
    reg.bounding_box.ly = rect.ly;
  }
  if (reg.bounding_box.hx < rect.hx) {
    reg.bounding_box.hx = rect.hx;
  }
  if (reg.bounding_box.hy < rect.hy) {
    reg.bounding_box.hy = rect.hy;
  }
}

export async function add_mon_to_reg(reg: struct_NhRegion | null, mon: struct_monst | null): Promise<void> {
  let $t1: any;
  let i = 0;
  let tmp_m = null;
  if (reg.max_monst <= reg.n_monst) {
    tmp_m = P(new Uint32Array((4 * $u64(reg.max_monst + MONST_INC) >>> 0) / 4));
    if (reg.max_monst > 0) {
      for (i = 0; i < reg.max_monst; ++i) {
        tmp_m.a[tmp_m.o + i] = reg.monsters.a[reg.monsters.o + i];
      }
      free(reg.monsters);
    }
    reg.monsters = tmp_m;
    reg.max_monst = reg.max_monst + MONST_INC << 16 >> 16;
  }
  reg.monsters.a[reg.monsters.o + ($t1 = reg.n_monst, reg.n_monst = $t1 + 1 << 16 >> 16, $t1)] = mon.m_id;
}

export function remove_mon_from_reg(reg: struct_NhRegion | null, mon: struct_monst | null): void {
  let i = 0;
  for (i = 0; i < reg.n_monst; ++i) {
    if (reg.monsters.a[reg.monsters.o + i] === mon.m_id) {
      reg.n_monst = reg.n_monst - 1 << 16 >> 16;
      reg.monsters.a[reg.monsters.o + i] = reg.monsters.a[reg.monsters.o + reg.n_monst];
      return;
    }
  }
}

export function mon_in_region(reg: struct_NhRegion | null, mon: struct_monst | null): number {
  let i = 0;
  for (i = 0; i < reg.n_monst; ++i) {
    if (reg.monsters.a[reg.monsters.o + i] === mon.m_id) {
      return TRUE;
    }
  }
  return FALSE;
}

export function free_region(reg: struct_NhRegion | null): void {
  if (reg) {
    if (reg.rects) {
      free(reg.rects);
    }
    if (reg.monsters) {
      free(reg.monsters);
    }
    if (reg.enter_msg) {
      free(reg.enter_msg);
    }
    if (reg.leave_msg) {
      free(reg.leave_msg);
    }
    free(reg);
  }
}

export async function add_region(reg: struct_NhRegion | null): Promise<void> {
  let tmp_reg = null;
  let i = 0;
  let j = 0;
  if (max_regions <= n_regions[0]) {
    tmp_reg = regions;
    regions = P(new Array(($u64(max_regions + 10) * 8 >>> 0) / 8).fill(null));
    if (max_regions > 0) {
      memcpy(regions, tmp_reg, $u64(max_regions) * 8);
      free(tmp_reg);
    }
    max_regions += 10;
  }
  regions.a[regions.o + n_regions[0]] = reg;
  ++n_regions[0];
  for (i = reg.bounding_box.lx; i <= reg.bounding_box.hx; ++i) {
    for (j = reg.bounding_box.ly; j <= reg.bounding_box.hy; ++j) {
      if (!isok(i, j)) {
        continue;
      }
      if (!!G.level.monsters[i][j] && inside_region(reg, i, j)) {
        await add_mon_to_reg(reg, G.level.monsters[i][j]);
      }
      if (reg.visible && $rd(G.viz_array.a[G.viz_array.o + j], i) & 2) {
        await newsym(i, j);
      }
    }
  }
  if (inside_region(reg, G.u.ux, G.u.uy)) {
    reg.player_flags = (reg.player_flags | 1) >>> 0;
  } else {
    reg.player_flags = (reg.player_flags & 4294967294) >>> 0;
  }
}

export async function remove_region(reg: struct_NhRegion | null): Promise<void> {
  let i = 0;
  let x = 0;
  let y = 0;
  for (i = 0; i < n_regions[0]; ++i) {
    if (regions.a[regions.o + i] === reg) {
      break;
    }
  }
  if (i === n_regions[0]) {
    return;
  }
  if (--n_regions[0] !== i) {
    regions.a[regions.o + i] = regions.a[regions.o + n_regions[0]];
  }
  regions.a[regions.o + n_regions[0]] = null;
  reg.ttl = -2;
  if (reg.visible) {
    for (x = reg.bounding_box.lx; x <= reg.bounding_box.hx; ++x) {
      for (y = reg.bounding_box.ly; y <= reg.bounding_box.hy; ++y) {
        if (isok(x, y) && inside_region(reg, x, y) && $rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
          await newsym(x, y);
        }
      }
    }
  }
  free_region(reg);
}

export function clear_regions(): void {
  let i = 0;
  for (i = 0; i < n_regions[0]; ++i) {
    free_region(regions.a[regions.o + i]);
  }
  n_regions[0] = 0;
  if (max_regions > 0) {
    free(regions);
  }
  max_regions = 0;
  regions = null;
}

export async function run_regions(): Promise<void> {
  let $t1: any, $t2: any;
  let i = 0;
  let j = 0;
  let k = 0;
  let f_indx = 0;
  for (i = n_regions[0] - 1; i >= 0; --i) {
    if (regions.a[regions.o + i].ttl === 0) {
      if ((f_indx = regions.a[regions.o + i].expire_f) === NO_CALLBACK || await callbacks[f_indx](regions.a[regions.o + i], null)) {
        await remove_region(regions.a[regions.o + i]);
      }
    }
  }
  for (i = 0; i < n_regions[0]; ++i) {
    if (regions.a[regions.o + i].ttl > 0) {
      ($t1 = regions.a[regions.o + i], $t1.ttl = $t1.ttl - 1);
    }
    f_indx = regions.a[regions.o + i].inside_f;
    if (f_indx !== NO_CALLBACK && (regions.a[regions.o + i].player_flags & 1) >>> 0) {
      await callbacks[f_indx](regions.a[regions.o + i], null);
    }
    if (f_indx !== NO_CALLBACK) {
      for (j = 0; j < regions.a[regions.o + i].n_monst; ++j) {
        let mtmp = find_mid($rd(regions.a[regions.o + i].monsters, j), FM_FMON);
        if (!mtmp || mtmp.mhp < 1 || await callbacks[f_indx](regions.a[regions.o + i], mtmp)) {
          k = ($t2 = regions.a[regions.o + i], $t2.n_monst = $t2.n_monst - 1 << 16 >> 16);
          $wr(regions.a[regions.o + i].monsters, j, $rd(regions.a[regions.o + i].monsters, k));
          $wr(regions.a[regions.o + i].monsters, k, 0);
          --j;
        }
      }
    }
  }
}

export async function in_out_region(x: number, y: number): Promise<number> {
  let $t1: any, $t2: any;
  let i = 0;
  let f_indx = 0;
  for (i = 0; i < n_regions[0]; ++i) {
    if (regions.a[regions.o + i].attach_2_u) {
      continue;
    }
    if (inside_region(regions.a[regions.o + i], x, y) ? !((regions.a[regions.o + i].player_flags & 1) >>> 0) && (f_indx = regions.a[regions.o + i].can_enter_f) !== NO_CALLBACK ? 1 : 0 : (regions.a[regions.o + i].player_flags & 1) >>> 0 && (f_indx = regions.a[regions.o + i].can_leave_f) !== NO_CALLBACK ? 1 : 0) {
      if (!await callbacks[f_indx](regions.a[regions.o + i], null)) {
        return FALSE;
      }
    }
  }
  for (i = 0; i < n_regions[0]; ++i) {
    if (regions.a[regions.o + i].attach_2_u) {
      continue;
    }
    if ((regions.a[regions.o + i].player_flags & 1) >>> 0 && !inside_region(regions.a[regions.o + i], x, y)) {
      ($t1 = regions.a[regions.o + i], $t1.player_flags = ($t1.player_flags & 4294967294) >>> 0);
      if (!!regions.a[regions.o + i].leave_msg) {
        await pline(S("%s"), regions.a[regions.o + i].leave_msg);
      }
      if ((f_indx = regions.a[regions.o + i].leave_f) !== NO_CALLBACK) {
        await callbacks[f_indx](regions.a[regions.o + i], null);
      }
    }
  }
  for (i = 0; i < n_regions[0]; ++i) {
    if (regions.a[regions.o + i].attach_2_u) {
      continue;
    }
    if (!((regions.a[regions.o + i].player_flags & 1) >>> 0) && inside_region(regions.a[regions.o + i], x, y)) {
      ($t2 = regions.a[regions.o + i], $t2.player_flags = ($t2.player_flags | 1) >>> 0);
      if (!!regions.a[regions.o + i].enter_msg) {
        await pline(S("%s"), regions.a[regions.o + i].enter_msg);
      }
      if ((f_indx = regions.a[regions.o + i].enter_f) !== NO_CALLBACK) {
        await callbacks[f_indx](regions.a[regions.o + i], null);
      }
    }
  }
  return TRUE;
}

export async function m_in_out_region(mon: struct_monst | null, x: number, y: number): Promise<number> {
  let i = 0;
  let f_indx = 0;
  for (i = 0; i < n_regions[0]; ++i) {
    if (regions.a[regions.o + i].attach_2_m === mon.m_id) {
      continue;
    }
    if (inside_region(regions.a[regions.o + i], x, y) ? !mon_in_region(regions.a[regions.o + i], mon) && (f_indx = regions.a[regions.o + i].can_enter_f) !== NO_CALLBACK ? 1 : 0 : mon_in_region(regions.a[regions.o + i], mon) && (f_indx = regions.a[regions.o + i].can_leave_f) !== NO_CALLBACK ? 1 : 0) {
      if (!await callbacks[f_indx](regions.a[regions.o + i], mon)) {
        return FALSE;
      }
    }
  }
  for (i = 0; i < n_regions[0]; ++i) {
    if (regions.a[regions.o + i].attach_2_m === mon.m_id) {
      continue;
    }
    if (mon_in_region(regions.a[regions.o + i], mon) && !inside_region(regions.a[regions.o + i], x, y)) {
      remove_mon_from_reg(regions.a[regions.o + i], mon);
      if ((f_indx = regions.a[regions.o + i].leave_f) !== NO_CALLBACK) {
        await callbacks[f_indx](regions.a[regions.o + i], mon);
      }
    }
  }
  for (i = 0; i < n_regions[0]; ++i) {
    if (regions.a[regions.o + i].attach_2_m === mon.m_id) {
      continue;
    }
    if (!mon_in_region(regions.a[regions.o + i], mon) && inside_region(regions.a[regions.o + i], x, y)) {
      await add_mon_to_reg(regions.a[regions.o + i], mon);
      if ((f_indx = regions.a[regions.o + i].enter_f) !== NO_CALLBACK) {
        await callbacks[f_indx](regions.a[regions.o + i], mon);
      }
    }
  }
  return TRUE;
}

export function update_player_regions(): void {
  let $t1: any, $t2: any;
  let i = 0;
  for (i = 0; i < n_regions[0]; ++i) {
    if (!regions.a[regions.o + i].attach_2_u && inside_region(regions.a[regions.o + i], G.u.ux, G.u.uy)) {
      ($t1 = regions.a[regions.o + i], $t1.player_flags = ($t1.player_flags | 1) >>> 0);
    } else {
      ($t2 = regions.a[regions.o + i], $t2.player_flags = ($t2.player_flags & 4294967294) >>> 0);
    }
  }
}

export async function update_monster_region(mon: struct_monst | null): Promise<void> {
  let i = 0;
  for (i = 0; i < n_regions[0]; ++i) {
    if (inside_region(regions.a[regions.o + i], mon.mx, mon.my)) {
      if (!mon_in_region(regions.a[regions.o + i], mon)) {
        await add_mon_to_reg(regions.a[regions.o + i], mon);
      }
    } else {
      if (mon_in_region(regions.a[regions.o + i], mon)) {
        remove_mon_from_reg(regions.a[regions.o + i], mon);
      }
    }
  }
}

export function visible_region_at(x: number, y: number): struct_NhRegion | null {
  let i = 0;
  for (i = 0; i < n_regions[0]; ++i) {
    if (!regions.a[regions.o + i].visible || regions.a[regions.o + i].ttl === -2) {
      continue;
    }
    if (inside_region(regions.a[regions.o + i], x, y)) {
      return regions.a[regions.o + i];
    }
  }
  return null;
}

export async function show_region(reg: struct_NhRegion | null, x: number, y: number): Promise<void> {
  await show_glyph(x, y, reg.glyph);
}

export async function save_regions(fd: number, mode: number): Promise<void> {
  let $g = 0;
  let i = 0;
  let j = 0;
  let n = new Uint32Array(1);
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (!(mode & (1 | 2))) {
        { $g = 1; continue $L; }
      }
      await bwrite(fd, P(G, "moves"), 8);
      await bwrite(fd, P(n_regions, 0), 4);
      for (i = 0; i < n_regions[0]; ++i) {
        await bwrite(fd, regions.a[regions.o + i].bounding_box, 4);
        await bwrite(fd, P(regions.a[regions.o + i], "nrects"), 2);
        for (j = 0; j < regions.a[regions.o + i].nrects; ++j) {
          await bwrite(fd, $sadd(regions.a[regions.o + i].rects, j), 4);
        }
        await bwrite(fd, P(regions.a[regions.o + i], "attach_2_u"), 1);
        n[0] = 0;
        await bwrite(fd, P(regions.a[regions.o + i], "attach_2_m"), 4);
        n[0] = (!!regions.a[regions.o + i].enter_msg ? strlen(regions.a[regions.o + i].enter_msg) : 0) >>> 0;
        await bwrite(fd, P(n, 0), 4);
        if (n[0] > 0) {
          await bwrite(fd, regions.a[regions.o + i].enter_msg, n[0]);
        }
        n[0] = (!!regions.a[regions.o + i].leave_msg ? strlen(regions.a[regions.o + i].leave_msg) : 0) >>> 0;
        await bwrite(fd, P(n, 0), 4);
        if (n[0] > 0) {
          await bwrite(fd, regions.a[regions.o + i].leave_msg, n[0]);
        }
        await bwrite(fd, P(regions.a[regions.o + i], "ttl"), 8);
        await bwrite(fd, P(regions.a[regions.o + i], "expire_f"), 2);
        await bwrite(fd, P(regions.a[regions.o + i], "can_enter_f"), 2);
        await bwrite(fd, P(regions.a[regions.o + i], "enter_f"), 2);
        await bwrite(fd, P(regions.a[regions.o + i], "can_leave_f"), 2);
        await bwrite(fd, P(regions.a[regions.o + i], "leave_f"), 2);
        await bwrite(fd, P(regions.a[regions.o + i], "inside_f"), 2);
        await bwrite(fd, P(regions.a[regions.o + i], "player_flags"), 4);
        await bwrite(fd, P(regions.a[regions.o + i], "n_monst"), 2);
        for (j = 0; j < regions.a[regions.o + i].n_monst; ++j) {
          await bwrite(fd, regions.a[regions.o + i].monsters.add(j), 4);
        }
        await bwrite(fd, P(regions.a[regions.o + i], "visible"), 1);
        await bwrite(fd, P(regions.a[regions.o + i], "glyph"), 4);
        await bwrite(fd, regions.a[regions.o + i].arg, 8);
      }
    case 1: // skip_lots
      if (mode & 4) {
        clear_regions();
      }
    }
    break;
  }
}

export async function rest_regions(fd: number, ghostly: number): Promise<void> {
  let $t1: any, $t2: any;
  let i = 0;
  let j = 0;
  const n = new Uint32Array(1);
  const tmstamp = new Float64Array(1);
  let msg_buf = null;
  clear_regions();
  await mread(fd, P(tmstamp, 0), 8);
  if (ghostly) {
    tmstamp[0] = 0;
  } else {
    tmstamp[0] = G.moves - tmstamp[0];
  }
  await mread(fd, P(n_regions, 0), 4);
  max_regions = n_regions[0];
  if (n_regions[0] > 0) {
    regions = P(new Array((8 * $u64(n_regions[0]) >>> 0) / 8).fill(null));
  }
  for (i = 0; i < n_regions[0]; ++i) {
    regions.a[regions.o + i] = new struct_NhRegion();
    await mread(fd, regions.a[regions.o + i].bounding_box, 4);
    await mread(fd, P(regions.a[regions.o + i], "nrects"), 2);
    if (regions.a[regions.o + i].nrects > 0) {
      regions.a[regions.o + i].rects = $sarr(struct_nhrect, (4 * $u64(regions.a[regions.o + i].nrects) >>> 0) / 4)[0];
    }
    for (j = 0; j < regions.a[regions.o + i].nrects; ++j) {
      await mread(fd, $sadd(regions.a[regions.o + i].rects, j), 4);
    }
    await mread(fd, P(regions.a[regions.o + i], "attach_2_u"), 1);
    await mread(fd, P(regions.a[regions.o + i], "attach_2_m"), 4);
    await mread(fd, P(n, 0), 4);
    if (n[0] > 0) {
      msg_buf = P(new Int8Array((n[0] + 1 >>> 0)));
      await mread(fd, msg_buf, n[0]);
      msg_buf.a[msg_buf.o + n[0]] = 0;
      regions.a[regions.o + i].enter_msg = msg_buf;
    } else {
      regions.a[regions.o + i].enter_msg = null;
    }
    await mread(fd, P(n, 0), 4);
    if (n[0] > 0) {
      msg_buf = P(new Int8Array((n[0] + 1 >>> 0)));
      await mread(fd, msg_buf, n[0]);
      msg_buf.a[msg_buf.o + n[0]] = 0;
      regions.a[regions.o + i].leave_msg = msg_buf;
    } else {
      regions.a[regions.o + i].leave_msg = null;
    }
    await mread(fd, P(regions.a[regions.o + i], "ttl"), 8);
    if (regions.a[regions.o + i].ttl >= 0) {
      regions.a[regions.o + i].ttl = regions.a[regions.o + i].ttl > tmstamp[0] ? regions.a[regions.o + i].ttl - tmstamp[0] : 0;
    }
    await mread(fd, P(regions.a[regions.o + i], "expire_f"), 2);
    await mread(fd, P(regions.a[regions.o + i], "can_enter_f"), 2);
    await mread(fd, P(regions.a[regions.o + i], "enter_f"), 2);
    await mread(fd, P(regions.a[regions.o + i], "can_leave_f"), 2);
    await mread(fd, P(regions.a[regions.o + i], "leave_f"), 2);
    await mread(fd, P(regions.a[regions.o + i], "inside_f"), 2);
    await mread(fd, P(regions.a[regions.o + i], "player_flags"), 4);
    if (ghostly) {
      ($t1 = regions.a[regions.o + i], $t1.player_flags = ($t1.player_flags & 4294967294) >>> 0);
      ($t2 = regions.a[regions.o + i], $t2.player_flags = ($t2.player_flags | 2) >>> 0);
    }
    await mread(fd, P(regions.a[regions.o + i], "n_monst"), 2);
    if (regions.a[regions.o + i].n_monst > 0) {
      regions.a[regions.o + i].monsters = P(new Uint32Array((4 * $u64(regions.a[regions.o + i].n_monst) >>> 0) / 4));
    } else {
      regions.a[regions.o + i].monsters = null;
    }
    regions.a[regions.o + i].max_monst = regions.a[regions.o + i].n_monst;
    for (j = 0; j < regions.a[regions.o + i].n_monst; ++j) {
      await mread(fd, regions.a[regions.o + i].monsters.add(j), 4);
    }
    await mread(fd, P(regions.a[regions.o + i], "visible"), 1);
    await mread(fd, P(regions.a[regions.o + i], "glyph"), 4);
    await mread(fd, regions.a[regions.o + i].arg, 8);
  }
  for (i = n_regions[0] - 1; i >= 0; --i) {
    if (regions.a[regions.o + i].ttl === 0) {
      await remove_region(regions.a[regions.o + i]);
    } else if (ghostly && regions.a[regions.o + i].n_monst > 0) {
      reset_region_mids(regions.a[regions.o + i]);
    }
  }
}

export function region_stats(hdrfmt: Ptr | null, hdrbuf: Ptr | null, count: Ptr | null, size: Ptr | null): void {
  let rg = null;
  let i = 0;
  sprintf(hdrbuf, hdrfmt, 96, 4);
  count.a[count.o] = n_regions[0];
  size.a[size.o] = max_regions * 96;
  for (i = 0; i < n_regions[0]; ++i) {
    rg = regions.a[regions.o + i];
    size.a[size.o] += rg.nrects * 4;
    if (rg.enter_msg) {
      size.a[size.o] += strlen(rg.enter_msg) + 1;
    }
    if (rg.leave_msg) {
      size.a[size.o] += strlen(rg.leave_msg) + 1;
    }
    size.a[size.o] += rg.max_monst * 4;
  }
}

function reset_region_mids(reg: struct_NhRegion | null): void {
  let i = 0;
  let n = reg.n_monst;
  let mid_list = reg.monsters;
  while (i < n) {
    if (!lookup_id_mapping(mid_list.a[mid_list.o + i], mid_list.add(i))) {
      mid_list.a[mid_list.o + i] = mid_list.a[mid_list.o + --n];
    } else {
      ++i;
    }
  }
  reg.n_monst = n << 16 >> 16;
  return;
}

export function expire_gas_cloud(p1: any, p2: any): number {
  let reg = null;
  let damage = 0;
  reg = p1;
  damage = reg.arg.a_int;
  if (damage >= 5) {
    damage = damage / 2 | 0;
    reg.arg.$cp(G.zeroany);
    reg.arg.a_int = damage;
    reg.ttl = 2;
    return FALSE;
  }
  return TRUE;
}

export async function inside_gas_cloud(p1: any, p2: any): Promise<number> {
  let reg = null;
  let mtmp = null;
  let dam = 0;
  reg = p1;
  dam = reg.arg.a_int;
  if (!p2) {
    if (G.u.uinvulnerable | 0 || ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0 || G.youmonst.data === $sat(G.mons, 49) || (G.youmonst.data.mlet === S_GOLEM || G.youmonst.data.mlet === S_VORTEX)) || (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) || G.u.uinwater | 0) {
      return FALSE;
    }
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await Your(S("%s sting."), await makeplural(body_part(EYE)));
      await make_blinded(1, FALSE);
    }
    if (!(G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic)) {
      await pline(S("%s is burning your %s!"), G.c_common_strings.c_Something, await makeplural(body_part(LUNG)));
      await You(S("cough and spit blood!"));
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(dam) + 5 + 1) / 2 | 0 : rnd(dam) + 5, S("gas cloud"), KILLED_BY_AN);
      return FALSE;
    } else {
      await You(S("cough!"));
      return FALSE;
    }
  } else {
    mtmp = p2;
    if (!((mtmp.data.mflags2 & 2) >>> 0 !== 0 || mtmp.data === $sat(G.mons, 49) || (mtmp.data.mlet === S_GOLEM || mtmp.data.mlet === S_VORTEX) || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224)) && !((mtmp.data.mflags1 & 1024) >>> 0 !== 0) && !((mtmp.data.mlet === S_EEL || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && is_pool(mtmp.mx, mtmp.my)) && !(attacktype_fordmg(mtmp.data, AT_BREA, AD_DRST) || attacktype_fordmg(mtmp.data, AT_BREA, AD_RBRE))) {
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        await pline(S("%s coughs!"), await Monnam(mtmp));
      }
      if (!((reg.player_flags & 2) >>> 0)) {
        await setmangry(mtmp, TRUE);
      }
      if ((mtmp.data.mflags1 & 4096) >>> 0 === 0 && mtmp.mcansee | 0) {
        mtmp.mblinded = 1;
        mtmp.mcansee = 0;
      }
      if (((mtmp.data.mresists | mtmp.mextrinsics) & 32) !== 0) {
        return FALSE;
      }
      mtmp.mhp -= rnd(dam) + 5;
      if (mtmp.mhp < 1) {
        if (!((reg.player_flags & 2) >>> 0)) {
          await killed(mtmp);
        } else {
          await monkilled(mtmp, S("gas cloud"), AD_DRST);
        }
        if (mtmp.mhp < 1) {
          return TRUE;
        }
      }
    }
  }
  return FALSE;
}

export async function create_gas_cloud(x: number, y: number, radius: number, damage: number): Promise<struct_NhRegion | null> {
  let cloud = null;
  let i = 0;
  let nrect = 0;
  let tmprect = new struct_nhrect();
  cloud = await create_region(null, 0);
  nrect = radius;
  tmprect.lx = x;
  tmprect.hx = x;
  tmprect.ly = y - (radius - 1) << 24 >> 24;
  tmprect.hy = y + (radius - 1) << 24 >> 24;
  for (i = 0; i < nrect; ++i) {
    await add_rect_to_reg(cloud, tmprect);
    tmprect.lx = tmprect.lx - 1 << 24 >> 24;
    tmprect.hx = tmprect.hx + 1 << 24 >> 24;
    tmprect.ly = tmprect.ly + 1 << 24 >> 24;
    tmprect.hy = tmprect.hy - 1 << 24 >> 24;
  }
  cloud.ttl = rn2(3) + 4;
  if (!G.in_mklev && !G.context.mon_moving) {
    cloud.player_flags = (cloud.player_flags & 4294967293) >>> 0;
  }
  cloud.inside_f = INSIDE_GAS_CLOUD;
  cloud.expire_f = EXPIRE_GAS_CLOUD;
  cloud.arg.$cp(G.zeroany);
  cloud.arg.a_int = damage;
  cloud.visible = TRUE;
  cloud.glyph = (damage ? S_poisoncloud : S_cloud) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
  await add_region(cloud);
  return cloud;
}

export function region_danger(): number {
  let i = 0;
  let f_indx = 0;
  let n = 0;
  for (i = 0; i < n_regions[0]; ++i) {
    if (!((regions.a[regions.o + i].player_flags & 1) >>> 0)) {
      continue;
    }
    f_indx = regions.a[regions.o + i].inside_f;
    if (f_indx === INSIDE_GAS_CLOUD) {
      if ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0 || G.youmonst.data === $sat(G.mons, 49) || (G.youmonst.data.mlet === S_GOLEM || G.youmonst.data.mlet === S_VORTEX) || (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0)) {
        continue;
      }
      if (G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic) {
        continue;
      }
      ++n;
    }
  }
  return (n ? TRUE : FALSE) << 24 >> 24;
}

export async function region_safety(): Promise<void> {
  let r = null;
  let i = 0;
  let f_indx = 0;
  let n = 0;
  for (i = 0; i < n_regions[0]; ++i) {
    if (!((regions.a[regions.o + i].player_flags & 1) >>> 0)) {
      continue;
    }
    f_indx = regions.a[regions.o + i].inside_f;
    if (f_indx === INSIDE_GAS_CLOUD) {
      if (!n++ && regions.a[regions.o + i].ttl >= 0) {
        r = regions.a[regions.o + i];
      }
    }
  }
  if (n > 1 || n === 1 && !r) {
    await safe_teleds(FALSE);
  } else if (r) {
    await remove_region(r);
    await pline_The(S("gas cloud enveloping you dissipates."));
  } else {
    await pline_The(S("gas cloud has dissipated."));
  }
  if ((G.u.uprops[BLINDED].intrinsic & TIMEOUT) === 1) {
    await make_blinded(0, TRUE);
  }
}

export function $init(): void {
  regions = null;
  n_regions = new Int32Array(1);
  n_regions[0] = 0;
  max_regions = 0;
  callbacks = [inside_gas_cloud, expire_gas_cloud];
}
