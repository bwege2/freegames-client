// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/RegrowthBomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Bomb } from './Bomb.ts';

let Dungeon, Actor, Blob, Regrowth, Splash, Generator, Generator$Category, PotionOfHealing, WandOfRegrowth$Dewcatcher$Seed, WandOfRegrowth$Seedpod$Seed, Terrain, Starflower$Seed, GameScene, ItemSpriteSheet, BArray, PathFinder, Random;

export class RegrowthBomb extends Bomb {
  _RegrowthBomb(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.REGROWTH_BOMB;
    return this;
  }
  explodesDestructively(): boolean {
    return false;
  }
  explosionRange(): number {
    return 3;
  }
  explode(cell: number): void {
    super.explode(cell);
    if (Dungeon.level.heroFOV[cell]) {
      Splash.at$int$int$int(cell, 65280, 30);
    }
    let plantCandidates = new ArrayList();
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), this.explosionRange());
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        let ch = Actor.findChar(i);
        let t = Dungeon.level.map_[i];
        if (ch != null) {
          if (ch.alignment === Dungeon.hero.alignment) {
            PotionOfHealing.cure(ch);
            PotionOfHealing.heal(ch);
          }
        } else if ((t === Terrain.EMPTY || t === Terrain.EMPTY_DECO || t === Terrain.EMBERS || t === Terrain.GRASS || t === Terrain.FURROWED_GRASS || t === Terrain.HIGH_GRASS) && Dungeon.level.plants.get(i) == null) {
          plantCandidates.add(i);
        }
        GameScene.add$Blob(Blob.seed$int$int$Class(i, 10, $J.cls(Regrowth)));
      }
    }
    let plants = Random.chances$floatArr([0, 0, 2, 1]);
    for (let i = 0; i < plants; i++) {
      let plantPos = Random.element$Collection(plantCandidates);
      if (plantPos != null) {
        Dungeon.level.plant(Generator.randomUsingDefaults$Category(Generator$Category.SEED), plantPos);
        plantCandidates.remove(plantPos);
      }
    }
    let plantPos = Random.element$Collection(plantCandidates);
    if (plantPos != null) {
      let plant: Plant$Seed;
      switch (Random.chances$floatArr([0, 6, 3, 1])) {
        case 1:
        default:
          plant = new WandOfRegrowth$Dewcatcher$Seed()._WandOfRegrowth$Dewcatcher$Seed();
          break;
        case 2:
          plant = new WandOfRegrowth$Seedpod$Seed()._WandOfRegrowth$Seedpod$Seed();
          break;
        case 3:
          plant = new Starflower$Seed()._Starflower$Seed();
          break;
      }
      Dungeon.level.plant(plant, plantPos);
    }
  }
  value(): number {
    return Math.imul(this.quantity, ((20 + 30) | 0));
  }
}

$J.define(RegrowthBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.RegrowthBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_RegrowthBomb' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Regrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Regrowth');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  WandOfRegrowth$Dewcatcher$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Dewcatcher$Seed');
  WandOfRegrowth$Seedpod$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Seedpod$Seed');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Starflower$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Starflower$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
