// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/ShockingBrew.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { Brew } from './Brew.ts';
import { Recipe$SimpleRecipe } from '../../Recipe.ts';

let Assets$Sounds, Dungeon, Blob, Electricity, PotionOfParalyticGas, GameScene, ItemSpriteSheet, Sample, BArray, PathFinder;

export class ShockingBrew extends Brew {
  _ShockingBrew(): this {
    this._Brew();
    this.image_ = ItemSpriteSheet.BREW_SHOCKING;
    return this;
  }
  shatter(cell: number): void {
    this.splash(cell);
    if (Dungeon.level.heroFOV[cell]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), 3);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        GameScene.add$Blob(Blob.seed$int$int$Class(i, 20, $J.cls(Electricity)));
      }
    }
  }
}

export class ShockingBrew$Recipe extends Recipe$SimpleRecipe {
  _ShockingBrew$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfParalyticGas)];
    this.inQuantity = [1];
    this.cost_ = 10;
    this.output = $J.cls(ShockingBrew);
    this.outQuantity = 1;
    return this;
  }
}

$J.define(ShockingBrew, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.ShockingBrew', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.Brew', ctors: { '': '_ShockingBrew' } });
$J.define(ShockingBrew$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.ShockingBrew$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_ShockingBrew$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  PotionOfParalyticGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfParalyticGas');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
