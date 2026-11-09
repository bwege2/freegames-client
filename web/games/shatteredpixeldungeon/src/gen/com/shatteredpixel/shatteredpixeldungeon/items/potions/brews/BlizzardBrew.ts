// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/BlizzardBrew.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Blizzard, Blob, PotionOfFrost, GameScene, ItemSpriteSheet, Sample, PathFinder;

export class BlizzardBrew extends Brew {
  _BlizzardBrew(): this {
    this._Brew();
    this.image_ = ItemSpriteSheet.BREW_BLIZZARD;
    return this;
  }
  shatter(cell: number): void {
    this.splash(cell);
    if (Dungeon.level.heroFOV[cell]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
      Sample.INSTANCE.play$Object(Assets$Sounds.GAS);
    }
    let centerVolume = 120;
    for (let i of PathFinder.NEIGHBOURS8) {
      if (!(Dungeon.level.solid[(cell + i) | 0])) {
        GameScene.add$Blob(Blob.seed$int$int$Class((cell + i) | 0, 120, $J.cls(Blizzard)));
      } else {
        centerVolume = (centerVolume + 120) | 0;
      }
    }
    GameScene.add$Blob(Blob.seed$int$int$Class(cell, centerVolume, $J.cls(Blizzard)));
  }
}

export class BlizzardBrew$Recipe extends Recipe$SimpleRecipe {
  _BlizzardBrew$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfFrost)];
    this.inQuantity = [1];
    this.cost_ = 8;
    this.output = $J.cls(BlizzardBrew);
    this.outQuantity = 1;
    return this;
  }
}

$J.define(BlizzardBrew, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.BlizzardBrew', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.Brew', ctors: { '': '_BlizzardBrew' } });
$J.define(BlizzardBrew$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.BlizzardBrew$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_BlizzardBrew$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blizzard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blizzard');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
