// dungeon_los.cpp: LOS (line-of-sight) and Looking functions
import { config } from './config.ts';
import {
  ESCAPE, MAX_OPEN_SPACE, MIN_CLOSED_SPACE, TILE_BOUNDARY_WALL, TILE_GRANITE_WALL, TILE_MAGMA_WALL, TILE_QUARTZ_WALL,
  TV_INVIS_TRAP, TV_SECRET_DOOR,
} from './constants.ts';
import { creatures_list } from './data_creatures.ts';
import { getAllDirections } from './game.ts';
import { dg, game, monsters, py } from './globals.ts';
import { isVowel } from './helpers.ts';
import { itemDescription } from './identification.ts';
import { chr, idiv, ref, type Ref, sprintf } from './libc.ts';
import { memoryRecall } from './recall.ts';
import { onReset } from './reset.ts';
import type { Coord_t } from './structs.ts';
import { coordInsidePanel } from './ui.ts';
import { getKeyInput, panelMoveCursor, printMessage, putStringClearToEOL, terminalRestoreScreen, terminalSaveScreen } from './ui_io.ts';

// A simple, fast, integer-based line-of-sight algorithm.  By Joseph Hall,
// 4116 Brewster Drive, Raleigh NC 27606.  Email to jnh@ecemwl.ncsu.edu.
//
// Returns true if a line of sight can be traced from x0, y0 to x1, y1.
//
// The LOS begins at the center of the tile [x0, y0] and ends at the center of
// the tile [x1, y1].  If los() is to return true, all of the tiles this line
// passes through must be transparent, WITH THE EXCEPTIONS of the starting and
// ending tiles.
//
// We don't consider the line to be "passing through" a tile if it only passes
// across one corner of that tile.

// Because this function uses (short) ints for all calculations, overflow may
// occur if deltaX and deltaY exceed 90.
export function los(from: Coord_t, to: Coord_t): boolean {
  from = { y: from.y, x: from.x };
  to = { y: to.y, x: to.x };

  const delta_x = to.x - from.x;
  const delta_y = to.y - from.y;

  // Adjacent?
  if (delta_x < 2 && delta_x > -2 && delta_y < 2 && delta_y > -2) {
    return true;
  }

  // Handle the cases where delta_x or delta_y == 0.
  if (delta_x === 0) {
    if (delta_y < 0) {
      const tmp = from.y;
      from.y = to.y;
      to.y = tmp;
    }

    for (let yy = from.y + 1; yy < to.y; yy++) {
      if (dg.floor[yy][from.x].feature_id >= MIN_CLOSED_SPACE) {
        return false;
      }
    }

    return true;
  }

  if (delta_y === 0) {
    if (delta_x < 0) {
      const tmp = from.x;
      from.x = to.x;
      to.x = tmp;
    }

    for (let xx = from.x + 1; xx < to.x; xx++) {
      if (dg.floor[from.y][xx].feature_id >= MIN_CLOSED_SPACE) {
        return false;
      }
    }

    return true;
  }

  // Now, we've eliminated all the degenerate cases.
  // In the computations below, dy (or dx) and m are multiplied by a scale factor,
  // scale = abs(delta_x * delta_y * 2), so that we can use integer arithmetic.
  {
    let xx: number; // x position
    let yy: number; // y position

    const delta_multiply = delta_x * delta_y;
    const scale_half = Math.abs(delta_multiply); // above scale factor / 2
    const scale = scale_half << 1; // above scale factor
    const x_sign = delta_x < 0 ? -1 : 1; // sign of delta_x
    const y_sign = delta_y < 0 ? -1 : 1; // sign of delta_y
    let slope: number; // slope or 1/slope of LOS

    // Travel from one end of the line to the other, oriented along the longer axis.

    const abs_delta_x = Math.abs(delta_x);
    const abs_delta_y = Math.abs(delta_y);

    if (abs_delta_x >= abs_delta_y) {
      let dy: number; // "fractional" y position

      // We start at the border between the first and second tiles, where
      // the y offset = .5 * slope.  Remember the scale factor.
      //
      // We have:     slope = delta_y / delta_x * 2 * (delta_y * delta_x)
      //                    = 2 * delta_y * delta_y.

      dy = delta_y * delta_y;
      slope = dy << 1;
      xx = from.x + x_sign;

      // Consider the special case where slope == 1.
      if (dy === scale_half) {
        yy = from.y + y_sign;
        dy -= scale;
      } else {
        yy = from.y;
      }

      while ((to.x - xx) !== 0) {
        if (dg.floor[yy][xx].feature_id >= MIN_CLOSED_SPACE) {
          return false;
        }

        dy += slope;

        if (dy < scale_half) {
          xx += x_sign;
        } else if (dy > scale_half) {
          yy += y_sign;
          if (dg.floor[yy][xx].feature_id >= MIN_CLOSED_SPACE) {
            return false;
          }
          xx += x_sign;
          dy -= scale;
        } else {
          // This is the case, dy == scale_half, where the LOS
          // exactly meets the corner of a tile.
          xx += x_sign;
          yy += y_sign;
          dy -= scale;
        }
      }
      return true;
    }

    let dx: number; // "fractional" x position

    dx = delta_x * delta_x;
    slope = dx << 1;

    yy = from.y + y_sign;

    if (dx === scale_half) {
      xx = from.x + x_sign;
      dx -= scale;
    } else {
      xx = from.x;
    }

    while ((to.y - yy) !== 0) {
      if (dg.floor[yy][xx].feature_id >= MIN_CLOSED_SPACE) {
        return false;
      }

      dx += slope;

      if (dx < scale_half) {
        yy += y_sign;
      } else if (dx > scale_half) {
        xx += x_sign;
        if (dg.floor[yy][xx].feature_id >= MIN_CLOSED_SPACE) {
          return false;
        }
        yy += y_sign;
        dx -= scale;
      } else {
        xx += x_sign;
        yy += y_sign;
        dx -= scale;
      }
    }
    return true;
  }
}

/*
  An enhanced look, with peripheral vision. Looking all 8 -CJS- directions will
  see everything which ought to be visible. Can specify direction 5, which looks
  in all directions.

  For the purpose of hindering vision, each place is regarded as a diamond just
  touching its four immediate neighbours. A diamond is opaque if it is a wall,
  or shut door, or something like that. A place is visible if any part of its
  diamond is visible: i.e. there is a line from the view point to part of the
  diamond which does not pass through any opaque diamonds.

  Consider the following situation:

    @....                         X   X   X   X   X
    .##..                        / \ / \ / \ / \ / \
    .....                       X @ X . X . X 1 X . X
                                 \ / \ / \ / \ / \ /
                                  X   X   X   X   X
          Expanded view, with    / \ / \ / \ / \ / \
          diamonds inscribed    X . X # X # X 2 X . X
          about each point,      \ / \ / \ / \ / \ /
          and some locations      X   X   X   X   X
          numbered.              / \ / \ / \ / \ / \
                                X . X . X . X 3 X 4 X
                                 \ / \ / \ / \ / \ /
                                  X   X   X   X   X

       - Location 1 is fully visible.
       - Location 2 is visible, even though partially obscured.
       - Location 3 is invisible, but if either # were
         transparent, it would be visible.
       - Location 4 is completely obscured by a single #.

  The function which does the work is lookRay(). It sets up its own co-ordinate
  frame (global variables map back to the dungeon frame) and looks for
  everything between two angles specified from a central line. It is recursive,
  and each call looks at stuff visible along a line parallel to the center line,
  and a set distance away from it. A diagonal look uses more extreme peripheral
  vision from the closest horizontal and vertical directions; horizontal or
  vertical looks take a call for each side of the central line.

  Globally accessed variables: los_num_places_seen counts the number of places where
  something is seen. los_rocks_and_objects indicates a look for rock or objects.

  The others map coords in the ray frame to dungeon coords.

  dungeon y = py.pos.y + los_fyx * (ray x) + los_fyy * (ray y)
  dungeon x = py.pos.x + los_fxx * (ray x) + los_fxy * (ray y)
*/
let los_fxx = 0;
let los_fxy = 0;
let los_fyx = 0;
let los_fyy = 0;
let los_num_places_seen = 0;
let los_hack_no_query = false;
let los_rocks_and_objects = 0;

onReset(() => {
  los_fxx = 0;
  los_fxy = 0;
  los_fyx = 0;
  los_fyy = 0;
  los_num_places_seen = 0;
  los_hack_no_query = false;
  los_rocks_and_objects = 0;
});

// Intended to be indexed by dir/2, since is only
// relevant to horizontal or vertical directions.
const los_dir_set_fxy: readonly number[] = [0, 1, 0, 0, -1];
const los_dir_set_fxx: readonly number[] = [0, 0, -1, 1, 0];
const los_dir_set_fyy: readonly number[] = [0, 0, 1, -1, 0];
const los_dir_set_fyx: readonly number[] = [0, 1, 0, 0, -1];

// Map diagonal-dir/2 to a normal-dir/2.
const los_map_diagonals1: readonly number[] = [1, 3, 0, 2, 4];
const los_map_diagonals2: readonly number[] = [2, 1, 0, 4, 3];

const GRADF = 10000; // Any sufficiently big number will do

// Look at what we can see. This is a free move.
//
// Prompts for a direction, and then looks at every object in turn within a cone of
// vision in that direction. For each object, the cursor is moved over the object,
// a description is given, and we wait for the user to type something. Typing
// ESCAPE will abort the entire look.
//
// Looks first at real objects and monsters, and looks at rock types only after all
// other things have been seen.  Only looks at rock types if the config::options::highlight_seams
// option is set.
export async function look(): Promise<void> {
  if (py.flags.blind > 0) {
    await printMessage("You can't see a damn thing!");
    return;
  }

  if (py.flags.image > 0) {
    await printMessage("You can't believe what you are seeing! It's like a dream!");
    return;
  }

  const dir_ref = ref(0);
  if (!(await getAllDirections('Look which direction?', dir_ref))) {
    return;
  }
  const dir = dir_ref.v;

  los_num_places_seen = 0;
  los_rocks_and_objects = 0;

  // Have to set this up for the lookSee
  los_hack_no_query = false;

  const dummy = ref(false);
  if (await lookSee({ y: 0, x: 0 }, dummy)) {
    return;
  }

  let abort: boolean;
  do {
    abort = false;
    if (dir === 5) {
      for (let i = 1; i <= 4; i++) {
        los_fxx = los_dir_set_fxx[i];
        los_fyx = los_dir_set_fyx[i];
        los_fxy = los_dir_set_fxy[i];
        los_fyy = los_dir_set_fyy[i];
        if (await lookRay(0, 2 * GRADF - 1, 1)) {
          abort = true;
          break;
        }
        los_fxy = -los_fxy;
        los_fyy = -los_fyy;
        if (await lookRay(0, 2 * GRADF, 2)) {
          abort = true;
          break;
        }
      }
    } else if ((dir & 1) === 0) {
      // Straight directions

      const i = dir >> 1;
      los_fxx = los_dir_set_fxx[i];
      los_fyx = los_dir_set_fyx[i];
      los_fxy = los_dir_set_fxy[i];
      los_fyy = los_dir_set_fyy[i];
      if (await lookRay(0, GRADF, 1)) {
        abort = true;
      } else {
        los_fxy = -los_fxy;
        los_fyy = -los_fyy;
        abort = await lookRay(0, GRADF, 2);
      }
    } else {
      let i = los_map_diagonals1[dir >> 1];
      los_fxx = los_dir_set_fxx[i];
      los_fyx = los_dir_set_fyx[i];
      los_fxy = -los_dir_set_fxy[i];
      los_fyy = -los_dir_set_fyy[i];
      if (await lookRay(1, 2 * GRADF, GRADF)) {
        abort = true;
      } else {
        i = los_map_diagonals2[dir >> 1];
        los_fxx = los_dir_set_fxx[i];
        los_fyx = los_dir_set_fyx[i];
        los_fxy = los_dir_set_fxy[i];
        los_fyy = los_dir_set_fyy[i];
        abort = await lookRay(1, 2 * GRADF - 1, GRADF);
      }
    }

    los_rocks_and_objects++;
  } while (!abort && config.options.highlight_seams && (los_rocks_and_objects < 2));

  if (abort) {
    await printMessage('--Aborting look--');
    return;
  }

  if (los_num_places_seen !== 0) {
    if (dir === 5) {
      await printMessage("That's all you see.");
    } else {
      await printMessage("That's all you see in that direction.");
    }
  } else if (dir === 5) {
    await printMessage('You see nothing of interest.');
  } else {
    await printMessage('You see nothing of interest in that direction.');
  }
}

// Look at everything within a cone of vision between two ray lines emanating
// from  the player, and y or more places away from the direct line of view.
// This is recursive.
//
// Rays are specified by gradients, y over x, multiplied by 2*GRADF. This is ONLY
// called with gradients between 2*GRADF (45 degrees) and 1 (almost horizontal).
//
//   (y axis)/ angle from
//     ^    /      ___ angle to
//     |   /   ___
//  ...|../.....___.................... parameter y (look at things in the
//     | /   ___                        cone, and on or above this line)
//     |/ ___
//     @-------------------->   direction in which you are looking. (x axis)
//     |
//     |
async function lookRay(y: number, from: number, to: number): Promise<boolean> {
  // from is the larger angle of the ray, since we scan towards the
  // center line. If from is smaller, then the ray does not exist.
  if (from <= to || y > config.monsters.MON_MAX_SIGHT) {
    return false;
  }

  // Find first visible location along this line. Minimum x such
  // that (2x-1)/x < from/GRADF <=> x > GRADF(2x-1)/from. This may
  // be called with y=0 whence x will be set to 0. Thus we need a
  // special fix.
  let x = idiv(GRADF * (2 * y - 1), from) + 1;
  if (x <= 0) {
    x = 1;
  }

  // Find last visible location along this line.
  // Maximum x such that (2x+1)/x > to/GRADF <=> x < GRADF(2x+1)/to
  let max_x = idiv(GRADF * (2 * y + 1) - 1, to);
  if (max_x > config.monsters.MON_MAX_SIGHT) {
    max_x = config.monsters.MON_MAX_SIGHT;
  }
  if (max_x < x) {
    return false;
  }

  // los_hack_no_query is a HACK to prevent doubling up on direct lines of
  // sight. If 'to' is  greater than 1, we do not really look at
  // stuff along the direct line of sight, but we do have to see
  // what is opaque for the purposes of obscuring other objects.
  los_hack_no_query = (y === 0 && to > 1) || (y === x && from < GRADF * 2);

  const transparent = ref(false);

  if (await lookSee({ y, x }, transparent)) {
    return true;
  }

  if (y === x) {
    los_hack_no_query = false;
  }

  // goto init_transparent
  let init_transparent = transparent.v;

  for (;;) {
    if (!init_transparent) {
      // Look down the window we've found.
      if (await lookRay(y + 1, from, idiv((2 * y + 1) * GRADF, x))) {
        return true;
      }

      // Find the start of next window.
      do {
        if (x === max_x) {
          return false;
        }

        // See if this seals off the scan. (If y is zero, then it will.)
        from = idiv((2 * y - 1) * GRADF, x);

        if (from <= to) {
          return false;
        }

        x++;

        if (await lookSee({ y, x }, transparent)) {
          return true;
        }
      } while (!transparent.v);
    }
    init_transparent = false;

    // init_transparent:

    // Find the end of this window of visibility.
    do {
      if (x === max_x) {
        // The window is trimmed by an earlier limit.
        return lookRay(y + 1, from, to);
      }

      x++;

      if (await lookSee({ y, x }, transparent)) {
        return true;
      }
    } while (transparent.v);
  }
}

async function lookSee(coord: Coord_t, transparent: Ref<boolean>): Promise<boolean> {
  coord = { y: coord.y, x: coord.x };

  if (coord.x < 0 || coord.y < 0 || coord.y > coord.x) {
    const error_message = sprintf('Illegal call to lookSee(%d, %d)', coord.y, coord.x);
    await printMessage(error_message);
  }

  let description: string;
  if (coord.x === 0 && coord.y === 0) {
    description = 'You are on';
  } else {
    description = 'You see';
  }

  let j = py.pos.x + los_fxx * coord.x + los_fxy * coord.y;
  coord.y = py.pos.y + los_fyx * coord.x + los_fyy * coord.y;
  coord.x = j;

  if (!coordInsidePanel(coord)) {
    transparent.v = false;
    return false;
  }

  const tile = dg.floor[coord.y][coord.x];
  transparent.v = tile.feature_id <= MAX_OPEN_SPACE;

  if (los_hack_no_query) {
    return false; // Don't look at a direct line of sight. A hack.
  }

  let key = ESCAPE;
  let msg = '';

  if (los_rocks_and_objects === 0 && tile.creature_id > 1 && monsters[tile.creature_id].lit) {
    j = monsters[tile.creature_id].creature_id;
    msg = sprintf('%s %s %s. [(r)ecall]', description, isVowel(creatures_list[j].name[0]) ? 'an' : 'a', creatures_list[j].name);
    description = 'It is on';
    await putStringClearToEOL(msg, { y: 0, x: 0 });

    panelMoveCursor(coord);
    key = await getKeyInput();

    if (key === 'r' || key === 'R') {
      terminalSaveScreen();
      key = chr(await memoryRecall(j));
      terminalRestoreScreen();
    }
  }

  if (tile.temporary_light || tile.permanent_light || tile.field_mark) {
    let wall_description: string | null = null;

    // goto granite (a secret door is shown as granite)
    let granite = false;

    if (tile.treasure_id !== 0) {
      if (game.treasure.list[tile.treasure_id].category_id === TV_SECRET_DOOR) {
        granite = true;
      } else if (los_rocks_and_objects === 0 && game.treasure.list[tile.treasure_id].category_id !== TV_INVIS_TRAP) {
        const obj_string = ref('');
        itemDescription(obj_string, game.treasure.list[tile.treasure_id], true);

        msg = sprintf('%s %s ---pause---', description, obj_string.v);
        description = 'It is in';
        await putStringClearToEOL(msg, { y: 0, x: 0 });

        panelMoveCursor(coord);
        key = await getKeyInput();
      }
    }

    if (granite || (((los_rocks_and_objects !== 0) || (msg.length !== 0)) && tile.feature_id >= MIN_CLOSED_SPACE)) {
      switch (granite ? TILE_GRANITE_WALL : tile.feature_id) {
        case TILE_BOUNDARY_WALL:
        case TILE_GRANITE_WALL:
          // granite:
          // Granite is only interesting if it contains something.
          if (msg.length !== 0) {
            wall_description = 'a granite wall';
          } else {
            wall_description = null; // In case we jump here
          }
          break;
        case TILE_MAGMA_WALL:
          wall_description = 'some dark rock';
          break;
        case TILE_QUARTZ_WALL:
          wall_description = 'a quartz vein';
          break;
        default:
          wall_description = null;
          break;
      }

      if (wall_description !== null) {
        msg = sprintf('%s %s ---pause---', description, wall_description);
        await putStringClearToEOL(msg, { y: 0, x: 0 });
        panelMoveCursor(coord);
        key = await getKeyInput();
      }
    }
  }

  if (msg.length !== 0) {
    los_num_places_seen++;
    if (key === ESCAPE) {
      return true;
    }
  }

  return false;
}
