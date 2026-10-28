// @ts-nocheck
// NetHack 3.6.7 vision.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { isok } from './cmd.ts';
import { is_pool } from './dbridge.ts';
import { detecting } from './detect.ts';
import { newsym } from './display.ts';
import { on_level, recalc_mapseen } from './dungeon.ts';
import { panic } from './end.ts';
import { dist2 } from './hacklib.ts';
import { do_light_sources } from './light.ts';
import { worm_known } from './worm.ts';
import { struct_monst, struct_rm } from './structs.ts';
import { $arr, $at2, $peq, $rd, $sadd, $sat, $ta, $wr, G, P, S, memset } from './rt/index.ts';
import { BLINDED, BOULDER, CLOUD, COLNO, COULD_SEE, DBWALL, DETECT_MONSTERS, DOOR, D_CLOSED, D_LOCKED, D_TRAPPED, INFRAVISION, IN_SIGHT, MAX_RADIUS, MOAT, MONSEEN_DETECT, MONSEEN_INFRAVIS, MONSEEN_NORMAL, MONSEEN_SEEINVIS, MONSEEN_TELEPAT, MONSEEN_WARNMON, MONSEEN_XRAYVIS, M_AP_FURNITURE, M_AP_OBJECT, POOL, ROOMOFFSET, ROWNO, SDOOR, SEE_INVIS, SVALL, S_hcdoor, S_ndoor, S_tree, S_vcdoor, TELEPAT, TEMP_LIT, TREE, TRUE, TT_PIT, WARN_OF_MON, WATER } from './consts.ts';

let could_see: any;
let cs_rows0: any;
let cs_rows1: any;
let cs_rmin0: any;
let cs_rmax0: any;
let cs_rmin1: any;
let cs_rmax1: any;
let viz_clear: any;
let viz_clear_rows: any;
let left_ptrs: any;
let right_ptrs: any;
let start_row: number;
let start_col: number;
let step: number;
let cs_rows: Ptr | null;
let cs_left: Ptr | null;
let cs_right: Ptr | null;
let vis_func: Function | null;
let varg: any;
let vision_recalc$colbump: any;

export function vision_init(): void {
  let i = 0;
  for (i = 0; i < ROWNO; ++i) {
    cs_rows0[i] = P(could_see[0][i]);
    cs_rows1[i] = P(could_see[1][i]);
    viz_clear_rows[i] = P(viz_clear[i]);
  }
  G.viz_array = P(cs_rows0);
  G.viz_rmin = P(cs_rmin0);
  G.viz_rmax = P(cs_rmax0);
  G.vision_full_recalc = 0;
  memset(P(could_see), 0, 3360);
  view_init();
}

export function does_block(x: number, y: number, lev: struct_rm | null): number {
  let obj = null;
  let mon = null;
  if (lev.typ < POOL || lev.typ === TREE || lev.typ === DOOR && (lev.flags | 0) & (D_CLOSED | D_LOCKED | D_TRAPPED)) {
    return 1;
  }
  if (lev.typ === CLOUD || lev.typ === WATER || lev.typ === MOAT && G.u.uinwater | 0) {
    return 1;
  }
  for (obj = G.level.objects[x][y]; obj; obj = obj.v.v_nexthere) {
    if (obj.otyp === BOULDER) {
      return 1;
    }
  }
  if ((mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && (!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && ((mon.m_ap_type & 7) === M_AP_OBJECT && mon.mappearance === 448 || (mon.m_ap_type & 7) === M_AP_FURNITURE && (mon.mappearance === S_hcdoor || mon.mappearance === S_vcdoor || mon.mappearance < S_ndoor || mon.mappearance === S_tree))) {
    return 1;
  }
  return 0;
}

export function vision_reset(): void {
  let y = 0;
  let x = 0;
  let i = 0;
  let dig_left = 0;
  let block = 0;
  let lev = null;
  G.viz_array = P(cs_rows0);
  G.viz_rmin = P(cs_rmin0);
  G.viz_rmax = P(cs_rmax0);
  memset(P(could_see), 0, 3360);
  memset(P(viz_clear), 0, 1680);
  for (y = 0; y < ROWNO; ++y) {
    dig_left = 0;
    block = TRUE;
    lev = $sat(G.level.locations[1], y);
    for (x = 1; x < COLNO; ++x, lev = $sadd(lev, ROWNO)) {
      if (block !== (lev.typ < POOL || does_block(x, y, lev) ? 1 : 0)) {
        if (block) {
          for (i = dig_left; i < x; ++i) {
            left_ptrs[y][i] = dig_left << 24 >> 24;
            right_ptrs[y][i] = x - 1 << 24 >> 24;
          }
        } else {
          i = dig_left;
          if (dig_left) {
            --dig_left;
          }
          for (; i < x; ++i) {
            left_ptrs[y][i] = dig_left << 24 >> 24;
            right_ptrs[y][i] = x << 24 >> 24;
            viz_clear[y][i] = 1;
          }
        }
        dig_left = x;
        block = !block ? 1 : 0;
      }
    }
    i = dig_left;
    if (!block && dig_left) {
      --dig_left;
    }
    for (; i < COLNO; ++i) {
      left_ptrs[y][i] = dig_left << 24 >> 24;
      right_ptrs[y][i] = COLNO - 1;
      viz_clear[y][i] = (!block ? 1 : 0) << 24 >> 24;
    }
  }
  G.iflags.vision_inited = 1;
  G.vision_full_recalc = 1;
}

function get_unused_cs(rows: Ptr | null, rmin: Ptr | null, rmax: Ptr | null): void {
  let $t1: any, $t2: any;
  let row = 0;
  let nrmin = null;
  let nrmax = null;
  if ($peq(G.viz_array, P(cs_rows0))) {
    rows.a[rows.o] = P(cs_rows1);
    rmin.a[rmin.o] = P(cs_rmin1);
    rmax.a[rmax.o] = P(cs_rmax1);
  } else {
    rows.a[rows.o] = P(cs_rows0);
    rmin.a[rmin.o] = P(cs_rmin0);
    rmax.a[rmax.o] = P(cs_rmax0);
  }
  nrmin = rmin.a[rmin.o];
  nrmax = rmax.a[rmax.o];
  memset($rd(rows.a[rows.o]), 0, Math.imul(ROWNO, COLNO));
  for (row = 0; row < ROWNO; ++row) {
    $wr(($t1 = nrmin, nrmin = $t1.add(1), $t1), 0, COLNO - 1);
    $wr(($t2 = nrmax, nrmax = $t2.add(1), $t2), 0, 0);
  }
}

async function rogue_vision(next: Ptr | null, rmin: Ptr | null, rmax: Ptr | null): Promise<void> {
  let rnum = ($at2(G.level.locations, G.u.ux, G.u.uy).roomno | 0) - ROOMOFFSET;
  let start = 0;
  let stop = 0;
  let in_door = 0;
  let xhi = 0;
  let xlo = 0;
  let yhi = 0;
  let ylo = 0;
  let zx = 0;
  let zy = 0;
  if (rnum >= 0) {
    for (zy = G.rooms[rnum].ly - 1; zy <= G.rooms[rnum].hy + 1; ++zy) {
      rmin.a[rmin.o + zy] = (start = G.rooms[rnum].lx - 1) << 24 >> 24;
      rmax.a[rmax.o + zy] = (stop = G.rooms[rnum].hx + 1) << 24 >> 24;
      for (zx = start; zx <= stop; ++zx) {
        if (G.rooms[rnum].rlit) {
          $wr(next.a[next.o + zy], zx, COULD_SEE | IN_SIGHT);
          $at2(G.level.locations, zx, zy).seenv = SVALL;
        } else {
          $wr(next.a[next.o + zy], zx, COULD_SEE);
        }
      }
    }
  }
  in_door = $at2(G.level.locations, G.u.ux, G.u.uy).typ === DOOR ? 1 : 0;
  ylo = G.u.uy - 1 > 0 ? G.u.uy - 1 : 0;
  yhi = G.u.uy + 1 < 21 - 1 ? G.u.uy + 1 : 21 - 1;
  xlo = G.u.ux - 1 > 1 ? G.u.ux - 1 : 1;
  xhi = G.u.ux + 1 < 80 - 1 ? G.u.ux + 1 : 80 - 1;
  for (zy = ylo; zy <= yhi; ++zy) {
    if (xlo < rmin.a[rmin.o + zy]) {
      rmin.a[rmin.o + zy] = xlo << 24 >> 24;
    }
    if (xhi > rmax.a[rmax.o + zy]) {
      rmax.a[rmax.o + zy] = xhi << 24 >> 24;
    }
    for (zx = xlo; zx <= xhi; ++zx) {
      $wr(next.a[next.o + zy], zx, COULD_SEE | IN_SIGHT);
      if (in_door && (zx === G.u.ux || zy === G.u.uy)) {
        await newsym(zx, zy);
      }
    }
  }
}

export async function vision_recalc(control: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let $g = 0;
  let temp_array = null;
  let next_array = [null];
  let next_row = null;
  let old_row = null;
  let next_rmin = [null];
  let next_rmax = [null];
  let ranges = null;
  let row = 0;
  let start = 0;
  let stop = 0;
  let dx = 0;
  let dy = 0;
  let col = 0;
  let lev = null;
  let flev = null;
  let sv = null;
  let oldseenv = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      row = 0;
      G.vision_full_recalc = 0;
      if (G.in_mklev || !G.iflags.vision_inited) {
        return;
      }
      get_unused_cs(P(next_array, 0), P(next_rmin, 0), P(next_rmax, 0));
      if (G.u.uswallow | 0 || control === 2) {
        ;
      } else if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await view_from(G.u.uy, G.u.ux, next_array[0], next_rmin[0], next_rmax[0], 0, null, null);
        temp_array = G.viz_array;
        G.viz_array = next_array[0];
        for (row = 0; row < ROWNO; ++row) {
          old_row = temp_array.a[temp_array.o + row];
          start = G.viz_rmin.a[G.viz_rmin.o + row] < next_rmin[0].a[next_rmin[0].o + row] ? G.viz_rmin.a[G.viz_rmin.o + row] : next_rmin[0].a[next_rmin[0].o + row];
          stop = G.viz_rmax.a[G.viz_rmax.o + row] > next_rmax[0].a[next_rmax[0].o + row] ? G.viz_rmax.a[G.viz_rmax.o + row] : next_rmax[0].a[next_rmax[0].o + row];
          for (col = start; col <= stop; ++col) {
            if (old_row.a[old_row.o + col] & IN_SIGHT) {
              await newsym(col, row);
            }
          }
        }
        { $g = 1; continue $L; }
      } else if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
        await rogue_vision(next_array[0], next_rmin[0], next_rmax[0]);
      } else {
        let has_night_vision = 1;
        if (G.u.uinwater | 0 && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
          has_night_vision = 0;
          for (row = G.u.uy - 1; row <= G.u.uy + 1; ++row) {
            for (col = G.u.ux - 1; col <= G.u.ux + 1; ++col) {
              if (!isok(col, row) || !is_pool(col, row)) {
                continue;
              }
              next_rmin[0].a[next_rmin[0].o + row] = (next_rmin[0].a[next_rmin[0].o + row] < col ? next_rmin[0].a[next_rmin[0].o + row] : col) << 24 >> 24;
              next_rmax[0].a[next_rmax[0].o + row] = (next_rmax[0].a[next_rmax[0].o + row] > col ? next_rmax[0].a[next_rmax[0].o + row] : col) << 24 >> 24;
              $wr(next_array[0].a[next_array[0].o + row], col, IN_SIGHT | COULD_SEE);
            }
          }
        } else if (G.u.utrap && G.u.utraptype === TT_PIT) {
          for (row = G.u.uy - 1; row <= G.u.uy + 1; ++row) {
            if (row < 0) {
              continue;
            }
            if (row >= ROWNO) {
              break;
            }
            next_rmin[0].a[next_rmin[0].o + row] = (0 > G.u.ux - 1 ? 0 : G.u.ux - 1) << 24 >> 24;
            next_rmax[0].a[next_rmax[0].o + row] = (80 - 1 < G.u.ux + 1 ? 80 - 1 : G.u.ux + 1) << 24 >> 24;
            next_row = next_array[0].a[next_array[0].o + row];
            for (col = next_rmin[0].a[next_rmin[0].o + row]; col <= next_rmax[0].a[next_rmax[0].o + row]; ++col) {
              next_row.a[next_row.o + col] = IN_SIGHT | COULD_SEE;
            }
          }
        } else {
          await view_from(G.u.uy, G.u.ux, next_array[0], next_rmin[0], next_rmax[0], 0, null, null);
        }
        if (G.u.xray_range >= 0) {
          if (G.u.xray_range) {
            ranges = P(G.circle_data, G.circle_start[G.u.xray_range]);
            for (row = G.u.uy - G.u.xray_range; row <= G.u.uy + G.u.xray_range; ++row) {
              if (row < 0) {
                continue;
              }
              if (row >= ROWNO) {
                break;
              }
              dy = G.u.uy - row < 0 ? -(G.u.uy - row) : G.u.uy - row;
              next_row = next_array[0].a[next_array[0].o + row];
              start = 0 > G.u.ux - ranges.a[ranges.o + dy] ? 0 : G.u.ux - ranges.a[ranges.o + dy];
              stop = 80 - 1 < G.u.ux + ranges.a[ranges.o + dy] ? 80 - 1 : G.u.ux + ranges.a[ranges.o + dy];
              for (col = start; col <= stop; ++col) {
                let old_row_val = next_row.a[next_row.o + col];
                next_row.a[next_row.o + col] = (next_row.a[next_row.o + col] | IN_SIGHT) << 24 >> 24;
                oldseenv = $at2(G.level.locations, col, row).seenv;
                $at2(G.level.locations, col, row).seenv = SVALL;
                if (!(old_row_val & IN_SIGHT) || oldseenv !== SVALL) {
                  await newsym(col, row);
                }
              }
              next_rmin[0].a[next_rmin[0].o + row] = (start < next_rmin[0].a[next_rmin[0].o + row] ? start : next_rmin[0].a[next_rmin[0].o + row]) << 24 >> 24;
              next_rmax[0].a[next_rmax[0].o + row] = (stop > next_rmax[0].a[next_rmax[0].o + row] ? stop : next_rmax[0].a[next_rmax[0].o + row]) << 24 >> 24;
            }
          } else {
            ($t1 = next_array[0].a[next_array[0].o + G.u.uy], $t2 = G.u.ux, $t1.a[$t1.o + $t2] = ($t1.a[$t1.o + $t2] | IN_SIGHT) << 24 >> 24);
            $at2(G.level.locations, G.u.ux, G.u.uy).seenv = SVALL;
            next_rmin[0].a[next_rmin[0].o + G.u.uy] = (G.u.ux < next_rmin[0].a[next_rmin[0].o + G.u.uy] ? G.u.ux : next_rmin[0].a[next_rmin[0].o + G.u.uy]) << 24 >> 24;
            next_rmax[0].a[next_rmax[0].o + G.u.uy] = (G.u.ux > next_rmax[0].a[next_rmax[0].o + G.u.uy] ? G.u.ux : next_rmax[0].a[next_rmax[0].o + G.u.uy]) << 24 >> 24;
          }
        }
        if (has_night_vision && G.u.xray_range < G.u.nv_range) {
          if (!G.u.nv_range) {
            ($t3 = next_array[0].a[next_array[0].o + G.u.uy], $t4 = G.u.ux, $t3.a[$t3.o + $t4] = ($t3.a[$t3.o + $t4] | IN_SIGHT) << 24 >> 24);
            $at2(G.level.locations, G.u.ux, G.u.uy).seenv = SVALL;
            next_rmin[0].a[next_rmin[0].o + G.u.uy] = (G.u.ux < next_rmin[0].a[next_rmin[0].o + G.u.uy] ? G.u.ux : next_rmin[0].a[next_rmin[0].o + G.u.uy]) << 24 >> 24;
            next_rmax[0].a[next_rmax[0].o + G.u.uy] = (G.u.ux > next_rmax[0].a[next_rmax[0].o + G.u.uy] ? G.u.ux : next_rmax[0].a[next_rmax[0].o + G.u.uy]) << 24 >> 24;
          } else if (G.u.nv_range > 0) {
            ranges = P(G.circle_data, G.circle_start[G.u.nv_range]);
            for (row = G.u.uy - G.u.nv_range; row <= G.u.uy + G.u.nv_range; ++row) {
              if (row < 0) {
                continue;
              }
              if (row >= ROWNO) {
                break;
              }
              dy = G.u.uy - row < 0 ? -(G.u.uy - row) : G.u.uy - row;
              next_row = next_array[0].a[next_array[0].o + row];
              start = 0 > G.u.ux - ranges.a[ranges.o + dy] ? 0 : G.u.ux - ranges.a[ranges.o + dy];
              stop = 80 - 1 < G.u.ux + ranges.a[ranges.o + dy] ? 80 - 1 : G.u.ux + ranges.a[ranges.o + dy];
              for (col = start; col <= stop; ++col) {
                if (next_row.a[next_row.o + col]) {
                  next_row.a[next_row.o + col] = (next_row.a[next_row.o + col] | IN_SIGHT) << 24 >> 24;
                }
              }
              next_rmin[0].a[next_rmin[0].o + row] = (start < next_rmin[0].a[next_rmin[0].o + row] ? start : next_rmin[0].a[next_rmin[0].o + row]) << 24 >> 24;
              next_rmax[0].a[next_rmax[0].o + row] = (stop > next_rmax[0].a[next_rmax[0].o + row] ? stop : next_rmax[0].a[next_rmax[0].o + row]) << 24 >> 24;
            }
          }
        }
      }
      do_light_sources(next_array[0]);
      temp_array = G.viz_array;
      G.viz_array = next_array[0];
      vision_recalc$colbump[G.u.ux] = vision_recalc$colbump[G.u.ux + 1] = 1;
      row = 0;
    case 3:
      if (!(row < ROWNO)) { $g = 5; continue $L; }
      dy = G.u.uy - row;
      dy = dy < 0 ? -1 : dy ? 1 : 0;
      next_row = next_array[0].a[next_array[0].o + row];
      old_row = temp_array.a[temp_array.o + row];
      start = G.viz_rmin.a[G.viz_rmin.o + row] < next_rmin[0].a[next_rmin[0].o + row] ? G.viz_rmin.a[G.viz_rmin.o + row] : next_rmin[0].a[next_rmin[0].o + row];
      stop = G.viz_rmax.a[G.viz_rmax.o + row] > next_rmax[0].a[next_rmax[0].o + row] ? G.viz_rmax.a[G.viz_rmax.o + row] : next_rmax[0].a[next_rmax[0].o + row];
      lev = $sat(G.level.locations[start], row);
      sv = P(G.seenv_matrix[dy + 1], start < G.u.ux ? 0 : start > G.u.ux ? 2 : 1);
      col = start;
    case 6:
      if (!(col <= stop)) { $g = 8; continue $L; }
      if (!(next_row.a[next_row.o + col] & IN_SIGHT)) { $g = 10; continue $L; }
      {
        oldseenv = lev.seenv;
        lev.seenv = (lev.seenv | sv.a[sv.o]) & 0xff;
        if (!(old_row.a[old_row.o + col] & IN_SIGHT) || oldseenv !== lev.seenv) {
          await newsym(col, row);
        }
      }
      { $g = 9; continue $L; }
    case 10:
      if (!(next_row.a[next_row.o + col] & COULD_SEE && (lev.lit | 0 || next_row.a[next_row.o + col] & TEMP_LIT))) { $g = 12; continue $L; }
      {
        if ((lev.typ === DOOR || lev.typ === SDOOR || lev.typ && lev.typ <= DBWALL) && !viz_clear[row][col]) {
          dx = G.u.ux - col;
          dx = dx < 0 ? -1 : dx ? 1 : 0;
          flev = $sat(G.level.locations[col + dx], row + dy);
          if (flev.lit | 0 || $rd(next_array[0].a[next_array[0].o + (row + dy)], (col + dx)) & TEMP_LIT) {
            next_row.a[next_row.o + col] = (next_row.a[next_row.o + col] | IN_SIGHT) << 24 >> 24;
            oldseenv = lev.seenv;
            lev.seenv = (lev.seenv | sv.a[sv.o]) & 0xff;
            if (!(old_row.a[old_row.o + col] & IN_SIGHT) || oldseenv !== lev.seenv) {
              await newsym(col, row);
            }
          } else {
            { $g = 2; continue $L; }
          }
        } else {
          next_row.a[next_row.o + col] = (next_row.a[next_row.o + col] | IN_SIGHT) << 24 >> 24;
          oldseenv = lev.seenv;
          lev.seenv = (lev.seenv | sv.a[sv.o]) & 0xff;
          if (!(old_row.a[old_row.o + col] & IN_SIGHT) || oldseenv !== lev.seenv) {
            await newsym(col, row);
          }
        }
      }
      { $g = 11; continue $L; }
    case 12:
      if (!(next_row.a[next_row.o + col] & COULD_SEE && lev.waslit | 0)) { $g = 14; continue $L; }
      {
        lev.waslit = 0;
        await newsym(col, row);
      }
      { $g = 13; continue $L; }
    case 14:
    case 2: // not_in_sight
      if (old_row.a[old_row.o + col] & IN_SIGHT || next_row.a[next_row.o + col] & COULD_SEE ^ old_row.a[old_row.o + col] & COULD_SEE) {
        await newsym(col, row);
      }
    case 13:
    case 11:
    case 9:
    case 7:
      lev = $sadd(lev, ROWNO), sv = sv.add(vision_recalc$colbump[++col]);
      { $g = 6; continue $L; }
    case 8:
    case 4:
      ++row;
      { $g = 3; continue $L; }
    case 5:
      vision_recalc$colbump[G.u.ux] = vision_recalc$colbump[G.u.ux + 1] = 0;
    case 1: // skip
      if (!G.program_state.panicking) {
        await newsym(G.u.ux, G.u.uy);
      }
      G.viz_rmin = next_rmin[0];
      G.viz_rmax = next_rmax[0];
      await recalc_mapseen();
    }
    break;
  }
}

export function block_point(x: number, y: number): void {
  fill_point(y, x);
  if ($rd(G.viz_array.a[G.viz_array.o + y], x)) {
    G.vision_full_recalc = 1;
  }
}

export function unblock_point(x: number, y: number): void {
  dig_point(y, x);
  if ($rd(G.viz_array.a[G.viz_array.o + y], x)) {
    G.vision_full_recalc = 1;
  }
}

function dig_point(row: number, col: number): void {
  let i = 0;
  if (viz_clear[row][col]) {
    return;
  }
  viz_clear[row][col] = 1;
  if (col === 0) {
    if (viz_clear[row][1]) {
      right_ptrs[row][0] = right_ptrs[row][1];
    } else {
      right_ptrs[row][0] = 1;
      for (i = 1; i <= right_ptrs[row][1]; ++i) {
        left_ptrs[row][i] = 1;
      }
    }
  } else if (col === COLNO - 1) {
    if (viz_clear[row][COLNO - 2]) {
      left_ptrs[row][COLNO - 1] = left_ptrs[row][COLNO - 2];
    } else {
      left_ptrs[row][COLNO - 1] = COLNO - 2;
      for (i = left_ptrs[row][COLNO - 2]; i < COLNO - 1; ++i) {
        right_ptrs[row][i] = COLNO - 2;
      }
    }
  } else if (viz_clear[row][col - 1] && viz_clear[row][col + 1]) {
    for (i = left_ptrs[row][col - 1]; i <= col; ++i) {
      if (!viz_clear[row][i]) {
        continue;
      }
      right_ptrs[row][i] = right_ptrs[row][col + 1];
    }
    for (i = col; i <= right_ptrs[row][col + 1]; ++i) {
      if (!viz_clear[row][i]) {
        continue;
      }
      left_ptrs[row][i] = left_ptrs[row][col - 1];
    }
  } else if (viz_clear[row][col - 1]) {
    for (i = col + 1; i <= right_ptrs[row][col + 1]; ++i) {
      left_ptrs[row][i] = col + 1 << 24 >> 24;
    }
    for (i = left_ptrs[row][col - 1]; i <= col; ++i) {
      if (!viz_clear[row][i]) {
        continue;
      }
      right_ptrs[row][i] = col + 1 << 24 >> 24;
    }
    left_ptrs[row][col] = left_ptrs[row][col - 1];
  } else if (viz_clear[row][col + 1]) {
    for (i = left_ptrs[row][col - 1]; i < col; ++i) {
      right_ptrs[row][i] = col - 1 << 24 >> 24;
    }
    for (i = col; i <= right_ptrs[row][col + 1]; ++i) {
      if (!viz_clear[row][i]) {
        continue;
      }
      left_ptrs[row][i] = col - 1 << 24 >> 24;
    }
    right_ptrs[row][col] = right_ptrs[row][col + 1];
  } else {
    for (i = left_ptrs[row][col - 1]; i < col; ++i) {
      right_ptrs[row][i] = col - 1 << 24 >> 24;
    }
    for (i = col + 1; i <= right_ptrs[row][col + 1]; ++i) {
      left_ptrs[row][i] = col + 1 << 24 >> 24;
    }
    left_ptrs[row][col] = col - 1 << 24 >> 24;
    right_ptrs[row][col] = col + 1 << 24 >> 24;
  }
}

function fill_point(row: number, col: number): void {
  let i = 0;
  if (!viz_clear[row][col]) {
    return;
  }
  viz_clear[row][col] = 0;
  if (col === 0) {
    if (viz_clear[row][1]) {
      right_ptrs[row][0] = 0;
    } else {
      right_ptrs[row][0] = right_ptrs[row][1];
      for (i = 1; i <= right_ptrs[row][1]; ++i) {
        left_ptrs[row][i] = 0;
      }
    }
  } else if (col === COLNO - 1) {
    if (viz_clear[row][COLNO - 2]) {
      left_ptrs[row][COLNO - 1] = COLNO - 1;
    } else {
      left_ptrs[row][COLNO - 1] = left_ptrs[row][COLNO - 2];
      for (i = left_ptrs[row][COLNO - 2]; i < COLNO - 1; ++i) {
        right_ptrs[row][i] = COLNO - 1;
      }
    }
  } else if (viz_clear[row][col - 1] && viz_clear[row][col + 1]) {
    for (i = left_ptrs[row][col - 1] + 1; i <= col; ++i) {
      right_ptrs[row][i] = col << 24 >> 24;
    }
    if (!left_ptrs[row][col - 1]) {
      right_ptrs[row][0] = col << 24 >> 24;
    }
    for (i = col; i < right_ptrs[row][col + 1]; ++i) {
      left_ptrs[row][i] = col << 24 >> 24;
    }
    if (right_ptrs[row][col + 1] === COLNO - 1) {
      left_ptrs[row][COLNO - 1] = col << 24 >> 24;
    }
  } else if (viz_clear[row][col - 1]) {
    for (i = col; i <= right_ptrs[row][col + 1]; ++i) {
      left_ptrs[row][i] = col << 24 >> 24;
    }
    for (i = left_ptrs[row][col - 1] + 1; i < col; ++i) {
      right_ptrs[row][i] = col << 24 >> 24;
    }
    if (!left_ptrs[row][col - 1]) {
      right_ptrs[row][i] = col << 24 >> 24;
    }
    right_ptrs[row][col] = right_ptrs[row][col + 1];
  } else if (viz_clear[row][col + 1]) {
    for (i = left_ptrs[row][col - 1]; i <= col; ++i) {
      right_ptrs[row][i] = col << 24 >> 24;
    }
    for (i = col + 1; i < right_ptrs[row][col + 1]; ++i) {
      left_ptrs[row][i] = col << 24 >> 24;
    }
    if (right_ptrs[row][col + 1] === COLNO - 1) {
      left_ptrs[row][i] = col << 24 >> 24;
    }
    left_ptrs[row][col] = left_ptrs[row][col - 1];
  } else {
    for (i = left_ptrs[row][col - 1]; i <= col; ++i) {
      right_ptrs[row][i] = right_ptrs[row][col + 1];
    }
    for (i = col; i <= right_ptrs[row][col + 1]; ++i) {
      left_ptrs[row][i] = left_ptrs[row][col - 1];
    }
  }
}

export function clear_path(col1: number, row1: number, col2: number, row2: number): number {
  let $g = 0;
  let result = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (col1 < col2) {
        if (row1 > row2) {
          {
            let dx = 0;
            let dy = 0;
            let k = 0;
            let err = 0;
            let x = 0;
            let y = 0;
            let dxs = 0;
            let dys = 0;
            x = col1;
            y = row1;
            dx = col2 - x;
            dy = y - row2;
            result = 0;
            dxs = dx << 1;
            dys = dy << 1;
            if (dy > dx) {
              err = dxs - dy;
              for (k = dy - 1; k; --k) {
                if (err >= 0) {
                  ++x;
                  err -= dys;
                }
                --y;
                err += dxs;
                if (!$rd(viz_clear_rows[y], x)) {
                  { $g = 1; continue $L; }
                }
              }
            } else {
              err = dys - dx;
              for (k = dx - 1; k; --k) {
                if (err >= 0) {
                  --y;
                  err -= dxs;
                }
                ++x;
                err += dys;
                if (!$rd(viz_clear_rows[y], x)) {
                  { $g = 1; continue $L; }
                }
              }
            }
            result = 1;
          }
          ;
        } else {
          {
            let dx = 0;
            let dy = 0;
            let k = 0;
            let err = 0;
            let x = 0;
            let y = 0;
            let dxs = 0;
            let dys = 0;
            x = col1;
            y = row1;
            dx = col2 - x;
            dy = row2 - y;
            result = 0;
            dxs = dx << 1;
            dys = dy << 1;
            if (dy > dx) {
              err = dxs - dy;
              for (k = dy - 1; k; --k) {
                if (err >= 0) {
                  ++x;
                  err -= dys;
                }
                ++y;
                err += dxs;
                if (!$rd(viz_clear_rows[y], x)) {
                  { $g = 1; continue $L; }
                }
              }
            } else {
              err = dys - dx;
              for (k = dx - 1; k; --k) {
                if (err >= 0) {
                  ++y;
                  err -= dxs;
                }
                ++x;
                err += dys;
                if (!$rd(viz_clear_rows[y], x)) {
                  { $g = 1; continue $L; }
                }
              }
            }
            result = 1;
          }
          ;
        }
      } else {
        if (row1 > row2) {
          {
            let dx = 0;
            let dy = 0;
            let k = 0;
            let err = 0;
            let x = 0;
            let y = 0;
            let dxs = 0;
            let dys = 0;
            x = col1;
            y = row1;
            dx = x - col2;
            dy = y - row2;
            result = 0;
            dxs = dx << 1;
            dys = dy << 1;
            if (dy > dx) {
              err = dxs - dy;
              for (k = dy - 1; k; --k) {
                if (err >= 0) {
                  --x;
                  err -= dys;
                }
                --y;
                err += dxs;
                if (!$rd(viz_clear_rows[y], x)) {
                  { $g = 1; continue $L; }
                }
              }
            } else {
              err = dys - dx;
              for (k = dx - 1; k; --k) {
                if (err >= 0) {
                  --y;
                  err -= dxs;
                }
                --x;
                err += dys;
                if (!$rd(viz_clear_rows[y], x)) {
                  { $g = 1; continue $L; }
                }
              }
            }
            result = 1;
          }
          ;
        } else if (row1 === row2 && col1 === col2) {
          result = 1;
        } else {
          {
            let dx = 0;
            let dy = 0;
            let k = 0;
            let err = 0;
            let x = 0;
            let y = 0;
            let dxs = 0;
            let dys = 0;
            x = col1;
            y = row1;
            dx = x - col2;
            dy = row2 - y;
            result = 0;
            dxs = dx << 1;
            dys = dy << 1;
            if (dy > dx) {
              err = dxs - dy;
              for (k = dy - 1; k; --k) {
                if (err >= 0) {
                  --x;
                  err -= dys;
                }
                ++y;
                err += dxs;
                if (!$rd(viz_clear_rows[y], x)) {
                  { $g = 1; continue $L; }
                }
              }
            } else {
              err = dys - dx;
              for (k = dx - 1; k; --k) {
                if (err >= 0) {
                  ++y;
                  err -= dxs;
                }
                --x;
                err += dys;
                if (!$rd(viz_clear_rows[y], x)) {
                  { $g = 1; continue $L; }
                }
              }
            }
            result = 1;
          }
          ;
        }
      }
    case 1: // cleardone
      return result << 24 >> 24;
    }
    break;
  }
}

function view_init(): void {
}

async function right_side(row: number, left: number, right_mark: number, limits: Ptr | null): Promise<void> {
  let $g = 0;
  let right = 0;
  let right_edge = 0;
  let nrow = 0;
  let deeper = 0;
  let result = 0;
  let i = 0;
  let rowp = null;
  let row_min = null;
  let row_max = null;
  let lim_max = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      rowp = null;
      row_min = null;
      row_max = null;
      nrow = row + step;
      deeper = nrow >= 0 && nrow < 21 && (!limits || limits.a[limits.o] >= $rd(limits.add(1))) ? 1 : 0;
      if (!vis_func) {
        rowp = cs_rows.a[cs_rows.o + row];
        row_min = cs_left.add(row);
        row_max = cs_right.add(row);
      }
      if (limits) {
        lim_max = start_col + limits.a[limits.o];
        if (lim_max > COLNO - 1) {
          lim_max = COLNO - 1;
        }
        if (right_mark > lim_max) {
          right_mark = lim_max;
        }
        limits = limits.add(1);
      } else {
        lim_max = COLNO - 1;
      }
    case 3:
      if (!(left <= right_mark)) { $g = 4; continue $L; }
      right_edge = right_ptrs[row][left];
      if (right_edge > lim_max) {
        right_edge = lim_max;
      }
      if (!$rd(viz_clear_rows[row], left)) {
        if (right_edge > right_mark) {
          right_edge = $rd(viz_clear_rows[row - step], right_mark) ? right_mark + 1 : right_mark;
        }
        if (vis_func) {
          for (i = left; i <= right_edge; ++i) {
            await vis_func(i, row, varg);
          }
        } else {
          for (i = left; i <= right_edge; ++i) {
            rowp.a[rowp.o + i] = 1;
          }
          if (row_min.a[row_min.o] > left) {
            row_min.a[row_min.o] = left << 24 >> 24;
          }
          if (row_max.a[row_max.o] < right_edge) {
            row_max.a[row_max.o] = right_edge << 24 >> 24;
          }
        }
        left = right_edge + 1;
        { $g = 3; continue $L; };
      }
      if (!(left !== start_col)) { $g = 5; continue $L; }
    case 6:
      if (!(left <= right_edge)) { $g = 8; continue $L; }
      if (step < 0) {
        {
          let dx = 0;
          let dy = 0;
          let k = 0;
          let err = 0;
          let x = 0;
          let y = 0;
          let dxs = 0;
          let dys = 0;
          x = start_col;
          y = start_row;
          dx = left - x;
          dy = y - row;
          result = 0;
          dxs = dx << 1;
          dys = dy << 1;
          if (dy > dx) {
            err = dxs - dy;
            for (k = dy - 1; k; --k) {
              if (err >= 0) {
                ++x;
                err -= dys;
              }
              --y;
              err += dxs;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 1; continue $L; }
              }
            }
          } else {
            err = dys - dx;
            for (k = dx - 1; k; --k) {
              if (err >= 0) {
                --y;
                err -= dxs;
              }
              ++x;
              err += dys;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 1; continue $L; }
              }
            }
          }
          result = 1;
        }
        ;
      } else {
        {
          let dx = 0;
          let dy = 0;
          let k = 0;
          let err = 0;
          let x = 0;
          let y = 0;
          let dxs = 0;
          let dys = 0;
          x = start_col;
          y = start_row;
          dx = left - x;
          dy = row - y;
          result = 0;
          dxs = dx << 1;
          dys = dy << 1;
          if (dy > dx) {
            err = dxs - dy;
            for (k = dy - 1; k; --k) {
              if (err >= 0) {
                ++x;
                err -= dys;
              }
              ++y;
              err += dxs;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 1; continue $L; }
              }
            }
          } else {
            err = dys - dx;
            for (k = dx - 1; k; --k) {
              if (err >= 0) {
                ++y;
                err -= dxs;
              }
              ++x;
              err += dys;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 1; continue $L; }
              }
            }
          }
          result = 1;
        }
        ;
      }
    case 1: // rside1
      if (result) {
        { $g = 8; continue $L; };
      }
    case 7:
      ++left;
      { $g = 6; continue $L; }
    case 8:
      if (left > lim_max) {
        return;
      }
      if (left === lim_max) {
        if (vis_func) {
          await vis_func(lim_max, row, varg);
        } else {
          rowp.a[rowp.o + lim_max] = 1;
          if (row_max.a[row_max.o] < lim_max) {
            row_max.a[row_max.o] = lim_max << 24 >> 24;
          }
        }
        return;
      }
      if (left >= right_edge) {
        left = right_edge;
        { $g = 3; continue $L; };
      }
    case 5:
      if (!(right_mark < right_edge)) { $g = 10; continue $L; }
      right = right_mark;
    case 11:
      if (!(right <= right_edge)) { $g = 13; continue $L; }
      if (step < 0) {
        {
          let dx = 0;
          let dy = 0;
          let k = 0;
          let err = 0;
          let x = 0;
          let y = 0;
          let dxs = 0;
          let dys = 0;
          x = start_col;
          y = start_row;
          dx = right - x;
          dy = y - row;
          result = 0;
          dxs = dx << 1;
          dys = dy << 1;
          if (dy > dx) {
            err = dxs - dy;
            for (k = dy - 1; k; --k) {
              if (err >= 0) {
                ++x;
                err -= dys;
              }
              --y;
              err += dxs;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 2; continue $L; }
              }
            }
          } else {
            err = dys - dx;
            for (k = dx - 1; k; --k) {
              if (err >= 0) {
                --y;
                err -= dxs;
              }
              ++x;
              err += dys;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 2; continue $L; }
              }
            }
          }
          result = 1;
        }
        ;
      } else {
        {
          let dx = 0;
          let dy = 0;
          let k = 0;
          let err = 0;
          let x = 0;
          let y = 0;
          let dxs = 0;
          let dys = 0;
          x = start_col;
          y = start_row;
          dx = right - x;
          dy = row - y;
          result = 0;
          dxs = dx << 1;
          dys = dy << 1;
          if (dy > dx) {
            err = dxs - dy;
            for (k = dy - 1; k; --k) {
              if (err >= 0) {
                ++x;
                err -= dys;
              }
              ++y;
              err += dxs;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 2; continue $L; }
              }
            }
          } else {
            err = dys - dx;
            for (k = dx - 1; k; --k) {
              if (err >= 0) {
                ++y;
                err -= dxs;
              }
              ++x;
              err += dys;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 2; continue $L; }
              }
            }
          }
          result = 1;
        }
        ;
      }
    case 2: // rside2
      if (!result) {
        { $g = 13; continue $L; };
      }
    case 12:
      ++right;
      { $g = 11; continue $L; }
    case 13:
      --right;
      { $g = 9; continue $L; }
    case 10:
      right = right_edge;
    case 9:
      if (left <= right) {
        if (left === right && left === start_col && start_col < COLNO - 1 && !$rd(viz_clear_rows[row], (start_col + 1))) {
          right = start_col + 1;
        }
        if (right > lim_max) {
          right = lim_max;
        }
        if (vis_func) {
          for (i = left; i <= right; ++i) {
            await vis_func(i, row, varg);
          }
        } else {
          for (i = left; i <= right; ++i) {
            rowp.a[rowp.o + i] = 1;
          }
          if (row_min.a[row_min.o] > left) {
            row_min.a[row_min.o] = left << 24 >> 24;
          }
          if (row_max.a[row_max.o] < right) {
            row_max.a[row_max.o] = right << 24 >> 24;
          }
        }
        if (deeper) {
          await right_side(nrow, left, right, limits);
        }
        left = right + 1;
      }
      { $g = 3; continue $L; }
    case 4:
    }
    break;
  }
}

async function left_side(row: number, left_mark: number, right: number, limits: Ptr | null): Promise<void> {
  let $g = 0;
  let left = 0;
  let left_edge = 0;
  let nrow = 0;
  let deeper = 0;
  let result = 0;
  let i = 0;
  let rowp = null;
  let row_min = null;
  let row_max = null;
  let lim_min = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      rowp = null;
      row_min = null;
      row_max = null;
      nrow = row + step;
      deeper = nrow >= 0 && nrow < 21 && (!limits || limits.a[limits.o] >= $rd(limits.add(1))) ? 1 : 0;
      if (!vis_func) {
        rowp = cs_rows.a[cs_rows.o + row];
        row_min = cs_left.add(row);
        row_max = cs_right.add(row);
      }
      if (limits) {
        lim_min = start_col - limits.a[limits.o];
        if (lim_min < 0) {
          lim_min = 0;
        }
        if (left_mark < lim_min) {
          left_mark = lim_min;
        }
        limits = limits.add(1);
      } else {
        lim_min = 0;
      }
    case 3:
      if (!(right >= left_mark)) { $g = 4; continue $L; }
      left_edge = left_ptrs[row][right];
      if (left_edge < lim_min) {
        left_edge = lim_min;
      }
      if (!$rd(viz_clear_rows[row], right)) {
        if (left_edge < left_mark) {
          left_edge = $rd(viz_clear_rows[row - step], left_mark) ? left_mark - 1 : left_mark;
        }
        if (vis_func) {
          for (i = left_edge; i <= right; ++i) {
            await vis_func(i, row, varg);
          }
        } else {
          for (i = left_edge; i <= right; ++i) {
            rowp.a[rowp.o + i] = 1;
          }
          if (row_min.a[row_min.o] > left_edge) {
            row_min.a[row_min.o] = left_edge << 24 >> 24;
          }
          if (row_max.a[row_max.o] < right) {
            row_max.a[row_max.o] = right << 24 >> 24;
          }
        }
        right = left_edge - 1;
        { $g = 3; continue $L; };
      }
      if (!(right !== start_col)) { $g = 5; continue $L; }
    case 6:
      if (!(right >= left_edge)) { $g = 8; continue $L; }
      if (step < 0) {
        {
          let dx = 0;
          let dy = 0;
          let k = 0;
          let err = 0;
          let x = 0;
          let y = 0;
          let dxs = 0;
          let dys = 0;
          x = start_col;
          y = start_row;
          dx = x - right;
          dy = y - row;
          result = 0;
          dxs = dx << 1;
          dys = dy << 1;
          if (dy > dx) {
            err = dxs - dy;
            for (k = dy - 1; k; --k) {
              if (err >= 0) {
                --x;
                err -= dys;
              }
              --y;
              err += dxs;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 1; continue $L; }
              }
            }
          } else {
            err = dys - dx;
            for (k = dx - 1; k; --k) {
              if (err >= 0) {
                --y;
                err -= dxs;
              }
              --x;
              err += dys;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 1; continue $L; }
              }
            }
          }
          result = 1;
        }
        ;
      } else {
        {
          let dx = 0;
          let dy = 0;
          let k = 0;
          let err = 0;
          let x = 0;
          let y = 0;
          let dxs = 0;
          let dys = 0;
          x = start_col;
          y = start_row;
          dx = x - right;
          dy = row - y;
          result = 0;
          dxs = dx << 1;
          dys = dy << 1;
          if (dy > dx) {
            err = dxs - dy;
            for (k = dy - 1; k; --k) {
              if (err >= 0) {
                --x;
                err -= dys;
              }
              ++y;
              err += dxs;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 1; continue $L; }
              }
            }
          } else {
            err = dys - dx;
            for (k = dx - 1; k; --k) {
              if (err >= 0) {
                ++y;
                err -= dxs;
              }
              --x;
              err += dys;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 1; continue $L; }
              }
            }
          }
          result = 1;
        }
        ;
      }
    case 1: // lside1
      if (result) {
        { $g = 8; continue $L; };
      }
    case 7:
      --right;
      { $g = 6; continue $L; }
    case 8:
      if (right < lim_min) {
        return;
      }
      if (right === lim_min) {
        if (vis_func) {
          await vis_func(lim_min, row, varg);
        } else {
          rowp.a[rowp.o + lim_min] = 1;
          if (row_min.a[row_min.o] > lim_min) {
            row_min.a[row_min.o] = lim_min << 24 >> 24;
          }
        }
        return;
      }
      if (right <= left_edge) {
        right = left_edge;
        { $g = 3; continue $L; };
      }
    case 5:
      if (!(left_mark > left_edge)) { $g = 10; continue $L; }
      left = left_mark;
    case 11:
      if (!(left >= left_edge)) { $g = 13; continue $L; }
      if (step < 0) {
        {
          let dx = 0;
          let dy = 0;
          let k = 0;
          let err = 0;
          let x = 0;
          let y = 0;
          let dxs = 0;
          let dys = 0;
          x = start_col;
          y = start_row;
          dx = x - left;
          dy = y - row;
          result = 0;
          dxs = dx << 1;
          dys = dy << 1;
          if (dy > dx) {
            err = dxs - dy;
            for (k = dy - 1; k; --k) {
              if (err >= 0) {
                --x;
                err -= dys;
              }
              --y;
              err += dxs;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 2; continue $L; }
              }
            }
          } else {
            err = dys - dx;
            for (k = dx - 1; k; --k) {
              if (err >= 0) {
                --y;
                err -= dxs;
              }
              --x;
              err += dys;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 2; continue $L; }
              }
            }
          }
          result = 1;
        }
        ;
      } else {
        {
          let dx = 0;
          let dy = 0;
          let k = 0;
          let err = 0;
          let x = 0;
          let y = 0;
          let dxs = 0;
          let dys = 0;
          x = start_col;
          y = start_row;
          dx = x - left;
          dy = row - y;
          result = 0;
          dxs = dx << 1;
          dys = dy << 1;
          if (dy > dx) {
            err = dxs - dy;
            for (k = dy - 1; k; --k) {
              if (err >= 0) {
                --x;
                err -= dys;
              }
              ++y;
              err += dxs;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 2; continue $L; }
              }
            }
          } else {
            err = dys - dx;
            for (k = dx - 1; k; --k) {
              if (err >= 0) {
                ++y;
                err -= dxs;
              }
              --x;
              err += dys;
              if (!$rd(viz_clear_rows[y], x)) {
                { $g = 2; continue $L; }
              }
            }
          }
          result = 1;
        }
        ;
      }
    case 2: // lside2
      if (!result) {
        { $g = 13; continue $L; };
      }
    case 12:
      --left;
      { $g = 11; continue $L; }
    case 13:
      ++left;
      { $g = 9; continue $L; }
    case 10:
      left = left_edge;
    case 9:
      if (left <= right) {
        if (left === right && right === start_col && start_col > 0 && !$rd(viz_clear_rows[row], (start_col - 1))) {
          left = start_col - 1;
        }
        if (left < lim_min) {
          left = lim_min;
        }
        if (vis_func) {
          for (i = left; i <= right; ++i) {
            await vis_func(i, row, varg);
          }
        } else {
          for (i = left; i <= right; ++i) {
            rowp.a[rowp.o + i] = 1;
          }
          if (row_min.a[row_min.o] > left) {
            row_min.a[row_min.o] = left << 24 >> 24;
          }
          if (row_max.a[row_max.o] < right) {
            row_max.a[row_max.o] = right << 24 >> 24;
          }
        }
        if (deeper) {
          await left_side(nrow, left, right, limits);
        }
        right = left - 1;
      }
      { $g = 3; continue $L; }
    case 4:
    }
    break;
  }
}

async function view_from(srow: number, scol: number, loc_cs_rows: Ptr | null, left_most: Ptr | null, right_most: Ptr | null, range: number, func: Function | null, arg: any): Promise<void> {
  let i = 0;
  let rowp = null;
  let nrow = 0;
  let left = 0;
  let right = 0;
  let limits = null;
  start_col = scol;
  start_row = srow;
  cs_rows = loc_cs_rows;
  cs_left = left_most;
  cs_right = right_most;
  vis_func = func;
  varg = arg;
  if ($rd(viz_clear_rows[srow], scol)) {
    left = left_ptrs[srow][scol];
    right = right_ptrs[srow][scol];
  } else {
    left = !scol ? 0 : $rd(viz_clear_rows[srow], (scol - 1)) ? left_ptrs[srow][scol - 1] : scol - 1;
    right = scol === COLNO - 1 ? COLNO - 1 : $rd(viz_clear_rows[srow], (scol + 1)) ? right_ptrs[srow][scol + 1] : scol + 1;
  }
  if (range) {
    if (range > MAX_RADIUS || range < 1) {
      await panic(S("view_from called with range %d"), range);
    }
    limits = P(G.circle_data, G.circle_start[range]).add(1);
    if (left < scol - range) {
      left = scol - range;
    }
    if (right > scol + range) {
      right = scol + range;
    }
  } else {
    limits = null;
  }
  if (func) {
    for (i = left; i <= right; ++i) {
      await func(i, srow, arg);
    }
  } else {
    rowp = cs_rows.a[cs_rows.o + srow];
    for (i = left; i <= right; ++i) {
      rowp.a[rowp.o + i] = 1;
    }
    cs_left.a[cs_left.o + srow] = left << 24 >> 24;
    cs_right.a[cs_right.o + srow] = right << 24 >> 24;
  }
  if ((nrow = srow + 1) < ROWNO) {
    step = 1;
    if (scol < COLNO - 1) {
      await right_side(nrow, scol, right, limits);
    }
    if (scol) {
      await left_side(nrow, left, scol, limits);
    }
  }
  if ((nrow = srow - 1) >= 0) {
    step = -1;
    if (scol < COLNO - 1) {
      await right_side(nrow, scol, right, limits);
    }
    if (scol) {
      await left_side(nrow, left, scol, limits);
    }
  }
}

export async function do_clear_area(scol: number, srow: number, range: number, func: Function | null, arg: any): Promise<void> {
  if (scol !== G.u.ux || srow !== G.u.uy) {
    await view_from(srow, scol, null, null, null, range, func, arg);
  } else {
    let x = 0;
    let y = 0;
    let min_x = 0;
    let max_x = 0;
    let max_y = 0;
    let offset = 0;
    let limits = null;
    let override_vision = 0;
    override_vision = (((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) && detecting(func) ? 1 : 0) << 24 >> 24;
    if (range > MAX_RADIUS || range < 1) {
      await panic(S("do_clear_area:  illegal range %d"), range);
    }
    if (G.vision_full_recalc) {
      await vision_recalc(0);
    }
    limits = P(G.circle_data, G.circle_start[range]);
    if ((max_y = srow + range) >= ROWNO) {
      max_y = ROWNO - 1;
    }
    if ((y = srow - range) < 0) {
      y = 0;
    }
    for (; y <= max_y; ++y) {
      offset = limits.a[limits.o + (y - srow < 0 ? -(y - srow) : y - srow)];
      if ((min_x = scol - offset) < 0) {
        min_x = 0;
      }
      if ((max_x = scol + offset) >= COLNO) {
        max_x = COLNO - 1;
      }
      for (x = min_x; x <= max_x; ++x) {
        if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 1 || override_vision) {
          await func(x, y, arg);
        }
      }
    }
  }
}

export function howmonseen(mon: struct_monst | null): number {
  let useemon = ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) ? 1 : 0) << 24 >> 24;
  let xraydist = G.u.xray_range < 0 ? -1 : Math.imul(G.u.xray_range, G.u.xray_range);
  let how_seen = 0;
  if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) && !mon.minvis) {
    how_seen = (how_seen | MONSEEN_NORMAL) >>> 0;
  }
  if (useemon && mon.minvis | 0) {
    how_seen = (how_seen | MONSEEN_SEEINVIS) >>> 0;
  }
  if ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1)) {
    how_seen = (how_seen | MONSEEN_INFRAVIS) >>> 0;
  }
  if (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8)) {
    how_seen = (how_seen | MONSEEN_TELEPAT) >>> 0;
  }
  if (useemon && xraydist > 0 && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= xraydist) {
    how_seen = (how_seen | MONSEEN_XRAYVIS) >>> 0;
  }
  if (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) {
    how_seen = (how_seen | MONSEEN_DETECT) >>> 0;
  }
  if ((G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)) {
    how_seen = (how_seen | MONSEEN_WARNMON) >>> 0;
  }
  return how_seen;
}

export function $init(): void {
  G.circle_data = $ta(Int8Array, 136, [1, 1, 2, 2, 1, 3, 3, 2, 1, 4, 4, 4, 3, 2, 5, 5, 5, 4, 3, 2, 6, 6, 6, 5, 5, 4, 2, 7, 7, 7, 6, 6, 5, 4, 2, 8, 8, 8, 7, 7, 6, 6, 4, 2, 9, 9, 9, 9, 8, 8, 7, 6, 5, 3, 10, 10, 10, 10, 9, 9, 8, 7, 6, 5, 3, 11, 11, 11, 11, 10, 10, 9, 9, 8, 7, 5, 3, 12, 12, 12, 12, 11, 11, 10, 10, 9, 8, 7, 5, 3, 13, 13, 13, 13, 12, 12, 12, 11, 10, 10, 9, 7, 6, 3, 14, 14, 14, 14, 13, 13, 13, 12, 12, 11, 10, 9, 8, 6, 3, 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 6, 3, 16]);
  G.circle_start = $ta(Int8Array, 16, [0, 0, 2, 5, 9, 14, 20, 27, 35, 44, 54, 65, 77, 90, 104, 119]);
  G.viz_rmin = null;
  G.viz_rmax = null;
  could_see = $arr(2, () => $arr(21, () => new Int8Array(80)));
  cs_rows0 = new Array(21).fill(null);
  cs_rows1 = new Array(21).fill(null);
  cs_rmin0 = new Int8Array(21);
  cs_rmax0 = new Int8Array(21);
  cs_rmin1 = new Int8Array(21);
  cs_rmax1 = new Int8Array(21);
  viz_clear = $arr(21, () => new Int8Array(80));
  viz_clear_rows = new Array(21).fill(null);
  left_ptrs = $arr(21, () => new Int8Array(80));
  right_ptrs = $arr(21, () => new Int8Array(80));
  start_row = 0;
  start_col = 0;
  step = 0;
  cs_rows = null;
  cs_left = null;
  cs_right = null;
  vis_func = null;
  varg = null;
  vision_recalc$colbump = new Uint8Array(81);
}
