// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/remains/BowFragment.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { RemainsItem } from './RemainsItem.ts';

let Assets$Sounds, Dungeon, CellEmitter, LeafParticle, Level, Terrain, GameScene, ItemSpriteSheet, Sample, PathFinder, Random;

export class BowFragment extends RemainsItem {
  _BowFragment(): this {
    this._RemainsItem();
    this.image_ = ItemSpriteSheet.BOW_FRAGMENT;
    return this;
  }
  doEffect(hero: Hero): void {
    let grassCells = new ArrayList();
    for (let i of PathFinder.NEIGHBOURS9) {
      grassCells.add((hero.pos + i) | 0);
    }
    Random.shuffle$List(grassCells);
    for (const $it0 = grassCells.iterator(); $it0.hasNext(); ) {
      let grassCell = $it0.next();
      if (Dungeon.level.map_[grassCell] === Terrain.EMPTY || Dungeon.level.map_[grassCell] === Terrain.EMBERS || Dungeon.level.map_[grassCell] === Terrain.EMPTY_DECO) {
        Level.set$int$int(grassCell, Terrain.GRASS);
        GameScene.updateMap$int(grassCell);
      }
      CellEmitter.get(grassCell).burst(LeafParticle.LEVEL_SPECIFIC, 4);
    }
    let totalGrassCells = 5;
    while (grassCells.size() > totalGrassCells) {
      grassCells.removeAt(0);
    }
    for (const $it1 = grassCells.iterator(); $it1.hasNext(); ) {
      let grassCell = $it1.next();
      let t = Dungeon.level.map_[grassCell];
      if ((t === Terrain.EMPTY || t === Terrain.EMPTY_DECO || t === Terrain.EMBERS || t === Terrain.GRASS || t === Terrain.FURROWED_GRASS) && Dungeon.level.plants.get(grassCell) == null) {
        Level.set$int$int(grassCell, Terrain.HIGH_GRASS);
        GameScene.updateMap$int(grassCell);
      }
    }
    Dungeon.observe$();
    Sample.INSTANCE.play$Object(Assets$Sounds.PLANT);
  }
}

$J.define(BowFragment, 'com.shatteredpixel.shatteredpixeldungeon.items.remains.BowFragment', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.remains.RemainsItem', ctors: { '': '_BowFragment' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
