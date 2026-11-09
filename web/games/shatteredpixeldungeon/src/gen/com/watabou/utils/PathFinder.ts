// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/PathFinder.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, Arrays, JObject, LinkedList } from '../../../../jre/index.ts';

let BArray;

export class PathFinder extends JObject {
  static distance: number[] = null;
  static maxVal: number[] = null;
  static goals: boolean[] = null;
  static queue: number[] = null;
  static queued: boolean[] = null;
  static size: number = 0;
  static width: number = 0;
  static dir: number[] = null;
  static dirLR: number[] = null;
  static NEIGHBOURS4: number[] = null;
  static NEIGHBOURS8: number[] = null;
  static NEIGHBOURS9: number[] = null;
  static CIRCLE4: number[] = null;
  static CIRCLE8: number[] = null;
  _PathFinder(): this {
    return this;
  }
  static setMapSize(width: number, height: number): void {
    PathFinder.width = width;
    PathFinder.size = Math.imul(width, height);
    PathFinder.distance = $J.newArray(PathFinder.size, 0);
    PathFinder.goals = $J.newArray(PathFinder.size, false);
    PathFinder.queue = $J.newArray(PathFinder.size, 0);
    PathFinder.queued = $J.newArray(PathFinder.size, false);
    PathFinder.maxVal = $J.newArray(PathFinder.size, 0);
    Arrays.fill(PathFinder.maxVal, 2147483647);
    PathFinder.dir = [-1, +1, -width, +width, (-width - 1) | 0, (-width + 1) | 0, (+width - 1) | 0, (+width + 1) | 0];
    PathFinder.dirLR = [(-1 - width) | 0, -1, (-1 + width) | 0, -width, +width, (+1 - width) | 0, +1, (+1 + width) | 0];
    PathFinder.NEIGHBOURS4 = [-width, -1, +1, +width];
    PathFinder.NEIGHBOURS8 = [(-width - 1) | 0, -width, (-width + 1) | 0, -1, +1, (+width - 1) | 0, +width, (+width + 1) | 0];
    PathFinder.NEIGHBOURS9 = [(-width - 1) | 0, -width, (-width + 1) | 0, -1, 0, +1, (+width - 1) | 0, +width, (+width + 1) | 0];
    PathFinder.CIRCLE4 = [-width, +1, +width, -1];
    PathFinder.CIRCLE8 = [(-width - 1) | 0, -width, (-width + 1) | 0, +1, (+width + 1) | 0, +width, (+width - 1) | 0, -1];
  }
  static find(from: number, to: number, passable: boolean[]): PathFinder$Path {
    if (!PathFinder.buildDistanceMap$int$int$booleanArr(from, to, passable)) {
      return null;
    }
    let result = new PathFinder$Path()._PathFinder$Path();
    let s = from;
    do {
      let minD = PathFinder.distance[s];
      let mins = s;
      for (let i = 0; i < PathFinder.dir.length; i++) {
        let n = (s + PathFinder.dir[i]) | 0;
        let thisD = PathFinder.distance[n];
        if (thisD < minD) {
          minD = thisD;
          mins = n;
        }
      }
      s = mins;
      result.add(s);
    } while (s !== to);
    return result;
  }
  static getStep(from: number, to: number, passable: boolean[]): number {
    if (!PathFinder.buildDistanceMap$int$int$booleanArr(from, to, passable)) {
      return -1;
    }
    let minD = PathFinder.distance[from];
    let best = from;
    let step: number;
    let stepD: number;
    for (let i = 0; i < PathFinder.dir.length; i++) {
      if ((stepD = PathFinder.distance[step = (from + PathFinder.dir[i]) | 0]) < minD) {
        minD = stepD;
        best = step;
      }
    }
    return best;
  }
  static getStepBack(cur: number, from: number, lookahead: number, passable: boolean[], canApproachFromPos: boolean): number {
    let d = PathFinder.buildEscapeDistanceMap(cur, from, lookahead, passable);
    if (d === 0) {
      return -1;
    }
    if (!canApproachFromPos) {
      let head = 0;
      let tail = 0;
      let newD = PathFinder.distance[cur];
      BArray.setFalse(PathFinder.queued);
      PathFinder.queue[tail++] = cur;
      PathFinder.queued[cur] = true;
      while (head < tail) {
        let step = PathFinder.queue[head++];
        if (PathFinder.distance[step] > newD) {
          newD = PathFinder.distance[step];
        }
        let start = (step % PathFinder.width === 0 ? 3 : 0);
        let end = (((step + 1) | 0) % PathFinder.width === 0 ? 3 : 0);
        for (let i = start; i < ((PathFinder.dirLR.length - end) | 0); i++) {
          let n = (step + PathFinder.dirLR[i]) | 0;
          if (n >= 0 && n < PathFinder.size && passable[n]) {
            if (PathFinder.distance[n] < PathFinder.distance[cur]) {
              passable[n] = false;
            } else if (PathFinder.distance[n] >= PathFinder.distance[step] && !PathFinder.queued[n]) {
              PathFinder.queue[tail++] = n;
              PathFinder.queued[n] = true;
            }
          }
        }
      }
      d = Math.min(newD, d);
    }
    for (let i = 0; i < PathFinder.size; i++) {
      PathFinder.goals[i] = PathFinder.distance[i] === d;
    }
    if (!PathFinder.buildDistanceMap$int$booleanArr$booleanArr(cur, PathFinder.goals, passable)) {
      return -1;
    }
    let s = cur;
    let minD = PathFinder.distance[s];
    let mins = s;
    for (let i = 0; i < PathFinder.dir.length; i++) {
      let n = (s + PathFinder.dir[i]) | 0;
      let thisD = PathFinder.distance[n];
      if (thisD < minD) {
        minD = thisD;
        mins = n;
      }
    }
    return mins;
  }
  static buildDistanceMap$int$int$booleanArr(from: number, to: number, passable: boolean[]): boolean {
    if (from === to) {
      return false;
    }
    $J.system_arraycopy(PathFinder.maxVal, 0, PathFinder.distance, 0, PathFinder.maxVal.length);
    let pathFound = false;
    let head = 0;
    let tail = 0;
    PathFinder.queue[tail++] = to;
    PathFinder.distance[to] = 0;
    while (head < tail) {
      let step = PathFinder.queue[head++];
      if (step === from) {
        pathFound = true;
        break;
      }
      let nextDistance = (PathFinder.distance[step] + 1) | 0;
      let start = (step % PathFinder.width === 0 ? 3 : 0);
      let end = (((step + 1) | 0) % PathFinder.width === 0 ? 3 : 0);
      for (let i = start; i < ((PathFinder.dirLR.length - end) | 0); i++) {
        let n = (step + PathFinder.dirLR[i]) | 0;
        if (n === from || (n >= 0 && n < PathFinder.size && passable[n] && (PathFinder.distance[n] > nextDistance))) {
          PathFinder.queue[tail++] = n;
          PathFinder.distance[n] = nextDistance;
        }
      }
    }
    return pathFound;
  }
  static buildDistanceMap$int$booleanArr$int(to: number, passable: boolean[], limit: number): void {
    $J.system_arraycopy(PathFinder.maxVal, 0, PathFinder.distance, 0, PathFinder.maxVal.length);
    let head = 0;
    let tail = 0;
    PathFinder.queue[tail++] = to;
    PathFinder.distance[to] = 0;
    while (head < tail) {
      let step = PathFinder.queue[head++];
      let nextDistance = (PathFinder.distance[step] + 1) | 0;
      if (nextDistance > limit) {
        return;
      }
      let start = (step % PathFinder.width === 0 ? 3 : 0);
      let end = (((step + 1) | 0) % PathFinder.width === 0 ? 3 : 0);
      for (let i = start; i < ((PathFinder.dirLR.length - end) | 0); i++) {
        let n = (step + PathFinder.dirLR[i]) | 0;
        if (n >= 0 && n < PathFinder.size && passable[n] && (PathFinder.distance[n] > nextDistance)) {
          PathFinder.queue[tail++] = n;
          PathFinder.distance[n] = nextDistance;
        }
      }
    }
  }
  static buildDistanceMap$int$booleanArr$booleanArr(from: number, to: boolean[], passable: boolean[]): boolean {
    if (to[from]) {
      return false;
    }
    $J.system_arraycopy(PathFinder.maxVal, 0, PathFinder.distance, 0, PathFinder.maxVal.length);
    let pathFound = false;
    let head = 0;
    let tail = 0;
    for (let i = 0; i < PathFinder.size; i++) {
      if (to[i]) {
        PathFinder.queue[tail++] = i;
        PathFinder.distance[i] = 0;
      }
    }
    while (head < tail) {
      let step = PathFinder.queue[head++];
      if (step === from) {
        pathFound = true;
        break;
      }
      let nextDistance = (PathFinder.distance[step] + 1) | 0;
      let start = (step % PathFinder.width === 0 ? 3 : 0);
      let end = (((step + 1) | 0) % PathFinder.width === 0 ? 3 : 0);
      for (let i = start; i < ((PathFinder.dirLR.length - end) | 0); i++) {
        let n = (step + PathFinder.dirLR[i]) | 0;
        if (n === from || (n >= 0 && n < PathFinder.size && passable[n] && (PathFinder.distance[n] > nextDistance))) {
          PathFinder.queue[tail++] = n;
          PathFinder.distance[n] = nextDistance;
        }
      }
    }
    return pathFound;
  }
  static buildEscapeDistanceMap(cur: number, from: number, lookAhead: number, passable: boolean[]): number {
    $J.system_arraycopy(PathFinder.maxVal, 0, PathFinder.distance, 0, PathFinder.maxVal.length);
    let destDist = 2147483647;
    let head = 0;
    let tail = 0;
    PathFinder.queue[tail++] = from;
    PathFinder.distance[from] = 0;
    let dist = 0;
    while (head < tail) {
      let step = PathFinder.queue[head++];
      dist = PathFinder.distance[step];
      if (dist > destDist) {
        return destDist;
      }
      if (step === cur) {
        destDist = (dist + lookAhead) | 0;
      }
      let nextDistance = (dist + 1) | 0;
      let start = (step % PathFinder.width === 0 ? 3 : 0);
      let end = (((step + 1) | 0) % PathFinder.width === 0 ? 3 : 0);
      for (let i = start; i < ((PathFinder.dirLR.length - end) | 0); i++) {
        let n = (step + PathFinder.dirLR[i]) | 0;
        if (n >= 0 && n < PathFinder.size && passable[n] && PathFinder.distance[n] > nextDistance) {
          PathFinder.queue[tail++] = n;
          PathFinder.distance[n] = nextDistance;
        }
      }
    }
    return dist;
  }
  static buildDistanceMap$int$booleanArr(to: number, passable: boolean[]): void {
    $J.system_arraycopy(PathFinder.maxVal, 0, PathFinder.distance, 0, PathFinder.maxVal.length);
    let head = 0;
    let tail = 0;
    PathFinder.queue[tail++] = to;
    PathFinder.distance[to] = 0;
    while (head < tail) {
      let step = PathFinder.queue[head++];
      let nextDistance = (PathFinder.distance[step] + 1) | 0;
      let start = (step % PathFinder.width === 0 ? 3 : 0);
      let end = (((step + 1) | 0) % PathFinder.width === 0 ? 3 : 0);
      for (let i = start; i < ((PathFinder.dirLR.length - end) | 0); i++) {
        let n = (step + PathFinder.dirLR[i]) | 0;
        if (n >= 0 && n < PathFinder.size && passable[n] && (PathFinder.distance[n] > nextDistance)) {
          PathFinder.queue[tail++] = n;
          PathFinder.distance[n] = nextDistance;
        }
      }
    }
  }
  static $clinit() {
    PathFinder.size = 0;
    PathFinder.width = 0;
  }
}

export class PathFinder$Path extends LinkedList {
  _PathFinder$Path(): this {
    this._LinkedList();
    return this;
  }
}

$J.define(PathFinder, 'com.watabou.utils.PathFinder', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_PathFinder' }, meths: { 'buildDistanceMap(int,boolean[])': 'buildDistanceMap$int$booleanArr', 'buildDistanceMap(int,boolean[],boolean[])': 'buildDistanceMap$int$booleanArr$booleanArr', 'buildDistanceMap(int,boolean[],int)': 'buildDistanceMap$int$booleanArr$int', 'buildDistanceMap(int,int,boolean[])': 'buildDistanceMap$int$int$booleanArr' }, clinit: true, lazy: ['distance', 'maxVal', 'goals', 'queue', 'queued', 'size', 'width', 'dir', 'dirLR', 'NEIGHBOURS4', 'NEIGHBOURS8', 'NEIGHBOURS9', 'CIRCLE4', 'CIRCLE8'] });
$J.define(PathFinder$Path, 'com.watabou.utils.PathFinder$Path', { kind: 'class', sup: 'java.util.LinkedList', ctors: { '': '_PathFinder$Path' } });
$J.module(() => {
  BArray = $J.load('com.watabou.utils.BArray');
});
