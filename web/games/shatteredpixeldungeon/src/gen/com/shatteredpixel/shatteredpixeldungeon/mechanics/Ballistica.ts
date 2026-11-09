// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/mechanics/Ballistica.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, JObject } from '../../../../../jre/index.ts';

let Dungeon, Actor, Game;

export class Ballistica extends JObject {
  path: ArrayList<number> = null;
  sourcePos: number = null;
  collisionPos: number = null;
  collisionProperties_: number = null;
  dist: number = null;
  static readonly STOP_TARGET: number = 1;
  static readonly STOP_CHARS: number = 2;
  static readonly STOP_SOLID: number = 4;
  static readonly IGNORE_SOFT_SOLID: number = 8;
  static readonly PROJECTILE: number = 7;
  static readonly MAGIC_BOLT: number = 6;
  static readonly WONT_STOP: number = 0;
  _Ballistica(from: number, to: number, params: number): this {
    this.path = new ArrayList();
    this.sourcePos = null;
    this.collisionPos = null;
    this.collisionProperties_ = null;
    this.dist = 0;
    this.sourcePos = from;
    this.collisionProperties_ = params;
    this.build(from, to, (params & Ballistica.STOP_TARGET) > 0, (params & Ballistica.STOP_CHARS) > 0, (params & Ballistica.STOP_SOLID) > 0, (params & Ballistica.IGNORE_SOFT_SOLID) > 0);
    if (this.collisionPos != null) {
      this.dist = this.path.indexOf(this.collisionPos);
    } else if (!this.path.isEmpty()) {
      this.collisionPos = this.path.get(this.dist = (this.path.size() - 1) | 0);
    } else {
      this.path.add(from);
      this.collisionPos = from;
      this.dist = 0;
    }
    return this;
  }
  build(from: number, to: number, stopTarget: boolean, stopChars: boolean, stopTerrain: boolean, ignoreSoftSolid: boolean): void {
    let w = Dungeon.level.width();
    let x0 = from % w;
    let x1 = to % w;
    let y0 = $J.idiv(from, w);
    let y1 = $J.idiv(to, w);
    let dx = (x1 - x0) | 0;
    let dy = (y1 - y0) | 0;
    let stepX = dx > 0 ? +1 : -1;
    let stepY = dy > 0 ? +1 : -1;
    dx = Math.abs(dx);
    dy = Math.abs(dy);
    let stepA: number;
    let stepB: number;
    let dA: number;
    let dB: number;
    if (dx > dy) {
      stepA = stepX;
      stepB = Math.imul(stepY, w);
      dA = dx;
      dB = dy;
    } else {
      stepA = Math.imul(stepY, w);
      stepB = stepX;
      dA = dy;
      dB = dx;
    }
    let cell = from;
    let err = $J.idiv(dA, 2);
    while (Dungeon.level.insideMap(cell)) {
      if (this.collisionPos == null && stopTerrain && cell !== this.sourcePos && !Dungeon.level.passable[cell] && !Dungeon.level.avoid[cell] && Actor.findChar(cell) == null) {
        this.collide(this.path.get((this.path.size() - 1) | 0));
      }
      this.path.add(cell);
      if (this.collisionPos == null && stopTerrain && cell !== this.sourcePos && Dungeon.level.solid[cell]) {
        if (ignoreSoftSolid && (Dungeon.level.passable[cell] || Dungeon.level.avoid[cell])) {
        } else {
          this.collide(cell);
        }
      }
      if (this.collisionPos == null && cell !== this.sourcePos && stopChars && Actor.findChar(cell) != null) {
        this.collide(cell);
      }
      if (this.collisionPos == null && cell === to && stopTarget) {
        this.collide(cell);
      }
      cell = (cell + stepA) | 0;
      err = (err + dB) | 0;
      if (err >= dA) {
        err = (err - dA) | 0;
        cell = (cell + stepB) | 0;
      }
    }
  }
  collide(cell: number): void {
    if (this.collisionPos == null) {
      this.collisionPos = cell;
    }
  }
  subPath(start: number, end: number): List<number> {
    try {
      end = Math.min(end, (this.path.size() - 1) | 0);
      return this.path.subList(start, (end + 1) | 0);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        Game.reportException(e);
        return new ArrayList();
      } else {
        throw $e0;
      }
    }
  }
}

$J.define(Ballistica, 'com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int': '_Ballistica' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Game = $J.load('com.watabou.noosa.Game');
});
