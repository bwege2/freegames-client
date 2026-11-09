// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/CausticBrew.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Buff, Ooze, Splash, PotionOfToxicGas, GooBlob, Catalog, ItemSpriteSheet, Sample, BArray, PathFinder;

export class CausticBrew extends Brew {
  _CausticBrew(): this {
    this._Brew();
    this.image_ = ItemSpriteSheet.BREW_CAUSTIC;
    return this;
  }
  shatter(cell: number): void {
    this.splash(cell);
    if (Dungeon.level.heroFOV[cell]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), 3);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        Splash.at$int$int$int(i, 0, 5);
        let ch = Actor.findChar(i);
        if (ch != null) {
          Buff.affect$Char$Class(ch, $J.cls(Ooze)).set(Ooze.DURATION);
        }
      }
    }
  }
}

export class CausticBrew$Recipe extends Recipe$SimpleRecipe {
  _CausticBrew$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfToxicGas), $J.cls(GooBlob)];
    this.inQuantity = [1, 1];
    this.cost_ = 1;
    this.output = $J.cls(CausticBrew);
    this.outQuantity = 1;
    return this;
  }
  brew(ingredients: ArrayList<Item>): Item {
    Catalog.countUse($J.cls(GooBlob));
    return super.brew(ingredients);
  }
}

$J.define(CausticBrew, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.CausticBrew', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.Brew', ctors: { '': '_CausticBrew' } });
$J.define(CausticBrew$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.CausticBrew$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_CausticBrew$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  PotionOfToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfToxicGas');
  GooBlob = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.GooBlob');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
