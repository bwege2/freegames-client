// @ts-nocheck
// NetHack 3.6.7 mkmap.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { isok } from './cmd.ts';
import { depth } from './dungeon.ts';
import { add_room } from './mklev.ts';
import { somexy } from './mkroom.ts';
import { impossible } from './pline.ts';
import { rn2, rnd } from './rnd.ts';
import { dig_corridor } from './sp_lev.ts';
import { struct_lev_init, struct_nhcoord } from './structs.ts';
import { $at2, $rd, $sadd, $sat, $sidx, $ta, $wr, G, P, S, free, memcpy } from './rt/index.ts';
import { COLNO, DBWALL, DOOR, FALSE, HEIGHT, HWALL, ICE, ICED_MOAT, ICED_POOL, LAVAPOOL, MAXNROFROOMS, NO_ROOM, N_P1_ITER, N_P2_ITER, N_P3_ITER, OROOM, POOL, ROOM, ROOMOFFSET, ROWNO, SDOOR, SHARED, STONE, TREE, TRUE, VWALL, WIDTH } from './consts.ts';

let new_locations: Ptr | null;
let n_loc_filled: number;
let dirs: any;

function init_map(bg_typ: number): void {
  let i = 0;
  let j = 0;
  for (i = 1; i < COLNO; ++i) {
    for (j = 0; j < ROWNO; ++j) {
      $at2(G.level.locations, i, j).typ = bg_typ;
    }
  }
}

function init_fill(bg_typ: number, fg_typ: number): void {
  let i = 0;
  let j = 0;
  let limit = 0;
  let count = 0;
  limit = Math.imul(WIDTH, HEIGHT) * 2 / 5 | 0;
  count = 0;
  while (count < limit) {
    i = rn2(80 - 2 - 1) + 2;
    j = rnd(HEIGHT - 1);
    if ($at2(G.level.locations, i, j).typ === bg_typ) {
      $at2(G.level.locations, i, j).typ = fg_typ;
      ++count;
    }
  }
}

function get_map(col: number, row: number, bg_typ: number): number {
  if (col <= 0 || row < 0 || col > WIDTH || row >= HEIGHT) {
    return bg_typ;
  }
  return $at2(G.level.locations, col, row).typ;
}

function pass_one(bg_typ: number, fg_typ: number): void {
  let i = 0;
  let j = 0;
  let count = 0;
  let dr = 0;
  for (i = 2; i <= WIDTH; ++i) {
    for (j = 1; j < HEIGHT; ++j) {
      for (count = 0, dr = 0; dr < 8; dr = dr + 1 << 16 >> 16) {
        if (get_map(i + dirs[dr * 2], j + dirs[dr * 2 + 1], bg_typ) === fg_typ) {
          count = count + 1 << 16 >> 16;
        }
      }
      switch (count) {
      case 0:
      case 1:
      case 2:
        $at2(G.level.locations, i, j).typ = bg_typ;
        break;
      case 5:
      case 6:
      case 7:
      case 8:
        $at2(G.level.locations, i, j).typ = fg_typ;
        break;
      default:
        break;
      }
    }
  }
}

function pass_two(bg_typ: number, fg_typ: number): void {
  let i = 0;
  let j = 0;
  let count = 0;
  let dr = 0;
  for (i = 2; i <= WIDTH; ++i) {
    for (j = 1; j < HEIGHT; ++j) {
      for (count = 0, dr = 0; dr < 8; dr = dr + 1 << 16 >> 16) {
        if (get_map(i + dirs[dr * 2], j + dirs[dr * 2 + 1], bg_typ) === fg_typ) {
          count = count + 1 << 16 >> 16;
        }
      }
      if (count === 5) {
        $wr(new_locations.add(Math.imul(j, 80 - 2 + 1)).add(i), 0, bg_typ);
      } else {
        $wr(new_locations.add(Math.imul(j, 80 - 2 + 1)).add(i), 0, get_map(i, j, bg_typ));
      }
    }
  }
  for (i = 2; i <= WIDTH; ++i) {
    for (j = 1; j < HEIGHT; ++j) {
      $at2(G.level.locations, i, j).typ = $rd(new_locations.add(Math.imul(j, 80 - 2 + 1)).add(i));
    }
  }
}

function pass_three(bg_typ: number, fg_typ: number): void {
  let i = 0;
  let j = 0;
  let count = 0;
  let dr = 0;
  for (i = 2; i <= WIDTH; ++i) {
    for (j = 1; j < HEIGHT; ++j) {
      for (count = 0, dr = 0; dr < 8; dr = dr + 1 << 16 >> 16) {
        if (get_map(i + dirs[dr * 2], j + dirs[dr * 2 + 1], bg_typ) === fg_typ) {
          count = count + 1 << 16 >> 16;
        }
      }
      if (count < 3) {
        $wr(new_locations.add(Math.imul(j, 80 - 2 + 1)).add(i), 0, bg_typ);
      } else {
        $wr(new_locations.add(Math.imul(j, 80 - 2 + 1)).add(i), 0, get_map(i, j, bg_typ));
      }
    }
  }
  for (i = 2; i <= WIDTH; ++i) {
    for (j = 1; j < HEIGHT; ++j) {
      $at2(G.level.locations, i, j).typ = $rd(new_locations.add(Math.imul(j, 80 - 2 + 1)).add(i));
    }
  }
}

export function flood_fill_rm(sx: number, sy: number, rmno: number, lit: number, anyroom: number): void {
  let i = 0;
  let nx = 0;
  let fg_typ = $at2(G.level.locations, sx, sy).typ;
  while (sx > 0 && (anyroom ? $at2(G.level.locations, sx, sy).typ >= ROOM ? 1 : 0 : $at2(G.level.locations, sx, sy).typ === fg_typ ? 1 : 0) && ($at2(G.level.locations, sx, sy).roomno | 0) !== rmno) {
    --sx;
  }
  ++sx;
  if (sx < G.min_rx) {
    G.min_rx = sx;
  }
  if (sy < G.min_ry) {
    G.min_ry = sy;
  }
  for (i = sx; i <= WIDTH && $at2(G.level.locations, i, sy).typ === fg_typ; ++i) {
    $at2(G.level.locations, i, sy).roomno = (rmno >>> 0) & 63;
    $at2(G.level.locations, i, sy).lit = (lit >>> 0) & 1;
    if (anyroom) {
      let ii = 0;
      let jj = 0;
      for (ii = i === sx ? i - 1 : i; ii <= i + 1; ++ii) {
        for (jj = sy - 1; jj <= sy + 1; ++jj) {
          if (isok(ii, jj) && ($at2(G.level.locations, ii, jj).typ && $at2(G.level.locations, ii, jj).typ <= DBWALL || $at2(G.level.locations, ii, jj).typ === DOOR || $at2(G.level.locations, ii, jj).typ === SDOOR)) {
            $at2(G.level.locations, ii, jj).edge = 1;
            if (lit) {
              $at2(G.level.locations, ii, jj).lit = (lit >>> 0) & 1;
            }
            if (($at2(G.level.locations, ii, jj).roomno | 0) !== rmno) {
              $at2(G.level.locations, ii, jj).roomno = (SHARED) & 63;
            }
          }
        }
      }
    }
    ++n_loc_filled;
  }
  nx = i;
  if (isok(sx, sy - 1)) {
    for (i = sx; i < nx; ++i) {
      if ($at2(G.level.locations, i, sy - 1).typ === fg_typ) {
        if (($at2(G.level.locations, i, sy - 1).roomno | 0) !== rmno) {
          flood_fill_rm(i, sy - 1, rmno, lit, anyroom);
        }
      } else {
        if ((i > sx || isok(i - 1, sy - 1)) && $at2(G.level.locations, i - 1, sy - 1).typ === fg_typ) {
          if (($at2(G.level.locations, i - 1, sy - 1).roomno | 0) !== rmno) {
            flood_fill_rm(i - 1, sy - 1, rmno, lit, anyroom);
          }
        }
        if ((i < nx - 1 || isok(i + 1, sy - 1)) && $at2(G.level.locations, i + 1, sy - 1).typ === fg_typ) {
          if (($at2(G.level.locations, i + 1, sy - 1).roomno | 0) !== rmno) {
            flood_fill_rm(i + 1, sy - 1, rmno, lit, anyroom);
          }
        }
      }
    }
  }
  if (isok(sx, sy + 1)) {
    for (i = sx; i < nx; ++i) {
      if ($at2(G.level.locations, i, sy + 1).typ === fg_typ) {
        if (($at2(G.level.locations, i, sy + 1).roomno | 0) !== rmno) {
          flood_fill_rm(i, sy + 1, rmno, lit, anyroom);
        }
      } else {
        if ((i > sx || isok(i - 1, sy + 1)) && $at2(G.level.locations, i - 1, sy + 1).typ === fg_typ) {
          if (($at2(G.level.locations, i - 1, sy + 1).roomno | 0) !== rmno) {
            flood_fill_rm(i - 1, sy + 1, rmno, lit, anyroom);
          }
        }
        if ((i < nx - 1 || isok(i + 1, sy + 1)) && $at2(G.level.locations, i + 1, sy + 1).typ === fg_typ) {
          if (($at2(G.level.locations, i + 1, sy + 1).roomno | 0) !== rmno) {
            flood_fill_rm(i + 1, sy + 1, rmno, lit, anyroom);
          }
        }
      }
    }
  }
  if (nx > G.max_rx) {
    G.max_rx = nx - 1;
  }
  if (sy > G.max_ry) {
    G.max_ry = sy;
  }
}

function wallify_map(): void {
  let x = 0;
  let y = 0;
  let xx = 0;
  let yy = 0;
  for (x = 1; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if ($at2(G.level.locations, x, y).typ === STONE) {
        for (yy = y - 1; yy <= y + 1; ++yy) {
          for (xx = x - 1; xx <= x + 1; ++xx) {
            if (isok(xx, yy) && $at2(G.level.locations, xx, yy).typ === ROOM) {
              if (yy !== y) {
                $at2(G.level.locations, x, y).typ = HWALL;
              } else {
                $at2(G.level.locations, x, y).typ = VWALL;
              }
            }
          }
        }
      }
    }
  }
}

async function join_map(bg_typ: number, fg_typ: number): Promise<void> {
  let $g = 0;
  let croom = null;
  let croom2 = null;
  let i = 0;
  let j = 0;
  let sx = 0;
  let sy = 0;
  let sm = new struct_nhcoord();
  let em = new struct_nhcoord();
  $L: for (;;) {
    switch ($g) {
    case 0:
      sm = new struct_nhcoord();
      em = new struct_nhcoord();
      for (i = 2; i <= WIDTH; ++i) {
        for (j = 1; j < HEIGHT; ++j) {
          if ($at2(G.level.locations, i, j).typ === fg_typ && ($at2(G.level.locations, i, j).roomno | 0) === NO_ROOM) {
            G.min_rx = G.max_rx = i;
            G.min_ry = G.max_ry = j;
            n_loc_filled = 0;
            flood_fill_rm(i, j, G.nroom + ROOMOFFSET, FALSE, FALSE);
            if (n_loc_filled > 3) {
              await add_room(G.min_rx, G.min_ry, G.max_rx, G.max_ry, FALSE, OROOM, TRUE);
              G.rooms[G.nroom - 1].irregular = TRUE;
              if (G.nroom >= MAXNROFROOMS * 2) {
                { $g = 1; continue $L; }
              }
            } else {
              for (sx = G.min_rx; sx <= G.max_rx; ++sx) {
                for (sy = G.min_ry; sy <= G.max_ry; ++sy) {
                  if (($at2(G.level.locations, sx, sy).roomno | 0) === G.nroom + ROOMOFFSET) {
                    $at2(G.level.locations, sx, sy).typ = bg_typ;
                    $at2(G.level.locations, sx, sy).roomno = (NO_ROOM) & 63;
                  }
                }
              }
            }
          }
        }
      }
    case 1: // joinm
      for (croom = G.rooms[0], croom2 = $sadd(croom, 1); $sidx(croom2) < $sidx($sat(G.rooms, G.nroom)); ) {
        if (!somexy(croom, sm) || !somexy(croom2, em)) {
          await impossible(S("No start/end room loc in join_map."));
          sm.x = croom.lx + ((croom.hx - croom.lx) / 2 | 0) << 24 >> 24;
          sm.y = croom.ly + ((croom.hy - croom.ly) / 2 | 0) << 24 >> 24;
          em.x = croom2.lx + ((croom2.hx - croom2.lx) / 2 | 0) << 24 >> 24;
          em.y = croom2.ly + ((croom2.hy - croom2.ly) / 2 | 0) << 24 >> 24;
        }
        await dig_corridor(sm, em, FALSE, fg_typ, bg_typ);
        if (croom2.lx > croom.hx || (croom2.ly > croom.hy || croom2.hy < croom.ly) && rn2(3)) {
          croom = croom2;
        }
        croom2 = $sadd(croom2, 1);
      }
    }
    break;
  }
}

function finish_map(fg_typ: number, bg_typ: number, lit: number, walled: number, icedpools: number): void {
  let i = 0;
  let j = 0;
  if (walled) {
    wallify_map();
  }
  if (lit) {
    for (i = 1; i < COLNO; ++i) {
      for (j = 0; j < ROWNO; ++j) {
        if (!(fg_typ < POOL) && $at2(G.level.locations, i, j).typ === fg_typ || !(bg_typ < POOL) && $at2(G.level.locations, i, j).typ === bg_typ || bg_typ === TREE && $at2(G.level.locations, i, j).typ === bg_typ || walled && ($at2(G.level.locations, i, j).typ && $at2(G.level.locations, i, j).typ <= DBWALL)) {
          $at2(G.level.locations, i, j).lit = (TRUE) & 1;
        }
      }
    }
    for (i = 0; i < G.nroom; ++i) {
      G.rooms[i].rlit = 1;
    }
  }
  for (i = 1; i < COLNO; ++i) {
    for (j = 0; j < ROWNO; ++j) {
      if ($at2(G.level.locations, i, j).typ === LAVAPOOL) {
        $at2(G.level.locations, i, j).lit = (TRUE) & 1;
      } else if ($at2(G.level.locations, i, j).typ === ICE) {
        $at2(G.level.locations, i, j).flags = ((icedpools ? ICED_POOL : ICED_MOAT) >>> 0) & 31;
      }
    }
  }
}

export async function remove_rooms(lx: number, ly: number, hx: number, hy: number): Promise<void> {
  let i = 0;
  let croom = null;
  for (i = G.nroom - 1; i >= 0; --i) {
    croom = $sat(G.rooms, i);
    if (croom.hx < lx || croom.lx >= hx || croom.hy < ly || croom.ly >= hy) {
      continue;
    }
    if (croom.lx < lx || croom.hx >= hx || croom.ly < ly || croom.hy >= hy) {
      if (!croom.irregular) {
        await impossible(S("regular room in joined map"));
      }
    } else {
      remove_room(i >>> 0);
    }
  }
}

function remove_room(roomno: number): void {
  let croom = $sat(G.rooms, roomno);
  let maxroom = $sat(G.rooms, --G.nroom);
  let i = 0;
  let j = 0;
  let oroomno = 0;
  if (croom !== maxroom) {
    memcpy(croom, maxroom, 216);
    oroomno = G.nroom + ROOMOFFSET >>> 0;
    roomno = roomno + ROOMOFFSET >>> 0;
    for (i = croom.lx; i <= croom.hx; ++i) {
      for (j = croom.ly; j <= croom.hy; ++j) {
        if ($at2(G.level.locations, i, j).roomno === oroomno) {
          $at2(G.level.locations, i, j).roomno = (roomno) & 63;
        }
      }
    }
  }
  maxroom.hx = -1;
}

export async function mkmap(init_lev: struct_lev_init | null): Promise<void> {
  let bg_typ = init_lev.bg;
  let fg_typ = init_lev.fg;
  let smooth = init_lev.smoothed;
  let join = init_lev.joined;
  let lit = init_lev.lit;
  let walled = init_lev.walled;
  let i = 0;
  if (lit < 0) {
    lit = (rnd(1 + Math.abs(depth(G.u.uz))) < 11 && rn2(77) ? 1 : 0) << 24 >> 24;
  }
  new_locations = P(new Int8Array(Math.imul(WIDTH + 1, HEIGHT)));
  init_map(bg_typ);
  init_fill(bg_typ, fg_typ);
  for (i = 0; i < N_P1_ITER; ++i) {
    pass_one(bg_typ, fg_typ);
  }
  for (i = 0; i < N_P2_ITER; ++i) {
    pass_two(bg_typ, fg_typ);
  }
  if (smooth) {
    for (i = 0; i < N_P3_ITER; ++i) {
      pass_three(bg_typ, fg_typ);
    }
  }
  if (join) {
    await join_map(bg_typ, fg_typ);
  }
  finish_map(fg_typ, bg_typ, lit, walled, init_lev.icedpools);
  if (walled && join) {
    G.level.flags.is_maze_lev = (FALSE) & 1;
    G.level.flags.is_cavernous_lev = (TRUE) & 1;
  }
  free(new_locations);
}

export function $init(): void {
  new_locations = null;
  G.min_rx = 0;
  G.max_rx = 0;
  G.min_ry = 0;
  G.max_ry = 0;
  n_loc_filled = 0;
  dirs = $ta(Int32Array, 16, [-1, -1, -1, 0, -1, 1, 0, -1, 0, 1, 1, -1, 1, 0, 1, 1]);
}
