// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/PlatformRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { StandardRoom } from './StandardRoom.ts';

let Terrain, Painter, Room$Door$Type, ChasmRoom, Random, Rect;

export class PlatformRoom extends StandardRoom {
  _PlatformRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 6);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 6);
  }
  sizeCatProbs(): number[] {
    return [6, 3, 1];
  }
  merge(l: Level, other: Room, merge: Rect, mergeTerrain: number): void {
    if (mergeTerrain !== Terrain.CHASM && this.connected_.containsKey(other) && (other instanceof PlatformRoom || other instanceof ChasmRoom)) {
      super.merge(l, other, merge, Terrain.CHASM);
      Painter.set$Level$Point$int(l, this.connected_.get(other), Terrain.EMPTY_SP);
    } else {
      super.merge(l, other, merge, mergeTerrain);
    }
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.CHASM);
    let platforms = new ArrayList();
    this.splitPlatforms(new Rect()._Rect$int$int$int$int((this.left_ + 2) | 0, (this.top_ + 2) | 0, (this.right_ - 2) | 0, (this.bottom_ - 2) | 0), platforms);
    for (const $it0 = platforms.iterator(); $it0.hasNext(); ) {
      let platform = $it0.next();
      Painter.fill$Level$int$int$int$int$int(level, platform.left_, platform.top_, (platform.width() + 1) | 0, (platform.height() + 1) | 0, Terrain.EMPTY_SP);
    }
    for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
      let door = $it1.next();
      door.set$Type(Room$Door$Type.REGULAR);
      Painter.drawInside(level, this, door, 2, Terrain.EMPTY_SP);
    }
  }
  splitPlatforms(curPlatform: Rect, allPlatforms: ArrayList<Rect>): void {
    let curArea = Math.imul(((curPlatform.width() + 1) | 0), ((curPlatform.height() + 1) | 0));
    if (Random.Float$() < Math.fround(((curArea - 25) | 0) / 11)) {
      if (curPlatform.width() > curPlatform.height() || (curPlatform.width() === curPlatform.height() && Random.Int$int(2) === 0)) {
        let splitX = Random.IntRange((curPlatform.left_ + 2) | 0, (curPlatform.right_ - 2) | 0);
        this.splitPlatforms(new Rect()._Rect$int$int$int$int(curPlatform.left_, curPlatform.top_, (splitX - 1) | 0, curPlatform.bottom_), allPlatforms);
        this.splitPlatforms(new Rect()._Rect$int$int$int$int((splitX + 1) | 0, curPlatform.top_, curPlatform.right_, curPlatform.bottom_), allPlatforms);
        let bridgeY = Random.NormalIntRange(curPlatform.top_, curPlatform.bottom_);
        allPlatforms.add(new Rect()._Rect$int$int$int$int((splitX - 1) | 0, bridgeY, (splitX + 1) | 0, bridgeY));
      } else {
        let splitY = Random.IntRange((curPlatform.top_ + 2) | 0, (curPlatform.bottom_ - 2) | 0);
        this.splitPlatforms(new Rect()._Rect$int$int$int$int(curPlatform.left_, curPlatform.top_, curPlatform.right_, (splitY - 1) | 0), allPlatforms);
        this.splitPlatforms(new Rect()._Rect$int$int$int$int(curPlatform.left_, (splitY + 1) | 0, curPlatform.right_, curPlatform.bottom_), allPlatforms);
        let bridgeX = Random.NormalIntRange(curPlatform.left_, curPlatform.right_);
        allPlatforms.add(new Rect()._Rect$int$int$int$int(bridgeX, (splitY - 1) | 0, bridgeX, (splitY + 1) | 0));
      }
    } else {
      allPlatforms.add(curPlatform);
    }
  }
}

$J.define(PlatformRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PlatformRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_PlatformRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  ChasmRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.ChasmRoom');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
