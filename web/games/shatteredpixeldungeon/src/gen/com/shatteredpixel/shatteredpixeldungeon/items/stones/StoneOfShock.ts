// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfShock.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Runestone } from './Runestone.ts';

let Assets$Sounds, Dungeon, Actor, Buff, Paralysis, CellEmitter, Lightning, Lightning$Arc, EnergyParticle, SparkParticle, Item, ItemSpriteSheet, Sample, BArray, PathFinder;

export class StoneOfShock extends Runestone {
  _StoneOfShock(): this {
    this._Runestone();
    this.image_ = ItemSpriteSheet.STONE_SHOCK;
    return this;
  }
  activate(cell: number): void {
    Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    let arcs = new ArrayList();
    let hits = 0;
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), 2);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        let n = Actor.findChar(i);
        if (n != null) {
          arcs.add(new Lightning$Arc()._Lightning$Arc$int$PointF(cell, n.sprite_.center$()));
          Buff.prolong(n, $J.cls(Paralysis), 1);
          hits++;
        }
      }
    }
    CellEmitter.center(cell).burst(SparkParticle.FACTORY, 3);
    if (hits > 0) {
      Item.curUser.sprite_.parent.addToFront(new Lightning()._Lightning$List$Callback(arcs, null));
      Item.curUser.sprite_.centerEmitter().burst(EnergyParticle.FACTORY, 10);
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
      Item.curUser.belongings.charge(Math.fround(1 + hits));
    }
  }
}

$J.define(StoneOfShock, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfShock', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone', ctors: { '': '_StoneOfShock' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  Lightning$Arc = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning$Arc');
  EnergyParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.EnergyParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
