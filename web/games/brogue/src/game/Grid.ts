// @ts-nocheck
// Brogue CE 1.15.1 Grid.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { cellHasTMFlag, cellHasTerrainFlag, passableArcCount } from './Architect.ts';
import { dijkstraScan } from './Dijkstra.ts';
import { bakeColor } from './IO.ts';
import { rand_percent, rand_range } from './Math.ts';
import { getQualifyingLocNear } from './Monsters.ts';
import { struct_color, struct_pcell, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, free } from '../rt/index.ts';
import { COLS, DCOLS, DIRECTION_COUNT, DROWS, MESSAGE_LINES, PDS_FORBIDDEN, PDS_OBSTRUCTION, RNG_COSMETIC, ROWS, STAT_BAR_WIDTH, T_OBSTRUCTS_DIAGONAL_MOVEMENT, T_OBSTRUCTS_PASSABILITY, false_, true_ } from './consts.ts';


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

export function allocGrid(): Ptr | null {
  let i = 0;
  let array = P(new Array(632 / 8).fill(null));
  array.a[array.o] = P(new Int16Array(4582 / 2));
  for (i = 1; DCOLS > i; i = i + 1 << 16 >> 16) {
    array.a[array.o + i] = array.a[array.o].add(Math.imul(i, DROWS));
  }
  return array;
}

export function freeGrid(array: Ptr | null): void {
  free(array.a[array.o]);
  free(array);
}

export function copyGrid(to: Ptr | null, from: Ptr | null): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      $wr(to.a[to.o + i], j, $rd(from.a[from.o + i], j));
    }
  }
}

export function fillGrid(grid: Ptr | null, fillValue: number): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      $wr(grid.a[grid.o + i], j, fillValue);
    }
  }
}

export function hiliteGrid(grid: Ptr | null, hiliteColor: struct_color | null, hiliteStrength: number): void {
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let hCol = new struct_color();
  let oldRNG = G.rogue.RNG;
  G.rogue.RNG = RNG_COSMETIC;
  ;
  if (hiliteColor) {
    hCol.$cp(hiliteColor);
  } else {
    hCol.$cp(G.yellow);
  }
  bakeColor(hCol);
  if (!hiliteStrength) {
    hiliteStrength = 75;
  }
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j)) {
        x = i + 20 + 1 << 16 >> 16;
        y = j + 3 << 16 >> 16;
        let cell = $sat(G.displayBuffer.cells[x], y);
        cell.backColorComponents[0] = ((cell.backColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.backColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.backColorComponents[1] = ((cell.backColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.backColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.backColorComponents[2] = ((cell.backColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.backColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) > 0 ? cell.backColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.foreColorComponents[0] = ((cell.foreColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.foreColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[0] + (Math.imul(hCol.red, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.foreColorComponents[1] = ((cell.foreColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.foreColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[1] + (Math.imul(hCol.green, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
        cell.foreColorComponents[2] = ((cell.foreColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) : 0) > 100 ? 100 : cell.foreColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) > 0 ? cell.foreColorComponents[2] + (Math.imul(hCol.blue, hiliteStrength) / 100 | 0) : 0) << 24 >> 24;
      }
    }
  }
  G.rogue.RNG = oldRNG;
  ;
}

export function findReplaceGrid(grid: Ptr | null, findValueMin: number, findValueMax: number, fillValue: number): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) >= findValueMin && findValueMax >= $rd(grid.a[grid.o + i], j)) {
        $wr(grid.a[grid.o + i], j, fillValue);
      }
    }
  }
}

export function floodFillGrid(grid: Ptr | null, x: number, y: number, eligibleValueMin: number, eligibleValueMax: number, fillValue: number): number {
  let dir = 0;
  let newX = 0;
  let newY = 0;
  let fillCount = 1;
  ;
  $wr(grid.a[grid.o + x], y, fillValue);
  for (dir = 0; 4 > dir; ++dir) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    if (coordinatesAreInMap(newX, newY) && $rd(grid.a[grid.o + newX], newY) >= eligibleValueMin && eligibleValueMax >= $rd(grid.a[grid.o + newX], newY)) {
      fillCount = fillCount + floodFillGrid(grid, newX, newY, eligibleValueMin, eligibleValueMax, fillValue) << 16 >> 16;
    }
  }
  return fillCount;
}

export function drawRectangleOnGrid(grid: Ptr | null, x: number, y: number, width: number, height: number, value: number): void {
  let i = 0;
  let j = 0;
  for (i = x; x + width > i; i = i + 1 << 16 >> 16) {
    for (j = y; y + height > j; j = j + 1 << 16 >> 16) {
      $wr(grid.a[grid.o + i], j, value);
    }
  }
}

export function drawCircleOnGrid(grid: Ptr | null, x: number, y: number, radius: number, value: number): void {
  let i = 0;
  let j = 0;
  for (i = (0 > x - radius - 1 ? 0 : x - radius - 1) << 16 >> 16; (100 - 20 - 1 > x + radius ? 100 - 20 - 1 : x + radius) > i; i = i + 1 << 16 >> 16) {
    for (j = (0 > y - radius - 1 ? 0 : y - radius - 1) << 16 >> 16; (31 + 3 - 3 - 2 > y + radius ? 31 + 3 - 3 - 2 : y + radius) > j; j = j + 1 << 16 >> 16) {
      if (Math.imul(radius, radius) + radius > Math.imul(i - x, i - x) + Math.imul(j - y, j - y)) {
        $wr(grid.a[grid.o + i], j, value);
      }
    }
  }
}

export function getTerrainGrid(grid: Ptr | null, value: number, terrainFlags: number, mapFlags: number): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) !== value && cellHasTerrainFlag(struct_pos.$of(i, j), terrainFlags) || ($at2(G.pmap, i, j).flags & mapFlags) >>> 0) {
        $wr(grid.a[grid.o + i], j, value);
      }
    }
  }
}

export function getTMGrid(grid: Ptr | null, value: number, TMflags: number): void {
  let i = 0;
  let j = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) !== value && cellHasTMFlag(struct_pos.$of(i, j), TMflags)) {
        $wr(grid.a[grid.o + i], j, value);
      }
    }
  }
}

function getPassableArcGrid(grid: Ptr | null, minPassableArc: number, maxPassableArc: number, value: number): void {
  let i = 0;
  let j = 0;
  let count = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) !== value) {
        count = passableArcCount(i, j);
        if (count >= minPassableArc && maxPassableArc >= count) {
          $wr(grid.a[grid.o + i], j, value);
        }
      }
    }
  }
}

export function validLocationCount(grid: Ptr | null, validValue: number): number {
  let i = 0;
  let j = 0;
  let count = 0;
  count = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) === validValue) {
        count = count + 1 << 16 >> 16;
      }
    }
  }
  return count;
}

function leastPositiveValueInGrid(grid: Ptr | null): number {
  let i = 0;
  let j = 0;
  let leastPositiveValue = 0;
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) > 0 && (leastPositiveValue === 0 || leastPositiveValue > $rd(grid.a[grid.o + i], j))) {
        leastPositiveValue = $rd(grid.a[grid.o + i], j);
      }
    }
  }
  return leastPositiveValue;
}

export function randomLocationInGrid(grid: Ptr | null, x: Ptr | null, y: Ptr | null, validValue: number): void {
  let locationCount = validLocationCount(grid, validValue);
  let i = 0;
  let j = 0;
  if (0 >= locationCount) {
    x.a[x.o] = y.a[y.o] = -1;
    return;
  }
  let index = rand_range(0, locationCount - 1) << 16 >> 16;
  for (i = 0; DCOLS > i && index >= 0; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j && index >= 0; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) === validValue) {
        if (index === 0) {
          x.a[x.o] = i;
          y.a[y.o] = j;
        }
        index = index - 1 << 16 >> 16;
      }
    }
  }
  return;
}

function randomLeastPositiveLocationInGrid(grid: Ptr | null, deterministic: number): struct_pos {
  let targetValue = leastPositiveValueInGrid(grid);
  if (targetValue === 0) {
    return struct_pos.$of(-1, -1);
  }
  let locationCount = 0;
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      if ($rd(grid.a[grid.o + i], j) === targetValue) {
        locationCount = locationCount + 1 << 16 >> 16;
      }
    }
  }
  let index = 0;
  if (deterministic) {
    index = (locationCount / 2 | 0) << 16 >> 16;
  } else {
    index = rand_range(0, locationCount - 1) << 16 >> 16;
  }
  for (let i = 0; DCOLS > i && index >= 0; ++i) {
    for (let j = 0; DROWS > j && index >= 0; ++j) {
      if ($rd(grid.a[grid.o + i], j) === targetValue) {
        if (index === 0) {
          return struct_pos.$of(i << 16 >> 16, j << 16 >> 16);
        }
        index = index - 1 << 16 >> 16;
      }
    }
  }
  return struct_pos.$of(-1, -1);
}

export function getQualifyingPathLocNear(target: struct_pos, hallwaysAllowed: number, blockingTerrainFlags: number, blockingMapFlags: number, forbiddenTerrainFlags: number, forbiddenMapFlags: number, deterministic: number): struct_pos {
  let grid = null;
  let costMap = null;
  if (!cellHasTerrainFlag(target, (blockingTerrainFlags | forbiddenTerrainFlags) >>> 0) && !((pmapAt(target).flags & (blockingMapFlags | forbiddenMapFlags) >>> 0) >>> 0) && (hallwaysAllowed || passableArcCount(target.x, target.y) <= 1)) {
    return target.$clone();
  }
  grid = allocGrid();
  costMap = allocGrid();
  fillGrid(grid, 30000);
  fillGrid(costMap, 1);
  getTerrainGrid(costMap, PDS_FORBIDDEN, blockingTerrainFlags, blockingMapFlags);
  if ((blockingTerrainFlags & (T_OBSTRUCTS_DIAGONAL_MOVEMENT | T_OBSTRUCTS_PASSABILITY)) >>> 0) {
    getTerrainGrid(costMap, PDS_OBSTRUCTION, T_OBSTRUCTS_DIAGONAL_MOVEMENT, 0);
  }
  $wr(grid.a[grid.o + target.x], target.y, 1);
  $wr(costMap.a[costMap.o + target.x], target.y, 1);
  dijkstraScan(grid, costMap, true_);
  findReplaceGrid(grid, 30000, 30000, 0);
  getTerrainGrid(grid, 0, forbiddenTerrainFlags, forbiddenMapFlags);
  if (!hallwaysAllowed) {
    getPassableArcGrid(grid, 2, 10, 0);
  }
  let retLoc = randomLeastPositiveLocationInGrid(grid, deterministic).$clone();
  freeGrid(grid);
  freeGrid(costMap);
  if (isPosInMap(retLoc)) {
    return retLoc.$clone();
  }
  let loc = new struct_pos();
  if (getQualifyingLocNear(loc, target.$clone(), hallwaysAllowed, null, (blockingTerrainFlags | forbiddenTerrainFlags) >>> 0, (blockingMapFlags | forbiddenMapFlags) >>> 0, false_, deterministic)) {
    return loc.$clone();
  } else {
    return retLoc.$clone();
  }
}

function cellularAutomataRound(grid: Ptr | null, birthParameters: Ptr | null, survivalParameters: Ptr | null): void {
  let i = 0;
  let j = 0;
  let nbCount = 0;
  let newX = 0;
  let newY = 0;
  let dir = 0;
  let buffer2 = null;
  buffer2 = allocGrid();
  copyGrid(buffer2, grid);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      nbCount = 0;
      for (dir = 0; DIRECTION_COUNT > dir; ++dir) {
        newX = i + G.nbDirs[dir][0] << 16 >> 16;
        newY = j + G.nbDirs[dir][1] << 16 >> 16;
        if (coordinatesAreInMap(newX, newY) && $rd(buffer2.a[buffer2.o + newX], newY)) {
          nbCount = nbCount + 1 << 16 >> 16;
        }
      }
      if (!$rd(buffer2.a[buffer2.o + i], j) && birthParameters.a[birthParameters.o + nbCount] === 116) {
        $wr(grid.a[grid.o + i], j, 1);
      } else if ($rd(buffer2.a[buffer2.o + i], j) && survivalParameters.a[survivalParameters.o + nbCount] === 116) {
      } else {
        $wr(grid.a[grid.o + i], j, 0);
      }
    }
  }
  freeGrid(buffer2);
}

function fillContiguousRegion(grid: Ptr | null, x: number, y: number, fillValue: number): number {
  let dir = 0;
  let newX = 0;
  let newY = 0;
  let numberOfCells = 1;
  $wr(grid.a[grid.o + x], y, fillValue);
  for (dir = 0; 4 > dir; ++dir) {
    newX = x + G.nbDirs[dir][0] << 16 >> 16;
    newY = y + G.nbDirs[dir][1] << 16 >> 16;
    if (!coordinatesAreInMap(newX, newY)) {
      break;
    }
    if ($rd(grid.a[grid.o + newX], newY) === 1) {
      numberOfCells = numberOfCells + fillContiguousRegion(grid, newX, newY, fillValue) << 16 >> 16;
    }
  }
  return numberOfCells;
}

export function createBlobOnGrid(grid: Ptr | null, retMinX: Ptr | null, retMinY: Ptr | null, retWidth: Ptr | null, retHeight: Ptr | null, roundCount: number, minBlobWidth: number, minBlobHeight: number, maxBlobWidth: number, maxBlobHeight: number, percentSeeded: number, birthParameters: Ptr | null, survivalParameters: Ptr | null): void {
  let i = 0;
  let j = 0;
  let k = 0;
  let blobNumber = 0;
  let blobSize = 0;
  let topBlobNumber = 0;
  let topBlobSize = 0;
  let topBlobMinX = 0;
  let topBlobMinY = 0;
  let topBlobMaxX = 0;
  let topBlobMaxY = 0;
  let blobWidth = 0;
  let blobHeight = 0;
  let foundACellThisLine = 0;
  do {
    fillGrid(grid, 0);
    for (i = 0; maxBlobWidth > i; i = i + 1 << 16 >> 16) {
      for (j = 0; maxBlobHeight > j; j = j + 1 << 16 >> 16) {
        $wr(grid.a[grid.o + i], j, (rand_percent(percentSeeded) ? 1 : 0) << 16 >> 16);
      }
    }
    for (k = 0; roundCount > k; k = k + 1 << 16 >> 16) {
      cellularAutomataRound(grid, birthParameters, survivalParameters);
    }
    topBlobSize = 0;
    topBlobNumber = 0;
    topBlobMinX = maxBlobWidth;
    topBlobMaxX = 0;
    topBlobMinY = maxBlobHeight;
    topBlobMaxY = 0;
    blobNumber = 2;
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if ($rd(grid.a[grid.o + i], j) === 1) {
          blobSize = fillContiguousRegion(grid, i, j, blobNumber);
          if (blobSize > topBlobSize) {
            topBlobSize = blobSize;
            topBlobNumber = blobNumber;
          }
          blobNumber = blobNumber + 1 << 16 >> 16;
        }
      }
    }
    for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
      foundACellThisLine = false_;
      for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
        if ($rd(grid.a[grid.o + i], j) === topBlobNumber) {
          foundACellThisLine = true_;
          break;
        }
      }
      if (foundACellThisLine) {
        if (topBlobMinX > i) {
          topBlobMinX = i;
        }
        if (i > topBlobMaxX) {
          topBlobMaxX = i;
        }
      }
    }
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      foundACellThisLine = false_;
      for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
        if ($rd(grid.a[grid.o + i], j) === topBlobNumber) {
          foundACellThisLine = true_;
          break;
        }
      }
      if (foundACellThisLine) {
        if (topBlobMinY > j) {
          topBlobMinY = j;
        }
        if (j > topBlobMaxY) {
          topBlobMaxY = j;
        }
      }
    }
    blobWidth = topBlobMaxX - topBlobMinX + 1 << 16 >> 16;
    blobHeight = topBlobMaxY - topBlobMinY + 1 << 16 >> 16;
  } while (minBlobWidth > blobWidth || minBlobHeight > blobHeight || topBlobNumber === 0);
  for (i = 0; DCOLS > i; i = i + 1 << 16 >> 16) {
    for (j = 0; DROWS > j; j = j + 1 << 16 >> 16) {
      if ($rd(grid.a[grid.o + i], j) === topBlobNumber) {
        $wr(grid.a[grid.o + i], j, 1);
      } else {
        $wr(grid.a[grid.o + i], j, 0);
      }
    }
  }
  retMinX.a[retMinX.o] = topBlobMinX;
  retMinY.a[retMinY.o] = topBlobMinY;
  retWidth.a[retWidth.o] = blobWidth;
  retHeight.a[retHeight.o] = blobHeight;
}

export function $init(): void {
}
