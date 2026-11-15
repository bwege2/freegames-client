// @ts-nocheck
// Brogue CE 1.15.1 Dijkstra.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { cellHasTMFlag, cellHasTerrainFlag } from './Architect.ts';
import { allocGrid, freeGrid } from './Grid.ts';
import { discoveredTerrainFlagsAtLoc, monsterAtLoc, monsterAvoids } from './Monsters.ts';
import { struct_creature, struct_pcell, struct_pdsMap, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $at2, $rd, $sadd, $sat, $sidx, $wr, G } from '../rt/index.ts';
import { COLS, DCOLS, DISCOVERED, DROWS, MAGIC_MAPPED, MESSAGE_LINES, MONST_GETS_TURN_ON_ACTIVATION, MONST_IMMOBILE, MONST_IMMUNE_TO_WEAPONS, MONST_INVULNERABLE, PDS_FORBIDDEN, PDS_OBSTRUCTION, ROWS, STAT_BAR_WIDTH, TM_IS_SECRET, T_OBSTRUCTS_DIAGONAL_MOVEMENT, T_OBSTRUCTS_PASSABILITY, true_ } from './consts.ts';

let dijkstraScan$map: struct_pdsMap;
let calculateDistances$map: struct_pdsMap;

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

function pdsUpdate(map: struct_pdsMap | null, useDiagonals: number): void {
  let dirs = (useDiagonals ? 8 : 4) << 16 >> 16;
  let head = map.front.right;
  map.front.right = null;
  while (!!head) {
    for (let dir = 0; dirs > dir; dir = dir + 1 << 16 >> 16) {
      let link = $sadd(head, G.nbDirs[dir][0] + Math.imul(DCOLS, G.nbDirs[dir][1]));
      if ($sidx(link) < $sidx(map.links[0]) || $sidx(link) >= $sidx($sadd(map.links[0], Math.imul(DCOLS, DROWS)))) {
        continue;
      }
      if (0 > link.cost) {
        continue;
      }
      if (dir >= 4) {
        let way1 = $sadd(head, G.nbDirs[dir][0]);
        let way2 = $sadd(head, Math.imul(DCOLS, G.nbDirs[dir][1]));
        if (way1.cost === PDS_OBSTRUCTION || way2.cost === PDS_OBSTRUCTION) {
          continue;
        }
      }
      if (link.distance > head.distance + link.cost) {
        link.distance = head.distance + link.cost << 16 >> 16;
        if (!!link.right) {
          link.right.left = link.left;
        }
        if (!!link.left) {
          link.left.right = link.right;
        }
        let left = head;
        let right = head.right;
        while (!!right && link.distance > right.distance) {
          left = right;
          right = right.right;
        }
        if (!!left) {
          left.right = link;
        }
        link.right = right;
        link.left = left;
        if (!!right) {
          right.left = link;
        }
      }
    }
    let right = head.right;
    head.left = null;
    head.right = null;
    head = right;
  }
}

function pdsClear(map: struct_pdsMap | null, maxDistance: number): void {
  map.front.right = null;
  for (let i = 0; Math.imul(DCOLS, DROWS) > i; ++i) {
    map.links[i].distance = maxDistance;
    map.links[i].left = null;
    map.links[i].right = null;
  }
}

function pdsSetDistance(map: struct_pdsMap | null, x: number, y: number, distance: number): void {
  if (x > 0 && y > 0 && DCOLS - 1 > x && DROWS - 1 > y) {
    let link = $sadd(map.links[0], x + Math.imul(100 - 20 - 1, y));
    if (link.distance > distance) {
      link.distance = distance;
      if (!!link.right) {
        link.right.left = link.left;
      }
      if (!!link.left) {
        link.left.right = link.right;
      }
      let left = map.front;
      let right = map.front.right;
      while (!!right && link.distance > right.distance) {
        left = right;
        right = right.right;
      }
      link.right = right;
      link.left = left;
      left.right = link;
      if (!!right) {
        right.left = link;
      }
    }
  }
}

function pdsBatchInput(map: struct_pdsMap | null, distanceMap: Ptr | null, costMap: Ptr | null, maxDistance: number): void {
  let left = null;
  let right = null;
  map.front.right = null;
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      let link = $sadd(map.links[0], i + Math.imul(100 - 20 - 1, j));
      if (!!distanceMap) {
        link.distance = $rd(distanceMap.a[distanceMap.o + i], j);
      } else {
        if (!!costMap) {
          link.distance = maxDistance;
        }
      }
      let cost = 0;
      if (i === 0 || j === 0 || i === DCOLS - 1 || j === DROWS - 1) {
        cost = PDS_OBSTRUCTION;
      } else if (!costMap) {
        if (cellHasTerrainFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), T_OBSTRUCTS_PASSABILITY) && cellHasTerrainFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), T_OBSTRUCTS_DIAGONAL_MOVEMENT)) {
          cost = PDS_OBSTRUCTION;
        } else {
          cost = PDS_FORBIDDEN;
        }
      } else {
        cost = $rd(costMap.a[costMap.o + i], j);
      }
      link.cost = cost << 16 >> 16;
      if (cost > 0) {
        if (maxDistance > link.distance) {
          if (!right || right.distance > link.distance) {
            left = map.front;
            right = map.front.right;
          }
          while (!!right && link.distance > right.distance) {
            left = right;
            right = right.right;
          }
          link.right = right;
          link.left = left;
          left.right = link;
          if (!!right) {
            right.left = link;
          }
          left = link;
        } else {
          link.right = null;
          link.left = null;
        }
      } else {
        link.right = null;
        link.left = null;
      }
    }
  }
}

function pdsBatchOutput(map: struct_pdsMap | null, distanceMap: Ptr | null, useDiagonals: number): void {
  pdsUpdate(map, useDiagonals);
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      $wr(distanceMap.a[distanceMap.o + i], j, $sadd(map.links[0], i + Math.imul(100 - 20 - 1, j)).distance);
    }
  }
}

export function dijkstraScan(distanceMap: Ptr | null, costMap: Ptr | null, useDiagonals: number): void {
  pdsBatchInput(dijkstraScan$map, distanceMap, costMap, 30000);
  pdsBatchOutput(dijkstraScan$map, distanceMap, useDiagonals);
}

export function calculateDistances(distanceMap: Ptr | null, destinationX: number, destinationY: number, blockingTerrainFlags: number, traveler: struct_creature | null, canUseSecretDoors: number, eightWays: number): void {
  for (let i = 0; DCOLS > i; ++i) {
    for (let j = 0; DROWS > j; ++j) {
      let cost = 0;
      let monst = monsterAtLoc(struct_pos.$of(i << 16 >> 16, j << 16 >> 16));
      if (monst && (monst.info.flags & (MONST_IMMUNE_TO_WEAPONS | MONST_INVULNERABLE)) >>> 0 && (monst.info.flags & (MONST_IMMOBILE | MONST_GETS_TURN_ON_ACTIVATION)) >>> 0) {
        cost = PDS_FORBIDDEN;
      } else if (canUseSecretDoors && cellHasTMFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), TM_IS_SECRET) && cellHasTerrainFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), T_OBSTRUCTS_PASSABILITY) && !((discoveredTerrainFlagsAtLoc(struct_pos.$of(i << 16 >> 16, j << 16 >> 16)) & T_OBSTRUCTS_PASSABILITY) >>> 0)) {
        cost = 1;
      } else if (cellHasTerrainFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), T_OBSTRUCTS_PASSABILITY) || traveler && traveler === G.player && !(($at2(G.pmap, i, j).flags & (DISCOVERED | MAGIC_MAPPED)) >>> 0)) {
        cost = (cellHasTerrainFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), T_OBSTRUCTS_DIAGONAL_MOVEMENT) ? PDS_OBSTRUCTION : PDS_FORBIDDEN) << 24 >> 24;
      } else if (traveler && monsterAvoids(traveler, struct_pos.$of(i << 16 >> 16, j << 16 >> 16)) || cellHasTerrainFlag(struct_pos.$of(i << 16 >> 16, j << 16 >> 16), blockingTerrainFlags)) {
        cost = PDS_FORBIDDEN;
      } else {
        cost = 1;
      }
      $sadd(calculateDistances$map.links[0], i + Math.imul(100 - 20 - 1, j)).cost = cost;
    }
  }
  pdsClear(calculateDistances$map, 30000);
  pdsSetDistance(calculateDistances$map, destinationX, destinationY, 0);
  pdsBatchOutput(calculateDistances$map, distanceMap, eightWays);
}

export function pathingDistance(x1: number, y1: number, x2: number, y2: number, blockingTerrainFlags: number): number {
  let distanceMap = allocGrid();
  calculateDistances(distanceMap, x2, y2, blockingTerrainFlags, null, true_, true_);
  let retval = $rd(distanceMap.a[distanceMap.o + x1], y1);
  freeGrid(distanceMap);
  return retval;
}

export function $init(): void {
  dijkstraScan$map = new struct_pdsMap();
  calculateDistances$map = new struct_pdsMap();
}
