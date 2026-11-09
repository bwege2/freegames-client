// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/DeadEndLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Level } from './Level.ts';

let Assets$Environment, Bones, Dungeon, Heap$Type, Terrain, LevelTransition, LevelTransition$Type, Random;

export class DeadEndLevel extends Level {
  static readonly SIZE: number = 5;
  _DeadEndLevel(): this {
    this._Level();
    this.color1 = 5459774;
    this.color2 = 12179041;
    return this;
  }
  tilesTex(): string {
    return Assets$Environment.TILES_CAVES;
  }
  waterTex(): string {
    return Assets$Environment.WATER_HALLS;
  }
  build(): boolean {
    this.setSize(7, 7);
    for (let i = 2; i < DeadEndLevel.SIZE; i++) {
      for (let j = 2; j < DeadEndLevel.SIZE; j++) {
        (this.map_[(Math.imul(i, this.width()) + j) | 0]) = Terrain.EMPTY;
      }
    }
    for (let i = 1; i <= DeadEndLevel.SIZE; i++) {
      (this.map_[(this.width() + i) | 0]) = (this.map_[(Math.imul(this.width(), DeadEndLevel.SIZE) + i) | 0]) = (this.map_[(Math.imul(this.width(), i) + 1) | 0]) = (this.map_[(Math.imul(this.width(), i) + DeadEndLevel.SIZE) | 0]) = Terrain.WATER;
    }
    let entrance = (Math.imul(DeadEndLevel.SIZE, this.width()) + $J.idiv(DeadEndLevel.SIZE, 2) + 1) | 0;
    if (Dungeon.branch === 0) {
      this.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(this, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
    } else {
      this.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type$int$int$Type(this, entrance, LevelTransition$Type.BRANCH_ENTRANCE, Dungeon.depth, 0, LevelTransition$Type.BRANCH_EXIT));
    }
    this.map_[entrance] = Terrain.ENTRANCE;
    return true;
  }
  createMob(): Mob {
    return null;
  }
  createMobs(): void {
  }
  addRespawner(): Actor {
    return null;
  }
  createItems(): void {
    Random.pushGenerator$long(Random.Long$());
    let bonesItems = Bones.get();
    if (bonesItems != null) {
      for (const $it0 = bonesItems.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        (this.drop(i, (this.entrance() - this.width()) | 0)).setHauntedIfCursed().type_ = Heap$Type.REMAINS;
      }
    }
    Random.popGenerator();
  }
  randomRespawnCell(ch: Char): number {
    return (this.entrance() - this.width()) | 0;
  }
}

$J.define(DeadEndLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.DeadEndLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.Level', ctors: { '': '_DeadEndLevel' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Bones = $J.load('com.shatteredpixel.shatteredpixeldungeon.Bones');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Random = $J.load('com.watabou.utils.Random');
});
