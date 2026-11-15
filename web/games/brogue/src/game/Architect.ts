// @ts-nocheck
// Brogue CE 1.15.1 Architect.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { killCreature } from './Combat.ts';
import { calculateDistances, dijkstraScan, pathingDistance } from './Dijkstra.ts';
import { terrainFlags, terrainMechFlags } from './Globals.ts';
import { allocGrid, copyGrid, createBlobOnGrid, drawCircleOnGrid, drawRectangleOnGrid, fillGrid, findReplaceGrid, freeGrid, getQualifyingPathLocNear, hiliteGrid, randomLocationInGrid } from './Grid.ts';
import { colorFlash, colorOverDungeon, displayGrid, dumpLevelToScreen, flavorMessage, hiliteCell, hiliteCharGrid, message, plotCharWithColor, refreshDungeonCell, temporaryMessage } from './IO.ts';
import { addItemToChain, aggravateMonsters, deleteItem, generateItem, itemAtLoc, itemIsHeavyWeapon, itemIsPositivelyEnchanted, placeItemAt, populateItems, removeItemFromChain } from './Items.ts';
import { createFlare } from './Light.ts';
import { fillSequentialList, rand_percent, rand_range, shuffleList } from './Math.ts';
import { avoidedFlagsForMonster, forbiddenFlagsForMonster, generateMonster, getQualifyingGridLocNear, getQualifyingLocNear, hasNextCreature, iterateCreatures, monsterAtLoc, nextCreature, populateMonsters, resurrectAlly, spawnHorde, toggleMonsterDormancy } from './Monsters.ts';
import { getFOVMask, highestPriorityLayer, nextStep, populateGenericCostMap, tileFlavor } from './Movement.ts';
import { applyInstantTileEffectsToCreature, burnItem } from './Time.ts';
import { struct_creature, struct_dungeonFeature, struct_dungeonProfile, struct_item, struct_machineData, struct_pcell, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $arr, $at2, $mul64, $rd, $rows, $sadd, $sarr, $sat, $ta, $u64, $wr, G, P, S, free, memset, printf } from '../rt/index.ts';
import { ANY_KIND_OF_VISIBLE, ARMOR, BP_ADOPT_ITEM, BP_IMPREGNABLE, BP_MAXIMIZE_INTERIOR, BP_NO_INTERIOR_FLAG, BP_OPEN_INTERIOR, BP_PURGE_INTERIOR, BP_PURGE_LIQUIDS, BP_PURGE_PATHING_BLOCKERS, BP_REDESIGN_INTERIOR, BP_REQUIRE_BLOCKING, BP_REWARD, BP_ROOM, BP_SURROUND_WITH_WALLS, BP_TREAT_AS_BLOCKING, BP_VESTIBULE, BRIDGE, BRIDGE_EDGE, CAUGHT_FIRE_THIS_TURN, CAVE_MIN_HEIGHT, CAVE_MIN_WIDTH, CHARM, CHASM, CHASM_EDGE, CLAIRVOYANT_VISIBLE, COLS, CRYSTAL_WALL, DCOLS, DEEP_WATER, DFF_ACTIVATE_DORMANT_MONSTER, DFF_AGGRAVATES_MONSTERS, DFF_BLOCKED_BY_OTHER_LAYERS, DFF_CLEAR_LOWER_PRIORITY_TERRAIN, DFF_CLEAR_OTHER_TERRAIN, DFF_EVACUATE_CREATURES_FIRST, DFF_PERMIT_BLOCKING, DFF_RESURRECT_ALLY, DFF_SUBSEQ_EVERYWHERE, DFF_SUPERPRIORITY, DFF_TREAT_AS_BLOCKING, DIRECTION_COUNT, DOOR, DOWN, DOWNLEFT, DOWNRIGHT, DOWN_STAIRS, DP_BASIC, DP_BASIC_FIRST_ROOM, DROWS, DUNGEON, DUNGEON_EXIT, DUNGEON_PORTAL, FLOOR, FP_FACTOR, GAME_MODE_WIZARD, GAS, GRANITE, G_CLOSED_DOOR, HAS_ITEM, HAS_MONSTER, HAS_PLAYER, HAS_STAIRS, HORDE_IS_SUMMONED, HORDE_LEADER_CAPTIVE, HORIZONTAL_CORRIDOR_MAX_LENGTH, HORIZONTAL_CORRIDOR_MIN_LENGTH, IMPREGNABLE, INERT_BRIMSTONE, IN_FIELD_OF_VIEW, IN_LOOP, IS_CHOKEPOINT, IS_GATE_SITE, IS_IN_AREA_MACHINE, IS_IN_MACHINE, IS_IN_ROOM_MACHINE, ITEM_CURSED, ITEM_FLAMMABLE, ITEM_PREPLACED, ITEM_RUNIC, KEY_ID_MAXIMUM, LAVA, LEFT, LIQUID, MACHINES_BUFFER_LENGTH, MAX_WAYPOINT_COUNT, MB_ABSORBING, MB_APPROACHING_DOWNSTAIRS, MB_APPROACHING_PIT, MB_APPROACHING_UPSTAIRS, MB_CAPTIVE, MB_FOLLOWER, MB_JUST_SUMMONED, MB_LEADER, MB_PREPLACED, MB_SUBMERGED, MESSAGE_LINES, MF_ADOPT_ITEM, MF_ALTERNATIVE, MF_ALTERNATIVE_2, MF_BUILD_ANYWHERE_ON_LEVEL, MF_BUILD_AT_ORIGIN, MF_BUILD_IN_WALLS, MF_BUILD_VESTIBULE, MF_EVERYWHERE, MF_FAR_FROM_ORIGIN, MF_GENERATE_HORDE, MF_GENERATE_ITEM, MF_IMPREGNABLE, MF_IN_PASSABLE_VIEW_OF_ORIGIN, MF_IN_VIEW_OF_ORIGIN, MF_KEY_DISPOSABLE, MF_MONSTERS_DORMANT, MF_MONSTER_FLEEING, MF_MONSTER_SLEEPING, MF_MONSTER_TAKE_ITEM, MF_NEAR_ORIGIN, MF_NOT_IN_HALLWAY, MF_NOT_ON_LEVEL_PERIMETER, MF_NO_THROWING_WEAPONS, MF_OUTSOURCE_ITEM_TO_MACHINE, MF_PERMIT_BLOCKING, MF_REPEAT_UNTIL_NO_PROGRESS, MF_REQUIRE_GOOD_RUNIC, MF_REQUIRE_HEAVY_WEAPON, MF_SKELETON_KEY, MF_TREAT_AS_BLOCKING, MODE_PERM_FLEEING, MONSTER_ALLY, MONSTER_FLEEING, MONSTER_SLEEPING, MONSTER_TRACKING_SCENT, MONST_IMMOBILE, MT_AMULET_AREA, MT_REWARD_HEAVY_OR_RUNIC_WEAPON, NOTHING, NO_DIRECTION, NUMBER_DUNGEON_FEATURES, NUMBER_TERRAIN_LAYERS, OBSIDIAN, PDS_FORBIDDEN, PDS_OBSTRUCTION, POTION, REQUIRE_ACKNOWLEDGMENT, RIGHT, RING, ROOM_TYPE_COUNT, ROWS, SCROLL, SECRET_DOOR, SHALLOW_WATER, STAFF, STATUS_ENTERS_LEVEL_IN, STATUS_LEVITATING, STAT_BAR_WIDTH, SURFACE, TM_ALLOWS_SUBMERGING, TM_CONNECTS_LEVEL, TM_IS_CIRCUIT_BREAKER, TM_IS_SECRET, TM_IS_WIRED, TM_PROMOTES_WITH_KEY, TORCH_WALL, T_AUTO_DESCENT, T_CAN_BE_BRIDGED, T_DIVIDES_LEVEL, T_IS_DEEP_WATER, T_IS_DF_TRAP, T_IS_FIRE, T_LAKE_PATHING_BLOCKER, T_LAVA_INSTA_DEATH, T_OBSTRUCTS_DIAGONAL_MOVEMENT, T_OBSTRUCTS_EVERYTHING, T_OBSTRUCTS_ITEMS, T_OBSTRUCTS_PASSABILITY, T_OBSTRUCTS_SCENT, T_OBSTRUCTS_SURFACE_EFFECTS, T_OBSTRUCTS_VISION, T_PATHING_BLOCKER, UP, UPLEFT, UPRIGHT, UP_STAIRS, VARIANT_BULLET_BROGUE, VERTICAL_CORRIDOR_MAX_LENGTH, VERTICAL_CORRIDOR_MIN_LENGTH, WALL, WAND, WEAPON, false_, true_ } from './consts.ts';


function signum(x: number): number {
  if (x === 0) {
    return 0;
  }
  return x > 0 ? 1 : -1;
}

function posEq(a: struct_pos, b: struct_pos): number {
  return (a.x === b.x && a.y === b.y ? 1 : 0) << 24 >> 24;
}

function coordinatesAreInMap(x: number, y: number): number {
  return (x >= 0 && DCOLS > x && y >= 0 && DROWS > y ? 1 : 0) << 24 >> 24;
}

function isPosInMap(p: struct_pos): number {
  return (p.x >= 0 && DCOLS > p.x && p.y >= 0 && DROWS > p.y ? 1 : 0) << 24 >> 24;
}

function locIsInWindow(w: struct_windowpos): number {
  return (w.window_x >= 0 && COLS > w.window_x && w.window_y >= 0 && ROWS > w.window_y ? 1 : 0) << 24 >> 24;
}

function windowToMap(w: struct_windowpos): struct_pos {
  return struct_pos.$of(w.window_x - STAT_BAR_WIDTH - 1 << 16 >> 16, w.window_y - MESSAGE_LINES << 16 >> 16);
}

function mapToWindow(p: struct_pos): struct_windowpos {
  return struct_windowpos.$of(p.x + STAT_BAR_WIDTH + 1 << 16 >> 16, p.y + MESSAGE_LINES << 16 >> 16);
}

function tmapAt(p: struct_pos): struct_tcell | null {
  ;
  return $sat(G.tmap[p.x], p.y);
}

function pmapAt(p: struct_pos): struct_pcell | null {
  ;
  return $sat(G.pmap[p.x], p.y);
}

function posNeighborInDirection(p: struct_pos, direction_to_step: number): struct_pos {
  ;
  return struct_pos.$of(p.x + G.nbDirs[direction_to_step][0] << 16 >> 16, p.y + G.nbDirs[direction_to_step][1] << 16 >> 16);
}

export function cellHasTerrainFlag(loc: struct_pos, flagMask: number): number {
  ;
  return ((flagMask & terrainFlags(loc)) >>> 0 ? true_ : false_) << 24 >> 24;
}

export function cellHasTMFlag(loc: struct_pos, flagMask: number): number {
  return ((flagMask & terrainMechFlags(loc)) >>> 0 ? true_ : false_) << 24 >> 24;
}

export function cellHasTerrainType(p: struct_pos, terrain: number): number {
  return (pmapAt(p).layers[DUNGEON] >>> 0 === terrain >>> 0 || pmapAt(p).layers[LIQUID] >>> 0 === terrain >>> 0 || pmapAt(p).layers[SURFACE] >>> 0 === terrain >>> 0 || pmapAt(p).layers[GAS] >>> 0 === terrain >>> 0 ? true_ : false_) << 24 >> 24;
}

function cellIsPassableOrDoor(x: number, y: number): number {
  if (!cellHasTerrainFlag(struct_pos.$of(x, y), T_PATHING_BLOCKER)) {
    return true_;
  }
  return (cellHasTMFlag(struct_pos.$of(x, y), TM_IS_SECRET | TM_PROMOTES_WITH_KEY | TM_CONNECTS_LEVEL) && cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY) ? 1 : 0) << 24 >> 24;
}

function checkLoopiness(x: number, y: number): number {
  let $t1: any;
  let newX = 0;
  let newY = 0;
  let dir = 0;
  let sdir = 0;
  let numStrings = 0;
  let maxStringLength = 0;
  let currentStringLength = 0;
  if (!(($at2(G.pmap, x, y).flags & IN_LOOP) >>> 0)) {
    return false_;
  }
  for (sdir = 0; DIRECTION_COUNT > sdir; sdir = sdir + 1 << 16 >> 16) {
    newX = x + G.cDirs[sdir][0] << 16 >> 16;
    newY = y + G.cDirs[sdir][1] << 16 >> 16;
    if (!coordinatesAreInMap(newX, newY) || !(($at2(G.pmap, newX, newY).flags & IN_LOOP) >>> 0)) {
      break;
    }
  }
  if (sdir === 8) {
    return false_;
  }
  numStrings = maxStringLength = currentStringLength = 0;
  let inString = false_;
  for (dir = sdir; sdir + 8 > dir; dir = dir + 1 << 16 >> 16) {
    newX = x + G.cDirs[dir % 8][0] << 16 >> 16;
    newY = y + G.cDirs[dir % 8][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY) && ($at2(G.pmap, newX, newY).flags & IN_LOOP) >>> 0) {
      currentStringLength = currentStringLength + 1 << 16 >> 16;
      if (!inString) {
        if (numStrings > 0) {
          return false_;
        }
        numStrings = numStrings + 1 << 16 >> 16;
        inString = true_;
      }
    } else if (inString) {
      if (currentStringLength > maxStringLength) {
        maxStringLength = currentStringLength;
      }
      currentStringLength = 0;
      inString = false_;
    }
  }
  if (inString && currentStringLength > maxStringLength) {
    maxStringLength = currentStringLength;
  }
  if (numStrings === 1 && 4 >= maxStringLength) {
    ($t1 = $at2(G.pmap, x, y), $t1.flags = ($t1.flags & ~IN_LOOP >>> 0) >>> 0);
    for (dir = 0; DIRECTION_COUNT > dir; dir = dir + 1 << 16 >> 16) {
      newX = x + G.cDirs[dir][0] << 16 >> 16;
      newY = y + G.cDirs[dir][1] << 16 >> 16;
      if (coordinatesAreInMap(newX, newY)) {
        checkLoopiness(newX, newY);
      }
    }
    return true_;
  } else {
    return false_;
  }
}

function auditLoop(x: number, y: number, grid: Ptr | null): void {
  let dir = 0;
  let newX = 0;
  let newY = 0;
  if (coordinatesAreInMap(x, y) && !grid.a[grid.o + x][y] && !(($at2(G.pmap, x, y).flags & IN_LOOP) >>> 0)) {
    grid.a[grid.o + x][y] = true_;
    for (dir = 0; DIRECTION_COUNT > dir; dir = dir + 1 << 16 >> 16) {
      newX = x + G.nbDirs[dir][0] << 16 >> 16;
      newY = y + G.nbDirs[dir][1] << 16 >> 16;
      if (coordinatesAreInMap(newX, newY)) {
        auditLoop(newX, newY, grid);
      }
    }
  }
}

function floodFillCount(results: Ptr | null, passMap: Ptr | null, startX: number, startY: number): number {
  let dir = 0;
  let newX = 0;
  let newY = 0;
  let count = 0;
  count = (passMap.a[passMap.o + startX][startY] === 2 ? 5000 : 1) << 16 >> 16;
  if (($at2(G.pmap, startX, startY).flags & IS_IN_AREA_MACHINE) >>> 0) {
    count = 10000;
  }
  results.a[results.o + startX][startY] = true_;
  for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
    newX = startX + G.nbDirs[dir][0] << 16 >> 16;
    newY = startY + G.nbDirs[dir][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY) && passMap.a[passMap.o + newX][newY] && !results.a[results.o + newX][newY]) {
      count = count + floodFillCount(results, passMap, newX, newY) << 16 >> 16;
    }
  }
  return (10000 > count ? count : 10000) << 16 >> 16;
}

export function passableArcCount(x: number, y: number): number {
  let arcCount = 0;
  let dir = 0;
  let oldX = 0;
  let oldY = 0;
  let newX = 0;
  let newY = 0;
  ;
  arcCount = 0;
  for (dir = 0; DIRECTION_COUNT > dir; dir = dir + 1 << 16 >> 16) {
    oldX = x + G.cDirs[(dir + 7) % 8][0] << 16 >> 16;
    oldY = y + G.cDirs[(dir + 7) % 8][1] << 16 >> 16;
    newX = x + G.cDirs[dir][0] << 16 >> 16;
    newY = y + G.cDirs[dir][1] << 16 >> 16;
    if ((coordinatesAreInMap(newX, newY) && cellIsPassableOrDoor(newX, newY) ? 1 : 0) !== (coordinatesAreInMap(oldX, oldY) && cellIsPassableOrDoor(oldX, oldY) ? 1 : 0)) {
      arcCount = arcCount + 1 << 16 >> 16;
    }
  }
  return (arcCount / 2 | 0) << 16 >> 16;
}

export function analyzeMap(calculateChokeMap: number): void {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any;
  let i = 0;
  let j = 0;
  let i2 = 0;
  let j2 = 0;
  let dir = 0;
  let newX = 0;
  let newY = 0;
  let oldX = 0;
  let oldY = 0;
  let passableArcCount = 0;
  let cellCount = 0;
  let grid = $arr(79, () => new Int8Array(29));
  let passMap = $arr(79, () => new Int8Array(29));
  let designationSurvives = 0;
  G.rogue.staleLoopMap = false_;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_PATHING_BLOCKER) && !cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET)) {
        ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags & ~IN_LOOP >>> 0) >>> 0);
        passMap[i][j] = false_;
      } else {
        ($t2 = $at2(G.pmap, i, j), $t2.flags = ($t2.flags | IN_LOOP) >>> 0);
        passMap[i][j] = true_;
      }
    }
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      checkLoopiness(i, j);
    }
  }
  zeroOutGrid(P(grid));
  auditLoop(0, 0, P(grid));
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (($at2(G.pmap, i, j).flags & IN_LOOP) >>> 0) {
        designationSurvives = false_;
        for (dir = 0; DIRECTION_COUNT > dir; dir = dir + 1 << 16 >> 16) {
          newX = i + G.nbDirs[dir][0] << 16 >> 16;
          newY = j + G.nbDirs[dir][1] << 16 >> 16;
          if (coordinatesAreInMap(newX, newY) && !grid[newX][newY] && !(($at2(G.pmap, newX, newY).flags & IN_LOOP) >>> 0)) {
            designationSurvives = true_;
            break;
          }
        }
        if (!designationSurvives) {
          grid[i][j] = true_;
          ($t3 = $at2(G.pmap, i, j), $t3.flags = ($t3.flags & ~IN_LOOP >>> 0) >>> 0);
        }
      }
    }
  }
  for (i = 1; DCOLS - 1 > i; i = i + 1 << 16 >> 16) {
    for (j = 1; DROWS - 1 > j; j = j + 1 << 16 >> 16) {
      ($t4 = $at2(G.pmap, i, j), $t4.flags = ($t4.flags & ~IS_CHOKEPOINT >>> 0) >>> 0);
      if (passMap[i][j] && !(($at2(G.pmap, i, j).flags & IN_LOOP) >>> 0)) {
        passableArcCount = 0;
        for (dir = 0; DIRECTION_COUNT > dir; dir = dir + 1 << 16 >> 16) {
          oldX = i + G.cDirs[(dir + 7) % 8][0] << 16 >> 16;
          oldY = j + G.cDirs[(dir + 7) % 8][1] << 16 >> 16;
          newX = i + G.cDirs[dir][0] << 16 >> 16;
          newY = j + G.cDirs[dir][1] << 16 >> 16;
          if ((coordinatesAreInMap(newX, newY) && passMap[newX][newY] ? 1 : 0) !== (coordinatesAreInMap(oldX, oldY) && passMap[oldX][oldY] ? 1 : 0)) {
            if ((passableArcCount = passableArcCount + 1 << 16 >> 16) > 2) {
              if (!passMap[i - 1][j] && !passMap[i + 1][j] || !passMap[i][j - 1] && !passMap[i][j + 1]) {
                ($t5 = $at2(G.pmap, i, j), $t5.flags = ($t5.flags | IS_CHOKEPOINT) >>> 0);
              }
              break;
            }
          }
        }
      }
    }
  }
  if (calculateChokeMap) {
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        $wr(G.chokeMap.a[G.chokeMap.o + i], j, 30000);
        if (($at2(G.pmap, i, j).flags & IS_IN_ROOM_MACHINE) >>> 0) {
          passMap[i][j] = false_;
        }
      }
    }
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (passMap[i][j] && ($at2(G.pmap, i, j).flags & IS_CHOKEPOINT) >>> 0) {
          for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
            newX = i + G.nbDirs[dir][0] << 16 >> 16;
            newY = j + G.nbDirs[dir][1] << 16 >> 16;
            if (coordinatesAreInMap(newX, newY) && passMap[newX][newY] && !(($at2(G.pmap, newX, newY).flags & IS_CHOKEPOINT) >>> 0)) {
              zeroOutGrid(P(grid));
              passMap[i][j] = false_;
              cellCount = floodFillCount(P(grid), P(passMap), newX, newY);
              passMap[i][j] = true_;
              if (cellCount >= 4) {
                for (i2 = 0; DCOLS > i2; i2 = i2 + 1 << 16 >> 16) {
                  for (j2 = 0; DROWS > j2; j2 = j2 + 1 << 16 >> 16) {
                    if (grid[i2][j2] && $rd(G.chokeMap.a[G.chokeMap.o + i2], j2) > cellCount) {
                      $wr(G.chokeMap.a[G.chokeMap.o + i2], j2, cellCount);
                      ($t6 = $at2(G.pmap, i2, j2), $t6.flags = ($t6.flags & ~IS_GATE_SITE >>> 0) >>> 0);
                    }
                  }
                }
                if ($rd(G.chokeMap.a[G.chokeMap.o + i], j) > cellCount) {
                  $wr(G.chokeMap.a[G.chokeMap.o + i], j, cellCount);
                  ($t7 = $at2(G.pmap, i, j), $t7.flags = ($t7.flags | IS_GATE_SITE) >>> 0);
                }
              }
            }
          }
        }
      }
    }
  }
}

async function addLoops(grid: Ptr | null, minimumPathingDistance: number): Promise<void> {
  let newX = 0;
  let newY = 0;
  let oppX = 0;
  let oppY = 0;
  let pathMap = null;
  let costMap = null;
  let i = 0;
  let d = 0;
  let x = 0;
  let y = 0;
  let sCoord = new Int16Array(2291);
  let dirCoords = $rows([$ta(Int16Array, 2, [1]), $ta(Int16Array, 2, [0, 1])]);
  fillSequentialList(P(sCoord), Math.imul(DCOLS, DROWS));
  shuffleList(P(sCoord), Math.imul(DCOLS, DROWS));
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    colorOverDungeon(G.darkGray);
    hiliteGrid(grid, G.white, 100);
  }
  pathMap = allocGrid();
  costMap = allocGrid();
  copyGrid(costMap, grid);
  findReplaceGrid(costMap, 0, 0, PDS_OBSTRUCTION);
  findReplaceGrid(costMap, 1, 30000, 1);
  for (i = 0; Math.imul(DCOLS, DROWS) > i; i = i + 1 << 16 >> 16) {
    x = (sCoord[i] / DROWS | 0) << 16 >> 16;
    y = sCoord[i] % DROWS << 16 >> 16;
    if (!$rd(grid.a[grid.o + x], y)) {
      for (d = 0; 1 >= d; d = d + 1 << 16 >> 16) {
        newX = x + dirCoords[d][0] << 16 >> 16;
        oppX = x - dirCoords[d][0] << 16 >> 16;
        newY = y + dirCoords[d][1] << 16 >> 16;
        oppY = y - dirCoords[d][1] << 16 >> 16;
        if (coordinatesAreInMap(newX, newY) && coordinatesAreInMap(oppX, oppY) && $rd(grid.a[grid.o + newX], newY) === 1 && $rd(grid.a[grid.o + oppX], oppY) === 1) {
          fillGrid(pathMap, 30000);
          $wr(pathMap.a[pathMap.o + newX], newY, 0);
          dijkstraScan(pathMap, costMap, false_);
          if ($rd(pathMap.a[pathMap.o + oppX], oppY) > minimumPathingDistance) {
            $wr(grid.a[grid.o + x], y, 2);
            $wr(costMap.a[costMap.o + x], y, 1);
            if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
              let p = struct_pos.$of(x, y);
              plotCharWithColor(G_CLOSED_DOOR, mapToWindow(p), G.black, G.green);
            }
            break;
          }
        }
      }
    }
  }
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await temporaryMessage(S("Added secondary connections:"), REQUIRE_ACKNOWLEDGMENT);
  }
  freeGrid(pathMap);
  freeGrid(costMap);
}

function addTileToMachineInteriorAndIterate(interior: Ptr | null, startX: number, startY: number): number {
  let dir = 0;
  let newX = 0;
  let newY = 0;
  let goodSoFar = true_;
  interior.a[interior.o + startX][startY] = true_;
  for (dir = 0; 4 > dir && goodSoFar; dir = dir + 1 << 16 >> 16) {
    newX = startX + G.nbDirs[dir][0] << 16 >> 16;
    newY = startY + G.nbDirs[dir][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY)) {
      if (($at2(G.pmap, newX, newY).flags & HAS_ITEM) >>> 0 || ($at2(G.pmap, newX, newY).flags & IS_IN_MACHINE) >>> 0 && !(($at2(G.pmap, newX, newY).flags & IS_GATE_SITE) >>> 0)) {
        return false_;
      }
      if (!interior.a[interior.o + newX][newY] && $rd(G.chokeMap.a[G.chokeMap.o + startX], startY) >= $rd(G.chokeMap.a[G.chokeMap.o + newX], newY) && !(($at2(G.pmap, newX, newY).flags & IS_IN_MACHINE) >>> 0)) {
        if (goodSoFar) {
          goodSoFar = addTileToMachineInteriorAndIterate(interior, newX, newY);
        }
      }
    }
  }
  return goodSoFar;
}

function copyMap(from: Ptr | null, to: Ptr | null): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      to.a[to.o + i][j].$cp(from.a[from.o + i][j]);
    }
  }
}

function itemIsADuplicate(theItem: struct_item | null, spawnedItems: Ptr | null, itemCount: number): number {
  let i = 0;
  if (theItem.category & (STAFF | WAND | POTION | SCROLL | RING | WEAPON | ARMOR | CHARM)) {
    for (i = 0; itemCount > i; i = i + 1 << 16 >> 16) {
      if (spawnedItems.a[spawnedItems.o + i].category === theItem.category && spawnedItems.a[spawnedItems.o + i].kind === theItem.kind) {
        return true_;
      }
    }
  }
  return false_;
}

function blueprintQualifies(i: number, requiredMachineFlags: number): number {
  if ($sadd(G.blueprintCatalog, i).depthRange[0] > G.rogue.depthLevel || G.rogue.depthLevel > $sadd(G.blueprintCatalog, i).depthRange[1] || (~$sadd(G.blueprintCatalog, i).flags >>> 0 & requiredMachineFlags) >>> 0 || (($sadd(G.blueprintCatalog, i).flags & BP_ADOPT_ITEM) >>> 0 & ~requiredMachineFlags >>> 0) >>> 0 || (($sadd(G.blueprintCatalog, i).flags & BP_VESTIBULE) >>> 0 & ~requiredMachineFlags >>> 0) >>> 0) {
    return false_;
  }
  return true_;
}

async function abortItemsAndMonsters(spawnedItems: Ptr | null, spawnedMonsters: Ptr | null): Promise<void> {
  let i = 0;
  let j = 0;
  for (i = 0; MACHINES_BUFFER_LENGTH > i && spawnedItems.a[spawnedItems.o + i]; i = i + 1 << 16 >> 16) {
    removeItemFromChain(spawnedItems.a[spawnedItems.o + i], G.floorItems);
    removeItemFromChain(spawnedItems.a[spawnedItems.o + i], G.packItems);
    for (j = 0; MACHINES_BUFFER_LENGTH > j && spawnedMonsters.a[spawnedMonsters.o + j]; j = j + 1 << 16 >> 16) {
      if (spawnedMonsters.a[spawnedMonsters.o + j].carriedItem === spawnedItems.a[spawnedItems.o + i]) {
        spawnedMonsters.a[spawnedMonsters.o + j].carriedItem = null;
        break;
      }
    }
    deleteItem(spawnedItems.a[spawnedItems.o + i]);
    spawnedItems.a[spawnedItems.o + i] = null;
  }
  for (i = 0; MACHINES_BUFFER_LENGTH > i && spawnedMonsters.a[spawnedMonsters.o + i]; i = i + 1 << 16 >> 16) {
    await killCreature(spawnedMonsters.a[spawnedMonsters.o + i], true_);
    spawnedMonsters.a[spawnedMonsters.o + i] = null;
  }
}

function cellIsFeatureCandidate(x: number, y: number, originX: number, originY: number, distanceBound: Ptr | null, interior: Ptr | null, occupied: Ptr | null, viewMap: Ptr | null, distanceMap: Ptr | null, machineNumber: number, featureFlags: number, bpFlags: number): number {
  let newX = 0;
  let newY = 0;
  let dir = 0;
  let distance = 0;
  if ((featureFlags & MF_NOT_IN_HALLWAY) >>> 0 && passableArcCount(x, y) > 1) {
    return false_;
  }
  if ((featureFlags & MF_NOT_ON_LEVEL_PERIMETER) >>> 0 && (x === 0 || x === DCOLS - 1 || y === 0 || y === DROWS - 1)) {
    return false_;
  }
  if ((featureFlags & MF_BUILD_AT_ORIGIN) >>> 0) {
    return (x === originX && y === originY ? true_ : false_) << 24 >> 24;
  } else if ((bpFlags & BP_ROOM) >>> 0 && x === originX && y === originY) {
    return false_;
  }
  if (occupied.a[occupied.o + x][y]) {
    return false_;
  }
  if ((featureFlags & (MF_IN_VIEW_OF_ORIGIN | MF_IN_PASSABLE_VIEW_OF_ORIGIN)) >>> 0 && !viewMap.a[viewMap.o + x][y]) {
    return false_;
  }
  if (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY)) {
    distance = 10000;
    for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
      newX = x + G.nbDirs[dir][0] << 16 >> 16;
      newY = y + G.nbDirs[dir][1] << 16 >> 16;
      if (coordinatesAreInMap(newX, newY) && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY) && distance > $rd(distanceMap.a[distanceMap.o + newX], newY) + 1) {
        distance = $rd(distanceMap.a[distanceMap.o + newX], newY) + 1 << 16 >> 16;
      }
    }
  } else {
    distance = $rd(distanceMap.a[distanceMap.o + x], y);
  }
  if (distance > distanceBound.a[distanceBound.o + 1] || distanceBound.a[distanceBound.o] > distance) {
    return false_;
  }
  if ((featureFlags & MF_BUILD_IN_WALLS) >>> 0) {
    if (!interior.a[interior.o + x][y] && ($at2(G.pmap, x, y).machineNumber === 0 || $at2(G.pmap, x, y).machineNumber === machineNumber) && cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY)) {
      for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
        newX = x + G.nbDirs[dir][0] << 16 >> 16;
        newY = y + G.nbDirs[dir][1] << 16 >> 16;
        if (coordinatesAreInMap(newX, newY) && (interior.a[interior.o + newX][newY] && !(newX === originX && newY === originY) || (featureFlags & MF_BUILD_ANYWHERE_ON_LEVEL) >>> 0 && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_PATHING_BLOCKER) && $at2(G.pmap, newX, newY).machineNumber === 0)) {
          return true_;
        }
      }
    }
    return false_;
  } else if (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_PASSABILITY)) {
    return false_;
  } else if ((featureFlags & MF_BUILD_ANYWHERE_ON_LEVEL) >>> 0) {
    if ((featureFlags & MF_GENERATE_ITEM) >>> 0 && (cellHasTerrainFlag(struct_pos.$of(x, y), T_OBSTRUCTS_ITEMS | T_PATHING_BLOCKER) || ($at2(G.pmap, x, y).flags & (IS_CHOKEPOINT | IN_LOOP | IS_IN_MACHINE)) >>> 0)) {
      return false_;
    } else {
      return (!(($at2(G.pmap, x, y).flags & IS_IN_MACHINE) >>> 0) ? 1 : 0) << 24 >> 24;
    }
  } else if (interior.a[interior.o + x][y]) {
    return true_;
  }
  return false_;
}

function addLocationToKey(theItem: struct_item | null, x: number, y: number, disposableHere: number): void {
  let i = 0;
  for (i = 0; KEY_ID_MAXIMUM > i && (theItem.keyLoc[i].loc.x || theItem.keyLoc[i].machine); i = i + 1 << 16 >> 16) {
    ;
  }
  theItem.keyLoc[i].loc.$cp(struct_pos.$of(x, y));
  theItem.keyLoc[i].disposableHere = disposableHere;
}

function addMachineNumberToKey(theItem: struct_item | null, machineNumber: number, disposableHere: number): void {
  let i = 0;
  for (i = 0; KEY_ID_MAXIMUM > i && (theItem.keyLoc[i].loc.x || theItem.keyLoc[i].machine); i = i + 1 << 16 >> 16) {
    ;
  }
  theItem.keyLoc[i].machine = machineNumber;
  theItem.keyLoc[i].disposableHere = disposableHere;
}

function expandMachineInterior(interior: Ptr | null, minimumInteriorNeighbors: number): void {
  let madeChange = 0;
  let nbcount = 0;
  let newX = 0;
  let newY = 0;
  let i = 0;
  let j = 0;
  let layer = 0;
  let dir = 0;
  do {
    madeChange = false_;
    for (i = 1; DCOLS - 1 > i; i = i + 1 << 16 >> 16) {
      for (j = 1; DROWS - 1 > j; j = j + 1 << 16 >> 16) {
        if (cellHasTerrainFlag(struct_pos.$of(i, j), T_PATHING_BLOCKER) && $at2(G.pmap, i, j).machineNumber === 0) {
          for (nbcount = (dir = 0) << 16 >> 16; DIRECTION_COUNT > dir; ++dir) {
            newX = i + G.nbDirs[dir][0] << 16 >> 16;
            newY = j + G.nbDirs[dir][1] << 16 >> 16;
            if (interior.a[interior.o + newX][newY] && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_PATHING_BLOCKER)) {
              nbcount = nbcount + 1 << 16 >> 16;
            }
          }
          if (nbcount >= minimumInteriorNeighbors) {
            for (nbcount = (dir = 0) << 16 >> 16; DIRECTION_COUNT > dir; ++dir) {
              newX = i + G.nbDirs[dir][0] << 16 >> 16;
              newY = j + G.nbDirs[dir][1] << 16 >> 16;
              if (!interior.a[interior.o + newX][newY] && (!cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY) || $at2(G.pmap, newX, newY).machineNumber !== 0)) {
                nbcount = nbcount + 1 << 16 >> 16;
                break;
              }
            }
            if (!nbcount) {
              madeChange = true_;
              interior.a[interior.o + i][j] = true_;
              for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; layer = layer + 1 << 16 >> 16) {
                if ((G.tileCatalog[$at2(G.pmap, i, j).layers[layer]].flags & T_PATHING_BLOCKER) >>> 0) {
                  $at2(G.pmap, i, j).layers[layer] = layer === DUNGEON ? FLOOR : NOTHING;
                }
              }
              for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
                newX = i + G.nbDirs[dir][0] << 16 >> 16;
                newY = j + G.nbDirs[dir][1] << 16 >> 16;
                if ($at2(G.pmap, newX, newY).layers[DUNGEON] >>> 0 === GRANITE) {
                  $at2(G.pmap, newX, newY).layers[DUNGEON] = WALL;
                }
              }
            }
          }
        }
      }
    }
  } while (madeChange);
  for (i = 1; DCOLS - 1 > i; i = i + 1 << 16 >> 16) {
    for (j = 1; DROWS - 1 > j; j = j + 1 << 16 >> 16) {
      if (interior.a[interior.o + i][j] && ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 === DOOR || $at2(G.pmap, i, j).layers[DUNGEON] >>> 0 === SECRET_DOOR)) {
        $at2(G.pmap, i, j).layers[DUNGEON] = FLOOR;
      }
    }
  }
}

function fillInteriorForVestibuleMachine(interior: Ptr | null, bp: number, originX: number, originY: number): number {
  let distanceMap = null;
  let costMap = null;
  let qualifyingTileCount = 0;
  let totalFreq = 0;
  let sRows = new Int16Array(29);
  let sCols = new Int16Array(79);
  let i = 0;
  let j = 0;
  let k = 0;
  let success = true_;
  zeroOutGrid(interior);
  distanceMap = allocGrid();
  fillGrid(distanceMap, 30000);
  $wr(distanceMap.a[distanceMap.o + originX], originY, 0);
  costMap = allocGrid();
  populateGenericCostMap(costMap);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(costMap.a[costMap.o + i], j) === 1 && ($at2(G.pmap, i, j).flags & IS_IN_MACHINE) >>> 0) {
        $wr(costMap.a[costMap.o + i], j, PDS_FORBIDDEN);
      }
    }
  }
  $wr(costMap.a[costMap.o + originX], originY, 1);
  dijkstraScan(distanceMap, costMap, false_);
  freeGrid(costMap);
  qualifyingTileCount = 0;
  totalFreq = rand_range($sadd(G.blueprintCatalog, bp).roomSize[0], $sadd(G.blueprintCatalog, bp).roomSize[1]) << 16 >> 16;
  fillSequentialList(P(sCols), DCOLS);
  shuffleList(P(sCols), DCOLS);
  fillSequentialList(P(sRows), DROWS);
  shuffleList(P(sRows), DROWS);
  for (k = 0; 1000 > k && totalFreq > qualifyingTileCount; k = k + 1 << 16 >> 16) {
    for (i = 0; DCOLS > i && totalFreq > qualifyingTileCount; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j && totalFreq > qualifyingTileCount; j = j + 1 << 16 >> 16) {
        if ($rd(distanceMap.a[distanceMap.o + sCols[i]], sRows[j]) === k) {
          interior.a[interior.o + sCols[i]][sRows[j]] = true_;
          qualifyingTileCount = qualifyingTileCount + 1 << 16 >> 16;
          if (($at2(G.pmap, sCols[i], sRows[j]).flags & HAS_ITEM) >>> 0) {
            success = false_;
            qualifyingTileCount = totalFreq;
          }
        }
      }
    }
  }
  if (($sadd(G.blueprintCatalog, bp).flags & BP_TREAT_AS_BLOCKING) >>> 0 && levelIsDisconnectedWithBlockingMap(interior, false_)) {
    success = false_;
  } else if (($sadd(G.blueprintCatalog, bp).flags & BP_REQUIRE_BLOCKING) >>> 0 && levelIsDisconnectedWithBlockingMap(interior, true_) < 100) {
    success = false_;
  }
  freeGrid(distanceMap);
  return success;
}

async function redesignInterior(interior: Ptr | null, originX: number, originY: number, theProfileIndex: number): Promise<void> {
  let i = 0;
  let j = 0;
  let n = 0;
  let newX = 0;
  let newY = 0;
  let dir = 0;
  let orphanList = $sarr(struct_pos, 20);
  let orphanCount = 0;
  let grid = null;
  let pathingGrid = null;
  let costGrid = null;
  grid = allocGrid();
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (interior.a[interior.o + i][j]) {
        if (i === originX && j === originY) {
          $wr(grid.a[grid.o + i], j, 1);
        } else {
          $wr(grid.a[grid.o + i], j, 0);
        }
      } else if (cellIsPassableOrDoor(i, j)) {
        $wr(grid.a[grid.o + i], j, 1);
        for (dir = 0; 4 > dir; ++dir) {
          newX = i + G.nbDirs[dir][0] << 16 >> 16;
          newY = j + G.nbDirs[dir][1] << 16 >> 16;
          if (coordinatesAreInMap(newX, newY) && interior.a[interior.o + newX][newY] && (newX !== originX || newY !== originY)) {
            orphanList[orphanCount].$cp(struct_pos.$of(newX, newY));
            orphanCount = orphanCount + 1 << 16 >> 16;
            $wr(grid.a[grid.o + i], j, -1);
            break;
          }
        }
      } else {
        $wr(grid.a[grid.o + i], j, -1);
      }
    }
  }
  await attachRooms(grid, $sat(G.dungeonProfileCatalog, theProfileIndex), 40, 40);
  if (orphanCount > 0) {
    pathingGrid = allocGrid();
    costGrid = allocGrid();
    for (n = 0; orphanCount > n; n = n + 1 << 16 >> 16) {
      if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
        await dumpLevelToScreen();
        copyGrid(pathingGrid, grid);
        findReplaceGrid(pathingGrid, -1, -1, 0);
        hiliteGrid(pathingGrid, G.green, 50);
        plotCharWithColor(88, mapToWindow(orphanList[n]), G.black, G.orange);
        await temporaryMessage(S("Orphan detected:"), REQUIRE_ACKNOWLEDGMENT);
      }
      for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
        for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
          if (interior.a[interior.o + i][j]) {
            if ($rd(grid.a[grid.o + i], j) > 0) {
              $wr(pathingGrid.a[pathingGrid.o + i], j, 0);
              $wr(costGrid.a[costGrid.o + i], j, 1);
            } else {
              $wr(pathingGrid.a[pathingGrid.o + i], j, 30000);
              $wr(costGrid.a[costGrid.o + i], j, 1);
            }
          } else {
            $wr(pathingGrid.a[pathingGrid.o + i], j, 30000);
            $wr(costGrid.a[costGrid.o + i], j, PDS_OBSTRUCTION);
          }
        }
      }
      dijkstraScan(pathingGrid, costGrid, false_);
      i = orphanList[n].x;
      j = orphanList[n].y;
      while ($rd(pathingGrid.a[pathingGrid.o + i], j) > 0) {
        for (dir = 0; 4 > dir; ++dir) {
          newX = i + G.nbDirs[dir][0] << 16 >> 16;
          newY = j + G.nbDirs[dir][1] << 16 >> 16;
          if (coordinatesAreInMap(newX, newY) && $rd(pathingGrid.a[pathingGrid.o + i], j) > $rd(pathingGrid.a[pathingGrid.o + newX], newY)) {
            $wr(grid.a[grid.o + i], j, 1);
            i = newX;
            j = newY;
            break;
          }
        }
        ;
        if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
          await dumpLevelToScreen();
          await displayGrid(pathingGrid);
          let p = struct_pos.$of(i, j);
          plotCharWithColor(88, mapToWindow(p), G.black, G.orange);
          await temporaryMessage(S("Orphan connecting:"), REQUIRE_ACKNOWLEDGMENT);
        }
      }
    }
    freeGrid(pathingGrid);
    freeGrid(costGrid);
  }
  await addLoops(grid, 10);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (interior.a[interior.o + i][j]) {
        if ($rd(grid.a[grid.o + i], j) >= 0) {
          $at2(G.pmap, i, j).layers[SURFACE] = $at2(G.pmap, i, j).layers[GAS] = NOTHING;
        }
        if ($rd(grid.a[grid.o + i], j) === 0) {
          $at2(G.pmap, i, j).layers[DUNGEON] = GRANITE;
          interior.a[interior.o + i][j] = false_;
        }
        if ($rd(grid.a[grid.o + i], j) >= 1) {
          $at2(G.pmap, i, j).layers[DUNGEON] = FLOOR;
        }
      }
    }
  }
  freeGrid(grid);
}

async function prepareInteriorWithMachineFlags(interior: Ptr | null, originX: number, originY: number, flags: number, dungeonProfileIndex: number): Promise<void> {
  let $t1: any, $t2: any;
  let i = 0;
  let j = 0;
  let newX = 0;
  let newY = 0;
  let layer = 0;
  let dir = 0;
  if ((flags & BP_MAXIMIZE_INTERIOR) >>> 0) {
    expandMachineInterior(interior, 1);
  } else if ((flags & BP_OPEN_INTERIOR) >>> 0) {
    expandMachineInterior(interior, 4);
  }
  if ((flags & BP_PURGE_INTERIOR) >>> 0) {
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (interior.a[interior.o + i][j]) {
          for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
            $at2(G.pmap, i, j).layers[layer] = layer === DUNGEON ? FLOOR : NOTHING;
          }
        }
      }
    }
  }
  if ((flags & BP_PURGE_PATHING_BLOCKERS) >>> 0) {
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (interior.a[interior.o + i][j]) {
          for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
            if ((G.tileCatalog[$at2(G.pmap, i, j).layers[layer]].flags & T_PATHING_BLOCKER) >>> 0) {
              $at2(G.pmap, i, j).layers[layer] = layer === DUNGEON ? FLOOR : NOTHING;
            }
          }
        }
      }
    }
  }
  if ((flags & BP_PURGE_LIQUIDS) >>> 0) {
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (interior.a[interior.o + i][j]) {
          $at2(G.pmap, i, j).layers[LIQUID] = NOTHING;
        }
      }
    }
  }
  if ((flags & BP_SURROUND_WITH_WALLS) >>> 0) {
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (interior.a[interior.o + i][j] && !(($at2(G.pmap, i, j).flags & IS_GATE_SITE) >>> 0)) {
          for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
            newX = i + G.nbDirs[dir][0] << 16 >> 16;
            newY = j + G.nbDirs[dir][1] << 16 >> 16;
            if (coordinatesAreInMap(newX, newY) && !interior.a[interior.o + newX][newY] && !cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY) && !(($at2(G.pmap, newX, newY).flags & IS_GATE_SITE) >>> 0) && !$at2(G.pmap, newX, newY).machineNumber && cellHasTerrainFlag(struct_pos.$of(newX, newY), T_PATHING_BLOCKER)) {
              for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
                $at2(G.pmap, newX, newY).layers[layer] = layer === DUNGEON ? WALL : 0;
              }
            }
          }
        }
      }
    }
  }
  if ((flags & BP_REDESIGN_INTERIOR) >>> 0) {
    await redesignInterior(interior, originX, originY, dungeonProfileIndex);
  }
  if ((flags & BP_IMPREGNABLE) >>> 0) {
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (interior.a[interior.o + i][j] && !(($at2(G.pmap, i, j).flags & IS_GATE_SITE) >>> 0)) {
          ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags | IMPREGNABLE) >>> 0);
          for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
            newX = i + G.nbDirs[dir][0] << 16 >> 16;
            newY = j + G.nbDirs[dir][1] << 16 >> 16;
            if (coordinatesAreInMap(newX, newY) && !interior.a[interior.o + newX][newY] && !(($at2(G.pmap, newX, newY).flags & IS_GATE_SITE) >>> 0)) {
              ($t2 = $at2(G.pmap, newX, newY), $t2.flags = ($t2.flags | IMPREGNABLE) >>> 0);
            }
          }
        }
      }
    }
  }
}

export async function buildAMachine(bp: number, originX: number, originY: number, requiredMachineFlags: number, adoptiveItem: struct_item | null, parentSpawnedItems: Ptr | null, parentSpawnedMonsters: Ptr | null): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any;
  let totalFreq = 0;
  let instance = 0;
  let instanceCount = 0;
  let itemCount = 0;
  let monsterCount = 0;
  let qualifyingTileCount = 0;
  let distanceMap = null;
  let personalSpace = 0;
  let locationFailsafe = 0;
  let machineNumber = 0;
  let alternativeFlags = $ta(Float64Array, 2, [MF_ALTERNATIVE, MF_ALTERNATIVE_2]);
  let DFSucceeded = 0;
  let terrainSucceeded = 0;
  let generateEverywhere = 0;
  let tryAgain = 0;
  let success = false_;
  let skipFeature = new Int8Array(20);
  let monst = null;
  let torchBearer = null;
  let leader = null;
  let theItem = null;
  let torch = null;
  let feature = null;
  let p = new struct_machineData();
  memset(p, 0, 220080);
  let chooseBP = (0 >= bp << 16 >> 16 ? true_ : false_) << 24 >> 24;
  let chooseLocation = (0 >= originX || 0 >= originY ? true_ : false_) << 24 >> 24;
  let failsafe = 10;
  do {
    tryAgain = false_;
    if (--failsafe <= 0) {
      if (distanceMap) {
        freeGrid(distanceMap);
      }
      if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
        if (chooseBP || chooseLocation) {
          printf(S("\nDepth %i: Failed to build a machine; gave up after 10 unsuccessful attempts to find a suitable blueprint and/or location."), G.rogue.depthLevel);
        } else {
          printf(S("\nDepth %i: Failed to build a machine; requested blueprint %i:%s and location did not work."), G.rogue.depthLevel, bp >>> 0, $sadd(G.blueprintCatalog, bp).name);
        }
      }
      free(p);
      return false_;
    }
    if (chooseBP) {
      totalFreq = 0;
      for (let i = 1; G.gameConst.numberBlueprints > i; ++i) {
        if (blueprintQualifies(i << 16 >> 16, requiredMachineFlags)) {
          totalFreq = totalFreq + $sadd(G.blueprintCatalog, i).frequency << 16 >> 16;
        }
      }
      if (!totalFreq) {
        if (distanceMap) {
          freeGrid(distanceMap);
        }
        if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
          printf(S("\nDepth %i: Failed to build a machine because no suitable blueprints were available."), G.rogue.depthLevel);
        }
        free(p);
        return false_;
      }
      let randIndex = rand_range(1, totalFreq) | 0;
      for (let i = 1; G.gameConst.numberBlueprints > i; ++i) {
        if (blueprintQualifies(i << 16 >> 16, requiredMachineFlags)) {
          if ($sadd(G.blueprintCatalog, i).frequency >= randIndex) {
            bp = i;
            break;
          } else {
            randIndex -= $sadd(G.blueprintCatalog, i).frequency;
          }
        }
      }
      ;
    }
    if (($sadd(G.blueprintCatalog, bp).flags & BP_ROOM) >>> 0) {
      zeroOutGrid(P(p.interior));
      if (chooseLocation) {
        analyzeMap(true_);
        totalFreq = 0;
        for (let i = 0; DCOLS > i; ++i) {
          for (let j = 0; DROWS > j && 50 > totalFreq; ++j) {
            if (($at2(G.pmap, i, j).flags & IS_GATE_SITE) >>> 0 && !(($at2(G.pmap, i, j).flags & IS_IN_MACHINE) >>> 0) && $rd(G.chokeMap.a[G.chokeMap.o + i], j) >= $sadd(G.blueprintCatalog, bp).roomSize[0] && $sadd(G.blueprintCatalog, bp).roomSize[1] >= $rd(G.chokeMap.a[G.chokeMap.o + i], j)) {
              p.gateCandidates[totalFreq].$cp(struct_pos.$of(i << 16 >> 16, j << 16 >> 16));
              totalFreq = totalFreq + 1 << 16 >> 16;
            }
          }
        }
        if (totalFreq) {
          let randIndex = rand_range(0, totalFreq - 1) | 0;
          originX = p.gateCandidates[randIndex].x;
          originY = p.gateCandidates[randIndex].y;
        } else {
          if (distanceMap) {
            freeGrid(distanceMap);
          }
          if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
            printf(S("\nDepth %i: Failed to build a machine; there was no eligible door candidate for the chosen room machine from blueprint %i:%s."), G.rogue.depthLevel, bp >>> 0, $sadd(G.blueprintCatalog, bp).name);
          }
          free(p);
          return false_;
        }
      }
      tryAgain = (!addTileToMachineInteriorAndIterate(P(p.interior), originX, originY) ? 1 : 0) << 24 >> 24;
    } else if (($sadd(G.blueprintCatalog, bp).flags & BP_VESTIBULE) >>> 0) {
      if (chooseLocation) {
        if (distanceMap) {
          freeGrid(distanceMap);
        }
        if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
          printf(S("\nDepth %i: ERROR: Attempted to build a door machine from blueprint %i:%s without a location being provided."), G.rogue.depthLevel, bp >>> 0, $sadd(G.blueprintCatalog, bp).name);
        }
        free(p);
        return false_;
      }
      if (!fillInteriorForVestibuleMachine(P(p.interior), bp << 16 >> 16, originX, originY)) {
        if (distanceMap) {
          freeGrid(distanceMap);
        }
        if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
          printf(S("\nDepth %i: Failed to build a door machine from blueprint %i:%s; not enough room."), G.rogue.depthLevel, bp >>> 0, $sadd(G.blueprintCatalog, bp).name);
        }
        free(p);
        return false_;
      }
    } else {
      locationFailsafe = 10;
      do {
        zeroOutGrid(P(p.interior));
        tryAgain = false_;
        if (chooseLocation) {
          let originLoc = struct_pos.$of(originX, originY);
          randomMatchingLocation(originLoc, FLOOR, NOTHING, -1);
          originX = originLoc.x;
          originY = originLoc.y;
        }
        if (!distanceMap) {
          distanceMap = allocGrid();
        }
        fillGrid(distanceMap, 0);
        calculateDistances(distanceMap, originX, originY, T_PATHING_BLOCKER, null, true_, false_);
        qualifyingTileCount = 0;
        totalFreq = rand_range($sadd(G.blueprintCatalog, bp).roomSize[0], $sadd(G.blueprintCatalog, bp).roomSize[1]) << 16 >> 16;
        fillSequentialList(P(p.sCols), DCOLS);
        shuffleList(P(p.sCols), DCOLS);
        fillSequentialList(P(p.sRows), DROWS);
        shuffleList(P(p.sRows), DROWS);
        for (let k = 0; 1000 > k && totalFreq > qualifyingTileCount; ++k) {
          for (let i = 0; DCOLS > i && totalFreq > qualifyingTileCount; ++i) {
            for (let j = 0; DROWS > j && totalFreq > qualifyingTileCount; ++j) {
              if ($rd(distanceMap.a[distanceMap.o + p.sCols[i]], p.sRows[j]) === k) {
                p.interior[p.sCols[i]][p.sRows[j]] = true_;
                qualifyingTileCount = qualifyingTileCount + 1 << 16 >> 16;
                if (($at2(G.pmap, p.sCols[i], p.sRows[j]).flags & (HAS_ITEM | HAS_MONSTER | IS_IN_MACHINE)) >>> 0) {
                  tryAgain = true_;
                  qualifyingTileCount = totalFreq;
                }
              }
            }
          }
        }
        if (($sadd(G.blueprintCatalog, bp).flags & BP_TREAT_AS_BLOCKING) >>> 0 && levelIsDisconnectedWithBlockingMap(P(p.interior), false_)) {
          tryAgain = true_;
        } else if (($sadd(G.blueprintCatalog, bp).flags & BP_REQUIRE_BLOCKING) >>> 0 && levelIsDisconnectedWithBlockingMap(P(p.interior), true_) < 100) {
          tryAgain = true_;
        }
      } while (chooseBP && tryAgain && (locationFailsafe = locationFailsafe - 1 << 16 >> 16));
    }
    if (tryAgain && !chooseBP && !chooseLocation) {
      if (distanceMap) {
        freeGrid(distanceMap);
      }
      free(p);
      return false_;
    }
  } while (tryAgain);
  copyMap(P(G.pmap), P(p.levelBackup));
  await prepareInteriorWithMachineFlags(P(p.interior), originX, originY, $sadd(G.blueprintCatalog, bp).flags, $sadd(G.blueprintCatalog, bp).dungeonProfileType);
  machineNumber = G.rogue.machineNumber = G.rogue.machineNumber + 1 << 16 >> 16;
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      if (p.interior[i][j]) {
        ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags | $u64(($sadd(G.blueprintCatalog, bp).flags & BP_ROOM) >>> 0 ? IS_IN_ROOM_MACHINE : IS_IN_AREA_MACHINE)) >>> 0);
        $at2(G.pmap, i, j).machineNumber = machineNumber & 0xff;
        if ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 === SECRET_DOOR) {
          $at2(G.pmap, i, j).layers[DUNGEON] = DOOR;
        }
        for (let layer = 0; NUMBER_TERRAIN_LAYERS > layer; ++layer) {
          if ((G.tileCatalog[$at2(G.pmap, i, j).layers[layer]].mechFlags & (TM_IS_WIRED | TM_IS_CIRCUIT_BREAKER)) >>> 0) {
            $at2(G.pmap, i, j).layers[layer] = layer === DUNGEON ? FLOOR : NOTHING;
          }
        }
      }
    }
  }
  if (!distanceMap) {
    distanceMap = allocGrid();
  }
  fillGrid(distanceMap, 0);
  calculateDistances(distanceMap, originX, originY, T_PATHING_BLOCKER, null, true_, true_);
  qualifyingTileCount = 0;
  for (let i = 0; 100 > i; ++i) {
    p.distances[i] = 0;
  }
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      if (p.interior[i][j] && 100 > $rd(distanceMap.a[distanceMap.o + i], j)) {
        ($t2 = p.distances, $t3 = $rd(distanceMap.a[distanceMap.o + i], j), $t2[$t3] = $t2[$t3] + 1 << 16 >> 16);
        qualifyingTileCount = qualifyingTileCount + 1 << 16 >> 16;
      }
    }
  }
  let distance25 = qualifyingTileCount / 4 | 0;
  let distance75 = 3 * qualifyingTileCount / 4 | 0;
  for (let i = 0; 100 > i; ++i) {
    if (p.distances[i] >= distance25) {
      distance25 = i;
      break;
    } else {
      distance25 -= p.distances[i];
    }
  }
  for (let i = 0; 100 > i; ++i) {
    if (p.distances[i] >= distance75) {
      distance75 = i;
      break;
    } else {
      distance75 -= p.distances[i];
    }
  }
  for (let i = 0; $sadd(G.blueprintCatalog, bp).featureCount > i; ++i) {
    skipFeature[i] = false_;
  }
  for (let j = 0; 1 >= j; ++j) {
    totalFreq = 0;
    for (let i = 0; $sadd(G.blueprintCatalog, bp).featureCount > i; ++i) {
      if (($sadd(G.blueprintCatalog, bp).feature[i].flags & alternativeFlags[j]) >>> 0) {
        skipFeature[i] = true_;
        totalFreq = totalFreq + 1 << 16 >> 16;
      }
    }
    if (totalFreq > 0) {
      let randIndex = rand_range(1, totalFreq) | 0;
      for (let i = 0; $sadd(G.blueprintCatalog, bp).featureCount > i; ++i) {
        if (($sadd(G.blueprintCatalog, bp).feature[i].flags & alternativeFlags[j]) >>> 0) {
          if (randIndex === 1) {
            skipFeature[i] = false_;
            break;
          } else {
            --randIndex;
          }
        }
      }
    }
  }
  itemCount = monsterCount = 0;
  zeroOutGrid(P(p.occupied));
  for (let feat = 0; $sadd(G.blueprintCatalog, bp).featureCount > feat; ++feat) {
    if (skipFeature[feat]) {
      continue;
    }
    feature = $sat($sadd(G.blueprintCatalog, bp).feature, feat);
    let distanceBound = $ta(Int16Array, 2, [0, 10000]);
    if ((feature.flags & MF_NEAR_ORIGIN) >>> 0) {
      distanceBound[1] = distance25 << 16 >> 16;
    }
    if ((feature.flags & MF_FAR_FROM_ORIGIN) >>> 0) {
      distanceBound[0] = distance75 << 16 >> 16;
    }
    if ((feature.flags & (MF_IN_VIEW_OF_ORIGIN | MF_IN_PASSABLE_VIEW_OF_ORIGIN)) >>> 0) {
      zeroOutGrid(P(p.viewMap));
      if ((feature.flags & MF_IN_PASSABLE_VIEW_OF_ORIGIN) >>> 0) {
        getFOVMask(P(p.viewMap), originX, originY, $mul64(100 - 20 - 1 > 31 + 3 - 3 - 2 ? 100 - 20 - 1 : 31 + 3 - 3 - 2, FP_FACTOR), T_PATHING_BLOCKER, 0, false_);
      } else {
        getFOVMask(P(p.viewMap), originX, originY, $mul64(100 - 20 - 1 > 31 + 3 - 3 - 2 ? 100 - 20 - 1 : 31 + 3 - 3 - 2, FP_FACTOR), T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_VISION, 0, false_);
      }
      p.viewMap[originX][originY] = true_;
      if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
        await dumpLevelToScreen();
        hiliteCharGrid(P(p.viewMap), G.omniscienceColor, 75);
        await temporaryMessage(S("Showing visibility."), REQUIRE_ACKNOWLEDGMENT);
      }
    }
    do {
      qualifyingTileCount = 0;
      for (let i = 0; DCOLS > i; ++i) {
        for (let j = 0; DROWS > j; ++j) {
          if (cellIsFeatureCandidate(i << 16 >> 16, j << 16 >> 16, originX, originY, P(distanceBound), P(p.interior), P(p.occupied), P(p.viewMap), distanceMap, machineNumber, feature.flags, $sadd(G.blueprintCatalog, bp).flags)) {
            qualifyingTileCount = qualifyingTileCount + 1 << 16 >> 16;
            p.candidates[i][j] = true_;
          } else {
            p.candidates[i][j] = false_;
          }
        }
      }
      if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
        await dumpLevelToScreen();
        hiliteCharGrid(P(p.occupied), G.red, 75);
        hiliteCharGrid(P(p.candidates), G.green, 75);
        hiliteCharGrid(P(p.interior), G.blue, 75);
        await temporaryMessage(S("Indicating: Occupied (red); Candidates (green); Interior (blue)."), REQUIRE_ACKNOWLEDGMENT);
      }
      if (((feature.flags & MF_EVERYWHERE) >>> 0 & ~MF_BUILD_AT_ORIGIN >>> 0) >>> 0) {
        generateEverywhere = true_;
      } else {
        generateEverywhere = false_;
        instanceCount = rand_range(feature.instanceCountRange[0], feature.instanceCountRange[1]) << 16 >> 16;
      }
      personalSpace = feature.personalSpace;
      for (instance = 0; (generateEverywhere || instanceCount > instance) && qualifyingTileCount > 0; ) {
        let featX = 0;
        let featY = 0;
        if ((feature.flags & MF_BUILD_AT_ORIGIN) >>> 0) {
          featX = originX;
          featY = originY;
        } else {
          featX = -1;
          featY = -1;
          let randIndex = rand_range(1, qualifyingTileCount) | 0;
          for (let i = 0; DCOLS > i && 0 > featX; ++i) {
            for (let j = 0; DROWS > j && 0 > featX; ++j) {
              if (p.candidates[i][j]) {
                if (randIndex === 1) {
                  featX = i;
                  featY = j;
                  i = DCOLS;
                  j = DROWS;
                } else {
                  --randIndex;
                }
              }
            }
          }
        }
        p.candidates[featX][featY] = false_;
        qualifyingTileCount = qualifyingTileCount - 1 << 16 >> 16;
        DFSucceeded = terrainSucceeded = true_;
        if (feature.featureDF) {
          DFSucceeded = await spawnDungeonFeature(featX << 16 >> 16, featY << 16 >> 16, $sat(G.dungeonFeatureCatalog, feature.featureDF), false_, (!((feature.flags & MF_PERMIT_BLOCKING) >>> 0) ? 1 : 0) << 24 >> 24);
        }
        if (DFSucceeded && feature.terrain >>> 0) {
          if (!((feature.flags & MF_PERMIT_BLOCKING) >>> 0) && ((G.tileCatalog[feature.terrain].flags & T_PATHING_BLOCKER) >>> 0 || (feature.flags & MF_TREAT_AS_BLOCKING) >>> 0)) {
            zeroOutGrid(P(p.blockingMap));
            p.blockingMap[featX][featY] = true_;
            terrainSucceeded = (!levelIsDisconnectedWithBlockingMap(P(p.blockingMap), false_) ? 1 : 0) << 24 >> 24;
          }
          if (terrainSucceeded) {
            $at2(G.pmap, featX, featY).layers[feature.layer] = feature.terrain;
          }
        }
        if (DFSucceeded && terrainSucceeded) {
          for (let i = featX - personalSpace + 1; featX + personalSpace - 1 >= i; ++i) {
            for (let j = featY - personalSpace + 1; featY + personalSpace - 1 >= j; ++j) {
              if (coordinatesAreInMap(i << 16 >> 16, j << 16 >> 16)) {
                if (p.candidates[i][j]) {
                  ;
                  p.candidates[i][j] = false_;
                  qualifyingTileCount = qualifyingTileCount - 1 << 16 >> 16;
                }
                p.occupied[i][j] = true_;
              }
            }
          }
          instance = instance + 1 << 16 >> 16;
        }
        if (DFSucceeded && terrainSucceeded) {
          theItem = null;
          ($t4 = $at2(G.pmap, featX, featY), $t4.flags = ($t4.flags | $u64(($sadd(G.blueprintCatalog, bp).flags & BP_ROOM) >>> 0 ? IS_IN_ROOM_MACHINE : IS_IN_AREA_MACHINE)) >>> 0);
          $at2(G.pmap, featX, featY).machineNumber = machineNumber & 0xff;
          if ((feature.flags & MF_IMPREGNABLE) >>> 0) {
            ($t5 = $at2(G.pmap, featX, featY), $t5.flags = ($t5.flags | IMPREGNABLE) >>> 0);
          }
          if ((feature.flags & MF_GENERATE_ITEM) >>> 0 || adoptiveItem && (feature.flags & MF_ADOPT_ITEM) >>> 0 && ($sadd(G.blueprintCatalog, bp).flags & BP_ADOPT_ITEM) >>> 0) {
            if (adoptiveItem && (feature.flags & MF_ADOPT_ITEM) >>> 0 && ($sadd(G.blueprintCatalog, bp).flags & BP_ADOPT_ITEM) >>> 0) {
              theItem = adoptiveItem;
              adoptiveItem = null;
            } else {
              theItem = await generateItem(feature.itemCategory & 0xffff, feature.itemKind);
              failsafe = 1000;
              while ((theItem.flags & ITEM_CURSED) >>> 0 || (feature.flags & MF_REQUIRE_GOOD_RUNIC) >>> 0 && !((theItem.flags & ITEM_RUNIC) >>> 0) || (feature.flags & MF_NO_THROWING_WEAPONS) >>> 0 && theItem.category === WEAPON && theItem.quantity > 1 || (feature.flags & MF_REQUIRE_HEAVY_WEAPON) >>> 0 && (!itemIsHeavyWeapon(theItem) || !itemIsPositivelyEnchanted(theItem)) || itemIsADuplicate(theItem, P(p.spawnedItems), itemCount)) {
                deleteItem(theItem);
                theItem = await generateItem(feature.itemCategory & 0xffff, feature.itemKind);
                if (0 >= failsafe) {
                  break;
                }
                --failsafe;
              }
              p.spawnedItems[itemCount] = theItem;
              itemCount = itemCount + 1 << 16 >> 16;
            }
            theItem.flags = (theItem.flags | feature.itemFlags) >>> 0;
            addLocationToKey(theItem, featX << 16 >> 16, featY << 16 >> 16, ((feature.flags & MF_KEY_DISPOSABLE) >>> 0 ? true_ : false_) << 24 >> 24);
            theItem.originDepth = G.rogue.depthLevel;
            if ((feature.flags & MF_SKELETON_KEY) >>> 0) {
              addMachineNumberToKey(theItem, machineNumber, ((feature.flags & MF_KEY_DISPOSABLE) >>> 0 ? true_ : false_) << 24 >> 24);
            }
            if (!((feature.flags & MF_OUTSOURCE_ITEM_TO_MACHINE) >>> 0) && !((feature.flags & MF_MONSTER_TAKE_ITEM) >>> 0)) {
              await placeItemAt(theItem, struct_pos.$of(featX << 16 >> 16, featY << 16 >> 16));
            }
          }
          if ((feature.flags & (MF_OUTSOURCE_ITEM_TO_MACHINE | MF_BUILD_VESTIBULE)) >>> 0) {
            let i = 0;
            for (i = 10; i > 0; --i) {
              if ((feature.flags & MF_OUTSOURCE_ITEM_TO_MACHINE) >>> 0 && theItem) {
                removeItemFromChain(theItem, G.floorItems);
                removeItemFromChain(theItem, G.packItems);
                theItem.nextItem = null;
                success = await buildAMachine(-1, -1, -1, BP_ADOPT_ITEM, theItem, P(p.spawnedItemsSub), P(p.spawnedMonstersSub));
              } else if ((feature.flags & MF_BUILD_VESTIBULE) >>> 0) {
                success = await buildAMachine(-1, featX << 16 >> 16, featY << 16 >> 16, BP_VESTIBULE, null, P(p.spawnedItemsSub), P(p.spawnedMonstersSub));
              }
              if (success) {
                for (let j = 0; MACHINES_BUFFER_LENGTH > j && p.spawnedItemsSub[j]; ++j) {
                  p.spawnedItems[itemCount] = p.spawnedItemsSub[j];
                  itemCount = itemCount + 1 << 16 >> 16;
                  p.spawnedItemsSub[j] = null;
                }
                for (let j = 0; MACHINES_BUFFER_LENGTH > j && p.spawnedMonstersSub[j]; ++j) {
                  p.spawnedMonsters[monsterCount] = p.spawnedMonstersSub[j];
                  monsterCount = monsterCount + 1 << 16 >> 16;
                  p.spawnedMonstersSub[j] = null;
                }
                break;
              }
            }
            if (!i) {
              if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
                printf(S("\nDepth %i: Failed to place blueprint %i:%s because it requires an adoptive machine and we couldn't place one."), G.rogue.depthLevel, bp >>> 0, $sadd(G.blueprintCatalog, bp).name);
              }
              copyMap(P(p.levelBackup), P(G.pmap));
              await abortItemsAndMonsters(P(p.spawnedItems), P(p.spawnedMonsters));
              freeGrid(distanceMap);
              free(p);
              return false_;
            }
            theItem = null;
          }
          if ((feature.flags & MF_GENERATE_HORDE) >>> 0 || feature.monsterID) {
            if ((feature.flags & MF_GENERATE_HORDE) >>> 0) {
              monst = await spawnHorde(0, struct_pos.$of(featX << 16 >> 16, featY << 16 >> 16), ((HORDE_IS_SUMMONED | HORDE_LEADER_CAPTIVE) & ~feature.hordeFlags >>> 0) >>> 0, feature.hordeFlags);
              if (monst) {
                monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_JUST_SUMMONED) >>> 0;
              }
            }
            if (feature.monsterID) {
              monst = monsterAtLoc(struct_pos.$of(featX << 16 >> 16, featY << 16 >> 16));
              if (monst) {
                await killCreature(monst, true_);
              }
              monst = generateMonster(feature.monsterID, true_, true_);
              if (monst) {
                monst.loc.$cp(struct_pos.$of(featX << 16 >> 16, featY << 16 >> 16));
                ($t6 = pmapAt(monst.loc), $t6.flags = ($t6.flags | HAS_MONSTER) >>> 0);
                monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_JUST_SUMMONED) >>> 0;
              }
            }
            if (monst) {
              if (!leader) {
                leader = monst;
              }
              if (theItem && (feature.flags & MF_MONSTER_TAKE_ITEM) >>> 0) {
                torchBearer = monst;
                torch = theItem;
              }
            }
            for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
              let monst = nextCreature(it);
              if ((monst.bookkeepingFlags & MB_JUST_SUMMONED) >>> 0) {
                if (!((monst.bookkeepingFlags & (MB_LEADER | MB_FOLLOWER)) >>> 0)) {
                  if (leader && leader !== monst) {
                    monst.leader = leader;
                    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_LEADER >>> 0) >>> 0;
                    monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_FOLLOWER) >>> 0;
                    leader.bookkeepingFlags = (leader.bookkeepingFlags | MB_LEADER) >>> 0;
                  } else {
                    leader = monst;
                  }
                }
                monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_JUST_SUMMONED >>> 0) >>> 0;
                p.spawnedMonsters[monsterCount] = monst;
                monsterCount = monsterCount + 1 << 16 >> 16;
                if ((feature.flags & MF_MONSTER_SLEEPING) >>> 0) {
                  monst.creatureState = MONSTER_SLEEPING;
                }
                if ((feature.flags & MF_MONSTER_FLEEING) >>> 0) {
                  monst.creatureState = MONSTER_FLEEING;
                  monst.creatureMode = MODE_PERM_FLEEING;
                }
                if ((feature.flags & MF_MONSTERS_DORMANT) >>> 0) {
                  await toggleMonsterDormancy(monst);
                  if (!((feature.flags & MF_MONSTER_SLEEPING) >>> 0) && monst.creatureState >>> 0 !== MONSTER_ALLY) {
                    monst.creatureState = MONSTER_TRACKING_SCENT;
                  }
                }
                monst.machineHome = machineNumber;
              }
            }
          }
        }
        theItem = null;
      }
    } while ((feature.flags & MF_REPEAT_UNTIL_NO_PROGRESS) >>> 0 && instance >= feature.minimumInstanceCount);
    if (feature.minimumInstanceCount > instance && !((feature.flags & MF_REPEAT_UNTIL_NO_PROGRESS) >>> 0)) {
      if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
        printf(S("\nDepth %i: Failed to place blueprint %i:%s because of feature %i; needed %i instances but got only %i."), G.rogue.depthLevel, bp >>> 0, $sadd(G.blueprintCatalog, bp).name, feat, feature.minimumInstanceCount, instance);
      }
      copyMap(P(p.levelBackup), P(G.pmap));
      await abortItemsAndMonsters(P(p.spawnedItems), P(p.spawnedMonsters));
      freeGrid(distanceMap);
      free(p);
      return false_;
    }
  }
  if (($sadd(G.blueprintCatalog, bp).flags & BP_NO_INTERIOR_FLAG) >>> 0) {
    for (let i = 0; DCOLS > i; ++i) {
      for (let j = 0; DROWS > j; ++j) {
        if ($at2(G.pmap, i, j).machineNumber === machineNumber && !cellHasTMFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), TM_IS_WIRED | TM_IS_CIRCUIT_BREAKER)) {
          ($t7 = $at2(G.pmap, i, j), $t7.flags = ($t7.flags & ~IS_IN_MACHINE >>> 0) >>> 0);
          $at2(G.pmap, i, j).machineNumber = 0;
        }
      }
    }
  }
  if (torchBearer && torch) {
    if (torchBearer.carriedItem) {
      deleteItem(torchBearer.carriedItem);
    }
    removeItemFromChain(torch, G.floorItems);
    torchBearer.carriedItem = torch;
  }
  freeGrid(distanceMap);
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    printf(S("\nDepth %i: Built a machine from blueprint %i:%s with an origin at (%i, %i)."), G.rogue.depthLevel, bp >>> 0, $sadd(G.blueprintCatalog, bp).name, originX, originY);
  }
  if (parentSpawnedItems) {
    for (let i = 0; itemCount > i; ++i) {
      parentSpawnedItems.a[parentSpawnedItems.o + i] = p.spawnedItems[i];
    }
  }
  if (parentSpawnedMonsters) {
    for (let i = 0; monsterCount > i; ++i) {
      parentSpawnedMonsters.a[parentSpawnedMonsters.o + i] = p.spawnedMonsters[i];
    }
  }
  free(p);
  return true_;
}

async function addMachines(): Promise<void> {
  let machineCount = 0;
  let failsafe = 0;
  let randomMachineFactor = 0;
  analyzeMap(true_);
  if (G.gameVariant === VARIANT_BULLET_BROGUE && G.rogue.depthLevel === 1) {
    for (failsafe = 50; failsafe; failsafe = failsafe - 1 << 16 >> 16) {
      if (await buildAMachine(MT_REWARD_HEAVY_OR_RUNIC_WEAPON, -1, -1, 0, null, null, null)) {
        break;
      }
    }
  }
  if (G.rogue.depthLevel === G.gameConst.amuletLevel) {
    for (failsafe = 50; failsafe; failsafe = failsafe - 1 << 16 >> 16) {
      if (await buildAMachine(MT_AMULET_AREA, -1, -1, 0, null, null, null)) {
        break;
      }
    }
  }
  machineCount = 0;
  while (G.gameConst.deepestLevelForMachines >= G.rogue.depthLevel && Math.imul(G.rogue.depthLevel, G.gameConst.machinesPerLevelIncreaseFactor) > Math.imul(G.rogue.rewardRoomsGenerated + machineCount, G.gameConst.machinesPerLevelSuppressionMultiplier) + G.gameConst.machinesPerLevelSuppressionOffset) {
    machineCount = machineCount + 1 << 16 >> 16;
  }
  randomMachineFactor = (G.gameConst.maxLevelForBonusMachines >= G.rogue.depthLevel && G.rogue.rewardRoomsGenerated + machineCount === 0 ? 40 : 15) << 16 >> 16;
  while (rand_percent((randomMachineFactor > 15 * G.gameConst.machinesPerLevelIncreaseFactor ? randomMachineFactor : 15 * G.gameConst.machinesPerLevelIncreaseFactor) << 16 >> 16) && 100 > machineCount) {
    randomMachineFactor = 15;
    machineCount = machineCount + 1 << 16 >> 16;
  }
  for (failsafe = 50; machineCount && failsafe; failsafe = failsafe - 1 << 16 >> 16) {
    if (await buildAMachine(-1, -1, -1, BP_REWARD, null, null, null)) {
      machineCount = machineCount - 1 << 16 >> 16;
      G.rogue.rewardRoomsGenerated = G.rogue.rewardRoomsGenerated + 1 << 16 >> 16;
    }
  }
}

async function runAutogenerators(buildAreaMachines: number): Promise<void> {
  let AG = 0;
  let count = 0;
  let i = 0;
  let gen = null;
  let grid = $arr(79, () => new Int8Array(29));
  for (AG = 1; G.gameConst.numberAutogenerators > AG; AG = AG + 1 << 16 >> 16) {
    gen = $sadd(G.autoGeneratorCatalog, AG);
    if ((gen.machine >>> 0 > 0 ? 1 : 0) === buildAreaMachines) {
      if (gen.minDepth > G.rogue.depthLevel || G.rogue.depthLevel > gen.maxDepth) {
        continue;
      }
      count = (gen.maxNumber > ((gen.minNumberIntercept + Math.imul(G.rogue.depthLevel, gen.minNumberSlope)) / 100 | 0) ? (gen.minNumberIntercept + Math.imul(G.rogue.depthLevel, gen.minNumberSlope)) / 100 | 0 : gen.maxNumber) << 16 >> 16;
      while (rand_percent(gen.frequency) && gen.maxNumber > count) {
        count = count + 1 << 16 >> 16;
      }
      for (i = 0; count > i; i = i + 1 << 16 >> 16) {
        let foundationLoc = new struct_pos();
        if (randomMatchingLocation(foundationLoc, gen.requiredDungeonFoundationType << 16 >> 16, gen.requiredLiquidFoundationType << 16 >> 16, -1)) {
          if (gen.DFType) {
            await spawnDungeonFeature(foundationLoc.x, foundationLoc.y, $sat(G.dungeonFeatureCatalog, gen.DFType), false_, true_);
            if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
              await dumpLevelToScreen();
              await hiliteCell(foundationLoc.x, foundationLoc.y, G.yellow, 50, true_);
              await temporaryMessage(S("Dungeon feature added."), REQUIRE_ACKNOWLEDGMENT);
            }
          }
          if (gen.terrain >>> 0 && G.tileCatalog[pmapAt(foundationLoc).layers[gen.layer]].drawPriority >= G.tileCatalog[gen.terrain].drawPriority) {
            zeroOutGrid(P(grid));
            grid[foundationLoc.x][foundationLoc.y] = true_;
            if (!((G.tileCatalog[gen.terrain].flags & T_PATHING_BLOCKER) >>> 0) || !levelIsDisconnectedWithBlockingMap(P(grid), false_)) {
              pmapAt(foundationLoc).layers[gen.layer] = gen.terrain;
              if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
                await dumpLevelToScreen();
                await hiliteCell(foundationLoc.x, foundationLoc.y, G.yellow, 50, true_);
                await temporaryMessage(S("Terrain added."), REQUIRE_ACKNOWLEDGMENT);
              }
            }
          }
        }
        if (gen.machine >>> 0 > 0) {
          await buildAMachine(gen.machine, -1, -1, 0, null, null, null);
        }
      }
    }
  }
}

function cleanUpLakeBoundaries(): void {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let failsafe = 0;
  let layer = 0;
  let reverse = 0;
  let madeChange = 0;
  let subjectFlags = 0;
  reverse = true_;
  failsafe = 100;
  do {
    madeChange = false_;
    reverse = (!reverse ? 1 : 0) << 24 >> 24;
    failsafe = failsafe - 1 << 16 >> 16;
    for (i = (reverse ? DCOLS - 2 : 1) << 16 >> 16; reverse ? i > 0 ? 1 : 0 : DCOLS - 1 > i ? 1 : 0; reverse ? ($t1 = i, i = $t1 - 1 << 16 >> 16, $t1) : ($t2 = i, i = $t2 + 1 << 16 >> 16, $t2)) {
      for (j = (reverse ? DROWS - 2 : 1) << 16 >> 16; reverse ? j > 0 ? 1 : 0 : DROWS - 1 > j ? 1 : 0; reverse ? ($t3 = j, j = $t3 - 1 << 16 >> 16, $t3) : ($t4 = j, j = $t4 + 1 << 16 >> 16, $t4)) {
        if (cellHasTerrainFlag(struct_pos.$of(i, j), T_LAKE_PATHING_BLOCKER | T_OBSTRUCTS_PASSABILITY) && !cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET) && !(($at2(G.pmap, i, j).flags & IMPREGNABLE) >>> 0)) {
          subjectFlags = (terrainFlags(struct_pos.$of(i, j)) & (T_LAKE_PATHING_BLOCKER | T_OBSTRUCTS_PASSABILITY)) >>> 0;
          x = y = 0;
          if (((terrainFlags(struct_pos.$of(i - 1 << 16 >> 16, j)) & T_LAKE_PATHING_BLOCKER) >>> 0 & ~subjectFlags >>> 0) >>> 0 && !cellHasTMFlag(struct_pos.$of(i - 1 << 16 >> 16, j), TM_IS_SECRET) && !cellHasTMFlag(struct_pos.$of(i + 1 << 16 >> 16, j), TM_IS_SECRET) && ((terrainFlags(struct_pos.$of(i - 1 << 16 >> 16, j)) & T_LAKE_PATHING_BLOCKER) >>> 0 & ~subjectFlags >>> 0) >>> 0 === ((terrainFlags(struct_pos.$of(i + 1 << 16 >> 16, j)) & T_LAKE_PATHING_BLOCKER) >>> 0 & ~subjectFlags >>> 0) >>> 0) {
            x = i + 1 << 16 >> 16;
            y = j;
          } else if (((terrainFlags(struct_pos.$of(i, j - 1 << 16 >> 16)) & T_LAKE_PATHING_BLOCKER) >>> 0 & ~subjectFlags >>> 0) >>> 0 && !cellHasTMFlag(struct_pos.$of(i, j - 1 << 16 >> 16), TM_IS_SECRET) && !cellHasTMFlag(struct_pos.$of(i, j + 1 << 16 >> 16), TM_IS_SECRET) && ((terrainFlags(struct_pos.$of(i, j - 1 << 16 >> 16)) & T_LAKE_PATHING_BLOCKER) >>> 0 & ~subjectFlags >>> 0) >>> 0 === ((terrainFlags(struct_pos.$of(i, j + 1 << 16 >> 16)) & T_LAKE_PATHING_BLOCKER) >>> 0 & ~subjectFlags >>> 0) >>> 0) {
            x = i;
            y = j + 1 << 16 >> 16;
          }
          if (x) {
            madeChange = true_;
            for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; layer = layer + 1 << 16 >> 16) {
              $at2(G.pmap, i, j).layers[layer] = $at2(G.pmap, x, y).layers[layer];
            }
          }
        }
      }
    }
  } while (madeChange && failsafe > 0);
}

function removeDiagonalOpenings(): void {
  let i = 0;
  let j = 0;
  let k = 0;
  let x1 = 0;
  let y1 = 0;
  let x2 = 0;
  let layer = 0;
  let diagonalCornerRemoved = 0;
  do {
    diagonalCornerRemoved = false_;
    for (i = 0; DCOLS - 1 > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS - 1 > j; j = j + 1 << 16 >> 16) {
        for (k = 0; 1 >= k; k = k + 1 << 16 >> 16) {
          if (!((G.tileCatalog[$at2(G.pmap, i + k, j).layers[DUNGEON]].flags & T_OBSTRUCTS_PASSABILITY) >>> 0) && (G.tileCatalog[$at2(G.pmap, i + (1 - k), j).layers[DUNGEON]].flags & T_OBSTRUCTS_PASSABILITY) >>> 0 && (G.tileCatalog[$at2(G.pmap, i + (1 - k), j).layers[DUNGEON]].flags & T_OBSTRUCTS_DIAGONAL_MOVEMENT) >>> 0 && (G.tileCatalog[$at2(G.pmap, i + k, j + 1).layers[DUNGEON]].flags & T_OBSTRUCTS_PASSABILITY) >>> 0 && (G.tileCatalog[$at2(G.pmap, i + k, j + 1).layers[DUNGEON]].flags & T_OBSTRUCTS_DIAGONAL_MOVEMENT) >>> 0 && !((G.tileCatalog[$at2(G.pmap, i + (1 - k), j + 1).layers[DUNGEON]].flags & T_OBSTRUCTS_PASSABILITY) >>> 0)) {
            if (rand_percent(50)) {
              x1 = i + (1 - k) << 16 >> 16;
              x2 = i + k << 16 >> 16;
              y1 = j;
            } else {
              x1 = i + k << 16 >> 16;
              x2 = i + (1 - k) << 16 >> 16;
              y1 = j + 1 << 16 >> 16;
            }
            if (!(($at2(G.pmap, x1, y1).flags & HAS_MONSTER) >>> 0) && $at2(G.pmap, x1, y1).machineNumber === 0) {
              diagonalCornerRemoved = true_;
              for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; layer = layer + 1 << 16 >> 16) {
                $at2(G.pmap, x1, y1).layers[layer] = $at2(G.pmap, x2, y1).layers[layer];
              }
            }
          }
        }
      }
    }
  } while (diagonalCornerRemoved === true_);
}

function insertRoomAt(dungeonMap: Ptr | null, roomMap: Ptr | null, roomToDungeonX: number, roomToDungeonY: number, xRoom: number, yRoom: number): void {
  let newX = 0;
  let newY = 0;
  let dir = 0;
  ;
  $wr(dungeonMap.a[dungeonMap.o + (xRoom + roomToDungeonX)], (yRoom + roomToDungeonY), 1);
  for (dir = 0; 4 > dir; ++dir) {
    newX = xRoom + G.nbDirs[dir][0] << 16 >> 16;
    newY = yRoom + G.nbDirs[dir][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY) && $rd(roomMap.a[roomMap.o + newX], newY) && coordinatesAreInMap(newX + roomToDungeonX << 16 >> 16, newY + roomToDungeonY << 16 >> 16) && $rd(dungeonMap.a[dungeonMap.o + (newX + roomToDungeonX)], (newY + roomToDungeonY)) === 0) {
      insertRoomAt(dungeonMap, roomMap, roomToDungeonX, roomToDungeonY, newX, newY);
    }
  }
}

function designCavern(grid: Ptr | null, minWidth: number, maxWidth: number, minHeight: number, maxHeight: number): void {
  let destX = 0;
  let destY = 0;
  const caveX = new Int16Array(1);
  const caveY = new Int16Array(1);
  const caveWidth = new Int16Array(1);
  const caveHeight = new Int16Array(1);
  let fillX = 0;
  let fillY = 0;
  let foundFillPoint = false_;
  let blobGrid = null;
  blobGrid = allocGrid();
  fillGrid(grid, 0);
  createBlobOnGrid(blobGrid, P(caveX, 0), P(caveY, 0), P(caveWidth, 0), P(caveHeight, 0), 5, minWidth, minHeight, maxWidth, maxHeight, 55, S("ffffffttt"), S("ffffttttt"));
  destX = ((DCOLS - caveWidth[0]) / 2 | 0) << 16 >> 16;
  destY = ((DROWS - caveHeight[0]) / 2 | 0) << 16 >> 16;
  for (fillX = 0; DCOLS > fillX && !foundFillPoint; fillX = fillX + 1 << 16 >> 16) {
    for (fillY = 0; DROWS > fillY && !foundFillPoint; fillY = fillY + 1 << 16 >> 16) {
      if ($rd(blobGrid.a[blobGrid.o + fillX], fillY)) {
        foundFillPoint = true_;
      }
    }
  }
  insertRoomAt(grid, blobGrid, destX - caveX[0] << 16 >> 16, destY - caveY[0] << 16 >> 16, fillX, fillY);
  freeGrid(blobGrid);
}

function designEntranceRoom(grid: Ptr | null): void {
  let roomWidth = 0;
  let roomHeight = 0;
  let roomWidth2 = 0;
  let roomHeight2 = 0;
  let roomX = 0;
  let roomY = 0;
  let roomX2 = 0;
  let roomY2 = 0;
  fillGrid(grid, 0);
  roomWidth = 8;
  roomHeight = 10;
  roomWidth2 = 20;
  roomHeight2 = 5;
  roomX = (DCOLS / 2 | 0) - (roomWidth / 2 | 0) - 1 << 16 >> 16;
  roomY = DROWS - roomHeight - 2 << 16 >> 16;
  roomX2 = (DCOLS / 2 | 0) - (roomWidth2 / 2 | 0) - 1 << 16 >> 16;
  roomY2 = DROWS - roomHeight2 - 2 << 16 >> 16;
  drawRectangleOnGrid(grid, roomX, roomY, roomWidth, roomHeight, 1);
  drawRectangleOnGrid(grid, roomX2, roomY2, roomWidth2, roomHeight2, 1);
}

function designCrossRoom(grid: Ptr | null): void {
  let roomWidth = 0;
  let roomHeight = 0;
  let roomWidth2 = 0;
  let roomHeight2 = 0;
  let roomX = 0;
  let roomY = 0;
  let roomX2 = 0;
  let roomY2 = 0;
  fillGrid(grid, 0);
  roomWidth = rand_range(3, 12) << 16 >> 16;
  roomX = rand_range(0 > ((100 - 20 - 1) / 2 | 0) - (roomWidth - 1) ? 0 : ((100 - 20 - 1) / 2 | 0) - (roomWidth - 1), ((100 - 20 - 1) / 2 | 0) > 100 - 20 - 1 ? 100 - 20 - 1 : (100 - 20 - 1) / 2 | 0) << 16 >> 16;
  roomWidth2 = rand_range(4, 20) << 16 >> 16;
  roomX2 = roomX + (roomWidth / 2 | 0) + rand_range(0, 2) + rand_range(0, 2) - 3 - (roomWidth2 / 2 | 0) << 16 >> 16;
  roomHeight = rand_range(3, 7) << 16 >> 16;
  roomY = (DROWS / 2 | 0) - roomHeight << 16 >> 16;
  roomHeight2 = rand_range(2, 5) << 16 >> 16;
  roomY2 = (DROWS / 2 | 0) - roomHeight2 - (rand_range(0, 2) + rand_range(0, 1)) << 16 >> 16;
  drawRectangleOnGrid(grid, roomX - 5 << 16 >> 16, roomY + 5 << 16 >> 16, roomWidth, roomHeight, 1);
  drawRectangleOnGrid(grid, roomX2 - 5 << 16 >> 16, roomY2 + 5 << 16 >> 16, roomWidth2, roomHeight2, 1);
}

function designSymmetricalCrossRoom(grid: Ptr | null): void {
  let majorWidth = 0;
  let majorHeight = 0;
  let minorWidth = 0;
  let minorHeight = 0;
  fillGrid(grid, 0);
  majorWidth = rand_range(4, 8) << 16 >> 16;
  majorHeight = rand_range(4, 5) << 16 >> 16;
  minorWidth = rand_range(3, 4) << 16 >> 16;
  if (majorHeight % 2 === 0) {
    minorWidth = minorWidth - 1 << 16 >> 16;
  }
  minorHeight = 3;
  if (majorWidth % 2 === 0) {
    minorHeight = minorHeight - 1 << 16 >> 16;
  }
  drawRectangleOnGrid(grid, ((DCOLS - majorWidth) / 2 | 0) << 16 >> 16, ((DROWS - minorHeight) / 2 | 0) << 16 >> 16, majorWidth, minorHeight, 1);
  drawRectangleOnGrid(grid, ((DCOLS - minorWidth) / 2 | 0) << 16 >> 16, ((DROWS - majorHeight) / 2 | 0) << 16 >> 16, minorWidth, majorHeight, 1);
}

function designSmallRoom(grid: Ptr | null): void {
  let width = 0;
  let height = 0;
  fillGrid(grid, 0);
  width = rand_range(3, 6) << 16 >> 16;
  height = rand_range(2, 4) << 16 >> 16;
  drawRectangleOnGrid(grid, ((DCOLS - width) / 2 | 0) << 16 >> 16, ((DROWS - height) / 2 | 0) << 16 >> 16, width, height, 1);
}

function designCircularRoom(grid: Ptr | null): void {
  let radius = 0;
  if (rand_percent(5)) {
    radius = rand_range(4, 10) << 16 >> 16;
  } else {
    radius = rand_range(2, 4) << 16 >> 16;
  }
  fillGrid(grid, 0);
  drawCircleOnGrid(grid, (DCOLS / 2 | 0) << 16 >> 16, (DROWS / 2 | 0) << 16 >> 16, radius, 1);
  if (radius > 6 && rand_percent(50)) {
    drawCircleOnGrid(grid, (DCOLS / 2 | 0) << 16 >> 16, (DROWS / 2 | 0) << 16 >> 16, rand_range(3, radius - 3) << 16 >> 16, 0);
  }
}

function designChunkyRoom(grid: Ptr | null): void {
  let i = 0;
  let x = 0;
  let y = 0;
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  let chunkCount = rand_range(2, 8) << 16 >> 16;
  fillGrid(grid, 0);
  drawCircleOnGrid(grid, (DCOLS / 2 | 0) << 16 >> 16, (DROWS / 2 | 0) << 16 >> 16, 2, 1);
  minX = (DCOLS / 2 | 0) - 3 << 16 >> 16;
  maxX = (DCOLS / 2 | 0) + 3 << 16 >> 16;
  minY = (DROWS / 2 | 0) - 3 << 16 >> 16;
  maxY = (DROWS / 2 | 0) + 3 << 16 >> 16;
  for (i = 0; chunkCount > i; ) {
    x = rand_range(minX, maxX) << 16 >> 16;
    y = rand_range(minY, maxY) << 16 >> 16;
    if ($rd(grid.a[grid.o + x], y)) {
      drawCircleOnGrid(grid, x, y, 2, 1);
      i = i + 1 << 16 >> 16;
      minX = (1 > (minX > x - 3 ? x - 3 : minX) ? 1 : minX > x - 3 ? x - 3 : minX) << 16 >> 16;
      maxX = ((x + 3 > maxX ? x + 3 : maxX) > 100 - 20 - 1 - 2 ? 100 - 20 - 1 - 2 : x + 3 > maxX ? x + 3 : maxX) << 16 >> 16;
      minY = (1 > (minY > y - 3 ? y - 3 : minY) ? 1 : minY > y - 3 ? y - 3 : minY) << 16 >> 16;
      maxY = ((y + 3 > maxY ? y + 3 : maxY) > 31 + 3 - 3 - 2 - 2 ? 31 + 3 - 3 - 2 - 2 : y + 3 > maxY ? y + 3 : maxY) << 16 >> 16;
    }
  }
}

function directionOfDoorSite(grid: Ptr | null, x: number, y: number): number {
  let dir = 0;
  let solutionDir = 0;
  let newX = 0;
  let newY = 0;
  let oppX = 0;
  let oppY = 0;
  if ($rd(grid.a[grid.o + x], y)) {
    return NO_DIRECTION;
  }
  solutionDir = NO_DIRECTION;
  for (dir = 0; 4 > dir; ++dir) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    oppX = x - G.nbDirs[dir][0] << 16 >> 16;
    oppY = y - G.nbDirs[dir][1] << 16 >> 16;
    if (coordinatesAreInMap(oppX, oppY) && coordinatesAreInMap(newX, newY) && $rd(grid.a[grid.o + oppX], oppY) === 1) {
      if (solutionDir !== NO_DIRECTION) {
        return NO_DIRECTION;
      }
      solutionDir = dir;
    }
  }
  return solutionDir;
}

function chooseRandomDoorSites(roomMap: Ptr | null, doorSites: struct_pos | null): void {
  let i = 0;
  let j = 0;
  let k = 0;
  let newX = 0;
  let newY = 0;
  let dir = 0;
  let grid = null;
  let doorSiteFailed = 0;
  grid = allocGrid();
  copyGrid(grid, roomMap);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (!$rd(grid.a[grid.o + i], j)) {
        dir = directionOfDoorSite(roomMap, i, j);
        if (dir !== NO_DIRECTION) {
          newX = i + G.nbDirs[dir][0] << 16 >> 16;
          newY = j + G.nbDirs[dir][1] << 16 >> 16;
          doorSiteFailed = false_;
          for (k = 0; 10 > k && coordinatesAreInMap(newX, newY) && !doorSiteFailed; k = k + 1 << 16 >> 16) {
            if ($rd(grid.a[grid.o + newX], newY)) {
              doorSiteFailed = true_;
            }
            newX = newX + G.nbDirs[dir][0] << 16 >> 16;
            newY = newY + G.nbDirs[dir][1] << 16 >> 16;
          }
          if (!doorSiteFailed) {
            $wr(grid.a[grid.o + i], j, dir + 2 << 16 >> 16);
          }
        }
      }
    }
  }
  for (dir = 0; 4 > dir; ++dir) {
    randomLocationInGrid(grid, P($sadd(doorSites, dir), "x"), P($sadd(doorSites, dir), "y"), dir + 2 << 16 >> 16);
  }
  freeGrid(grid);
}

function attachHallwayTo(grid: Ptr | null, doorSites: struct_pos | null): void {
  let i = 0;
  let x = 0;
  let y = 0;
  let newX = 0;
  let newY = 0;
  let dirs = new Int16Array(4);
  let length = 0;
  let dir = 0;
  let dir2 = 0;
  let allowObliqueHallwayExit = 0;
  fillSequentialList(P(dirs), 4);
  shuffleList(P(dirs), 4);
  for (i = 0; 4 > i; i = i + 1 << 16 >> 16) {
    dir = dirs[i];
    if ($sadd(doorSites, dir).x !== -1 && $sadd(doorSites, dir).y !== -1 && coordinatesAreInMap($sadd(doorSites, dir).x + Math.imul(G.nbDirs[dir][0], HORIZONTAL_CORRIDOR_MAX_LENGTH) << 16 >> 16, $sadd(doorSites, dir).y + Math.imul(G.nbDirs[dir][1], VERTICAL_CORRIDOR_MAX_LENGTH) << 16 >> 16)) {
      break;
    }
  }
  if (i === 4) {
    return;
  }
  if (dir === UP || dir === DOWN) {
    length = rand_range(VERTICAL_CORRIDOR_MIN_LENGTH, VERTICAL_CORRIDOR_MAX_LENGTH) << 16 >> 16;
  } else {
    length = rand_range(HORIZONTAL_CORRIDOR_MIN_LENGTH, HORIZONTAL_CORRIDOR_MAX_LENGTH) << 16 >> 16;
  }
  x = $sadd(doorSites, dir).x;
  y = $sadd(doorSites, dir).y;
  for (i = 0; length > i; i = i + 1 << 16 >> 16) {
    if (coordinatesAreInMap(x, y)) {
      $wr(grid.a[grid.o + x], y, true_);
    }
    x = x + G.nbDirs[dir][0] << 16 >> 16;
    y = y + G.nbDirs[dir][1] << 16 >> 16;
  }
  x = ((x - G.nbDirs[dir][0] > 0 ? x - G.nbDirs[dir][0] : 0) > 100 - 20 - 1 - 1 ? 100 - 20 - 1 - 1 : x - G.nbDirs[dir][0] > 0 ? x - G.nbDirs[dir][0] : 0) << 16 >> 16;
  y = ((y - G.nbDirs[dir][1] > 0 ? y - G.nbDirs[dir][1] : 0) > 31 + 3 - 3 - 2 - 1 ? 31 + 3 - 3 - 2 - 1 : y - G.nbDirs[dir][1] > 0 ? y - G.nbDirs[dir][1] : 0) << 16 >> 16;
  allowObliqueHallwayExit = rand_percent(15);
  for (dir2 = 0; 4 > dir2; ++dir2) {
    newX = x + G.nbDirs[dir2][0] << 16 >> 16;
    newY = y + G.nbDirs[dir2][1] << 16 >> 16;
    if (dir2 !== dir && !allowObliqueHallwayExit || !coordinatesAreInMap(newX, newY) || $rd(grid.a[grid.o + newX], newY)) {
      $sadd(doorSites, dir2).$cp(struct_pos.$of(-1, -1));
    } else {
      $sadd(doorSites, dir2).$cp(struct_pos.$of(newX, newY));
    }
  }
}

function designRandomRoom(grid: Ptr | null, attachHallway: number, doorSites: struct_pos | null, roomTypeFrequencies: Ptr | null): void {
  let randIndex = 0;
  let i = 0;
  let sum = 0;
  let dir = 0;
  sum = 0;
  for (i = 0; ROOM_TYPE_COUNT > i; i = i + 1 << 16 >> 16) {
    sum = sum + roomTypeFrequencies.a[roomTypeFrequencies.o + i] << 16 >> 16;
  }
  randIndex = rand_range(0, sum - 1) << 16 >> 16;
  for (i = 0; ROOM_TYPE_COUNT > i; i = i + 1 << 16 >> 16) {
    if (roomTypeFrequencies.a[roomTypeFrequencies.o + i] > randIndex) {
      break;
    } else {
      randIndex = randIndex - roomTypeFrequencies.a[roomTypeFrequencies.o + i] << 16 >> 16;
    }
  }
  switch (i) {
  case 0:
    designCrossRoom(grid);
    break;
  case 1:
    designSymmetricalCrossRoom(grid);
    break;
  case 2:
    designSmallRoom(grid);
    break;
  case 3:
    designCircularRoom(grid);
    break;
  case 4:
    designChunkyRoom(grid);
    break;
  case 5:
    switch (rand_range(0, 2)) {
    case 0:
      designCavern(grid, 3, 12, 4, 8);
      break;
    case 1:
      designCavern(grid, 3, 12, 15, DROWS - 2);
      break;
    case 2:
      designCavern(grid, 20, DROWS - 2, 4, 8);
      break;
    default:
      break;
    }
    break;
  case 6:
    designCavern(grid, CAVE_MIN_WIDTH, DCOLS - 2, CAVE_MIN_HEIGHT, DROWS - 2);
    break;
  case 7:
    designEntranceRoom(grid);
    break;
  default:
    break;
  }
  if (doorSites) {
    chooseRandomDoorSites(grid, doorSites);
    if (attachHallway) {
      dir = rand_range(0, 3) | 0;
      for (i = 0; $sadd(doorSites, dir).x === -1 && 3 > i; i = i + 1 << 16 >> 16) {
        dir = (dir + 1) % 4;
      }
      attachHallwayTo(grid, doorSites);
    }
  }
}

function roomFitsAt(dungeonMap: Ptr | null, roomMap: Ptr | null, roomToDungeonX: number, roomToDungeonY: number): number {
  let xRoom = 0;
  let yRoom = 0;
  let xDungeon = 0;
  let yDungeon = 0;
  let i = 0;
  let j = 0;
  for (xRoom = 0; DCOLS > xRoom; xRoom = xRoom + 1 << 16 >> 16) {
    for (yRoom = 0; DROWS > yRoom; yRoom = yRoom + 1 << 16 >> 16) {
      if ($rd(roomMap.a[roomMap.o + xRoom], yRoom)) {
        xDungeon = xRoom + roomToDungeonX << 16 >> 16;
        yDungeon = yRoom + roomToDungeonY << 16 >> 16;
        for (i = xDungeon - 1 << 16 >> 16; xDungeon + 1 >= i; i = i + 1 << 16 >> 16) {
          for (j = yDungeon - 1 << 16 >> 16; yDungeon + 1 >= j; j = j + 1 << 16 >> 16) {
            if (!coordinatesAreInMap(i, j) || $rd(dungeonMap.a[dungeonMap.o + i], j) > 0) {
              return false_;
            }
          }
        }
      }
    }
  }
  return true_;
}

export async function attachRooms(grid: Ptr | null, theDP: struct_dungeonProfile | null, attempts: number, maxRoomCount: number): Promise<void> {
  let roomsBuilt = 0;
  let roomsAttempted = 0;
  let roomMap = null;
  let doorSites = $sarr(struct_pos, 4);
  let i = 0;
  let x = 0;
  let y = 0;
  let sCoord = new Int16Array(2291);
  let dir = 0;
  let oppDir = 0;
  fillSequentialList(P(sCoord), Math.imul(DCOLS, DROWS));
  shuffleList(P(sCoord), Math.imul(DCOLS, DROWS));
  roomMap = allocGrid();
  for (roomsBuilt = roomsAttempted = 0; maxRoomCount > roomsBuilt && attempts > roomsAttempted; roomsAttempted = roomsAttempted + 1 << 16 >> 16) {
    fillGrid(roomMap, 0);
    designRandomRoom(roomMap, (attempts - 5 >= roomsAttempted && rand_percent(theDP.corridorChance) ? 1 : 0) << 24 >> 24, doorSites[0], P(theDP.roomFrequencies));
    if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
      colorOverDungeon(G.darkGray);
      hiliteGrid(roomMap, G.blue, 100);
      if (doorSites[0].x !== -1) {
        plotCharWithColor(94, mapToWindow(doorSites[0]), G.black, G.green);
      }
      if (doorSites[1].x !== -1) {
        plotCharWithColor(118, mapToWindow(doorSites[1]), G.black, G.green);
      }
      if (doorSites[2].x !== -1) {
        plotCharWithColor(60, mapToWindow(doorSites[2]), G.black, G.green);
      }
      if (doorSites[3].x !== -1) {
        plotCharWithColor(62, mapToWindow(doorSites[3]), G.black, G.green);
      }
      await temporaryMessage(S("Generating this room:"), REQUIRE_ACKNOWLEDGMENT);
    }
    for (i = 0; Math.imul(DCOLS, DROWS) > i; i = i + 1 << 16 >> 16) {
      x = (sCoord[i] / DROWS | 0) << 16 >> 16;
      y = sCoord[i] % DROWS << 16 >> 16;
      dir = directionOfDoorSite(grid, x, y);
      oppDir = oppositeDirection(dir << 16 >> 16);
      if (dir !== NO_DIRECTION && doorSites[oppDir].x !== -1 && roomFitsAt(grid, roomMap, x - doorSites[oppDir].x << 16 >> 16, y - doorSites[oppDir].y << 16 >> 16)) {
        if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
          colorOverDungeon(G.darkGray);
          hiliteGrid(grid, G.white, 100);
        }
        insertRoomAt(grid, roomMap, x - doorSites[oppDir].x << 16 >> 16, y - doorSites[oppDir].y << 16 >> 16, doorSites[oppDir].x, doorSites[oppDir].y);
        $wr(grid.a[grid.o + x], y, 2);
        if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
          hiliteGrid(grid, G.green, 50);
          await temporaryMessage(S("Added room."), REQUIRE_ACKNOWLEDGMENT);
        }
        roomsBuilt = roomsBuilt + 1 << 16 >> 16;
        break;
      }
    }
  }
  freeGrid(roomMap);
}

function adjustDungeonProfileForDepth(theProfile: struct_dungeonProfile | null): void {
  let descentPercent = (((100 * (G.rogue.depthLevel - 1) / (G.gameConst.amuletLevel - 1) | 0) > 0 ? 100 * (G.rogue.depthLevel - 1) / (G.gameConst.amuletLevel - 1) | 0 : 0) > 100 ? 100 : (100 * (G.rogue.depthLevel - 1) / (G.gameConst.amuletLevel - 1) | 0) > 0 ? 100 * (G.rogue.depthLevel - 1) / (G.gameConst.amuletLevel - 1) | 0 : 0) << 16 >> 16;
  theProfile.roomFrequencies[0] += 20 * (100 - descentPercent) / 100 | 0;
  theProfile.roomFrequencies[1] += 10 * (100 - descentPercent) / 100 | 0;
  theProfile.roomFrequencies[3] += 7 * (100 - descentPercent) / 100 | 0;
  theProfile.roomFrequencies[5] += 10 * descentPercent / 100 | 0;
  theProfile.corridorChance = theProfile.corridorChance + (80 * (100 - descentPercent) / 100 | 0) << 16 >> 16;
}

function adjustDungeonFirstRoomProfileForDepth(theProfile: struct_dungeonProfile | null): void {
  let i = 0;
  let descentPercent = (((100 * (G.rogue.depthLevel - 1) / (G.gameConst.amuletLevel - 1) | 0) > 0 ? 100 * (G.rogue.depthLevel - 1) / (G.gameConst.amuletLevel - 1) | 0 : 0) > 100 ? 100 : (100 * (G.rogue.depthLevel - 1) / (G.gameConst.amuletLevel - 1) | 0) > 0 ? 100 * (G.rogue.depthLevel - 1) / (G.gameConst.amuletLevel - 1) | 0 : 0) << 16 >> 16;
  if (G.rogue.depthLevel === 1) {
    for (i = 0; ROOM_TYPE_COUNT > i; i = i + 1 << 16 >> 16) {
      theProfile.roomFrequencies[i] = 0;
    }
    theProfile.roomFrequencies[7] = 1;
  } else {
    theProfile.roomFrequencies[6] += 50 * descentPercent / 100 | 0;
  }
}

async function carveDungeon(grid: Ptr | null): Promise<void> {
  let theDP = new struct_dungeonProfile();
  let theFirstRoomDP = new struct_dungeonProfile();
  theDP.$cp(G.dungeonProfileCatalog[DP_BASIC]);
  adjustDungeonProfileForDepth(theDP);
  theFirstRoomDP.$cp(G.dungeonProfileCatalog[DP_BASIC_FIRST_ROOM]);
  adjustDungeonFirstRoomProfileForDepth(theFirstRoomDP);
  designRandomRoom(grid, false_, null, P(theFirstRoomDP.roomFrequencies));
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    colorOverDungeon(G.darkGray);
    hiliteGrid(grid, G.white, 100);
    await temporaryMessage(S("First room placed:"), REQUIRE_ACKNOWLEDGMENT);
  }
  await attachRooms(grid, theDP, 35, 35);
}

function finishWalls(includingDiagonals: number): void {
  let i = 0;
  let j = 0;
  let x1 = 0;
  let y1 = 0;
  let foundExposure = 0;
  let dir = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 === GRANITE) {
        foundExposure = false_;
        for (dir = 0; (includingDiagonals ? 8 : 4) > dir && !foundExposure; ++dir) {
          x1 = i + G.nbDirs[dir][0] << 16 >> 16;
          y1 = j + G.nbDirs[dir][1] << 16 >> 16;
          if (coordinatesAreInMap(x1, y1) && (!cellHasTerrainFlag(struct_pos.$of(x1, y1), T_OBSTRUCTS_VISION) || !cellHasTerrainFlag(struct_pos.$of(x1, y1), T_OBSTRUCTS_PASSABILITY))) {
            $at2(G.pmap, i, j).layers[DUNGEON] = WALL;
            foundExposure = true_;
          }
        }
      } else if ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 === WALL) {
        foundExposure = false_;
        for (dir = 0; (includingDiagonals ? 8 : 4) > dir && !foundExposure; ++dir) {
          x1 = i + G.nbDirs[dir][0] << 16 >> 16;
          y1 = j + G.nbDirs[dir][1] << 16 >> 16;
          if (coordinatesAreInMap(x1, y1) && (!cellHasTerrainFlag(struct_pos.$of(x1, y1), T_OBSTRUCTS_VISION) || !cellHasTerrainFlag(struct_pos.$of(x1, y1), T_OBSTRUCTS_PASSABILITY))) {
            foundExposure = true_;
          }
        }
        if (foundExposure === false_) {
          $at2(G.pmap, i, j).layers[DUNGEON] = GRANITE;
        }
      }
    }
  }
}

function liquidType(deep: Ptr | null, shallow: Ptr | null, shallowWidth: Ptr | null): void {
  let randMin = 0;
  let randMax = 0;
  let rand = 0;
  randMin = (G.gameConst.minimumLavaLevel > G.rogue.depthLevel ? 1 : 0) << 16 >> 16;
  randMax = (G.gameConst.minimumBrimstoneLevel > G.rogue.depthLevel ? 2 : 3) << 16 >> 16;
  rand = rand_range(randMin, randMax) << 16 >> 16;
  if (G.rogue.depthLevel === G.gameConst.deepestLevel) {
    rand = 1;
  }
  switch (rand) {
  case 0:
    deep.a[deep.o] = LAVA;
    shallow.a[shallow.o] = NOTHING;
    shallowWidth.a[shallowWidth.o] = 0;
    break;
  case 1:
    deep.a[deep.o] = DEEP_WATER;
    shallow.a[shallow.o] = SHALLOW_WATER;
    shallowWidth.a[shallowWidth.o] = 2;
    break;
  case 2:
    deep.a[deep.o] = CHASM;
    shallow.a[shallow.o] = CHASM_EDGE;
    shallowWidth.a[shallowWidth.o] = 1;
    break;
  case 3:
    deep.a[deep.o] = INERT_BRIMSTONE;
    shallow.a[shallow.o] = OBSIDIAN;
    shallowWidth.a[shallowWidth.o] = 2;
    break;
  }
}

function fillLake(x: number, y: number, liquid: number, scanWidth: number, wreathMap: Ptr | null, unfilledLakeMap: Ptr | null): void {
  let i = 0;
  let j = 0;
  for (i = x - scanWidth << 16 >> 16; x + scanWidth >= i; i = i + 1 << 16 >> 16) {
    for (j = y - scanWidth << 16 >> 16; y + scanWidth >= j; j = j + 1 << 16 >> 16) {
      if (coordinatesAreInMap(i, j) && $rd(unfilledLakeMap.a[unfilledLakeMap.o + i], j)) {
        $wr(unfilledLakeMap.a[unfilledLakeMap.o + i], j, false_);
        $at2(G.pmap, i, j).layers[LIQUID] = liquid;
        wreathMap.a[wreathMap.o + i][j] = 1;
        fillLake(i, j, liquid, scanWidth, wreathMap, unfilledLakeMap);
      }
    }
  }
}

function lakeFloodFill(x: number, y: number, floodMap: Ptr | null, grid: Ptr | null, lakeMap: Ptr | null, dungeonToGridX: number, dungeonToGridY: number): void {
  let newX = 0;
  let newY = 0;
  let dir = 0;
  $wr(floodMap.a[floodMap.o + x], y, true_);
  for (dir = 0; 4 > dir; ++dir) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY) && !$rd(floodMap.a[floodMap.o + newX], newY) && (!cellHasTerrainFlag(struct_pos.$of(newX, newY), T_PATHING_BLOCKER) || cellHasTMFlag(struct_pos.$of(newX, newY), TM_CONNECTS_LEVEL)) && !$rd(lakeMap.a[lakeMap.o + newX], newY) && (!coordinatesAreInMap(newX + dungeonToGridX << 16 >> 16, newY + dungeonToGridY << 16 >> 16) || !$rd(grid.a[grid.o + (newX + dungeonToGridX)], (newY + dungeonToGridY)))) {
      lakeFloodFill(newX, newY, floodMap, grid, lakeMap, dungeonToGridX, dungeonToGridY);
    }
  }
}

function lakeDisruptsPassability(grid: Ptr | null, lakeMap: Ptr | null, dungeonToGridX: number, dungeonToGridY: number): number {
  let result = 0;
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let floodMap = null;
  floodMap = allocGrid();
  fillGrid(floodMap, 0);
  x = y = -1;
  for (i = 0; DCOLS > i && x === -1; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j && x === -1; j = j + 1 << 16 >> 16) {
      if (!cellHasTerrainFlag(struct_pos.$of(i, j), T_PATHING_BLOCKER) && !$rd(lakeMap.a[lakeMap.o + i], j) && (!coordinatesAreInMap(i + dungeonToGridX << 16 >> 16, j + dungeonToGridY << 16 >> 16) || !$rd(grid.a[grid.o + (i + dungeonToGridX)], (j + dungeonToGridY)))) {
        x = i;
        y = j;
      }
    }
  }
  ;
  lakeFloodFill(x, y, floodMap, grid, lakeMap, dungeonToGridX, dungeonToGridY);
  result = false_;
  for (i = 0; DCOLS > i && result === false_; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j && result === false_; j = j + 1 << 16 >> 16) {
      if (!cellHasTerrainFlag(struct_pos.$of(i, j), T_PATHING_BLOCKER) && !$rd(lakeMap.a[lakeMap.o + i], j) && !$rd(floodMap.a[floodMap.o + i], j) && (!coordinatesAreInMap(i + dungeonToGridX << 16 >> 16, j + dungeonToGridY << 16 >> 16) || !$rd(grid.a[grid.o + (i + dungeonToGridX)], (j + dungeonToGridY)))) {
        result = true_;
      }
    }
  }
  freeGrid(floodMap);
  return result;
}

async function designLakes(lakeMap: Ptr | null): Promise<void> {
  let i = 0;
  let j = 0;
  let k = 0;
  let x = 0;
  let y = 0;
  let lakeMaxHeight = 0;
  let lakeMaxWidth = 0;
  const lakeX = new Int16Array(1);
  const lakeY = new Int16Array(1);
  const lakeWidth = new Int16Array(1);
  const lakeHeight = new Int16Array(1);
  let grid = null;
  grid = allocGrid();
  fillGrid(lakeMap, 0);
  for (lakeMaxHeight = 15, lakeMaxWidth = 30; lakeMaxHeight >= 10; lakeMaxHeight = lakeMaxHeight - 1 << 16 >> 16, lakeMaxWidth = lakeMaxWidth - 2 << 16 >> 16) {
    fillGrid(grid, 0);
    createBlobOnGrid(grid, P(lakeX, 0), P(lakeY, 0), P(lakeWidth, 0), P(lakeHeight, 0), 5, 4, 4, lakeMaxWidth, lakeMaxHeight, 55, S("ffffftttt"), S("ffffttttt"));
    for (k = 0; 20 > k; k = k + 1 << 16 >> 16) {
      x = rand_range(1 - lakeX[0], DCOLS - lakeWidth[0] - lakeX[0] - 2) << 16 >> 16;
      y = rand_range(1 - lakeY[0], DROWS - lakeHeight[0] - lakeY[0] - 2) << 16 >> 16;
      if (!lakeDisruptsPassability(grid, lakeMap, -x << 16 >> 16, -y << 16 >> 16)) {
        for (i = 0; lakeWidth[0] > i; i = i + 1 << 16 >> 16) {
          for (j = 0; lakeHeight[0] > j; j = j + 1 << 16 >> 16) {
            if ($rd(grid.a[grid.o + (i + lakeX[0])], (j + lakeY[0]))) {
              $wr(lakeMap.a[lakeMap.o + (i + lakeX[0] + x)], (j + lakeY[0] + y), true_);
              $at2(G.pmap, i + lakeX[0] + x, j + lakeY[0] + y).layers[DUNGEON] = FLOOR;
            }
          }
        }
        if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
          await dumpLevelToScreen();
          hiliteGrid(lakeMap, G.white, 50);
          await temporaryMessage(S("Added a lake location."), REQUIRE_ACKNOWLEDGMENT);
        }
        break;
      }
    }
  }
  freeGrid(grid);
}

function createWreath(shallowLiquid: number, wreathWidth: number, wreathMap: Ptr | null): void {
  let i = 0;
  let j = 0;
  let k = 0;
  let l = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (wreathMap.a[wreathMap.o + i][j]) {
        for (k = i - wreathWidth << 16 >> 16; i + wreathWidth >= k; k = k + 1 << 16 >> 16) {
          for (l = j - wreathWidth << 16 >> 16; j + wreathWidth >= l; l = l + 1 << 16 >> 16) {
            if (coordinatesAreInMap(k, l) && $at2(G.pmap, k, l).layers[LIQUID] >>> 0 === NOTHING && Math.imul(wreathWidth, wreathWidth) >= Math.imul(i - k, i - k) + Math.imul(j - l, j - l)) {
              $at2(G.pmap, k, l).layers[LIQUID] = shallowLiquid;
              if ($at2(G.pmap, k, l).layers[DUNGEON] >>> 0 === DOOR) {
                $at2(G.pmap, k, l).layers[DUNGEON] = FLOOR;
              }
            }
          }
        }
      }
    }
  }
}

async function fillLakes(lakeMap: Ptr | null): Promise<void> {
  const deepLiquid = new Int16Array(1);
  deepLiquid[0] = CRYSTAL_WALL;
  const shallowLiquid = new Int16Array(1);
  shallowLiquid[0] = CRYSTAL_WALL;
  const shallowLiquidWidth = new Int16Array(1);
  shallowLiquidWidth[0] = 0;
  let wreathMap = $arr(79, () => new Int8Array(29));
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(lakeMap.a[lakeMap.o + i], j)) {
        liquidType(P(deepLiquid, 0), P(shallowLiquid, 0), P(shallowLiquidWidth, 0));
        zeroOutGrid(P(wreathMap));
        fillLake(i, j, deepLiquid[0], 4, P(wreathMap), lakeMap);
        createWreath(shallowLiquid[0], shallowLiquidWidth[0], P(wreathMap));
        if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
          await dumpLevelToScreen();
          hiliteGrid(lakeMap, G.white, 75);
          await temporaryMessage(S("Lake filled."), REQUIRE_ACKNOWLEDGMENT);
        }
      }
    }
  }
}

function finishDoors(): void {
  let i = 0;
  let j = 0;
  let secretDoorChance = ((((G.rogue.depthLevel - 1) * 67 / (G.gameConst.amuletLevel - 1) | 0) > 0 ? (G.rogue.depthLevel - 1) * 67 / (G.gameConst.amuletLevel - 1) | 0 : 0) > 67 ? 67 : ((G.rogue.depthLevel - 1) * 67 / (G.gameConst.amuletLevel - 1) | 0) > 0 ? (G.rogue.depthLevel - 1) * 67 / (G.gameConst.amuletLevel - 1) | 0 : 0) << 16 >> 16;
  for (i = 1; DCOLS - 1 > i; i = i + 1 << 16 >> 16) {
    for (j = 1; DROWS - 1 > j; j = j + 1 << 16 >> 16) {
      if ($at2(G.pmap, i, j).layers[DUNGEON] >>> 0 === DOOR && $at2(G.pmap, i, j).machineNumber === 0) {
        if ((!cellHasTerrainFlag(struct_pos.$of(i + 1 << 16 >> 16, j), T_OBSTRUCTS_PASSABILITY) || !cellHasTerrainFlag(struct_pos.$of(i - 1 << 16 >> 16, j), T_OBSTRUCTS_PASSABILITY)) && (!cellHasTerrainFlag(struct_pos.$of(i, j + 1 << 16 >> 16), T_OBSTRUCTS_PASSABILITY) || !cellHasTerrainFlag(struct_pos.$of(i, j - 1 << 16 >> 16), T_OBSTRUCTS_PASSABILITY))) {
          $at2(G.pmap, i, j).layers[DUNGEON] = FLOOR;
        } else if ((cellHasTerrainFlag(struct_pos.$of(i + 1 << 16 >> 16, j), T_PATHING_BLOCKER) ? 1 : 0) + (cellHasTerrainFlag(struct_pos.$of(i - 1 << 16 >> 16, j), T_PATHING_BLOCKER) ? 1 : 0) + (cellHasTerrainFlag(struct_pos.$of(i, j + 1 << 16 >> 16), T_PATHING_BLOCKER) ? 1 : 0) + (cellHasTerrainFlag(struct_pos.$of(i, j - 1 << 16 >> 16), T_PATHING_BLOCKER) ? 1 : 0) >= 3) {
          $at2(G.pmap, i, j).layers[DUNGEON] = FLOOR;
        } else if (rand_percent(secretDoorChance)) {
          $at2(G.pmap, i, j).layers[DUNGEON] = SECRET_DOOR;
        }
      }
    }
  }
}

function clearLevel(): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      $at2(G.pmap, i, j).layers[DUNGEON] = GRANITE;
      $at2(G.pmap, i, j).layers[LIQUID] = NOTHING;
      $at2(G.pmap, i, j).layers[GAS] = NOTHING;
      $at2(G.pmap, i, j).layers[SURFACE] = NOTHING;
      $at2(G.pmap, i, j).machineNumber = 0;
      $at2(G.pmap, i, j).rememberedTerrain = NOTHING;
      $at2(G.pmap, i, j).rememberedTerrainFlags = T_OBSTRUCTS_EVERYTHING;
      $at2(G.pmap, i, j).rememberedTMFlags = 0;
      $at2(G.pmap, i, j).rememberedCellFlags = 0;
      $at2(G.pmap, i, j).rememberedItemCategory = 0;
      $at2(G.pmap, i, j).rememberedItemKind = 0;
      $at2(G.pmap, i, j).rememberedItemQuantity = 0;
      $at2(G.pmap, i, j).rememberedItemOriginDepth = 0;
      $at2(G.pmap, i, j).flags = 0;
      $at2(G.pmap, i, j).volume = 0;
    }
  }
}

function buildABridge(): number {
  let i = 0;
  let j = 0;
  let k = 0;
  let l = 0;
  let i2 = 0;
  let j2 = 0;
  let nCols = new Int16Array(79);
  let nRows = new Int16Array(29);
  let bridgeRatioX = 0;
  let bridgeRatioY = 0;
  let foundExposure = 0;
  bridgeRatioX = 100 + Math.trunc($mul64(100 + (Math.imul(100 * G.rogue.depthLevel, G.gameConst.depthAccelerator) / 9 | 0), rand_range(10, 20)) / 10) << 16 >> 16;
  bridgeRatioY = 100 + Math.trunc($mul64(400 + (Math.imul(100 * G.rogue.depthLevel, G.gameConst.depthAccelerator) / 18 | 0), rand_range(10, 20)) / 10) << 16 >> 16;
  fillSequentialList(P(nCols), DCOLS);
  shuffleList(P(nCols), DCOLS);
  fillSequentialList(P(nRows), DROWS);
  shuffleList(P(nRows), DROWS);
  for (i2 = 1; DCOLS - 1 > i2; i2 = i2 + 1 << 16 >> 16) {
    i = nCols[i2];
    for (j2 = 1; DROWS - 1 > j2; j2 = j2 + 1 << 16 >> 16) {
      j = nRows[j2];
      if (!cellHasTerrainFlag(struct_pos.$of(i, j), T_CAN_BE_BRIDGED | T_PATHING_BLOCKER) && !$at2(G.pmap, i, j).machineNumber) {
        foundExposure = false_;
        for (k = i + 1 << 16 >> 16; DCOLS > k && !$at2(G.pmap, k, j).machineNumber && cellHasTerrainFlag(struct_pos.$of(k, j), T_CAN_BE_BRIDGED) && !cellHasTMFlag(struct_pos.$of(k, j), TM_IS_SECRET) && !cellHasTerrainFlag(struct_pos.$of(k, j), T_OBSTRUCTS_PASSABILITY) && cellHasTerrainFlag(struct_pos.$of(k, j - 1 << 16 >> 16), T_CAN_BE_BRIDGED | T_OBSTRUCTS_PASSABILITY) && cellHasTerrainFlag(struct_pos.$of(k, j + 1 << 16 >> 16), T_CAN_BE_BRIDGED | T_OBSTRUCTS_PASSABILITY); k = k + 1 << 16 >> 16) {
          if (!cellHasTerrainFlag(struct_pos.$of(k, j - 1 << 16 >> 16), T_OBSTRUCTS_PASSABILITY) && !cellHasTerrainFlag(struct_pos.$of(k, j + 1 << 16 >> 16), T_OBSTRUCTS_PASSABILITY)) {
            foundExposure = true_;
          }
        }
        if (DCOLS > k && k - i > 3 && foundExposure && !cellHasTerrainFlag(struct_pos.$of(k, j), T_PATHING_BLOCKER | T_CAN_BE_BRIDGED) && !$at2(G.pmap, k, j).machineNumber && (100 * pathingDistance(i, j, k, j, T_PATHING_BLOCKER) / (k - i) | 0) > bridgeRatioX) {
          for (l = i + 1 << 16 >> 16; k > l; l = l + 1 << 16 >> 16) {
            $at2(G.pmap, l, j).layers[LIQUID] = BRIDGE;
          }
          $at2(G.pmap, i, j).layers[SURFACE] = BRIDGE_EDGE;
          $at2(G.pmap, k, j).layers[SURFACE] = BRIDGE_EDGE;
          return true_;
        }
        foundExposure = false_;
        for (k = j + 1 << 16 >> 16; DROWS > k && !$at2(G.pmap, i, k).machineNumber && cellHasTerrainFlag(struct_pos.$of(i, k), T_CAN_BE_BRIDGED) && !cellHasTMFlag(struct_pos.$of(i, k), TM_IS_SECRET) && !cellHasTerrainFlag(struct_pos.$of(i, k), T_OBSTRUCTS_PASSABILITY) && cellHasTerrainFlag(struct_pos.$of(i - 1 << 16 >> 16, k), T_CAN_BE_BRIDGED | T_OBSTRUCTS_PASSABILITY) && cellHasTerrainFlag(struct_pos.$of(i + 1 << 16 >> 16, k), T_CAN_BE_BRIDGED | T_OBSTRUCTS_PASSABILITY); k = k + 1 << 16 >> 16) {
          if (!cellHasTerrainFlag(struct_pos.$of(i - 1 << 16 >> 16, k), T_OBSTRUCTS_PASSABILITY) && !cellHasTerrainFlag(struct_pos.$of(i + 1 << 16 >> 16, k), T_OBSTRUCTS_PASSABILITY)) {
            foundExposure = true_;
          }
        }
        if (DROWS > k && k - j > 3 && foundExposure && !cellHasTerrainFlag(struct_pos.$of(i, k), T_PATHING_BLOCKER | T_CAN_BE_BRIDGED) && !$at2(G.pmap, i, k).machineNumber && (100 * pathingDistance(i, j, i, k, T_PATHING_BLOCKER) / (k - j) | 0) > bridgeRatioY) {
          for (l = j + 1 << 16 >> 16; k > l; l = l + 1 << 16 >> 16) {
            $at2(G.pmap, i, l).layers[LIQUID] = BRIDGE;
          }
          $at2(G.pmap, i, j).layers[SURFACE] = BRIDGE_EDGE;
          $at2(G.pmap, i, k).layers[SURFACE] = BRIDGE_EDGE;
          return true_;
        }
      }
    }
  }
  return false_;
}

export async function digDungeon(): Promise<void> {
  let i = 0;
  let j = 0;
  let grid = null;
  G.rogue.machineNumber = 0;
  G.topBlobMinX = G.topBlobMinY = G.blobWidth = G.blobHeight = 0;
  clearLevel();
  grid = allocGrid();
  await carveDungeon(grid);
  await addLoops(grid, 20);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) === 1) {
        $at2(G.pmap, i, j).layers[DUNGEON] = FLOOR;
      } else if ($rd(grid.a[grid.o + i], j) === 2) {
        $at2(G.pmap, i, j).layers[DUNGEON] = rand_percent(60) && G.gameConst.deepestLevel > G.rogue.depthLevel ? DOOR : FLOOR;
      }
    }
  }
  freeGrid(grid);
  finishWalls(false_);
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await dumpLevelToScreen();
    await temporaryMessage(S("Carved into the granite:"), REQUIRE_ACKNOWLEDGMENT);
  }
  let lakeMap = allocGrid();
  await designLakes(lakeMap);
  await fillLakes(lakeMap);
  freeGrid(lakeMap);
  await runAutogenerators(false_);
  removeDiagonalOpenings();
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await dumpLevelToScreen();
    await temporaryMessage(S("Diagonal openings removed."), REQUIRE_ACKNOWLEDGMENT);
  }
  await addMachines();
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await dumpLevelToScreen();
    await temporaryMessage(S("Machines added."), REQUIRE_ACKNOWLEDGMENT);
  }
  await runAutogenerators(true_);
  cleanUpLakeBoundaries();
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await dumpLevelToScreen();
    await temporaryMessage(S("Lake boundaries cleaned up."), REQUIRE_ACKNOWLEDGMENT);
  }
  while (buildABridge()) {
    ;
  }
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await dumpLevelToScreen();
    await temporaryMessage(S("Bridges added."), REQUIRE_ACKNOWLEDGMENT);
  }
  finishDoors();
  finishWalls(true_);
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await dumpLevelToScreen();
    await temporaryMessage(S("Finishing touches added. Level has been generated."), REQUIRE_ACKNOWLEDGMENT);
  }
}

export function updateMapToShore(): void {
  let i = 0;
  let j = 0;
  let costMap = null;
  G.rogue.updatedMapToShoreThisTurn = true_;
  costMap = allocGrid();
  if (!G.rogue.mapToShore) {
    G.rogue.mapToShore = allocGrid();
    fillGrid(G.rogue.mapToShore, 0);
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_PASSABILITY)) {
        $wr(costMap.a[costMap.o + i], j, (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_DIAGONAL_MOVEMENT) ? PDS_OBSTRUCTION : PDS_FORBIDDEN) << 16 >> 16);
        $wr(G.rogue.mapToShore.a[G.rogue.mapToShore.o + i], j, 30000);
      } else {
        $wr(costMap.a[costMap.o + i], j, 1);
        $wr(G.rogue.mapToShore.a[G.rogue.mapToShore.o + i], j, (cellHasTerrainFlag(struct_pos.$of(i, j), T_LAVA_INSTA_DEATH | T_IS_DEEP_WATER | T_AUTO_DESCENT) && !cellHasTMFlag(struct_pos.$of(i, j), TM_IS_SECRET) ? 30000 : 0) << 16 >> 16);
      }
    }
  }
  dijkstraScan(G.rogue.mapToShore, costMap, true_);
  freeGrid(costMap);
}

export function refreshWaypoint(wpIndex: number): void {
  let costMap = null;
  costMap = allocGrid();
  populateGenericCostMap(costMap);
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    if ((monst.creatureState >>> 0 === MONSTER_SLEEPING || (monst.info.flags & MONST_IMMOBILE) >>> 0 || (monst.bookkeepingFlags & MB_CAPTIVE) >>> 0) && $rd(costMap.a[costMap.o + monst.loc.x], monst.loc.y) >= 0) {
      $wr(costMap.a[costMap.o + monst.loc.x], monst.loc.y, PDS_FORBIDDEN);
    }
  }
  fillGrid(G.rogue.wpDistance[wpIndex], 30000);
  $wr($rd(G.rogue.wpDistance[wpIndex], G.rogue.wpCoordinates[wpIndex].x), G.rogue.wpCoordinates[wpIndex].y, 0);
  dijkstraScan(G.rogue.wpDistance[wpIndex], costMap, true_);
  freeGrid(costMap);
}

export function setUpWaypoints(): void {
  let i = 0;
  let j = 0;
  let sCoord = new Int16Array(2291);
  let x = 0;
  let y = 0;
  let grid = $arr(79, () => new Int8Array(29));
  zeroOutGrid(P(grid));
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_SCENT)) {
        grid[i][j] = 1;
      }
    }
  }
  G.rogue.wpCount = 0;
  G.rogue.wpRefreshTicker = 0;
  fillSequentialList(P(sCoord), Math.imul(DCOLS, DROWS));
  shuffleList(P(sCoord), Math.imul(DCOLS, DROWS));
  for (i = 0; Math.imul(DCOLS, DROWS) > i && MAX_WAYPOINT_COUNT > G.rogue.wpCount; i = i + 1 << 16 >> 16) {
    x = (sCoord[i] / DROWS | 0) << 16 >> 16;
    y = sCoord[i] % DROWS << 16 >> 16;
    if (!grid[x][y]) {
      getFOVMask(P(grid), x, y, 655360, T_OBSTRUCTS_SCENT, 0, false_);
      grid[x][y] = true_;
      G.rogue.wpCoordinates[G.rogue.wpCount].$cp(struct_pos.$of(x, y));
      G.rogue.wpCount = G.rogue.wpCount + 1 << 16 >> 16;
    }
  }
  for (i = 0; G.rogue.wpCount > i; i = i + 1 << 16 >> 16) {
    refreshWaypoint(i);
  }
}

export function zeroOutGrid(grid: Ptr | null): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      grid.a[grid.o + i][j] = 0;
    }
  }
}

export function oppositeDirection(theDir: number): number {
  switch (theDir) {
  case UP:
    return DOWN;
  case DOWN:
    return UP;
  case LEFT:
    return RIGHT;
  case RIGHT:
    return LEFT;
  case UPRIGHT:
    return DOWNLEFT;
  case DOWNLEFT:
    return UPRIGHT;
  case UPLEFT:
    return DOWNRIGHT;
  case DOWNRIGHT:
    return UPLEFT;
  case NO_DIRECTION:
    return NO_DIRECTION;
  default:
    return -1;
  }
}

function connectCell(x: number, y: number, zoneLabel: number, blockingMap: Ptr | null, zoneMap: Ptr | null): number {
  let dir = 0;
  let newX = 0;
  let newY = 0;
  let size = 0;
  zoneMap.a[zoneMap.o + x][y] = zoneLabel << 24 >> 24;
  size = 1;
  for (dir = 0; 4 > dir; ++dir) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY) && zoneMap.a[zoneMap.o + newX][newY] === 0 && (!blockingMap || !blockingMap.a[blockingMap.o + newX][newY]) && cellIsPassableOrDoor(newX, newY)) {
      size = size + connectCell(newX, newY, zoneLabel, blockingMap, zoneMap) << 16 >> 16;
    }
  }
  return size;
}

export function levelIsDisconnectedWithBlockingMap(blockingMap: Ptr | null, countRegionSize: number): number {
  let zoneMap = $arr(79, () => new Int8Array(29));
  let i = 0;
  let j = 0;
  let dir = 0;
  let zoneSizes = new Int16Array(200);
  let zoneCount = 0;
  let smallestQualifyingZoneSize = 0;
  let borderingZone = 0;
  zoneCount = 0;
  smallestQualifyingZoneSize = 10000;
  zeroOutGrid(P(zoneMap));
  for (i = 1; DCOLS - 1 > i; i = i + 1 << 16 >> 16) {
    for (j = 1; DROWS - 1 > j; j = j + 1 << 16 >> 16) {
      if (cellIsPassableOrDoor(i, j) && zoneMap[i][j] === 0 && !blockingMap.a[blockingMap.o + i][j]) {
        for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
          if (blockingMap.a[blockingMap.o + (i + G.nbDirs[dir][0])][j + G.nbDirs[dir][1]]) {
            zoneCount = zoneCount + 1 << 16 >> 16;
            zoneSizes[zoneCount - 1] = connectCell(i, j, zoneCount, blockingMap, P(zoneMap));
            break;
          }
        }
      }
    }
  }
  for (i = 1; DCOLS - 1 > i; i = i + 1 << 16 >> 16) {
    for (j = 1; DROWS - 1 > j; j = j + 1 << 16 >> 16) {
      if (blockingMap.a[blockingMap.o + i][j] && zoneMap[i][j] === 0 && cellIsPassableOrDoor(i, j)) {
        for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
          borderingZone = zoneMap[i + G.nbDirs[dir][0]][j + G.nbDirs[dir][1]];
          if (borderingZone !== 0) {
            connectCell(i, j, borderingZone, null, P(zoneMap));
            break;
          }
        }
      }
    }
  }
  for (i = 1; DCOLS - 1 > i; i = i + 1 << 16 >> 16) {
    for (j = 1; DROWS - 1 > j; j = j + 1 << 16 >> 16) {
      if (zoneMap[i][j] !== 0) {
        for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
          borderingZone = zoneMap[i + G.nbDirs[dir][0]][j + G.nbDirs[dir][1]];
          if (zoneMap[i][j] !== borderingZone && borderingZone !== 0) {
            if (!countRegionSize) {
              return true_;
            }
            smallestQualifyingZoneSize = (zoneSizes[zoneMap[i][j] - 1] > smallestQualifyingZoneSize ? smallestQualifyingZoneSize : zoneSizes[zoneMap[i][j] - 1]) << 16 >> 16;
            smallestQualifyingZoneSize = (zoneSizes[borderingZone - 1] > smallestQualifyingZoneSize ? smallestQualifyingZoneSize : zoneSizes[borderingZone - 1]) << 16 >> 16;
            break;
          }
        }
      }
    }
  }
  return (10000 > smallestQualifyingZoneSize ? smallestQualifyingZoneSize : 0) << 16 >> 16;
}

export function resetDFMessageEligibility(): void {
  let i = 0;
  for (i = 0; NUMBER_DUNGEON_FEATURES > i; i = i + 1 << 16 >> 16) {
    G.dungeonFeatureCatalog[i].messageDisplayed = false_;
  }
}

export async function fillSpawnMap(layer: number, surfaceTileType: number, spawnMap: Ptr | null, blockedByOtherLayers: number, refresh: number, superpriority: number): Promise<number> {
  let $t1: any;
  let i = 0;
  let j = 0;
  let monst = null;
  let theItem = null;
  let accomplishedSomething = 0;
  accomplishedSomething = false_;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if (spawnMap.a[spawnMap.o + i][j] && $at2(G.pmap, i, j).layers[layer] >>> 0 !== surfaceTileType >>> 0 && (superpriority || G.tileCatalog[$at2(G.pmap, i, j).layers[layer]].drawPriority >= G.tileCatalog[surfaceTileType].drawPriority) && !(layer === SURFACE && cellHasTerrainFlag(struct_pos.$of(i, j), T_OBSTRUCTS_SURFACE_EFFECTS)) && (!blockedByOtherLayers || G.tileCatalog[$at2(G.pmap, i, j).layers[highestPriorityLayer(i, j, true_)]].drawPriority >= G.tileCatalog[surfaceTileType].drawPriority)) {
        if ((G.tileCatalog[surfaceTileType].flags & T_IS_FIRE) >>> 0 && !((G.tileCatalog[$at2(G.pmap, i, j).layers[layer]].flags & T_IS_FIRE) >>> 0)) {
          ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags | CAUGHT_FIRE_THIS_TURN) >>> 0);
        }
        if ((G.tileCatalog[$at2(G.pmap, i, j).layers[layer]].flags & T_PATHING_BLOCKER) >>> 0 !== (G.tileCatalog[surfaceTileType].flags & T_PATHING_BLOCKER) >>> 0) {
          G.rogue.staleLoopMap = true_;
        }
        $at2(G.pmap, i, j).layers[layer] = surfaceTileType;
        accomplishedSomething = true_;
        if (refresh) {
          await refreshDungeonCell(struct_pos.$of(i, j));
          if (G.player.loc.x === i && G.player.loc.y === j && !G.player.status[STATUS_LEVITATING] && refresh) {
            flavorMessage(tileFlavor(G.player.loc.x, G.player.loc.y));
          }
          if (($at2(G.pmap, i, j).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
            monst = monsterAtLoc(struct_pos.$of(i, j));
            await applyInstantTileEffectsToCreature(monst);
            if (G.rogue.gameHasEnded) {
              return true_;
            }
          }
          if ((G.tileCatalog[surfaceTileType].flags & T_IS_FIRE) >>> 0) {
            if (($at2(G.pmap, i, j).flags & HAS_ITEM) >>> 0) {
              theItem = await itemAtLoc(struct_pos.$of(i, j));
              if ((theItem.flags & ITEM_FLAMMABLE) >>> 0) {
                await burnItem(theItem);
              }
            }
          }
        }
      } else {
        spawnMap.a[spawnMap.o + i][j] = false_;
      }
    }
  }
  return accomplishedSomething;
}

function spawnMapDF(x: number, y: number, propagationTerrain: number, requirePropTerrain: number, startProb: number, probDec: number, spawnMap: Ptr | null): void {
  let i = 0;
  let j = 0;
  let dir = 0;
  let t = 0;
  let x2 = 0;
  let y2 = 0;
  let madeChange = 0;
  spawnMap.a[spawnMap.o + x][y] = (t = 1) << 24 >> 24;
  madeChange = true_;
  while (madeChange && startProb > 0) {
    madeChange = false_;
    t = t + 1 << 16 >> 16;
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (spawnMap.a[spawnMap.o + i][j] === t - 1) {
          for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
            x2 = i + G.nbDirs[dir][0] << 16 >> 16;
            y2 = j + G.nbDirs[dir][1] << 16 >> 16;
            if (coordinatesAreInMap(x2, y2) && (!requirePropTerrain || propagationTerrain >>> 0 > 0 && cellHasTerrainType(struct_pos.$of(x2, y2), propagationTerrain)) && (!cellHasTerrainFlag(struct_pos.$of(x2, y2), T_OBSTRUCTS_SURFACE_EFFECTS) || propagationTerrain >>> 0 > 0 && cellHasTerrainType(struct_pos.$of(x2, y2), propagationTerrain)) && rand_percent(startProb)) {
              spawnMap.a[spawnMap.o + x2][y2] = t << 24 >> 24;
              madeChange = true_;
            }
          }
        }
      }
    }
    startProb = startProb - probDec << 16 >> 16;
    if (t > 100) {
      for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
        for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
          if (spawnMap.a[spawnMap.o + i][j] === t) {
            spawnMap.a[spawnMap.o + i][j] = 2;
          } else if (spawnMap.a[spawnMap.o + i][j] > 0) {
            spawnMap.a[spawnMap.o + i][j] = 1;
          }
        }
      }
      t = 2;
    }
  }
  if (requirePropTerrain && !cellHasTerrainType(struct_pos.$of(x, y), propagationTerrain)) {
    spawnMap.a[spawnMap.o + x][y] = 0;
  }
}

function evacuateCreatures(blockingMap: Ptr | null): void {
  let $t1: any, $t2: any;
  let monst = null;
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      if (blockingMap.a[blockingMap.o + i][j] && ($at2(G.pmap, i, j).flags & (HAS_MONSTER | HAS_PLAYER)) >>> 0) {
        monst = monsterAtLoc(struct_pos.$of(i << 16 >> 16, j << 16 >> 16));
        let newLoc = new struct_pos();
        getQualifyingLocNear(newLoc, struct_pos.$of(i << 16 >> 16, j << 16 >> 16), true_, blockingMap, forbiddenFlagsForMonster(monst.info), HAS_MONSTER | HAS_PLAYER, false_, false_);
        monst.loc.$cp(newLoc);
        ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags & ~(HAS_MONSTER | HAS_PLAYER) >>> 0) >>> 0);
        ($t2 = pmapAt(newLoc), $t2.flags = ($t2.flags | $u64(monst === G.player ? HAS_PLAYER : HAS_MONSTER)) >>> 0);
      }
    }
  }
}

export async function spawnDungeonFeature(x: number, y: number, feat: struct_dungeonFeature | null, refreshCell: number, abortIfBlocking: number): Promise<number> {
  let $t1: any;
  let i = 0;
  let j = 0;
  let layer = 0;
  let blockingMap = $arr(79, () => new Int8Array(29));
  let blocking = 0;
  let succeeded = 0;
  if ((feat.flags & DFF_RESURRECT_ALLY) >>> 0 && !await resurrectAlly(struct_pos.$of(x, y))) {
    return false_;
  }
  if (feat.description[0] && !feat.messageDisplayed && ($at2(G.pmap, x, y).flags & ANY_KIND_OF_VISIBLE) >>> 0) {
    feat.messageDisplayed = true_;
    await message(P(feat.description), 0);
  }
  zeroOutGrid(P(blockingMap));
  blocking = (abortIfBlocking && !((feat.flags & DFF_PERMIT_BLOCKING) >>> 0) && ((G.tileCatalog[feat.tile].flags & T_PATHING_BLOCKER) >>> 0 || (feat.flags & DFF_TREAT_AS_BLOCKING) >>> 0) ? true_ : false_) << 24 >> 24;
  if (feat.tile) {
    if (feat.layer === GAS) {
      ($t1 = $at2(G.pmap, x, y), $t1.volume = $t1.volume + feat.startProbability & 0xffff);
      $at2(G.pmap, x, y).layers[GAS] = feat.tile;
      if (refreshCell) {
        await refreshDungeonCell(struct_pos.$of(x, y));
      }
      succeeded = true_;
    } else {
      spawnMapDF(x, y, feat.propagationTerrain, (feat.propagationTerrain >>> 0 ? true_ : false_) << 24 >> 24, feat.startProbability, feat.probabilityDecrement, P(blockingMap));
      if (!blocking || !levelIsDisconnectedWithBlockingMap(P(blockingMap), false_)) {
        if ((feat.flags & DFF_EVACUATE_CREATURES_FIRST) >>> 0) {
          evacuateCreatures(P(blockingMap));
        }
        await fillSpawnMap(feat.layer, feat.tile, P(blockingMap), ((feat.flags & DFF_BLOCKED_BY_OTHER_LAYERS) >>> 0) << 24 >> 24, refreshCell, ((feat.flags & DFF_SUPERPRIORITY) >>> 0) << 24 >> 24);
        succeeded = true_;
      } else {
        succeeded = false_;
      }
    }
  } else {
    blockingMap[x][y] = true_;
    succeeded = true_;
    if ((feat.flags & DFF_EVACUATE_CREATURES_FIRST) >>> 0) {
      evacuateCreatures(P(blockingMap));
    }
  }
  if (succeeded && (feat.flags & (DFF_CLEAR_LOWER_PRIORITY_TERRAIN | DFF_CLEAR_OTHER_TERRAIN)) >>> 0) {
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (blockingMap[i][j]) {
          for (layer = 0; NUMBER_TERRAIN_LAYERS > layer; layer = layer + 1 << 16 >> 16) {
            if (layer !== feat.layer && layer !== GAS) {
              if ((feat.flags & DFF_CLEAR_LOWER_PRIORITY_TERRAIN) >>> 0) {
                if (G.tileCatalog[feat.tile].drawPriority >= G.tileCatalog[$at2(G.pmap, i, j).layers[layer]].drawPriority) {
                  continue;
                }
              }
              $at2(G.pmap, i, j).layers[layer] = layer === DUNGEON ? FLOOR : NOTHING;
            }
          }
        }
      }
    }
  }
  if (succeeded) {
    if ((feat.flags & DFF_AGGRAVATES_MONSTERS) >>> 0 && feat.effectRadius) {
      await aggravateMonsters(feat.effectRadius, x, y, G.gray);
    }
    if (refreshCell && feat.flashColor && feat.effectRadius) {
      await colorFlash(feat.flashColor, 0, IN_FIELD_OF_VIEW | CLAIRVOYANT_VISIBLE, 4, feat.effectRadius, x, y);
    }
    if (refreshCell && feat.lightFlare >>> 0) {
      createFlare(x, y, feat.lightFlare);
    }
  }
  if (refreshCell && (G.tileCatalog[feat.tile].flags & (T_IS_FIRE | T_AUTO_DESCENT)) >>> 0 && cellHasTerrainFlag(G.player.loc, T_IS_FIRE | T_AUTO_DESCENT)) {
    await applyInstantTileEffectsToCreature(G.player);
  }
  if (G.rogue.gameHasEnded) {
    return succeeded;
  }
  if (succeeded) {
    if (feat.subsequentDF) {
      if ((feat.flags & DFF_SUBSEQ_EVERYWHERE) >>> 0) {
        for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
          for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
            if (blockingMap[i][j]) {
              await spawnDungeonFeature(i, j, $sat(G.dungeonFeatureCatalog, feat.subsequentDF), refreshCell, abortIfBlocking);
            }
          }
        }
      } else {
        await spawnDungeonFeature(x, y, $sat(G.dungeonFeatureCatalog, feat.subsequentDF), refreshCell, abortIfBlocking);
      }
    }
    if (feat.tile >>> 0 && (G.tileCatalog[feat.tile].flags & (T_IS_DEEP_WATER | T_LAVA_INSTA_DEATH | T_AUTO_DESCENT)) >>> 0) {
      G.rogue.updatedMapToShoreThisTurn = false_;
    }
    if ((feat.flags & DFF_ACTIVATE_DORMANT_MONSTER) >>> 0) {
      for (let it = iterateCreatures(G.dormantMonsters); hasNextCreature(it); ) {
        let monst = nextCreature(it);
        if (monst.loc.x === x && monst.loc.y === y || blockingMap[monst.loc.x][monst.loc.y]) {
          await toggleMonsterDormancy(monst);
        }
      }
    }
  }
  return succeeded;
}

export function restoreMonster(monst: struct_creature | null, mapToStairs: Ptr | null, mapToPit: Ptr | null): void {
  let $t1: any, $t2: any, $t3: any;
  let i = 0;
  let x = null;
  let y = null;
  let turnCount = 0;
  let foundLeader = false_;
  let theMap = null;
  let dir = 0;
  x = P(monst.loc, "x");
  y = P(monst.loc, "y");
  if (monst.status[STATUS_ENTERS_LEVEL_IN] > 0) {
    if ((monst.bookkeepingFlags & MB_APPROACHING_PIT) >>> 0) {
      theMap = mapToPit;
    } else {
      theMap = mapToStairs;
    }
    ($t1 = $at2(G.pmap, x.a[x.o], y.a[y.o]), $t1.flags = ($t1.flags & ~HAS_MONSTER >>> 0) >>> 0);
    if (theMap) {
      turnCount = $rd(theMap.a[theMap.o + monst.loc.x], monst.loc.y) - (monst.status[STATUS_ENTERS_LEVEL_IN] * 100 / monst.movementSpeed | 0) << 16 >> 16;
      for (i = 0; turnCount > i; i = i + 1 << 16 >> 16) {
        if ((dir = nextStep(theMap, monst.loc, null, true_)) !== NO_DIRECTION) {
          monst.loc.x = monst.loc.x + G.nbDirs[dir][0] << 16 >> 16;
          monst.loc.y = monst.loc.y + G.nbDirs[dir][1] << 16 >> 16;
        } else {
          break;
        }
      }
    }
    monst.bookkeepingFlags = (monst.bookkeepingFlags | MB_PREPLACED) >>> 0;
  }
  if (($at2(G.pmap, x.a[x.o], y.a[y.o]).flags & (HAS_PLAYER | HAS_STAIRS)) >>> 0 || (monst.bookkeepingFlags & MB_PREPLACED) >>> 0) {
    if (!((monst.bookkeepingFlags & MB_PREPLACED) >>> 0)) {
      ($t2 = $at2(G.pmap, x.a[x.o], y.a[y.o]), $t2.flags = ($t2.flags & ~HAS_MONSTER >>> 0) >>> 0);
    }
    let qualifiedPosition = getQualifyingPathLocNear(struct_pos.$of(x.a[x.o], y.a[y.o]), true_, (T_DIVIDES_LEVEL & avoidedFlagsForMonster(monst.info)) >>> 0, 0, avoidedFlagsForMonster(monst.info), HAS_MONSTER | HAS_PLAYER | HAS_STAIRS | IS_IN_MACHINE, true_).$clone();
    x.a[x.o] = qualifiedPosition.x;
    y.a[y.o] = qualifiedPosition.y;
  }
  ($t3 = $at2(G.pmap, x.a[x.o], y.a[y.o]), $t3.flags = ($t3.flags | HAS_MONSTER) >>> 0);
  monst.bookkeepingFlags = (monst.bookkeepingFlags & ~(MB_PREPLACED | MB_APPROACHING_DOWNSTAIRS | MB_APPROACHING_UPSTAIRS | MB_APPROACHING_PIT | MB_ABSORBING) >>> 0) >>> 0;
  monst.status[STATUS_ENTERS_LEVEL_IN] = 0;
  monst.corpseAbsorptionCounter = 0;
  if ((monst.bookkeepingFlags & MB_SUBMERGED) >>> 0 && !cellHasTMFlag(struct_pos.$of(x.a[x.o], y.a[y.o]), TM_ALLOWS_SUBMERGING)) {
    monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_SUBMERGED >>> 0) >>> 0;
  }
  if ((monst.bookkeepingFlags & MB_FOLLOWER) >>> 0) {
    for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
      let leader = nextCreature(it);
      if (leader === monst.leader) {
        foundLeader = true_;
        break;
      }
    }
    if (!foundLeader) {
      monst.bookkeepingFlags = (monst.bookkeepingFlags & ~MB_FOLLOWER >>> 0) >>> 0;
      monst.leader = null;
    }
  }
}

export async function restoreItems(): Promise<void> {
  let theItem = null;
  let nextItem = null;
  let loc = new struct_pos();
  let preplaced = new struct_item();
  preplaced.nextItem = null;
  for (theItem = G.floorItems.nextItem; !!theItem; theItem = nextItem) {
    nextItem = theItem.nextItem;
    if ((theItem.flags & ITEM_PREPLACED) >>> 0) {
      theItem.flags = (theItem.flags & ~ITEM_PREPLACED >>> 0) >>> 0;
      removeItemFromChain(theItem, G.floorItems);
      addItemToChain(theItem, preplaced);
    }
  }
  for (theItem = preplaced.nextItem; !!theItem; theItem = nextItem) {
    nextItem = theItem.nextItem;
    getQualifyingLocNear(loc, theItem.loc.$clone(), true_, null, T_OBSTRUCTS_ITEMS, HAS_MONSTER | HAS_ITEM | HAS_STAIRS | IS_IN_MACHINE, false_, false_);
    await placeItemAt(theItem, loc.$clone());
  }
}

function validStairLoc(x: number, y: number): number {
  let newX = 0;
  let newY = 0;
  let dir = 0;
  let neighborWallCount = 0;
  if (1 > x || x >= DCOLS - 1 || 1 > y || y >= DROWS - 1 || $at2(G.pmap, x, y).layers[DUNGEON] >>> 0 !== WALL) {
    return false_;
  }
  for (dir = 0; DIRECTION_COUNT > dir; dir = dir + 1 << 16 >> 16) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    if (($at2(G.pmap, newX, newY).flags & IS_IN_MACHINE) >>> 0) {
      return false_;
    }
  }
  neighborWallCount = 0;
  for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    if (cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY)) {
      neighborWallCount = neighborWallCount + 1 << 16 >> 16;
    } else {
      if (cellHasTerrainFlag(struct_pos.$of(newX, newY), T_PATHING_BLOCKER) || passableArcCount(newX, newY) >= 2) {
        return false_;
      }
      newX = x - G.nbDirs[dir][0] + G.nbDirs[dir][1] << 16 >> 16;
      newY = y - G.nbDirs[dir][1] + G.nbDirs[dir][0] << 16 >> 16;
      if (!cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY)) {
        return false_;
      }
      newX = x - G.nbDirs[dir][0] - G.nbDirs[dir][1] << 16 >> 16;
      newY = y - G.nbDirs[dir][1] - G.nbDirs[dir][0] << 16 >> 16;
      if (!cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY)) {
        return false_;
      }
    }
  }
  if (neighborWallCount !== 3) {
    return false_;
  }
  return true_;
}

function prepareForStairs(x: number, y: number, grid: Ptr | null): void {
  let $t1: any;
  let newX = 0;
  let newY = 0;
  let dir = 0;
  for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
    if (!cellHasTerrainFlag(struct_pos.$of(x + G.nbDirs[dir][0] << 16 >> 16, y + G.nbDirs[dir][1] << 16 >> 16), T_OBSTRUCTS_PASSABILITY)) {
      newX = x - G.nbDirs[dir][1] << 16 >> 16;
      newY = y - G.nbDirs[dir][0] << 16 >> 16;
      $at2(G.pmap, newX, newY).layers[DUNGEON] = TORCH_WALL;
      newX = x + G.nbDirs[dir][1] << 16 >> 16;
      newY = y + G.nbDirs[dir][0] << 16 >> 16;
      $at2(G.pmap, newX, newY).layers[DUNGEON] = TORCH_WALL;
      break;
    }
  }
  for (dir = 0; DIRECTION_COUNT > dir; dir = dir + 1 << 16 >> 16) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    if ($at2(G.pmap, newX, newY).layers[DUNGEON] >>> 0 === GRANITE) {
      $at2(G.pmap, newX, newY).layers[DUNGEON] = WALL;
    }
    if (cellHasTerrainFlag(struct_pos.$of(newX, newY), T_OBSTRUCTS_PASSABILITY)) {
      ($t1 = $at2(G.pmap, newX, newY), $t1.flags = ($t1.flags | IMPREGNABLE) >>> 0);
    }
  }
  for (newX = (0 > x - 5 ? 0 : x - 5) << 16 >> 16; (x + 5 > 100 - 20 - 1 ? 100 - 20 - 1 : x + 5) > newX; newX = newX + 1 << 16 >> 16) {
    for (newY = (0 > y - 5 ? 0 : y - 5) << 16 >> 16; (y + 5 > 31 + 3 - 3 - 2 ? 31 + 3 - 3 - 2 : y + 5) > newY; newY = newY + 1 << 16 >> 16) {
      grid.a[grid.o + newX][newY] = false_;
    }
  }
}

export async function placeStairs(upStairsLoc: struct_pos | null): Promise<number> {
  let $t1: any, $t2: any;
  let grid = $arr(79, () => new Int8Array(29));
  let n = G.rogue.depthLevel - 1 << 16 >> 16;
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      grid[i][j] = validStairLoc(i << 16 >> 16, j << 16 >> 16);
    }
  }
  if (G.rogue.mode >>> 0 === GAME_MODE_WIZARD && 0) {
    await dumpLevelToScreen();
    hiliteCharGrid(P(grid), G.teal, 100);
    await temporaryMessage(S("Stair location candidates:"), REQUIRE_ACKNOWLEDGMENT);
  }
  let downLoc = new struct_pos();
  if (getQualifyingGridLocNear(downLoc, $sadd(G.levels, n).downStairsLoc.$clone(), P(grid), false_)) {
    prepareForStairs(downLoc.x, downLoc.y, P(grid));
  } else {
    let hasQualifyingLoc = getQualifyingLocNear(downLoc, $sadd(G.levels, n).downStairsLoc.$clone(), false_, null, T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_ITEMS | T_AUTO_DESCENT | T_IS_DEEP_WATER | T_LAVA_INSTA_DEATH | T_IS_DF_TRAP, HAS_MONSTER | HAS_ITEM | HAS_STAIRS | IS_IN_MACHINE, true_, false_);
    if (!hasQualifyingLoc) {
      return false_;
    }
  }
  if (G.rogue.depthLevel === G.gameConst.deepestLevel) {
    pmapAt(downLoc).layers[DUNGEON] = DUNGEON_PORTAL;
  } else {
    pmapAt(downLoc).layers[DUNGEON] = DOWN_STAIRS;
  }
  pmapAt(downLoc).layers[LIQUID] = NOTHING;
  pmapAt(downLoc).layers[SURFACE] = NOTHING;
  if (!$sadd(G.levels, (n + 1)).visited) {
    $sadd(G.levels, (n + 1)).upStairsLoc.$cp(downLoc);
  }
  $sadd(G.levels, n).downStairsLoc.$cp(downLoc);
  let upLoc = new struct_pos();
  if (getQualifyingGridLocNear(upLoc, $sadd(G.levels, n).upStairsLoc.$clone(), P(grid), false_)) {
    prepareForStairs(upLoc.x, upLoc.y, P(grid));
  } else {
    let hasQualifyingLoc = 0;
    hasQualifyingLoc = getQualifyingLocNear(upLoc, $sadd(G.levels, n).upStairsLoc.$clone(), false_, null, T_OBSTRUCTS_PASSABILITY | T_OBSTRUCTS_ITEMS | T_AUTO_DESCENT | T_IS_DEEP_WATER | T_LAVA_INSTA_DEATH | T_IS_DF_TRAP, HAS_MONSTER | HAS_ITEM | HAS_STAIRS | IS_IN_MACHINE, true_, false_);
    if (!hasQualifyingLoc) {
      return false_;
    }
  }
  $sadd(G.levels, n).upStairsLoc.$cp(upLoc);
  if (G.rogue.depthLevel === 1) {
    pmapAt(upLoc).layers[DUNGEON] = DUNGEON_EXIT;
  } else {
    pmapAt(upLoc).layers[DUNGEON] = UP_STAIRS;
  }
  pmapAt(upLoc).layers[LIQUID] = NOTHING;
  pmapAt(upLoc).layers[SURFACE] = NOTHING;
  G.rogue.downLoc.$cp(downLoc);
  ($t1 = pmapAt(downLoc), $t1.flags = ($t1.flags | HAS_STAIRS) >>> 0);
  G.rogue.upLoc.$cp(upLoc);
  ($t2 = pmapAt(upLoc), $t2.flags = ($t2.flags | HAS_STAIRS) >>> 0);
  upStairsLoc.$cp(upLoc);
  return true_;
}

export async function initializeLevel(upStairsLoc: struct_pos): Promise<void> {
  let $t1: any;
  let i = 0;
  let j = 0;
  let dir = 0;
  let mapToStairs = null;
  let mapToPit = null;
  let grid = $arr(79, () => new Int8Array(29));
  let upLoc = upStairsLoc.$clone();
  if (!$sadd(G.levels, (G.rogue.depthLevel - 1)).visited) {
    for (dir = 0; 4 > dir; dir = dir + 1 << 16 >> 16) {
      let nextLoc = posNeighborInDirection(upLoc, dir).$clone();
      if (isPosInMap(nextLoc) && !cellHasTerrainFlag(nextLoc, T_OBSTRUCTS_PASSABILITY)) {
        upLoc.$cp(nextLoc);
        break;
      }
    }
    zeroOutGrid(P(grid));
    getFOVMask(P(grid), upLoc.x, upLoc.y, $mul64(100 - 20 - 1 > 31 + 3 - 3 - 2 ? 100 - 20 - 1 : 31 + 3 - 3 - 2, FP_FACTOR), T_OBSTRUCTS_VISION, 0, false_);
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if (grid[i][j]) {
          ($t1 = $at2(G.pmap, i, j), $t1.flags = ($t1.flags | IN_FIELD_OF_VIEW) >>> 0);
        }
      }
    }
    await populateItems(upLoc.$clone());
    await populateMonsters();
  }
  await restoreItems();
  mapToStairs = allocGrid();
  fillGrid(mapToStairs, 0);
  mapToPit = allocGrid();
  fillGrid(mapToPit, 0);
  calculateDistances(mapToStairs, G.player.loc.x, G.player.loc.y, T_PATHING_BLOCKER, null, true_, true_);
  calculateDistances(mapToPit, $sadd(G.levels, (G.rogue.depthLevel - 1)).playerExitedVia.x, $sadd(G.levels, (G.rogue.depthLevel - 1)).playerExitedVia.y, T_PATHING_BLOCKER, null, true_, true_);
  for (let it = iterateCreatures(G.monsters); hasNextCreature(it); ) {
    let monst = nextCreature(it);
    restoreMonster(monst, mapToStairs, mapToPit);
  }
  freeGrid(mapToStairs);
  freeGrid(mapToPit);
}

export function randomMatchingLocation(loc: struct_pos | null, dungeonType: number, liquidType: number, terrainType: number): number {
  let failsafeCount = 0;
  do {
    failsafeCount = failsafeCount + 1 << 16 >> 16;
    loc.x = rand_range(0, DCOLS - 1) << 16 >> 16;
    loc.y = rand_range(0, DROWS - 1) << 16 >> 16;
  } while (500 > failsafeCount && (terrainType >= 0 && !cellHasTerrainType(loc, terrainType) || (dungeonType >= 0 && pmapAt(loc).layers[DUNGEON] >>> 0 !== dungeonType >>> 0 || liquidType >= 0 && pmapAt(loc).layers[LIQUID] >>> 0 !== liquidType >>> 0) && 0 > terrainType || (pmapAt(loc).flags & (HAS_PLAYER | HAS_MONSTER | HAS_STAIRS | HAS_ITEM | IS_IN_MACHINE)) >>> 0 || 0 > terrainType && !((G.tileCatalog[dungeonType].flags & T_OBSTRUCTS_ITEMS) >>> 0) && cellHasTerrainFlag(loc, T_OBSTRUCTS_ITEMS)));
  if (failsafeCount >= 500) {
    return false_;
  }
  return true_;
}

export function $init(): void {
  G.topBlobMinX = 0;
  G.topBlobMinY = 0;
  G.blobWidth = 0;
  G.blobHeight = 0;
}
