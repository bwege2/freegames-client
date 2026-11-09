// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/FungalSpinner.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Spinner } from './Spinner.ts';

let Dungeon, Blob, Regrowth, Terrain, GameScene, FungalSpinnerSprite, PathFinder;

export class FungalSpinner extends Spinner {
  _FungalSpinner(): this {
    this._Spinner();
    this.spriteClass = $J.cls(FungalSpinnerSprite);
    this.HP = this.HT = 40;
    this.defenseSkill_ = 16;
    this.EXP = 7;
    this.maxLvl = -2;
    this.immunities_.add($J.cls(Regrowth));
    return this;
  }
  applyWebToCell(cell: number): void {
    GameScene.add$Blob(Blob.seed$int$int$Class(cell, 40, $J.cls(Regrowth)));
  }
  damage(dmg: number, src: any): void {
    let grassCells = 0;
    for (let i of PathFinder.NEIGHBOURS9) {
      if ((Dungeon.level.map_[(this.pos + i) | 0]) === Terrain.FURROWED_GRASS || (Dungeon.level.map_[(this.pos + i) | 0]) === Terrain.HIGH_GRASS) {
        grassCells++;
      }
    }
    if (grassCells > 0) {
      dmg = $J.roundf(Math.fround(Math.imul(dmg, ((8 - grassCells) | 0)) / 10));
    }
    super.damage(dmg, src);
  }
  attackProc(enemy: Char, damage: number): number {
    return damage;
  }
}

$J.define(FungalSpinner, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FungalSpinner', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Spinner', ctors: { '': '_FungalSpinner' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Regrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Regrowth');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  FungalSpinnerSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FungalSpinnerSprite');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
