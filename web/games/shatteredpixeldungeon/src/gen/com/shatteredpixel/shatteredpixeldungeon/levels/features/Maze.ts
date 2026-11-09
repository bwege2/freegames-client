// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/features/Maze.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

let Random;

export class Maze extends JObject {
  static EMPTY: boolean = false;
  static FILLED: boolean = false;
  static allowDiagonals: boolean = false;
  _Maze(): this {
    return this;
  }
  static generate$Room(r: Room): boolean[][] {
    let maze = $J.newArrayN([r.width(), r.height()], false);
    for (let x = 0; x < maze.length; x++) {
      for (let y = 0; y < maze[0].length; y++) {
        if (x === 0 || x === ((maze.length - 1) | 0) || y === 0 || y === ((maze[0].length - 1) | 0)) {
          maze[x][y] = Maze.FILLED;
        }
      }
    }
    for (const $it0 = r.connected_.values().iterator(); $it0.hasNext(); ) {
      let d = $it0.next();
      ((maze[(d.x - r.left_) | 0])[(d.y - r.top_) | 0]) = Maze.EMPTY;
    }
    return Maze.generate$booleanArrArr(maze);
  }
  static generate$Rect(r: Rect): boolean[][] {
    return Maze.generate$int$int((r.width() + 1) | 0, (r.height() + 1) | 0);
  }
  static generate$Rect$intArr$int$int(r: Rect, terrain: number[], width: number, filledTerrainType: number): boolean[][] {
    let maze = $J.newArrayN([r.width(), r.height()], false);
    for (let x = 0; x < maze.length; x++) {
      for (let y = 0; y < maze[0].length; y++) {
        if ((terrain[(x + r.left_ + Math.imul(((y + r.top_) | 0), width)) | 0]) === filledTerrainType) {
          maze[x][y] = Maze.FILLED;
        }
      }
    }
    return Maze.generate$booleanArrArr(maze);
  }
  static generate$int$int(width: number, height: number): boolean[][] {
    return Maze.generate$booleanArrArr($J.newArrayN([width, height], false));
  }
  static generate$booleanArrArr(maze: boolean[][]): boolean[][] {
    let fails = 0;
    let x: number;
    let y: number;
    let moves: number;
    let mov: number[];
    while (fails < 2500) {
      do {
        x = Random.Int$int(maze.length);
        y = Random.Int$int(maze[0].length);
      } while (!maze[x][y]);
      mov = Maze.decideDirection(maze, x, y);
      if (mov == null) {
        fails++;
      } else {
        fails = 0;
        moves = 0;
        do {
          x = (x + mov[0]) | 0;
          y = (y + mov[1]) | 0;
          maze[x][y] = Maze.FILLED;
          moves++;
        } while (Random.Int$int(moves) === 0 && Maze.checkValidMove(maze, x, y, mov));
      }
    }
    return maze;
  }
  static decideDirection(maze: boolean[][], x: number, y: number): number[] {
    if (Random.Int$int(4) === 0 && Maze.checkValidMove(maze, x, y, [0, -1])) {
      return [0, -1];
    }
    if (Random.Int$int(3) === 0 && Maze.checkValidMove(maze, x, y, [1, 0])) {
      return [1, 0];
    }
    if (Random.Int$int(2) === 0 && Maze.checkValidMove(maze, x, y, [0, 1])) {
      return [0, 1];
    }
    if (Maze.checkValidMove(maze, x, y, [-1, 0])) {
      return [-1, 0];
    }
    return null;
  }
  static checkValidMove(maze: boolean[][], x: number, y: number, mov: number[]): boolean {
    let sideX = (1 - Math.abs(mov[0])) | 0;
    let sideY = (1 - Math.abs(mov[1])) | 0;
    x = (x + mov[0]) | 0;
    y = (y + mov[1]) | 0;
    if (x <= 0 || x >= ((maze.length - 1) | 0) || y <= 0 || y >= ((maze[0].length - 1) | 0)) {
      return false;
    } else if (maze[x][y] || (maze[(x + sideX) | 0])[(y + sideY) | 0] || (maze[(x - sideX) | 0])[(y - sideY) | 0]) {
      return false;
    }
    x = (x + mov[0]) | 0;
    y = (y + mov[1]) | 0;
    if (x <= 0 || x >= ((maze.length - 1) | 0) || y <= 0 || y >= ((maze[0].length - 1) | 0)) {
      return false;
    } else if (maze[x][y]) {
      return false;
    } else if (!Maze.allowDiagonals && ((maze[(x + sideX) | 0])[(y + sideY) | 0] || (maze[(x - sideX) | 0])[(y - sideY) | 0])) {
      return false;
    }
    return true;
  }
  static $clinit() {
    Maze.EMPTY = false;
    Maze.FILLED = true;
    Maze.allowDiagonals = false;
  }
}

$J.define(Maze, 'com.shatteredpixel.shatteredpixeldungeon.levels.features.Maze', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Maze' }, meths: { 'generate(boolean[][])': 'generate$booleanArrArr', 'generate(int,int)': 'generate$int$int', 'generate(com.watabou.utils.Rect,int[],int,int)': 'generate$Rect$intArr$int$int', 'generate(com.watabou.utils.Rect)': 'generate$Rect', 'generate(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room)': 'generate$Room' }, clinit: true, lazy: ['EMPTY', 'FILLED', 'allowDiagonals'] });
$J.module(() => {
  Random = $J.load('com.watabou.utils.Random');
});
