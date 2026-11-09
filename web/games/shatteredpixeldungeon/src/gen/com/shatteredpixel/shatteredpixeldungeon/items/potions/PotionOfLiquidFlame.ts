// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfLiquidFlame.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Potion } from './Potion.ts';

let Assets$Sounds, Dungeon, Blob, Fire, GameScene, ItemSpriteSheet$Icons, Sample, PathFinder;

export class PotionOfLiquidFlame extends Potion {
  _PotionOfLiquidFlame(): this {
    this._Potion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_LIQFLAME;
    return this;
  }
  shatter(cell: number): void {
    this.splash(cell);
    if (Dungeon.level.heroFOV[cell]) {
      this.identify$();
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    }
    for (let offset of PathFinder.NEIGHBOURS9) {
      if (!(Dungeon.level.solid[(cell + offset) | 0])) {
        GameScene.add$Blob(Blob.seed$int$int$Class((cell + offset) | 0, 2, $J.cls(Fire)));
      }
    }
  }
  value(): number {
    return this.isKnown() ? Math.imul(30, this.quantity) : super.value();
  }
}

$J.define(PotionOfLiquidFlame, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion', ctors: { '': '_PotionOfLiquidFlame' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
